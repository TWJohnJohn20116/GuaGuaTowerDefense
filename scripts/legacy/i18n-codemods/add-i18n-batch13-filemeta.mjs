/** batch13：encyclopedia.fileMetaExtra 注入各 locale */
import fs from 'fs';
import path from 'path';
import { formatFileMetaExtraBlock } from './i18n/batch13FileMetaExtraBundle.mjs';

const ROOT = path.resolve('src/i18n/locales');

for (const loc of ['zh-TW', 'zh-CN', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru', 'pt']) {
  const file = path.join(ROOT, `${loc}.ts`);
  let s = fs.readFileSync(file, 'utf8');
  if (s.includes('fileMetaExtra:')) {
    console.log('skip', loc);
    continue;
  }
  const block = formatFileMetaExtraBlock(loc);
  s = s.replace(/(\s+effects: \{[\s\S]*?\n\s+\},)(\r?\n\s+skillTips:)/, `$1\n${block}$2`);
  fs.writeFileSync(file, s, 'utf8');
  console.log('fileMetaExtra', loc);
}

console.log('Done fileMetaExtra');
