/**
 * 皮膚系統 · 共用工具
 */
import type { TowerSkin, SkinRarity } from '@/types/skin';
import type { TowerType } from '@/types/game';

export type SkinFilterMode = 'all' | 'unlocked' | 'locked' | 'equipped' | 'favorite';

/** 稀有度篩選 */
export type SkinRarityFilter = 'all' | SkinRarity;

/** 排序模式 */
export type SkinSortMode = 'default' | 'rarity' | 'name' | 'tower';

/** 皮膚預覽動畫模式 */
export type SkinPreviewAnimMode = 'idle' | 'attack';

/** 工具列分頁（對齊商店 towers / skills） */
export type SkinTab = 'library' | 'favorites' | 'sets';

/** 塔分類篩選（對齊商店 all / basic / special） */
export type TowerGroupFilter = 'all' | 'basic' | 'element' | 'fusion';

const BASIC_TOWER_GROUP: TowerType[] = [
  'basic', 'sniper', 'cannon', 'machine', 'shotgun', 'ballista',
];

const ELEMENT_TOWER_GROUP: TowerType[] = [
  'frost', 'poison', 'laser', 'lightning', 'flame', 'money', 'wind', 'pulse',
];

const FUSION_TOWER_GROUP: TowerType[] = [
  'storm', 'plague', 'demolisher', 'tempest',
];

export const ALL_TOWER_TYPES: TowerType[] = [
  'basic', 'sniper', 'cannon', 'machine', 'shotgun', 'ballista',
  'frost', 'poison', 'laser', 'lightning', 'flame', 'money', 'wind', 'pulse',
  'storm', 'plague', 'demolisher', 'tempest',
];

export function getSkinsForTowerGroup(group: TowerGroupFilter): TowerType[] {
  if (group === 'basic') return BASIC_TOWER_GROUP;
  if (group === 'element') return ELEMENT_TOWER_GROUP;
  if (group === 'fusion') return FUSION_TOWER_GROUP;
  return ALL_TOWER_TYPES;
}

export const TOWER_TYPES: (TowerType | 'all')[] = [
  'all', 'basic', 'sniper', 'cannon', 'machine', 'shotgun', 'ballista',
  'frost', 'poison', 'laser', 'lightning', 'flame', 'money', 'wind', 'pulse',
  'storm', 'plague', 'demolisher', 'tempest',
];

export function getPreviewTower(skin: TowerSkin): TowerType {
  if (skin.towerType === 'all') return 'basic';
  return skin.towerType as TowerType;
}

const RARITY_ORDER: SkinRarity[] = ['legendary', 'epic', 'rare', 'uncommon', 'common'];

export const SKIN_RARITY_FILTER_OPTIONS: { id: SkinRarityFilter; label: string }[] = [
  { id: 'all', label: '全部稀有度' },
  { id: 'legendary', label: '傳說' },
  { id: 'epic', label: '史詩' },
  { id: 'rare', label: '稀有' },
  { id: 'uncommon', label: '優良' },
  { id: 'common', label: '普通' },
];

export const SKIN_SORT_OPTIONS: { id: SkinSortMode; label: string }[] = [
  { id: 'default', label: '預設' },
  { id: 'rarity', label: '稀有度' },
  { id: 'name', label: '名稱' },
  { id: 'tower', label: '塔種' },
];

export function sortSkins(
  skins: TowerSkin[],
  mode: SkinSortMode,
  favorites: string[],
  isSkinEquipped: (id: string) => boolean,
  isSkinUnlocked: (id: string) => boolean,
): TowerSkin[] {
  const list = [...skins];
  if (mode === 'default') {
    return list.sort((a, b) => {
      const aFav = favorites.includes(a.id) ? 1 : 0;
      const bFav = favorites.includes(b.id) ? 1 : 0;
      if (aFav !== bFav) return bFav - aFav;
      const aEquipped = isSkinEquipped(a.id) ? 1 : 0;
      const bEquipped = isSkinEquipped(b.id) ? 1 : 0;
      if (aEquipped !== bEquipped) return bEquipped - aEquipped;
      const aUnlocked = isSkinUnlocked(a.id) ? 1 : 0;
      const bUnlocked = isSkinUnlocked(b.id) ? 1 : 0;
      if (aUnlocked !== bUnlocked) return bUnlocked - aUnlocked;
      return RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity);
    });
  }
  if (mode === 'rarity') {
    return list.sort((a, b) => RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity));
  }
  if (mode === 'name') {
    return list.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hant'));
  }
  return list.sort((a, b) => {
    const ta = a.towerType === 'all' ? 'zzz' : a.towerType;
    const tb = b.towerType === 'all' ? 'zzz' : b.towerType;
    return ta.localeCompare(tb) || a.name.localeCompare(b.name, 'zh-Hant');
  });
}
