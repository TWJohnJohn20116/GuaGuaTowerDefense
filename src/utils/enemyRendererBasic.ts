/**
 * 敵人模型渲染：基礎十種造型
 *
 * 從 `enemyRenderer.ts` 拆出（TD-07）。這一組是主線波次會出現的敵人：
 * 普通、快速、精英、極速、坦克、重型、Boss、飛行、治療、生產。
 * 共同點是造型只用到圓／多邊形／描邊這幾種基本元素。
 */

import { drawEyes, drawStroke } from './enemyRendererPrimitives';
import type { DrawFn } from './enemyRendererPrimitives';

/** 普通敵人 - 經典圓形史萊姆 */
export const drawNormal: DrawFn = (ctx, x, y, r, color) => {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  drawStroke(ctx);
  // 光澤（簡化版，避免每幀建立漸層）
  ctx.beginPath();
  ctx.arc(x - r * 0.2, y - r * 0.2, r * 0.4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fill();
  drawEyes(ctx, x, y, r);
};

/** 快速敵人 - 流線型水滴形 */
export const drawFast: DrawFn = (ctx, x, y, r, color) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.moveTo(r * 0.9, 0);
  ctx.quadraticCurveTo(r * 0.2, -r * 0.9, -r * 0.7, -r * 0.5);
  ctx.quadraticCurveTo(-r, 0, -r * 0.7, r * 0.5);
  ctx.quadraticCurveTo(r * 0.2, r * 0.9, r * 0.9, 0);
  ctx.fillStyle = color;
  ctx.fill();
  drawStroke(ctx);
  ctx.restore();
  // 速度線
  ctx.strokeStyle = color + '60';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - r * 0.6, y - r * 0.25);
  ctx.lineTo(x - r * 1.2, y - r * 0.25);
  ctx.moveTo(x - r * 0.7, y);
  ctx.lineTo(x - r * 1.4, y);
  ctx.moveTo(x - r * 0.6, y + r * 0.25);
  ctx.lineTo(x - r * 1.2, y + r * 0.25);
  ctx.stroke();
  drawEyes(ctx, x - r * 0.05, y, r * 0.75, { tiny: true });
};

/** 精英敵人 - 帶星形裝飾邊框 */
export const drawElite: DrawFn = (ctx, x, y, r, color) => {
  const spikes = 6;
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const angle = (i * Math.PI) / spikes - Math.PI / 2;
    const dist = i % 2 === 0 ? r * 1.12 : r * 0.82;
    const px = x + Math.cos(angle) * dist;
    const py = y + Math.sin(angle) * dist;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  drawStroke(ctx, 0.5);
  // 內核
  ctx.beginPath();
  ctx.arc(x, y, r * 0.6, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.fill();
  drawEyes(ctx, x, y, r);
};

/** 極速敵人 - 菱形箭頭 */
export const drawSpeedy: DrawFn = (ctx, x, y, r, color) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x, y - r * 0.65);
  ctx.lineTo(x - r * 0.7, y);
  ctx.lineTo(x, y + r * 0.65);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  drawStroke(ctx, 0.5);
  // 尾部速度線
  ctx.strokeStyle = color + '50';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - r * 0.5, y - r * 0.2);
  ctx.lineTo(x - r * 1.4, y - r * 0.2);
  ctx.moveTo(x - r * 0.6, y);
  ctx.lineTo(x - r * 1.6, y);
  ctx.moveTo(x - r * 0.5, y + r * 0.2);
  ctx.lineTo(x - r * 1.4, y + r * 0.2);
  ctx.stroke();
  drawEyes(ctx, x, y, r * 0.6, { tiny: true });
};

