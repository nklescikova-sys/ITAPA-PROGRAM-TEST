/** Bod v súradniciach písmena (pozri GEOMETRY v strokes.ts). */
export interface Pt {
  x: number;
  y: number;
}

/** Jeden ťah = zoznam bodov v poradí, v akom sa má ťahať. Jeden bod = bodka (ťuknutie). */
export type Stroke = Pt[];

export interface Glyph {
  char: string;
  /** šírka písmena v jednotkách (výška riadku je 115) */
  width: number;
  strokes: Stroke[];
}

/** Text, ktorý sa prehrá hlasom. Ak existuje MP3 na ceste `audio`, prehrá sa namiesto syntetického hlasu. */
export interface Say {
  text: string;
  lang?: 'sk' | 'en';
  audio?: string;
}

export type MapPlaceId = 'svet' | 'dunaj' | 'luka' | 'les' | 'dedina' | 'tatry';

export interface Animal {
  id: string;
  /** názov po slovensky */
  name: string;
  /** názov po anglicky */
  nameEn: string;
  /** cesta k obrázku v priečinku public/ */
  image: string;
  /** emoji ako záložný obrázok, ak sa obrázok nenačíta */
  emoji: string;
  /** pastelová farba pozadia karty */
  color: string;
  /** zaujímavosť (číta hlas) */
  fact: string;
  mapPlace: MapPlaceId;
  /** pri zvieratkách zo „Sveta“: odkiaľ pochádza (malý popis na mape) */
  worldPlace?: string;
  /** cesta k zvuku zvieraťa (napr. "audio/zvuky/bobor.mp3"); null = variant „Kto takto robí?“ sa preskočí */
  soundPath: string | null;
  /** písmeno, ktoré sa v názve zvýrazní (napr. "ä" v slove žriebä); predvolene prvé písmeno */
  highlight?: string;
  /** stredný rod (žriebä) – kvôli vete „…sa presťahovalo na tvoju mapu“ */
  neuter?: boolean;
}

export interface ExtraLetter {
  upper: string;
  lower: string;
  animal: Animal;
}

export interface LetterContent {
  /** id v adrese: /#/pismeno/a */
  id: string;
  upper: string;
  lower: string;
  animal: Animal;
  /** doplnkové písmeno s diakritikou (voliteľné) */
  extra?: ExtraLetter;
  /** tip na spoločnú hru pre rodiča */
  parentTip: string;
}

export interface Profile {
  id: string;
  name: string;
  avatar: string;
  progress: Record<string, LetterProgress>;
  lastPlayed?: string;
  /** nálepky, ktoré dieťa už videlo v knižke (nové sa zvýraznia) */
  seenStickers?: string[];
}

export interface LetterProgress {
  completed: boolean;
  completedAt?: string;
  /** koľkokrát sa automaticky prehrala ukážka (dieťa potrebovalo pomoc) */
  autoDemos: number;
  /** dieťa obtiahlo aj doplnkové písmeno (Ä, Č, Ď) */
  extraDone: boolean;
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Settings {
  difficulty: Difficulty;
  leftHanded: boolean;
  /** 0 – 1 */
  volume: number;
  sfx: boolean;
}
