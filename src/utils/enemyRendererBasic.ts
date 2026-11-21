/**
 * 基礎十種敵人的靜態糖果貼紙造型。
 * 本體不讀時間；所有輪廓、控制點及部件維持在局部 ±26 內。
 */

import { enemy } from './enemyRendererPrimitives';
import type { DrawFn } from './enemyRendererPrimitives';

/** 普通：圓潤史萊姆，扁圓底緣與不服氣的眉眼。 */
export const drawNormal: DrawFn = (ctx, x, y, r, color) => {
  if (!enemy.begin(ctx, x, y, r)) return;
  ctx.beginPath();
  ctx.moveTo(-22, 8);
  ctx.bezierCurveTo(-22, -8, -12, -21, 0, -21);
  ctx.bezierCurveTo(12, -21, 22, -8, 22, 8);
  ctx.bezierCurveTo(22, 18, 16, 22, 10, 19);
  ctx.quadraticCurveTo(0, 24, -10, 19);
  ctx.bezierCurveTo(-16, 22, -22, 18, -22, 8);
  ctx.closePath();
  enemy.paint(ctx, color, true);
  if (enemy.detail(r)) {
    enemy.ellipse(ctx, -7, -10, 6, 3.5, enemy.tint(color), false, 1.6);
  }
  enemy.eyes(ctx, 0, 3, 1.05);
  enemy.line(ctx, -12, -6, -5, -4);
  enemy.line(ctx, 5, -4, 12, -6);
  if (enemy.detail(r)) {
    ctx.beginPath();
    ctx.moveTo(-3, 13);
    ctx.quadraticCurveTo(0, 15, 3, 13);
    enemy.paint(ctx, null, false, '#2e2440', 2);
  }
  ctx.restore();
};

/** 快速：橫向水滴，短翼片與主體連成同一剪影。 */
export const drawFast: DrawFn = (ctx, x, y, r, color) => {
  if (!enemy.begin(ctx, x, y, r)) return;
  ctx.beginPath();
  ctx.moveTo(23, 0);
  ctx.bezierCurveTo(12, -14, 1, -18, -9, -14);
  ctx.lineTo(-18, -21);
  ctx.lineTo(-18, -11);
  ctx.bezierCurveTo(-25, -8, -25, 8, -18, 11);
  ctx.lineTo(-18, 21);
  ctx.lineTo(-9, 14);
  ctx.bezierCurveTo(1, 18, 12, 14, 23, 0);
  ctx.closePath();
  enemy.paint(ctx, color, true);
  ctx.beginPath();
  ctx.moveTo(-17, -10);
  ctx.quadraticCurveTo(-5, -15, 6, -8);
  ctx.quadraticCurveTo(-4, -10, -15, -5);
  ctx.closePath();
  enemy.paint(ctx, enemy.tint(color), false, '#2e2440', 1.6);
  enemy.eyes(ctx, 2, 2, 0.88, true);
  if (enemy.detail(r)) {
    enemy.line(ctx, -17, 10, -11, 7, '#2e2440', 2);
    enemy.line(ctx, 3, 11, 7, 10, '#2e2440', 2);
  }
  ctx.restore();
};

/** 精英：直立六角徽章，額上的菱形階徽始終保留。 */
export const drawElite: DrawFn = (ctx, x, y, r, color) => {
  if (!enemy.begin(ctx, x, y, r)) return;
  enemy.hex(ctx, 0, 0, 23, color, true);
  enemy.rect(ctx, -15, -5, 30, 23, enemy.tint(color), 7, false, 2.2);
  ctx.beginPath();
  ctx.moveTo(0, -20);
  ctx.lineTo(5, -13);
  ctx.lineTo(0, -7);
  ctx.lineTo(-5, -13);
  ctx.closePath();
  enemy.paint(ctx, '#fff8ef', false, '#2e2440', 2.2);
  enemy.eyes(ctx, 0, 5, 1, true);
  if (enemy.detail(r)) {
    enemy.line(ctx, -17, -2, -17, 5, '#fff8ef', 2);
    enemy.line(ctx, 17, -2, 17, 5, '#fff8ef', 2);
    enemy.line(ctx, -3, 14, 3, 14, '#2e2440', 2);
  }
  ctx.restore();
};

