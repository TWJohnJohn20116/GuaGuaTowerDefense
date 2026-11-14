/**
 * 一次性腳本：為暫停面板 / 百科捷徑新增 i18n key（i18n 預備）
 * 執行：node scripts/add-pause-i18n-keys.mjs
 */
import fs from 'fs';
import path from 'path';

const GAME_KEYS = {
  'zh-TW': {
    pauseSessionInfo: '本局資訊',
    pauseSessionGoals: '本局目標',
    pauseSessionEconomy: '波次獎勵與經濟',
    pauseSessionMetrics: '本局數據',
    pauseChallengeRules: '挑戰與規則',
    pauseWaveProgressLabel: '波次進度',
    pauseDifficultyPrefix: '難度 · {diff}',
    pauseTagEndless: '無盡模式',
    pauseTagCampaign: '戰役 · {title}',
    pauseTagMutator: '試煉 · {name}',
    pauseWaveActiveSuffix: ' · 進行中',
    pauseWaveEndlessFormat: '第 {current} 波{suffix}',
    pauseWaveNormalFormat: '第 {current} / {max} 波{suffix}',
    pauseMetricScore: '分數',
    pauseMetricDuration: '時長',
    pauseMetricPerfectWaves: '完美波',
    pauseMetricDamageTaken: '承受傷害',
    pauseMetricKills: '擊殺',
    pauseMetricTotalDamage: '總傷害',
    pauseDailyChallengePct: '今日挑戰 · {pct}%',
    pauseNextGoal: '下一目標：{label}',
    pauseMutatorRulesTitle: '突變規則',
    pauseMutatorNoSell: '禁止賣塔',
    pauseMutatorNoSkills: '禁用技能',
    pauseMutatorBuildLock: '第 {wave} 波前禁建',
    pauseBattleLive: '即時戰況',
    pauseOnFieldEnemies: '場上敵人',
    pauseActiveSkills: '主動技能',
    pauseTowerMatch: '塔陣克制對照',
    pauseOutputBuild: '輸出與建塔',
    pauseTowerRanking: '塔傷害排行',
    pauseCumulativeStats: '累計數據',
    pauseBack: '返回',
    pauseTowerShort: '塔',
    pauseEnemyShort: '敵',
    pauseViewHud: '視圖與 HUD',
    pause3DView: '3D 戰術視圖',
    pause3DViewDesc: '切換 2D / 3D 戰場視角',
    pause3DViewTutorial: '教學中暫不支援切換',
    pauseHudScale: 'HUD 介面縮放',
    pauseHudScaleNote: '三檔',
    pauseHudOpacity: 'HUD 不透明度',
    pauseUiScaleCompact: '緊湊',
    pauseUiScaleNormal: '標準',
    pauseUiScaleLarge: '大型',
    pauseShortcuts: '常用快捷鍵',
    pauseShortcutsDesc: '完整按鍵與滑鼠設定請至「完整設定」',
    pauseEditBindings: '修改綁定',
    pauseShortcutPauseResume: '暫停 / 繼續',
    pauseShortcutStartWave: '開始波次',
    pauseShortcutCycleSpeed: '循環速度',
    pauseShortcutUpgradeTower: '升級塔',
    pauseShortcutSellTower: '賣出塔',
    pauseShortcutDeselect: '取消選取',
    pauseDiffEasy: '簡單',
    pauseDiffNormal: '普通',
    pauseDiffHard: '困難',
    pauseDiffNightmare: '夢魘',
    pauseDiffImpossible: '不可能',
    pauseDiffCustom: '自訂',
  },
  en: {
    pauseSessionInfo: 'Session Info',
    pauseSessionGoals: 'Session Goals',
    pauseSessionEconomy: 'Wave Rewards & Economy',
    pauseSessionMetrics: 'Session Stats',
    pauseChallengeRules: 'Challenges & Rules',
    pauseWaveProgressLabel: 'Wave Progress',
    pauseDifficultyPrefix: 'Difficulty · {diff}',
    pauseTagEndless: 'Endless Mode',
    pauseTagCampaign: 'Campaign · {title}',
    pauseTagMutator: 'Trial · {name}',
    pauseWaveActiveSuffix: ' · In progress',
    pauseWaveEndlessFormat: 'Wave {current}{suffix}',
    pauseWaveNormalFormat: 'Wave {current} / {max}{suffix}',
    pauseMetricScore: 'Score',
    pauseMetricDuration: 'Duration',
    pauseMetricPerfectWaves: 'Perfect Waves',
    pauseMetricDamageTaken: 'Damage Taken',
    pauseMetricKills: 'Kills',
    pauseMetricTotalDamage: 'Total Damage',
    pauseDailyChallengePct: 'Daily Challenge · {pct}%',
    pauseNextGoal: 'Next goal: {label}',
    pauseMutatorRulesTitle: 'Mutator Rules',
    pauseMutatorNoSell: 'No selling towers',
    pauseMutatorNoSkills: 'Skills disabled',
    pauseMutatorBuildLock: 'No building until wave {wave}',
    pauseBattleLive: 'Live Battle',
    pauseOnFieldEnemies: 'On-field Enemies',
    pauseActiveSkills: 'Active Skills',
    pauseTowerMatch: 'Tower Matchups',
    pauseOutputBuild: 'Output & Building',
    pauseTowerRanking: 'Tower Damage Rank',
    pauseCumulativeStats: 'Cumulative Stats',
    pauseBack: 'Back',
    pauseTowerShort: 'Towers',
    pauseEnemyShort: 'Enemies',
    pauseViewHud: 'View & HUD',
    pause3DView: '3D Tactical View',
    pause3DViewDesc: 'Switch 2D / 3D battlefield view',
    pause3DViewTutorial: 'Unavailable during tutorial',
    pauseHudScale: 'HUD UI Scale',
    pauseHudScaleNote: '3 presets',
    pauseHudOpacity: 'HUD Opacity',
    pauseUiScaleCompact: 'Compact',
    pauseUiScaleNormal: 'Normal',
    pauseUiScaleLarge: 'Large',
    pauseShortcuts: 'Common Shortcuts',
    pauseShortcutsDesc: 'Full key & mouse settings in Settings',
    pauseEditBindings: 'Edit bindings',
    pauseShortcutPauseResume: 'Pause / Resume',
    pauseShortcutStartWave: 'Start Wave',
    pauseShortcutCycleSpeed: 'Cycle Speed',
    pauseShortcutUpgradeTower: 'Upgrade Tower',
    pauseShortcutSellTower: 'Sell Tower',
    pauseShortcutDeselect: 'Deselect',
    pauseDiffEasy: 'Easy',
    pauseDiffNormal: 'Normal',
    pauseDiffHard: 'Hard',
    pauseDiffNightmare: 'Nightmare',
    pauseDiffImpossible: 'Impossible',
    pauseDiffCustom: 'Custom',
  },
};

