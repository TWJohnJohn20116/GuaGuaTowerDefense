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
  | 'onVictory'
  | 'onTowerSold'
  | 'onBossSpawn'
  | 'onMoneyChanged'
  /** 敵人抵達基地（漏怪）；detail 帶 enemyTypes 與 amount */
  | 'onEnemyLeaked'
  /** 塔升級成功 */
  | 'onTowerUpgraded'
  /** 敵人被生成 */
  | 'onEnemySpawned'
  /** 玩家啟用塔技能 */
  | 'onSkillUsed'
  /** Boss／精英被擊殺 */
  | 'onBossKilled'
  /** 波次開始前（生成佇列建立前） */
  | 'onWavePrepared';

/** 腳本能力（最小權限原則：沒勾就不能做） */
export type ModScriptPermission =
  | 'state.read'
  | 'economy'
  | 'base.health'
  | 'enemy.spawn'
  | 'enemy.modify'
  | 'tower.modify'
  | 'log'
  | 'storage';

/** 腳本自訂狀態可存的值（只允許 JSON 純量，避免把函式／物件帶進存檔） */
export type ScriptStateValue = string | number | boolean | null;

/** 單支腳本的自訂狀態 */
export type ScriptStateRecord = Record<string, ScriptStateValue>;

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
  | { kind: 'setScriptState'; key: string; value: ScriptStateValue }
  | { kind: 'addScore'; amount: number }
  | {
      kind: 'modifyTower';
      /** 塔種 id，或 '*' 表示全部塔 */
      scope: string;
      stat: 'damage' | 'range' | 'fireRate';
      /** 倍率（夾在 0.1~5） */
      multiplier: number;
    }
  | { kind: 'upgradeTowerAt'; row: number; col: number }
  | { kind: 'sellTowerAt'; row: number; col: number }
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
  /** 目前分數 */
  score: number;
  /** 本局擊殺數 */
  kills: number;
  /** 本局漏怪數 */
  leaks: number;
  /** 場上塔的等級總和（衡量發育） */
  towerLevelSum: number;
  /** 場上 Boss／精英的最高血量（沒有則 0） */
  bossHealth: number;
  /** 這支腳本自己的持久狀態（每支腳本看到的是自己那一份） */
  scriptState: ScriptStateRecord;
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
  /** onMoneyChanged：本次變動量（正負） */
  amount?: number;
  /** onBossSpawn：生成的敵人 id */
  enemyType?: string;
}

/** Mod 簽章（ECDSA P-256 + SHA-256；公鑰以 SPKI base64 夾帶） */
export interface ModSignature {
  alg: 'ECDSA-P256-SHA256';
  publicKeySpkiB64: string;
  valueB64: string;
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
