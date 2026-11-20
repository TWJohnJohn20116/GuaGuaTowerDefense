// 元素塔的俯視糖果貼紙造型；座標以半徑 35、炮口朝 +X 為基準。
// 升級只增加機械結構；小圖保留元素輪廓，略去鉚釘與次要刻線。

import type { TowerDrawParams } from '../TowerModels';
import { sticker } from './nordicShared';

// frost：六角雪花、冰刺導向、冷卻鰭與結晶核心。
export const drawFrostTowerNordic = (p: TowerDrawParams): void => {
  if (!sticker.begin(p, 'hex')) return;
  const { ctx, color, highlight } = p;
  const level = sticker.level(p);
  const detail = sticker.detail(p);
  const pale = sticker.tint(color);

  // 雪花六支主臂在小尺寸也保留；二級起加上分叉。
  for (let i = 0; i < 6; i++) {
    const a = i * Math.PI / 3;
    const c = Math.cos(a);
    const s = Math.sin(a);
    sticker.line(ctx, -7 + c * 8, s * 8, -7 + c * 27, s * 27, '#2e2440', 6.6);
    sticker.line(ctx, -7 + c * 8, s * 8, -7 + c * 27, s * 27, '#fff', 3.5);
    if (level >= 2) {
      for (let side = -1; side <= 1; side += 2) {
        const x = -7 + c * 18;
        const y = s * 18;
        const tx = -7 + c * 23 - s * side * 5;
        const ty = s * 23 + c * side * 5;
        sticker.line(ctx, x, y, tx, ty, '#2e2440', 4.8);
        sticker.line(ctx, x, y, tx, ty, '#fff', 2.4);
      }
    }
  }

  // 三級的雙側冰刺與主刺共同導向，不改底座尺寸。
  if (level >= 3) {
    for (let side = -1; side <= 1; side += 2) {
      ctx.beginPath();
      ctx.moveTo(7, side * 11);
      ctx.lineTo(14, side * 21);
      ctx.lineTo(level >= 5 ? 56 : 47, side * 12);
      ctx.lineTo(19, side * 8);
      ctx.closePath();
      sticker.paint(ctx, pale);
    }
  }
  if (level >= 4) {
    sticker.rect(ctx, -27, -23, 9, 14, '#fff8ef', 3);
    sticker.rect(ctx, -27, 9, 9, 14, '#fff8ef', 3);
    if (detail) {
      sticker.line(ctx, -24, -18, -20, -18, color, 2);
      sticker.line(ctx, -24, 18, -20, 18, color, 2);
    }
  }

  // 主冰刺始終清楚可辨；最長端點 73，小於共同上限 85。
  ctx.beginPath();
  ctx.moveTo(3, -11);
  ctx.lineTo(18, -8);
  ctx.lineTo(level >= 5 ? 73 : 61, 0);
  ctx.lineTo(18, 8);
  ctx.lineTo(3, 11);
  ctx.closePath();
  sticker.paint(ctx, color);
  if (detail) sticker.line(ctx, 19, 0, level >= 5 ? 59 : 48, 0, highlight, 2.5);
  if (level >= 2) sticker.rect(ctx, 8, -14, 9, 28, '#fff8ef', 3);
  if (level >= 5) {
    sticker.rect(ctx, 32, -11, 8, 22, '#fff', 3);
    sticker.hex(ctx, -7, 0, 15, '#fff8ef');
  }
  sticker.hub(ctx, highlight, level >= 5 ? 10 : 9, -7, 0);
  if (level >= 4) sticker.hex(ctx, -7, 0, 5, '#fff', 2);
  if (detail && level >= 2) {
    sticker.bolt(ctx, 12.5, -9);
    sticker.bolt(ctx, 12.5, 9);
  }
  ctx.restore();
};

