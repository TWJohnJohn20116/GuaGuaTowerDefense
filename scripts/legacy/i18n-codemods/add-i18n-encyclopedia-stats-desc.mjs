/** 補 encyclopedia.statsOverviewDesc 等主選單所需 key */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('src/i18n/locales');
const locales = ['zh-TW', 'zh-CN', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru', 'pt'];

const MAP = {
  'zh-TW': {
    statsOverviewDesc: '對局總覽、勝率與個人最佳',
    statsHistoryDesc: '完整對局歷史列表',
    statsRecordsDesc: '單局詳細紀錄與匯出',
  },
  'zh-CN': {
    statsOverviewDesc: '对局总览、胜率与个人最佳',
    statsHistoryDesc: '完整对局历史列表',
    statsRecordsDesc: '单局详细纪录与导出',
  },
};
const EN = {
  statsOverviewDesc: 'Overview, win rate, and personal bests',
  statsHistoryDesc: 'Full match history',
  statsRecordsDesc: 'Detailed records and export',
};

function pick(loc) {
  return MAP[loc] ?? EN;
}

for (const loc of locales) {
  const file = path.join(ROOT, `${loc}.ts`);
  let s = fs.readFileSync(file, 'utf8');
  if (s.includes('statsOverviewDesc:')) {
    console.log('skip', loc);
    continue;
  }
  const d = pick(loc);
  const lines = Object.entries(d).map(([k, v]) => `    ${k}: ${JSON.stringify(v)},`).join('\n');
  s = s.replace(/(\s+statsRecords: [^,]+,)/, `$1\n${lines}`);
  fs.writeFileSync(file, s, 'utf8');
  console.log('stats desc', loc);
}

console.log('Done');
