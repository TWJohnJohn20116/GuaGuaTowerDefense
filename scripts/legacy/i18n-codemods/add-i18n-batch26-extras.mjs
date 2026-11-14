/** batch26：注入 encyclopedia.totalActiveSkillsCount */
import fs from 'fs';
import path from 'path';
import { BATCH26_ENC_KEYS, formatBatch26EncLines } from './i18n/batch26Extras.mjs';

const ROOT = path.resolve('src/i18n/locales');
const locales = ['zh-TW', 'zh-CN', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru', 'pt'];

for (const loc of locales) {
  const file = path.join(ROOT, `${loc}.ts`);
  let s = fs.readFileSync(file, 'utf8');
  if (/\btotalActiveSkillsCount:/.test(s)) {
    console.log('skip enc', loc);
    continue;
  }
  const lines = formatBatch26EncLines(loc);
  const anchor = /(\s+totalEffectsCount: [^,\n]+,)/;
  if (!anchor.test(s)) {
    console.warn('no enc anchor', loc);
    continue;
  }
  s = s.replace(anchor, `$1\n${lines}`);
  fs.writeFileSync(file, s, 'utf8');
  console.log('enc', loc);
}

const idx = path.resolve('src/i18n/index.ts');
let ix = fs.readFileSync(idx, 'utf8');
if (!/\btotalActiveSkillsCount:/.test(ix)) {
  const types = BATCH26_ENC_KEYS.map((k) => `    ${k}: string;`).join('\n');
  ix = ix.replace(/(\s+totalEffectsCount: string;)/, `$1\n${types}`);
  fs.writeFileSync(idx, ix, 'utf8');
  console.log('index enc types');
}

console.log('Done batch26 extras');
