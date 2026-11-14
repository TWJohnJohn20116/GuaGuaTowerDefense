import fs from 'fs';
import path from 'path';

const vals = {
  zh: '點選左側成就卡\n查看條件與獎勵',
  en: 'Select an achievement\nto view conditions & rewards',
};

for (const loc of ['zh-TW', 'zh-CN', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru', 'pt']) {
  const file = path.join('src/i18n/locales', `${loc}.ts`);
  let s = fs.readFileSync(file, 'utf8');
  const v = loc.startsWith('zh') ? vals.zh : vals.en;
  s = s.replace(/emptyHint: "[^"]*",/, `emptyHint: ${JSON.stringify(v)},`);
  fs.writeFileSync(file, s, 'utf8');
  console.log('fixed', loc);
}
