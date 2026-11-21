import { useEffect } from 'react';
import type { Animal } from '../content/types';
import { LETTERS } from '../content/letters';
import { DANUBE, MAP_PLACES, SLOVAKIA_OUTLINE } from '../content/map';
import { PHRASES, sayName, sayNameEn } from '../content/phrases';
import { speak, stopSpeaking } from '../lib/speech';
import { navigate } from '../lib/router';
import { useStore } from '../lib/store';
import { AnimalPic, RoundButton } from '../components/ui';
import { IconHome } from '../components/icons';

interface Slot {
  animal: Animal;
  done: boolean;
}

export function MapScreen() {
  const { active, data } = useStore();
  useEffect(() => {
    speak(PHRASES.map);
    return () => stopSpeaking();
  }, []);

  const slots: Slot[] = [];
  for (const l of LETTERS) {
    const p = active?.progress[l.id];
    slots.push({ animal: l.animal, done: !!p?.completed });
    if (l.extra) slots.push({ animal: l.extra.animal, done: !!p?.extraDone });
  }
  const world = slots.filter((s) => s.animal.mapPlace === 'svet');
  const local = slots.filter((s) => s.animal.mapPlace !== 'svet');

  const token = (s: Slot, style?: React.CSSProperties) => (
    <button
      key={s.animal.id}
      type="button"
      className={`map-token ${s.done ? 'here' : 'empty'}`}
      style={style}
      aria-label={s.done ? s.animal.name : 'prázdne miesto'}
      onClick={() => {
        if (s.done) speak(sayName(s.animal), sayNameEn(s.animal));
      }}
    >
      <AnimalPic animal={s.animal} silhouette={!s.done} />
    </button>
  );

  return (
    <div className={`screen map ${data.settings.leftHanded ? 'left' : ''}`}>
      <header className="topbar">
        <RoundButton label="Domov" onClick={() => navigate('/')}>
          <IconHome />
        </RoundButton>
        <span className="map-title" aria-hidden>🗺️</span>
        <span className="spacer" />
      </header>
      <main className="map-layout">
        <div className="sk-map">
          <svg viewBox="0 0 400 210" aria-label="Mapa Slovenska">
            <path d={SLOVAKIA_OUTLINE} className="sk-land" />
            <path d={DANUBE} className="sk-river" />
            {/* Tatry */}
            <g className="sk-mountains" transform="translate(228 56)">
              <path d="M0 18 L14 0 L28 18 Z" />
              <path d="M18 18 L34 -6 L50 18 Z" />
              <path d="M30 4 L34 -6 L38 4 Z" className="snow" />
            </g>
            {/* les */}
            <g className="sk-forest" transform="translate(160 110)">
              {[0, 14, 28].map((x) => (
                <g key={x} transform={`translate(${x} ${x === 14 ? -6 : 0})`}>
                  <rect x="-1.5" y="8" width="3" height="6" className="trunk" />
                  <path d="M-7 9 L0 -6 L7 9 Z" />
                </g>
              ))}
            </g>
            {/* lúka */}
            <g className="sk-meadow" transform="translate(300 132)">
              {[0, 12, 24, 36].map((x) => (
                <circle key={x} cx={x} cy={(x / 12) % 2 ? 4 : 0} r="3" />
              ))}
            </g>
            {/* dedina */}
            <g className="sk-village" transform="translate(96 136)">
              {[0, 18].map((x) => (
                <g key={x} transform={`translate(${x} 0)`}>
                  <rect x="0" y="6" width="12" height="9" className="wall" />
                  <path d="M-2 7 L6 -1 L14 7 Z" className="roof" />
                </g>
              ))}
            </g>
          </svg>
          {local.map((s) => {
            const place = MAP_PLACES[s.animal.mapPlace as keyof typeof MAP_PLACES];
            const same = local.filter((o) => o.animal.mapPlace === s.animal.mapPlace);
            const idx = same.indexOf(s);
            const dx = (idx - (same.length - 1) / 2) * 34;
            return token(s, { left: `${((place.x + dx) / 400) * 100}%`, top: `${(place.y / 210) * 100}%` });
          })}
        </div>
        <div className="world">
          <span className="globe" aria-label="Svet">🌍</span>
          <div className="world-slots">{world.map((s) => token(s))}</div>
        </div>
      </main>
    </div>
  );
}
