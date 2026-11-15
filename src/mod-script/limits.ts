/**
 * Mod 腳本硬限制（沙箱預算）
 *
 * 數字刻意寫死在這裡，不在各處散落魔術數字；改動要同步 docs/research 的說明。
 */
import type { ModScriptHook, ModScriptPermission } from '@/types/modScript';

/** 全部 hook（順序＝文件與 UI 的顯示順序） */
export const MOD_SCRIPT_HOOKS: ModScriptHook[] = [
  'onGameStart',
  'onWaveStart',
  'onWaveClear',
  'onEnemyKilled',
  'onTowerPlaced',
  'onTick',
  'onGameOver',
  'onVictory',
  'onTowerSold',
  'onBossSpawn',
  'onMoneyChanged',
];

/** 全部權限 */
export const MOD_SCRIPT_PERMISSIONS: ModScriptPermission[] = [
  'state.read',
  'economy',
  'base.health',
  'enemy.spawn',
  'enemy.modify',
  'log',
  'storage',
];

export const MOD_SCRIPT_LIMITS = {
  /** 單支腳本程式碼上限（字元） */
  maxCodeLength: 20000,
  /** 單次事件最多回傳幾條指令 */
  maxCommandsPerEvent: 64,
  /** spawnEnemy 單次最多幾隻 */
  maxSpawnCount: 20,
  /** 單次加錢上限（正負同值） */
  maxMoneyDelta: 100000,
  /** 狀態效果最長時效（毫秒） */
  maxStatusDurationMs: 60000,
  /** 狀態效果單次最多影響幾隻敵人 */
  maxStatusTargets: 200,
  /** 事件派發看門狗（毫秒）：超過就 terminate 該 worker */
  dispatchTimeoutMs: 250,
  /** 初始化（編譯）看門狗（毫秒） */
  initTimeoutMs: 1500,
  /** 連續錯誤幾次後停用該腳本 */
  crashLimit: 3,
  /** UI 日誌保留筆數 */
  logLimit: 200,
  /** onTick 的最小派發間隔（毫秒，遊戲時間） */
  tickIntervalMs: 500,
  /** onMoneyChanged 的最小派發間隔（毫秒）：金錢變動很碎，一律節流 */
  moneyNotifyIntervalMs: 250,
  /** 單支腳本自訂狀態最多幾個鍵 */
  maxScriptStateKeys: 32,
  /** 單一狀態值的字串長度上限 */
  maxScriptStateValueLength: 512,
} as const;

/** persist 鍵名（與 modStore 的 guagua-mods 分開，避免版本遷移互相干擾） */
export const MOD_SCRIPT_STORE_NAME = 'guagua-mod-scripts';

/** 沙箱內被遮蔽的全域名稱（new Function 參數逐一設為 undefined） */
export const SHADOWED_GLOBAL_NAMES: string[] = [
  'fetch',
  'XMLHttpRequest',
  'WebSocket',
  'EventSource',
  'importScripts',
  'self',
  'window',
  'document',
  'navigator',
  'localStorage',
  'sessionStorage',
  'indexedDB',
  'Worker',
  'SharedWorker',
  'postMessage',
  'close',
  'Function',
  'setTimeout',
  'setInterval',
  'requestAnimationFrame',
];
