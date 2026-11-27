/**
 * Vygeneruje zástupné obrázky zvieratiek (farebný kruh + emoji + názov) do public/images.
 * Spusti: npx tsx scripts/placeholders.ts
 * Keď budete mať skutočné obrázky, tento skript už netreba – len nahraďte súbory.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { LETTERS } from '../src/content/letters';

mkdirSync('public/images', { recursive: true });
const animals = LETTERS.flatMap((l) => (l.extra ? [l.animal, l.extra.animal] : [l.animal]));
for (const a of animals) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <circle cx="100" cy="100" r="98" fill="${a.color}"/>
  <text x="100" y="112" font-size="96" text-anchor="middle" dominant-baseline="middle">${a.emoji}</text>
  <text x="100" y="178" font-size="22" font-family="sans-serif" font-weight="700" fill="#4a5a44" text-anchor="middle">${a.name}</text>
</svg>
`;
  const file = a.image.replace(/^images\//, 'public/images/');
  writeFileSync(file, svg);
  console.log('✔', file);
}
