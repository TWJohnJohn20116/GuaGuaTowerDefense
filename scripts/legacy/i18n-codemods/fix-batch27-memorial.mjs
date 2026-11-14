/** 清理 memorial / replay 誤注入的 selectHint */
import fs from 'fs';
import path from 'path';
import { formatBatch27MemDetailLines } from './i18n/batch27Extras.mjs';

const ROOT = path.resolve('src/i18n/locales');
const locales = ['zh-TW', 'zh-CN', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru', 'pt'];

const HINT_BLOCK = /\s+selectHintLine1:[^\n]+\n\s+selectHintLine2:[^\n]+\n/g;

for (const loc of locales) {
  const file = path.join(ROOT, `${loc}.ts`);
  let s = fs.readFileSync(file, 'utf8');

  // replay 區塊誤注入
  s = s.replace(/(\s+eventVictory: [^,\n]+,)(?:\s+selectHintLine1:[^\n]+\n\s+selectHintLine2:[^\n]+\n)+/g, '$1\n');

  // memorial 頂層誤注入（detail 子物件之外）
  s = s.replace(
    /(memorial: \{[\s\S]*?)(?:\s+selectHintLine1:[^\n]+\n\s+selectHintLine2:[^\n]+\n)+(\s+backToList:)/,
    '$1$2',
  );

  // zh-TW：確保 detail 內有 hints
  if (loc === 'zh-TW' && !/memorial:[\s\S]*detail:[\s\S]*selectHintLine1:/.test(s)) {
    const lines = formatBatch27MemDetailLines(loc);
    s = s.replace(/(memorial: \{[\s\S]*?\s+detail: \{)(\r?\n\s+backToList:)/, `$1\n${lines}$2`);
    console.log('zh-TW memorial detail inject');
  }

  fs.writeFileSync(file, s, 'utf8');
  console.log('cleaned', loc);
}

console.log('Done memorial cleanup');
