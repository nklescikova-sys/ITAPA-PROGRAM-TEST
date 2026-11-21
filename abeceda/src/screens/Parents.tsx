import { useEffect, useState } from 'react';
import { APP_NAME, LETTERS } from '../content/letters';
import type { Difficulty, Profile } from '../content/types';
import { hasVoice, voicesReady } from '../lib/speech';
import { navigate } from '../lib/router';
import { AVATARS, MAX_PROFILES, newProfile, useStore } from '../lib/store';
import { baseUrl, letterUrl, qrPng, qrSvg } from '../lib/qr';
import { IconBack } from '../components/icons';

type Tab = 'profily' | 'pokrok' | 'nastavenia' | 'tipy' | 'qr';
const TABS: { id: Tab; label: string }[] = [
  { id: 'pokrok', label: 'Pokrok' },
  { id: 'profily', label: 'Profily' },
  { id: 'nastavenia', label: 'Nastavenia' },
  { id: 'tipy', label: 'Tipy na hru' },
  { id: 'qr', label: 'QR kódy' },
];

export function Parents() {
  const { setParentUnlocked } = useStore();
  const [tab, setTab] = useState<Tab>('pokrok');
  const [voice, setVoice] = useState<{ sk: boolean; en: boolean } | null>(null);
  useEffect(() => {
    voicesReady().then(() => setVoice({ sk: hasVoice('sk'), en: hasVoice('en') }));
  }, []);

  return (
    <div className="screen parents">
      <header className="parents-top">
        <button
          type="button"
          className="back-btn"
          onClick={() => {
            setParentUnlocked(false);
            navigate('/');
          }}
        >
          <IconBack /> Späť do hry
        </button>
        <h1>{APP_NAME} – pre rodičov</h1>
      </header>
      {voice && !voice.sk && (
        <div className="warn">
          <strong>Toto zariadenie nemá slovenský hlas.</strong> Pokyny sa namiesto hlasu zobrazia ako text v bubline.
          Slovenský hlas môžete doinštalovať v nastaveniach systému (Android: Nastavenia → Prevod textu na reč; iPhone/iPad:
          Nastavenia → Prístupnosť → Predčítaný obsah → Hlasy; Windows: Nastavenia → Čas a jazyk → Reč).
        </div>
      )}
      {voice && !voice.en && <div className="warn">Toto zariadenie nemá anglický hlas – anglické slová sa zobrazia ako text.</div>}
      <nav className="tabs">
        {TABS.map((t) => (
          <button key={t.id} type="button" className={tab === t.id ? 'on' : ''} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </nav>
      <main className="parents-body">
        {tab === 'profily' && <Profiles />}
        {tab === 'pokrok' && <Progress />}
        {tab === 'nastavenia' && <SettingsPanel />}
        {tab === 'tipy' && <Tips />}
        {tab === 'qr' && <QrCodes />}
      </main>
    </div>
  );
}

function Profiles() {
  const { data, update } = useStore();
  const setProfile = (id: string, patch: Partial<Profile>) =>
    update((d) => ({ ...d, profiles: d.profiles.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));
  return (
    <section>
      <p className="hint">
        Až {MAX_PROFILES} profily. Meno vidíte iba vy, dieťa si nájde svoj obrázok. Pri viacerých profiloch sa pri spustení
        zobrazí výber obrázkov.
      </p>
      {data.profiles.map((p) => (
        <div className="profile-row" key={p.id}>
          <span className="avatar">{p.avatar}</span>
          <input
            value={p.name}
            maxLength={30}
            aria-label="Meno dieťaťa"
            onChange={(e) => setProfile(p.id, { name: e.target.value })}
          />
          <div className="avatar-pick">
            {AVATARS.map((a) => (
              <button
                key={a}
                type="button"
                className={a === p.avatar ? 'on' : ''}
                aria-label={`Obrázok ${a}`}
                onClick={() => setProfile(p.id, { avatar: a })}
              >
                {a}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="danger"
            disabled={data.profiles.length <= 1}
            onClick={() => {
              if (confirm(`Naozaj vymazať profil „${p.name}“ aj s jeho pokrokom?`))
                update((d) => ({ ...d, profiles: d.profiles.filter((x) => x.id !== p.id) }));
            }}
          >
            Vymazať
          </button>
        </div>
      ))}
      <button
        type="button"
        className="primary"
        disabled={data.profiles.length >= MAX_PROFILES}
        onClick={() =>
          update((d) => {
            const used = new Set(d.profiles.map((p) => p.avatar));
            const avatar = AVATARS.find((a) => !used.has(a));
            return { ...d, profiles: [...d.profiles, newProfile(d.profiles.length + 1, avatar)] };
          })
        }
      >
        + Pridať dieťa
      </button>
    </section>
  );
}

const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString('sk-SK', { day: 'numeric', month: 'numeric', year: 'numeric' }) : '—');

function Progress() {
  const { data } = useStore();
  return (
    <section>
      {data.profiles.map((p) => {
        const doneCount = LETTERS.filter((l) => p.progress[l.id]?.completed).length;
        const help = LETTERS.map((l) => ({ l, n: p.progress[l.id]?.autoDemos ?? 0 }))
          .filter((x) => x.n > 0)
          .sort((a, b) => b.n - a.n);
        return (
          <div className="progress-card" key={p.id}>
            <h2>
              <span className="avatar">{p.avatar}</span> {p.name}
            </h2>
            <p>
              Dokončené: <strong>{doneCount} z {LETTERS.length}</strong> · Naposledy hralo: <strong>{fmtDate(p.lastPlayed)}</strong>
            </p>
            <table>
              <thead>
                <tr>
                  <th>Písmeno</th>
                  <th>Hotovo</th>
                  <th>Doplnkové</th>
                  <th>Automatické ukážky</th>
                </tr>
              </thead>
              <tbody>
                {LETTERS.map((l) => {
                  const pr = p.progress[l.id];
                  return (
                    <tr key={l.id}>
                      <td>
                        <strong>{l.upper}</strong> – {l.animal.name}
                      </td>
                      <td>{pr?.completed ? `✔ ${fmtDate(pr.completedAt)}` : '—'}</td>
                      <td>{l.extra ? (pr?.extraDone ? `✔ ${l.extra.upper}` : '—') : ''}</td>
                      <td>{pr?.autoDemos ?? 0}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {help.length > 0 && (
              <p className="hint">
                Najviac pomoci potrebovalo pri: {help.map((h) => `${h.l.upper} (${h.n}×)`).join(', ')}
              </p>
            )}
          </div>
        );
      })}
    </section>
  );
}

function SettingsPanel() {
  const { data, update } = useStore();
  const s = data.settings;
  const set = (patch: Partial<typeof s>) => update((d) => ({ ...d, settings: { ...d.settings, ...patch } }));
  const levels: { id: Difficulty; label: string; desc: string }[] = [
    { id: 'easy', label: 'Ľahká', desc: 'široká zóna (~12 % výšky písmena)' },
    { id: 'medium', label: 'Stredná', desc: '~8 %' },
    { id: 'hard', label: 'Ťažká', desc: 'presné obťahovanie (~5 %)' },
  ];
  return (
    <section className="settings">
      <fieldset>
        <legend>Presnosť obťahovania</legend>
        {levels.map((l) => (
          <label key={l.id} className="radio">
            <input type="radio" name="diff" checked={s.difficulty === l.id} onChange={() => set({ difficulty: l.id })} />
            <span>
              <strong>{l.label}</strong> – {l.desc}
            </span>
          </label>
        ))}
      </fieldset>
      <label className="toggle">
        <input type="checkbox" checked={s.leftHanded} onChange={(e) => set({ leftHanded: e.target.checked })} />
        <span>Režim pre ľavákov (ovládacie tlačidlá vľavo, ukážka ľavou rukou)</span>
      </label>
      <label className="toggle">
        <input type="checkbox" checked={s.sfx} onChange={(e) => set({ sfx: e.target.checked })} />
        <span>Zvukové efekty (jemné tóny pri odmene)</span>
      </label>
      <label className="slider">
        <span>Hlasitosť: {Math.round(s.volume * 100)} %</span>
        <input type="range" min={0} max={1} step={0.1} value={s.volume} onChange={(e) => set({ volume: Number(e.target.value) })} />
      </label>
      <fieldset>
        <legend>Vymazanie pokroku</legend>
        {data.profiles.map((p) => (
          <button
            key={p.id}
            type="button"
            className="danger"
            onClick={() => {
              if (confirm(`Naozaj vymazať celý pokrok profilu „${p.name}“? Toto sa nedá vrátiť.`))
                update((d) => ({
                  ...d,
                  profiles: d.profiles.map((x) => (x.id === p.id ? { ...x, progress: {}, lastPlayed: undefined } : x)),
                }));
            }}
          >
            Vymazať pokrok: {p.avatar} {p.name}
          </button>
        ))}
      </fieldset>
      <p className="hint">Všetky údaje sú uložené iba v tomto zariadení. Aplikácia nič neodosiela.</p>
    </section>
  );
}

function Tips() {
  return (
    <section>
      {LETTERS.map((l) => (
        <div className="tip" key={l.id}>
          <span className="tip-letter">{l.upper}</span>
          <div>
            <strong>{l.animal.name}</strong>
            <p>{l.parentTip}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

function QrCodes() {
  const base = baseUrl();
  const [codes, setCodes] = useState<{ id: string; upper: string; url: string; png: string; svg: string }[]>([]);
  useEffect(() => {
    Promise.all(
      LETTERS.map(async (l) => {
        const url = letterUrl(base, l.id);
        return { id: l.id, upper: l.upper, url, png: await qrPng(url), svg: await qrSvg(url) };
      }),
    ).then(setCodes);
  }, [base]);
  return (
    <section>
      <p className="hint">
        Každý QR kód otvorí priamo dané písmeno. Adresa: <code>{base}</code>
      </p>
      <div className="qr-grid">
        {codes.map((c) => (
          <div className="qr-card" key={c.id}>
            <img src={c.png} alt={`QR kód pre písmeno ${c.upper}`} />
            <strong>{c.upper}</strong>
            <code className="qr-url">{c.url}</code>
            <div className="qr-dl">
              <a href={c.png} download={`qr-${c.id}.png`}>
                PNG
              </a>
              <a href={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(c.svg)}`} download={`qr-${c.id}.svg`}>
                SVG
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
