import { useEffect, useState } from 'react';
import { onSpeaking } from '../lib/speech';

/**
 * Sovička – sprievodkyňa (inšpirované „animal guides“ v Khan Academy Kids).
 * Keď hlas hovorí, sovička „rozpráva“ (pohybuje zobáčikom). Žiadne blikanie.
 */
export function Guide({ mood = 'idle', size = 96, className = '' }: { mood?: 'idle' | 'happy'; size?: number; className?: string }) {
  const [speaking, setSpeaking] = useState(false);
  useEffect(() => {
    const off = onSpeaking(setSpeaking);
    return () => {
      off();
    };
  }, []);
  return (
    <svg
      className={`guide ${speaking ? 'speaking' : ''} ${mood} ${className}`}
      viewBox="0 0 120 124"
      width={size}
      height={size}
      aria-hidden
    >
      {/* chvostík a uši */}
      <path d="M28 30 L36 6 L50 26 Z" fill="#E8893A" />
      <path d="M92 30 L84 6 L70 26 Z" fill="#E8893A" />
      {/* telo */}
      <ellipse cx="60" cy="70" rx="44" ry="48" fill="#F6A55A" />
      {/* krídla */}
      <ellipse cx="19" cy="78" rx="11" ry="24" fill="#E8893A" transform="rotate(12 19 78)" />
      <ellipse cx="101" cy="78" rx="11" ry="24" fill="#E8893A" transform="rotate(-12 101 78)" />
      {/* bruško s pierkami */}
      <ellipse cx="60" cy="88" rx="27" ry="27" fill="#FFE9CC" />
      <path d="M50 84 q4 4 8 0 M62 84 q4 4 8 0 M56 95 q4 4 8 0" stroke="#F3C79A" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      {/* líčka */}
      <circle cx="30" cy="66" r="6" fill="#FF8FA3" opacity="0.45" />
      <circle cx="90" cy="66" r="6" fill="#FF8FA3" opacity="0.45" />
      {/* oči */}
      {mood === 'happy' ? (
        <g stroke="#2B2B3A" strokeWidth="4.5" strokeLinecap="round" fill="none">
          <path d="M33 52 Q43 41 53 52" />
          <path d="M67 52 Q77 41 87 52" />
        </g>
      ) : (
        <g>
          <circle cx="43" cy="50" r="15" fill="#fff" />
          <circle cx="77" cy="50" r="15" fill="#fff" />
          <circle cx="45" cy="52" r="7.5" fill="#2B2B3A" />
          <circle cx="75" cy="52" r="7.5" fill="#2B2B3A" />
          <circle cx="48" cy="49" r="2.4" fill="#fff" />
          <circle cx="78" cy="49" r="2.4" fill="#fff" />
        </g>
      )}
      {/* zobáčik: horná a dolná časť (pri hovorení sa dolná pohybuje) */}
      <path d="M53 60 L67 60 L60 70 Z" fill="#FFC83D" />
      <path className="beak-low" d="M55 66 L65 66 L60 73 Z" fill="#F0B020" />
      {/* nôžky */}
      <ellipse cx="48" cy="118" rx="8" ry="4" fill="#FFC83D" />
      <ellipse cx="72" cy="118" rx="8" ry="4" fill="#FFC83D" />
    </svg>
  );
}
