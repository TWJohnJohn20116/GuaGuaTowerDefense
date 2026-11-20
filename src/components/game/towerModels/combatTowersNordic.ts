// 物理彈丸型塔 - 俯視 2D 糖果貼紙模型
// 五種塔共用固定底座，武器結構依等級逐步增加。

import type { TowerDrawParams } from '../TowerModels';
import { sticker } from './nordicShared';

// 狙擊塔：細長槍軌、隨皮膚著色的瞄具與逐級鎖定機構。
export const drawSniperTowerNordic = (p: TowerDrawParams): void => {
  if (!sticker.begin(p)) return;
  const { ctx, color, highlight } = p;
  const level = sticker.level(p);
  const detail = sticker.detail(p);
  const pale = sticker.tint(color);

  sticker.rect(ctx, -32, -9, 14, 18, color, 4);
  sticker.rect(ctx, -28, -14, 41, 28, pale, 7);
  sticker.rect(ctx, -28, -9, 12, 18, color, 3);
  sticker.rect(ctx, -15, -4, 28, 8, highlight, 3);
  sticker.rect(ctx, 8, -3, 66, 6, '#fff8ef', 3, 2.8);
  sticker.line(ctx, 12, 0, 72, 0, highlight, 2);
  sticker.rect(ctx, 72, -5, 10, 10, color, 3);
  sticker.line(ctx, 78, -3, 78, 3, '#fff8ef', 1.8);

  if (level >= 2) {
    sticker.rect(ctx, -7, -21, 18, 8, highlight, 3);
    sticker.rect(ctx, -4, -17, 10, 5, color, 2);
    sticker.circle(ctx, 9, -17, 4.7, highlight);
    sticker.circle(ctx, 9, -17, 2, '#fff8ef', 1.8);
  }
  if (level >= 3) {
    sticker.rect(ctx, 17, -7, 5, 14, highlight, 2);
    sticker.rect(ctx, 45, -7, 5, 14, highlight, 2);
    if (detail) {
      sticker.bolt(ctx, 19.5, -4);
      sticker.bolt(ctx, 47.5, 4);
    }
  }
  if (level >= 4) {
    sticker.rect(ctx, 9, -13, 49, 4, color, 2);
    sticker.rect(ctx, 9, 9, 49, 4, color, 2);
    sticker.line(ctx, 14, -11, 53, -11, highlight, 1.7);
    sticker.line(ctx, 14, 11, 53, 11, highlight, 1.7);
  }
  if (level >= 5) {
    sticker.rect(ctx, -21, 8, 17, 10, color, 3);
    sticker.hex(ctx, -12, 13, 4.5, '#fff8ef', 2.2);
    sticker.circle(ctx, -12, 13, 1.7, highlight, 1.5);
    sticker.rect(ctx, 31, -9, 5, 18, '#fff8ef', 2);
    if (detail) sticker.bolt(ctx, -19, 13);
  }

  ctx.restore();
};

