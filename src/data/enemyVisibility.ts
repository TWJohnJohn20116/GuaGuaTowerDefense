import { resolveEnemyData } from '@/data/enemyDataProvider';

/**
 * 敵人隱身 / 相位週期判定（純函式）
 *
 * 這些函式只依賴 `ENEMY_DATA` 與 `spawnTime`，不需要任何運行時狀態。
 * 原本住在 `store/gameStoreUtils.ts`，但戰鬥邏輯（`store/gameLoop/*`）與
 * 2D / 3D 渲染都要用同一份判定，放在 data 層才不會讓渲染端反向依賴 store
 * （AGENTS.md §4.1 的依賴方向）。
 */

/** 淡入淡出時長 (ms)，渲染過渡用 */
const STEALTH_FADE_MS = 250;

/** 敵人目前是否處於隱身狀態（塔無法鎖定為主目標） */
export const isEnemyStealthed = (
  enemy: { type: string; originType?: string; health: number; spawnTime?: number },
  now: number,
): boolean => {
  if (enemy.health <= 0) return false;
  const data = resolveEnemyData(enemy.originType ?? enemy.type);
  if (data?.ability !== 'stealth') return false;
  const dur = data.stealthDuration ?? 3000;
  const cd = data.stealthCooldown ?? 5000;
  const t = (now - (enemy.spawnTime ?? now)) % (dur + cd);
  return t >= cd;
};

/**
 * 隱身視覺強度 0~1（0=完全可見、1=完全隱身），含 STEALTH_FADE_MS 平滑過渡。
 * 非隱身型敵人恆回傳 0。
 */
export const getEnemyStealthFade = (
  enemy: { type: string; originType?: string; health: number; spawnTime?: number },
  now: number,
): number => {
  if (enemy.health <= 0) return 0;
  const data = resolveEnemyData(enemy.originType ?? enemy.type);
  if (data?.ability !== 'stealth') return 0;
  const dur = data.stealthDuration ?? 3000;
  const cd = data.stealthCooldown ?? 5000;
  const cycle = dur + cd;
  const t = (now - (enemy.spawnTime ?? now)) % cycle;
  if (t < cd) {
    // 可見期：尾端淡出進入隱身
    const untilStealth = cd - t;
    return untilStealth < STEALTH_FADE_MS ? 1 - untilStealth / STEALTH_FADE_MS : 0;
  }
  // 隱身期：尾端淡入回到可見
  const untilVisible = cycle - t;
  return untilVisible < STEALTH_FADE_MS ? untilVisible / STEALTH_FADE_MS : 1;
};

// ============ 幽靈敵人（phase）相位週期判定 ============
// 相位節奏：出生後先「實體 phaseCooldown ms」→「相位 phaseDuration ms」循環。
// 相位期間塔無法鎖定且完全免疫所有傷害（直擊 / AOE / DoT）。

/** 敵人目前是否處於相位狀態（無法鎖定且免疫傷害） */
export const isEnemyPhased = (
  enemy: { type: string; originType?: string; health: number; spawnTime?: number },
  now: number,
): boolean => {
  if (enemy.health <= 0) return false;
  const data = resolveEnemyData(enemy.originType ?? enemy.type);
  if (data?.ability !== 'phase') return false;
  const dur = data.phaseDuration ?? 2000;
  const cd = data.phaseCooldown ?? 4000;
  const t = (now - (enemy.spawnTime ?? now)) % (dur + cd);
  return t >= cd;
};

/** 相位視覺強度 0~1（0=實體、1=完全相位），含平滑過渡。非相位型敵人恆回傳 0。 */
export const getEnemyPhaseFade = (
  enemy: { type: string; originType?: string; health: number; spawnTime?: number },
  now: number,
): number => {
  if (enemy.health <= 0) return 0;
  const data = resolveEnemyData(enemy.originType ?? enemy.type);
  if (data?.ability !== 'phase') return 0;
  const dur = data.phaseDuration ?? 2000;
  const cd = data.phaseCooldown ?? 4000;
  const cycle = dur + cd;
  const t = (now - (enemy.spawnTime ?? now)) % cycle;
  if (t < cd) {
    const untilPhase = cd - t;
    return untilPhase < STEALTH_FADE_MS ? 1 - untilPhase / STEALTH_FADE_MS : 0;
  }
  const untilSolid = cycle - t;
  return untilSolid < STEALTH_FADE_MS ? untilSolid / STEALTH_FADE_MS : 1;
};
