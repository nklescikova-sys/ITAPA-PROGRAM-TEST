import { useEffect } from 'react';
import type { Animal } from '../content/types';
import { LETTERS } from '../content/letters';
import { CITIES, MAP_PLACES, RIVER_DANUBE, RIVER_MORAVA, SLOVAKIA_OUTLINE, placeXY } from '../content/map';
import { project } from '../content/map-projection';
import { PHRASES, sayName, sayNameEn } from '../content/phrases';
import { speak, stopSpeaking } from '../lib/speech';
import { navigate } from '../lib/router';
import { useStore } from '../lib/store';
import { AnimalPic, RoundButton } from '../components/ui';
import { IconBook, IconHome } from '../components/icons';
import { Scenery } from '../components/Scenery';
import { Guide } from '../components/Guide';

/** posun popisu miesta pod ikonu (aby ho nezakrylo zvieratko) */
const LABEL_DY = { tatry: -14, les: 40, dedina: 41, luka: 35, dunaj: 25 } as const;

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
      <Scenery />
      <header className="topbar">
        <RoundButton label="Domov" variant="home" onClick={() => navigate('/')}>
          <IconHome />
        </RoundButton>
        <span className="screen-badge map" aria-hidden>
          🗺️
        </span>
        <div className="topbar-right">
          <Guide size={64} className="guide-top" />
          <RoundButton label="Knižka nálepiek" variant="sun" onClick={() => navigate('/nalepky')}>
            <IconBook />
          </RoundButton>
        </div>
      </header>
      <main className="map-layout">
        <div className="sk-map">
          <svg viewBox="0 0 400 210" aria-label="Mapa Slovenska">
            <path d={SLOVAKIA_OUTLINE} className="sk-land" />
            {/* tieňovaný reliéf (scripts/relief-build.py) */}
            <image href={`${import.meta.env.BASE_URL}images/mapa-reliefu.webp`} x={0} y={0} width={400} height={210} />
            <path d={SLOVAKIA_OUTLINE} className="sk-border" />
            <path d={RIVER_DANUBE} className="sk-river" />
            <path d={RIVER_MORAVA} className="sk-river thin" />
            {CITIES.map((c) => {
              const [x, y] = project(c.lon, c.lat);
              return (
                <g key={c.name} className="sk-city">
                  <circle cx={x} cy={y} r={2.6} />
                  <text x={x + 5} y={y + 1} dominantBaseline="middle">{c.name}</text>
                </g>
              );
            })}
            {/* les – Poľana */}
            <g className="sk-forest" transform={`translate(${placeXY('les')[0] - 14} ${placeXY('les')[1] + 16})`}>
              {[0, 14, 28].map((x) => (
                <g key={x} transform={`translate(${x} ${x === 14 ? -5 : 0})`}>
                  <rect x="-1.5" y="8" width="3" height="5" className="trunk" />
                  <path d="M-7 9 L0 -6 L7 9 Z" />
                </g>
              ))}
            </g>
            {/* lúka – Biele Karpaty */}
            <g className="sk-meadow" transform={`translate(${placeXY('luka')[0] - 22} ${placeXY('luka')[1] + 22})`}>
              {[0, 11, 22, 33, 44].map((x) => (
                <circle key={x} cx={x} cy={(x / 11) % 2 ? 4 : 0} r="2.6" />
              ))}
            </g>
            {/* dedina – Topoľčianky */}
            <g className="sk-village" transform={`translate(${placeXY('dedina')[0] - 14} ${placeXY('dedina')[1] + 18})`}>
              {[0, 16].map((x) => (
                <g key={x} transform={`translate(${x} 0)`}>
                  <rect x="0" y="6" width="11" height="8" className="wall" />
                  <path d="M-2 7 L5.5 -1 L13 7 Z" className="roof" />
                </g>
              ))}
            </g>
            {/* názvy miest (pre rodiča) */}
            {(Object.keys(MAP_PLACES) as (keyof typeof MAP_PLACES)[]).map((id) => {
              const [x, y] = placeXY(id);
              return (
                <text key={id} className="sk-label" x={x} y={y + LABEL_DY[id]} textAnchor="middle">
                  {MAP_PLACES[id].name}
                </text>
              );
            })}
          </svg>
          {local.map((s) => {
            const [px, py] = placeXY(s.animal.mapPlace as keyof typeof MAP_PLACES);
            const same = local.filter((o) => o.animal.mapPlace === s.animal.mapPlace);
            const idx = same.indexOf(s);
            const dx = (idx - (same.length - 1) / 2) * 30;
            return token(s, { left: `${((px + dx) / 400) * 100}%`, top: `${(py / 210) * 100}%` });
          })}
        </div>
        <div className="world">
          <span className="globe" aria-label="Svet">🌍</span>
          <div className="world-slots">
            {world.map((s) => (
              <div className="world-slot" key={s.animal.id}>
                {token(s)}
                {s.animal.worldPlace && <span className="world-label">{s.animal.worldPlace}</span>}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