/** 極速：狹長折角閃電箭頭，與水滴快速兵使用不同剪影。 */
export const drawSpeedy: DrawFn = (ctx, x, y, r, color) => {
  if (!enemy.begin(ctx, x, y, r)) return;
  ctx.beginPath();
  ctx.moveTo(24, -2);
  ctx.lineTo(3, -17);
  ctx.lineTo(5, -7);
  ctx.lineTo(-22, -10);
  ctx.lineTo(-13, 0);
  ctx.lineTo(-23, 11);
  ctx.lineTo(-2, 8);
  ctx.lineTo(-5, 18);
  ctx.closePath();
  enemy.paint(ctx, color, true);
  ctx.beginPath();
  ctx.moveTo(8, -6);
  ctx.lineTo(17, -2);
  ctx.lineTo(7, 5);
  ctx.lineTo(10, 0);
  ctx.lineTo(4, -2);
  ctx.closePath();
  enemy.paint(ctx, enemy.tint(color), false, '#2e2440', 1.6);
  enemy.eyes(ctx, -6, 1, 0.75, true);
  if (enemy.detail(r)) {
    enemy.line(ctx, -6, 9, -2, 8, '#2e2440', 1.8);
  }
  ctx.restore();
};

/** 坦克：圓角方殼、兩側履帶與明亮的橫向眼窗。 */
export const drawTank: DrawFn = (ctx, x, y, r, color) => {
  if (!enemy.begin(ctx, x, y, r)) return;
  ctx.beginPath();
  ctx.moveTo(-13, -22);
  ctx.lineTo(13, -22);
  ctx.quadraticCurveTo(18, -22, 18, -16);
  ctx.lineTo(21, -16);
  ctx.quadraticCurveTo(24, -16, 24, -11);
  ctx.lineTo(24, 14);
  ctx.quadraticCurveTo(24, 18, 19, 18);
  ctx.lineTo(17, 18);
  ctx.quadraticCurveTo(15, 22, 11, 22);
  ctx.lineTo(-11, 22);
  ctx.quadraticCurveTo(-15, 22, -17, 18);
  ctx.lineTo(-19, 18);
  ctx.quadraticCurveTo(-24, 18, -24, 14);
  ctx.lineTo(-24, -11);
  ctx.quadraticCurveTo(-24, -16, -21, -16);
  ctx.lineTo(-18, -16);
  ctx.quadraticCurveTo(-18, -22, -13, -22);
  ctx.closePath();
  enemy.paint(ctx, color, true);
  enemy.rect(ctx, -23, -13, 8, 29, enemy.tint(color), 3, false, 2.2);
  enemy.rect(ctx, 15, -13, 8, 29, enemy.tint(color), 3, false, 2.2);
  enemy.rect(ctx, -16, -20, 32, 40, color, 6);
  enemy.rect(ctx, -7, -16, 14, 6, enemy.tint(color), 2, false, 1.8);
  enemy.rect(ctx, -13, -4, 26, 15, enemy.tint(color), 5, false, 2.2);
  enemy.eyes(ctx, 0, 3, 1);
  if (enemy.detail(r)) {
    for (let i = 0; i < 4; i += 1) {
      const ty = -8 + i * 6;
      enemy.line(ctx, -22, ty, -18, ty, '#2e2440', 1.8);
      enemy.line(ctx, 18, ty, 22, ty, '#2e2440', 1.8);
    }
    enemy.line(ctx, -5, 15, 5, 15, '#2e2440', 2);
  }
  ctx.restore();
};

/** 重型：寬六角重甲，以額部中線和下顎面罩區別坦克。 */
export const drawHeavy: DrawFn = (ctx, x, y, r, color) => {
  if (!enemy.begin(ctx, x, y, r)) return;
  ctx.beginPath();
  ctx.moveTo(-24, 0);
  ctx.lineTo(-13, -20);
  ctx.lineTo(13, -20);
  ctx.lineTo(24, 0);
  ctx.lineTo(13, 21);
  ctx.lineTo(-13, 21);
  ctx.closePath();
  enemy.paint(ctx, color, true);
  ctx.beginPath();
  ctx.moveTo(-20, 0);
  ctx.lineTo(-13, -13);
  ctx.lineTo(-10, -3);
  ctx.lineTo(-13, 13);
  ctx.closePath();
  enemy.paint(ctx, enemy.tint(color), false, '#2e2440', 2);
  ctx.beginPath();
  ctx.moveTo(20, 0);
  ctx.lineTo(13, -13);
  ctx.lineTo(10, -3);
  ctx.lineTo(13, 13);
  ctx.closePath();
  enemy.paint(ctx, enemy.tint(color), false, '#2e2440', 2);
  enemy.line(ctx, 0, -18, 0, -8, '#2e2440', 3.5);
  enemy.rect(ctx, -15, -3, 30, 15, '#2e2440', 5, false, 2);
  enemy.eyes(ctx, 0, 4, 0.97, true);
  ctx.beginPath();
  ctx.moveTo(-10, 12);
  ctx.lineTo(-7, 18);
  ctx.lineTo(7, 18);
  ctx.lineTo(10, 12);
  ctx.lineTo(0, 15);
  ctx.closePath();
  enemy.paint(ctx, enemy.tint(color), false, '#2e2440', 2);
  if (enemy.detail(r)) {
    enemy.line(ctx, 0, 14, 0, 18, '#2e2440', 1.8);
    enemy.circle(ctx, -10, -15, 1.5, '#fff8ef', false, 1.2);
    enemy.circle(ctx, 10, -15, 1.5, '#fff8ef', false, 1.2);
  }
  ctx.restore();
};