/** 坦克敵人 - 方形身體帶履帶 */
export const drawTank: DrawFn = (ctx, x, y, r, color) => {
  const w = r * 1.6;
  const h = r * 1.3;
  // 履帶
  ctx.fillStyle = '#22222580';
  ctx.fillRect(x - w / 2 - 3, y - h / 2 + 2, w + 6, h - 4);
  ctx.strokeStyle = '#ffffff20';
  ctx.lineWidth = 1;
  ctx.strokeRect(x - w / 2 - 3, y - h / 2 + 2, w + 6, h - 4);
  // 主體
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(x - w / 2, y - h / 2, w, h, r * 0.2);
  } else {
    ctx.rect(x - w / 2, y - h / 2, w, h);
  }
  ctx.fillStyle = color;
  ctx.fill();
  drawStroke(ctx, 0.5, 2);
  // 裝甲中線
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - w / 2 + 3, y);
  ctx.lineTo(x + w / 2 - 3, y);
  ctx.stroke();
  drawEyes(ctx, x, y - r * 0.1, r * 0.85, { tiny: true });
};

/** 重型敵人 - 六邊形厚甲 */
export const drawHeavy: DrawFn = (ctx, x, y, r, color) => {
  // 外六邊形
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3 - Math.PI / 6;
    const px = x + Math.cos(angle) * r;
    const py = y + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  drawStroke(ctx, 0.5, 2.5);
  // 內六邊形裝甲層
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3 - Math.PI / 6;
    const px = x + Math.cos(angle) * r * 0.6;
    const py = y + Math.sin(angle) * r * 0.6;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 1;
  ctx.stroke();
  drawEyes(ctx, x, y, r * 0.7, { angry: true });
};

