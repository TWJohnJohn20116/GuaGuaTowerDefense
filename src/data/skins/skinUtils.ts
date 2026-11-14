/**
 * 皮膚工具函式
 */

import type { SkinVisuals } from '@/types/skin';
import type { TowerType } from '@/types/game';
import { TOWER_DATA } from '../gameData';

// 取得塔的預設視覺配置
export const getDefaultVisuals = (towerType: TowerType): SkinVisuals => {
  const data = TOWER_DATA[towerType];
  return {
    color: data.color,
    projectileColor: data.projectileColor,
    highlightColor: data.highlightColor,
    idleAnimation: 'none',
    attackAnimation: 'none',
  };
};
