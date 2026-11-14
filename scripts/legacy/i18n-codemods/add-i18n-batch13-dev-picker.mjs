/** batch13：dev-panel 選擇器 key 注入各 locale */
import fs from 'fs';
import path from 'path';
import { getDevPickerUi, PICKER_KEYS } from './i18n/batch13DevPickerBundle.mjs';

const ROOT = path.resolve('src/i18n/locales');

for (const loc of ['zh-TW', 'zh-CN', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru', 'pt']) {
  const file = path.join(ROOT, `${loc}.ts`);
  let s = fs.readFileSync(file, 'utf8');
  if (s.includes('pickerEnemyFooter:')) {
    console.log('skip', loc);
    continue;
  }
  const ui = getDevPickerUi(loc);
  const lines = PICKER_KEYS.map((k) => `      ${k}: ${JSON.stringify(ui[k])},`).join('\n');
  s = s.replace(/(\s+infoLiveHint: [^,\n]+,)(\r?\n\s+\},)/, `$1\n${lines}$2`);
  fs.writeFileSync(file, s, 'utf8');
  console.log('dev picker', loc);
}

console.log('Done dev picker keys');
