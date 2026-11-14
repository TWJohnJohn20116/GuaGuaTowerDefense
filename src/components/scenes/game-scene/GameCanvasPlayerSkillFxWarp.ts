/**
 * GameCanvasPlayerSkillFxWarp.ts - 傳送陷阱（Warp Trap）2D 釋放動畫
 *
 * 北歐極簡幾何風：紫紅 (#e879f9) 雙端六角傳送門
 *  - 起點傳送門：六角環展開後收縮（敵人被吸入）
 *  - 虛線軌跡：由起點往回沿直線生長至落點
 *  - 落點傳送門：六角環擴張 + 頂點光珠 + 中心閃光（敵人落地）
 *
 * 由 GameCanvasPlayerSkillFx.ts 匯入使用（拆檔以控制單檔行數）。
 */

type DrawCtx = CanvasRenderingContext2D;

const WARP_FUCHSIA = '#e879f9';
const WARP_FUCHSIA_LIGHT = '#f5d0fe';
const WARP_WHITE = '#f4f7fb';

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

export function drawWarpTrap(
  ctx: DrawCtx,
  progress: number,
  tileSize: number,
  offsetX: number,
  offsetY: number,
  warpJumps?: Array<{ fromX: number; fromY: number; toX: number; toY: number }>,
): void {
  if (!warpJumps || warpJumps.length === 0) return;

  for (let i = 0; i < warpJumps.length; i++) {
    const jump = warpJumps[i];
    const fx = offsetX + jump.fromX * tileSize + tileSize / 2;
    const fy = offsetY + jump.fromY * tileSize + tileSize / 2;
    const tx = offsetX + jump.toX * tileSize + tileSize / 2;
    const ty = offsetY + jump.toY * tileSize + tileSize / 2;
    drawSingleWarp(ctx, fx, fy, tx, ty, progress, tileSize, i);
  }
}

function drawSingleWarp(
  ctx: DrawCtx,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  progress: number,
  tileSize: number,
  index: number,
): void {
  ctx.save();
  ctx.lineCap = 'round';

  // ===== 起點傳送門（0 ~ 0.5：展開即收縮，敵人被吸入） =====
  if (progress < 0.5) {
    const t = progress / 0.5;
    // 環半徑：快速展開（0~0.3）後收縮（0.3~1）
    const expand = Math.min(1, t / 0.3);
    const shrink = t > 0.3 ? (t - 0.3) / 0.7 : 0;
    const r = tileSize * 0.55 * easeOut(expand) * (1 - shrink * 0.92);
    const a = 0.85 * (1 - shrink * 0.65);
    if (r > 0.5) {
      ctx.strokeStyle = WARP_FUCHSIA + alphaHex(a);
      ctx.lineWidth = 2.4;
      ctx.shadowColor = WARP_FUCHSIA;
      ctx.shadowBlur = 14;
      hexPath(ctx, fromX, fromY, r, t * Math.PI * 1.6);
      ctx.stroke();

      // 內環反向旋轉
      ctx.strokeStyle = WARP_FUCHSIA_LIGHT + alphaHex(a * 0.7);
      ctx.lineWidth = 1.3;
      ctx.shadowBlur = 8;
      hexPath(ctx, fromX, fromY, r * 0.62, -t * Math.PI * 2.2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }

  // ===== 虛線回溯軌跡（0.15 ~ 0.7：由起點往落點生長後淡出） =====
  if (progress > 0.15 && progress < 0.7) {
    const t = (progress - 0.15) / 0.55;
    const grow = Math.min(1, t / 0.55);
    const fade = t > 0.55 ? 1 - (t - 0.55) / 0.45 : 1;
    const ex = fromX + (toX - fromX) * easeOut(grow);
    const ey = fromY + (toY - fromY) * easeOut(grow);
    ctx.strokeStyle = WARP_FUCHSIA + alphaHex(0.55 * fade);
    ctx.lineWidth = 1.8;
    ctx.setLineDash([6, 5]);
    ctx.lineDashOffset = -progress * 40;
    ctx.shadowColor = WARP_FUCHSIA;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(ex, ey);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.shadowBlur = 0;
  }

  // ===== 落點傳送門（0.4 ~ 1：擴張六角環 + 頂點光珠 + 中心閃光） =====
  if (progress > 0.4) {
    const t = (progress - 0.4) / 0.6;
    const ringR = tileSize * (0.2 + easeOut(t) * 0.6);
    const a = 1 - t;
    const rot = t * Math.PI * 1.2 + index;

    ctx.strokeStyle = WARP_FUCHSIA + alphaHex(a * 0.9);
    ctx.lineWidth = 2.4;
    ctx.shadowColor = WARP_FUCHSIA;
    ctx.shadowBlur = 16 * a;
    hexPath(ctx, toX, toY, ringR, rot);
    ctx.stroke();

    // 頂點光珠
    ctx.fillStyle = WARP_WHITE + alphaHex(a * 0.9);
    for (let k = 0; k < 6; k++) {
      const ang = (Math.PI / 3) * k - Math.PI / 2 + rot;
      ctx.beginPath();
      ctx.arc(toX + Math.cos(ang) * ringR, toY + Math.sin(ang) * ringR, 2 * a + 0.6, 0, Math.PI * 2);
      ctx.fill();
    }

    // 中心閃光（落地瞬間最亮）
    const flash = Math.max(0, 1 - t / 0.45);
    if (flash > 0) {
      hexPath(ctx, toX, toY, tileSize * 0.2 * flash, -rot);
      ctx.fillStyle = WARP_FUCHSIA_LIGHT + alphaHex(flash * 0.9);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  ctx.restore();
}