// 加農炮塔：短粗寬口炮管、後座夾架與重型炮座。
export const drawCannonTowerNordic = (p: TowerDrawParams): void => {
  if (!sticker.begin(p)) return;
  const { ctx, color, highlight } = p;
  const level = sticker.level(p);
  const detail = sticker.detail(p);
  const pale = sticker.tint(color);

  sticker.rect(ctx, -28, -20, 40, 40, pale, 8);
  sticker.rect(ctx, -31, -15, 13, 30, color, 5);
  sticker.rect(ctx, -24, -11, 17, 22, '#fff8ef', 5);
  if (level >= 4) {
    sticker.rect(ctx, -19, -22, 31, 7, highlight, 3);
    sticker.rect(ctx, -19, 15, 31, 7, highlight, 3);
    sticker.line(ctx, -15, -18.5, 7, -18.5, '#fff8ef', 1.8);
    sticker.line(ctx, -15, 18.5, 7, 18.5, '#fff8ef', 1.8);
  }
  if (level >= 5) {
    sticker.rect(ctx, -25, -24, 18, 48, color, 6);
    sticker.rect(ctx, -21, -18, 10, 36, pale, 4);
  }
  sticker.rect(ctx, -8, -14, 52, 28, color, 8);
  sticker.rect(ctx, -3, -7, 39, 14, highlight, 5);
  sticker.line(ctx, 0, 0, 35, 0, '#fff8ef', 2.1);
  sticker.rect(ctx, 37, -15, 11, 30, '#fff8ef', 4);
  sticker.rect(ctx, 42, -9, 7, 18, '#2e2440', 2);

  if (level >= 2) {
    sticker.rect(ctx, 34, -18, 14, 36, '#fff8ef', 5);
    sticker.rect(ctx, 42, -10, 7, 20, '#2e2440', 2);
    sticker.line(ctx, 36, -14, 36, 14, highlight, 2);
  }
  if (level >= 3) {
    sticker.rect(ctx, -24, -23, 27, 6, color, 2);
    sticker.rect(ctx, -24, 17, 27, 6, color, 2);
    sticker.rect(ctx, -22, -18, 7, 36, highlight, 2.5);
    if (detail) {
      sticker.bolt(ctx, -19, -19);
      sticker.bolt(ctx, -19, 19);
    }
  }
  if (level >= 5) {
    sticker.rect(ctx, 13, -18, 7, 36, '#fff8ef', 2.5);
    sticker.rect(ctx, 15, -12, 4, 24, highlight, 1.5);
    sticker.rect(ctx, -4, -18, 9, 36, pale, 3);
  }
  if (detail && level >= 4) {
    sticker.bolt(ctx, -12, -18);
    sticker.bolt(ctx, -12, 18);
  }

  ctx.restore();
};

// 機槍塔：保持槍管間的白色空隙，等級決定二至五聯管數量。
export const drawMachineTowerNordic = (p: TowerDrawParams): void => {
  if (!sticker.begin(p)) return;
  const { ctx, color, highlight } = p;
  const level = sticker.level(p);
  const detail = sticker.detail(p);
  const pale = sticker.tint(color);
  const count = level < 3 ? 2 : level;
  const spacing = level >= 5 ? 4.4 : level >= 4 ? 4.9 : level >= 3 ? 5.7 : 7.4;
  const tubeWidth = level >= 5 ? 3 : level >= 4 ? 3.3 : 4;
  const span = (count - 1) * spacing * 0.5;

  sticker.rect(ctx, -29, -18, 30, 36, pale, 7);
  sticker.rect(ctx, -31, -11, 10, 22, color, 4);
  sticker.rect(ctx, -22, -13, 16, 26, highlight, 5);
  for (let i = 0; i < count; i += 1) {
    const y = (i - (count - 1) * 0.5) * spacing;
    sticker.rect(ctx, -3, y - tubeWidth * 0.5, 64, tubeWidth, '#fff8ef', tubeWidth * 0.5, 2.7);
    sticker.line(ctx, 1, y, 58, y, highlight, 1.6);
    sticker.line(ctx, 60, y - tubeWidth * 0.5, 60, y + tubeWidth * 0.5, '#2e2440', 2);
  }

  if (level >= 2) {
    sticker.rect(ctx, 15, -span - 4, 24, span * 2 + 8, color, 4);
    sticker.rect(ctx, 18, -span - 1, 6, span * 2 + 2, highlight, 2);
    for (let i = 1; i < level; i += 1) {
      const x = 15 + 24 * i / level;
      sticker.line(ctx, x, -span - 3, x, span + 3, '#2e2440', 2.2);
    }
  }
  if (level >= 3) {
    sticker.rect(ctx, -5, -span - 7, 7, span * 2 + 14, color, 3);
    sticker.rect(ctx, 43, -span - 5, 6, span * 2 + 10, pale, 2.5);
  }
  if (level >= 4) {
    sticker.rect(ctx, 47, -span - 7, 6, span * 2 + 14, color, 2.5);
    sticker.line(ctx, 49, -span - 4, 49, span + 4, highlight, 1.7);
  }
  if (level >= 5) {
    sticker.rect(ctx, -14, -span - 10, 8, span * 2 + 20, color, 3);
    sticker.rect(ctx, -12, -span - 7, 4, span * 2 + 14, '#fff8ef', 2);
    if (detail) {
      sticker.bolt(ctx, -10, -span - 6);
      sticker.bolt(ctx, -10, span + 6);
    }
  }
  if (detail && level >= 3) {
    sticker.bolt(ctx, 45, -span - 3);
    sticker.bolt(ctx, 45, span + 3);
  }

  ctx.restore();
};

