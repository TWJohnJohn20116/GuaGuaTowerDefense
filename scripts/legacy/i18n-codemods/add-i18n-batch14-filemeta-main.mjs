/** batch14：encyclopedia.fileMeta 主檔注入各 locale */
import fs from 'fs';
import path from 'path';
import { formatFileMetaBlock } from './i18n/batch14FileMetaBundle.mjs';

const ROOT = path.resolve('src/i18n/locales');

for (const loc of ['zh-TW', 'zh-CN', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru', 'pt']) {
  const file = path.join(ROOT, `${loc}.ts`);
  let s = fs.readFileSync(file, 'utf8');
  if (s.includes('fileMeta:')) {
    console.log('skip', loc);
    continue;
  }
  const block = formatFileMetaBlock(loc);
  s = s.replace(/(\s+effects: \{[\s\S]*?\n\s+\},)(\r?\n\s+fileMetaExtra:)/, `$1\n${block}$2`);
  fs.writeFileSync(file, s, 'utf8');
  console.log('fileMeta main', loc);
}

console.log('Done fileMeta main');
