/**
 * 塔皮膚資料定義 - 主入口
 * Tower Skin Data Definitions - Main Entry
 */

import type { TowerSkin } from '@/types/skin';
import type { TowerType } from '@/types/game';

// 從拆分模組匯入
export { getDefaultVisuals } from './skins/skinUtils';
import {
  basicSkins, sniperSkins, cannonSkins, machineSkins, ballistaSkins,
} from './skins/attackTowerSkins';
import {
  frostSkins, poisonSkins, laserSkins, lightningSkins,
} from './skins/specialTowerSkins';
import {
  flameSkins, moneySkins, universalSkins,
} from './skins/elementalTowerSkins';
import {
  shotgunSkins, windSkins, pulseSkins,
} from './skins/utilityTowerSkins';
import {
  stormSkins, plagueSkins, demolisherSkins, tempestSkins,
} from './skins/fusionTowerSkins';

// ============ 匯出所有皮膚 ============
export const ALL_SKINS: TowerSkin[] = [
  ...basicSkins,
  ...sniperSkins,
  ...cannonSkins,
  ...machineSkins,
  ...ballistaSkins,
  ...shotgunSkins,
  ...frostSkins,
  ...poisonSkins,
  ...laserSkins,
  ...lightningSkins,
  ...flameSkins,
  ...moneySkins,
  ...windSkins,
  ...pulseSkins,
  ...stormSkins,
  ...plagueSkins,
  ...demolisherSkins,
  ...tempestSkins,
  ...universalSkins,
];

// 按塔類型分組的皮膚
export const SKINS_BY_TOWER: Record<TowerType | 'all', TowerSkin[]> = {
  basic: basicSkins,
  sniper: sniperSkins,
  cannon: cannonSkins,
  machine: machineSkins,
  ballista: ballistaSkins,
  shotgun: shotgunSkins,
  frost: frostSkins,
  poison: poisonSkins,
  laser: laserSkins,
  lightning: lightningSkins,
  flame: flameSkins,
  money: moneySkins,
  wind: windSkins,
  pulse: pulseSkins,
  storm: stormSkins,
  plague: plagueSkins,
  demolisher: demolisherSkins,
  tempest: tempestSkins,
  all: universalSkins,
};

// 取得皮膚
export const getSkin = (skinId: string): TowerSkin | undefined => {
  return ALL_SKINS.find(s => s.id === skinId);
};

// 取得塔可用的所有皮膚
export const getSkinsForTower = (towerType: TowerType): TowerSkin[] => {
  return ALL_SKINS.filter(s => s.towerType === towerType || s.towerType === 'all');
};

// 取得預設皮膚 ID
export const getDefaultSkinId = (towerType: TowerType): string => {
  return `${towerType}_default`;
};
