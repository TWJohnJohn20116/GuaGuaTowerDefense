/**
 * 敵人模型渲染：進階／Mod 十二種造型
 *
 * 從 `enemyRenderer.ts` 拆出（TD-07）。這一組多半帶有額外的光環、護盾或
 * 特效（護盾、隱身、狂戰士、裝甲、法師、小 Boss、蟲群、幽靈、爆破、
 * 干擾、護航），最後一支 `drawDefault` 是所有未知類型的後備（Mod 自訂敵人）。
 */

import { drawEyes, drawStroke } from './enemyRendererPrimitives';
import type { DrawFn } from './enemyRendererPrimitives';

/** 護盾敵人 - 帶能量護盾 */
export const drawShield: DrawFn = (ctx, x, y, r, color, t) => {
  const shimmer = 0.6 + Math.sin(t * 0.006) * 0.2;
  // 身體
  ctx.beginPath();
  ctx.arc(x, y, r * 0.75, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  drawStroke(ctx);
  // 護盾弧形
  ctx.beginPath();
  ctx.arc(x, y, r, -Math.PI * 0.55, Math.PI * 0.55);
  ctx.strokeStyle = `rgba(100, 200, 255, ${shimmer})`;
  ctx.lineWidth = 3;
  ctx.stroke();
  // 護盾填充
  ctx.beginPath();
  ctx.arc(x, y, r, -Math.PI * 0.55, Math.PI * 0.55);
  ctx.lineTo(x, y);
  ctx.closePath();
  ctx.fillStyle = `rgba(100, 200, 255, ${shimmer * 0.12})`;
  ctx.fill();
  drawEyes(ctx, x - r * 0.08, y, r * 0.65);
};

/** 隱身敵人 - 忍者菱形 */
export const drawStealth: DrawFn = (ctx, x, y, r, color) => {
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.lineTo(x + r * 0.7, y);
  ctx.lineTo(x, y + r * 0.8);
  ctx.lineTo(x - r * 0.7, y);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  drawStroke(ctx, 0.3);
  // 忍者面罩
  ctx.strokeStyle = '#33333380';
  ctx.lineWidth = Math.max(1, r * 0.12);
  ctx.beginPath();
  ctx.moveTo(x - r * 0.5, y - r * 0.05);
  ctx.lineTo(x + r * 0.5, y - r * 0.05);
  ctx.stroke();
  drawEyes(ctx, x, y, r * 0.65, { slit: true });
};

/** 狂戰士 - 帶魔角 */
export const drawBerserker: DrawFn = (ctx, x, y, r, color) => {
  // 角（先畫，在身體後面）
  ctx.fillStyle = '#6B3A2A';
  // 左角
  ctx.beginPath();
  ctx.moveTo(x - r * 0.45, y - r * 0.5);
  ctx.lineTo(x - r * 0.65, y - r * 1.25);
  ctx.lineTo(x - r * 0.1, y - r * 0.6);
  ctx.closePath();
  ctx.fill();
  // 右角
  ctx.beginPath();
  ctx.moveTo(x + r * 0.45, y - r * 0.5);
  ctx.lineTo(x + r * 0.65, y - r * 1.25);
  ctx.lineTo(x + r * 0.1, y - r * 0.6);
  ctx.closePath();
  ctx.fill();
  // 身體
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  drawStroke(ctx, 0.5);
  drawEyes(ctx, x, y, r, { angry: true });
};

/** 裝甲敵人 - 八邊形帶鉚釘 */
export const drawArmored: DrawFn = (ctx, x, y, r, color) => {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4 - Math.PI / 8;
    const px = x + Math.cos(angle) * r;
    const py = y + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  drawStroke(ctx, 0.5, 2);
  // 鉚釘
  ctx.fillStyle = '#c0c0c0';
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4;
    ctx.beginPath();
    ctx.arc(
      x + Math.cos(angle) * r * 0.72,
      y + Math.sin(angle) * r * 0.72,
      Math.max(1, r * 0.07),
      0, Math.PI * 2
    );
    ctx.fill();
  }
  drawEyes(ctx, x, y, r * 0.75, { tiny: true });
};

