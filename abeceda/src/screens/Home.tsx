import { useEffect, type CSSProperties } from 'react';
import { APP_NAME, LETTERS } from '../content/letters';
import { PHRASES } from '../content/phrases';
import { speak } from '../lib/speech';
import { unlockAudio } from '../lib/sfx';
import { navigate } from '../lib/router';
import { useStore } from '../lib/store';
import { AnimalPic } from '../components/ui';
import { IconStar, IconSwap } from '../components/icons';
import { ParentGate } from '../components/ParentGate';
import { Guide } from '../components/Guide';
import { Scenery } from '../components/Scenery';

export function Home() {
  const { data, update, active, setActiveId } = useStore();
  useEffect(() => {
    if (!data.welcomed) {
      speak(PHRASES.welcome);
      update((d) => ({ ...d, welcomed: true }));
    }
  }, []); // eslint-disable-line

  return (
    <div className={`screen home ${data.settings.leftHanded ? 'left' : ''}`}>
      <Scenery />
      <header className="home-top">
        {data.profiles.length > 1 && active ? (
          <button type="button" className="avatar-chip" aria-label="Zmeniť dieťa" onClick={() => setActiveId(null)}>
            <span className="avatar">{active.avatar}</span>
            <span className="swap">
              <IconSwap />
            </span>
          </button>
        ) : (
          <span className="spacer" />
        )}
        <h1 className="app-title">{APP_NAME}</h1>
        <ParentGate />
      </header>
      <main className="letter-grid">
        {LETTERS.map((l) => {
          const done = active?.progress[l.id]?.completed;
          return (
            <button
              key={l.id}
              type="button"
              className={`letter-card ${done ? 'done' : ''}`}
              style={{ '--c': l.colors.main, '--s': l.colors.soft, '--d': l.colors.deep } as CSSProperties}
              aria-label={`${l.upper} ako ${l.animal.name}`}
              onClick={() => {
                unlockAudio();
                navigate(`/pismeno/${l.id}`);
              }}
            >
              <span className="card-letter">
                {l.upper}
                <span className="small">{l.lower}</span>
              </span>
              <AnimalPic animal={l.animal} />
              {done && (
                <span className="card-star" aria-label="hotovo">
                  <IconStar />
                </span>
              )}
            </button>
          );
        })}
      </main>
      <footer className="home-bottom">
        <Guide size={110} className="home-guide" />
        <div className="dock">
          <button type="button" className="dock-btn map" aria-label="Mapa" onClick={() => navigate('/mapa')}>
            <span aria-hidden>🗺️</span>
          </button>
          <button type="button" className="dock-btn book" aria-label="Knižka nálepiek" onClick={() => navigate('/nalepky')}>
            <span aria-hidden>📒</span>
          </button>
        </div>
        <span className="home-guide-space" />
      </footer>
    </div>
  );
}
