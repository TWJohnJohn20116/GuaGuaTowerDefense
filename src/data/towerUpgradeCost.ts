import { GAME_CONSTANTS } from '@/data/gameData';
import type { UpgradePath } from '@/types/game';

/** 單塔升級費用：與 upgradeTower 同一套公式 */
export function getTowerUpgradeCost(baseCost: number, currentLevel: number): number {
  const extra = currentLevel >= 2 ? (currentLevel - 1) * 0.5 : 0;
  return Math.floor(baseCost * (0.5 + currentLevel * 0.25 + extra));
}

interface BatchUpgradeTowerRef {
  level: number;
  upgradePath: UpgradePath | null | undefined;
}

/** 批次／自動升級：1 級還沒選路線，upgradeTower 會直接失敗 */
export function canBatchUpgradeTower(
  tower: BatchUpgradeTowerRef,
  maxLevel: number = GAME_CONSTANTS.MAX_TOWER_LEVEL,
): boolean {
  return tower.level >= 2 && tower.level < maxLevel && Boolean(tower.upgradePath);
}

/**
 * 自動戰鬥專用：允許 Lv1 升級。
 *
 * `canBatchUpgradeTower` 要求「已選路線」，是因為批次升級沒有路線參數可傳；
 * 但自動戰鬥在 `gameStoreAutoBattle.ts` 內會自己決定 Lv1→2 要走 A 還是 B
 * （見該檔升級區塊的 upgradePath 選擇），所以 Lv1 必須放行，否則 AI 永遠停在 Lv1。
 *
 * 已選路線之後仍要求 upgradePath 存在（Lv2+ 且為 null 代表狀態壞了，交回手動處理）。
 */
export function canAutoUpgradeTower(
  tower: BatchUpgradeTowerRef,
  maxLevel: number = GAME_CONSTANTS.MAX_TOWER_LEVEL,
): boolean {
  if (tower.level >= maxLevel) return false;
  if (tower.level >= 2 && !tower.upgradePath) return false;
  return true;
}
