/**
 * 戰術建議：在自由場地上取樣「射程能覆蓋多少路徑」的候選點。
 *
 * 舊版逐格掃 15×11，判定條件是 `tile.type === 'empty'`；
 * 自由制沒有格子，改成整格步長取樣 + 圓形淨空過濾，
 * 分數用「塔中心到路徑折線的距離」直接算，跟放置判定吃同一套幾何。
 */
import type { PathConfig, Tower, TowerData, TowerType } from '@/types/game';
import {
  DEFAULT_TOWER_RADIUS,
  boundsOf,
  circlesOverlap,
  isBlockedAt,
  pathClearance,
  pathWidthOf,
} from '@/data/mapGeometry';

export interface TacticalScore {
  x: number;
  y: number;
  score: number;
  recommendation: 'best' | 'good' | 'fair' | 'poor';
}

interface TacticalScoreParams {
  path: PathConfig | null;
  towers: Tower[];
  selectedTowerType: TowerType | null;
  getTowerData: (type: TowerType | string) => TowerData | null;
}

// 解析選定塔的射程（格單位；未選或查不到時退回預設 3 格）
const resolveTowerRange = (
  selectedTowerType: TowerType | null,
  getTowerData: (type: TowerType | string) => TowerData | null,
): number => (selectedTowerType ? getTowerData(selectedTowerType)?.range || 3 : 3);

// 與既有塔過近的懲罰（避免塔擠在一起）
const computeProximityPenalty = (towers: Tower[], x: number, y: number): number => {
  let penalty = 0;
  for (const tower of towers) {
    const dx = x - tower.pos.x;
    const dy = y - tower.pos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < 2) penalty += 3 - distance;
  }
  return penalty;
};

const scoreToRecommendation = (score: number): TacticalScore['recommendation'] => {
  if (score >= 10) return 'best';
  if (score >= 6) return 'good';
  if (score >= 3) return 'fair';
  return 'poor';
};

export const calculateTacticalScores = (params: TacticalScoreParams): TacticalScore[] => {
  const { path, towers, selectedTowerType, getTowerData } = params;
  const scores: TacticalScore[] = [];
  if (!path) return scores;

  const bounds = boundsOf(path);
  const clearance = pathWidthOf(path) / 2 + DEFAULT_TOWER_RADIUS;
  const towerRange = resolveTowerRange(selectedTowerType, getTowerData);

  for (let y = 0.5; y < bounds.height; y += 1) {
    for (let x = 0.5; x < bounds.width; x += 1) {
      const point = { x, y };
      if (pathClearance(path, point) < clearance) continue;
      if (isBlockedAt(path, point, DEFAULT_TOWER_RADIUS)) continue;
      if (towers.some((t) => circlesOverlap(point, DEFAULT_TOWER_RADIUS, t.pos, t.radius))) continue;

      const distance = pathClearance(path, point);
      // 距離路徑越近、覆蓋越久；上限 8 分，跟舊版 countPathCoverage 的量級對齊
      const coverage = distance < towerRange ? ((towerRange - distance) / towerRange) * 8 : 0;
      const score = coverage - computeProximityPenalty(towers, x, y);
      if (score > 0) scores.push({ x, y, score, recommendation: scoreToRecommendation(score) });
    }
  }

  scores.sort((a, b) => b.score - a.score);
  return scores;
};
