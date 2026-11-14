// 基礎塔 - 北歐極簡幾何風重設計 (drawBasicTowerNordic)
//
// 設計準則:
//   1. 只用「圓 / 圓角矩形 / 多邊形 / 短直線」這幾種乾淨的幾何圖形, 不使用機械寫實
//      元素(制退器/散熱鰭/履帶) ──── 改以「層次」和「對稱留白」表達等級成長感。
//   2. 顏色: 主體沿用 p.color (依塔種類保有識別性), 但把暗部統一壓到 #1a1d24,
//      高光分兩階: 冷白色 (NORDIC_WHITE) 與主題 highlight, 等級越高發光與環越多。
//   3. 5 個等級每級「加一個視覺記號」, 從輕到重: 單管 → 雙高光 → 雙環底座 →
//      箭頭炮口 → 雙軌能量導向器 + 六芒星核心。讓玩家「一眼就能讀出等級」。
//   4. 為了與現有 Canvas 渲染管線無痛接軌, 動態(rotation/recoil)邏輯保留, 僅替換
//      「圖樣」。所有座標仍以「炮管朝 +X」為基準(rotation=0 時朝右)。

import type { TowerDrawParams } from '../TowerModels';
import {
  NORDIC_DARK,
  NORDIC_WHITE,
  rr,
  drawNordicBase,
  drawHex as drawHexCore,
  drawSoftGlow,
  drawDots,
  ringForLevel,
} from './nordicShared';
  
export const drawBasicTowerNordic = (p: TowerDrawParams): void => {
  const { ctx, cx, cy, radius, rotation, color, highlight, level, recoil } = p;

  drawNordicBase(ctx, cx, cy, radius, color, ringForLevel(level));

  if (level >= 5) {
    drawSoftGlow(ctx, cx, cy, radius * 1.15, highlight, 0.32);
  } else if (level >= 4) {
    drawSoftGlow(ctx, cx, cy, radius * 1.05, highlight, 0.2);
  }

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  const bo = -recoil;

  if (level === 1) {
    rr(ctx, bo, -3.5, radius + 7, 7, 3.5);
    ctx.fillStyle = NORDIC_DARK;
    ctx.fill();
    rr(ctx, bo + 1.5, -2.25, radius + 4, 4.5, 2.25);
    ctx.fillStyle = highlight;
    ctx.fill();
  } else if (level === 2) {
    rr(ctx, bo, -4, radius + 10, 8, 4);
    ctx.fillStyle = NORDIC_DARK;
    ctx.fill();
    rr(ctx, bo + 1.5, -2.75, radius + 7, 5.5, 2.75);
    ctx.fillStyle = highlight;
    ctx.fill();
    rr(ctx, bo + 1.5, -3.75, radius + 7, 1, 0.5);
    ctx.fillStyle = NORDIC_WHITE;
    ctx.globalAlpha = 0.6;
    ctx.fill();
    ctx.globalAlpha = 1;
  } else if (level === 3) {
    rr(ctx, bo - 1, -5.5, 4, 11, 1.5);
    ctx.fillStyle = NORDIC_DARK;
    ctx.fill();

    rr(ctx, bo, -4.5, radius + 12, 9, 4.5);
    ctx.fillStyle = NORDIC_DARK;
    ctx.fill();
    rr(ctx, bo + 1.5, -3.25, radius + 9, 6.5, 3.25);
    ctx.fillStyle = highlight;
    ctx.fill();

    rr(ctx, bo + radius * 0.35, -6.5, 4, 2, 1);
    ctx.fillStyle = NORDIC_DARK;
    ctx.fill();
    rr(ctx, bo + radius * 0.35, 4.5, 4, 2, 1);
    ctx.fill();
  } else if (level === 4) {
    rr(ctx, bo - 2, -6, 5, 12, 2);
    ctx.fillStyle = NORDIC_DARK;
    ctx.fill();
    rr(ctx, bo - 1, -5, 3, 10, 1);
    ctx.fillStyle = color;
    ctx.fill();

    rr(ctx, bo, -5, radius + 10, 10, 5);
    ctx.fillStyle = NORDIC_DARK;
    ctx.fill();
    rr(ctx, bo + 1.5, -3.75, radius + 7, 7.5, 3.75);
    ctx.fillStyle = highlight;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(bo + radius + 7, -6);
    ctx.lineTo(bo + radius + 14, 0);
    ctx.lineTo(bo + radius + 7, 6);
    ctx.closePath();
    ctx.fillStyle = NORDIC_DARK;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(bo + radius + 8.5, -3.5);
    ctx.lineTo(bo + radius + 11.5, 0);
    ctx.lineTo(bo + radius + 8.5, 3.5);
    ctx.closePath();
    ctx.fillStyle = highlight;
    ctx.fill();
  } else {
    rr(ctx, bo - 4, -8, 8, 16, 3);
    ctx.fillStyle = NORDIC_DARK;
    ctx.fill();
    rr(ctx, bo - 2.5, -6.5, 5, 13, 2);
    ctx.fillStyle = color;
    ctx.fill();

    ctx.fillStyle = NORDIC_DARK;
    rr(ctx, bo + 2, -7, radius + 8, 3, 1.5);
    ctx.fill();
    rr(ctx, bo + 2, 4, radius + 8, 3, 1.5);
    ctx.fill();

    ctx.shadowColor = highlight;
    ctx.shadowBlur = 6;
    ctx.fillStyle = highlight;
    rr(ctx, bo + 3.5, -6, radius + 5, 1.4, 0.7);
    ctx.fill();
    rr(ctx, bo + 3.5, 4.6, radius + 5, 1.4, 0.7);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.moveTo(bo + radius + 11, -7.5);
    ctx.lineTo(bo + radius + 17, 0);
    ctx.lineTo(bo + radius + 11, 7.5);
    ctx.closePath();
    ctx.fillStyle = NORDIC_DARK;
    ctx.fill();

    ctx.shadowColor = highlight;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(bo + radius + 12, -4.5);
    ctx.lineTo(bo + radius + 15, 0);
    ctx.lineTo(bo + radius + 12, 4.5);
    ctx.closePath();
    ctx.fillStyle = highlight;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  ctx.restore();

  if (level >= 2) {
    const coreR = level >= 5 ? 4.2 : level >= 4 ? 3.5 : level >= 3 ? 2.8 : 2.2;
    drawHexCore(ctx, cx, cy, coreR, NORDIC_WHITE, highlight);
    if (level >= 4) {
      ctx.save();
      ctx.shadowColor = highlight;
      ctx.shadowBlur = 5;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR * 0.45, 0, Math.PI * 2);
      ctx.fillStyle = highlight;
      ctx.fill();
      ctx.restore();
    }
  }

  if (level === 3) {
    drawDots(ctx, cx, cy, 3, radius * 0.65, 1.3, highlight);
  }
};
