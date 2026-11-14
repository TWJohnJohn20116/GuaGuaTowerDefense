/** batch24：注入 live-preview / validation / icon-editor key */
import fs from 'fs';
import path from 'path';
import { BATCH24_KEYS, formatBatch24Lines } from './i18n/batch24Extras.mjs';

const ROOT = path.resolve('src/i18n/locales');

for (const loc of ['zh-TW', 'zh-CN', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru', 'pt']) {
  const file = path.join(ROOT, `${loc}.ts`);
  let s = fs.readFileSync(file, 'utf8');
  if (/\bvalMissingModId:/.test(s)) {
    console.log('skip batch24', loc);
    continue;
  }
  const lines = formatBatch24Lines(loc);
  const anchor = /\bjsonPasteHint:/.test(s)
    ? /(\s+jsonPasteHint: [^,\n]+,)(\r?\n\s+\},)/
    : /(\s+balBadgeTitle: [^,\n]+,)(\r?\n\s+\},)/;
  if (!anchor.test(s)) {
    console.warn('no anchor', loc);
    continue;
  }
  s = s.replace(anchor, (_m, head, tail) => `${head}\n${lines}\n${tail}`);
  fs.writeFileSync(file, s, 'utf8');
  console.log('batch24', loc);
}

const idx = path.resolve('src/i18n/index.ts');
let ix = fs.readFileSync(idx, 'utf8');
if (!/\bvalMissingModId:/.test(ix)) {
  const typeLines = BATCH24_KEYS.map((k) => `    ${k}: string;`).join('\n');
  const anchor = /\bjsonPasteHint: string;/.test(ix)
    ? /(\s+jsonPasteHint: string;)/
    : /(\s+balBadgeTitle: string;)/;
  ix = ix.replace(anchor, `$1\n${typeLines}`);
  fs.writeFileSync(idx, ix, 'utf8');
  console.log('index batch24 types');
}

console.log('Done batch24 extras');
