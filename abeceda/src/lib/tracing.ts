import type { Pt, Stroke } from '../content/types';
import { GEOMETRY } from '../content/strokes';
import type { Difficulty } from '../content/types';

/** Polomer tolerančnej zóny ako podiel výšky veľkého písmena. */
export const TOLERANCE: Record<Difficulty, number> = {
  easy: 0.12,
  medium: 0.08,
  hard: 0.05,
};

/** Koľkokrát sa zväčší tolerancia po 3 neúspechoch po sebe. */
export const BOOST_FACTOR = 1.5;
/**
 * Ochrana proti čmáraniu: ťah, pri ktorom prst prejde viac ako
 * SCRIBBLE_RATIO × dĺžka čiary (+ rezerva), sa už nezapočíta.
 */
export const SCRIBBLE_RATIO = 3;
export const SCRIBBLE_SLACK = 30;

/** Po koľkých neúspechoch po sebe sa spustí automatická ukážka. */
export const MAX_FAILS = 3;

export function toleranceFor(difficulty: Difficulty, boosted = false): number {
  return TOLERANCE[difficulty] * GEOMETRY.capHeight * (boosted ? BOOST_FACTOR : 1);
}

const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);

/** Vzdialenosť bodu od úsečky AB. */
function distToSegment(p: Pt, a: Pt, b: Pt): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return dist(p, a);
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

export function distToPolyline(p: Pt, pts: Pt[]): number {
  if (pts.length === 1) return dist(p, pts[0]);
  let best = Infinity;
  for (let i = 1; i < pts.length; i++) best = Math.min(best, distToSegment(p, pts[i - 1], pts[i]));
  return best;
}

/** Rozmiestni kontrolné body rovnomerne pozdĺž ťahu (vrátane začiatku a konca). */
export function buildCheckpoints(stroke: Stroke, spacing = 4): Pt[] {
  if (stroke.length === 1) return [stroke[0]];
  const out: Pt[] = [stroke[0]];
  let carry = 0;
  for (let i = 1; i < stroke.length; i++) {
    const a = stroke[i - 1];
    const b = stroke[i];
    const seg = dist(a, b);
    let pos = spacing - carry;
    while (pos <= seg) {
      const t = pos / seg;
      out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
      pos += spacing;
    }
    carry = seg - (pos - spacing);
  }
  const last = stroke[stroke.length - 1];
  if (dist(out[out.length - 1], last) > spacing * 0.3) out.push(last);
  else out[out.length - 1] = last;
  return out;
}

export type TraceEvent =
  | 'none'
  | 'started' // prst položený na začiatočnú bodku
  | 'progress'
  | 'missedStart' // prst položený mimo začiatku → zablikať začiatočnou bodkou
  | 'strokeDone'
  | 'letterDone'
  | 'failed'; // prst zdvihnutý pred dokončením ťahu

/**
 * Vyhodnocovanie obťahovania jedného písmena.
 * Nezávislé od Reactu aj od DOM – dá sa testovať v Node.
 */
export class LetterTracer {
  readonly strokes: Stroke[];
  readonly checkpoints: Pt[][];
  readonly lengths: number[];
  tolerance: number;

  strokeIndex = 0;
  /** index najbližšieho ešte nepokrytého kontrolného bodu v aktuálnom ťahu */
  cpIndex = 0;
  /** prst je mimo tolerančnej zóny */
  outside = false;
  /** neúspešné pokusy po sebe */
  consecutiveFails = 0;
  totalFails = 0;

  private pointerDown = false;
  private active = false; // ťah začal na správnom mieste
  private waitForUp = false;
  private last: Pt | null = null;
  private strayLength = 0;
  private inkLength = 0;
  /** ťah bol vyhodnotený ako čmáranica – do zdvihnutia prsta sa nič nezapočíta */
  scribbled = false;

