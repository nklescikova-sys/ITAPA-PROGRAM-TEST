import type { LetterContent } from './types';

/** Pracovný názov aplikácie – zmeň tu a všade sa prejaví. */
export const APP_NAME = 'Abeceda';

/**
 * Všetok obsah písmen. Nové písmeno (F–Z) pridáš tak, že sem doplníš ďalší objekt
 * a do strokes.ts doplníš definície ťahov pre veľké aj malé písmeno.
 */
export const LETTERS: LetterContent[] = [
  {
    id: 'a',
    upper: 'A',
    lower: 'a',
    animal: {
      id: 'aligator',
      name: 'aligátor',
      nameEn: 'alligator',
      image: 'images/aligator.svg',
      emoji: '🐊',
      color: '#DDF0D0',
      fact: 'Aligátor má v papuli asi osemdesiat zubov. Keď mu nejaký vypadne, narastie mu nový.',
      mapPlace: 'svet',
      worldPlace: 'Amerika',
      soundPath: null,
    },
    extra: {
      upper: 'Ä',
      lower: 'ä',
      animal: {
        id: 'zrieba',
        name: 'žriebä',
        nameEn: 'foal',
        image: 'images/zrieba.svg',
        emoji: '🐴',
        color: '#F6E6D3',
        fact: 'Žriebä sa postaví na nohy už krátko po narodení.',
        mapPlace: 'dedina',
        soundPath: null,
        highlight: 'ä',
        neuter: true,
      },
    },
    parentTip:
      'Spýtajte sa dieťaťa, koľko zubov má ono samo, a spolu ich spočítajte v zrkadle. Hľadajte doma veci, ktoré sa začínajú na A (auto, ananás).',
  },
  {
    id: 'b',
    upper: 'B',
    lower: 'b',
    animal: {
      id: 'bobor',
      name: 'bobor',
      nameEn: 'beaver',
      image: 'images/bobor.svg',
      emoji: '🦫',
      color: '#F3E3D3',
      fact: 'Bobor má oranžové zuby, ktoré mu rastú celý život. Obrusuje si ich tým, že hryzie stromy.',
      mapPlace: 'dunaj',
      soundPath: null,
    },
    parentTip: 'Opýtajte sa dieťaťa, kde žije bobor a čo stavia. Skúste spolu postaviť hrádzu z kociek alebo paličiek.',
  },
  {
    id: 'c',
    upper: 'C',
    lower: 'c',
    animal: {
      id: 'cvrcek',
      name: 'cvrček',
      nameEn: 'cricket',
      image: 'images/cvrcek.svg',
      emoji: '🦗',
      color: '#E6F4D8',
      fact: 'Cvrček cvrliká tak, že si šúcha krídla o seba. A uši má na predných nohách!',
      mapPlace: 'luka',
      soundPath: null,
    },
    extra: {
      upper: 'Č',
      lower: 'č',
      animal: {
        id: 'cmeliak',
        name: 'čmeliak',
        nameEn: 'bumblebee',
        image: 'images/cmeliak.svg',
        emoji: '🐝',
        color: '#FFF3C4',
        fact: 'Čmeliak má chlpaté telíčko, preto mu nie je zima ani v chladnom počasí.',
        mapPlace: 'luka',
        soundPath: null,
      },
    },
    parentTip:
      'Vyjdite večer von a spolu počúvajte, či počuť cvrčky. Skúste napodobniť cvrlikanie trením dlaní o seba.',
  },
  {
    id: 'd',
    upper: 'D',
    lower: 'd',
    animal: {
      id: 'delfin',
      name: 'delfín',
      nameEn: 'dolphin',
      image: 'images/delfin.svg',
      emoji: '🐬',
      color: '#D6ECF7',
      fact: 'Keď delfín spí, odpočíva mu len polovica mozgu. Druhá polovica dáva pozor.',
      mapPlace: 'svet',
      worldPlace: 'more',
      soundPath: null,
    },
    extra: {
      upper: 'Ď',
      lower: 'ď',
      animal: {
        id: 'datel',
        name: 'ďateľ',
        nameEn: 'woodpecker',
        image: 'images/datel.svg',
        emoji: '🐦',
        color: '#F7DCDC',
        fact: 'Ďateľ bubnuje zobákom do stromov a hľadá v kôre chrobáky.',
        mapPlace: 'les',
        soundPath: null,
      },
    },
    parentTip:
      'Opýtajte sa dieťaťa, kde žije delfín a či ste spolu niekedy videli more. Zahrajte sa na delfíny – jedno oko zatvorené, „pol mozgu spí“.',
  },
  {
    id: 'e',
    upper: 'E',
    lower: 'e',
    animal: {
      id: 'emu',
      name: 'emu',
      nameEn: 'emu',
      image: 'images/emu.svg',
      emoji: '🦤',
      color: '#EDE3F3',
      fact: 'Emu nevie lietať, ale veľmi rýchlo behá. Na vajíčkach sedí ocko emu.',
      mapPlace: 'svet',
      worldPlace: 'Austrália',
      soundPath: null,
    },
    parentTip:
      'Porozprávajte sa, kto sa doma o čo stará – tak ako ocko emu sedí na vajíčkach. Skúste spolu „bežať ako emu“ na mieste.',
  },
];

export function findLetter(id: string): LetterContent | undefined {
  return LETTERS.find((l) => l.id === id.toLowerCase());
}
