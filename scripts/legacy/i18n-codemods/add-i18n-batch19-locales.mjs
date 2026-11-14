/** batch19：覆寫 de/fr/es/ru/pt modEditorExt 敵人+塔 key */
import fs from 'fs';
import path from 'path';
import { MOD_EDITOR_ENEMY_KEYS } from './i18n/batch16ModEditorEnemyBundle.mjs';
import { TOWER_KEYS } from './i18n/batch17ModEditorTowerBundle.mjs';
import { ENEMY_LOCALES, TOWER_LOCALES } from './i18n/batch19ModEditorEnemyLocales.mjs';

const ROOT = path.resolve('src/i18n/locales');

function patchKeys(file, loc, keys, data) {
  let s = fs.readFileSync(file, 'utf8');
  let n = 0;
  const locale = data[loc];
  if (!locale) return 0;
  for (const k of keys) {
    if (locale[k] == null) continue;
    const re = new RegExp(`(\\s+${k}: )(?:'[^']*'|"[^"]*"),`);
    const next = s.replace(re, `$1${JSON.stringify(locale[k])},`);
    if (next !== s) {
      n++;
      s = next;
    }
  }
  fs.writeFileSync(file, s, 'utf8');
  return n;
}

for (const loc of ['de', 'fr', 'es', 'ru', 'pt']) {
  const file = path.join(ROOT, `${loc}.ts`);
  const ne = patchKeys(file, loc, MOD_EDITOR_ENEMY_KEYS, ENEMY_LOCALES);
  const nt = patchKeys(file, loc, TOWER_KEYS, TOWER_LOCALES);
  console.log('locales', loc, 'enemy', ne, 'tower', nt);
}

console.log('Done batch19 locales');
