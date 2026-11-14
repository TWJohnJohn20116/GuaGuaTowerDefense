/** batch19：注入 m3dShape* 部件名稱 key */
import fs from 'fs';
import path from 'path';
import { formatShapeLines, SHAPE_KEYS } from './i18n/batch19ShapeBundle.mjs';

const ROOT = path.resolve('src/i18n/locales');

for (const loc of ['zh-TW', 'zh-CN', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru', 'pt']) {
  const file = path.join(ROOT, `${loc}.ts`);
  let s = fs.readFileSync(file, 'utf8');
  if (/\bm3dShapeBase:/.test(s)) {
    console.log('skip shapes', loc);
    continue;
  }
  const lines = formatShapeLines(loc);
  s = s.replace(/(\s+m3dTplBlank: [^,\n]+,)(\r?\n\s+\},)/, `$1\n${lines}$2`);
  fs.writeFileSync(file, s, 'utf8');
  console.log('shapes', loc);
}

const idx = path.resolve('src/i18n/index.ts');
let ix = fs.readFileSync(idx, 'utf8');
if (!/\bm3dShapeBase:/.test(ix)) {
  const typeLines = SHAPE_KEYS.map((k) => `    ${k}: string;`).join('\n');
  ix = ix.replace(/(\s+m3dTplBlank: string;)/, `$1\n${typeLines}`);
  fs.writeFileSync(idx, ix, 'utf8');
  console.log('index shape types');
}

console.log('Done shapes');
