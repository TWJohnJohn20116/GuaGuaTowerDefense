import type { TowerDrawParams } from '../TowerModels';
import { TOWER_DATA } from '@/data/gameData/towerData';
import { sticker } from './nordicShared';

/** 冰雷合體：六角冰晶、導向冰刺與成對電極。 */
export const drawStormTowerNordic = (p: TowerDrawParams): void => {
  if (!sticker.begin(p, 'hex')) return;
  const { ctx, color, highlight } = p;
  const lv = sticker.level(p);
  const secondary = TOWER_DATA.lightning.color;
  const length = 49 + lv * 2;
  for (let i = 0; i < (lv >= 3 ? 2 : 1); i += 1) {
    const side = i === 0 ? -1 : 1;
    ctx.beginPath();
    ctx.moveTo(-13, side * 22);
    ctx.lineTo(19, side * 22);
    ctx.lineTo(31, side * 33);
    ctx.lineTo(42, side * 33);
    sticker.paint(ctx, null, undefined, 5);
    sticker.circle(ctx, 42, side * 33, lv >= 4 ? 6 : 5, secondary);
  }
  ctx.beginPath();
  ctx.moveTo(11, -11);
  ctx.lineTo(length, 0);
  ctx.lineTo(11, 11);
  ctx.lineTo(22, 0);
  ctx.closePath();
  sticker.paint(ctx, highlight);
  ctx.beginPath();
  ctx.moveTo(-9, -22);
  ctx.lineTo(-21, 0);
  ctx.lineTo(-10, 0);
  ctx.lineTo(-15, 21);
  ctx.lineTo(6, -5);
  ctx.lineTo(-7, -5);
  ctx.closePath();
  sticker.paint(ctx, secondary);
  if (lv >= 2) sticker.line(ctx, -29, -9, -29, 9, '#ffffff', 3);
  if (lv >= 4) {
    sticker.rect(ctx, -35, -16, 8, 32, sticker.tint(color), 3);
    sticker.line(ctx, 18, -16, 35, -16, '#ffffff', 3);
    sticker.line(ctx, 18, 16, 35, 16, '#ffffff', 3);
  }
  if (lv >= 5) {
    sticker.circle(ctx, -3, -28, 5, secondary);
    sticker.circle(ctx, -3, 28, 5, secondary);
  }
  ctx.restore();
};

/** 毒焰合體：並列的毒液與燃料儲罐，接入同一隔熱噴頭。 */
export const drawPlagueTowerNordic = (p: TowerDrawParams): void => {
  if (!sticker.begin(p)) return;
  const { ctx, color, highlight } = p;
  const lv = sticker.level(p);
  const fire = TOWER_DATA.flame.color;
  sticker.rect(ctx, -30, -25, 23, 50, color, 7);
  sticker.rect(ctx, -2, -25, lv >= 2 ? 23 : 16, 50, fire, 7);
  sticker.rect(ctx, -29, -28, 21, 8, '#fff8ef', 3);
  if (lv >= 2) sticker.rect(ctx, -1, -28, 21, 8, '#fff8ef', 3);
  ctx.beginPath();
  ctx.moveTo(11, -12);
  ctx.lineTo(34, -12);
  ctx.lineTo(51 + lv, -22);
  ctx.lineTo(61 + lv, -12);
  ctx.lineTo(61 + lv, 12);
  ctx.lineTo(51 + lv, 22);
  ctx.lineTo(34, 12);
  ctx.lineTo(11, 12);
  ctx.closePath();
  sticker.paint(ctx, color);
  sticker.rect(ctx, 48 + lv, -20, 15, 40, '#fff8ef', 5);
  ctx.beginPath();
  ctx.moveTo(-19, -13);
  ctx.quadraticCurveTo(-31, 0, -19, 10);
  ctx.quadraticCurveTo(-7, 0, -19, -13);
  sticker.paint(ctx, highlight);
  ctx.beginPath();
  ctx.moveTo(7, -14);
  ctx.quadraticCurveTo(23, -4, 15, 8);
  ctx.quadraticCurveTo(4, 16, 3, 4);
  ctx.quadraticCurveTo(0, -3, 9, -3);
  ctx.closePath();
  sticker.paint(ctx, fire);
  if (lv >= 3) {
    sticker.line(ctx, 56 + lv, -11, 56 + lv, -5, undefined, 2.5);
    sticker.line(ctx, 56 + lv, 1, 56 + lv, 7, undefined, 2.5);
  }
  if (lv >= 4) {
    sticker.rect(ctx, -33, 24, 58, 8, '#ffffff', 3);
    if (sticker.detail(p)) sticker.bolt(ctx, -24, 28);
  }
  if (lv >= 5) {
    sticker.rect(ctx, 27, -17, 10, 34, sticker.tint(color), 3);
    sticker.circle(ctx, 9, 19, 5, highlight);
  }
  ctx.restore();
};

