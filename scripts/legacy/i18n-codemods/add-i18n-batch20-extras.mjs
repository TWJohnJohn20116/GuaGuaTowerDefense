/** batch20：注入 lpToggle* / wvBatch* / LivePreview 剩餘 key */
import fs from 'fs';
import path from 'path';
import { BATCH20_KEYS, formatBatch20Lines } from './i18n/batch20Extras.mjs';

const ROOT = path.resolve('src/i18n/locales');

for (const loc of ['zh-TW', 'zh-CN', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru', 'pt']) {
  const file = path.join(ROOT, `${loc}.ts`);
  let s = fs.readFileSync(file, 'utf8');
  if (/\blpToggleCycle:/.test(s)) {
    console.log('skip batch20', loc);
    continue;
  }
  const lines = formatBatch20Lines(loc);
  const anchor = /\bmapFsHistEdit:/.test(s)
    ? /(\s+mapFsHistEdit: [^,\n]+,)(\r?\n\s+\},)/
    : /(\s+lpWaveLockHint: [^,\n]+,)(\r?\n\s+\},)/;
  if (!anchor.test(s)) {
    console.warn('no anchor', loc);
    continue;
  }
  s = s.replace(anchor, `$1\n${lines}$2`);
  fs.writeFileSync(file, s, 'utf8');
  console.log('batch20', loc);
}

const idx = path.resolve('src/i18n/index.ts');
let ix = fs.readFileSync(idx, 'utf8');
if (!/\blpToggleCycle:/.test(ix)) {
  const typeLines = BATCH20_KEYS.map((k) => `    ${k}: string;`).join('\n');
  const anchor = /\bmapFsHistEdit:/.test(ix)
    ? /(\s+mapFsHistEdit: string;)/
    : /(\s+lpWaveLockHint: string;)/;
  ix = ix.replace(anchor, `$1\n${typeLines}`);
  fs.writeFileSync(idx, ix, 'utf8');
  console.log('index batch20 types');
}

console.log('Done batch20 extras');
