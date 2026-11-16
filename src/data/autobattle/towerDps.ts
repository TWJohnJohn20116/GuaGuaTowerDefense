import type { TowerType } from '@/types/game';
import { TOWER_DATA } from '@/data/gameData';

/**
 * 有效 DPS：把「不只是一個數字」的效果換算成期望輸出。
 *
 * - 暴擊：damage × (1 + critChance × (critMultiplier − 1))
 * - 連鎖：每多鏈一個目標，期望輸出增加（衰減 0.7）
 * - 濺射：命中多目標，按 1.25 倍估
 * - 等級：每級 +25%（與引擎升級公式一致）
 *
 * 決策層與基準都用這支，避免「AI 以為很強、實際打不出來」。
 */
export const effectiveDps = (type: TowerType, level: number): number => {
  const d = TOWER_DATA[type];
  if (!d) return 0;
  const base = d.damagePerSecond ?? d.damage * (d.fireRate ?? 1);
  const crit = 1 + (d.critChance ?? 0) * ((d.critMultiplier ?? 1) - 1);
  const chain = 1 + 0.7 * Math.max(0, (d.chainCount ?? 1) - 1);
  const splash = d.splash ? 1.25 : 1;
  const levelScale = 1 + (level - 1) * 0.25;
  return base * crit * chain * splash * levelScale;
};