// 散彈塔：灰色短機匣與扇形寬口，逐級增加扇面隔片及支架。
export const drawShotgunTowerNordic = (p: TowerDrawParams): void => {
  if (!sticker.begin(p)) return;
  const { ctx, color, highlight } = p;
  const level = sticker.level(p);
  const detail = sticker.detail(p);
  const pale = sticker.tint(color);
  const mouthHalf = 15 + level * 1.5;
  const mouthX = 38 + level * 1.5;

  sticker.rect(ctx, -28, -15, 30, 30, pale, 7);
  sticker.rect(ctx, -31, -11, 11, 22, color, 4);
  sticker.rect(ctx, -15, -8, 18, 16, '#fff8ef', 4);
  sticker.line(ctx, -11, 0, 0, 0, highlight, 2.2);

  ctx.beginPath();
  ctx.moveTo(-2, -7);
  ctx.lineTo(mouthX, -mouthHalf);
  ctx.lineTo(mouthX, mouthHalf);
  ctx.lineTo(-2, 7);
  ctx.closePath();
  sticker.paint(ctx, pale);

  ctx.beginPath();
  ctx.moveTo(3, -4);
  ctx.lineTo(mouthX - 4, -mouthHalf + 5);
  ctx.lineTo(mouthX - 4, mouthHalf - 5);
  ctx.lineTo(3, 4);
  ctx.closePath();
  sticker.paint(ctx, '#fff8ef', '#2e2440', 1.8);
  sticker.rect(ctx, mouthX - 4, -mouthHalf - 1, 7, mouthHalf * 2 + 2, '#fff8ef', 2.5, 2.7);
  sticker.rect(ctx, mouthX - 2, -mouthHalf + 3, 4, mouthHalf * 2 - 6, '#2e2440', 1.6, 1.7);

  for (let i = 1; i <= level; i += 1) {
    const ratio = i / (level + 1);
    const y = -mouthHalf + mouthHalf * 2 * ratio;
    sticker.line(ctx, 5, 0, mouthX - 3, y, '#2e2440', 2.1);
  }
  if (level >= 3) {
    sticker.rect(ctx, -27, -19, 12, 5, color, 2);
    sticker.rect(ctx, -27, 14, 12, 5, color, 2);
    sticker.rect(ctx, -23, -14, 6, 28, highlight, 2);
  }
  if (level >= 4) {
    sticker.rect(ctx, 2, -mouthHalf - 4, mouthX - 8, 4, color, 2);
    sticker.rect(ctx, 2, mouthHalf, mouthX - 8, 4, color, 2);
    sticker.line(ctx, 6, -mouthHalf - 2, mouthX - 7, -mouthHalf - 2, highlight, 1.6);
    sticker.line(ctx, 6, mouthHalf + 2, mouthX - 7, mouthHalf + 2, highlight, 1.6);
  }
  if (level >= 5) {
    sticker.rect(ctx, -16, -21, 9, 42, color, 3);
    sticker.hex(ctx, -7, 0, 6, '#fff8ef', 2.2);
    sticker.line(ctx, -3, -4, 1, 0, highlight, 2);
    sticker.line(ctx, 1, 0, -3, 4, highlight, 2);
  }
  if (detail && level >= 3) {
    sticker.bolt(ctx, -21, -17);
    sticker.bolt(ctx, -21, 17);
  }

  ctx.restore();
};

