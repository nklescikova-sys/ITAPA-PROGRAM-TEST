import { useEffect } from 'react';
import { APP_NAME, LETTERS } from '../content/letters';
import { PHRASES } from '../content/phrases';
import { speak } from '../lib/speech';
import { navigate } from '../lib/router';
import { useStore } from '../lib/store';
import { AnimalPic, RoundButton } from '../components/ui';
import { IconMap, IconStar, IconSwap } from '../components/icons';
import { ParentGate } from '../components/ParentGate';

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
      <header className="home-top">
        {data.profiles.length > 1 && active ? (
          <button type="button" className="avatar-chip" aria-label="Zmeniť dieťa" onClick={() => setActiveId(null)}>
            <span className="avatar">{active.avatar}</span>
            <span className="swap"><IconSwap /></span>
          </button>
        ) : (
          <span />
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
              className="letter-card"
              aria-label={`${l.upper} ako ${l.animal.name}`}
              onClick={() => navigate(`/pismeno/${l.id}`)}
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
        <RoundButton label="Mapa" variant="primary" size="xl" onClick={() => navigate('/mapa')}>
          <IconMap />
        </RoundButton>
      </footer>
    </div>
  );
}
