/**
 * Zloží náhľad aplikácie pre claude.ai (Artifact): CSS a JS vloží priamo do stránky.
 * Spusti: npx vite build --mode artifact && npx tsx scripts/artifact-page.ts
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
const dir = 'dist-artifact/assets';
const files = readdirSync(dir);
const css = files.filter((f) => f.endsWith('.css')).map((f) => readFileSync(`${dir}/${f}`, 'utf8')).join('\n');
const js = files.filter((f) => f.startsWith('index') && f.endsWith('.js')).map((f) => readFileSync(`${dir}/${f}`, 'utf8')).join('\n');
const page = `<title>Abeceda</title>
<style>${css}</style>
<div id="root"></div>
<script type="module">${js.replace(/<\/script/gi, '<\\/script')}</script>
`;
writeFileSync('dist-artifact/page.html', page);
console.log('✔ dist-artifact/page.html', Math.round(page.length / 1024), 'kB');
