/** batch19：覆寫 encyclopedia.enemyGuides de/fr/es/ru/pt */
import fs from 'fs';
import path from 'path';
import { ENEMY_IDS, formatEnemyGuidesBlock } from './i18n/batch19EncEnemyGuides.mjs';

const ROOT = path.resolve('src/i18n/locales');

for (const loc of ['de', 'fr', 'es', 'ru', 'pt']) {
  const file = path.join(ROOT, `${loc}.ts`);
  let s = fs.readFileSync(file, 'utf8');
  const block = formatEnemyGuidesBlock(loc);
  const re = /(\s+enemyGuides: \{)[\s\S]*?(\r?\n\s+\},\r?\n\s+modContent:)/;
  if (!re.test(s)) {
    console.warn('no anchor', loc);
    continue;
  }
  s = s.replace(re, (_m, head, tail) => `${head}\n${block}\n${tail}`);
  fs.writeFileSync(file, s, 'utf8');
  console.log('enemyGuides', loc);
}

console.log('Done enc enemy guides');
