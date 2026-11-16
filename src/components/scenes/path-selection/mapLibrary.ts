/**
 * 選圖 · 地圖清單（純資料／純函式）
 *
 * 這裡只做三件事：定義清單項目的形狀、過濾、挑預設選取。
 * 不含 React、不碰 store——資料怎麼來由場景主檔決定（進階／Mod／工坊三條來源）。
 */

import type { PathConfig } from '@/types/game';

/** 地圖來源分類。順序就是 TopBar 上的 Chip 順序。 */
export type MapCategory = 'advanced' | 'mod' | 'workshop';

export const CATEGORY_ORDER: MapCategory[] = ['advanced', 'mod', 'workshop'];

export interface MapItemData {
  key: string;
  path: PathConfig;
  name: string;
  /** 地圖原生難度（PathConfig.difficulty 的中文鍵），與玩家選的 GameDifficulty 不同 */
  difficulty: string;
  description?: string;
  type: MapCategory;
  modName?: string;
  isLocked?: boolean;
}

interface MapFilter {
  query: string;
  /** 空集合＝不過濾；多選取聯集 */
  difficulties: ReadonlySet<string>;
}

/** 名稱／來源／難度三欄比對；空查詢＝全部通過 */
export function filterMapItems(items: MapItemData[], filter: MapFilter): MapItemData[] {
  const q = filter.query.trim().toLowerCase();
  return items.filter((item) => {
    if (filter.difficulties.size > 0 && !filter.difficulties.has(item.difficulty)) return false;
    if (!q) return true;
    return (
      item.name.toLowerCase().includes(q) ||
      (item.modName ? item.modName.toLowerCase().includes(q) : false) ||
      item.difficulty.toLowerCase().includes(q)
    );
  });
}

/** 篩選晶片只列這批地圖真的有的難度，並維持資料層既定順序 */
export function listAvailableDifficulties(items: MapItemData[], order: string[]): string[] {
  const present = new Set(items.map((item) => item.difficulty));
  return order.filter((difficulty) => present.has(difficulty));
}

/** 卡片牆依序顯示，但鎖定的往後排，避免玩家一進來就撞牆 */
export function sortForWall(items: MapItemData[]): MapItemData[] {
  const unlocked: MapItemData[] = [];
  const locked: MapItemData[] = [];
  items.forEach((item) => (item.isLocked ? locked : unlocked).push(item));
  return [...unlocked, ...locked];
}
