import type { TowerType } from '@/types/game';
import { TOWER_DATA } from '@/data/gameData';

/**
 * 有效 DPS（估值用）：把暴擊、連鎖、濺射換算成期望總輸出。
 * 只用「傷害 × 攻速」會低估帶效果的高階塔，讓 AI 永遠選基礎塔。
 */
export const effectiveDps = (type: TowerType, level: number): number => {
  const d = TOWER_DATA[type];
  if (!d) return 0;
  const base = d.damagePerSecond ?? d.damage * (d.fireRate ?? 1);
  const crit = 1 + (d.critChance ?? 0) * ((d.critMultiplier ?? 1) - 1);
  const chain = 1 + 0.7 * Math.max(0, (d.chainCount ?? 1) - 1);
  const splash = d.splash ? 1.25 : 1;
  return base * crit * chain * splash * (1 + (level - 1) * 0.25);
};
