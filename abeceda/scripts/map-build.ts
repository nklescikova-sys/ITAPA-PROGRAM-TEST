/**
 * Vygeneruje src/content/map-geo.ts – obrys Slovenska a rieky Dunaj a Morava
 * z verejných údajov Natural Earth (public domain, https://www.naturalearthdata.com).
 *
 * Použitie (iba ak chcete mapu pregenerovať):
 *   1. stiahnite do priečinka geo/ súbory
 *      https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_countries.geojson
 *      https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_rivers_lake_centerlines.geojson
 *   2. npx tsx scripts/map-build.ts geo
 * Aplikácia sama nič nesťahuje – výsledok je uložený priamo v kóde.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { MAP_VIEW, project } from '../src/content/map-projection';

type P = [number, number];
const dir = process.argv[2] ?? 'geo';
const countries = JSON.parse(readFileSync(`${dir}/ne_10m_admin_0_countries.geojson`, 'utf8'));
const rivers = JSON.parse(readFileSync(`${dir}/ne_10m_rivers_lake_centerlines.geojson`, 'utf8'));

/** Douglas–Peucker zjednodušenie (tolerancia v px mapy). */
function simplify(pts: P[], tol: number): P[] {
  if (pts.length < 3) return pts;
  const [a, b] = [pts[0], pts[pts.length - 1]];
  let max = 0;
  let idx = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const p = pts[i];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy);
    // uzavretý obrys (začiatok = koniec) → vzdialenosť od bodu
    const d = len === 0 ? Math.hypot(p[0] - a[0], p[1] - a[1]) : Math.abs(dy * p[0] - dx * p[1] + b[0] * a[1] - b[1] * a[0]) / len;
    if (d > max) {
      max = d;
      idx = i;
    }
  }
  if (max <= tol) return [a, b];
  return [...simplify(pts.slice(0, idx + 1), tol).slice(0, -1), ...simplify(pts.slice(idx), tol)];
}
const fmt = (pts: P[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('');

const svk = countries.features.find((f: any) => f.properties.ADM0_A3 === 'SVK');
const ring: P[] = svk.geometry.coordinates[0].map((c: P) => project(c[0], c[1]));
const outline = fmt(simplify(ring, 0.8)) + 'Z';

/** Časti riek vnútri obdĺžnika (lon/lat). */
function riverParts(names: string[], box: [number, number, number, number]): string {
  const out: string[] = [];
  for (const f of rivers.features) {
    if (!names.includes(f.properties.name)) continue;
    const lines: P[][] = f.geometry.type === 'MultiLineString' ? f.geometry.coordinates : [f.geometry.coordinates];
    for (const line of lines) {
      let cur: P[] = [];
      for (const [lon, lat] of line) {
        if (lon >= box[0] && lon <= box[2] && lat >= box[1] && lat <= box[3]) cur.push(project(lon, lat));
        else if (cur.length) {
          if (cur.length > 1) out.push(fmt(simplify(cur, 0.6)));
          cur = [];
        }
      }
      if (cur.length > 1) out.push(fmt(simplify(cur, 0.6)));
    }
  }
  return out.join('');
}
const danube = riverParts(['Danube', 'Donau'], [16.9, 47.6, 18.95, 48.3]);
const morava = riverParts(['Morava'], [16.8, 48.1, 17.3, 48.9]);

writeFileSync(
  'src/content/map-geo.ts',
  `// VYGENEROVANÉ skriptom scripts/map-build.ts z údajov Natural Earth (public domain). Neupravujte ručne.
// viewBox: 0 0 ${MAP_VIEW.width} ${MAP_VIEW.height}
export const SLOVAKIA_OUTLINE = '${outline}';
export const RIVER_DANUBE = '${danube}';
export const RIVER_MORAVA = '${morava}';
`,
);
console.log('✔ src/content/map-geo.ts', { outlinePts: outline.split('L').length });
