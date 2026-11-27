/**
 * Vygeneruje QR kódy pre všetky písmená (SVG aj PNG) do priečinka qr/.
 * Adresa sa berie z VITE_BASE_URL v súbore .env.
 * Spusti: npm run qr
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import QRCode from 'qrcode';
import { loadEnv } from 'vite';
import { LETTERS } from '../src/content/letters';

const env = loadEnv('production', process.cwd(), '');
let base = env.VITE_BASE_URL;
if (!base) {
  console.error('Chýba VITE_BASE_URL v súbore .env');
  process.exit(1);
}
if (!base.endsWith('/')) base += '/';

mkdirSync('qr', { recursive: true });
const opts = { margin: 2, width: 1024, color: { dark: '#000000', light: '#ffffff' } };
for (const l of LETTERS) {
  const url = `${base}#/pismeno/${l.id}`;
  writeFileSync(`qr/qr-${l.id}.svg`, await QRCode.toString(url, { ...opts, type: 'svg' }));
  await QRCode.toFile(`qr/qr-${l.id}.png`, url, opts);
  console.log(`✔ ${l.upper}: ${url}`);
}
console.log('Hotovo – QR kódy sú v priečinku qr/');