/** 首領：角冠與厚肩甲合為外輪廓，中心是清楚的深紫面罩。 */
export const drawBoss: DrawFn = (ctx, x, y, r, color) => {
  if (!enemy.begin(ctx, x, y, r)) return;
  ctx.beginPath();
  ctx.moveTo(-23, -4);
  ctx.lineTo(-16, -10);
  ctx.lineTo(-17, -23);
  ctx.lineTo(-8, -17);
  ctx.lineTo(0, -25);
  ctx.lineTo(8, -17);
  ctx.lineTo(17, -23);
  ctx.lineTo(16, -10);
  ctx.lineTo(23, -4);
  ctx.lineTo(24, 12);
  ctx.lineTo(15, 18);
  ctx.lineTo(9, 23);
  ctx.lineTo(-9, 23);
  ctx.lineTo(-15, 18);
  ctx.lineTo(-24, 12);
  ctx.closePath();
  enemy.paint(ctx, color, true);
  enemy.rect(ctx, -11, -16, 22, 6, enemy.tint(color), 2, false, 2);
  ctx.beginPath();
  ctx.moveTo(0, -22);
  ctx.lineTo(3, -18);
  ctx.lineTo(0, -14);
  ctx.lineTo(-3, -18);
  ctx.closePath();
  enemy.paint(ctx, '#ffd36e', false, '#2e2440', 1.8);
  ctx.beginPath();
  ctx.moveTo(-21, -2);
  ctx.lineTo(-14, -7);
  ctx.lineTo(-12, 13);
  ctx.lineTo(-21, 10);
  ctx.closePath();
  enemy.paint(ctx, enemy.tint(color), false, '#2e2440', 2.2);
  ctx.beginPath();
  ctx.moveTo(21, -2);
  ctx.lineTo(14, -7);
  ctx.lineTo(12, 13);
  ctx.lineTo(21, 10);
  ctx.closePath();
  enemy.paint(ctx, enemy.tint(color), false, '#2e2440', 2.2);
  ctx.beginPath();
  ctx.moveTo(-12, -5);
  ctx.lineTo(12, -5);
  ctx.lineTo(14, 9);
  ctx.lineTo(7, 18);
  ctx.lineTo(-7, 18);
  ctx.lineTo(-14, 9);
  ctx.closePath();
  enemy.paint(ctx, '#2e2440', false, '#2e2440', 2);
  enemy.eyes(ctx, 0, 3, 1.05, true, true);
  enemy.rect(ctx, -7, 11, 14, 6, color, 2, false, 1.8);
  if (enemy.detail(r)) {
    enemy.line(ctx, 0, 12, 0, 16, '#fff8ef', 1.8);
    enemy.circle(ctx, -18, 5, 1.6, '#fff8ef', false, 1.2);
    enemy.circle(ctx, 18, 5, 1.6, '#fff8ef', false, 1.2);
  }
  ctx.restore();
};

