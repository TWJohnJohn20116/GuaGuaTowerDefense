/** 移除 batch19 注入後重複的 lp* key（保留 mapFs*） */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('src/i18n/locales');
const re = /(    mapFsHistEdit: [^\n]+\n)(    lpFxSplash:[\s\S]*?    lpWaveLockHint: [^\n]+\n)/;

for (const loc of ['zh-TW', 'zh-CN', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru', 'pt']) {
  const file = path.join(ROOT, `${loc}.ts`);
  let s = fs.readFileSync(file, 'utf8');
  if (!re.test(s)) {
    console.log('skip', loc);
    continue;
  }
  s = s.replace(re, '$1');
  fs.writeFileSync(file, s, 'utf8');
  console.log('deduped', loc);
}
