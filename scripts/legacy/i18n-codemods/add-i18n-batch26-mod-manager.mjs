/** batch26：注入 modManager 完整區塊至 9 語系（zh-TW 已有則跳過） */
import fs from 'fs';
import path from 'path';
import { formatModManagerBlock } from './i18n/batch26ModManagerBundle.mjs';

const ROOT = path.resolve('src/i18n/locales');
const locales = ['zh-CN', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru', 'pt'];

for (const loc of locales) {
  const file = path.join(ROOT, `${loc}.ts`);
  let s = fs.readFileSync(file, 'utf8');
  if (/\n  modManager: \{/.test(s)) {
    console.log('skip', loc, '(modManager block exists)');
    continue;
  }
  const block = formatModManagerBlock(loc);
  const anchor = /(\n  memorial: \{)/;
  if (!anchor.test(s)) {
    console.warn('no memorial anchor', loc);
    continue;
  }
  s = s.replace(anchor, `\n${block}$1`);
  fs.writeFileSync(file, s, 'utf8');
  console.log('modManager', loc);
}

console.log('Done batch26 modManager');