// 弩炮塔：依皮膚著色的弓臂、可見弓弦與中央箭軌，保持弓弩輪廓。
export const drawBallistaTowerNordic = (p: TowerDrawParams): void => {
  if (!sticker.begin(p)) return;
  const { ctx, color, highlight } = p;
  const level = sticker.level(p);
  const detail = sticker.detail(p);

  ctx.beginPath();
  ctx.moveTo(-5, -31);
  ctx.quadraticCurveTo(-29, -23, -28, 0);
  ctx.quadraticCurveTo(-29, 23, -5, 31);
  ctx.strokeStyle = '#2e2440';
  ctx.lineWidth = 9;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-5, -31);
  ctx.quadraticCurveTo(-29, -23, -28, 0);
  ctx.quadraticCurveTo(-29, 23, -5, 31);
  ctx.strokeStyle = color;
  ctx.lineWidth = 5.5;
  ctx.stroke();
  sticker.line(ctx, -5, -30, -5, 30, '#2e2440', 4);
  sticker.line(ctx, -5, -30, -5, 30, '#fff8ef', 2);

  if (level >= 2) {
    sticker.rect(ctx, -10, -34, 9, 6, '#fff8ef', 2.5);
    sticker.rect(ctx, -10, 28, 9, 6, '#fff8ef', 2.5);
    sticker.line(ctx, -8, -32, -4, -32, highlight, 1.8);
    sticker.line(ctx, -8, 32, -4, 32, highlight, 1.8);
  }
  if (level >= 4) {
    sticker.line(ctx, -8, -13, -20, -23, highlight, 3.5);
    sticker.line(ctx, -8, 13, -20, 23, highlight, 3.5);
    sticker.rect(ctx, -21, -25, 7, 5, highlight, 2);
    sticker.rect(ctx, -21, 20, 7, 5, highlight, 2);
  }

  sticker.rect(ctx, -26, -6, 76, 12, '#fff8ef', 3);
  sticker.line(ctx, -23, 0, 50, 0, color, 3.2);
  sticker.line(ctx, -20, -3, 45, -3, highlight, 1.8);
  sticker.line(ctx, -5, -30, -5, 30, '#2e2440', 4);
  sticker.line(ctx, -5, -30, -5, 30, '#fff8ef', 2);

  if (level >= 3) {
    sticker.hex(ctx, -15, 0, 9, color, 2.8);
    sticker.circle(ctx, -15, 0, 3, '#fff8ef', 2);
    sticker.line(ctx, -15, -5, -15, 5, highlight, 1.8);
  }
  if (level >= 5) {
    sticker.rect(ctx, -21, -9, 14, 18, color, 4);
    sticker.hub(ctx, '#fff8ef', 6, -14, 0);
    sticker.line(ctx, -6, -4, -6, 4, highlight, 2);
    ctx.beginPath();
    ctx.moveTo(-9, -3);
    ctx.lineTo(-15, -7);
    ctx.lineTo(-13, -2);
    ctx.closePath();
    sticker.paint(ctx, color, '#2e2440', 1.8);
    ctx.beginPath();
    ctx.moveTo(-9, 3);
    ctx.lineTo(-15, 7);
    ctx.lineTo(-13, 2);
    ctx.closePath();
    sticker.paint(ctx, color, '#2e2440', 1.8);
  }

  sticker.line(ctx, -5, 0, 65, 0, color, 3);
  ctx.beginPath();
  ctx.moveTo(76, 0);
  ctx.lineTo(64, -7);
  ctx.lineTo(67, 0);
  ctx.lineTo(64, 7);
  ctx.closePath();
  sticker.paint(ctx, color, '#2e2440', 2.8);
  if (level >= 5) {
    sticker.line(ctx, -2, -5, 4, -2, '#fff8ef', 2.1);
    sticker.line(ctx, -2, 5, 4, 2, '#fff8ef', 2.1);
  }
  if (detail && level >= 3) {
    sticker.bolt(ctx, -21, -11);
    sticker.bolt(ctx, -21, 11);
  }

  ctx.restore();
};