/** 法師敵人 - 帶法師帽和魔法光芒 */
export const drawMage: DrawFn = (ctx, x, y, r, color, t) => {
  const sparkle = Math.sin(t * 0.01) * 0.5 + 0.5;
  // 身體
  ctx.beginPath();
  ctx.arc(x, y + r * 0.15, r * 0.82, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  drawStroke(ctx);
  // 法師帽
  ctx.beginPath();
  ctx.moveTo(x, y - r * 1.35);
  ctx.lineTo(x - r * 0.65, y - r * 0.25);
  ctx.lineTo(x + r * 0.65, y - r * 0.25);
  ctx.closePath();
  ctx.fillStyle = '#2a1a4a';
  ctx.fill();
  // 帽帶
  ctx.fillStyle = '#ffd700';
  ctx.fillRect(x - r * 0.55, y - r * 0.4, r * 1.1, Math.max(2, r * 0.12));
  // 帽尖星星
  ctx.fillStyle = `rgba(255, 255, 100, ${sparkle})`;
  ctx.beginPath();
  const starX = x;
  const starY = y - r * 1.35;
  const starR = r * 0.15;
  for (let i = 0; i < 5; i++) {
    const a1 = (i * Math.PI * 2) / 5 - Math.PI / 2;
    const a2 = a1 + Math.PI / 5;
    ctx.lineTo(starX + Math.cos(a1) * starR, starY + Math.sin(a1) * starR);
    ctx.lineTo(starX + Math.cos(a2) * starR * 0.4, starY + Math.sin(a2) * starR * 0.4);
  }
  ctx.closePath();
  ctx.fill();
  drawEyes(ctx, x, y + r * 0.2, r * 0.7);
};

/** 小Boss - 帶金冠的中型Boss */
export const drawMiniboss: DrawFn = (ctx, x, y, r, color) => {
  // 身體
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  drawStroke(ctx, 0.5, 2);
  // 光澤（簡化版）
  ctx.beginPath();
  ctx.arc(x - r * 0.2, y - r * 0.2, r * 0.4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fill();
  // 小金冠
  const cy = y - r * 0.6;
  ctx.fillStyle = '#ffd700';
  ctx.beginPath();
  ctx.moveTo(x - r * 0.4, cy + r * 0.1);
  ctx.lineTo(x - r * 0.35, cy - r * 0.15);
  ctx.lineTo(x - r * 0.12, cy + r * 0.02);
  ctx.lineTo(x, cy - r * 0.22);
  ctx.lineTo(x + r * 0.12, cy + r * 0.02);
  ctx.lineTo(x + r * 0.35, cy - r * 0.15);
  ctx.lineTo(x + r * 0.4, cy + r * 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#b8860b';
  ctx.lineWidth = 0.8;
  ctx.stroke();
  drawEyes(ctx, x, y + r * 0.05, r);
};

/** 蟲群 - 小蟲帶觸角和腳 */
export const drawSwarm: DrawFn = (ctx, x, y, r, color) => {
  // 橢圓身體
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1.3, 1);
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.75, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  drawStroke(ctx, 0.3);
  ctx.restore();
  // 觸角
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, r * 0.09);
  ctx.beginPath();
  ctx.moveTo(x - r * 0.3, y - r * 0.55);
  ctx.quadraticCurveTo(x - r * 0.5, y - r * 1.1, x - r * 0.65, y - r * 0.9);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + r * 0.3, y - r * 0.55);
  ctx.quadraticCurveTo(x + r * 0.5, y - r * 1.1, x + r * 0.65, y - r * 0.9);
  ctx.stroke();
  // 觸角尖端小球
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x - r * 0.65, y - r * 0.9, r * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.65, y - r * 0.9, r * 0.08, 0, Math.PI * 2);
  ctx.fill();
  // 小腳
  ctx.strokeStyle = color + '90';
  ctx.lineWidth = Math.max(0.5, r * 0.06);
  [-0.45, 0, 0.45].forEach(off => {
    ctx.beginPath();
    ctx.moveTo(x + off * r, y + r * 0.45);
    ctx.lineTo(x + off * r - r * 0.15, y + r * 0.85);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + off * r, y + r * 0.45);
    ctx.lineTo(x + off * r + r * 0.15, y + r * 0.85);
    ctx.stroke();
  });
  drawEyes(ctx, x, y - r * 0.05, r * 0.55, { tiny: true });
};

