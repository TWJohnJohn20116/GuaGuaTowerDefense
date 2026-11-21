/**
 * 進階敵人的靜態糖果貼紙造型；十二種實體剪影加 Mod 後備。
 * 局部路徑與控制點限於 ±26，白邊限於 ±30，沿用精靈快取畫幅。
 * 隱身與戰鬥特效由外層處理，本體不讀時間、不改呼叫端透明度。
 */

import { enemy } from './enemyRendererPrimitives';
import type { DrawFn } from './enemyRendererPrimitives';

/** 盾形主體、小面罩與內盾。 */
export const drawShield: DrawFn = (ctx, x, y, r, color) => {
  if (!enemy.begin(ctx, x, y, r)) return;
  ctx.beginPath();
  ctx.moveTo(0, -23);
  ctx.quadraticCurveTo(11, -18, 21, -18);
  ctx.lineTo(20, 3);
  ctx.quadraticCurveTo(18, 17, 0, 24);
  ctx.quadraticCurveTo(-18, 17, -20, 3);
  ctx.lineTo(-21, -18);
  ctx.quadraticCurveTo(-11, -18, 0, -23);
  ctx.closePath();
  enemy.paint(ctx, color, true);
  ctx.beginPath();
  ctx.moveTo(0, -15);
  ctx.lineTo(13, -11);
  ctx.lineTo(12, 4);
  ctx.quadraticCurveTo(10, 12, 0, 17);
  ctx.quadraticCurveTo(-10, 12, -12, 4);
  ctx.lineTo(-13, -11);
  ctx.closePath();
  enemy.paint(ctx, enemy.tint(color), false, '#2e2440', 2.2);
  enemy.rect(ctx, -13, -8, 26, 14, '#2e2440', 5, false, 1.8);
  enemy.eyes(ctx, 0, -1, 0.92);
  enemy.line(ctx, 0, 9, 0, 13, '#2e2440', 2.2);
  ctx.restore();
};

/** 菱形兜帽與忍者眼帶；真實隱身保留給外層。 */
export const drawStealth: DrawFn = (ctx, x, y, r, color) => {
  if (!enemy.begin(ctx, x, y, r)) return;
  ctx.beginPath();
  ctx.moveTo(0, -24);
  ctx.quadraticCurveTo(12, -17, 22, 0);
  ctx.quadraticCurveTo(17, 12, 0, 23);
  ctx.quadraticCurveTo(-17, 12, -22, 0);
  ctx.quadraticCurveTo(-12, -17, 0, -24);
  ctx.closePath();
  enemy.paint(ctx, color, true);
  ctx.beginPath();
  ctx.moveTo(-16, -3);
  ctx.quadraticCurveTo(0, -13, 16, -3);
  ctx.lineTo(14, 6);
  ctx.quadraticCurveTo(0, 10, -14, 6);
  ctx.closePath();
  enemy.paint(ctx, '#2e2440', false, '#2e2440', 2);
  enemy.eyes(ctx, 0, 1, 1, false, true);
  enemy.line(ctx, -6, 13, 0, 17, enemy.tint(color), 2.6);
  enemy.line(ctx, 0, 17, 6, 13, enemy.tint(color), 2.6);
  if (enemy.detail(r)) enemy.line(ctx, 0, -18, 5, -11, enemy.tint(color), 2);
  ctx.restore();
};

/** 鋸齒雙角連入本體剪影，怒眉與兩顆小獠牙。 */
export const drawBerserker: DrawFn = (ctx, x, y, r, color) => {
  if (!enemy.begin(ctx, x, y, r)) return;
  ctx.beginPath();
  ctx.moveTo(-10, -14);
  ctx.lineTo(-14, -24);
  ctx.lineTo(-19, -18);
  ctx.lineTo(-24, -23);
  ctx.lineTo(-22, -8);
  ctx.lineTo(-19, -3);
  ctx.quadraticCurveTo(-24, 8, -16, 17);
  ctx.quadraticCurveTo(0, 26, 16, 17);
  ctx.quadraticCurveTo(24, 8, 19, -3);
  ctx.lineTo(22, -8);
  ctx.lineTo(24, -23);
  ctx.lineTo(19, -18);
  ctx.lineTo(14, -24);
  ctx.lineTo(10, -14);
  ctx.quadraticCurveTo(0, -18, -10, -14);
  ctx.closePath();
  enemy.paint(ctx, color, true);
  ctx.beginPath();
  ctx.moveTo(-20, -18);
  ctx.lineTo(-17, -10);
  ctx.lineTo(-13, -13);
  ctx.moveTo(20, -18);
  ctx.lineTo(17, -10);
  ctx.lineTo(13, -13);
  enemy.paint(ctx, null, false, '#fff8ef', 3);
  enemy.eyes(ctx, 0, 1, 1.05, true);
  enemy.rect(ctx, -9, 10, 18, 5, '#2e2440', 2, false, 1.6);
  ctx.beginPath();
  ctx.moveTo(-7, 9);
  ctx.lineTo(-3, 9);
  ctx.lineTo(-5, 14);
  ctx.closePath();
  ctx.moveTo(3, 9);
  ctx.lineTo(7, 9);
  ctx.lineTo(5, 14);
  ctx.closePath();
  enemy.paint(ctx, '#fff8ef', false, '#2e2440', 1.4);
  ctx.restore();
};

