// 塔放置與出售動畫 - 從 GameCanvasDynamic 抽出以保持單一檔案 ≤ 888 行
import type { GridPosition, Tower } from '@/types/game';

interface SellAnim {
  id: string;
  gridPos: GridPosition;
  towerColor: string;
  startTime: number;
  refundAmount?: number;
}

// ===== 出售動畫 (增強版) =====
export function drawSellAnimations(
  ctx: CanvasRenderingContext2D,
  now: number,
  tileSize: number,
  offsetX: number,
  offsetY: number,
  sellAnimations: SellAnim[]
): void {
  sellAnimations.forEach((anim) => {
    const elapsed = now - anim.startTime;
    if (elapsed > 1200) return;
    const p = elapsed / 1200;
    const ax = offsetX + anim.gridPos.col * tileSize + tileSize / 2;
    const ay = offsetY + anim.gridPos.row * tileSize + tileSize / 2;
    const r = tileSize * 0.35;

    // 階段 1 (0-0.4): 內爆 - 塔向中心收縮並震動
    if (p < 0.4) {
      const sp = p / 0.4;
      const shrink = 1 - sp * 0.7;
      const shake = Math.sin(elapsed * 0.06) * (1 - sp) * 2;
      ctx.save();
      ctx.globalAlpha = 1 - sp * 0.3;
      ctx.translate(ax + shake, ay);
      ctx.scale(shrink, shrink);
      ctx.beginPath();
      ctx.arc(0, 0, r + 4, 0, Math.PI * 2);
      ctx.fillStyle = '#1a1d24';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fillStyle = anim.towerColor;
      ctx.fill();
      // 內爆白光
      const flashAlpha = sp * 0.5;
      ctx.globalAlpha = flashAlpha;
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.2, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.restore();
    } else {
      // 階段 2 (0.4-1.0): 消失 + 擴散
      const sp = (p - 0.4) / 0.6;
      const alpha = 1 - sp;
      const burstR = tileSize * sp * 0.7;
      // 中心爆光
      if (sp < 0.4) {
        const burstAlpha = (1 - sp / 0.4) * 0.7;
        ctx.beginPath();
        ctx.arc(ax, ay, burstR, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${burstAlpha})`;
        ctx.fill();
      }
      // 殘骸碎片
      drawSellDebris(ctx, sp, tileSize, ax, ay, anim.towerColor, alpha);
    }

    // 擴散光環 (整個動畫期間)
    const ringR = r + p * tileSize * 1.0;
    ctx.beginPath();
    ctx.arc(ax, ay, ringR, 0, Math.PI * 2);
    ctx.strokeStyle = anim.towerColor;
    ctx.lineWidth = 2.5 * (1 - p);
    ctx.globalAlpha = (1 - p) * 0.5;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // 煙霧粒子 (0-0.7)
    if (p < 0.7) {
      drawSmokeParticles(ctx, p / 0.7, tileSize, ax, ay);
    }

    // 金幣粒子 (0.2-1.0) - 上浮
    if (p > 0.2) {
      const cp = (p - 0.2) / 0.8;
      drawCoinParticles(ctx, cp, tileSize, ax, ay);
    }

    // 退款金額文字 (0.3-1.0)
    if (p > 0.3 && anim.refundAmount && anim.refundAmount > 0) {
      drawRefundText(ctx, (p - 0.3) / 0.7, tileSize, ax, ay, anim.refundAmount);
    }
  });
}

// ===== 殘骸碎片 =====
function drawSellDebris(
  ctx: CanvasRenderingContext2D,
  sp: number,
  tileSize: number,
  ax: number,
  ay: number,
  towerColor: string,
  baseAlpha: number
): void {
  const debrisCount = 8;
  for (let i = 0; i < debrisCount; i++) {
    const angle = (Math.PI * 2 * i) / debrisCount + (i * 0.7);
    const dist = sp * tileSize * (0.4 + (i % 3) * 0.15);
    const px = ax + Math.cos(angle) * dist;
    const py = ay + Math.sin(angle) * dist + sp * sp * tileSize * 0.5;
    const dSize = (3 + (i % 2) * 2) * (1 - sp);
    if (dSize < 0.5) continue;
    ctx.save();
    ctx.globalAlpha = baseAlpha * 0.8;
    ctx.translate(px, py);
    ctx.rotate(angle + sp * 4);
    ctx.fillStyle = towerColor;
    ctx.fillRect(-dSize / 2, -dSize / 2, dSize, dSize);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

// ===== 煙霧粒子 =====
function drawSmokeParticles(
  ctx: CanvasRenderingContext2D,
  p: number,
  tileSize: number,
  ax: number,
  ay: number
): void {
  const count = 6;
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + p * 0.5;
    const dist = p * tileSize * 0.5;
    const px = ax + Math.cos(angle) * dist;
    const py = ay + Math.sin(angle) * dist - p * tileSize * 0.3;
    const sSize = 4 + p * 8;
    const sAlpha = (1 - p) * 0.4;
    if (sAlpha < 0.05) continue;
    const grad = ctx.createRadialGradient(px, py, 0, px, py, sSize);
    grad.addColorStop(0, `rgba(120, 120, 120, ${sAlpha})`);
    grad.addColorStop(1, 'rgba(80, 80, 80, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(px, py, sSize, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ===== 金幣粒子 =====
function drawCoinParticles(
  ctx: CanvasRenderingContext2D,
  cp: number,
  tileSize: number,
  ax: number,
  ay: number
): void {
  const coinCount = 8;
  for (let i = 0; i < coinCount; i++) {
    const angle = (Math.PI * 2 * i) / coinCount;
    // 拋物線軌跡
    const dist = cp * tileSize * 0.6;
    const px = ax + Math.cos(angle) * dist;
    const py = ay + Math.sin(angle) * dist - cp * tileSize * 0.8 + cp * cp * tileSize * 0.3;
    const cAlpha = (1 - cp) * 0.95;
    const cSize = 6 + (1 - cp) * 4;
    if (cAlpha < 0.05) continue;
    ctx.save();
    ctx.globalAlpha = cAlpha;
    ctx.translate(px, py);
    // 旋轉的金幣
    const rot = cp * Math.PI * 4 + i;
    ctx.scale(Math.cos(rot) * 0.7 + 0.3, 1);
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, cSize);
    grad.addColorStop(0, '#fff8dc');
    grad.addColorStop(0.6, '#ffd700');
    grad.addColorStop(1, '#b8860b');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, cSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#7d5a00';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#7d5a00';
    ctx.font = `bold ${cSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', 0, 0);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

// ===== 退款金額文字 =====
function drawRefundText(
  ctx: CanvasRenderingContext2D,
  p: number,
  tileSize: number,
  ax: number,
  ay: number,
  amount: number
): void {
  const ty = ay - tileSize * 0.5 - p * tileSize * 0.7;
  const alpha = p < 0.2 ? p / 0.2 : Math.max(0, 1 - (p - 0.2) / 0.8);
  const scale = p < 0.15 ? 0.5 + p / 0.15 * 0.5 : 1;
  ctx.save();
  ctx.translate(ax, ty);
  ctx.scale(scale, scale);
  ctx.font = `bold ${tileSize * 0.3}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 3;
  ctx.strokeText(`+$${amount}`, 0, 0);
  ctx.fillStyle = '#22c55e';
  ctx.fillText(`+$${amount}`, 0, 0);
  ctx.restore();
  ctx.globalAlpha = 1;
}

// ===== 放置塔擴展粒子 (在 drawTowers 內呼叫) =====
export function drawPlaceParticles(
  ctx: CanvasRenderingContext2D,
  buildElapsed: number,
  tileSize: number,
  cx: number,
  cy: number,
  towerColor: string
): void {
  if (buildElapsed > 700) return;
  const p = buildElapsed / 700;
  const partCount = 12;
  for (let i = 0; i < partCount; i++) {
    const angle = (Math.PI * 2 * i) / partCount + Math.PI / 2;
    const dist = p * tileSize * 0.7;
    const px = cx + Math.cos(angle) * dist;
    const py = cy + Math.sin(angle) * dist - p * tileSize * 0.4;
    const pSize = (2 + (i % 2) * 1.5) * (1 - p);
    if (pSize < 0.3) continue;
    ctx.save();
    ctx.translate(px, py);
    ctx.globalAlpha = (1 - p) * 0.85;
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, pSize * 2);
    grad.addColorStop(0, '#fff');
    grad.addColorStop(0.5, towerColor);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, pSize * 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

// ===== 放置時的「+1」建造文字 =====
export function drawBuildText(
  ctx: CanvasRenderingContext2D,
  buildElapsed: number,
  tileSize: number,
  cx: number,
  cy: number,
  cost: number
): void {
  if (buildElapsed > 1000 || buildElapsed < 100) return;
  const p = (buildElapsed - 100) / 900;
  const ty = cy - tileSize * 0.5 - p * tileSize * 0.6;
  const alpha = p < 0.2 ? p / 0.2 : Math.max(0, 1 - (p - 0.2) / 0.8);
  const scale = p < 0.15 ? 0.5 + p / 0.15 * 0.5 : 1;
  ctx.save();
  ctx.translate(cx, ty);
  ctx.scale(scale, scale);
  ctx.font = `bold ${tileSize * 0.28}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 3;
  ctx.strokeText(`-$${cost}`, 0, 0);
  ctx.fillStyle = '#ef4444';
  ctx.fillText(`-$${cost}`, 0, 0);
  ctx.restore();
  ctx.globalAlpha = 1;
}

// 額外: easeOutBack 函數 (與 GameCanvasDynamic.ts 共用)
export function easeOutBack(x: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

// 不使用的型別防止 lint
export type _PlaceFxTower = Tower;