/** 飛行：固定雙翼與中央吊艙，不使用拍翅或懸浮動畫。 */
export const drawFlyer: DrawFn = (ctx, x, y, r, color) => {
  if (!enemy.begin(ctx, x, y, r)) return;
  ctx.beginPath();
  ctx.moveTo(0, -17);
  ctx.quadraticCurveTo(9, -19, 13, -10);
  ctx.lineTo(24, -16);
  ctx.lineTo(22, -1);
  ctx.lineTo(14, 6);
  ctx.lineTo(10, 3);
  ctx.quadraticCurveTo(10, 20, 0, 23);
  ctx.quadraticCurveTo(-10, 20, -10, 3);
  ctx.lineTo(-14, 6);
  ctx.lineTo(-22, -1);
  ctx.lineTo(-24, -16);
  ctx.lineTo(-13, -10);
  ctx.quadraticCurveTo(-9, -19, 0, -17);
  ctx.closePath();
  enemy.paint(ctx, color, true);
  ctx.beginPath();
  ctx.moveTo(-20, -11);
  ctx.lineTo(-13, -7);
  ctx.lineTo(-12, 0);
  ctx.lineTo(-19, -4);
  ctx.closePath();
  enemy.paint(ctx, enemy.tint(color), false, '#2e2440', 1.8);
  ctx.beginPath();
  ctx.moveTo(20, -11);
  ctx.lineTo(13, -7);
  ctx.lineTo(12, 0);
  ctx.lineTo(19, -4);
  ctx.closePath();
  enemy.paint(ctx, enemy.tint(color), false, '#2e2440', 1.8);
  enemy.ellipse(ctx, 0, 3, 10, 17, enemy.tint(color), false, 2.2);
  enemy.eyes(ctx, 0, 0, 0.78);
  enemy.line(ctx, 0, -11, 0, -7, '#2e2440', 2);
  if (enemy.detail(r)) {
    enemy.line(ctx, -3, 14, 3, 14, '#2e2440', 2);
  }
  ctx.restore();
};

/** 治療：白色醫療軟殼，額部薄荷十字與下方眼睛分開。 */
export const drawHealer: DrawFn = (ctx, x, y, r, color) => {
  if (!enemy.begin(ctx, x, y, r)) return;
  enemy.rect(ctx, -21, -21, 42, 42, color, 12, true);
  enemy.rect(ctx, -17, -17, 34, 34, '#ffffff', 9, false, 1.8);
  ctx.beginPath();
  ctx.moveTo(-3, -16);
  ctx.lineTo(3, -16);
  ctx.lineTo(3, -12);
  ctx.lineTo(7, -12);
  ctx.lineTo(7, -6);
  ctx.lineTo(3, -6);
  ctx.lineTo(3, -2);
  ctx.lineTo(-3, -2);
  ctx.lineTo(-3, -6);
  ctx.lineTo(-7, -6);
  ctx.lineTo(-7, -12);
  ctx.lineTo(-3, -12);
  ctx.closePath();
  enemy.paint(ctx, '#73dfb4', false, '#2e2440', 1.8);
  enemy.eyes(ctx, 0, 7, 1.03);
  if (enemy.detail(r)) {
    enemy.line(ctx, -20, 1, -18, 1, '#fff8ef', 1.8);
    enemy.line(ctx, 18, 1, 20, 1, '#fff8ef', 1.8);
    ctx.beginPath();
    ctx.moveTo(-3, 14);
    ctx.quadraticCurveTo(0, 16, 3, 14);
    enemy.paint(ctx, null, false, '#2e2440', 1.8);
  }
  ctx.restore();
};

/** 生產：單一母體育兒艙，三個幼體標記固定留在腹部視窗內。 */
export const drawSpawner: DrawFn = (ctx, x, y, r, color) => {
  if (!enemy.begin(ctx, x, y, r)) return;
  ctx.beginPath();
  ctx.moveTo(-16, -18);
  ctx.quadraticCurveTo(0, -25, 16, -18);
  ctx.quadraticCurveTo(23, -10, 22, 4);
  ctx.lineTo(19, 16);
  ctx.quadraticCurveTo(17, 22, 10, 22);
  ctx.lineTo(-10, 22);
  ctx.quadraticCurveTo(-17, 22, -19, 16);
  ctx.lineTo(-22, 4);
  ctx.quadraticCurveTo(-23, -10, -16, -18);
  ctx.closePath();
  enemy.paint(ctx, color, true);
  enemy.ellipse(ctx, 0, -8, 15, 9, enemy.tint(color), false, 2.2);
  enemy.eyes(ctx, 0, -7, 0.95);
  enemy.rect(ctx, -17, 4, 34, 14, enemy.tint(color), 6, false, 2.2);
  for (let i = 0; i < 3; i += 1) {
    const bx = -10 + i * 10;
    enemy.circle(ctx, bx, 11, 4.3, color, false, 1.6);
    if (enemy.detail(r)) {
      enemy.line(ctx, bx - 1.4, 10, bx - 1.4, 11.5, '#2e2440', 1);
      enemy.line(ctx, bx + 1.4, 10, bx + 1.4, 11.5, '#2e2440', 1);
    }
  }
  if (enemy.detail(r)) {
    enemy.line(ctx, -3, 0, 3, 0, '#2e2440', 1.8);
  }
  ctx.restore();
};
