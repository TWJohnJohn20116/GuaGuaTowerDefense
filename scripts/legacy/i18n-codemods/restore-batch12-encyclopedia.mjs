/**
 * 還原頂層 encyclopedia 區塊（core + orphan）
 */
import fs from 'fs';
import path from 'path';
import { formatTsObject } from './i18n/formatTsObject.mjs';
import { coreShell } from './fix-batch12-encyclopedia.mjs';
import { getEncyclopediaOrphan } from './i18n/encyclopediaOrphanBundle.mjs';

const ROOT = path.resolve('src/i18n/locales');
const locales = ['zh-TW', 'zh-CN', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru', 'pt'];

for (const loc of locales) {
  const file = path.join(ROOT, `${loc}.ts`);
  let s = fs.readFileSync(file, 'utf8');

  if (s.includes('\n  encyclopedia: {')) {
    console.log('skip', loc, 'has encyclopedia');
    continue;
  }

  const marker = '\n  changelog: {';
  const idx = s.indexOf(marker);
  if (idx < 0) {
    console.log('skip', loc, 'no changelog marker');
    continue;
  }

  const core = { ...coreShell(loc), ...getEncyclopediaOrphan(loc) };
  const encBody = formatTsObject(core, 4);
  const encBlock = `  encyclopedia: {\n${encBody}\n  },\n\n`;

  s = `${s.slice(0, idx)}\n${encBlock}${s.slice(idx + 1)}`;
  fs.writeFileSync(file, s, 'utf8');
  console.log('restored encyclopedia', loc);
}

console.log('Done restore-batch12-encyclopedia');
