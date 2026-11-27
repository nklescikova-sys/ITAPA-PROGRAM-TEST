/**
 * Kreslené pozadie: obloha, slniečko, oblaky a kopce. Statické – nič sa nehýbe,
 * aby nerozptyľovalo. Farba kopcov sa dá zladiť s písmenom.
 */
export function Scenery({ hill = '#BFE6A6', hill2 = '#A5D98A' }: { hill?: string; hill2?: string }) {
  return (
    <div className="scenery" aria-hidden>
      <svg className="scenery-sky" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#D7EEFF" />
            <stop offset="0.65" stopColor="#F3FAFF" />
            <stop offset="1" stopColor="#FFFDF5" />
          </linearGradient>
        </defs>
        <rect width="1200" height="800" fill="url(#sky)" />
        <circle cx="1060" cy="120" r="64" fill="#FFE59A" />
        <circle cx="1060" cy="120" r="88" fill="#FFE59A" opacity="0.35" />
        <g fill="#fff" opacity="0.95">
          <ellipse cx="190" cy="140" rx="70" ry="26" />
          <ellipse cx="240" cy="122" rx="46" ry="30" />
          <ellipse cx="150" cy="126" rx="34" ry="22" />
          <ellipse cx="760" cy="90" rx="56" ry="20" />
          <ellipse cx="800" cy="76" rx="34" ry="22" />
        </g>
      </svg>
      <svg className="scenery-hills" viewBox="0 0 1200 220" preserveAspectRatio="none">
        <path d="M0 120 C200 40 380 60 560 110 C760 165 920 60 1200 90 L1200 220 L0 220 Z" fill={hill} />
        <path d="M0 170 C180 120 340 130 520 165 C720 205 900 130 1200 150 L1200 220 L0 220 Z" fill={hill2} />
      </svg>
    </div>
  );
}