/** Boss - 帶皇冠的威嚴外觀 */
export const drawBoss: DrawFn = (ctx, x, y, r, color, t) => {
  // 脈動光環
  const pulse = Math.sin(t * 0.005) * 0.08;
  ctx.beginPath();
  ctx.arc(x, y, r * (1.15 + pulse), 0, Math.PI * 2);
  ctx.fillStyle = color + '18';
  ctx.fill();
  // 帶刺身體
  ctx.beginPath();
  const points = 8;
  for (let i = 0; i < points; i++) {
    const angle = (i * Math.PI * 2) / points - Math.PI / 2;
    const dist = i % 2 === 0 ? r * 1.08 : r * 0.82;
    const px = x + Math.cos(angle) * dist;
    const py = y + Math.sin(angle) * dist;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  drawStroke(ctx, 0.6, 2);
  // 皇冠
  const cy = y - r * 0.7;
  ctx.fillStyle = '#ffd700';
  ctx.beginPath();
  ctx.moveTo(x - r * 0.45, cy + r * 0.12);
  ctx.lineTo(x - r * 0.4, cy - r * 0.2);
  ctx.lineTo(x - r * 0.15, cy);
  ctx.lineTo(x, cy - r * 0.3);
  ctx.lineTo(x + r * 0.15, cy);
  ctx.lineTo(x + r * 0.4, cy - r * 0.2);
  ctx.lineTo(x + r * 0.45, cy + r * 0.12);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#b8860b';
  ctx.lineWidth = 1;
  ctx.stroke();
  drawEyes(ctx, x, y + r * 0.05, r, { glow: true });
};

/** 飛行敵人 - 帶拍動翅膀 */
export const drawFlyer: DrawFn = (ctx, x, y, r, color, t) => {
  const wingFlap = Math.sin(t * 0.015) * 0.4;
  // 左翼
  ctx.save();
  ctx.translate(x - r * 0.5, y - r * 0.1);
  ctx.rotate(-0.4 + wingFlap);
  ctx.beginPath();
  ctx.ellipse(-r * 0.4, 0, r * 0.7, r * 0.22, 0, 0, Math.PI * 2);
  ctx.fillStyle = color + 'bb';
  ctx.fill();
  ctx.restore();
  // 右翼
  ctx.save();
  ctx.translate(x + r * 0.5, y - r * 0.1);
  ctx.rotate(0.4 - wingFlap);
  ctx.beginPath();
  ctx.ellipse(r * 0.4, 0, r * 0.7, r * 0.22, 0, 0, Math.PI * 2);
  ctx.fillStyle = color + 'bb';
  ctx.fill();
  ctx.restore();
  // 身體
  ctx.beginPath();
  ctx.arc(x, y, r * 0.65, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  drawStroke(ctx);
  drawEyes(ctx, x, y, r * 0.6);
};

/** 治療敵人 - 帶十字治療標記 */
export const drawHealer: DrawFn = (ctx, x, y, r, color, t) => {
  const glow = 0.3 + Math.sin(t * 0.008) * 0.15;
  // 治療光環
  ctx.beginPath();
  ctx.arc(x, y, r * 1.1, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(74, 222, 128, ${glow * 0.2})`;
  ctx.fill();
  // 身體
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  drawStroke(ctx);
  // 十字標記
  const cs = r * 0.35;
  ctx.fillStyle = '#4ade80';
  ctx.fillRect(x - cs * 0.3, y - r * 0.5, cs * 0.6, r);
  ctx.fillRect(x - r * 0.5, y - cs * 0.3, r, cs * 0.6);
  drawEyes(ctx, x, y + r * 0.2, r * 0.65);
};

/** 生產敵人 - 史萊姆母體，內含小史萊姆 */
export const drawSpawner: DrawFn = (ctx, x, y, r, color, t) => {
  const pulse = Math.sin(t * 0.004) * 0.08;

  // 主體史萊姆（較大，半透明）
  ctx.beginPath();
  ctx.arc(x, y, r * (1 + pulse), 0, Math.PI * 2);
  ctx.fillStyle = color + 'cc';
  ctx.fill();
  drawStroke(ctx, 0.4);

  // 主體光澤
  ctx.beginPath();
  ctx.arc(x - r * 0.25, y - r * 0.3, r * 0.45, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fill();

  // 內部小史萊姆（3個，隨時間輕微移動）
  const babyOffset1 = Math.sin(t * 0.003) * 0.05;
  const babyOffset2 = Math.sin(t * 0.003 + 2) * 0.05;
  const babyOffset3 = Math.sin(t * 0.003 + 4) * 0.05;

  // 小史萊姆 1（左下）
  ctx.save();
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.arc(x - r * 0.35, y + r * (0.2 + babyOffset1), r * 0.28, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 1;
  ctx.stroke();
  // 小史萊姆光澤
  ctx.beginPath();
  ctx.arc(x - r * 0.42, y + r * (0.12 + babyOffset1), r * 0.12, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fill();
  ctx.restore();

  // 小史萊姆 2（右下）
  ctx.save();
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.arc(x + r * 0.32, y + r * (0.25 + babyOffset2), r * 0.25, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 1;
  ctx.stroke();
  // 小史萊姆光澤
  ctx.beginPath();
  ctx.arc(x + r * 0.26, y + r * (0.18 + babyOffset2), r * 0.1, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fill();
  ctx.restore();

  // 小史萊姆 3（中上）
  ctx.save();
  ctx.globalAlpha = 0.65;
  ctx.beginPath();
  ctx.arc(x + r * 0.05, y - r * (0.15 + babyOffset3), r * 0.22, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 1;
  ctx.stroke();
  // 小史萊姆光澤
  ctx.beginPath();
  ctx.arc(x, y - r * (0.22 + babyOffset3), r * 0.09, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fill();
  ctx.restore();

  // 母體眼睛（溫和的表情）
  drawEyes(ctx, x, y - r * 0.15, r * 0.85);

  // 生產光環效果（脈動）
  const glowAlpha = 0.15 + Math.sin(t * 0.005) * 0.1;
  ctx.beginPath();
  ctx.arc(x, y, r * 1.25, 0, Math.PI * 2);
  ctx.strokeStyle = color + Math.floor(glowAlpha * 255).toString(16).padStart(2, '0');
  ctx.lineWidth = 2;
  ctx.stroke();
};
