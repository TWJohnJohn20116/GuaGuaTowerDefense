/** ja locale：statistics + mutatorChallenge 種子翻譯 */
export const JA_STATISTICS = {
  fieldLabels: {
    towersSold: '売却タワー数',
    gameMode: '対局モード',
    totalTowersSold: '累計売却',
  },
  detail: {
    selectHintLine1: '左の戦局を選択',
    selectHintLine2: '詳細データを表示',
  },
  exportData: '戦績エクスポート',
  headerStats: {
    totalGames: '総試合数',
    winRate: '勝率',
    totalPlaytime: '総プレイ時間',
    wins: '勝利',
  },
  toolbar: {
    overviewHint: '全体データと最近の戦局',
    recordsHint: '各種ベスト記録ランキング',
    historyHint: '絞込結果 · {count} 試合',
    historyTotalSuffix: '/ 計 {count} 試合',
    searchPlaceholder: 'マップまたは難易度を検索…',
    filterOutcomeAll: 'すべての結果',
    filterVictory: '勝利',
    filterDefeat: '敗北',
    filterDateAll: 'すべての期間',
    filterToday: '今日',
    filter7d: '過去7日',
    filter30d: '過去30日',
    filterModeAll: 'すべてのモード',
    filterCampaign: 'キャンペーン',
    filterStandard: 'スタンダード',
    filterEndless: 'エンドレス',
    filterMutator: '変異',
    filterMod: 'Mod',
    filterUnknown: '一般',
    noFilterResults: '条件に一致する戦局がありません',
  },
  overview: {
    combatStats: '戦闘統計',
    winRateHigh: '高水準の成績',
    winRateMid: '安定した成績',
    winRateLow: 'さらに頑張りましょう',
  },
  exportDialog: {
    title: '戦績エクスポート',
    summary: 'エクスポート概要',
    exportCount: 'エクスポート試合数',
    gamesUnit: '{count} 試合',
    dbTotal: 'データベース合計',
    winLoss: '勝 / 敗',
    winRate: '勝率',
    timeSpan: '期間',
    preview: 'プレビュー（先頭3試合）',
    scopeTitle: 'エクスポート範囲',
    scopeAll: 'すべて',
    scopeFiltered: '現在の絞込',
    formatTitle: 'ファイル形式',
    includeTitle: '含める内容',
    includeTowerStats: '各試合のタワー統計（CSV追加 / JSON内包）',
    includeEconomy: '経済フィールド（収入 / 支出 / 売却）',
    includeGlobalSummary: '全体統計と個人ベスト',
    confirmText: '{count} 試合の戦績（{format}）をエクスポートします。内容はローカルにのみ保存され、サーバーには送信されません。',
    success: 'エクスポート成功。ダウンロードを開始しました',
    fail: 'エクスポート失敗。後でもう一度お試しください',
    confirm: 'エクスポート確認',
  },
};

export const JA_MUTATOR = {
  title: '変異チャレンジ',
  subtitle: 'ルール型変異 · 企画チャレンジ集',
  menuSub: 'ルール変異',
  start: 'チャレンジ開始',
  claim: '報酬受取',
  completed: '完了',
  completedCount: '完了',
  bestScore: 'ベストスコア',
  completionRate: '完了率',
  emptyTier: 'この難易度のチャレンジはありません',
  toolbar: {
    hint: '固定ルール試練 · 左で選択して右で詳細を確認',
    filterAll: 'すべて',
    tierEasy: '簡単',
    tierMedium: '普通',
    tierHard: '困難',
    tierExtreme: '極限',
  },
  detail: {
    selectHintLine1: '左のチャレンジを選択',
    selectHintLine2: 'ルールと報酬を表示',
    mapLabel: 'マップ',
    difficultyLabel: '難易度',
    rulesLabel: '変異ルール',
    rewardLabel: '報酬',
    endlessSuffix: ' · エンドレス',
    wavesSuffix: ' · {count} ウェーブ',
    diffEasy: '簡単',
    diffNormal: '普通',
    diffHard: '困難',
    diffNightmare: 'ナイトメア',
    diffImpossible: '地獄',
    diffCustom: 'カスタム',
  },
};

function objLines(obj, indent) {
  const pad = ' '.repeat(indent);
  return Object.entries(obj).map(([k, v]) => {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      return `${pad}${k}: {\n${objLines(v, indent + 2)}\n${pad}},`;
    }
    return `${pad}${k}: ${JSON.stringify(v)},`;
  }).join('\n');
}

export function formatJaLocaleFile() {
  return `import type { DeepPartial, Translations } from '../index';

/** 日本語 locale（statistics / mutatorChallenge 優先） */
export const ja: DeepPartial<Translations> = {
  statistics: {
${objLines(JA_STATISTICS, 4)}
  },

  mutatorChallenge: {
${objLines(JA_MUTATOR, 4)}
  },
};
`;
}