/** 八角鉚釘重甲與格狀甲片，區別於 heavy 的六角形。 */
export const drawArmored: DrawFn = (ctx, x, y, r, color) => {
  if (!enemy.begin(ctx, x, y, r)) return;
  ctx.beginPath();
  ctx.moveTo(-11, -23);
  ctx.lineTo(11, -23);
  ctx.lineTo(23, -11);
  ctx.lineTo(23, 11);
  ctx.lineTo(11, 23);
  ctx.lineTo(-11, 23);
  ctx.lineTo(-23, 11);
  ctx.lineTo(-23, -11);
  ctx.closePath();
  enemy.paint(ctx, color, true, '#2e2440', 3.2);
  enemy.rect(ctx, -16, -16, 32, 32, enemy.tint(color), 6, false, 2.5);
  enemy.line(ctx, -15, -7, 15, -7, '#2e2440', 2);
  enemy.line(ctx, -15, 8, 15, 8, '#2e2440', 2);
  enemy.line(ctx, 0, -15, 0, -8, '#2e2440', 2);
  enemy.line(ctx, 0, 9, 0, 15, '#2e2440', 2);
  enemy.rect(ctx, -14, -5, 28, 11, '#2e2440', 3, false, 1.8);
  enemy.eyes(ctx, 0, 0, 0.86);
  if (enemy.detail(r)) {
    for (let i = 0; i < 4; i += 1) {
      const a = Math.PI / 4 + i * Math.PI / 2;
      enemy.circle(ctx, Math.cos(a) * 25, Math.sin(a) * 25, 1.8, '#fff8ef', false, 1.4);
    }
  }
  ctx.restore();
};

/** 寬帽沿尖帽與實體菱形法核，帽尖保留在快取內。 */
export const drawMage: DrawFn = (ctx, x, y, r, color) => {
  if (!enemy.begin(ctx, x, y, r)) return;
  ctx.beginPath();
  ctx.moveTo(-21, -4);
  ctx.lineTo(-12, -9);
  ctx.lineTo(-2, -25);
  ctx.quadraticCurveTo(4, -26, 7, -19);
  ctx.lineTo(13, -9);
  ctx.lineTo(21, -4);
  ctx.lineTo(15, -2);
  ctx.quadraticCurveTo(20, 4, 20, 18);
  ctx.quadraticCurveTo(0, 26, -20, 18);
  ctx.quadraticCurveTo(-20, 4, -15, -2);
  ctx.closePath();
  enemy.paint(ctx, color, true);
  ctx.beginPath();
  ctx.moveTo(-21, -4);
  ctx.quadraticCurveTo(0, 2, 21, -4);
  enemy.paint(ctx, null, false, '#2e2440', 2.2);
  enemy.line(ctx, -10, -7, 11, -7, '#fff8ef', 3);
  enemy.eyes(ctx, 0, 5, 0.85);
  ctx.beginPath();
  ctx.moveTo(0, 10);
  ctx.lineTo(5, 15);
  ctx.lineTo(0, 21);
  ctx.lineTo(-5, 15);
  ctx.closePath();
  enemy.paint(ctx, enemy.tint(color), false, '#2e2440', 1.8);
  if (enemy.detail(r)) enemy.line(ctx, 0, 13, 0, 17, '#ffffff', 1.6);
  ctx.restore();
};

