import type { MapPlaceId } from './types';

/** Miesta na zjednodušenej mape Slovenska (súradnice vo viewBoxe 0 0 400 210). */
export const MAP_PLACES: Record<Exclude<MapPlaceId, 'svet'>, { name: string; x: number; y: number }> = {
  dunaj: { name: 'Dunaj pri Bratislave', x: 62, y: 172 },
  dedina: { name: 'Dedina', x: 112, y: 120 },
  les: { name: 'Les', x: 180, y: 95 },
  tatry: { name: 'Tatry', x: 250, y: 52 },
  luka: { name: 'Lúka', x: 318, y: 112 },
};

/** Zjednodušený, kreslený obrys Slovenska (nie presná geografia). */
export const SLOVAKIA_OUTLINE =
  'M28 160 C18 140 22 115 42 98 C60 82 85 68 112 58 C140 48 160 40 180 26 C196 16 212 28 226 30 C244 22 262 22 280 30 C300 36 322 36 344 42 C364 46 384 50 394 62 C400 80 396 100 388 118 C380 134 360 140 342 138 C322 136 300 140 284 150 C262 160 238 160 214 164 C190 168 166 172 144 182 C122 192 96 194 74 188 C54 182 36 176 28 160 Z';

export const DANUBE = 'M24 158 C40 172 58 182 80 190 C104 198 128 194 150 186';
