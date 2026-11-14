/** 修復 batch10 誤插入 dailyChallenge keys 到 achievements.observatory */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('src/i18n/locales');
const locales = ['zh-TW', 'zh-CN', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru', 'pt'];

for (const loc of locales) {
  const file = path.join(ROOT, `${loc}.ts`);
  let s = fs.readFileSync(file, 'utf8');
  const marker = '\n    tabToday:';
  const idx = s.indexOf(marker);
  if (idx < 0 || !s.slice(idx, idx + 400).includes('achievementDone:')) {
    console.log('skip', loc);
    continue;
  }

  const end = s.indexOf('\n      achievementDone:', idx);
  if (end < 0) {
    console.log('skip no end', loc);
    continue;
  }

  const block = s.slice(idx + 1, end);
  const tabToday = block.match(/tabToday: ([^,]+),/)?.[1];
  const todayHint = block.match(/todayHint: ([^,]+),/)?.[1];
  const historyHint = block.match(/historyHint: ([^,]+),/)?.[1];
  if (!tabToday || !todayHint || !historyHint) {
    console.log('skip parse', loc);
    continue;
  }

  s = s.slice(0, idx) + s.slice(end);

  if (!s.includes('tabToday:')) {
    s = s.replace(
      /(dailyChallenge: \{[\s\S]*?rewardClaimed: [^,]+,)(\r?\n\s+\},)/,
      `$1\r\n    tabToday: ${tabToday},\r\n    todayHint: ${todayHint},\r\n    historyHint: ${historyHint},$2`,
    );
  }

  fs.writeFileSync(file, s, 'utf8');
  console.log('fixed', loc);
}

console.log('Done fix-batch10-daily');
