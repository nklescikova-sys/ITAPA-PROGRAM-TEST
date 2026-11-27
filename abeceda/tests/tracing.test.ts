import { describe, expect, it } from 'vitest';
import { GLYPHS } from '../src/content/strokes';
import { LetterTracer, buildCheckpoints, toleranceFor, BOOST_FACTOR } from '../src/lib/tracing';
import type { Pt, Stroke } from '../src/content/types';

const EASY = toleranceFor('easy');
const HARD = toleranceFor('hard');

/** Simuluje ťah prstom po zadaných bodoch. Vráti posledný event. */
function drag(t: LetterTracer, pts: Pt[], lift = true) {
  let ev = t.down(pts[0]);
  for (const p of pts.slice(1)) {
    const e = t.move(p);
    if (e !== 'none' && e !== 'progress') ev = e;
  }
  if (lift) {
    const e = t.up();
    if (e !== 'none') ev = e;
  }
  return ev;
}

/** Každý n-tý bod ťahu (ako keby prst ťahal rýchlo). */
const sparse = (s: Stroke, n = 5) => s.filter((_, i) => i % n === 0 || i === s.length - 1);
const offset = (s: Stroke, dx: number, dy: number) => s.map((p) => ({ x: p.x + dx, y: p.y + dy }));
const reverse = (s: Stroke) => [...s].reverse();

describe('kontrolné body', () => {
  it('začínajú na začiatku a končia na konci ťahu', () => {
    const s = GLYPHS.E.strokes[1];
    const cps = buildCheckpoints(s, 4);
    expect(cps[0]).toEqual(s[0]);
    expect(cps[cps.length - 1]).toEqual(s[s.length - 1]);
    expect(cps.length).toBeGreaterThan(5);
  });
});

describe('správne poradie a smer', () => {
  for (const ch of Object.keys(GLYPHS)) {
    it(`písmeno ${ch} sa dá obtiahnuť presne podľa definície (aj na Ťažkej)`, () => {
      const t = new LetterTracer(GLYPHS[ch].strokes, HARD);
      let last = '';
      for (const s of GLYPHS[ch].strokes) last = drag(t, sparse(s));
      expect(last).toBe('letterDone');
      expect(t.done).toBe(true);
    });
  }

  it('ťahy idú postupne: po prvom ťahu hlási strokeDone', () => {
    const t = new LetterTracer(GLYPHS.A.strokes, EASY);
    expect(drag(t, GLYPHS.A.strokes[0])).toBe('strokeDone');
    expect(t.strokeIndex).toBe(1);
  });
});

describe('nesprávne poradie', () => {
  it('ťah v nesprávnom poradí sa nepočíta (E: najprv dolná čiara)', () => {
    const t = new LetterTracer(GLYPHS.E.strokes, EASY);
    expect(drag(t, GLYPHS.E.strokes[3])).toBe('failed');
    expect(t.strokeIndex).toBe(0);
  });

  it('A: pravá noha ako prvá sa nepočíta, aj keď začína na rovnakom mieste', () => {
    const t = new LetterTracer(GLYPHS.A.strokes, EASY);
    expect(drag(t, GLYPHS.A.strokes[1])).toBe('failed');
    expect(t.strokeIndex).toBe(0);
  });

  it('opačný smer (zdola nahor) sa nepočíta', () => {
    const t = new LetterTracer(GLYPHS.E.strokes, EASY);
    expect(drag(t, reverse(GLYPHS.E.strokes[0]))).toBe('failed');
    expect(t.strokeIndex).toBe(0);
  });

  it('oblúk C v smere hodinových ručičiek (opačne) sa nepočíta', () => {
    const t = new LetterTracer(GLYPHS.c.strokes, EASY);
    const s = GLYPHS.c.strokes[0];
    // začne správne na začiatočnej bodke, ale ide opačným smerom
    const wrongWay = [s[0], ...reverse(s)];
    expect(drag(t, wrongWay)).toBe('failed');
    expect(t.done).toBe(false);
  });

  it('krúžok a v smere hodinových ručičiek sa nepočíta', () => {
    const t = new LetterTracer(GLYPHS.a.strokes, EASY);
    const s = GLYPHS.a.strokes[0];
    expect(drag(t, reverse(s))).toBe('failed');
    expect(t.strokeIndex).toBe(0);
  });

  it('čmáranica nepokryje body v správnom poradí', () => {
    const t = new LetterTracer(GLYPHS.B.strokes, EASY);
    const scribble: Pt[] = [{ x: 8, y: 20 }];
    // náhodné skákanie po celom písmene
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 60; i++) scribble.push({ x: rnd() * 44, y: 20 + rnd() * 60 });
    drag(t, scribble);
    expect(t.strokeIndex).toBe(0);
  });

  it('skok z prvej bodky priamo na koniec mimo čiary sa nepočíta (B bruško)', () => {
    const t = new LetterTracer(GLYPHS.B.strokes, EASY);
    drag(t, GLYPHS.B.strokes[0]);
    const s = GLYPHS.B.strokes[1];
    // zo začiatku rovno na koniec (cez stred brušká) – body oblúka sa vynechajú
    expect(drag(t, [s[0], s[s.length - 1]])).toBe('failed');
    expect(t.strokeIndex).toBe(1);
  });
});

