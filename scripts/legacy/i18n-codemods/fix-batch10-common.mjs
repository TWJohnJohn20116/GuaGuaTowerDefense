/** 修復 batch10 誤插入 common.export 的語法錯誤 */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('src/i18n/locales');
const locales = ['zh-TW', 'zh-CN', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru', 'pt'];

for (const loc of locales) {
  const file = path.join(ROOT, `${loc}.ts`);
  let s = fs.readFileSync(file, 'utf8');
  const broken = /export: \n\s+treeCollapse: ([^,]+),\n\s+treeExpand: ([^,]+),\n\s+none: ([^,]+),('[^']*'|"[^"]*"),/;
  if (!broken.test(s)) continue;
  s = s.replace(
    broken,
    'export: $4,\n    treeCollapse: $1,\n    treeExpand: $2,\n    none: $3,',
  );
  fs.writeFileSync(file, s, 'utf8');
  console.log('fixed common', loc);
}

console.log('Done fix-batch10-common');
