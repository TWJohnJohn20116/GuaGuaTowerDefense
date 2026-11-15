/**
 * 腳本模板與預設值（新增一支腳本時用）
 */
import type { ModScriptHook, ModScriptPermission } from '@/types/modScript';

/** 新增腳本時預設勾選的 hook */
export const SCRIPT_DEFAULT_HOOKS: ModScriptHook[] = ['onGameStart', 'onWaveStart'];

/** 新增腳本時預設勾選的權限（最小可用：讀狀態＋寫日誌＋加減金幣，與範例骨架一致） */
export const SCRIPT_DEFAULT_PERMISSIONS: ModScriptPermission[] = ['log', 'state.read', 'economy'];

const SKELETON_LINES = [
  '// 具名函式＝hook；ctx 是事件內容，api 是唯一能改動世界的入口。',
  '// 可用函式：onGameStart / onWaveStart / onWaveClear / onEnemyKilled',
  '//           onTowerPlaced / onTick / onGameOver / onVictory',
  'function onGameStart(ctx, api) {',
  "  api.log('腳本啟動：' + api.state.pathName + '（' + api.state.difficulty + '）');",
  '}',
  '',
  'function onWaveStart(ctx, api) {',
  '  // 每兩波補 20 金幣（需要 economy 權限，沒勾會被忽略並寫一筆警告）',
  '  if (ctx.wave % 2 === 0) {',
  '    api.money.add(20);',
  '  }',
  '  const alive = api.state.enemiesByType.tank || 0;',
  '  if (alive > 0) api.log(`本波開始時場上有 ${alive} 隻坦克`);',
  '}',
];

/** 新腳本的起始程式碼 */
export function createScriptSkeleton(): string {
  return SKELETON_LINES.join('\n');
}
