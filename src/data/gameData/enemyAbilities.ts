import type { EnemyData } from '@/types/game';

/**
 * 敵人能力判定（純函式）
 *
 * `abilities` 陣列有值時以它為準（多能力組合），否則回退到單一旗標 `ability`。
 * 引擎與渲染端的能力判斷一律走這裡，避免「陣列寫了、單旗標沒寫」造成能力半生效。
 *
 * 空陣列視為「明確沒有能力」，不回退到 `ability`——否則編輯器把能力全部取消後，
 * 舊旗標會偷偷復活。
 */
export function hasEnemyAbility(
  data: Pick<EnemyData, 'ability' | 'abilities'> | null | undefined,
  ability: string,
): boolean {
  if (!data) return false;
  if (Array.isArray(data.abilities)) return data.abilities.includes(ability);
  return data.ability === ability;
}
