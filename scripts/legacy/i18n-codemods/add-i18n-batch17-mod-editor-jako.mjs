/** batch17：覆寫 ja/ko modEditorExt 敵人能力 key */
import fs from 'fs';
import path from 'path';
import { MOD_EDITOR_ENEMY_KEYS, getModEditorEnemy } from './i18n/batch16ModEditorEnemyBundle.mjs';

const ROOT = path.resolve('src/i18n/locales');

for (const loc of ['ja', 'ko']) {
  const file = path.join(ROOT, `${loc}.ts`);
  let s = fs.readFileSync(file, 'utf8');
  const data = getModEditorEnemy(loc);
  let n = 0;
  for (const k of MOD_EDITOR_ENEMY_KEYS) {
    const re = new RegExp(`(\\s+${k}: )(?:'[^']*'|"[^"]*"),`);
    const next = s.replace(re, `$1${JSON.stringify(data[k])},`);
    if (next !== s) {
      n++;
      s = next;
    }
  }
  fs.writeFileSync(file, s, 'utf8');
  console.log('mod editor jako', loc, n);
}

console.log('Done mod editor ja/ko replace');
