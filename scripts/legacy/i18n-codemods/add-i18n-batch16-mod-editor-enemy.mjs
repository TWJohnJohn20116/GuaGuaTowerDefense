/** batch16：Mod 編輯器敵人 i18n 注入 modEditorExt */
import fs from 'fs';
import path from 'path';
import { formatModEditorEnemyLines } from './i18n/batch16ModEditorEnemyBundle.mjs';

const ROOT = path.resolve('src/i18n/locales');

for (const loc of ['zh-TW', 'zh-CN', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru', 'pt']) {
  const file = path.join(ROOT, `${loc}.ts`);
  let s = fs.readFileSync(file, 'utf8');
  if (s.includes('eaTitle:')) {
    console.log('skip', loc);
    continue;
  }
  const lines = formatModEditorEnemyLines(loc);
  s = s.replace(/(\s+exportMaps: [^,\n]+,)(\r?\n\s+\},)/, `$1\n${lines}$2`);
  fs.writeFileSync(file, s, 'utf8');
  console.log('mod editor enemy', loc);
}

console.log('Done mod editor enemy keys');
