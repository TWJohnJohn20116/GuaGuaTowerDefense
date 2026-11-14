import type { TowerType, GridPosition, Tile, TowerData } from '@/types/game';
import { GAME_CONSTANTS } from '@/data/gameData';

interface TacticalScore {
  row: number;
  col: number;
  score: number;
  recommendation: 'best' | 'good' | 'fair' | 'poor';
}

interface TacticalScoreParams {
  grid: Tile[][];
  waypoints: GridPosition[];
  tileSize: number;
  selectedTowerType: TowerType | null;
  getTowerData: (type: TowerType | string) => TowerData | null;
}

// 將路徑各段的整數格座標展開成連續的路徑點清單
function buildPathPoints(waypoints: GridPosition[]): GridPosition[] {
  const pathPoints: GridPosition[] = [];
  for (let i = 0; i < waypoints.length - 1; i++) {
    const start = waypoints[i];
    const end = waypoints[i + 1];

    const dx = Math.sign(end.col - start.col);
    const dy = Math.sign(end.row - start.row);

    let col = start.col;
    let row = start.row;

    while (col !== end.col || row !== end.row) {
      pathPoints.push({ col, row });
      if (col !== end.col) col += dx;
      if (row !== end.row) row += dy;
    }
    pathPoints.push({ col: end.col, row: end.row });
  }
  return pathPoints;
}

// 解析選定塔的射程（格單位；未選或查不到時退回預設 3 格）
function resolveTowerRange(
  selectedTowerType: TowerType | null,
  getTowerData: (type: TowerType | string) => TowerData | null,
): number {
  return selectedTowerType ? getTowerData(selectedTowerType)?.range || 3 : 3;
}

// 統計射程內覆蓋到的路徑點數量（覆蓋越多代表火力越能涵蓋路線）
// 注意：towerRange 與格距離同為「格」單位，比較時兩者都乘 tileSize 換為像素
function countPathCoverage(
  cell: GridPosition,
  pathPoints: GridPosition[],
  tileSize: number,
  towerRange: number,
): number {
  let coverage = 0;
  const rangePx = towerRange * tileSize;
  for (const point of pathPoints) {
    const dx = (cell.col - point.col) * tileSize;
    const dy = (cell.row - point.row) * tileSize;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance <= rangePx) coverage += 1;
  }
  return coverage;
}

// 與既有塔過近的懲罰（避免塔擠在一起）
function computeProximityPenalty(grid: Tile[][], cell: GridPosition): number {
  let penalty = 0;
  for (let r = 0; r < GAME_CONSTANTS.GRID_ROWS; r++) {
    for (let c = 0; c < GAME_CONSTANTS.GRID_COLS; c++) {
      if (!grid[r]?.[c]?.towerId) continue;
      const dx = cell.col - c;
      const dy = cell.row - r;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 2) penalty += 3 - distance;
    }
  }
  return penalty;
}

// 將戰術分數轉成推薦等級
function scoreToRecommendation(score: number): TacticalScore['recommendation'] {
  if (score >= 10) return 'best';
  if (score >= 6) return 'good';
  if (score >= 3) return 'fair';
  return 'poor';
}

export const calculateTacticalScores = (params: TacticalScoreParams): TacticalScore[] => {
  const { grid, waypoints, tileSize, selectedTowerType, getTowerData } = params;
  const scores: TacticalScore[] = [];

  if (!waypoints.length || !tileSize) return scores;

  const pathPoints = buildPathPoints(waypoints);
  const towerRange = resolveTowerRange(selectedTowerType, getTowerData);

  // 計算每個空格的戰術分數
  for (let row = 0; row < GAME_CONSTANTS.GRID_ROWS; row++) {
    for (let col = 0; col < GAME_CONSTANTS.GRID_COLS; col++) {
      const tile = grid[row]?.[col];
      if (!tile || tile.type !== 'empty' || tile.towerId) continue;

      const cell: GridPosition = { col, row };
      const pathCoverage = countPathCoverage(cell, pathPoints, tileSize, towerRange);
      const towerProximityPenalty = computeProximityPenalty(grid, cell);
      const score = pathCoverage - towerProximityPenalty;

      if (score > 0) {
        scores.push({ row, col, score, recommendation: scoreToRecommendation(score) });
      }
    }
  }

  // 排序（分數高的在前）
  scores.sort((a, b) => b.score - a.score);

  return scores;
};
