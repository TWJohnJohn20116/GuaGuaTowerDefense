import type { TowerDrawParams } from '../TowerModels';
import { sticker } from './nordicShared';

const WHITE = '#fff';
const CREAM = '#fff8ef';
const DARK = '#2e2440';

// 雷射：雙軌叉口、聚焦晶體與逐級增加的卡箍。
export const drawLaserTowerNordic = (p: TowerDrawParams): void => {
  if (!sticker.begin(p, 'round', true)) return;
  const { ctx, color, highlight } = p;
  const level = sticker.level(p);
  const light = sticker.tint(color);
  const detail = sticker.detail(p);

  sticker.rect(ctx, -28, -23, 46, 46, color, 8);
  sticker.rect(ctx, -23, -18, 35, 36, light, 6, 2.4);
  sticker.circle(ctx, -7, 0, 9, WHITE);
  sticker.circle(ctx, -7, 0, 3, DARK, 1.8);

  const railCount = level >= 5 ? 3 : 2;
  for (let i = 0; i < railCount; i += 1) {
    const y = railCount === 2 ? (i === 0 ? -8 : 8) : (i - 1) * 8;
    sticker.rect(ctx, 7, y - 4, 57, 8, color, 3.5);
    sticker.rect(ctx, 13, y - 1.7, 45, 3.4, highlight, 1.5, 1.5);
    sticker.rect(ctx, 58, y - 6, 10, 12, level >= 3 ? light : CREAM, 3);
  }

  sticker.hex(ctx, 69, 0, level >= 4 ? 11 : 9, highlight);
  sticker.hex(ctx, 69, 0, level >= 3 ? 6 : 5, light, 2.2);
  if (level >= 2) {
    sticker.rect(ctx, 35, -13, 7, 26, highlight, 2.5);
    sticker.rect(ctx, 48, -13, 7, 26, color, 2.5);
  }
  if (level >= 3) {
    sticker.rect(ctx, 9, -17, 54, 5, color, 2);
    sticker.rect(ctx, 9, 12, 54, 5, color, 2);
    sticker.rect(ctx, -3, -27, 8, 7, highlight, 2);
    sticker.rect(ctx, -3, 20, 8, 7, highlight, 2);
  }
  if (level >= 4) {
    sticker.circle(ctx, 69, 0, 14, CREAM);
    sticker.hex(ctx, 69, 0, 10, highlight);
    sticker.hex(ctx, 69, 0, 5.5, light, 2.2);
  }
  if (level >= 5) {
    sticker.rect(ctx, -20, -26, 7, 52, color, 3);
    sticker.rect(ctx, 66, -10, 8, 20, color, 3);
    sticker.circle(ctx, 69, 0, 2.5, WHITE, 1.8);
  }
  if (detail && level >= 2) {
    sticker.bolt(ctx, -23, -14);
    sticker.bolt(ctx, -23, 14);
  }
  p.ctx.restore();
};

// 閃電：三條清楚接到核心的分叉電極，逐級增加節點與外框。
export const drawLightningTowerNordic = (p: TowerDrawParams): void => {
  if (!sticker.begin(p, 'round', true)) return;
  const { ctx, color, highlight } = p;
  const level = sticker.level(p);
  const light = sticker.tint(color);

  sticker.circle(ctx, -7, 0, 13, light);
  sticker.circle(ctx, -7, 0, level >= 3 ? 9 : 7, color);

  sticker.line(ctx, 0, 0, 39, -22, DARK, 7);
  sticker.line(ctx, 0, 0, 54, 0, DARK, 7);
  sticker.line(ctx, 0, 0, 39, 22, DARK, 7);
  sticker.line(ctx, 0, 0, 39, -22, highlight, 3);
  sticker.line(ctx, 0, 0, 54, 0, highlight, 3);
  sticker.line(ctx, 0, 0, 39, 22, highlight, 3);

  sticker.circle(ctx, 39, -22, level >= 2 ? 5 : 3.5, highlight);
  sticker.circle(ctx, 54, 0, level >= 2 ? 5 : 3.5, highlight);
  sticker.circle(ctx, 39, 22, level >= 2 ? 5 : 3.5, highlight);
  sticker.circle(ctx, 39, -22, level >= 2 ? 2 : 1.5, WHITE, 1.4);
  sticker.circle(ctx, 54, 0, level >= 2 ? 2 : 1.5, WHITE, 1.4);
  sticker.circle(ctx, 39, 22, level >= 2 ? 2 : 1.5, WHITE, 1.4);

  if (level >= 3) {
    sticker.rect(ctx, 18, -7, 7, 14, color, 2);
    sticker.rect(ctx, 32, -29, 7, 7, light, 2);
    sticker.rect(ctx, 32, 22, 7, 7, light, 2);
  }
  if (level >= 4) {
    sticker.line(ctx, 39, -22, 61, -32, DARK, 6);
    sticker.line(ctx, 39, -22, 61, -32, highlight, 2.5);
    sticker.line(ctx, 39, 22, 61, 32, DARK, 6);
    sticker.line(ctx, 39, 22, 61, 32, highlight, 2.5);
    sticker.circle(ctx, 61, -32, 4, highlight);
    sticker.circle(ctx, 61, 32, 4, highlight);
  }

  ctx.beginPath();
  ctx.moveTo(-10, -10);
  ctx.lineTo(-1, -2);
  ctx.lineTo(-6, -2);
  ctx.lineTo(2, 10);
  ctx.lineTo(-8, 2);
  ctx.lineTo(-3, 2);
  ctx.closePath();
  sticker.paint(ctx, highlight);
  if (level >= 5) {
    ctx.beginPath();
    ctx.arc(-7, 0, 16, 0, Math.PI * 2);
    sticker.paint(ctx, null, highlight, 2.5);
  }
  p.ctx.restore();
};

