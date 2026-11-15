/**
 * Mod 腳本型別（純型別，無執行期程式碼）
 *
 * 一支腳本 = 具名 hook 函式 + 權限清單 + 程式碼字串。
 * 執行在獨立 Worker 內，主執行緒只收「指令」再落地，腳本本體碰不到 store。
 */

/** 可掛載的遊戲事件 */
export type ModScriptHook =
  | 'onGameStart'
  | 'onWaveStart'
  | 'onWaveClear'
  | 'onEnemyKilled'
  | 'onTowerPlaced'
  | 'onTick'
  | 'onGameOver'
  | 'onVictory';

/** 腳本能力（最小權限原則：沒勾就不能做） */
export type ModScriptPermission =
  | 'state.read'
  | 'economy'
  | 'base.health'
  | 'enemy.spawn'
  | 'enemy.modify'
  | 'log';

/** 腳本可施加的狀態效果（StatusEffectType 的子集，避免跨檔循環） */
export type ModScriptStatusEffect =
  | 'slow'
  | 'poison'
  | 'burn'
  | 'stun'
  | 'weakness'
  | 'exposed'
  | 'root';

/** 腳本日誌等級 */
type ModScriptLogLevel = 'debug' | 'info' | 'warn' | 'error';

/** 一行腳本日誌 */
export interface ModScriptLogEntry {
  /** 毫秒時間戳 */
  at: number;
  level: ModScriptLogLevel;
  message: string;
  scriptId: string;
  scriptName: string;
}

/** 腳本回傳給主執行緒的指令（唯一能改變世界的通道） */
export type ModScriptCommand =
  | { kind: 'log'; level: 'debug' | 'info' | 'warn'; message: string }
  | { kind: 'addMoney'; amount: number }
  | { kind: 'healBase'; amount: number }
  | { kind: 'damageBase'; amount: number }
  | { kind: 'spawnEnemy'; enemyType: string; count: number; intervalMs: number }
  | {
      kind: 'applyStatus';
      effect: ModScriptStatusEffect;
      durationMs: number;
      value: number;
      enemyType?: string;
    };

/** 事件派發時給腳本的唯讀快照（深拷貝，腳本改不到遊戲狀態） */
export interface ModScriptStateSnapshot {
  scene: string;
  wave: number;
  maxWaves: number;
  endless: boolean;
  money: number;
  health: number;
  towerCount: number;
  enemyCount: number;
  enemiesByType: Record<string, number>;
  towerTypes: string[];
  difficulty: string;
  pathName: string;
  elapsedMs: number;
}

/** 事件細節（依 hook 帶不同欄位） */
export interface ModScriptEventDetail {
  hook: ModScriptHook;
  wave?: number;
  enemyTypes?: string[];
  killCount?: number;
  towerType?: string;
  row?: number;
  col?: number;
}

/** Mod 內的一支腳本（存進 mod.content.scripts） */
export interface CustomScriptData {
  id: string;
  modId: string;
  name: string;
  description: string;
  hooks: ModScriptHook[];
  permissions: ModScriptPermission[];
  code: string;
  /** 同一 hook 的最小間隔（毫秒）；0 或缺省＝每個事件都跑 */
  throttleMs?: number;
  /** false＝暫時停用（保留內容） */
  enabled?: boolean;
}

/** 單支腳本的執行狀態 */
export interface ModScriptRuntimeStatus {
  scriptId: string;
  scriptName: string;
  state: 'idle' | 'running' | 'error' | 'disabled';
  lastError?: string;
  crashes: number;
  calls: number;
  lastAt: number;
}
