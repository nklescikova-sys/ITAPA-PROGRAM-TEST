/** Jemné zvukové efekty generované priamo v prehliadači (žiadne súbory). */
let ctx: AudioContext | null = null;
let enabled = true;
let volume = 1;

export function configureSfx(on: boolean, vol: number) {
  enabled = on;
  volume = vol;
}

function getCtx(): AudioContext | null {
  try {
    if (!ctx) ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** Odomkne zvuk po prvom ťuknutí (iOS/Chrome). */
export function unlockAudio() {
  getCtx();
}

function tone(freq: number, start: number, dur: number, gain: number) {
  const c = getCtx();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = 'sine';
  o.frequency.value = freq;
  const t = c.currentTime + start;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain * volume, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
}

/** Pokojná odmena – dva jemné tóny. */
export function chime() {
  if (!enabled) return;
  tone(660, 0, 0.5, 0.15);
  tone(880, 0.12, 0.6, 0.12);
}

/** Tichý zvuk dokončeného ťahu. */
export function pop() {
  if (!enabled) return;
  tone(520, 0, 0.18, 0.08);
}
