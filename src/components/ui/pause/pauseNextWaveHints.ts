/**
 * 下波預覽 · 克制與塔種對照
 */

import type { TowerType } from '@/types/game';
import { TOWER_DATA } from '@/data/gameData';

/** 百科 counterReasons 鍵 → 塔種類型 */
export const COUNTER_KEY_TO_TOWER: Record<string, TowerType> = {
  basic: 'basic',
  frost: 'frost',
  machine: 'machine',
  sniper: 'sniper',
  laser: 'laser',
  poison: 'poison',
  cannon: 'cannon',
  lightning: 'lightning',
  flame: 'flame',
  shotgun: 'shotgun',
  ballista: 'ballista',
  wind: 'wind',
  pulse: 'pulse',
};

export function getCounterTowerName(key: string): string {
  const towerType = COUNTER_KEY_TO_TOWER[key];
  if (towerType && TOWER_DATA[towerType]) {
    return TOWER_DATA[towerType].name;
  }
  return key;
}

export interface CounterHint {
  towerKey: string;
  towerType: TowerType | null;
  towerName: string;
  reason: string;
  owned: boolean;
}

export function buildCounterHints(
  counterReasons: Record<string, string> | undefined,
  ownedTowerTypes: Set<TowerType>,
): CounterHint[] {
  if (!counterReasons) return [];
  return Object.entries(counterReasons).map(([key, reason]) => {
    const towerType = COUNTER_KEY_TO_TOWER[key] ?? null;
    return {
      towerKey: key,
      towerType,
      towerName: getCounterTowerName(key),
      reason,
      owned: towerType ? ownedTowerTypes.has(towerType) : false,
    };
  });
}
