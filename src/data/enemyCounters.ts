import type { EnemyType, TowerType } from '@/types/game';

/** 敵人定位（教程／百科／AI 共用） */
export type EnemyRole = 'basic' | 'speed' | 'tank' | 'boss' | 'special';

/** 危險度（教程／百科／AI 共用） */
export type EnemyDanger = 'S' | 'A' | 'B' | 'C';

export interface EnemyCounterMeta {
  role: EnemyRole;
  danger: EnemyDanger;
  /** 對策塔（由强到弱排列，第一順位權重最高） */
  counters: TowerType[];
}

/**
 * 敵人 → 對策塔的單一真相。
 * 原本內嵌在 components/scenes/tutorial/TutorialPageData.ts，AI 自動戰鬥與百科都要用，
 * 因此上移到 data 層；教程頁改為直接 import，避免兩份漂移。
 */
export const ENEMY_COUNTER_META: Record<EnemyType, EnemyCounterMeta> = {
  normal: { role: 'basic', danger: 'C', counters: ['basic'] },
  fast: { role: 'speed', danger: 'B', counters: ['frost', 'machine'] },
  elite: { role: 'basic', danger: 'B', counters: ['sniper'] },
  speedy: { role: 'speed', danger: 'A', counters: ['frost', 'laser', 'lightning'] },
  tank: { role: 'tank', danger: 'B', counters: ['sniper', 'poison'] },
  heavy: { role: 'tank', danger: 'A', counters: ['laser', 'frost', 'poison'] },
  boss: { role: 'boss', danger: 'S', counters: ['frost', 'laser', 'sniper'] },
  flyer: { role: 'special', danger: 'A', counters: ['laser', 'sniper'] },
  healer: { role: 'special', danger: 'A', counters: ['sniper', 'laser'] },
  spawner: { role: 'special', danger: 'A', counters: ['cannon', 'lightning'] },
  shield: { role: 'special', danger: 'A', counters: ['machine', 'flame'] },
  stealth: { role: 'special', danger: 'B', counters: ['poison', 'flame', 'cannon'] },
  berserker: { role: 'special', danger: 'A', counters: ['sniper', 'frost'] },
  armored: { role: 'tank', danger: 'B', counters: ['sniper', 'poison', 'laser'] },
  mage: { role: 'special', danger: 'S', counters: ['frost', 'laser'] },
  miniboss: { role: 'boss', danger: 'A', counters: ['laser', 'frost'] },
  swarm: { role: 'speed', danger: 'B', counters: ['cannon', 'lightning', 'flame'] },
  ghost: { role: 'special', danger: 'A', counters: ['sniper', 'frost'] },
  bomber: { role: 'special', danger: 'B', counters: ['sniper', 'laser'] },
  saboteur: { role: 'special', danger: 'B', counters: ['frost', 'lightning'] },
  jammer: { role: 'special', danger: 'A', counters: ['sniper', 'laser'] },
  escort: { role: 'special', danger: 'A', counters: ['cannon', 'flame'] },
};

/** 對策塔清單；未登記的敵人（mod 自訂）回空陣列 */
const getEnemyCounters = (type: EnemyType): TowerType[] =>
  ENEMY_COUNTER_META[type]?.counters ?? [];

/**
 * 對位契合度 0..1：這個塔面對「這批敵人」有多對味。
 * 第一順位 1.0、第二 0.7、第三 0.45，其餘 0；再依敵人威脅權重加權平均。
 */
export const counterAffinity = (
  enemyWeights: { type: EnemyType; weight: number }[],
  tower: TowerType,
): number => {
  if (enemyWeights.length === 0) return 0;
  const ladder = [1, 0.7, 0.45];
  let totalWeight = 0;
  let score = 0;
  for (const item of enemyWeights) {
    const rank = getEnemyCounters(item.type).indexOf(tower);
    const affinity = rank >= 0 && rank < ladder.length ? ladder[rank] : 0;
    score += affinity * item.weight;
    totalWeight += item.weight;
  }
  return totalWeight > 0 ? score / totalWeight : 0;
};
