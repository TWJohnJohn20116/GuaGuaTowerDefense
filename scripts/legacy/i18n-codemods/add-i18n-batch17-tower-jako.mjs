/** batch17：覆寫 ja/ko modEditorExt 塔 UI key */
import fs from 'fs';
import path from 'path';
import { TOWER_KEYS, getTowerUi } from './i18n/batch17ModEditorTowerBundle.mjs';

const ROOT = path.resolve('src/i18n/locales');

for (const loc of ['ja', 'ko']) {
  const file = path.join(ROOT, `${loc}.ts`);
  let s = fs.readFileSync(file, 'utf8');
  const data = getTowerUi(loc);
  let n = 0;
  for (const k of TOWER_KEYS) {
    const re = new RegExp(`(\\s+${k}: )(?:'[^']*'|"[^"]*"),`);
    const next = s.replace(re, `$1${JSON.stringify(data[k])},`);
    if (next !== s) {
      n++;
      s = next;
    }
  }
  fs.writeFileSync(file, s, 'utf8');
  console.log('tower jako', loc, n);
}

console.log('Done tower ja/ko replace');
