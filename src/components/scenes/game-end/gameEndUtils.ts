/**
 * 結算畫面 · 成就相關工具函式
 */

import { getCatalogAchievements } from '@/store/achievementStoreCheck';
import type { Achievement, AchievementStatus } from '@/types/achievement';

export interface NearMissEntry {
  achievement: Achievement;
  pct: number;
  progress: number[];
}

export function pickNearMissAchievements(
  getStatus: (id: string) => AchievementStatus,
  getPct: (id: string) => number,
  getProgress: (id: string) => number[],
  options?: { limit?: number; minPct?: number },
): NearMissEntry[] {
  const { limit = 3, minPct = 35 } = options ?? {};

  return getCatalogAchievements()
    .filter((a) => {
      if (a.hidden || a.secret) return false;
      const status = getStatus(a.id);
      if (status === 'completed' || status === 'claimed') return false;
      const pct = getPct(a.id);
      return pct >= minPct && pct < 100;
    })
    .map((a) => ({
      achievement: a,
      pct: getPct(a.id),
      progress: getProgress(a.id),
    }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, limit);
}

/** 取最接近完成的條目進度文字 */
export function formatNearestProgressText(
  achievement: Achievement,
  progress: number[],
): string {
  const conditions = achievement.conditions;
  if (conditions.length === 0) return '';

  let bestIdx = 0;
  let bestRatio = -1;

  conditions.forEach((c, i) => {
    const cur = progress[i] ?? 0;
    const ratio = c.target > 0 ? cur / c.target : 0;
    if (ratio > bestRatio && ratio < 1) {
      bestRatio = ratio;
      bestIdx = i;
    }
  });

  const c = conditions[bestIdx];
  const cur = Math.min(progress[bestIdx] ?? 0, c.target);
  return `${cur} / ${c.target}`;
}