// poison：深淺雙儲罐、多孔噴頭、雙供液管與壓力調節器。
export const drawPoisonTowerNordic = (p: TowerDrawParams): void => {
  if (!sticker.begin(p)) return;
  const { ctx, color, highlight } = p;
  const level = sticker.level(p);
  const detail = sticker.detail(p);
  const pale = sticker.tint(color);

  if (level >= 5) {
    sticker.rect(ctx, -33, -29, 45, 9, '#fff8ef', 3);
    sticker.rect(ctx, -33, 20, 45, 9, '#fff8ef', 3);
  }
  if (level >= 3) {
    for (let side = -1; side <= 1; side += 2) {
      ctx.beginPath();
      ctx.moveTo(-16, side * 17);
      ctx.lineTo(27, side * 17);
      ctx.quadraticCurveTo(38, side * 17, 38, side * 8);
      sticker.paint(ctx, null, '#2e2440', 7);
      sticker.paint(ctx, null, highlight, 3.7);
    }
  }

  // 儲罐始終一深一淺，皮膚顏色完全由 p 提供。
  sticker.rect(ctx, -29, -24, 18, 48, color, 7);
  sticker.rect(ctx, -4, -24, 18, 48, pale, 7);
  sticker.rect(ctx, -29, -27, 18, 9, '#fff8ef', 3);
  sticker.rect(ctx, -4, -27, 18, 9, '#fff8ef', 3);
  if (level >= 2) {
    sticker.rect(ctx, -30, 12, 20, 7, '#fff8ef', 2.5);
    sticker.rect(ctx, -5, 12, 20, 7, '#fff8ef', 2.5);
  }

  // 水滴是罐體上的平面標誌，所有尺寸都畫。
  ctx.beginPath();
  ctx.moveTo(-20, -12);
  ctx.bezierCurveTo(-23, -7, -28, -2, -26, 3);
  ctx.bezierCurveTo(-24, 10, -16, 10, -14, 3);
  ctx.bezierCurveTo(-12, -2, -17, -7, -20, -12);
  ctx.closePath();
  sticker.paint(ctx, '#fff');

  sticker.rect(ctx, 6, -10, 37, 20, color, 6);
  if (level >= 3) sticker.rect(ctx, 20, -13, 8, 26, '#fff8ef', 3);
  if (level >= 5) {
    sticker.hex(ctx, 10, 0, 10, '#fff');
    sticker.circle(ctx, 10, 0, 4, highlight, 2);
  }
  const nozzleX = level >= 4 ? 45 : 42;
  const nozzleHalf = level >= 4 ? 19 : 15;
  sticker.rect(ctx, nozzleX, -nozzleHalf, 14, nozzleHalf * 2, '#fff8ef', 5);
  const holes = level >= 4 ? 5 : 3;
  for (let i = 0; i < holes; i++) {
    const y = (i - (holes - 1) / 2) * 6;
    sticker.circle(ctx, nozzleX + 7, y, 1.9, '#2e2440', 1);
  }
  if (detail) {
    sticker.line(ctx, 2, -12, 8, -12, '#fff', 2.3);
    if (level >= 2) {
      sticker.bolt(ctx, -20, 15.5);
      sticker.bolt(ctx, 5, 15.5);
    }
    if (level >= 4) {
      sticker.line(ctx, 31, -5, 37, -5, highlight, 2);
      sticker.line(ctx, 31, 5, 37, 5, highlight, 2);
    }
  }
  ctx.restore();
};

// flame：後置燃料罐、短隔熱噴口、火種與逐級散熱結構。
export const drawFlameTowerNordic = (p: TowerDrawParams): void => {
  if (!sticker.begin(p)) return;
  const { ctx, color, highlight } = p;
  const level = sticker.level(p);
  const detail = sticker.detail(p);
  const pale = sticker.tint(color);

  // 四級新增回流管；它在罐體與隔熱件後方，沒有透視側面。
  if (level >= 4) {
    for (let side = -1; side <= 1; side += 2) {
      ctx.beginPath();
      ctx.moveTo(-20, side * 17);
      ctx.lineTo(-20, side * 28);
      ctx.lineTo(18, side * 28);
      ctx.lineTo(25, side * 17);
      sticker.paint(ctx, null, '#2e2440', 7);
      sticker.paint(ctx, null, pale, 3.7);
    }
  }
  sticker.rect(ctx, -29, -24, 18, 48, color, 7);
  sticker.rect(ctx, -25, -28, 10, 7, '#fff8ef', 2.5);
  sticker.rect(ctx, -5, -24, 19, 48, '#fff8ef', 6);
  sticker.rect(ctx, -1, -15, 12, 30, pale, 3);
  if (level >= 2) sticker.rect(ctx, -31, 8, 22, 8, '#fff8ef', 3);
  if (level >= 3) {
    sticker.rect(ctx, 8, -24, 22, 8, '#fff8ef', 3);
    sticker.rect(ctx, 8, 16, 22, 8, '#fff8ef', 3);
  }

  // 短而外張的噴口，與長管炮塔的輪廓區分。
  ctx.beginPath();
  ctx.moveTo(9, -10);
  ctx.lineTo(41, -19);
  ctx.lineTo(41, 19);
  ctx.lineTo(9, 10);
  ctx.closePath();
  sticker.paint(ctx, color);
  sticker.rect(ctx, 39, -21, 12, 42, '#fff8ef', 5);
  if (level >= 5) {
    sticker.rect(ctx, 32, -26, 22, 8, '#fff', 3);
    sticker.rect(ctx, 32, 18, 22, 8, '#fff', 3);
    sticker.circle(ctx, -20, -9, 7, '#fff');
    sticker.line(ctx, -20, -9, -17, -12, color, 2.5);
  }

  sticker.hub(ctx, '#fff8ef', 5, 4, 0);
  // 火種用封閉火焰剪影呈現，避免退化為發光圓點。
  ctx.beginPath();
  ctx.moveTo(18, 10);
  ctx.bezierCurveTo(10, 6, 12, -1, 17, -6);
  ctx.quadraticCurveTo(20, -1, 22, -3);
  ctx.quadraticCurveTo(25, -8, 21, -13);
  ctx.bezierCurveTo(35, -8, 38, 0, 32, 7);
  ctx.quadraticCurveTo(26, 14, 18, 10);
  ctx.closePath();
  sticker.paint(ctx, highlight);
  if (level >= 2) {
    ctx.beginPath();
    ctx.moveTo(22, 8);
    ctx.quadraticCurveTo(18, 3, 24, -2);
    ctx.quadraticCurveTo(25, 2, 29, 3);
    ctx.quadraticCurveTo(29, 9, 22, 8);
    ctx.closePath();
    sticker.paint(ctx, '#fff8ef', '#2e2440', 1.8);
  }
  if (detail) {
    if (level < 5) {
      sticker.line(ctx, -25, -14, -16, -14, pale, 2);
      sticker.line(ctx, -25, -7, -16, -7, pale, 2);
    }
    if (level >= 2) sticker.bolt(ctx, -20, 12);
    if (level >= 3) {
      for (let i = 0; i < 3; i++) {
        sticker.line(ctx, 14 + i * 5, -21, 14 + i * 5, -18, color, 1.7);
        sticker.line(ctx, 14 + i * 5, 18, 14 + i * 5, 21, color, 1.7);
      }
    }
  }
  ctx.restore();
};