// 脈衝：不旋轉的實體同心環與四向連接節點，沒有透明光暈。
export const drawPulseTowerNordic = (p: TowerDrawParams): void => {
  if (!sticker.begin(p, 'round', false)) return;
  const { ctx, color, highlight } = p;
  const level = sticker.level(p);
  const light = sticker.tint(color);

  for (let i = 0; i < level; i += 1) {
    const r = 9 + i * 6.5;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    sticker.paint(ctx, null, i === level - 1 ? highlight : color, i === level - 1 ? 3.5 : 2.8);
  }

  const nodeCount = level >= 5 ? 8 : 4;
  const nodeR = level >= 4 ? 4.5 : 3.5;
  sticker.line(ctx, -27, 0, 27, 0, DARK, 6);
  sticker.line(ctx, 0, -27, 0, 27, DARK, 6);
  sticker.line(ctx, -27, 0, 27, 0, highlight, 2.4);
  sticker.line(ctx, 0, -27, 0, 27, highlight, 2.4);
  sticker.circle(ctx, 0, 0, level >= 4 ? 7 : 5.5, light);
  sticker.circle(ctx, 0, 0, 2.5, color, 1.8);

  for (let i = 0; i < nodeCount; i += 1) {
    const diagonal = i >= 4;
    const x = diagonal ? (i === 4 || i === 7 ? -20 : 20) : (i === 0 ? 27 : i === 1 ? 0 : i === 2 ? -27 : 0);
    const y = diagonal ? (i === 4 || i === 5 ? -20 : 20) : (i === 0 || i === 2 ? 0 : i === 1 ? -27 : 27);
    sticker.circle(ctx, x, y, nodeR, highlight);
    sticker.circle(ctx, x, y, 1.8, WHITE, 1.2);
  }
  if (level >= 3) {
    sticker.rect(ctx, -4, -34, 8, 6, color, 2);
    sticker.rect(ctx, -4, 28, 8, 6, color, 2);
    sticker.rect(ctx, -34, -4, 6, 8, color, 2);
    sticker.rect(ctx, 28, -4, 6, 8, color, 2);
  }
  p.ctx.restore();
};

const drawMoneySymbol = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void => {
  ctx.beginPath();
  ctx.moveTo(x + r * 0.42, y - r * 0.48);
  ctx.lineTo(x - r * 0.18, y - r * 0.48);
  ctx.quadraticCurveTo(x - r * 0.52, y - r * 0.48, x - r * 0.52, y - r * 0.16);
  ctx.quadraticCurveTo(x - r * 0.52, y + r * 0.08, x - r * 0.12, y + r * 0.12);
  ctx.quadraticCurveTo(x + r * 0.5, y + r * 0.17, x + r * 0.5, y + r * 0.43);
  ctx.quadraticCurveTo(x + r * 0.5, y + r * 0.7, x + r * 0.12, y + r * 0.7);
  ctx.lineTo(x - r * 0.42, y + r * 0.7);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y - r * 0.75);
  ctx.lineTo(x, y + r * 0.9);
  ctx.stroke();
};

// 金幣壓機：方形機匣、送幣槽、雙金幣與逐級增加的側部支架。
export const drawMoneyTowerNordic = (p: TowerDrawParams): void => {
  if (!sticker.begin(p, 'square', false)) return;
  const { ctx, color, highlight } = p;
  const level = sticker.level(p);
  const detail = sticker.detail(p);

  sticker.rect(ctx, -29, -26, 40, 52, color, 8);
  sticker.rect(ctx, -24, -21, 30, 42, sticker.tint(color), 5, 2.4);
  sticker.rect(ctx, 17, -17, 15, 34, highlight, 4);
  sticker.rect(ctx, 21, -11, 8, 22, CREAM, 2, 2.2);
  sticker.line(ctx, 23, -3, 28, -3, DARK, 2);
  sticker.line(ctx, 23, 3, 28, 3, DARK, 2);

  const coinX = -9;
  const coinY = level >= 3 ? 4 : 0;
  const coinR = level >= 5 ? 17 : level >= 3 ? 15 : 13;
  sticker.circle(ctx, coinX, coinY, coinR + 2, DARK);
  sticker.circle(ctx, coinX, coinY, coinR, color);
  ctx.strokeStyle = highlight;
  ctx.lineWidth = 2;
  drawMoneySymbol(ctx, coinX, coinY, coinR * 0.7);

  if (level >= 2) {
    sticker.rect(ctx, -13, -28, 20, 7, highlight, 2);
    sticker.rect(ctx, -10, -26, 14, 3, CREAM, 1.5, 1.4);
  }
  if (level >= 3) {
    sticker.circle(ctx, -20, -12, 8, DARK);
    sticker.circle(ctx, -20, -12, 6, highlight);
  }
  if (level >= 4) {
    sticker.rect(ctx, -34, -25, 7, 13, highlight, 2);
    sticker.rect(ctx, -34, 12, 7, 13, highlight, 2);
    sticker.rect(ctx, 8, -25, 7, 13, color, 2);
    sticker.rect(ctx, 8, 12, 7, 13, color, 2);
  }
  if (level >= 5) {
    sticker.rect(ctx, -10, -34, 21, 8, color, 3);
    sticker.rect(ctx, -6, -32, 13, 4, highlight, 1.5);
    sticker.circle(ctx, 8, 25, 4, highlight);
    sticker.line(ctx, 8, 25, 17, 25, DARK, 3);
  }
  if (detail) sticker.bolt(ctx, -25, -18);
  p.ctx.restore();
};
