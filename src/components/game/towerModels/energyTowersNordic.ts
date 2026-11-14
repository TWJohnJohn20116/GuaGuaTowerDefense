// 能量/特殊型塔 - 北歐極簡幾何風重設計
//
// 包含: laser / lightning / pulse / money 共 4 種, 各 5 等級。
// 設計關鍵:
//   laser:    細長雷射發射管 + 聚焦鏡, 高等多重平行管
//   lightning: 球形 Tesla 線圈 + 周圍環繞天線
//   pulse:    同心圓波紋 (不旋轉, 中心呼吸光環)
//   money:    幾何 $ 符號 + 金色發光 (沒方向, 不旋轉)

import type { TowerDrawParams } from '../TowerModels';
import {
  NORDIC_DARK,
  NORDIC_WHITE,
  rr,
  drawNordicBase,
  drawHex,
  drawSoftGlow,
  drawDots,
  ringForLevel,
} from './nordicShared';

// ============================================================
// laser 雷射塔 - 細長平行管 + 聚焦鏡
// ============================================================
export const drawLaserTowerNordic = (p: TowerDrawParams): void => {
  const { ctx, cx, cy, radius, rotation, color, highlight, level, recoil } = p;

  drawNordicBase(ctx, cx, cy, radius, color, ringForLevel(level));
  if (level >= 3) drawSoftGlow(ctx, cx, cy, radius * 1.18, highlight, 0.22 + (level - 3) * 0.06);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  const bo = -recoil;

  const drawLaserBarrel = (off: number, len: number, w: number) => {
    rr(ctx, bo, off - w / 2, len, w, w / 2); ctx.fillStyle = NORDIC_DARK; ctx.fill();
    rr(ctx, bo + 1.5, off - w / 4, len - 3, w / 2, w / 4); ctx.fillStyle = highlight; ctx.fill();
    ctx.shadowColor = highlight;
    ctx.shadowBlur = 4;
    rr(ctx, bo + 2, off - 0.4, len - 4, 0.8, 0.4); ctx.fillStyle = NORDIC_WHITE; ctx.fill();
    ctx.shadowBlur = 0;
  };

  if (level === 1) {
    drawLaserBarrel(0, radius + 16, 4);
  } else if (level === 2) {
    drawLaserBarrel(0, radius + 18, 4.5);
    ctx.beginPath();
    ctx.arc(bo + radius * 0.45, 0, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = NORDIC_DARK; ctx.fill();
    ctx.beginPath();
    ctx.arc(bo + radius * 0.45, 0, 2, 0, Math.PI * 2);
    ctx.fillStyle = highlight; ctx.fill();
  } else if (level === 3) {
    for (const off of [-4, 4]) drawLaserBarrel(off, radius + 18, 3.5);
    rr(ctx, bo - 2, -7, 5, 14, 2); ctx.fillStyle = NORDIC_DARK; ctx.fill();
  } else if (level === 4) {
    for (const off of [-6, 0, 6]) drawLaserBarrel(off, radius + 20, 3);
    rr(ctx, bo - 3, -10, 6, 20, 3); ctx.fillStyle = color; ctx.fill();
    ctx.strokeStyle = NORDIC_DARK; ctx.lineWidth = 1.5; ctx.stroke();
  } else {
    drawLaserBarrel(0, radius + 24, 6);
    for (const off of [-7, 7]) drawLaserBarrel(off, radius + 18, 3.5);

    rr(ctx, bo - 5, -12, 9, 24, 4); ctx.fillStyle = NORDIC_DARK; ctx.fill();
    rr(ctx, bo - 3.5, -10.5, 6, 21, 3); ctx.fillStyle = color; ctx.fill();

    ctx.beginPath();
    ctx.arc(bo + radius * 0.35, 0, 5, 0, Math.PI * 2);
    ctx.fillStyle = NORDIC_WHITE;
    ctx.shadowColor = highlight; ctx.shadowBlur = 10; ctx.fill(); ctx.shadowBlur = 0;
  }

  ctx.restore();

  if (level >= 2) drawHex(ctx, cx, cy, level >= 5 ? 4.5 : level >= 4 ? 3.5 : 2.8, NORDIC_WHITE, highlight);
};

// ============================================================
// lightning 電擊塔 - Tesla 球 + 環繞天線 (不依賴 rotation, 主視覺對稱)
// ============================================================
export const drawLightningTowerNordic = (p: TowerDrawParams): void => {
  const { ctx, cx, cy, radius, color, highlight, level } = p;

  drawNordicBase(ctx, cx, cy, radius, color, ringForLevel(level));
  if (level >= 3) drawSoftGlow(ctx, cx, cy, radius * 1.2, highlight, 0.28 + (level - 3) * 0.05);

  const antennaCount = Math.min(8, 3 + level);
  const antLen = radius * 0.7;
  ctx.strokeStyle = NORDIC_DARK; ctx.lineWidth = 2;
  for (let i = 0; i < antennaCount; i++) {
    const a = (Math.PI * 2 * i) / antennaCount - Math.PI / 2;
    const ax = cx + Math.cos(a) * radius * 0.45;
    const ay = cy + Math.sin(a) * radius * 0.45;
    const bx = cx + Math.cos(a) * antLen;
    const by = cy + Math.sin(a) * antLen;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(bx, by, level >= 4 ? 1.6 : 1.2, 0, Math.PI * 2);
    ctx.fillStyle = highlight;
    ctx.shadowColor = highlight; ctx.shadowBlur = 4; ctx.fill(); ctx.shadowBlur = 0;
  }

  const coreR = level === 1 ? 4 : level === 2 ? 5 : level === 3 ? 6 : level === 4 ? 7 : 8;
  ctx.beginPath();
  ctx.arc(cx, cy, coreR + 1, 0, Math.PI * 2);
  ctx.fillStyle = NORDIC_DARK; ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
  ctx.fillStyle = color; ctx.fill();
  ctx.shadowColor = highlight;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(cx, cy, coreR * 0.55, 0, Math.PI * 2);
  ctx.fillStyle = NORDIC_WHITE; ctx.fill();
  ctx.shadowBlur = 0;

  if (level >= 4) {
    // 電弧連線 (六角頂點 → 中心)
    const t = (Date.now() / 80) % 6;
    const flickerIdx = Math.floor(t);
    const a = (Math.PI * 2 * flickerIdx) / 6 - Math.PI / 2;
    const fx = cx + Math.cos(a) * antLen;
    const fy = cy + Math.sin(a) * antLen;
    ctx.strokeStyle = highlight;
    ctx.lineWidth = 1.2;
    ctx.shadowColor = highlight; ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    const midX = (cx + fx) / 2 + (Math.random() - 0.5) * 3;
    const midY = (cy + fy) / 2 + (Math.random() - 0.5) * 3;
    ctx.lineTo(midX, midY);
    ctx.lineTo(fx, fy);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  if (level >= 5) drawHex(ctx, cx, cy, 11, 'transparent', highlight, Math.PI / 6);
};

// ============================================================
// pulse 脈衝塔 - 同心圓波紋, 不旋轉
// ============================================================
export const drawPulseTowerNordic = (p: TowerDrawParams): void => {
  const { ctx, cx, cy, radius, color, highlight, level } = p;

  drawNordicBase(ctx, cx, cy, radius, color, ringForLevel(level));
  if (level >= 2) drawSoftGlow(ctx, cx, cy, radius * 1.2, highlight, 0.2 + (level - 2) * 0.06);

  const ringCount = Math.min(5, level + 1);
  ctx.lineWidth = 1.5;
  for (let i = 1; i <= ringCount; i++) {
    const r = (radius * 0.18) + i * (radius * 0.12);
    const alpha = Math.max(0.18, 0.55 - i * 0.08);
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = highlight + Math.round(alpha * 255).toString(16).padStart(2, '0');
    ctx.stroke();
  }

  // 呼吸光環: 用 Date.now() 做時間動畫
  const pulse = (Math.sin(Date.now() / 250) + 1) / 2;
  const breathR = radius * (0.55 + pulse * 0.35);
  ctx.beginPath();
  ctx.arc(cx, cy, breathR, 0, Math.PI * 2);
  ctx.strokeStyle = highlight + Math.round((0.7 - pulse * 0.4) * 255).toString(16).padStart(2, '0');
  ctx.lineWidth = 2;
  ctx.stroke();

  const coreR = level >= 5 ? 5 : level >= 3 ? 4 : 3;
  ctx.beginPath();
  ctx.arc(cx, cy, coreR + 1, 0, Math.PI * 2);
  ctx.fillStyle = NORDIC_DARK; ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
  ctx.fillStyle = color; ctx.fill();
  ctx.shadowColor = highlight; ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(cx, cy, coreR * 0.55, 0, Math.PI * 2);
  ctx.fillStyle = NORDIC_WHITE; ctx.fill();
  ctx.shadowBlur = 0;

  if (level >= 4) drawDots(ctx, cx, cy, level >= 5 ? 8 : 6, radius * 0.92, 1.2, highlight);
};

// ============================================================
// money 錢塔 - 幾何 $ 符號 + 金色發光, 完全靜態
// ============================================================
export const drawMoneyTowerNordic = (p: TowerDrawParams): void => {
  const { ctx, cx, cy, radius, color, highlight, level } = p;

  drawNordicBase(ctx, cx, cy, radius, color, ringForLevel(level));
  if (level >= 2) drawSoftGlow(ctx, cx, cy, radius * 1.2, highlight, 0.25 + (level - 2) * 0.06);

  // 旋轉的金色光暈 (純美學, 表達「持續生成」)
  const haloRot = (Date.now() / 1500) % (Math.PI * 2);
  if (level >= 3) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(haloRot);
    ctx.strokeStyle = highlight + '80';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 4; i++) {
      ctx.save();
      ctx.rotate((Math.PI / 2) * i);
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.85, -0.3, 0.3);
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }

  // 中央金幣 (深底 + 主色 + 高光)
  const coinR = radius * (level >= 5 ? 0.62 : level >= 3 ? 0.55 : 0.5);
  ctx.beginPath();
  ctx.arc(cx, cy, coinR + 2, 0, Math.PI * 2);
  ctx.fillStyle = NORDIC_DARK; ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, coinR, 0, Math.PI * 2);
  ctx.fillStyle = color; ctx.fill();
  ctx.strokeStyle = highlight; ctx.lineWidth = 1.5;
  ctx.stroke();

  // 幾何 $ 符號 (圓 + 豎線)
  ctx.shadowColor = highlight;
  ctx.shadowBlur = level >= 4 ? 6 : 3;
  ctx.fillStyle = NORDIC_DARK;
  ctx.lineWidth = 1.8;
  ctx.strokeStyle = NORDIC_DARK;
  ctx.beginPath();
  ctx.arc(cx - coinR * 0.18, cy - coinR * 0.22, coinR * 0.28, -Math.PI * 0.2, Math.PI * 0.9, true);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx + coinR * 0.18, cy + coinR * 0.22, coinR * 0.28, Math.PI * 0.8, Math.PI * 1.9, true);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, cy - coinR * 0.75);
  ctx.lineTo(cx, cy + coinR * 0.75);
  ctx.stroke();
  ctx.shadowBlur = 0;

  if (level >= 4) drawDots(ctx, cx, cy, 4, radius * 0.95, 1.4, highlight, Math.PI / 4);
};
