/**
 * 臨時局試玩 / 平衡模擬的型別
 *
 * 這裡只放「我方」的形狀，不重複宣告遊戲本體型別（難度、塔、敵人一律 import type）。
 */
import type { GameDifficulty } from '@/types/game';

/** 一局試玩需要的啟動參數（由專案／關卡解析而來，或由外層注入） */
export interface PlaytestSetup {
  /** PATHS 的 key（官方地圖或已註冊的 Mod 地圖） */
  pathName: string;
  difficulty: GameDifficulty;
  /** 0 = 無限波 */
  maxWaves: number;
  /** 自訂波次組 id（有值時覆寫 WAVE_CONFIGS） */
  customWaveSetId?: string;
  /** UI 顯示用：解析出來的地圖名稱 */
  mapLabel: string;
  /** UI 顯示用：關卡名稱（可缺） */
  levelLabel?: string;
  /** 這個 setup 是否為「找不到地圖時的官方後備」，UI 要誠實標示 */
  fallback: boolean;
}

/** 單一局的模擬結果 */
export interface SimRunResult {
  /** 是否通關 */
  victory: boolean;
  /** 實際打完的波次（最後一波結束時的 currentWave） */
  survivedWaves: number;
  /** 結束時基地血量（<=0 代表防線失守） */
  remainingHealth: number;
  /** 開局血量上限（用來算比例曲線） */
  maxHealth: number;
  /** 每波結束時的基地血量，index 0 = 第 1 波 */
  waveHealth: number[];
  /** 這局消耗的「模擬遊戲時間」（毫秒，非牆上時鐘） */
  elapsedMs: number;
  /** 是否因為 tick 上限／時間上限被截斷（截斷的局不計入勝率判定，但計入存活波次） */
  timedOut: boolean;
}

/** 存活曲線的一點 */
export interface SurvivalPoint {
  /** 波次（1 起算） */
  wave: number;
  /** 該波結束後的平均血量 */
  avgHealth: number;
  /** 該波結束後的平均血量比例（0..1） */
  avgRatio: number;
  /** 有幾局走到這一波 */
  samples: number;
}

/** 聚合後的平衡摘要 */
export interface BalanceSummary {
  runs: number;
  wins: number;
  timeouts: number;
  /** 勝率 0..1（不含被截斷的局） */
  winRate: number;
  avgSurvivedWaves: number;
  avgRemainingHealth: number;
  avgElapsedMs: number;
  curve: SurvivalPoint[];
}

/** 模擬進度回報（給 UI 畫進度條） */
export interface SimulationProgress {
  /** 已完成的局數 */
  done: number;
  /** 總局數 */
  total: number;
  /** 目前這一局跑到第幾波 */
  currentWave: number;
  /** 目前這一局的最大波次（0 = 無限） */
  maxWaves: number;
}

/** 取消用的權杖（避免 AbortController 這種偏瀏覽器語意在測試裡難用） */
export interface CancelToken {
  cancelled: boolean;
}

/** 模擬選項 */
export interface SimulationOptions {
  setup: PlaytestSetup;
  /** 局數 */
  runs: number;
  /** 每一幀的模擬步長（毫秒） */
  stepMs: number;
  /** 單局模擬時間上限（毫秒，避免無限波卡死） */
  maxMatchMs: number;
  /** 每個分片最多佔用多少牆上時鐘毫秒（避免卡 UI） */
  sliceBudgetMs: number;
  onProgress?: (progress: SimulationProgress) => void;
  token?: CancelToken;
}

/** 模擬產出 */
export interface SimulationOutcome {
  summary: BalanceSummary;
  results: SimRunResult[];
  /** 整輪模擬的牆上時鐘耗時（毫秒），用來量測「N 局要跑多久」 */
  wallClockMs: number;
  cancelled: boolean;
}
