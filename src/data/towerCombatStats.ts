import type { TowerType, UpgradePath } from '@/types/game';
import { getUpgradeBonus } from '@/data/upgradeBranches';

/** 尚未選路線時，對局實際使用的每級傷害／射程步進 */
export const TOWER_LEVEL_DAMAGE_STEP = 0.3;
export const TOWER_LEVEL_RANGE_STEP = 0.15;

export interface TowerStatBonus {
  damageMultiplier: number;
  rangeMultiplier: number;
  fireRateMultiplier: number;
  splashRadiusMultiplier: number;
  slowAmountMultiplier: number;
  poisonDamageMultiplier: number;
  chainCountBonus: number;
}

export interface TowerStatRef {
  type: TowerType;
  level: number;
  upgradePath: UpgradePath;
}

const GENERIC_BONUS = (level: number): TowerStatBonus => {
  const steps = Math.max(0, level - 1);
  return {
    damageMultiplier: 1 + steps * TOWER_LEVEL_DAMAGE_STEP,
    rangeMultiplier: 1 + steps * TOWER_LEVEL_RANGE_STEP,
    fireRateMultiplier: 1,
    splashRadiusMultiplier: 1,
    slowAmountMultiplier: 1,
    poisonDamageMultiplier: 1,
    chainCountBonus: 0,
  };
};

/** 對局與面板共用：有升級路線就用路線表，否則用戰鬥迴圈原本的每級步進 */
export function getTowerStatBonus(tower: TowerStatRef): TowerStatBonus {
  if (tower.level >= 2 && tower.upgradePath) {
    return getUpgradeBonus(tower.type, tower.upgradePath, tower.level);
  }
  return GENERIC_BONUS(tower.level);
}
