/** 移除 batch9 誤插入 tutorial 的 orphan skillGuides 陣列片段 */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('src/i18n/locales');
const locales = ['zh-TW', 'zh-CN', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru', 'pt'];

const ORPHAN = /\r?\n\s+frozenTime: \[[\s\S]*?\r?\n\s+warpTrap: \[[^\]]+\],\r?\n\s+\},\r?\n(\s+yes:)/;

for (const loc of locales) {
  const file = path.join(ROOT, `${loc}.ts`);
  let s = fs.readFileSync(file, 'utf8');
  if (!ORPHAN.test(s)) {
    console.log('skip', loc);
    continue;
  }
  s = s.replace(ORPHAN, '\n$1');
  fs.writeFileSync(file, s, 'utf8');
  console.log('fixed orphan skillGuides', loc);
}

console.log('Done fix-batch9-orphan');
