/** batch18：注入 modEditorExt 3D 編輯器 key */
import fs from 'fs';
import path from 'path';
import { formatM3dUiLines, M3D_UI_KEYS } from './i18n/batch18ModEditorM3dBundle.mjs';

const ROOT = path.resolve('src/i18n/locales');

for (const loc of ['zh-TW', 'zh-CN', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru', 'pt']) {
  const file = path.join(ROOT, `${loc}.ts`);
  let s = fs.readFileSync(file, 'utf8');
  if (/\bm3dTitle:/.test(s)) {
    console.log('skip', loc);
    continue;
  }
  const lines = formatM3dUiLines(loc);
  s = s.replace(/(\s+twProjectileSize: [^,\n]+,)(\r?\n\s+\},)/, `$1\n${lines}$2`);
  fs.writeFileSync(file, s, 'utf8');
  console.log('m3d ui', loc);
}

const idx = path.resolve('src/i18n/index.ts');
let ix = fs.readFileSync(idx, 'utf8');
if (!/\bm3dTitle:/.test(ix)) {
  const typeLines = M3D_UI_KEYS.map((k) => `    ${k}: string;`).join('\n');
  ix = ix.replace(/(\s+twProjectileSize: string;)/, `$1\n${typeLines}`);
  fs.writeFileSync(idx, ix, 'utf8');
  console.log('index m3d types');
}

console.log('Done m3d ui keys');