/** 幽靈 - 半透明幽靈形狀帶波浪底 */
export const drawGhost: DrawFn = (ctx, x, y, r, color, t) => {
  const wave = t * 0.008;
  ctx.save();
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  // 頂部圓弧
  ctx.arc(x, y - r * 0.2, r * 0.82, Math.PI, 0, false);
  // 右邊下延
  const rightX = x + r * 0.82;
  const leftX = x - r * 0.82;
  const bottom = y + r * 0.6;
  ctx.lineTo(rightX, bottom);
  // 波浪底部（從右到左）
  const numWaves = 3;
  const waveW = (rightX - leftX) / numWaves;
  for (let i = numWaves; i > 0; i--) {
    const sx = leftX + i * waveW;
    const ex2 = leftX + (i - 1) * waveW;
    const mx = (sx + ex2) / 2;
    const waveY = bottom + r * 0.2 + Math.sin(wave + i * 1.8) * r * 0.12;
    ctx.quadraticCurveTo(mx, waveY, ex2, bottom);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
  // 幽暗眼睛
  drawEyes(ctx, x, y - r * 0.15, r * 0.7, { dark: true });
};

/** 爆破敵人 - 圓形炸彈帶引線火花 */
export const drawBomber: DrawFn = (ctx, x, y, r, color, t) => {
  // 炸彈身體
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  drawStroke(ctx, 0.4);
  // 光澤（簡化版）
  ctx.beginPath();
  ctx.arc(x - r * 0.2, y - r * 0.2, r * 0.35, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fill();
  // 引線
  ctx.strokeStyle = '#6B4226';
  ctx.lineWidth = Math.max(1.5, r * 0.1);
  ctx.beginPath();
  ctx.moveTo(x + r * 0.25, y - r * 0.85);
  ctx.quadraticCurveTo(x + r * 0.55, y - r * 1.15, x + r * 0.15, y - r * 1.25);
  ctx.stroke();
  // 引線火花
  const sparkAlpha = 0.5 + Math.sin(t * 0.02) * 0.5;
  ctx.beginPath();
  ctx.arc(x + r * 0.15, y - r * 1.25, r * 0.18, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255, 200, 50, ${sparkAlpha})`;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.15, y - r * 1.25, r * 0.08, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255, 255, 220, ${Math.min(1, sparkAlpha + 0.3)})`;
  ctx.fill();
  drawEyes(ctx, x, y, r * 0.85, { angry: true });
};

/** 干擾敵人 - 天線碟與脈動電波 */
export const drawJammer: DrawFn = (ctx, x, y, r, color, t) => {
  const pulse = 0.45 + Math.sin(t * 0.01) * 0.25;
  ctx.beginPath();
  ctx.arc(x, y, r * (1.15 + pulse * 0.12), 0, Math.PI * 2);
  ctx.fillStyle = `rgba(167, 139, 250, ${0.12 + pulse * 0.1})`;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  drawStroke(ctx, 0.4);
  ctx.strokeStyle = `rgba(221, 214, 254, ${0.35 + pulse * 0.4})`;
  ctx.lineWidth = Math.max(1, r * 0.08);
  for (let i = 1; i <= 2; i++) {
    ctx.beginPath();
    ctx.arc(x, y - r * 0.15, r * (0.55 + i * 0.28 + pulse * 0.08), -Math.PI * 0.85, -Math.PI * 0.15);
    ctx.stroke();
  }
  ctx.fillStyle = '#ddd6fe';
  ctx.beginPath();
  ctx.moveTo(x, y - r * 0.15);
  ctx.lineTo(x - r * 0.35, y + r * 0.15);
  ctx.lineTo(x + r * 0.35, y + r * 0.15);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#7c3aed';
  ctx.beginPath();
  ctx.arc(x, y - r * 0.22, r * 0.16, 0, Math.PI * 2);
  ctx.fill();
  drawEyes(ctx, x, y + r * 0.18, r * 0.7, { slit: true });
};

/** 護航敵人 - 盾牌與鋼青護甲環 */
export const drawEscort: DrawFn = (ctx, x, y, r, color, t) => {
  const pulse = 0.45 + Math.sin(t * 0.008) * 0.2;
  ctx.beginPath();
  ctx.arc(x, y, r * (1.12 + pulse * 0.1), 0, Math.PI * 2);
  ctx.fillStyle = `rgba(148, 163, 184, ${0.12 + pulse * 0.08})`;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  drawStroke(ctx, 0.4);
  ctx.save();
  ctx.strokeStyle = `rgba(226, 232, 240, ${0.4 + pulse * 0.35})`;
  ctx.lineWidth = Math.max(1.2, r * 0.1);
  ctx.beginPath();
  ctx.arc(x, y, r * 0.72, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  ctx.fillStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.moveTo(x, y - r * 0.55);
  ctx.lineTo(x + r * 0.38, y - r * 0.18);
  ctx.lineTo(x + r * 0.28, y + r * 0.32);
  ctx.lineTo(x, y + r * 0.52);
  ctx.lineTo(x - r * 0.28, y + r * 0.32);
  ctx.lineTo(x - r * 0.38, y - r * 0.18);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#64748b';
  ctx.beginPath();
  ctx.arc(x, y - r * 0.05, r * 0.14, 0, Math.PI * 2);
  ctx.fill();
  drawEyes(ctx, x, y + r * 0.08, r * 0.65, { angry: true });
};

/** 預設渲染（用於 Mod 自訂敵人等未知類型） */
export const drawDefault: DrawFn = (ctx, x, y, r, color) => {
  // 圓形身體帶光澤
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  drawStroke(ctx, 0.4);
  // 光澤（簡化版）
  ctx.beginPath();
  ctx.arc(x - r * 0.2, y - r * 0.2, r * 0.4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fill();
  drawEyes(ctx, x, y, r);
};
