import type { CustomTowerData, TowerType, UpgradePath } from '@/types/game';
import { getUpgradeBonus } from '@/data/upgradeBranches';

/** 尚未選路線時，對局實際使用的每級傷害／射程步進 */
const TOWER_LEVEL_DAMAGE_STEP = 0.3;
const TOWER_LEVEL_RANGE_STEP = 0.15;

interface TowerStatBonus {
  damageMultiplier: number;
  rangeMultiplier: number;
  fireRateMultiplier: number;
  splashRadiusMultiplier: number;
  slowAmountMultiplier: number;
  poisonDamageMultiplier: number;
  chainCountBonus: number;
}

/** 自訂塔的升級分支（直接沿用型別，避免兩處宣告漂移） */
type CustomUpgradeBranches = NonNullable<CustomTowerData['upgradeBranches']>;
/** 單一級別／單一路線的三項倍率 */
type CustomBranchRow = CustomUpgradeBranches['branchA'];

interface TowerStatRef {
  type: TowerType;
  level: number;
  upgradePath: UpgradePath;
  /**
   * 自訂塔的升級分支；官方塔與未設定時一律省略。
   * 沒有這個欄位時行為與舊版完全相同（官方塔走 TOWER_UPGRADE_BRANCHES）。
   */
  customBranches?: CustomUpgradeBranches | null;
}

const IDENTITY_ROW: CustomBranchRow = { damage: 1, range: 1, fireRate: 1 };

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

/**
 * 自訂塔的加成：以「該級通用步進」為基底，再乘上自訂倍率。
 *
 * 自訂倍率是「相對於該級基礎」的乘法加成（1 = 不變），選了路線再乘該路線倍率。
 * 自訂塔在 TOWER_UPGRADE_BRANCHES 裡沒有條目，所以這條路徑不呼叫 getUpgradeBonus。
 */
const customBonus = (
  level: number,
  upgradePath: UpgradePath,
  branches: CustomUpgradeBranches,
): TowerStatBonus => {
  const base = GENERIC_BONUS(level);
  const step = branches.levels[level - 1] ?? IDENTITY_ROW;
  const route = upgradePath === 'A'
    ? branches.branchA
    : upgradePath === 'B'
      ? branches.branchB
      : IDENTITY_ROW;
  return {
    ...base,
    damageMultiplier: base.damageMultiplier * step.damage * route.damage,
    rangeMultiplier: base.rangeMultiplier * step.range * route.range,
    fireRateMultiplier: base.fireRateMultiplier * step.fireRate * route.fireRate,
  };
};

/** 對局與面板共用：自訂分支優先，其次路線表，否則用戰鬥迴圈原本的每級步進 */
export function getTowerStatBonus(tower: TowerStatRef): TowerStatBonus {
  if (tower.customBranches) {
    return customBonus(tower.level, tower.upgradePath, tower.customBranches);
  }
  if (tower.level >= 2 && tower.upgradePath) {
    return getUpgradeBonus(tower.type, tower.upgradePath, tower.level);
  }
  return GENERIC_BONUS(tower.level);
}