/** 小型三尖王冠與圓角面罩，輪廓保持矮胖。 */
export const drawMiniboss: DrawFn = (ctx, x, y, r, color) => {
  if (!enemy.begin(ctx, x, y, r)) return;
  ctx.beginPath();
  ctx.moveTo(-22, -2);
  ctx.quadraticCurveTo(-22, -14, -13, -14);
  ctx.lineTo(-15, -24);
  ctx.lineTo(-7, -18);
  ctx.lineTo(0, -26);
  ctx.lineTo(7, -18);
  ctx.lineTo(15, -24);
  ctx.lineTo(13, -14);
  ctx.quadraticCurveTo(22, -14, 22, -2);
  ctx.lineTo(22, 10);
  ctx.quadraticCurveTo(22, 22, 10, 22);
  ctx.lineTo(-10, 22);
  ctx.quadraticCurveTo(-22, 22, -22, 10);
  ctx.closePath();
  enemy.paint(ctx, color, true, '#2e2440', 2.6);
  ctx.beginPath();
  ctx.moveTo(-13, -12);
  ctx.lineTo(-15, -24);
  ctx.lineTo(-7, -18);
  ctx.lineTo(0, -26);
  ctx.lineTo(7, -18);
  ctx.lineTo(15, -24);
  ctx.lineTo(13, -12);
  ctx.closePath();
  enemy.paint(ctx, '#ffdb76', false, '#2e2440', 2.6);
  enemy.circle(ctx, 0, -18, 2.3, color, false, 1.5);
  enemy.rect(ctx, -16, -6, 32, 21, enemy.tint(color), 7, false, 2.4);
  enemy.eyes(ctx, 0, 3, 1.05, true);
  enemy.line(ctx, -4, 12, 4, 12, '#2e2440', 2);
  if (enemy.detail(r)) {
    enemy.circle(ctx, -17, 17, 1.6, '#fff8ef', false, 1.2);
    enemy.circle(ctx, 17, 17, 1.6, '#fff8ef', false, 1.2);
  }
  ctx.restore();
};

/** 三節小蟲；觸角、短足與大眼在 r=6 仍保留。 */
export const drawSwarm: DrawFn = (ctx, x, y, r, color) => {
  if (!enemy.begin(ctx, x, y, r)) return;
  ctx.beginPath();
  for (let i = 0; i < 3; i += 1) {
    const py = -4 + i * 9;
    ctx.moveTo(-10, py);
    ctx.lineTo(-22, py + 4);
    ctx.moveTo(10, py);
    ctx.lineTo(22, py + 4);
  }
  ctx.moveTo(-5, -18);
  ctx.lineTo(-8, -24);
  ctx.moveTo(5, -18);
  ctx.lineTo(8, -24);
  enemy.paint(ctx, null, true, '#2e2440', 3);
  enemy.circle(ctx, -8, -24, 2, enemy.tint(color), false, 1.6);
  enemy.circle(ctx, 8, -24, 2, enemy.tint(color), false, 1.6);
  ctx.beginPath();
  ctx.moveTo(0, -22);
  ctx.bezierCurveTo(12, -22, 16, -12, 10, -7);
  ctx.bezierCurveTo(18, -1, 16, 9, 9, 12);
  ctx.bezierCurveTo(14, 25, -14, 25, -9, 12);
  ctx.bezierCurveTo(-16, 9, -18, -1, -10, -7);
  ctx.bezierCurveTo(-16, -12, -12, -22, 0, -22);
  ctx.closePath();
  enemy.paint(ctx, color, true);
  enemy.line(ctx, -9, -5, 9, -5, '#2e2440', 2.2);
  enemy.line(ctx, -9, 10, 9, 10, '#2e2440', 2.2);
  enemy.eyes(ctx, 0, -12, 0.92);
  if (enemy.detail(r)) enemy.line(ctx, 0, 0, 0, 6, enemy.tint(color), 2.6);
  ctx.restore();
};

/** 拱頂與固定波浪下擺，不用透明度假裝幽靈。 */
export const drawGhost: DrawFn = (ctx, x, y, r, color) => {
  if (!enemy.begin(ctx, x, y, r)) return;
  ctx.beginPath();
  ctx.moveTo(-21, 19);
  ctx.lineTo(-21, -2);
  ctx.bezierCurveTo(-21, -15, -12, -23, 0, -23);
  ctx.bezierCurveTo(12, -23, 21, -15, 21, -2);
  ctx.lineTo(21, 20);
  ctx.quadraticCurveTo(14, 12, 8, 21);
  ctx.quadraticCurveTo(1, 26, -5, 19);
  ctx.quadraticCurveTo(-12, 12, -16, 22);
  ctx.quadraticCurveTo(-20, 25, -21, 19);
  ctx.closePath();
  enemy.paint(ctx, color, true);
  ctx.beginPath();
  ctx.moveTo(-14, -7);
  ctx.quadraticCurveTo(-13, -17, -4, -17);
  enemy.paint(ctx, null, false, enemy.tint(color), 3);
  enemy.eyes(ctx, 0, -1, 1.12);
  enemy.ellipse(ctx, 0, 12, 3.4, 4.2, '#2e2440', false, 1.4);
  ctx.restore();
};

