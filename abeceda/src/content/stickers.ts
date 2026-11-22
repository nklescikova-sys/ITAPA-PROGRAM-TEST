import type { Animal, LetterProgress } from './types';
import { LETTERS } from './letters';

/**
 * KNIŽKA NÁLEPIEK – obsah oddelený od kódu.
 *
 * Nálepka nemusí byť zvieratko: môže to byť farba, číslo, ovocie… Stačí obrázok,
 * názov SK/EN a podmienka, kedy ju dieťa získa (`unlock`).
 * Strany majú pevný počet miest (`capacity`), voľné miesta sú pripravené na ďalší obsah.
 */

export interface StickerPage {
  id: string;
  /** nadpis strany (pre rodiča; dieťa sa riadi ikonou a farbou) */
  title: string;
  icon: string;
  /** vzhľad strany – pozri .page-theme-* v styles.css */
  theme: 'meadow' | 'ocean' | 'sunny' | 'berry';
  capacity: number;
}

/** Kedy dieťa nálepku získa. Ďalšie typy (napr. dokončená hra) sa doplnia sem. */
export type Unlock = { type: 'letter'; letterId: string; part: 'main' | 'extra' };

export interface Sticker {
  id: string;
  page: string;
  name: string;
  nameEn: string;
  image: string;
  emoji: string;
  color: string;
  unlock: Unlock;
}

export const STICKER_PAGES: StickerPage[] = [
  { id: 'slovensko', title: 'Zvieratká zo Slovenska', icon: '🌳', theme: 'meadow', capacity: 12 },
  { id: 'svet', title: 'Zvieratká zo sveta', icon: '🌍', theme: 'ocean', capacity: 12 },
  // pripravené pre ďalšie témy (napr. farby, čísla, ovocie) – zatiaľ prázdne miesta
  { id: 'dalsie', title: 'Ďalšie nálepky', icon: '⭐', theme: 'sunny', capacity: 12 },
];

const fromAnimal = (a: Animal, letterId: string, part: 'main' | 'extra'): Sticker => ({
  id: a.id,
  page: a.mapPlace === 'svet' ? 'svet' : 'slovensko',
  name: a.name,
  nameEn: a.nameEn,
  image: a.image,
  emoji: a.emoji,
  color: a.color,
  unlock: { type: 'letter', letterId, part },
});

/** Nálepky zvieratiek sa vytvoria automaticky z písmen (letters.ts). */
const ANIMAL_STICKERS: Sticker[] = LETTERS.flatMap((l) => [
  fromAnimal(l.animal, l.id, 'main'),
  ...(l.extra ? [fromAnimal(l.extra.animal, l.id, 'extra')] : []),
]);

/** Sem pridávajte nálepky, ktoré nie sú zvieratká (napr. { id: 'cervena', page: 'dalsie', … }). */
const OTHER_STICKERS: Sticker[] = [];

export const STICKERS: Sticker[] = [...ANIMAL_STICKERS, ...OTHER_STICKERS];

export function isEarned(s: Sticker, progress: Record<string, LetterProgress> | undefined): boolean {
  const p = progress?.[s.unlock.letterId];
  if (s.unlock.type === 'letter') return s.unlock.part === 'main' ? !!p?.completed : !!p?.extraDone;
  return false;
}
