import type { TowerType } from '@/types/game';

/**
 * 融合配方表
 *
 * 每條配方描述「哪兩種塔可以合體」以及「合體後產生哪種融合塔」。
 * 配方以「無序對」表示（a+b 與 b+a 視為同一配方），查詢時統一排序後比對。
 *
 * 設計原則：
 * - 融合塔在 TOWER_DATA 中擁有完整屬性，並可繼續走升級分支、保有主動技能。
 * - 融合塔不會出現在商店 / 側欄建造清單，只能由兩座已建造的塔合體產生。
 * - 融合費用為兩座來源塔「當前價值」的一部分（見 gameStoreActions.fuseTowers）。
 */
export interface FusionRecipe {
  /** 來源塔 A（無序） */
  a: TowerType;
  /** 來源塔 B（無序） */
  b: TowerType;
  /** 合體產物 */
  result: TowerType;
  /** 展示用配方名稱（如「冰雷合體」） */
  label: string;
  /** 簡短說明 */
  description: string;
}

export const FUSION_RECIPES: FusionRecipe[] = [
  {
    a: 'frost',
    b: 'lightning',
    result: 'storm',
    label: '冰雷合體',
    description: '冰凍與電擊融合，雷擊連鎖並附帶減速，控場爆發兼備',
  },
  {
    a: 'poison',
    b: 'flame',
    result: 'plague',
    label: '毒焰合體',
    description: '毒與火焰融合，同時施加灼燒與劇毒，持續剝血無解',
  },
  {
    a: 'cannon',
    b: 'sniper',
    result: 'demolisher',
    label: '炮狙合體',
    description: '加農炮與狙擊融合，遠程重型彈幕造成大範圍濺射',
  },
  {
    a: 'wind',
    b: 'pulse',
    result: 'tempest',
    label: '風脈合體',
    description: '風與脈衝融合，能量環爆發同時將敵人強力吹離路徑',
  },
];

/** 將一對塔型別正規化為排序後的 key，用於無序比對 */
const recipeKey = (x: TowerType, y: TowerType): string =>
  [x, y].sort().join('+');

const RECIPE_MAP = new Map<string, FusionRecipe>(
  FUSION_RECIPES.map((r) => [recipeKey(r.a, r.b), r]),
);

/**
 * 查詢兩座塔型別是否可以合體，可則回傳配方，否則回傳 null。
 */
export const getFusionRecipe = (
  x: TowerType,
  y: TowerType,
): FusionRecipe | null => {
  return RECIPE_MAP.get(recipeKey(x, y)) ?? null;
};

/**
 * 查詢某座塔可以與哪些塔型別合體（用於 UI 提示）。
 */
export const getFusionPartners = (type: TowerType): TowerType[] => {
  const partners: TowerType[] = [];
  for (const r of FUSION_RECIPES) {
    if (r.a === type) partners.push(r.b);
    else if (r.b === type) partners.push(r.a);
  }
  return partners;
};

/** 判斷某塔型別是否為融合塔 */
export const isFusionTower = (type: TowerType): boolean =>
  FUSION_RECIPES.some((r) => r.result === type);

/** 融合費用：兩座來源塔基礎成本各 25%，再乘難度造價倍率。 */
export function computeFusionCost(
  sourceCost: number,
  targetCost: number,
  towerCostMult = 1,
): number {
  return Math.round((sourceCost + targetCost) * 0.25 * towerCostMult);
}