describe('vybočenie a tolerancia', () => {
  it('pri vybočení sa ťah nezruší, dieťa môže pokračovať po návrate do zóny', () => {
    const t = new LetterTracer(GLYPHS.E.strokes, EASY);
    const s = GLYPHS.E.strokes[0]; // zvislá čiara x=8, y 20→80
    t.down(s[0]);
    t.move({ x: 8, y: 40 });
    t.move({ x: 30, y: 45 }); // ďaleko mimo
    expect(t.outside).toBe(true);
    const progressBefore = t.cpIndex;
    t.move({ x: 8, y: 45 }); // späť do zóny
    expect(t.outside).toBe(false);
    expect(t.cpIndex).toBeGreaterThanOrEqual(progressBefore);
    expect(t.move({ x: 8, y: 80 })).toBe('strokeDone');
  });

  it('úsek prejdený mimo zóny sa nezapočíta', () => {
    const t = new LetterTracer(GLYPHS.E.strokes, EASY);
    t.down({ x: 8, y: 20 });
    t.move({ x: 30, y: 20 });
    t.move({ x: 30, y: 80 }); // celý čas mimo zóny
    t.move({ x: 8, y: 80 }); // koniec ťahu bez prejdenia stredom
    expect(t.strokeIndex).toBe(0);
    expect(t.up()).toBe('failed');
  });

  it('zdvihnutie prsta pred dokončením ťah resetuje', () => {
    const t = new LetterTracer(GLYPHS.E.strokes, EASY);
    const s = GLYPHS.E.strokes[0];
    drag(t, s.slice(0, 30));
    expect(t.cpIndex).toBe(0);
    expect(t.consecutiveFails).toBe(1);
  });

  it('Ľahká prijme čiaru posunutú o 6 jednotiek, Ťažká nie', () => {
    const s = offset(GLYPHS.E.strokes[0], 6, 0);
    const easy = new LetterTracer(GLYPHS.E.strokes, EASY);
    expect(drag(easy, s)).toBe('strokeDone');
    const hard = new LetterTracer(GLYPHS.E.strokes, HARD);
    expect(drag(hard, s)).not.toBe('strokeDone');
  });

  it('úrovne majú rastúcu toleranciu a zväčšenie po neúspechoch', () => {
    expect(toleranceFor('hard')).toBeLessThan(toleranceFor('medium'));
    expect(toleranceFor('medium')).toBeLessThan(toleranceFor('easy'));
    expect(toleranceFor('hard', true)).toBeCloseTo(toleranceFor('hard') * BOOST_FACTOR);
  });

  it('položenie prsta mimo začiatku hlási missedStart', () => {
    const t = new LetterTracer(GLYPHS.E.strokes, EASY);
    expect(t.down({ x: 40, y: 70 })).toBe('missedStart');
    expect(t.up()).toBe('none'); // len ťuknutie sa nepočíta ako pokus
  });

  it('počíta neúspechy po sebe a po úspechu ich vynuluje', () => {
    const t = new LetterTracer(GLYPHS.E.strokes, EASY);
    const s = GLYPHS.E.strokes[0];
    drag(t, reverse(s));
    drag(t, reverse(s));
    drag(t, reverse(s));
    expect(t.consecutiveFails).toBe(3);
    drag(t, s);
    expect(t.consecutiveFails).toBe(0);
    expect(t.totalFails).toBe(3);
  });

  it('bodky (Ä) sa splnia ťuknutím', () => {
    const t = new LetterTracer(GLYPHS['Ä'].strokes, EASY);
    for (const s of GLYPHS.A.strokes) drag(t, s);
    expect(drag(t, [{ x: 17, y: 10 }])).toBe('strokeDone');
    expect(drag(t, [{ x: 34, y: 8 }])).toBe('letterDone');
  });
});
