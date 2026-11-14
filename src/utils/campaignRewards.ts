/**
 * 戰役通關獎勵
 *
 * 關卡資料裡的金幣／天賦點數字過大，僅作歷史欄位保留。
 * 實際發放：現有結算公式的金幣 + 星等天賦點 + 可購買塔解鎖。
 */

import type { TowerType } from '@/types/game';

export const PURCHASABLE_TOWER_TYPES: TowerType[] = [
  'sniper', 'cannon', 'machine', 'shotgun', 'ballista',
  'frost', 'poison', 'laser', 'lightning', 'flame',
  'money', 'wind', 'pulse',
];

const PURCHASABLE_SET = new Set<string>(PURCHASABLE_TOWER_TYPES);

export function isPurchasableTowerType(id: string): id is TowerType {
  return PURCHASABLE_SET.has(id);
}

export function sanitizeUnlockTowers(ids: string[] | undefined): TowerType[] {
  if (!ids || ids.length === 0) return [];
  const seen = new Set<TowerType>();
  const result: TowerType[] = [];
  for (const id of ids) {
    if (!isPurchasableTowerType(id) || seen.has(id)) continue;
    seen.add(id);
    result.push(id);
  }
  return result;
}

export function talentPointsFromStars(stars: number): number {
  return stars >= 3 ? 2 : 1;
}

export interface CampaignVictoryGrant {
  coins: number;
  talentPoints: number;
  unlockedTowers: TowerType[];
}

export function resolveCampaignVictoryGrant(opts: {
  formulaCoins: number;
  stars: number;
  unlockTower?: string[];
}): CampaignVictoryGrant {
  return {
    coins: opts.formulaCoins,
    talentPoints: talentPointsFromStars(opts.stars),
    unlockedTowers: sanitizeUnlockTowers(opts.unlockTower),
  };
}
