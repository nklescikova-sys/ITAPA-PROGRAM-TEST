import { useEffect, useState } from 'react';
import type { Animal, LetterContent } from '../content/types';
import { LETTERS } from '../content/letters';
import { PHRASES, sayName, sayNameEn } from '../content/phrases';
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

/** Nálepka: dokončené zvieratko je farebné, nedokončené je prázdne miesto so siluetou. */
function Sticker({ animal, earned, big, tilt }: { animal: Animal; earned: boolean; big?: boolean; tilt: number }) {
  return (
    <button
      type="button"
      className={`sticker ${earned ? 'earned' : 'missing'} ${big ? 'big' : ''}`}
      style={{ ['--tilt' as string]: `${tilt}deg` }}
      aria-label={earned ? animal.name : 'prázdne miesto na nálepku'}
      onClick={() => {
        if (earned) speak(sayName(animal), sayNameEn(animal));
      }}
    >
      <AnimalPic animal={animal} silhouette={!earned} />
    </button>
  );
}

function Page({ letter }: { letter: LetterContent }) {
  const { active } = useStore();
  const p = active?.progress[letter.id];
  return (
    <section className="book-page" aria-label={`Strana ${letter.upper}`}>
      <div className="page-letter" aria-hidden>
        {letter.upper}
        <span>{letter.lower}</span>
      </div>
      <div className="page-stickers">
        <Sticker animal={letter.animal} earned={!!p?.completed} big tilt={-4} />
        {letter.extra && (
          <div className="extra-slot">
            <span className="extra-letter" aria-hidden>
              {letter.extra.upper}
            </span>
            <Sticker animal={letter.extra.animal} earned={!!p?.extraDone} tilt={5} />
          </div>
        )}
      </div>
    </section>
  );
}

export function StickerBook() {
  const { data } = useStore();
  const per = usePerSpread();
  const [spread, setSpread] = useState(0);
  const spreads = Math.ceil(LETTERS.length / per);
  const current = Math.min(spread, spreads - 1);
  const pages = LETTERS.slice(current * per, current * per + per);

  useEffect(() => {
    speak(PHRASES.stickerBook);
    return () => stopSpeaking();
  }, []);

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
        <RoundButton label="Predchádzajúca strana" size="xl" disabled={current === 0} onClick={() => setSpread(current - 1)}>
          <IconBack />
        </RoundButton>
        <div className={`book-spread pages-${pages.length}`} key={current}>
          {pages.map((l) => (
            <Page key={l.id} letter={l} />
          ))}
        </div>
        <RoundButton
          label="Ďalšia strana"
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
