/**
 * 敵人資料解析的注入點。
 *
 * data 層（enemyVisibility、renderSnapshot）不能 import store，但自訂敵人需要
 * 「內建 → mod」的解析；因此由 store 層注入解析器，data 層只負責呼叫。
 */
import { ENEMY_DATA } from './gameData';
import type { EnemyData, EnemyType } from '@/types/game';

type EnemyDataResolver = (type: string) => EnemyData | undefined;

let resolver: EnemyDataResolver | null = null;

/** 由 store 層注入（見 store/gameStoreUtils 的 getEnemyData）；傳 null 可還原 */
export function setEnemyDataResolver(next: EnemyDataResolver | null): void {
  resolver = next;
}

/** 解析敵人資料：注入的解析器優先，其次內建，最後退回 normal（永不回 undefined） */
export function resolveEnemyData(type: string): EnemyData {
  const injected = resolver?.(type);
  if (injected) return injected;
  return ENEMY_DATA[type as EnemyType] ?? ENEMY_DATA.normal;
}
