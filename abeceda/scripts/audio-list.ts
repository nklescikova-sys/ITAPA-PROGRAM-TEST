/**
 * Vypíše zoznam všetkých viet a slov na nahranie (Markdown tabuľka).
 * Spusti: npm run nahravky
 */
import { LETTERS } from '../src/content/letters';
import {
  PHRASES, sayExtraOffer, sayFact, sayIntro, sayMoved, sayName, sayNameEn, sayQuestion, sayTraceLower, sayTraceUpper,
} from '../src/content/phrases';
import type { Say } from '../src/content/types';

const rows: Say[] = [...Object.values(PHRASES)];
for (const l of LETTERS) {
  const a = l.animal;
  rows.push(sayIntro(l.upper, a), sayTraceUpper(l.upper), sayTraceLower(l.lower), sayQuestion(l), sayName(a), sayFact(a), sayMoved(a));
  if (l.extra) {
    const e = l.extra.animal;
    rows.push(sayExtraOffer(l)!, sayTraceUpper(l.extra.upper), sayTraceLower(l.extra.lower), sayName(e), sayFact(e), sayMoved(e));
  }
}
const en: Say[] = LETTERS.flatMap((l) => (l.extra ? [l.animal, l.extra.animal] : [l.animal])).map(sayNameEn);

const seen = new Set<string>();
const table = (list: Say[]) =>
  list
    .filter((r) => (seen.has(r.audio!) ? false : (seen.add(r.audio!), true)))
    .map((r) => `| \`public/${r.audio}\` | ${r.text} |`)
    .join('\n');

console.log('### Slovensky\n\n| Súbor | Text |\n| --- | --- |\n' + table(rows));
console.log('\n### Anglicky\n\n| Súbor | Slovo |\n| --- | --- |\n' + table(en));
