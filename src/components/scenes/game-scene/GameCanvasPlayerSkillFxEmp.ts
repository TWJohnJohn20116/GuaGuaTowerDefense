/**
 * 電磁脈衝畫面演出：青色六角脈衝環 + 盾面裂痕
 */

type DrawCtx = CanvasRenderingContext2D;

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const alphaHex = (a: number): string =>
  Math.max(0, Math.min(255, Math.round(a * 255))).toString(16).padStart(2, '0');

const hexPath = (ctx: DrawCtx, cx: number, cy: number, r: number, rotation = 0) => {
  ctx.beginPath();
  for (let k = 0; k < 6; k++) {
    const a = (Math.PI / 3) * k - Math.PI / 2 + rotation;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
};

export function drawEmpPulse(
  ctx: DrawCtx,
  progress: number,
  cw: number,
  ch: number,
): void {
  const cx = cw / 2;
  const cy = ch / 2;
  const maxR = Math.max(cw, ch) * 0.7;
  const t = easeOut(progress);
  ctx.save();
  for (let i = 0; i < 3; i++) {
    const phase = Math.min(1, Math.max(0, t * 1.35 - i * 0.16));
    if (phase <= 0 || phase >= 1) continue;
    const r = maxR * phase;
    const a = (1 - phase) * 0.5;
    ctx.strokeStyle = '#22d3ee' + alphaHex(a);
    ctx.lineWidth = 2 + (1 - phase) * 5;
    ctx.shadowColor = '#67e8f9';
    ctx.shadowBlur = 16 * (1 - phase);
    hexPath(ctx, cx, cy, r, progress * Math.PI * 0.4);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#f4f7fb' + alphaHex((1 - t) * 0.55);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - 28, cy - 18);
  ctx.lineTo(cx - 4, cy);
  ctx.lineTo(cx - 14, cy + 6);
  ctx.lineTo(cx + 26, cy + 22);
  ctx.stroke();
  ctx.restore();
}
