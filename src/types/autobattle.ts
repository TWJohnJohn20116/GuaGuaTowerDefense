import type { EnemyType, TowerType } from '@/types/game';

/** 五種運行模式：教練／建議／分區／階段／全自動 */
export type AutoBattleMode = 'coach' | 'assist' | 'zones' | 'phases' | 'full';

/** 動作種類（與記錄、UI 篩選共用） */
export type AutoBattleActionKind =
  | 'place' | 'upgrade' | 'sell' | 'fusion' | 'skill' | 'playerSkill' | 'skip' | 'hold';

/** 觸發決策的事件 */
export type AutoBattleTrigger =
  | 'enemyAppeared' | 'moneyThreshold' | 'waveStart' | 'waveEnd' | 'healthDrop'
  | 'leak' | 'skillReady' | 'manual' | 'cooldown';

/** 評分因子識別碼 */
export type AutoBattleFactor =
  | 'coverage' | 'threatFit' | 'typeMatch' | 'economyROI' | 'tempo' | 'reserve'
  | 'synergy' | 'marginal' | 'safety' | 'timing' | 'skipSafety';

/** 因子分解的一項 */
export interface ScoreFactor {
  factor: AutoBattleFactor;
  raw: number;
  normalized: number;
  weight: number;
  /** normalized × weight，已含規則加分 */
  contribution: number;
  /** 給 UI 的補充說明（例如覆蓋 7 格、重疊 2 格） */
  detail?: string;
}

/** 被硬規則否決的紀錄 */
export interface RuleVeto {
  ruleId: string;
  reason: string;
}

/** 一個候選動作與它的分數 */
export interface AutoBattleCandidate {
  id: string;
  kind: AutoBattleActionKind;
  /** i18n key，例如 content.autoBattle.action.place */
  labelKey: string;
  labelParams?: Record<string, string | number>;
  towerType?: TowerType;
  towerId?: string;
  col?: number;
  row?: number;
  cost: number;
  factors: ScoreFactor[];
  softBonus: number;
  penalties: number;
  total: number;
  vetoedBy: RuleVeto[];
}

/** 決策當下局勢摘要（供回放與報告） */
export interface AutoBattleSnapshot {
  money: number;
  health: number;
  wave: number;
  enemyCount: number;
  towerCount: number;
  threat: number;
}

/** 一次決策的完整紀錄 */
export interface AutoBattleDecision {
  id: string;
  time: number;
  wave: number;
  triggers: AutoBattleTrigger[];
  chosen: AutoBattleCandidate | null;
  candidates: AutoBattleCandidate[];
  verdict: 'executed' | 'suggested' | 'blocked' | 'hold' | 'denied';
  /** i18n key */
  narrationKey: string;
  narrationParams?: Record<string, string | number>;
  snapshot: AutoBattleSnapshot;
}

/** 規則條件 */
export interface AutoBattleRuleCondition {
  minWave?: number;
  maxWave?: number;
  minMoney?: number;
  maxMoney?: number;
  minHealthRatio?: number;
  maxHealthRatio?: number;
  enemyHasAbility?: string;
  minEnemyCount?: number;
  minTowerCount?: number;
  maxTowerCount?: number;
  /** 只在指定模式生效；省略＝全部模式 */
  modes?: AutoBattleMode[];
}

export type AutoBattleRuleEffect =
  | { type: 'veto'; kinds: AutoBattleActionKind[] }
  | { type: 'force'; kinds: AutoBattleActionKind[] }
  | { type: 'bonus'; kinds: AutoBattleActionKind[]; amount: number }
  | { type: 'weight'; factor: AutoBattleFactor; multiplier: number };

/** 硬／軟規則 */
export interface AutoBattleRule {
  id: string;
  enabled: boolean;
  hardness: 'hard' | 'soft';
  when: AutoBattleRuleCondition;
  then: AutoBattleRuleEffect;
  note?: string;
  source: 'preset' | 'user';
}

/** 權重表（可只覆寫部分因子） */
export type AutoBattleWeights = Partial<Record<AutoBattleFactor, number>>;

export interface AutoBattleConfig {
  mode: AutoBattleMode;
  presetId: string;
  weights: Partial<Record<AutoBattleActionKind, AutoBattleWeights>>;
  rules: AutoBattleRule[];
  /** 分區模式允許的格子 key（"col,row"） */
  allowedTiles: string[];
  /** 階段模式：AI 執行到此波為止 */
  aiUntilWave: number;
  /** 玩家接管鎖定的目標（towerId 或格 key） */
  lockedTargets: string[];
  showOverlay: boolean;
  dryRun: boolean;
}

/** 前瞻推演的結果 */
export interface AutoBattleLookahead {
  moneyReserve: number;
  expectedAbilities: string[];
  expectedEnemyCount: number;
  pressure: number;
  nextWaveTypes: EnemyType[];
}

/** 決策輸入：一次世界快照（唯讀） */
export interface AutoBattleContext {
  time: number;
  wave: number;
  money: number;
  health: number;
  maxHealth: number;
  enemies: { id: string; type: EnemyType; x: number; y: number; health: number; maxHealth: number; progress: number }[];
  towers: { id: string; type: TowerType; level: number; col: number; row: number; skillReady: boolean }[];
  waveActive: boolean;
  allEnemiesSpawned: boolean;
  lookahead: AutoBattleLookahead;
  config: AutoBattleConfig;
  trigger: AutoBattleTrigger[];
}

/** 每波取樣的資源曲線點（事後報告與曲線圖共用） */
export interface AutoBattleCurvePoint {
  wave: number;
  money: number;
  health: number;
  dps: number;
  towerCount: number;
}

/** 預設檔：一組動作權重覆寫 + 因子乘數 + 節奏參數 */
export interface AutoBattlePreset {
  id: string;
  nameKey: string;
  descKey: string;
  weights?: Partial<Record<Exclude<AutoBattleActionKind, 'hold'>, AutoBattleWeights>>;
  factorBoost?: Partial<Record<AutoBattleFactor, number>>;
  reserveRatio: number;
  allowSell: boolean;
  allowFusion: boolean;
  skillThresholdScale: number;
}
