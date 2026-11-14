/** batch17：確認 fileMetaExtra 各語系 key 完整 */
import fs from 'fs';
import path from 'path';
import { FILE_META_EXTRA_KEYS } from './i18n/batch13FileMetaExtraBundle.mjs';

const ROOT = path.resolve('src/i18n/locales');
const keys = Object.keys(FILE_META_EXTRA_KEYS);

for (const loc of ['fr', 'es', 'ru', 'pt', 'ko', 'ja', 'de']) {
  const file = path.join(ROOT, `${loc}.ts`);
  const s = fs.readFileSync(file, 'utf8');
  const missing = keys.filter((k) => !s.includes(`${k}:`));
  const enLike = keys.filter((k) => {
    const m = s.match(new RegExp(`${k}: "([^"]+)"`));
    return m && /^(Progress achievements|Achievement hub|Campaign chapter)/.test(m[1]);
  });
  console.log(loc, 'missing:', missing.length, 'enLike:', enLike.length);
}

console.log('Done fileMetaExtra verify');
