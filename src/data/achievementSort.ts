import type { Achievement } from '@/types/achievement';

/**
 * 成就排序的唯一比較器
 *
 * 資料層有 682 個成就、`order` 欄位卻只有 439 個不同值（144 次碰撞，
 * 其中 order: 1 / 2 / 3 各被 12 個成就共用）。只比 order 的話，
 * 同分項目的順序取決於「模組載入順序」——也就是看起來隨機。
 *
 * 這裡補上兩層穩定鍵：分類 → id。整個排序與輸入順序無關，
 * 換 build、換 import 順序、換平台都不會讓成就館的格子跳位。
 */
export const compareAchievements = (a: Achievement, b: Achievement): number =>
  (a.order ?? 0) - (b.order ?? 0) ||
  a.category.localeCompare(b.category, 'en') ||
  a.id.localeCompare(b.id, 'en');

/** 依穩定鍵排序並回傳新陣列（不改動來源） */
export const sortAchievements = (list: readonly Achievement[]): Achievement[] =>
  [...list].sort(compareAchievements);
