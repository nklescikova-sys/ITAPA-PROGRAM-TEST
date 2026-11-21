import type { Glyph, Pt, Stroke } from './types';

/**
 * Súradnice štvorlinajky (os y smeruje nadol, ako v SVG):
 *   y = 20  horná linka (vrch veľkých písmen a dlhých ťahov b, d)
 *   y = 50  stredná linka (vrch malých písmen)
 *   y = 80  základná linka (spodok písmen)
 *   y = 105 spodná linka (dolné dĺžne – zatiaľ nepoužité)
 * Priestor nad hornou linkou (y 4–16) je pre diakritiku veľkých písmen.
 */
export const GEOMETRY = {
  top: 20,
  middle: 50,
  base: 80,
  bottom: 105,
  height: 115,
  /** výška veľkého písmena – od nej sa počíta tolerancia */
  capHeight: 60,
};

const STEP = 1;

/** Úsečka z bodu A do bodu B. */
export function line(x1: number, y1: number, x2: number, y2: number): Pt[] {
  const len = Math.hypot(x2 - x1, y2 - y1);
  const n = Math.max(1, Math.ceil(len / STEP));
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    pts.push({ x: x1 + ((x2 - x1) * i) / n, y: y1 + ((y2 - y1) * i) / n });
  }
  return pts;
}

/**
 * Oblúk elipsy so stredom (cx, cy). Uhly v stupňoch: 0 = vpravo, 90 = dole, -90 = hore.
 * Rastúci uhol = v smere hodinových ručičiek, klesajúci = proti smeru.
 */
export function arc(cx: number, cy: number, rx: number, ry: number, from: number, to: number): Pt[] {
  const len = (Math.abs(to - from) / 360) * 2 * Math.PI * Math.max(rx, ry);
  const n = Math.max(2, Math.ceil(len / STEP));
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const a = ((from + ((to - from) * i) / n) * Math.PI) / 180;
    pts.push({ x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a) });
  }
  return pts;
}

/** Spojí viac častí do jedného ťahu. */
export function join(...parts: Pt[][]): Stroke {
  const out: Pt[] = [];
  for (const part of parts) {
    for (const p of part) {
      const last = out[out.length - 1];
      if (!last || Math.hypot(last.x - p.x, last.y - p.y) > 0.01) out.push(p);
    }
  }
  return out;
}

/** Bodka – ťah z jedného bodu (stačí ťuknúť). */
export function dot(x: number, y: number): Stroke {
  return [{ x, y }];
}

// ---------- Veľké písmená ----------
const A: Stroke[] = [
  line(25, 20, 4, 80), // 1. ľavá šikmá čiara zhora nadol
  line(25, 20, 46, 80), // 2. pravá šikmá čiara zhora nadol
  line(12, 58, 38, 58), // 3. vodorovná čiara zľava doprava
];
const B: Stroke[] = [
  line(8, 20, 8, 80), // 1. zvislá čiara zhora nadol
  join(line(8, 20, 24, 20), arc(24, 35, 15, 15, -90, 90), line(24, 50, 8, 50)), // 2. horné bruško
  join(line(8, 50, 26, 50), arc(26, 65, 15, 15, -90, 90), line(26, 80, 8, 80)), // 3. dolné bruško
];
const C: Stroke[] = [
  arc(30, 50, 22, 30, -40, -320), // 1. oblúk proti smeru hodinových ručičiek
];
const D: Stroke[] = [
  line(8, 20, 8, 80), // 1. zvislá čiara zhora nadol
  join(line(8, 20, 18, 20), arc(18, 50, 24, 30, -90, 90), line(18, 80, 8, 80)), // 2. veľké bruško
];
const E: Stroke[] = [
  line(8, 20, 8, 80), // 1. zvislá čiara zhora nadol
  line(8, 20, 38, 20), // 2. horná vodorovná
  line(8, 50, 32, 50), // 3. stredná vodorovná
  line(8, 80, 38, 80), // 4. dolná vodorovná
];

// ---------- Malé písmená ----------
const a: Stroke[] = [
  arc(22, 65, 15, 15, -30, -390), // 1. krúžok proti smeru hodinových ručičiek, začína vpravo hore
  line(37, 50, 37, 80), // 2. zvislá čiara vpravo zhora nadol
];
const b: Stroke[] = [
  line(8, 20, 8, 80), // 1. dlhá zvislá čiara zhora nadol
  arc(23, 65, 15, 15, 180, 540), // 2. bruško v smere hodinových ručičiek, začína vľavo
];
const c: Stroke[] = [
  arc(22, 65, 15, 15, -40, -320), // 1. oblúk proti smeru hodinových ručičiek
];
const d: Stroke[] = [
  arc(22, 65, 15, 15, -30, -390), // 1. krúžok proti smeru hodinových ručičiek
  line(37, 20, 37, 80), // 2. dlhá zvislá čiara zhora nadol
];
const e: Stroke[] = [
  join(line(7, 65, 37, 65), arc(22, 65, 15, 15, 0, -320)), // 1. vodorovná čiara a oblúk proti smeru hodinových ručičiek
];

const caronCap = (cx: number): Stroke => join(line(cx - 8, 6, cx, 14), line(cx, 14, cx + 8, 6));
const caronLow = (cx: number): Stroke => join(line(cx - 7, 37, cx, 44), line(cx, 44, cx + 7, 37));

export const GLYPHS: Record<string, Glyph> = {
  A: { char: 'A', width: 50, strokes: A },
  B: { char: 'B', width: 44, strokes: B },
  C: { char: 'C', width: 52, strokes: C },
  D: { char: 'D', width: 46, strokes: D },
  E: { char: 'E', width: 42, strokes: E },
  a: { char: 'a', width: 44, strokes: a },
  b: { char: 'b', width: 42, strokes: b },
  c: { char: 'c', width: 40, strokes: c },
  d: { char: 'd', width: 44, strokes: d },
  e: { char: 'e', width: 42, strokes: e },
  // doplnkové písmená s diakritikou
  Ä: { char: 'Ä', width: 50, strokes: [...A, dot(16, 9), dot(34, 9)] },
  ä: { char: 'ä', width: 44, strokes: [...a, dot(15, 40), dot(29, 40)] },
  Č: { char: 'Č', width: 52, strokes: [...C, caronCap(30)] },
  č: { char: 'č', width: 40, strokes: [...c, caronLow(22)] },
  Ď: { char: 'Ď', width: 46, strokes: [...D, caronCap(20)] },
  ď: { char: 'ď', width: 50, strokes: [...d, line(46, 18, 43, 28)] },
};
