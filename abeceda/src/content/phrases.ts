import type { Animal, LetterContent, Say } from './types';

/**
 * Všetky vety, ktoré aplikácia hovorí. Každá má navrhnutú cestu k MP3 nahrávke
 * (priečinok public/audio). Keď nahrávka existuje, prehrá sa namiesto syntetického hlasu.
 */

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const PHRASES = {
  welcome: { text: 'Ahoj! Vyber si písmenko.', audio: 'audio/sk/vitaj.mp3' },
  great: { text: 'Výborne!', audio: 'audio/sk/vyborne.mp3' },
  tryAgain: { text: 'Skús ešte raz.', audio: 'audio/sk/skus-este-raz.mp3' },
  watch: { text: 'Pozri sa, ako sa to píše.', audio: 'audio/sk/pozri-sa.mp3' },
  chooseProfile: { text: 'Kto sa bude hrať? Ťukni na svoj obrázok.', audio: 'audio/sk/kto-sa-hra.mp3' },
  map: { text: 'Toto je tvoja mapa. Ťukni na zvieratko.', audio: 'audio/sk/mapa.mp3' },
  whoMakesSound: { text: 'Kto takto robí?', audio: 'audio/sk/kto-takto-robi.mp3' },
  tapPicture: { text: 'Ťukni na obrázok:', audio: 'audio/sk/tukni-na-obrazok.mp3' },
  sayItToo: { text: 'Povedz to aj ty:', audio: 'audio/sk/povedz-to-aj-ty.mp3' },
  restTime: { text: 'Dobrá práca! Teraz si môžeš oddýchnuť, alebo si vyber ďalšie písmenko.', audio: 'audio/sk/oddych.mp3' },
  stickerAdded: { text: 'A nálepku máš v knižke!', audio: 'audio/sk/nalepka-v-knizke.mp3' },
  stickerBook: { text: 'Toto je tvoja knižka nálepiek. Ťukni na nálepku.', audio: 'audio/sk/knizka-nalepiek.mp3' },
} satisfies Record<string, Say>;

export const sayName = (a: Animal): Say => ({ text: a.name, audio: `audio/sk/${a.id}.mp3` });
export const sayNameEn = (a: Animal): Say => ({ text: a.nameEn, lang: 'en', audio: `audio/en/${a.id}.mp3` });
export const sayFact = (a: Animal): Say => ({ text: a.fact, audio: `audio/sk/${a.id}-zaujimavost.mp3` });

export const sayIntro = (letter: string, a: Animal): Say => ({
  text: `${letter} ako ${a.name}.`,
  audio: `audio/sk/${a.id}-uvod.mp3`,
});

export const sayTraceUpper = (l: string): Say => ({
  text: `Obtiahni veľké písmeno ${l}.`,
  audio: `audio/sk/obtiahni-velke-${slug(l)}.mp3`,
});
export const sayTraceLower = (l: string): Say => ({
  text: `Teraz malé písmeno ${l}.`,
  audio: `audio/sk/obtiahni-male-${slug(l)}.mp3`,
});

export const sayExtraOffer = (l: LetterContent): Say | null =>
  l.extra
    ? {
        text: `Chceš skúsiť aj ${l.extra.upper} ako ${l.extra.animal.name}?`,
        audio: `audio/sk/${l.extra.animal.id}-ponuka.mp3`,
      }
    : null;

export const sayQuestion = (l: LetterContent): Say => ({
  text: `Ktoré zvieratko začína na ${l.upper}?`,
  audio: `audio/sk/otazka-${l.id}.mp3`,
});

export const sayMoved = (a: Animal): Say => ({
  text: `${cap(a.name)} sa presťahoval${a.neuter ? 'o' : ''} na tvoju mapu!`,
  audio: `audio/sk/${a.id}-mapa.mp3`,
});

/** a → a, č → c-makcen, ä → a-prehlaska … (bezpečný názov súboru) */
export function slug(s: string): string {
  const map: Record<string, string> = { ä: 'a-dve-bodky', č: 'c-makcen', ď: 'd-makcen' };
  const low = s.toLowerCase();
  return map[low] ?? low;
}
