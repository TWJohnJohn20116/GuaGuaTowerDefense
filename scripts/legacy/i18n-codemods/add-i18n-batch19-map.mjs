/** batch19：注入 mapFs* / lp* key */
import fs from 'fs';
import path from 'path';
import { formatMapLpLines, MAP_LP_KEYS } from './i18n/batch19ModEditorMapBundle.mjs';

const ROOT = path.resolve('src/i18n/locales');

for (const loc of ['zh-TW', 'zh-CN', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru', 'pt']) {
  const file = path.join(ROOT, `${loc}.ts`);
  let s = fs.readFileSync(file, 'utf8');
  if (/\bmapFsToolSelect:/.test(s)) {
    console.log('skip map', loc);
    continue;
  }
  const lines = formatMapLpLines(loc);
  const anchor = /\bm3dShapeTailFin:/.test(s)
    ? /(\s+m3dShapeTailFin: [^,\n]+,)(\r?\n\s+\},)/
    : /(\s+m3dTplBlank: [^,\n]+,)(\r?\n\s+\},)/;
  s = s.replace(anchor, `$1\n${lines}$2`);
  fs.writeFileSync(file, s, 'utf8');
  console.log('map lp', loc);
}

const idx = path.resolve('src/i18n/index.ts');
let ix = fs.readFileSync(idx, 'utf8');
if (!/\bmapFsToolSelect:/.test(ix)) {
  const typeLines = MAP_LP_KEYS.map((k) => `    ${k}: string;`).join('\n');
  const anchor = /\bm3dShapeTailFin:/.test(ix)
    ? /(\s+m3dShapeTailFin: string;)/
    : /(\s+m3dTplBlank: string;)/;
  ix = ix.replace(anchor, `$1\n${typeLines}`);
  fs.writeFileSync(idx, ix, 'utf8');
  console.log('index map lp types');
}

console.log('Done map lp');