  constructor(strokes: Stroke[], tolerance: number, spacing = 4) {
    this.strokes = strokes;
    this.tolerance = tolerance;
    this.checkpoints = strokes.map((s) => buildCheckpoints(s, spacing));
    this.lengths = strokes.map((s) => s.reduce((sum, p, i) => (i ? sum + dist(s[i - 1], p) : 0), 0));
  }

  get done(): boolean {
    return this.strokeIndex >= this.strokes.length;
  }

  /** Podiel splnenia aktuálneho ťahu 0–1. */
  get strokeProgress(): number {
    const cps = this.checkpoints[this.strokeIndex];
    if (!cps) return 1;
    return this.cpIndex / cps.length;
  }

  setTolerance(t: number) {
    this.tolerance = t;
  }

  down(p: Pt): TraceEvent {
    if (this.done) return 'none';
    this.pointerDown = true;
    this.waitForUp = false;
    this.last = p;
    this.strayLength = 0;
    this.inkLength = 0;
    this.scribbled = false;
    this.outside = false;
    const cps = this.checkpoints[this.strokeIndex];
    if (dist(p, cps[0]) <= this.tolerance) {
      this.active = true;
      this.advance(p);
      if (this.cpIndex >= cps.length) return this.completeStroke();
      return 'started';
    }
    this.active = false;
    return 'missedStart';
  }

  move(p: Pt): TraceEvent {
    if (!this.pointerDown || this.done || this.waitForUp || !this.last) return 'none';
    const from = this.last;
    this.last = p;
    if (!this.active) {
      this.strayLength += dist(from, p);
      return 'none';
    }
    this.inkLength += dist(from, p);
    if (this.inkLength > this.lengths[this.strokeIndex] * SCRIBBLE_RATIO + SCRIBBLE_SLACK) {
      this.scribbled = true;
    }
    if (this.scribbled) return 'none';
    const stroke = this.strokes[this.strokeIndex];
    const cps = this.checkpoints[this.strokeIndex];
    // rýchly pohyb prstom → doplníme medziľahlé body, aby sa nepreskočili kontrolné body
    const step = Math.max(0.5, this.tolerance / 3);
    const n = Math.max(1, Math.ceil(dist(from, p) / step));
    for (let i = 1; i <= n; i++) {
      const q = { x: from.x + ((p.x - from.x) * i) / n, y: from.y + ((p.y - from.y) * i) / n };
      if (distToPolyline(q, stroke) > this.tolerance) {
        // mimo zóny: nič sa nezapočíta, ale ťah sa nezruší
        this.outside = true;
        continue;
      }
      this.outside = false;
      this.advance(q);
      if (this.cpIndex >= cps.length) return this.completeStroke();
    }
    return 'progress';
  }

  up(): TraceEvent {
    const wasDown = this.pointerDown;
    this.pointerDown = false;
    this.last = null;
    this.outside = false;
    this.scribbled = false;
    if (!wasDown || this.waitForUp || this.done) {
      this.waitForUp = false;
      return 'none';
    }
    if (this.active) {
      // zdvihnutie prsta pred dokončením → ťah sa resetuje
      this.active = false;
      this.cpIndex = 0;
      return this.fail();
    }
    // čiara nakreslená mimo začiatku (nie len ťuknutie)
    if (this.strayLength > this.tolerance) return this.fail();
    return 'none';
  }

  /** Kontrolné body sa započítavajú iba v poradí – to chráni pred čmáraním a ťahaním opačným smerom. */
  private advance(q: Pt) {
    const cps = this.checkpoints[this.strokeIndex];
    while (this.cpIndex < cps.length && dist(q, cps[this.cpIndex]) <= this.tolerance) this.cpIndex++;
  }

  private completeStroke(): TraceEvent {
    this.strokeIndex++;
    this.cpIndex = 0;
    this.active = false;
    this.waitForUp = this.pointerDown;
    this.consecutiveFails = 0;
    return this.done ? 'letterDone' : 'strokeDone';
  }

  private fail(): TraceEvent {
    this.consecutiveFails++;
    this.totalFails++;
    return 'failed';
  }
}
