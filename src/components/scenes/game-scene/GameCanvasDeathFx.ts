/**
 * GameCanvasDeathFx.ts - 敵人死亡動畫繪製（碎裂物理風）
 *
 * 風格：被打碎的瞬間 → 三角碎片向外噴飛 → 重力下墜 → 落地淡出
 *
 * 構成層次：
 *  1. 衝擊閃光（前 80ms 的白色圓暈）
 *  2. Boss 地面血漬（最底層）
 *  3. 噴濺微粒（暗色點，模擬末屑與血滴）
 *  4. 三角碎片（拋物線運動 + 自旋 + 漸隱）
 *  5. Boss / 菁英強化的衝擊環
 */

import type { DeathAnimation, DeathShard } from '@/types/game';

const TWO_PI = Math.PI * 2;

const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

// 將十六進位顏色轉成 rgba 字串
const hexToRgba = (hex: string, alpha: number): string => {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return `rgba(239, 68, 68, ${alpha})`;
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// 取得敵人在畫面上的基礎半徑
const getDeathRadius = (size: number, tileSize: number): number => {
  return (size / 50) * tileSize * 0.4;
};

// ===== 1. 衝擊閃光（白圓暈） =====
const drawImpactFlash = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  baseRadius: number,
  color: string,
  flashProgress: number,
): void => {
  if (flashProgress >= 1) return;
  const alpha = (1 - flashProgress) * 0.85;
  const radius = baseRadius * (1 + flashProgress * 0.6);

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, TWO_PI);
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
  grad.addColorStop(0.5, hexToRgba(color, alpha * 0.65));
  grad.addColorStop(1, hexToRgba(color, 0));
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.restore();
};

// ===== 2. Boss 地面血漬 =====
const drawBossStain = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  baseRadius: number,
  color: string,
  progress: number,
): void => {
  const stainAlpha = (1 - progress * 0.8) * 0.5;
  const stainRadius = baseRadius * (1.4 + progress * 0.6);
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, stainRadius);
  grad.addColorStop(0, hexToRgba(color, stainAlpha));
  grad.addColorStop(0.55, hexToRgba(color, stainAlpha * 0.45));
  grad.addColorStop(1, hexToRgba(color, 0));

  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx, cy + baseRadius * 0.15, stainRadius, stainRadius * 0.4, 0, 0, TWO_PI);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.restore();
};

// ===== 3. 噴濺微粒（暗色） =====
const drawSplashSpecks = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  baseRadius: number,
  color: string,
  progress: number,
  count: number,
  seed: number,
): void => {
  ctx.save();
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * TWO_PI + seed * TWO_PI;
    // 沿初始角度向外飛，並受重力下墜
    const speed = baseRadius * (1.4 + ((i * 13 + seed * 31) % 1) * 1.4);
    const t = progress;
    const px = cx + Math.cos(angle) * speed * t;
    const py = cy + Math.sin(angle) * speed * t + baseRadius * t * t * 1.6;
    const alpha = (1 - progress) * 0.75;
    const r = baseRadius * 0.08 * (1 - progress * 0.4);

    ctx.beginPath();
    ctx.arc(px, py, r, 0, TWO_PI);
    ctx.fillStyle = hexToRgba(color, alpha);
    ctx.fill();
  }
  ctx.restore();
};

// ===== 4. 單顆碎片 =====
const drawShard = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  baseRadius: number,
  shard: DeathShard,
  elapsedSec: number,
  progress: number,
): void => {
  // 拋物線運動：x 等速，y 受重力（y 軸畫面向下為正）
  const px = cx + shard.vx * elapsedSec;
  const py = cy + shard.vy * elapsedSec + 0.5 * shard.gravity * elapsedSec * elapsedSec;
  const rot = shard.rotation + shard.vRot * elapsedSec;

  // 0~70%：完全不透明；70%~100%：線性淡出（讓碎片有「落地停留再消失」的感覺）
  let alpha: number;
  if (progress < 0.7) {
    alpha = 1;
  } else {
    alpha = 1 - (progress - 0.7) / 0.3;
  }
  if (alpha <= 0) return;

  const radius = baseRadius * shard.sizeMul;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(px, py);
  ctx.rotate(rot);

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(Math.cos(shard.angleStart) * radius, Math.sin(shard.angleStart) * radius);
  ctx.lineTo(Math.cos(shard.angleEnd) * radius, Math.sin(shard.angleEnd) * radius);
  ctx.closePath();

  ctx.fillStyle = shard.color;
  ctx.fill();

  ctx.lineWidth = 1.2;
  ctx.strokeStyle = shard.strokeColor;
  ctx.stroke();

  ctx.restore();
};

// ===== 5. 衝擊環（Boss / 菁英強化） =====
const drawShockRing = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  baseRadius: number,
  color: string,
  progress: number,
  scale: number,
): void => {
  if (progress >= 1) return;
  const ringProgress = easeOutCubic(progress);
  const radius = baseRadius * (0.4 + ringProgress * 2.2 * scale);
  const alpha = (1 - progress) * 0.7;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, TWO_PI);
  ctx.strokeStyle = hexToRgba(color, alpha);
  ctx.lineWidth = 2 + (1 - progress) * 3;
  ctx.shadowColor = color;
  ctx.shadowBlur = 14 * (1 - progress);
  ctx.stroke();
  ctx.restore();
};

// ===== 主入口：繪製所有死亡動畫 =====
export function drawDeathAnimations(
  ctx: CanvasRenderingContext2D,
  now: number,
  tileSize: number,
  offsetX: number,
  offsetY: number,
  deathAnimations: DeathAnimation[],
): void {
  if (deathAnimations.length === 0) return;

  for (const d of deathAnimations) {
    const elapsed = now - d.startTime;
    if (elapsed < 0 || elapsed >= d.duration) continue;

    const progress = Math.min(1, elapsed / d.duration);
    const elapsedSec = elapsed / 1000;

    const cx = offsetX + d.x * tileSize + tileSize / 2;
    const cy = offsetY + d.y * tileSize + tileSize / 2;
    const baseRadius = getDeathRadius(d.size, tileSize);

    // 1) 衝擊閃光（只在前 ~120ms 內顯眼）
    const flashProgress = Math.min(1, elapsed / 140);
    drawImpactFlash(ctx, cx, cy, baseRadius, d.color, flashProgress);

    // 2) Boss 血漬（最底層）
    if (d.isBoss) {
      drawBossStain(ctx, cx, cy, baseRadius, d.color, progress);
    }

    // 3) 噴濺微粒（暗色點）
    const speckCount = d.isBoss ? 18 : d.isElite ? 14 : 10;
    drawSplashSpecks(ctx, cx, cy, baseRadius, d.color, progress, speckCount, d.splashSeed);

    // 4) 三角碎片
    for (const shard of d.shards) {
      drawShard(ctx, cx, cy, baseRadius, shard, elapsedSec, progress);
    }

    // 5) Boss / 菁英額外衝擊環
    if (d.isBoss) {
      drawShockRing(ctx, cx, cy, baseRadius, d.color, progress, 1.7);
      const innerProg = Math.max(0, Math.min(1, (progress - 0.08) / 0.85));
      drawShockRing(ctx, cx, cy, baseRadius, '#ffffff', innerProg, 1.25);
    } else if (d.isElite) {
      drawShockRing(ctx, cx, cy, baseRadius, d.color, progress, 1.35);
    }
  }
}