const ENC_KEY = {
  'zh-TW': { statsGoToPage: '前往統計頁面' },
  en: { statsGoToPage: 'Go to Statistics' },
};

const locales = ['zh-TW', 'zh-CN', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru', 'pt'];

for (const loc of locales) {
  const file = path.join('src/i18n/locales', `${loc}.ts`);
  let s = fs.readFileSync(file, 'utf8');
  if (s.includes('pauseSessionInfo:')) {
    console.log('skip', loc, '(already patched)');
    continue;
  }
  const gameVals = GAME_KEYS[loc === 'zh-CN' ? 'zh-TW' : loc] ?? GAME_KEYS.en;
  const encVal = ENC_KEY[loc === 'zh-CN' ? 'zh-TW' : loc]?.statsGoToPage ?? ENC_KEY.en.statsGoToPage;

  const gameBlock = Object.entries(gameVals)
    .map(([k, v]) => `    ${k}: '${v.replace(/'/g, "\\'")}',`)
    .join('\n');

  s = s.replace(
    /(\s+pauseTowerCountLabel: '[^']*',)/,
    `$1\n${gameBlock}`,
  );

  s = s.replace(
    /(\s+statsOverviewDesc: '[^']*',)/,
    `$1\n    statsGoToPage: '${encVal.replace(/'/g, "\\'")}',`,
  );

  fs.writeFileSync(file, s, 'utf8');
  console.log('patched', loc);
}

console.log('Done. Remember to update src/i18n/index.ts types manually if not yet.');
