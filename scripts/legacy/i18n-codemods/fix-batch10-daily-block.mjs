/** 修復 dailyChallenge tabToday/todayHint/historyHint 被截斷的問題 */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('src/i18n/locales');
const locales = ['zh-TW', 'zh-CN', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru', 'pt'];

const DAILY = {
  'zh-TW': {
    tabToday: '今日挑戰',
    todayHint: '完成左側條件後，於右欄領取獎勵',
    historyHint: '近 30 天完成紀錄一覽',
  },
  'zh-CN': {
    tabToday: '今日挑战',
    todayHint: '完成左侧条件后，于右栏领取奖励',
    historyHint: '近 30 天完成纪录一览',
  },
};

const EN = {
  tabToday: 'Today',
  todayHint: 'Complete conditions on the left, claim reward on the right',
  historyHint: 'Last 30 days completion log',
};

for (const loc of locales) {
  const file = path.join(ROOT, `${loc}.ts`);
  let s = fs.readFileSync(file, 'utf8');
  const d = DAILY[loc] ?? EN;

  // 移除損壞或舊的 tabToday 區塊
  s = s.replace(/\r?\n\s+tabToday:[\s\S]*?\r?\n\s+historyHint:[^\n]*,/, '');

  if (!s.includes('dailyChallenge:')) continue;

  const block = `\r\n    tabToday: ${JSON.stringify(d.tabToday)},\r\n    todayHint: ${JSON.stringify(d.todayHint)},\r\n    historyHint: ${JSON.stringify(d.historyHint)},`;

  if (s.includes('historyPanel:')) {
    s = s.replace(/(\r?\n\s+rewardClaimed: [^,]+,)(\r?\n\s+historyPanel:)/, `$1${block}$2`);
  } else {
    s = s.replace(/(\r?\n\s+rewardClaimed: [^,]+,)(\r?\n\s+\},)/, `$1${block}$2`);
  }

  fs.writeFileSync(file, s, 'utf8');
  console.log('fixed daily block', loc);
}

console.log('Done fix-batch10-daily-block');
