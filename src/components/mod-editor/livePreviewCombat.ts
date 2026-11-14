/**
 * LivePreview 戰鬥定位與塔瞄準
 */
import type { CustomTowerData } from '@/types/game';

export const PREVIEW_RANGE_SCALE = 0.3;
export const TOWER_COLS = 2;

export function getTowerCanvasPos(index: number): { x: number; y: number } {
  const col = index % TOWER_COLS;
  const row = Math.floor(index / TOWER_COLS);
  return { x: 60 + col * 100, y: 80 + row * 100 };
}

export function getPreviewTowerRange(tower: CustomTowerData): number {
  return tower.range * PREVIEW_RANGE_SCALE;
}

export interface BattleTarget {
  instanceId: number;
  x: number;
  y: number;
}

export function findNearestTargetInRange(
  towerIndex: number,
  tower: CustomTowerData,
  targets: BattleTarget[],
): number | null {
  const tpos = getTowerCanvasPos(towerIndex);
  const range = getPreviewTowerRange(tower);
  let bestId: number | null = null;
  let bestDist = Infinity;

  for (const target of targets) {
    const dist = Math.hypot(target.x - tpos.x, target.y - tpos.y);
    if (dist <= range && dist < bestDist) {
      bestDist = dist;
      bestId = target.instanceId;
    }
  }

  return bestId;
}

export function getTowerCooldownTicks(tower: CustomTowerData): number {
  return Math.max(4, Math.round((tower.fireRate ?? 800) / 50));
}

export function drawTowerRangeRing(
  ctx: CanvasRenderingContext2D,
  tower: CustomTowerData,
  x: number,
  y: number,
  options: { active?: boolean; locked?: boolean } = {},
) {
  const range = getPreviewTowerRange(tower);
  ctx.beginPath();
  ctx.arc(x, y, range, 0, Math.PI * 2);
  if (options.locked) {
    ctx.fillStyle = tower.color + '18';
    ctx.fill();
    ctx.strokeStyle = tower.color + '70';
    ctx.lineWidth = 1.5;
  } else if (options.active) {
    ctx.fillStyle = tower.color + '12';
    ctx.fill();
    ctx.strokeStyle = tower.color + '35';
    ctx.lineWidth = 1;
  } else {
    ctx.strokeStyle = tower.color + '20';
    ctx.lineWidth = 1;
  }
  ctx.stroke();
}