/** 圓炸彈殼、短引線及貼近引線的幾何火花。 */
export const drawBomber: DrawFn = (ctx, x, y, r, color) => {
  if (!enemy.begin(ctx, x, y, r)) return;
  ctx.beginPath();
  ctx.moveTo(2, -14);
  ctx.quadraticCurveTo(0, -23, 9, -22);
  enemy.paint(ctx, null, true, '#2e2440', 3);
  ctx.beginPath();
  ctx.moveTo(12, -26);
  ctx.lineTo(14, -22);
  ctx.lineTo(19, -22);
  ctx.lineTo(15, -19);
  ctx.lineTo(17, -14);
  ctx.lineTo(12, -17);
  ctx.lineTo(8, -14);
  ctx.lineTo(9, -19);
  ctx.lineTo(6, -22);
  ctx.lineTo(11, -22);
  ctx.closePath();
  enemy.paint(ctx, '#ffdb76', true, '#2e2440', 1.8);
  enemy.circle(ctx, 0, 4, 20, color, true, 3);
  enemy.rect(ctx, -5, -17, 11, 7, enemy.tint(color), 2, false, 2.2);
  ctx.beginPath();
  ctx.moveTo(-13, -3);
  ctx.quadraticCurveTo(-12, -9, -6, -10);
  enemy.paint(ctx, null, false, enemy.tint(color), 3);
  enemy.eyes(ctx, 0, 4, 1, true);
  enemy.line(ctx, -5, 15, 5, 15, '#2e2440', 2.4);
  ctx.restore();
};

/** 實體雙節點天線與劃線訊號徽記，不畫體外電波。 */
export const drawJammer: DrawFn = (ctx, x, y, r, color) => {
  if (!enemy.begin(ctx, x, y, r)) return;
  ctx.beginPath();
  ctx.moveTo(-10, -11);
  ctx.lineTo(-14, -22);
  ctx.moveTo(10, -11);
  ctx.lineTo(14, -22);
  enemy.paint(ctx, null, true, '#2e2440', 3);
  enemy.circle(ctx, -14, -22, 3.5, enemy.tint(color), true, 2);
  enemy.circle(ctx, 14, -22, 3.5, enemy.tint(color), true, 2);
  enemy.rect(ctx, -22, -14, 44, 37, color, 9, true);
  enemy.rect(ctx, -15, -8, 30, 13, '#2e2440', 4, false, 1.8);
  enemy.eyes(ctx, 0, -1, 0.95, false, true);
  enemy.rect(ctx, -12, 9, 24, 11, enemy.tint(color), 3, false, 1.8);
  enemy.line(ctx, -7, 16, -7, 15, '#2e2440', 2.4);
  enemy.line(ctx, -1, 16, -1, 12, '#2e2440', 2.4);
  enemy.line(ctx, 5, 16, 5, 11, '#2e2440', 2.4);
  enemy.line(ctx, -8, 11, 8, 18, '#2e2440', 2.6);
  ctx.restore();
};

/** 雙肩盾與胸前護衛十字，與單盾輪廓不同。 */
export const drawEscort: DrawFn = (ctx, x, y, r, color) => {
  if (!enemy.begin(ctx, x, y, r)) return;
  ctx.beginPath();
  ctx.moveTo(-11, -20);
  ctx.quadraticCurveTo(0, -25, 11, -20);
  ctx.lineTo(15, -12);
  ctx.lineTo(24, -10);
  ctx.lineTo(24, 5);
  ctx.lineTo(16, 11);
  ctx.lineTo(14, 20);
  ctx.quadraticCurveTo(0, 25, -14, 20);
  ctx.lineTo(-16, 11);
  ctx.lineTo(-24, 5);
  ctx.lineTo(-24, -10);
  ctx.lineTo(-15, -12);
  ctx.closePath();
  enemy.paint(ctx, color, true);
  ctx.beginPath();
  ctx.moveTo(-22, -7);
  ctx.lineTo(-14, -9);
  ctx.lineTo(-14, 5);
  ctx.lineTo(-18, 9);
  ctx.lineTo(-22, 4);
  ctx.closePath();
  ctx.moveTo(22, -7);
  ctx.lineTo(14, -9);
  ctx.lineTo(14, 5);
  ctx.lineTo(18, 9);
  ctx.lineTo(22, 4);
  ctx.closePath();
  enemy.paint(ctx, enemy.tint(color), false, '#2e2440', 2.2);
  enemy.rect(ctx, -12, -13, 24, 17, '#2e2440', 6, false, 1.8);
  enemy.eyes(ctx, 0, -4, 0.88);
  ctx.beginPath();
  ctx.moveTo(-3, 7);
  ctx.lineTo(3, 7);
  ctx.lineTo(3, 11);
  ctx.lineTo(7, 11);
  ctx.lineTo(7, 16);
  ctx.lineTo(3, 16);
  ctx.lineTo(3, 20);
  ctx.lineTo(-3, 20);
  ctx.lineTo(-3, 16);
  ctx.lineTo(-7, 16);
  ctx.lineTo(-7, 11);
  ctx.lineTo(-3, 11);
  ctx.closePath();
  enemy.paint(ctx, '#fff8ef', false, '#2e2440', 1.6);
  ctx.restore();
};

