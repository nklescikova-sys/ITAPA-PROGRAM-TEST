import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { LetterProgress, Profile, Settings } from '../content/types';
import { setVolume } from './speech';
import { configureSfx } from './sfx';

/** Všetky údaje sa ukladajú iba v tomto zariadení (localStorage). */
const KEY = 'abeceda:v1';
export const MAX_PROFILES = 4;
export const AVATARS = ['🦊', '🐻', '🐰', '🐸', '🐱', '🐼', '🦁', '🐵', '🐯', '🐨', '🐷', '🐮'];

export interface AppData {
  version: 1;
  profiles: Profile[];
  settings: Settings;
  welcomed: boolean;
}

const DEFAULT_SETTINGS: Settings = { difficulty: 'easy', leftHanded: false, volume: 1, sfx: true };

const uid = () => Math.random().toString(36).slice(2, 10);

export function newProfile(n: number, avatar?: string): Profile {
  return { id: uid(), name: `Dieťa ${n}`, avatar: avatar ?? AVATARS[(n - 1) % AVATARS.length], progress: {} };
}

function load(): AppData {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const d = JSON.parse(raw) as AppData;
      if (d.version === 1 && Array.isArray(d.profiles) && d.profiles.length) {
        return { ...d, settings: { ...DEFAULT_SETTINGS, ...d.settings } };
      }
    }
  } catch {
    /* poškodené alebo nedostupné úložisko → začneme odznova */
  }
  return { version: 1, profiles: [newProfile(1)], settings: DEFAULT_SETTINGS, welcomed: false };
}

export const emptyProgress = (): LetterProgress => ({ completed: false, autoDemos: 0, extraDone: false });

interface Store {
  data: AppData;
  update: (fn: (d: AppData) => AppData) => void;
  /** profil, ktorý sa práve hrá (null = treba vybrať) */
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  active: Profile | null;
  updateProgress: (letterId: string, fn: (p: LetterProgress) => LetterProgress) => void;
  parentUnlocked: boolean;
  setParentUnlocked: (v: boolean) => void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(load);
  const [activeId, setActiveId] = useState<string | null>(() => (data.profiles.length === 1 ? data.profiles[0].id : null));
  const [parentUnlocked, setParentUnlocked] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      /* ignore */
    }
    setVolume(data.settings.volume);
    configureSfx(data.settings.sfx, data.settings.volume);
  }, [data]);

  // ak profil zmizol (vymazaný), vyberieme znova
  useEffect(() => {
    if (activeId && !data.profiles.some((p) => p.id === activeId)) {
      setActiveId(data.profiles.length === 1 ? data.profiles[0].id : null);
    }
    if (!activeId && data.profiles.length === 1) setActiveId(data.profiles[0].id);
  }, [data.profiles, activeId]);

  const update = useCallback((fn: (d: AppData) => AppData) => setData((d) => fn(d)), []);

  const updateProgress = useCallback(
    (letterId: string, fn: (p: LetterProgress) => LetterProgress) => {
      setData((d) => ({
        ...d,
        profiles: d.profiles.map((p) =>
          p.id === activeId
            ? {
                ...p,
                lastPlayed: new Date().toISOString(),
                progress: { ...p.progress, [letterId]: fn(p.progress[letterId] ?? emptyProgress()) },
              }
            : p,
        ),
      }));
    },
    [activeId],
  );

  const value = useMemo<Store>(
    () => ({
      data,
      update,
      activeId,
      setActiveId,
      active: data.profiles.find((p) => p.id === activeId) ?? null,
      updateProgress,
      parentUnlocked,
      setParentUnlocked,
    }),
    [data, update, activeId, updateProgress, parentUnlocked],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error('StoreProvider chýba');
  return s;
}
