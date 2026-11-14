import { GAME_CONSTANTS } from '@/data/gameData';
import type { UpgradePath } from '@/types/game';

/** 單塔升級費用：與 upgradeTower 同一套公式 */
export function getTowerUpgradeCost(baseCost: number, currentLevel: number): number {
  const extra = currentLevel >= 2 ? (currentLevel - 1) * 0.5 : 0;
  return Math.floor(baseCost * (0.5 + currentLevel * 0.25 + extra));
}

export interface BatchUpgradeTowerRef {
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
