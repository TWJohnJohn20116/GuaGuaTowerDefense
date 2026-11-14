/** batch17：為缺 eaTitle 的語系注入 modEditorExt 敵人+塔 key */
import fs from 'fs';
import path from 'path';
import { formatModEditorEnemyLines } from './i18n/batch16ModEditorEnemyBundle.mjs';
import { formatTowerUiLines } from './i18n/batch17ModEditorTowerBundle.mjs';

const ROOT = path.resolve('src/i18n/locales');
const LOCS = ['ja', 'ko', 'fr', 'de', 'es', 'ru', 'pt'];

for (const loc of LOCS) {
  const file = path.join(ROOT, `${loc}.ts`);
  let s = fs.readFileSync(file, 'utf8');
  if (s.includes('eaTitle:')) {
    console.log('skip', loc);
    continue;
  }
  const block = `${formatModEditorEnemyLines(loc)}\n${formatTowerUiLines(loc)}`;
  const re = /(\s+waveMixed: [^,\n]+,)(\r?\n\s+\},)/;
  if (!re.test(s)) {
    console.warn('no anchor', loc);
    continue;
  }
  s = s.replace(re, `$1\n${block}$2`);
  fs.writeFileSync(file, s, 'utf8');
  console.log('injected', loc);
}

console.log('Done missing mod editor keys');
