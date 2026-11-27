import { useEffect, useState, type ReactNode } from 'react';
import type { Animal } from '../content/types';
import { onBubble } from '../lib/speech';
import { unlockAudio } from '../lib/sfx';

const BASE = import.meta.env.BASE_URL;

interface RoundButtonProps {
  onClick: () => void;
  label: string; // pre čítačky obrazovky a rodiča (dieťa nemusí čítať)
  children: ReactNode;
  variant?: 'primary' | 'soft' | 'ghost' | 'sun';
  size?: 'l' | 'xl';
  pulse?: boolean;
  disabled?: boolean;
}

export function RoundButton({ onClick, label, children, variant = 'soft', size = 'l', pulse, disabled }: RoundButtonProps) {
  return (
    <button
      type="button"
      className={`round-btn ${variant} ${size} ${pulse ? 'pulse' : ''}`}
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={() => {
        unlockAudio();
        onClick();
      }}
    >
      {children}
    </button>
  );
}

/** Obrázok zvieratka; ak sa nenačíta, ukáže emoji. */
type PicSource = Pick<Animal, 'name' | 'image' | 'emoji' | 'color'>;
export function AnimalPic({ animal, className = '', silhouette = false }: { animal: PicSource; className?: string; silhouette?: boolean }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`animal-pic ${silhouette ? 'silhouette' : ''} ${className}`} style={{ background: silhouette ? '#eee' : animal.color }}>
      {failed || silhouette ? (
        <span className="emoji" aria-hidden>{animal.emoji}</span>
      ) : (
        <img src={BASE + animal.image} alt={animal.name} draggable={false} onError={() => setFailed(true)} />
      )}
    </div>
  );
}

/** Názov zvieratka so zvýrazneným písmenom (napr. ä v slove žriebä). */
export function AnimalName({ animal, letter }: { animal: Animal; letter?: string }) {
  const hl = (animal.highlight ?? letter ?? animal.name[0]).toLowerCase();
  const i = animal.name.toLowerCase().indexOf(hl);
  if (i < 0) return <span>{animal.name}</span>;
  return (
    <span>
      {animal.name.slice(0, i)}
      <span className="hl">{animal.name.slice(i, i + hl.length)}</span>
      {animal.name.slice(i + hl.length)}
    </span>
  );
}

export function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="dots" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={current + 1}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`dot ${i < current ? 'done' : ''} ${i === current ? 'now' : ''}`} />
      ))}
    </div>
  );
}

/** Bublina s textom – zobrazí sa, keď zariadenie nemá hlas pre daný jazyk. */
export function SpeechBubble() {
  const [text, setText] = useState<string | null>(null);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const off = onBubble((t) => {
      clearTimeout(timer);
      setText(t);
      if (t) timer = setTimeout(() => setText(null), Math.min(8000, 2500 + t.length * 70));
    });
    return () => {
      off();
      clearTimeout(timer);
    };
  }, []);
  if (!text) return null;
  return (
    <div className="bubble" role="status">
      <span className="bubble-icon" aria-hidden>💬</span> {text}
    </div>
  );
}
