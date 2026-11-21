/** Jednoduché ikony (inline SVG, žiadne externé súbory). */
const P = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.4, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export const IconHome = () => (
  <svg viewBox="0 0 24 24" {...P}><path d="M3 11l9-7 9 7" /><path d="M5 10v10h5v-6h4v6h5V10" /></svg>
);
export const IconSpeaker = () => (
  <svg viewBox="0 0 24 24" {...P}><path d="M4 9h4l5-4v14l-5-4H4z" /><path d="M16.5 8.5a5 5 0 010 7" /><path d="M19 6a8.5 8.5 0 010 12" /></svg>
);
export const IconNext = () => (
  <svg viewBox="0 0 24 24" {...P} strokeWidth={3}><path d="M5 12h13" /><path d="M13 6l6 6-6 6" /></svg>
);
export const IconBack = () => (
  <svg viewBox="0 0 24 24" {...P} strokeWidth={3}><path d="M19 12H6" /><path d="M11 6l-6 6 6 6" /></svg>
);
export const IconPlay = () => (
  <svg viewBox="0 0 24 24"><path d="M8 5.5v13a1 1 0 001.5.86l10.5-6.5a1 1 0 000-1.72L9.5 4.64A1 1 0 008 5.5z" fill="currentColor" /></svg>
);
export const IconMap = () => (
  <svg viewBox="0 0 24 24" {...P}><path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z" /><path d="M9 4v14M15 6v14" /></svg>
);
export const IconHand = () => (
  <svg viewBox="0 0 24 24" {...P}><path d="M9 11V5a1.5 1.5 0 013 0v5" /><path d="M12 10V4a1.5 1.5 0 013 0v6" /><path d="M15 10V6a1.5 1.5 0 013 0v7c0 4-2.5 7-6.5 7-2.5 0-4-1-5.5-3l-2.7-4a1.6 1.6 0 012.5-2L9 14" /></svg>
);
export const IconCheck = () => (
  <svg viewBox="0 0 24 24" {...P} strokeWidth={3.2}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);
export const IconSkip = () => (
  <svg viewBox="0 0 24 24" {...P} strokeWidth={3}><path d="M5 6l7 6-7 6" /><path d="M13 6l7 6-7 6" /></svg>
);
export const IconStar = ({ filled = true }: { filled?: boolean }) => (
  <svg viewBox="0 0 24 24"><path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z" fill={filled ? '#FFC93C' : 'none'} stroke={filled ? '#E8A800' : '#ccc'} strokeWidth="1.5" strokeLinejoin="round" /></svg>
);
export const IconParents = () => (
  <svg viewBox="0 0 24 24" {...P} strokeWidth={2}><circle cx="8" cy="7" r="3" /><circle cx="17" cy="9" r="2.3" /><path d="M2.5 20c0-4 2.5-6.5 5.5-6.5s5.5 2.5 5.5 6.5" /><path d="M14 20c0-3 1.3-5 3-5s3 2 3 5" /></svg>
);
export const IconSwap = () => (
  <svg viewBox="0 0 24 24" {...P}><path d="M4 8h13l-3-3" /><path d="M20 16H7l3 3" /></svg>
);
