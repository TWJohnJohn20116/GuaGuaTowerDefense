/** 生成 ja.ts statistics + mutatorChallenge 區塊 */
import fs from 'fs';
import path from 'path';
import { formatJaLocaleFile } from './i18n/batch30JaBundle.mjs';

const out = path.resolve('src/i18n/locales/ja.ts');
fs.writeFileSync(out, formatJaLocaleFile(), 'utf8');
console.log('Wrote', out);
