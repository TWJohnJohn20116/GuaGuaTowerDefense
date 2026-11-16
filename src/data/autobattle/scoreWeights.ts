import type { AutoBattleActionKind, AutoBattleFactor, AutoBattleWeights } from '@/types/autobattle';

/** 全部因子（UI 滑桿與表格的固定順序） */
export const ALL_FACTORS: AutoBattleFactor[] = [
  'coverage', 'threatFit', 'typeMatch', 'economyROI', 'tempo', 'reserve',
  'synergy', 'marginal', 'safety', 'timing', 'skipSafety',
];

/** 因子的 i18n key（UI 直接取用） */
export const FACTOR_LABEL_KEYS: Record<AutoBattleFactor, string> = {
  coverage: 'content.autoBattle.factor.coverage',
  threatFit: 'content.autoBattle.factor.threatFit',
  typeMatch: 'content.autoBattle.factor.typeMatch',
  economyROI: 'content.autoBattle.factor.economyRoi',
  tempo: 'content.autoBattle.factor.tempo',
  reserve: 'content.autoBattle.factor.reserve',
  synergy: 'content.autoBattle.factor.synergy',
  marginal: 'content.autoBattle.factor.marginal',
  safety: 'content.autoBattle.factor.safety',
  timing: 'content.autoBattle.factor.timing',
  skipSafety: 'content.autoBattle.factor.skipSafety',
};

/** 每種動作的預設權重（同組內總和為 1） */
export const BASE_WEIGHTS: Record<Exclude<AutoBattleActionKind, 'hold'>, AutoBattleWeights> = {
  place: {
    coverage: 0.22, threatFit: 0.2, typeMatch: 0.16, economyROI: 0.14,
    tempo: 0.1, reserve: 0.08, synergy: 0.1,
  },
  upgrade: { marginal: 0.3, economyROI: 0.24, typeMatch: 0.18, threatFit: 0.16, reserve: 0.12 },
  sell: { safety: 0.45, economyROI: 0.25, tempo: 0.15, reserve: 0.15 },
  fusion: { synergy: 0.34, economyROI: 0.3, typeMatch: 0.2, reserve: 0.16 },
  skill: { timing: 0.55, threatFit: 0.3, typeMatch: 0.15 },
  playerSkill: { timing: 0.6, threatFit: 0.4 },
  skip: { skipSafety: 0.7, tempo: 0.3 },
};

/** 決策節奏與上限（集中管理，方便調參） */
export const DECISION_LIMITS = {
  /** 兜底輪詢間隔（ms）：事件沒抓到時的最大延遲 */
  fallbackTickMs: 200,
  /** 同一個目標的最小再決策間隔（ms），防抖動 */
  targetCooldownMs: 700,
  /** 賣塔後同一格禁止重建的時間（ms） */
  rebuildLockMs: 12000,
  /** 玩家手動操作後，AI 對該目標的靜默期（ms） */
  manualRespectMs: 3000,
  /** 第一名需領先第二名的分差，否則記為 hold（猶豫） */
  minMargin: 0.04,
  /** 單次決策最多產生的候選數 */
  maxCandidates: 120,
  /** 單次決策最多評分的候選數 */
  maxScored: 60,
  /** 決策記錄上限（persist 用） */
  recordLimit: 300,
  /** 每個候選最多保留的因子數（UI 表格寬度） */
  maxFactorsInRecord: 8,
} as const;