/** 深色工程帽與開口扳手徽記，主體保留傳入配色。 */
export const drawSaboteur: DrawFn = (ctx, x, y, r, color) => {
  if (!enemy.begin(ctx, x, y, r)) return;
  ctx.beginPath();
  ctx.moveTo(-23, 0);
  ctx.lineTo(-23, -5);
  ctx.lineTo(-19, -8);
  ctx.bezierCurveTo(-19, -21, -10, -24, 0, -24);
  ctx.bezierCurveTo(10, -24, 19, -21, 19, -8);
  ctx.lineTo(23, -5);
  ctx.lineTo(23, 0);
  ctx.lineTo(19, 0);
  ctx.lineTo(19, 13);
  ctx.quadraticCurveTo(19, 23, 9, 23);
  ctx.lineTo(-9, 23);
  ctx.quadraticCurveTo(-19, 23, -19, 13);
  ctx.lineTo(-19, 0);
  ctx.closePath();
  enemy.paint(ctx, color, true);
  ctx.beginPath();
  ctx.moveTo(-23, -5);
  ctx.lineTo(-19, -8);
  ctx.bezierCurveTo(-19, -21, -10, -24, 0, -24);
  ctx.bezierCurveTo(10, -24, 19, -21, 19, -8);
  ctx.lineTo(23, -5);
  ctx.lineTo(23, 0);
  ctx.lineTo(-23, 0);
  ctx.closePath();
  enemy.paint(ctx, '#2e2440', false, '#2e2440', 2.8);
  enemy.rect(ctx, -4, -23, 8, 17, color, 3, false, 1.8);
  enemy.line(ctx, -17, -4, 17, -4, enemy.tint(color), 2.4);
  enemy.eyes(ctx, 0, 4, 0.95);
  ctx.beginPath();
  ctx.moveTo(-11, 15);
  ctx.lineTo(1, 15);
  ctx.lineTo(4, 11);
  ctx.lineTo(10, 11);
  ctx.lineTo(6, 15);
  ctx.lineTo(6, 18);
  ctx.lineTo(11, 20);
  ctx.lineTo(5, 22);
  ctx.lineTo(1, 19);
  ctx.lineTo(-11, 19);
  ctx.closePath();
  enemy.paint(ctx, '#fff8ef', false, '#2e2440', 1.8);
  ctx.restore();
};

/** 未知或 Mod 類型後備：圓潤小怪，保留主色與清楚表情。 */
export const drawDefault: DrawFn = (ctx, x, y, r, color) => {
  if (!enemy.begin(ctx, x, y, r)) return;
  ctx.beginPath();
  ctx.moveTo(-19, -8);
  ctx.quadraticCurveTo(-24, -20, -12, -17);
  ctx.quadraticCurveTo(0, -25, 12, -17);
  ctx.quadraticCurveTo(24, -20, 19, -8);
  ctx.bezierCurveTo(26, 4, 21, 22, 8, 21);
  ctx.quadraticCurveTo(0, 25, -8, 21);
  ctx.bezierCurveTo(-21, 22, -26, 4, -19, -8);
  ctx.closePath();
  enemy.paint(ctx, color, true);
  enemy.eyes(ctx, 0, 0, 1.08);
  ctx.beginPath();
  ctx.moveTo(-5, 11);
  ctx.quadraticCurveTo(0, 17, 5, 11);
  enemy.paint(ctx, null, false, '#2e2440', 2.4);
  if (enemy.detail(r)) {
    enemy.ellipse(ctx, -14, 7, 3, 1.8, enemy.tint(color), false, 1);
    enemy.ellipse(ctx, 14, 7, 3, 1.8, enemy.tint(color), false, 1);
  }
  ctx.restore();
};
