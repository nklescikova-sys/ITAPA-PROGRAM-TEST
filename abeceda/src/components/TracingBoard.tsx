import { useEffect, useMemo, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import type { Glyph, Pt } from '../content/types';
import { GEOMETRY } from '../content/strokes';
import { LetterTracer, type TraceEvent } from '../lib/tracing';

interface Props {
  glyph: Glyph;
  tolerance: number;
  /** šípky a čísla ťahov (pri 3. opakovaní sa skryjú, bodky začiatku ostanú) */
  showHints: boolean;
  leftHanded: boolean;
  /** zvýšením čísla sa spustí animácia „Ukáž mi“ */
  demoKey: number;
  onDemoEnd?: () => void;
  onEvent: (ev: TraceEvent, tracer: LetterTracer) => void;
  /** farba pastelky, ktorou sa vyfarbujú ťahy */
  inkColor?: string;
  /** ukáže zónu tolerancie (pre rodiča / ladenie) */
  showZone?: boolean;
}

const PAD = 14;
const toPath = (pts: Pt[]) =>
  pts.length ? `M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}` + pts.slice(1).map((p) => `L${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join('') : '';

/** Bod vo vzdialenosti d od začiatku ťahu (pozdĺž čiary). */
function pointAt(pts: Pt[], d: number): Pt {
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const seg = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    if (acc + seg >= d) {
      const t = (d - acc) / seg;
      return { x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * t, y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * t };
    }
    acc += seg;
  }
  return pts[pts.length - 1];
}
const strokeLen = (pts: Pt[]) => pts.reduce((s, p, i) => (i ? s + Math.hypot(p.x - pts[i - 1].x, p.y - pts[i - 1].y) : 0), 0);
function partial(pts: Pt[], frac: number): Pt[] {
  const n = Math.max(1, Math.round((pts.length - 1) * frac));
  return pts.slice(0, n + 1);
}

export function TracingBoard({ glyph, tolerance, showHints, leftHanded, demoKey, onDemoEnd, onEvent, showZone, inkColor }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tracerRef = useRef<LetterTracer | null>(null);
  if (!tracerRef.current) tracerRef.current = new LetterTracer(glyph.strokes, tolerance);
  const tracer = tracerRef.current;
  const [, setTick] = useState(0);
  const rerender = () => setTick((t) => t + 1);
  const pointerId = useRef<number | null>(null);
  const [ink, setInk] = useState<Pt[]>([]);
  const [blink, setBlink] = useState(0);
  const [demo, setDemo] = useState<{ stroke: number; t: number } | null>(null);

  useEffect(() => tracer.setTolerance(tolerance), [tolerance, tracer]);

  // animácia „Ukáž mi“
  useEffect(() => {
    if (!demoKey) return;
    let raf = 0;
    let stroke = 0;
    let start = performance.now();
    const durations = glyph.strokes.map((s) => (s.length === 1 ? 500 : Math.max(800, strokeLen(s) * 22)));
    const pause = 250;
    const frame = (now: number) => {
      const el = now - start;
      const d = durations[stroke];
      if (el >= d + pause) {
        stroke++;
        start = now;
        if (stroke >= glyph.strokes.length) {
          setDemo(null);
          onDemoEnd?.();
          return;
        }
      }
      setDemo({ stroke, t: Math.min(1, (now - start) / d) });
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoKey]);

  const toLocal = (e: { clientX: number; clientY: number }): Pt => {
    const svg = svgRef.current!;
    const m = svg.getScreenCTM();
    if (!m) return { x: 0, y: 0 };
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  };

  const handle = (ev: TraceEvent) => {
    if (ev === 'missedStart' || ev === 'failed') setBlink((b) => b + 1);
    if (ev === 'strokeDone' || ev === 'letterDone') setInk([]);
    if (ev !== 'none' && ev !== 'progress') onEvent(ev, tracer);
    rerender();
  };

  const down = (e: RPointerEvent<SVGSVGElement>) => {
    if (demo || tracer.done || pointerId.current !== null) return;
    e.preventDefault();
    pointerId.current = e.pointerId;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    const p = toLocal(e);
    setInk([p]);
    handle(tracer.down(p));
  };
  const move = (e: RPointerEvent<SVGSVGElement>) => {
    if (pointerId.current !== e.pointerId) return;
    const events = e.nativeEvent.getCoalescedEvents?.() ?? [e.nativeEvent];
    let last: TraceEvent = 'none';
    const added: Pt[] = [];
    for (const ce of events.length ? events : [e.nativeEvent]) {
      const p = toLocal(ce);
      added.push(p);
      const ev = tracer.move(p);
      if (ev !== 'none' && ev !== 'progress') {
        last = ev;
        if (ev === 'strokeDone' || ev === 'letterDone') break;
      }
    }
    if (last !== 'none') handle(last);
    else {
      setInk((i) => [...i, ...added]);
    }
  };
  const up = (e: RPointerEvent<SVGSVGElement>) => {
    if (pointerId.current !== e.pointerId) return;
    pointerId.current = null;
    setInk([]);
    handle(tracer.up());
  };

  const vbW = glyph.width + PAD * 2;
  const hints = useMemo(
    () =>
      glyph.strokes.map((s, i) => {
        const start = s[0];
        if (s.length === 1) return { start, label: { x: start.x + 6, y: start.y - 3 }, arrow: null, i };
        const ahead = pointAt(s, 4);
        const dx = ahead.x - start.x;
        const dy = ahead.y - start.y;
        const l = Math.hypot(dx, dy) || 1;
        const ux = dx / l;
        const uy = dy / l;
        const label = { x: start.x - ux * 8, y: start.y - uy * 8 };
        // šípka smeru vedľa čiary (posunutá kolmo)
        const len = strokeLen(s);
        const a0 = pointAt(s, Math.min(len * 0.35, 8));
        const a1 = pointAt(s, Math.min(len * 0.75, 17));
        const ax = a1.x - a0.x;
        const ay = a1.y - a0.y;
        const al = Math.hypot(ax, ay) || 1;
        const nx = -ay / al;
        const ny = ax / al;
        const off = 5.5;
        const p0 = { x: a0.x + nx * off, y: a0.y + ny * off };
        const p1 = { x: a1.x + nx * off, y: a1.y + ny * off };
        const hx = ax / al;
        const hy = ay / al;
        const head = `M${p1.x - hx * 3 + nx * 2} ${p1.y - hy * 3 + ny * 2}L${p1.x} ${p1.y}L${p1.x - hx * 3 - nx * 2} ${p1.y - hy * 3 - ny * 2}`;
        return { start, label, arrow: { d: `M${p0.x} ${p0.y}L${p1.x} ${p1.y}`, head }, i };
      }),
    [glyph],
  );

  const current = tracer.strokeIndex;
  const done = tracer.done;
  const progressPts =
    !done && tracer.cpIndex > 0 ? tracer.checkpoints[current].slice(0, tracer.cpIndex) : [];

  let demoTip: Pt | null = null;
  const demoPaths: Pt[][] = [];
  if (demo) {
    for (let i = 0; i < demo.stroke; i++) demoPaths.push(glyph.strokes[i]);
    const s = glyph.strokes[demo.stroke];
    const part = partial(s, demo.t);
    demoPaths.push(part);
    demoTip = part[part.length - 1];
  }

  return (
    <svg
      ref={svgRef}
      className={`board ${done ? 'board-done' : ''}`}
      style={inkColor ? ({ '--pen': inkColor } as React.CSSProperties) : undefined}
      viewBox={`${-PAD} 0 ${vbW} ${GEOMETRY.height}`}
      preserveAspectRatio="xMidYMid meet"
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      role="img"
      aria-label={`Písmeno ${glyph.char} na obťahovanie`}
    >
      {/* štvorlinajka */}
      <g className="lines">
        <line x1={-PAD} x2={vbW - PAD} y1={GEOMETRY.top} y2={GEOMETRY.top} />
        <line x1={-PAD} x2={vbW - PAD} y1={GEOMETRY.middle} y2={GEOMETRY.middle} className="mid" />
        <line x1={-PAD} x2={vbW - PAD} y1={GEOMETRY.base} y2={GEOMETRY.base} className="base" />
        <line x1={-PAD} x2={vbW - PAD} y1={GEOMETRY.bottom} y2={GEOMETRY.bottom} />
      </g>

      {showZone && (
        <g className="zone">
          {glyph.strokes.map((s, i) =>
            s.length === 1 ? (
              <circle key={i} cx={s[0].x} cy={s[0].y} r={tolerance} />
            ) : (
              <path key={i} d={toPath(s)} strokeWidth={tolerance * 2} />
            ),
          )}
        </g>
      )}

      {/* prerušované písmeno */}
      <g className="guide">
        {glyph.strokes.map((s, i) =>
          s.length === 1 ? <circle key={i} cx={s[0].x} cy={s[0].y} r={2.2} /> : <path key={i} d={toPath(s)} />,
        )}
      </g>

      {/* hotové ťahy */}
      <g className="filled">
        {glyph.strokes.map((s, i) =>
          i < current || done ? (
            s.length === 1 ? <circle key={i} cx={s[0].x} cy={s[0].y} r={3} /> : <path key={i} d={toPath(s)} />
          ) : null,
        )}
        {progressPts.length > 1 && <path d={toPath(progressPts)} />}
      </g>

      {/* stopa prsta */}
      {ink.length > 1 && <path className="ink" d={toPath(ink)} />}

      {/* čísla, šípky a začiatočné bodky */}
      {!done && !demo && (
        <g className="hints">
          {hints
            .filter((h) => h.i >= current)
            .reverse()
            .map((h) => (
              <g key={h.i} className={h.i === current ? 'hint-current' : 'hint-later'}>
                {showHints && h.arrow && (
                  <g className="arrow">
                    <path d={h.arrow.d} />
                    <path d={h.arrow.head} />
                  </g>
                )}
                {showHints && (
                  <text x={h.label.x} y={h.label.y} className="num" dominantBaseline="central" textAnchor="middle">
                    {h.i + 1}
                  </text>
                )}
                <circle
                  key={h.i === current ? `b${blink}` : 'x'}
                  cx={h.start.x}
                  cy={h.start.y}
                  r={h.i === current ? 3.4 : 2.4}
                  className={h.i === current ? `start ${blink ? 'blink' : ''}` : 'start-later'}
                />
              </g>
            ))}
        </g>
      )}

      {/* ukážka */}
      {demo && (
        <g className="demo">
          {demoPaths.map((p, i) => (p.length === 1 ? <circle key={i} cx={p[0].x} cy={p[0].y} r={3} /> : <path key={i} d={toPath(p)} />))}
          {demoTip && (
            <text
              className="hand"
              fontSize="16"
              transform={`translate(${demoTip.x} ${demoTip.y}) ${leftHanded ? 'scale(-1 1)' : ''}`}
              x={-3}
              y={14}
              textAnchor="middle"
            >
              👆
            </text>
          )}
        </g>
      )}
    </svg>
  );
}