// wind：所有等級維持三葉風扇；機罩、護架與輪轂固定不追敵。
export const drawWindTowerNordic = (p: TowerDrawParams): void => {
  if (!sticker.begin(p, 'round', false)) return;
  const { ctx, color, highlight } = p;
  const level = sticker.level(p);
  const detail = sticker.detail(p);
  const pale = sticker.tint(color);

  sticker.circle(ctx, 0, 0, 32, color);
  sticker.circle(ctx, 0, 0, 27, '#fff8ef', 2.6);
  if (level >= 2) {
    for (let i = 0; i < 4; i++) {
      ctx.save();
      ctx.rotate(i * Math.PI / 2);
      sticker.rect(ctx, 27, -5, 9, 10, '#fff', 3);
      ctx.restore();
    }
  }

  // 只在局部旋轉葉片；迴圈沒有建立陣列、閉包或狀態。
  ctx.save();
  ctx.rotate((Date.now() / (620 - level * 55)) % (Math.PI * 2));
  for (let i = 0; i < 3; i++) {
    ctx.save();
    ctx.rotate(i * Math.PI * 2 / 3);
    ctx.beginPath();
    ctx.moveTo(3, -5);
    ctx.bezierCurveTo(6, -16, 15, -25, 23, -15);
    ctx.quadraticCurveTo(28, -8, 22, -2);
    ctx.lineTo(9, 7);
    ctx.closePath();
    sticker.paint(ctx, i === 1 ? pale : highlight);
    if (detail && level >= 2) sticker.line(ctx, 12, -9, 20, -12, '#fff', 2);
    ctx.restore();
  }
  ctx.restore();

  // 三級護架與五級格柵都在旋轉恢復後繪製。
  if (level >= 3) {
    for (let i = 0; i < 3; i++) {
      const a = Math.PI / 2 + i * Math.PI * 2 / 3;
      const x = Math.cos(a);
      const y = Math.sin(a);
      sticker.line(ctx, x * 8, y * 8, x * 28, y * 28, '#2e2440', 6);
      sticker.line(ctx, x * 8, y * 8, x * 28, y * 28, '#fff8ef', 2.8);
    }
  }
  if (level >= 4) {
    for (let i = 0; i < 4; i++) {
      ctx.save();
      ctx.rotate(Math.PI / 4 + i * Math.PI / 2);
      sticker.rect(ctx, 26, -5, 9, 10, pale, 3);
      if (detail) {
        sticker.line(ctx, 30, -2, 32, -2, color, 1.5);
        sticker.line(ctx, 30, 2, 32, 2, color, 1.5);
      }
      ctx.restore();
    }
  }
  if (level >= 5) {
    for (let side = -1; side <= 1; side += 2) {
      sticker.line(ctx, -20, side * 15, 20, side * 15, '#2e2440', 4.7);
      sticker.line(ctx, -20, side * 15, 20, side * 15, '#fff8ef', 2.3);
    }
    sticker.hex(ctx, 0, 0, 11, '#fff8ef');
  }
  sticker.hub(ctx, '#fff8ef', level >= 5 ? 8 : 9, 0, 0);
  sticker.circle(ctx, 0, 0, level >= 5 ? 4.5 : 3.5, color, 1.8);
  if (detail) {
    for (let i = 0; i < 3; i++) {
      const a = -Math.PI / 2 + i * Math.PI * 2 / 3;
      sticker.bolt(ctx, Math.cos(a) * 30, Math.sin(a) * 30);
    }
  }
  ctx.restore();
};
