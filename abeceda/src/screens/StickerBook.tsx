import { useEffect, useMemo, useRef, useState } from 'react';
import { PHRASES } from '../content/phrases';
import { STICKERS, STICKER_PAGES, isEarned, type Sticker, type StickerPage } from '../content/stickers';
import { speak, stopSpeaking } from '../lib/speech';
import { navigate } from '../lib/router';
import { useStore } from '../lib/store';
import { AnimalPic, RoundButton } from '../components/ui';
import { IconBack, IconHome, IconMap, IconNext } from '../components/icons';

/** Na šírku dve strany vedľa seba (otvorená knižka), na výšku jedna. */
function usePerSpread(): number {
  const q = '(orientation: landscape) and (min-width: 700px)';
  const [two, setTwo] = useState(() => window.matchMedia(q).matches);
  useEffect(() => {
    const m = window.matchMedia(q);
    const on = () => setTwo(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);
  return two ? 2 : 1;
}

/** Stabilné „náhodné“ natočenie nálepky podľa jej id. */
function tiltOf(id: string): number {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) | 0;
  return ((Math.abs(h) % 11) - 5) * 1.2;
}

/** Ozdoby na pozadí strany podľa témy (len dekorácia). */
const DECOR: Record<StickerPage['theme'], string[]> = {
  meadow: ['☀️', '☁️', '🌼', '🍄', '🌷'],
  ocean: ['🐚', '🫧', '⭐', '🌊', '🫧'],
  sunny: ['🎈', '✨', '🌈', '⭐', '🎈'],
  berry: ['🍓', '✨', '🍒', '🌸', '🍓'],
};

interface SlotProps {
  sticker?: Sticker;
  earned: boolean;
  isNew: boolean;
}

function Slot({ sticker, earned, isNew }: SlotProps) {
  if (!sticker) {
    // voľné miesto pripravené na budúce nálepky
    return (
      <div className="slot empty" aria-hidden>
        <span className="slot-star">★</span>
      </div>
    );
  }
  if (!earned) {
    return (
      <div className="slot waiting" aria-label="prázdne miesto na nálepku">
        <AnimalPic animal={sticker} silhouette />
      </div>
    );
  }
  return (
    <button
      type="button"
      className={`slot sticker ${isNew ? 'is-new' : ''}`}
      style={{ ['--tilt' as string]: `${tiltOf(sticker.id)}deg` }}
      aria-label={sticker.name}
      onClick={() =>
        speak(
          { text: sticker.name, audio: `audio/sk/${sticker.id}.mp3` },
          { text: sticker.nameEn, lang: 'en', audio: `audio/en/${sticker.id}.mp3` },
        )
      }
    >
      <AnimalPic animal={sticker} />
      <span className="shine" aria-hidden />
      {isNew && (
        <span className="sparkle" aria-hidden>
          ✨
        </span>
      )}
    </button>
  );
}

function Page({ page, newIds }: { page: StickerPage; newIds: Set<string> }) {
  const { active } = useStore();
  const items = STICKERS.filter((s) => s.page === page.id);
  const earnedCount = items.filter((s) => isEarned(s, active?.progress)).length;
  const slots = Array.from({ length: Math.max(page.capacity, items.length) }, (_, i) => items[i]);
  return (
    <section className={`book-page page-theme-${page.theme}`} aria-label={page.title}>
      <div className="page-decor" aria-hidden>
        {DECOR[page.theme].map((d, i) => (
          <span key={i} className={`decor decor-${i}`}>
            {d}
          </span>
        ))}
      </div>
      <header className="page-head">
        <span className="page-ribbon">
          <span className="page-icon" aria-hidden>
            {page.icon}
          </span>
          {page.title}
        </span>
        <span className="page-count" aria-label={`${earnedCount} z ${page.capacity} nálepiek`}>
          ★ {earnedCount}/{page.capacity}
        </span>
      </header>
      <div className="slot-grid">
        {slots.map((s, i) => (
          <Slot key={s?.id ?? `empty-${i}`} sticker={s} earned={!!s && isEarned(s, active?.progress)} isNew={!!s && newIds.has(s.id)} />
        ))}
      </div>
    </section>
  );
}

export function StickerBook() {
  const { data, active, update } = useStore();
  const per = usePerSpread();
  const [spread, setSpread] = useState(0);
  const spreads = Math.ceil(STICKER_PAGES.length / per);
  const current = Math.min(spread, spreads - 1);
  const pages = STICKER_PAGES.slice(current * per, current * per + per);

  // nové nálepky (získané od poslednej návštevy knižky) sa zvýraznia
  const earnedIds = useMemo(() => STICKERS.filter((s) => isEarned(s, active?.progress)).map((s) => s.id), [active]);
  const newIds = useRef<Set<string>>(new Set(earnedIds.filter((id) => !(active?.seenStickers ?? []).includes(id))));
  useEffect(() => {
    speak(PHRASES.stickerBook);
    if (active && newIds.current.size) {
      // otvoríme rovno na strane s prvou novou nálepkou
      const first = STICKERS.find((s) => newIds.current.has(s.id));
      const idx = STICKER_PAGES.findIndex((p) => p.id === first?.page);
      if (idx > 0) setSpread(Math.floor(idx / per));
      update((d) => ({
        ...d,
        profiles: d.profiles.map((p) => (p.id === active.id ? { ...p, seenStickers: earnedIds } : p)),
      }));
    }
    return () => stopSpeaking();
  }, []); // eslint-disable-line

  return (
    <div className={`screen book ${data.settings.leftHanded ? 'left' : ''}`}>
      <header className="topbar">
        <RoundButton label="Domov" onClick={() => navigate('/')}>
          <IconHome />
        </RoundButton>
        <span className="map-title" aria-hidden>📒</span>
        <RoundButton label="Mapa" onClick={() => navigate('/mapa')}>
          <IconMap />
        </RoundButton>
      </header>
      <main className="book-layout">
        <RoundButton label="Predchádzajúca strana" variant="sun" size="xl" disabled={current === 0} onClick={() => setSpread(current - 1)}>
          <IconBack />
        </RoundButton>
        <div className={`book-cover pages-${pages.length}`}>
          <div className="book-spread" key={current}>
            {pages.map((p) => (
              <Page key={p.id} page={p} newIds={newIds.current} />
            ))}
            {pages.length === 2 && (
              <div className="spiral" aria-hidden>
                {Array.from({ length: 9 }, (_, i) => (
                  <span key={i} />
                ))}
              </div>
            )}
          </div>
        </div>
        <RoundButton
          label="Ďalšia strana"
          variant="sun"
          size="xl"
          disabled={current >= spreads - 1}
          onClick={() => setSpread(current + 1)}
        >
          <IconNext />
        </RoundButton>
      </main>
      <div className="book-dots" aria-hidden>
        {Array.from({ length: spreads }, (_, i) => (
          <span key={i} className={i === current ? 'on' : ''} />
        ))}
      </div>
    </div>
  );
}
