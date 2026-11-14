/** batch21：注入 map-fs / balance / sidebar key */
import fs from 'fs';
import path from 'path';
import { BATCH21_KEYS, formatBatch21Lines } from './i18n/batch21Extras.mjs';

const ROOT = path.resolve('src/i18n/locales');

for (const loc of ['zh-TW', 'zh-CN', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru', 'pt']) {
  const file = path.join(ROOT, `${loc}.ts`);
  let s = fs.readFileSync(file, 'utf8');
  if (/\bmapFsToolDupBlocked:/.test(s)) {
    console.log('skip batch21', loc);
    continue;
  }
  const lines = formatBatch21Lines(loc);
  const anchor = /\bwvBatchSelect:/.test(s)
    ? /(\s+wvBatchSelect: [^,\n]+,)(\r?\n\s+\},)/
    : /(\s+lpToggleCycle: [^,\n]+,[\s\S]*?\s+wvDragSort: [^,\n]+,)(\r?\n\s+\},)/;
  if (!anchor.test(s)) {
    console.warn('no anchor', loc);
    continue;
  }
  s = s.replace(anchor, (_m, head, tail) => `${head}\n${lines}\n${tail}`);
  fs.writeFileSync(file, s, 'utf8');
  console.log('batch21', loc);
}

const idx = path.resolve('src/i18n/index.ts');
let ix = fs.readFileSync(idx, 'utf8');
if (!/\bmapFsToolDupBlocked:/.test(ix)) {
  const typeLines = BATCH21_KEYS.map((k) => `    ${k}: string;`).join('\n');
  const anchor = /\bwvBatchSelect:/.test(ix)
    ? /(\s+wvBatchSelect: string;)/
    : /(\s+lpToggleCycle: string;)/;
  ix = ix.replace(anchor, `$1\n${typeLines}`);
  fs.writeFileSync(idx, ix, 'utf8');
  console.log('index batch21 types');
}

console.log('Done batch21 extras');
