/**
 * 補齊 mainMenu.statusChips / alertChips / bento（en 等小語系缺漏導致主選單 crash）
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('src/i18n/locales');

const BLOCKS = {
  'zh-TW': null,
  'zh-CN': {
    statusChips: { campaignStars: '战役星数', totalBattles: '总出战' },
    alertChips: {
      claimable: '待领成就', claimableUnit: '{count} 项', dailyReward: '每日奖励',
      claimableReward: '可领取', dailyIncomplete: '今日未完成', streakIncomplete: '未完成 · 连续 {count} 天',
    },
    bento: {
      sectionChallenge: '挑战与成长', sectionRecords: '纪录与创作', replaySub: '本局回放与战报',
      memorialSub: '战役纪念档案', mutatorProgress: '已完成 {done}/{total}', streakDays: '连续 {count} 天',
      streakPending: '今日待完成', streakPendingWith: '连续 {count} 天 · 今日待完成', claimableCount: '待领 {count}',
    },
  },
  en: {
    statusChips: { campaignStars: 'Campaign stars', totalBattles: 'Total battles' },
    alertChips: {
      claimable: 'Claimable', claimableUnit: '{count} ready', dailyReward: 'Daily reward',
      claimableReward: 'Claim now', dailyIncomplete: 'Not done today', streakIncomplete: 'Pending · {count}-day streak',
    },
    bento: {
      sectionChallenge: 'Challenge & growth', sectionRecords: 'Records & workshop', replaySub: 'Replay & battle report',
      memorialSub: 'Campaign memorial', mutatorProgress: '{done}/{total} complete', streakDays: '{count}-day streak',
      streakPending: 'Complete today', streakPendingWith: '{count}-day streak · today pending', claimableCount: '{count} to claim',
    },
  },
};

const EN = BLOCKS.en;
const JA = {
  statusChips: { campaignStars: 'キャンペーン星', totalBattles: '総出撃' },
  alertChips: {
    claimable: '受取待ち', claimableUnit: '{count} 件', dailyReward: 'デイリー報酬',
    claimableReward: '受取可能', dailyIncomplete: '本日未完了', streakIncomplete: '未完了 · {count} 日連続',
  },
  bento: {
    sectionChallenge: 'チャレンジ', sectionRecords: '記録と創作', replaySub: 'リプレイと戦報',
    memorialSub: '記念档案', mutatorProgress: '{done}/{total} 完了', streakDays: '{count} 日連続',
    streakPending: '本日未完了', streakPendingWith: '{count} 日連続 · 本日未完了', claimableCount: '受取 {count}',
  },
};
const KO = {
  statusChips: { campaignStars: '캠페인 별', totalBattles: '총 출전' },
  alertChips: {
    claimable: '수령 대기', claimableUnit: '{count}개', dailyReward: '일일 보상',
    claimableReward: '수령 가능', dailyIncomplete: '오늘 미완료', streakIncomplete: '미완료 · {count}일 연속',
  },
  bento: {
    sectionChallenge: '도전과 성장', sectionRecords: '기록과 창작', replaySub: '리플레이와 전报',
    memorialSub: '기념档案', mutatorProgress: '{done}/{total} 완료', streakDays: '{count}일 연속',
    streakPending: '오늘 미완료', streakPendingWith: '{count}일 연속 · 오늘 미완료', claimableCount: '수령 {count}',
  },
};
const DE = {
  statusChips: { campaignStars: 'Kampagnen-Sterne', totalBattles: 'Kämpfe gesamt' },
  alertChips: {
    claimable: 'Abholbar', claimableUnit: '{count} bereit', dailyReward: 'Tagesbelohnung',
    claimableReward: 'Jetzt abholen', dailyIncomplete: 'Heute offen', streakIncomplete: 'Offen · {count}-Tage-Serie',
  },
  bento: {
    sectionChallenge: 'Herausforderung', sectionRecords: 'Aufzeichnungen', replaySub: 'Replay & Bericht',
    memorialSub: 'Memorial', mutatorProgress: '{done}/{total} erledigt', streakDays: '{count}-Tage-Serie',
    streakPending: 'Heute offen', streakPendingWith: '{count}-Serie · heute offen', claimableCount: '{count} abholbar',
  },
};

function pick(loc) {
  if (loc === 'zh-TW') return null;
  if (loc === 'zh-CN') return BLOCKS['zh-CN'];
  if (loc === 'ja') return JA;
  if (loc === 'ko') return KO;
  if (loc === 'de') return DE;
  return EN;
}

function fmt(obj, indent = 4) {
  const sp = ' '.repeat(indent);
  return Object.entries(obj).map(([k, v]) => {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      const inner = Object.entries(v).map(([k2, v2]) => `${sp}  ${k2}: ${JSON.stringify(v2)},`).join('\n');
      return `${sp}${k}: {\n${inner}\n${sp}},`;
    }
    return `${sp}${k}: ${JSON.stringify(v)},`;
  }).join('\n');
}

for (const loc of ['zh-CN', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru', 'pt']) {
  const file = path.join(ROOT, `${loc}.ts`);
  let s = fs.readFileSync(file, 'utf8');
  if (s.includes('alertChips:')) {
    console.log('skip', loc);
    continue;
  }
  const d = pick(loc);
  const block = fmt(d);
  s = s.replace(/(\s+coinsUnit: [^,]+,)(\r?\n\s+\},)/, `$1\n${block}$2`);
  fs.writeFileSync(file, s, 'utf8');
  console.log('mainMenu chips', loc);
}

console.log('Done mainMenu chips');