/** 炮狙合體：重型後座座架、長砲軌與獨立測距鏡。 */
export const drawDemolisherTowerNordic = (p: TowerDrawParams): void => {
  if (!sticker.begin(p)) return;
  const { ctx, color, highlight } = p;
  const lv = sticker.level(p);
  const length = 60 + lv * 3;
  sticker.rect(ctx, -34, -26, 22, 52, '#fff8ef', 7);
  sticker.rect(ctx, -10, -31, 29, 62, color, 9);
  sticker.rect(ctx, -6, -16, length, 32, color, 7);
  sticker.rect(ctx, length - 14, -23, 16, 46, '#fff8ef', 6);
  sticker.line(ctx, length - 6, -13, length - 6, 13, undefined, 5);
  if (lv >= 2) sticker.rect(ctx, -4, -26, 28, 7, TOWER_DATA.sniper.color, 3);
  if (lv >= 3) sticker.rect(ctx, 34, -22, 11, 44, TOWER_DATA.sniper.highlightColor, 4);
  if (lv >= 4) {
    sticker.rect(ctx, -26, -34, 29, 8, '#ffffff', 3);
    sticker.rect(ctx, -26, 26, 29, 8, '#ffffff', 3);
  }
  if (lv >= 5) {
    sticker.line(ctx, 8, -9, 28, -9, highlight, 4);
    sticker.line(ctx, 8, 9, 28, 9, highlight, 4);
    sticker.hex(ctx, -18, 0, 13, '#ffffff');
  } else sticker.hub(ctx, '#ffffff', 9, -18);
  if (sticker.detail(p)) {
    sticker.bolt(ctx, -25, -17);
    sticker.bolt(ctx, -25, 17);
  }
  ctx.restore();
};

/** 風脈合體：旋轉風扇位於實體脈衝環內，四向節點留在固定機罩上。 */
export const drawTempestTowerNordic = (p: TowerDrawParams): void => {
  if (!sticker.begin(p, 'round', false)) return;
  const { ctx, color, highlight } = p;
  const lv = sticker.level(p);
  sticker.circle(ctx, 0, 0, 31, sticker.tint(color));
  if (lv >= 4) sticker.circle(ctx, 0, 0, 26, color);
  ctx.save();
  ctx.rotate(Date.now() / 1100);
  for (let i = 0; i < 3; i += 1) {
    ctx.save();
    ctx.rotate(i * Math.PI * 2 / 3);
    ctx.beginPath();
    ctx.moveTo(-4, -7);
    ctx.quadraticCurveTo(-23, -22, -12, -28);
    ctx.quadraticCurveTo(6, -32, 14, -21);
    ctx.lineTo(7, -4);
    ctx.closePath();
    sticker.paint(ctx, color);
    ctx.restore();
  }
  ctx.restore();
  const nodes = lv >= 2 ? 4 : 2;
  for (let i = 0; i < nodes; i += 1) {
    ctx.save();
    ctx.rotate(i * Math.PI * 2 / nodes);
    sticker.rect(ctx, -6, -43, 12, lv >= 3 ? 15 : 11, highlight, 4);
    ctx.restore();
  }
  if (lv >= 5) sticker.hex(ctx, 0, 0, 13, '#fff8ef');
  else sticker.hub(ctx, '#fff8ef', 10, 0);
  if (sticker.detail(p) && lv >= 3) {
    sticker.line(ctx, 46, -10, 61, -10, undefined, 2.5);
    sticker.line(ctx, 49, 0, 70, 0, undefined, 2.5);
    sticker.line(ctx, 46, 10, 61, 10, undefined, 2.5);
  }
  ctx.restore();
};
