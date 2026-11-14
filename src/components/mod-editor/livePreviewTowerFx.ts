/**
 * LivePreview · 造塔／拆塔動畫
 */
type TowerDeployFxMode = 'deploy' | 'undeploy';

const TOWER_DEPLOY_FX_FRAMES = 18;

export function triggerTowerDeployFx(
  prev: Record<number, { mode: TowerDeployFxMode; frames: number }>,
  index: number,
  mode: TowerDeployFxMode,
): Record<number, { mode: TowerDeployFxMode; frames: number }> {
  return { ...prev, [index]: { mode, frames: TOWER_DEPLOY_FX_FRAMES } };
}

export function decayTowerDeployFx(
  prev: Record<number, { mode: TowerDeployFxMode; frames: number }>,
): Record<number, { mode: TowerDeployFxMode; frames: number }> {
  const next: Record<number, { mode: TowerDeployFxMode; frames: number }> = {};
  let changed = false;
  Object.entries(prev).forEach(([k, fx]) => {
    if (fx.frames > 1) {
      next[Number(k)] = { ...fx, frames: fx.frames - 1 };
      changed = true;
    }
  });
  return changed ? next : prev;
}

export function getTowerFxScale(frames: number): number {
  const t = frames / TOWER_DEPLOY_FX_FRAMES;
  return 1 + Math.sin(t * Math.PI) * 0.22;
}

export function drawTowerDeployRing(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  frames: number,
  mode: TowerDeployFxMode,
): void {
  const t = frames / TOWER_DEPLOY_FX_FRAMES;
  const radius = 18 + (1 - t) * 22;
  const alpha = t * 0.75;
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.strokeStyle = mode === 'deploy'
    ? `rgba(52, 211, 153, ${alpha})`
    : `rgba(251, 191, 36, ${alpha})`;
  ctx.lineWidth = 2 + t * 2;
  ctx.stroke();
  ctx.restore();
}
