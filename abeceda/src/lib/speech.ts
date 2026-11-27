import type { Say } from '../content/types';

/**
 * Hlas: najprv skúsi MP3 nahrávku (ak je v dátach cesta a súbor existuje),
 * inak Web Speech API. Ak zariadenie nemá hlas pre daný jazyk, text sa ukáže v bubline.
 * Nikdy nevyhodí chybu – aplikácia sa nesmie zaseknúť.
 */

type BubbleListener = (text: string | null) => void;
const listeners = new Set<BubbleListener>();
export function onBubble(fn: BubbleListener) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
function bubble(text: string | null) {
  listeners.forEach((fn) => fn(text));
}

/** Či práve niečo hovorí (sovička vtedy „rozpráva“). */
type SpeakingListener = (speaking: boolean) => void;
const speakingListeners = new Set<SpeakingListener>();
export function onSpeaking(fn: SpeakingListener) {
  speakingListeners.add(fn);
  return () => speakingListeners.delete(fn);
}
function setSpeaking(v: boolean) {
  speakingListeners.forEach((fn) => fn(v));
}

let volume = 1;
export function setVolume(v: number) {
  volume = Math.max(0, Math.min(1, v));
}

const synth: SpeechSynthesis | null =
  typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;

let voices: SpeechSynthesisVoice[] = [];
function loadVoices() {
  if (!synth) return;
  try {
    voices = synth.getVoices();
  } catch {
    voices = [];
  }
}
loadVoices();
synth?.addEventListener?.('voiceschanged', loadVoices);

function pickVoice(lang: 'sk' | 'en'): SpeechSynthesisVoice | null {
  if (!voices.length) loadVoices();
  if (lang === 'sk') return voices.find((v) => v.lang.toLowerCase().replace('_', '-').startsWith('sk')) ?? null;
  const en = voices.filter((v) => v.lang.toLowerCase().startsWith('en'));
  return en.find((v) => /en[-_]gb/i.test(v.lang)) ?? en.find((v) => /en[-_]us/i.test(v.lang)) ?? en[0] ?? null;
}

export function hasVoice(lang: 'sk' | 'en'): boolean {
  return !!synth && !!pickVoice(lang);
}

/** Počká, kým prehliadač načíta zoznam hlasov (Chrome ich načítava asynchrónne). */
export function voicesReady(timeout = 1500): Promise<void> {
  return new Promise((resolve) => {
    if (!synth) return resolve();
    loadVoices();
    if (voices.length) return resolve();
    const t = setTimeout(resolve, timeout);
    synth.addEventListener?.('voiceschanged', () => {
      clearTimeout(t);
      loadVoices();
      resolve();
    });
  });
}

const BASE = import.meta.env.BASE_URL;
const missingAudio = new Set<string>();
let currentAudio: HTMLAudioElement | null = null;
let token = 0;

export function stopSpeaking() {
  token++;
  bubble(null);
  setSpeaking(false);
  try {
    synth?.cancel();
  } catch {
    /* ignore */
  }
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
}

function playFile(path: string, my: number): Promise<boolean> {
  if (missingAudio.has(path)) return Promise.resolve(false);
  return new Promise((resolve) => {
    const audio = new Audio(BASE + path);
    audio.volume = volume;
    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(loadTimer);
      resolve(ok);
    };
    const loadTimer = setTimeout(() => {
      missingAudio.add(path);
      audio.pause();
      finish(false);
    }, 2500);
    audio.addEventListener('playing', () => clearTimeout(loadTimer));
    audio.addEventListener('ended', () => finish(true));
    audio.addEventListener('error', () => {
      missingAudio.add(path);
      finish(false);
    });
    if (my !== token) return finish(true);
    currentAudio = audio;
    audio.play().catch(() => {
      missingAudio.add(path);
      finish(false);
    });
  });
}

function speakSynth(text: string, lang: 'sk' | 'en', my: number): Promise<void> {
  return new Promise((resolve) => {
    const voice = pickVoice(lang);
    if (!synth || !voice) {
      // bez hlasu: ukážeme text v bubline a počkáme primerane dlho
      bubble(text);
      setTimeout(resolve, Math.min(6000, 1200 + text.length * 60));
      return;
    }
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.voice = voice;
      u.lang = voice.lang;
      u.volume = volume;
      u.rate = lang === 'sk' ? 0.9 : 0.85;
      // poistka: niektoré prehliadače nikdy nezavolajú onend
      const guard = setTimeout(resolve, 2000 + text.length * 120);
      u.onend = u.onerror = () => {
        clearTimeout(guard);
        resolve();
      };
      if (my === token) synth.speak(u);
      else resolve();
    } catch {
      bubble(text);
      resolve();
    }
  });
}

/** Povie jednu alebo viac viet za sebou. Predchádzajúce hovorenie preruší. */
export async function speak(...items: Say[]): Promise<void> {
  stopSpeaking();
  const my = token;
  bubble(null);
  setSpeaking(true);
  try {
    await speakAll(items, my);
  } finally {
    if (my === token) setSpeaking(false);
  }
}

async function speakAll(items: Say[], my: number) {
  for (const item of items) {
    if (my !== token) return;
    const lang = item.lang ?? 'sk';
    if (volume === 0) continue;
    if (item.audio && (await playFile(item.audio, my))) continue;
    if (my !== token) return;
    await speakSynth(item.text, lang, my);
  }
}
