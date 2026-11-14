/** batch22：注入 map-panel / balance-badge key */
import fs from 'fs';
import path from 'path';
import { BATCH22_KEYS, formatBatch22Lines } from './i18n/batch22Extras.mjs';

const ROOT = path.resolve('src/i18n/locales');

for (const loc of ['zh-TW', 'zh-CN', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru', 'pt']) {
  const file = path.join(ROOT, `${loc}.ts`);
  let s = fs.readFileSync(file, 'utf8');
  if (/\bmapEmptyPath:/.test(s)) {
    console.log('skip batch22', loc);
    continue;
  }
  const lines = formatBatch22Lines(loc);
  const anchor = /\bbalSuggestPhaseNoAoe:/.test(s)
    ? /(\s+balSuggestPhaseNoAoe: [^,\n]+,)(\r?\n\s+\},)/
    : /(\s+wvBatchSelect: [^,\n]+,)(\r?\n\s+\},)/;
  if (!anchor.test(s)) {
    console.warn('no anchor', loc);
    continue;
  }
  s = s.replace(anchor, (_m, head, tail) => `${head}\n${lines}\n${tail}`);
  fs.writeFileSync(file, s, 'utf8');
  console.log('batch22', loc);
}

const idx = path.resolve('src/i18n/index.ts');
let ix = fs.readFileSync(idx, 'utf8');
if (!/\bmapEmptyPath:/.test(ix)) {
  const typeLines = BATCH22_KEYS.map((k) => `    ${k}: string;`).join('\n');
  const anchor = /\bbalSuggestPhaseNoAoe:/.test(ix)
    ? /(\s+balSuggestPhaseNoAoe: string;)/
    : /(\s+wvBatchSelect: string;)/;
  ix = ix.replace(anchor, `$1\n${typeLines}`);
  fs.writeFileSync(idx, ix, 'utf8');
  console.log('index batch22 types');
}

console.log('Done batch22 extras');
