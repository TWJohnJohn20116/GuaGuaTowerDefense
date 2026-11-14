/** batch17：Mod 編輯器塔 UI i18n 注入 modEditorExt */
import fs from 'fs';
import path from 'path';
import { formatTowerUiLines, TOWER_KEYS } from './i18n/batch17ModEditorTowerBundle.mjs';

const ROOT = path.resolve('src/i18n/locales');

for (const loc of ['zh-TW', 'zh-CN', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru', 'pt']) {
  const file = path.join(ROOT, `${loc}.ts`);
  let s = fs.readFileSync(file, 'utf8');
  if (s.includes('tmBasic:')) {
    console.log('skip inject', loc);
    continue;
  }
  const lines = formatTowerUiLines(loc);
  s = s.replace(/(\s+emBomberDesc: [^,\n]+,)(\r?\n\s+\},)/, `$1\n${lines}$2`);
  fs.writeFileSync(file, s, 'utf8');
  console.log('tower ui', loc);
}

// index.ts 型別
const idx = path.resolve('src/i18n/index.ts');
let ix = fs.readFileSync(idx, 'utf8');
if (!ix.includes('tmBasic:')) {
  const typeLines = TOWER_KEYS.map((k) => `    ${k}: string;`).join('\n');
  ix = ix.replace(/(\s+emBomberDesc: string;)/, `$1\n${typeLines}`);
  fs.writeFileSync(idx, ix, 'utf8');
  console.log('index types');
}

console.log('Done tower ui keys');
