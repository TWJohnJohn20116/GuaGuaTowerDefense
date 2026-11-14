/** batch23：注入 validation / wave / selector / json key */
import fs from 'fs';
import path from 'path';
import { BATCH23_KEYS, formatBatch23Lines } from './i18n/batch23Extras.mjs';

const ROOT = path.resolve('src/i18n/locales');

for (const loc of ['zh-TW', 'zh-CN', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru', 'pt']) {
  const file = path.join(ROOT, `${loc}.ts`);
  let s = fs.readFileSync(file, 'utf8');
  if (/\bvalErrorsTitle:/.test(s)) {
    console.log('skip batch23', loc);
    continue;
  }
  const lines = formatBatch23Lines(loc);
  const anchor = /\bbalBadgeTitle:/.test(s)
    ? /(\s+balBadgeTitle: [^,\n]+,)(\r?\n\s+\},)/
    : /(\s+wvBatchSelect: [^,\n]+,)(\r?\n\s+\},)/;
  if (!anchor.test(s)) {
    console.warn('no anchor', loc);
    continue;
  }
  s = s.replace(anchor, (_m, head, tail) => `${head}\n${lines}\n${tail}`);
  fs.writeFileSync(file, s, 'utf8');
  console.log('batch23', loc);
}

const idx = path.resolve('src/i18n/index.ts');
let ix = fs.readFileSync(idx, 'utf8');
if (!/\bvalErrorsTitle:/.test(ix)) {
  const typeLines = BATCH23_KEYS.map((k) => `    ${k}: string;`).join('\n');
  const anchor = /\bbalBadgeTitle: string;/.test(ix)
    ? /(\s+balBadgeTitle: string;)/
    : /(\s+wvBatchSelect: string;)/;
  ix = ix.replace(anchor, `$1\n${typeLines}`);
  fs.writeFileSync(idx, ix, 'utf8');
  console.log('index batch23 types');
}

console.log('Done batch23 extras');
