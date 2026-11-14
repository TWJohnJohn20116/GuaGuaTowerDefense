// 物理彈丸型塔 - 北歐極簡幾何風重設計
//
// 包含: sniper / cannon / machine / shotgun / ballista 共 5 種, 各 5 等級。
// 全部使用 nordicShared 提供的幾何元素 (圓盤、圓角矩形、六角、三角箭頭、發光環、小點),
// 不再使用機械寫實的散熱片/制退器/履帶。等級遞進靠「形狀層次」與「核心點亮」表達。

import type { TowerDrawParams } from '../TowerModels';
import {
  NORDIC_DARK,
  NORDIC_WHITE,
  rr,
  drawNordicBase,
  drawHex,
  drawSoftGlow,
  drawArrow,
  ringForLevel,
} from './nordicShared';

// ============================================================
// sniper 狙擊塔 - 長細炮管 + 圓形瞄準鏡 + 紅色光點為標誌
// ============================================================
export const drawSniperTowerNordic = (p: TowerDrawParams): void => {
  const { ctx, cx, cy, radius, rotation, color, highlight, level, recoil } = p;

  drawNordicBase(ctx, cx, cy, radius, color, ringForLevel(level));
  if (level >= 4) drawSoftGlow(ctx, cx, cy, radius * 1.1, highlight, 0.22);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  const bo = -recoil;

  if (level === 1) {
    const len = radius + 14;
    rr(ctx, bo, -2, len, 4, 2); ctx.fillStyle = NORDIC_DARK; ctx.fill();
    rr(ctx, bo + 1.5, -1, len - 3, 2, 1); ctx.fillStyle = highlight; ctx.fill();
  } else if (level === 2) {
    const len = radius + 17;
    rr(ctx, bo, -2.5, len, 5, 2.5); ctx.fillStyle = NORDIC_DARK; ctx.fill();
    rr(ctx, bo + 1.5, -1.25, len - 3, 2.5, 1.25); ctx.fillStyle = highlight; ctx.fill();
    ctx.beginPath();
    ctx.arc(bo + radius * 0.45, -5, 2.6, 0, Math.PI * 2);
    ctx.fillStyle = NORDIC_DARK; ctx.fill();
    ctx.strokeStyle = highlight; ctx.lineWidth = 1; ctx.stroke();
  } else if (level === 3) {
    const len = radius + 20;
    rr(ctx, bo, -3, len, 6, 3); ctx.fillStyle = NORDIC_DARK; ctx.fill();
    rr(ctx, bo + 1.5, -1.5, len - 3, 3, 1.5); ctx.fillStyle = highlight; ctx.fill();
    rr(ctx, bo + radius * 0.3, -7, 8, 3, 1.5); ctx.fillStyle = NORDIC_DARK; ctx.fill();
    ctx.beginPath();
    ctx.arc(bo + radius * 0.3 + 7, -5.5, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = highlight; ctx.fill();
    rr(ctx, bo + radius * 0.7, 4, 3, 4, 1); ctx.fillStyle = NORDIC_DARK; ctx.fill();
  } else if (level === 4) {
    const len = radius + 22;
    const gap = 2.5;
    for (const off of [-gap, gap]) {
      rr(ctx, bo, off - 1.75, len, 3.5, 1.5); ctx.fillStyle = NORDIC_DARK; ctx.fill();
      rr(ctx, bo + 1.5, off - 1, len - 3, 2, 1); ctx.fillStyle = highlight; ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(bo + radius * 0.45, 0, 3.2, 0, Math.PI * 2);
    ctx.fillStyle = NORDIC_DARK; ctx.fill();
    ctx.beginPath();
    ctx.arc(bo + radius * 0.45, 0, 1.8, 0, Math.PI * 2);
    ctx.fillStyle = highlight; ctx.fill();
  } else {
    const len = radius + 26;
    rr(ctx, bo - 4, -7, 8, 14, 3); ctx.fillStyle = NORDIC_DARK; ctx.fill();
    rr(ctx, bo - 2.5, -5.5, 5, 11, 2); ctx.fillStyle = color; ctx.fill();

    rr(ctx, bo, -3.5, len, 7, 3); ctx.fillStyle = NORDIC_DARK; ctx.fill();
    rr(ctx, bo + 1.5, -2.25, len - 3, 4.5, 2); ctx.fillStyle = highlight; ctx.fill();

    drawArrow(ctx, bo + len + 2, 0, 5, NORDIC_DARK);
    drawArrow(ctx, bo + len, 0, 3.2, highlight);

    ctx.beginPath();
    ctx.moveTo(bo + len + 5, 0);
    ctx.lineTo(bo + len + 22, 0);
    ctx.strokeStyle = highlight + '60';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  ctx.restore();

  if (level >= 2) {
    drawHex(ctx, cx, cy, level >= 5 ? 4 : level >= 4 ? 3.2 : 2.6, NORDIC_WHITE, highlight);
  }
};

// ============================================================
// cannon 加農炮塔 - 粗短炮管 + 圓口 + 護盾
// ============================================================
export const drawCannonTowerNordic = (p: TowerDrawParams): void => {
  const { ctx, cx, cy, radius, rotation, color, highlight, level, recoil } = p;

  drawNordicBase(ctx, cx, cy, radius, color, ringForLevel(level));
  if (level >= 5) drawSoftGlow(ctx, cx, cy, radius * 1.15, highlight, 0.32);
  else if (level >= 4) drawSoftGlow(ctx, cx, cy, radius * 1.05, highlight, 0.2);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  const bo = -recoil;

  if (level === 1) {
    rr(ctx, bo, -4.5, radius + 6, 9, 3); ctx.fillStyle = NORDIC_DARK; ctx.fill();
    rr(ctx, bo + 1.5, -3, radius + 3, 6, 2); ctx.fillStyle = highlight; ctx.fill();
    ctx.beginPath();
    ctx.arc(bo + radius + 6, 0, 4, 0, Math.PI * 2);
    ctx.fillStyle = NORDIC_DARK; ctx.fill();
    ctx.beginPath();
    ctx.arc(bo + radius + 6, 0, 2.4, 0, Math.PI * 2);
    ctx.fillStyle = color; ctx.fill();
  } else if (level === 2) {
    rr(ctx, bo, -5, radius + 8, 10, 3); ctx.fillStyle = NORDIC_DARK; ctx.fill();
    rr(ctx, bo + 1.5, -3.5, radius + 5, 7, 2.5); ctx.fillStyle = highlight; ctx.fill();
    ctx.beginPath();
    ctx.arc(bo + radius + 8, 0, 5, 0, Math.PI * 2);
    ctx.fillStyle = NORDIC_DARK; ctx.fill();
    ctx.beginPath();
    ctx.arc(bo + radius + 8, 0, 3, 0, Math.PI * 2);
    ctx.fillStyle = color; ctx.fill();
    ctx.strokeStyle = highlight; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(bo + radius + 8, 0, 4.5, 0, Math.PI * 2);
    ctx.stroke();
  } else if (level === 3) {
    const gap = 4;
    for (const off of [-gap, gap]) {
      rr(ctx, bo, off - 3, radius + 8, 6, 2); ctx.fillStyle = NORDIC_DARK; ctx.fill();
      rr(ctx, bo + 1.5, off - 2, radius + 5, 4, 1.5); ctx.fillStyle = highlight; ctx.fill();
      ctx.beginPath();
      ctx.arc(bo + radius + 8, off, 3, 0, Math.PI * 2);
      ctx.fillStyle = NORDIC_DARK; ctx.fill();
      ctx.beginPath();
      ctx.arc(bo + radius + 8, off, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = color; ctx.fill();
    }
    rr(ctx, bo - 1, -5, 4, 10, 1.5); ctx.fillStyle = NORDIC_DARK; ctx.fill();
  } else if (level === 4) {
    const offs = [-6, 0, 6];
    for (const off of offs) {
      rr(ctx, bo, off - 2.5, radius + 9, 5, 2); ctx.fillStyle = NORDIC_DARK; ctx.fill();
      rr(ctx, bo + 1.5, off - 1.5, radius + 6, 3, 1); ctx.fillStyle = highlight; ctx.fill();
      ctx.beginPath();
      ctx.arc(bo + radius + 9, off, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = NORDIC_DARK; ctx.fill();
    }
    rr(ctx, bo - 2, -8, 5, 16, 2); ctx.fillStyle = color; ctx.fill();
    ctx.strokeStyle = NORDIC_DARK; ctx.lineWidth = 1.5; ctx.stroke();
  } else {
    rr(ctx, bo - 5, -9, 9, 18, 3); ctx.fillStyle = NORDIC_DARK; ctx.fill();
    rr(ctx, bo - 3.5, -7.5, 6, 15, 2.5); ctx.fillStyle = color; ctx.fill();

    rr(ctx, bo, -6, radius + 12, 12, 4); ctx.fillStyle = NORDIC_DARK; ctx.fill();
    rr(ctx, bo + 2, -4.5, radius + 8, 9, 3); ctx.fillStyle = highlight; ctx.fill();

    ctx.beginPath();
    ctx.arc(bo + radius + 13, 0, 7, 0, Math.PI * 2);
    ctx.fillStyle = NORDIC_DARK; ctx.fill();
    ctx.beginPath();
    ctx.arc(bo + radius + 13, 0, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = color; ctx.fill();
    ctx.shadowColor = highlight;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(bo + radius + 13, 0, 2, 0, Math.PI * 2);
    ctx.fillStyle = highlight; ctx.fill();
    ctx.shadowBlur = 0;
  }

  ctx.restore();

  if (level >= 2) drawHex(ctx, cx, cy, level >= 5 ? 4.5 : level >= 4 ? 3.6 : 2.8, NORDIC_WHITE, highlight);
};

// ============================================================
// machine 機槍塔 - 多管平行 + 中央發光環
// ============================================================
export const drawMachineTowerNordic = (p: TowerDrawParams): void => {
  const { ctx, cx, cy, radius, rotation, color, highlight, level, recoil } = p;

  drawNordicBase(ctx, cx, cy, radius, color, ringForLevel(level));
  if (level >= 5) drawSoftGlow(ctx, cx, cy, radius * 1.15, highlight, 0.3);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  const bo = -recoil;

  const drawBarrels = (offsets: number[], len: number, w: number) => {
    for (const off of offsets) {
      rr(ctx, bo, off - w / 2, len, w, w / 2); ctx.fillStyle = NORDIC_DARK; ctx.fill();
      rr(ctx, bo + 1.5, off - w / 3, len - 3, (w * 2) / 3, w / 3); ctx.fillStyle = highlight; ctx.fill();
    }
  };

  if (level === 1) {
    drawBarrels([-3, 3], radius + 10, 3.5);
  } else if (level === 2) {
    drawBarrels([-3.5, 3.5], radius + 12, 4);
    rr(ctx, bo, -5, radius * 0.6, 10, 2); ctx.fillStyle = NORDIC_DARK; ctx.fill();
  } else if (level === 3) {
    drawBarrels([-5, 0, 5], radius + 14, 3);
    rr(ctx, bo - 5, -6, 6, 12, 2); ctx.fillStyle = NORDIC_DARK; ctx.fill();
  } else if (level === 4) {
    drawBarrels([-7, -2.5, 2.5, 7], radius + 16, 2.5);
    rr(ctx, bo - 3, -9, 5, 18, 2); ctx.fillStyle = color; ctx.fill();
    ctx.strokeStyle = NORDIC_DARK; ctx.lineWidth = 1.25; ctx.stroke();
    rr(ctx, bo + radius * 0.45, -8, 4, 16, 1); ctx.fillStyle = NORDIC_DARK; ctx.fill();
  } else {
    drawBarrels([-8, -4, 0, 4, 8], radius + 18, 2.2);
    rr(ctx, bo - 4, -11, 6, 22, 3); ctx.fillStyle = color; ctx.fill();
    ctx.strokeStyle = NORDIC_DARK; ctx.lineWidth = 1.5; ctx.stroke();
    rr(ctx, bo + radius * 0.4, -10, 5, 20, 2); ctx.fillStyle = NORDIC_DARK; ctx.fill();
    rr(ctx, bo + radius * 0.4 + 1, -8, 3, 16, 1); ctx.fillStyle = highlight; ctx.fill();
    rr(ctx, bo - 9, -6, 5, 12, 1.5); ctx.fillStyle = NORDIC_DARK; ctx.fill();
  }

  ctx.restore();

  if (level >= 3) drawHex(ctx, cx, cy, level >= 5 ? 4 : 3, NORDIC_WHITE, highlight);
};

// ============================================================
// ballista 弩炮塔 - 弓臂 + 弦線 + 上膛弩矢
// ============================================================
export const drawBallistaTowerNordic = (p: TowerDrawParams): void => {
  const { ctx, cx, cy, radius, rotation, color, highlight, level, recoil } = p;

  drawNordicBase(ctx, cx, cy, radius, color, ringForLevel(level));
  if (level >= 5) drawSoftGlow(ctx, cx, cy, radius * 1.15, highlight, 0.3);
  else if (level >= 4) drawSoftGlow(ctx, cx, cy, radius * 1.05, highlight, 0.2);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  const bo = -recoil;

  // 弓臂錨點與尺寸隨等級成長
  const armX = bo + radius * 0.3;
  const armLen = radius * (0.7 + level * 0.12);
  const armW = 2 + level * 0.5;
  const railLen = radius + 10 + level * 3;

  // 後彎弓臂（上下對稱的弧線）
  const drawArm = (sign: number, w: number, c: string) => {
    ctx.beginPath();
    ctx.moveTo(armX, sign * 2);
    ctx.quadraticCurveTo(armX + armLen * 0.3, sign * armLen * 0.6, armX - armLen * 0.2, sign * armLen);
    ctx.strokeStyle = c;
    ctx.lineWidth = w;
    ctx.lineCap = 'round';
    ctx.stroke();
  };
  drawArm(1, armW + 1.5, NORDIC_DARK);
  drawArm(-1, armW + 1.5, NORDIC_DARK);
  drawArm(1, armW, highlight);
  drawArm(-1, armW, highlight);

  // 弦線：兩臂末端連到尾端搭弦點
  const tipX = armX - armLen * 0.2;
  const nockX = bo - radius * 0.35;
  ctx.beginPath();
  ctx.moveTo(tipX, armLen);
  ctx.lineTo(nockX, 0);
  ctx.lineTo(tipX, -armLen);
  ctx.strokeStyle = NORDIC_WHITE + 'aa';
  ctx.lineWidth = 1;
  ctx.stroke();

  // 弩矢滑軌（中央長條）
  rr(ctx, bo - radius * 0.3, -2.5, railLen + radius * 0.3, 5, 2); ctx.fillStyle = NORDIC_DARK; ctx.fill();
  rr(ctx, bo - radius * 0.3 + 1.5, -1.25, railLen + radius * 0.3 - 3, 2.5, 1); ctx.fillStyle = color; ctx.fill();

  // 上膛弩矢（箭桿 + 箭頭）
  rr(ctx, nockX, -1, railLen - (nockX - bo) - 2, 2, 1); ctx.fillStyle = highlight; ctx.fill();
  if (level >= 4) {
    ctx.shadowColor = highlight;
    ctx.shadowBlur = 5;
  }
  drawArrow(ctx, bo + railLen + 2, 0, 4 + level * 0.6, NORDIC_DARK);
  drawArrow(ctx, bo + railLen, 0, 2.6 + level * 0.5, highlight);
  ctx.shadowBlur = 0;

  // Lv3+ 尾端絞盤；Lv5 瞄準延伸線
  if (level >= 3) {
    ctx.beginPath();
    ctx.arc(nockX - 2, 0, 3 + level * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = NORDIC_DARK; ctx.fill();
    ctx.beginPath();
    ctx.arc(nockX - 2, 0, 1.5 + level * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = color; ctx.fill();
  }
  if (level >= 5) {
    ctx.beginPath();
    ctx.moveTo(bo + railLen + 8, 0);
    ctx.lineTo(bo + railLen + 24, 0);
    ctx.strokeStyle = highlight + '60';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  ctx.restore();

  if (level >= 2) drawHex(ctx, cx, cy, level >= 5 ? 4 : level >= 4 ? 3.2 : 2.6, NORDIC_WHITE, highlight);
};

// ============================================================
// shotgun 散彈塔 - 短粗多孔炮口
// ============================================================
export const drawShotgunTowerNordic = (p: TowerDrawParams): void => {
  const { ctx, cx, cy, radius, rotation, color, highlight, level, recoil } = p;

  drawNordicBase(ctx, cx, cy, radius, color, ringForLevel(level));
  if (level >= 4) drawSoftGlow(ctx, cx, cy, radius * 1.1, highlight, 0.2);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  const bo = -recoil;

  if (level === 1) {
    rr(ctx, bo, -5.5, radius + 5, 11, 3); ctx.fillStyle = NORDIC_DARK; ctx.fill();
    rr(ctx, bo + 1.5, -4, radius + 2, 8, 2); ctx.fillStyle = highlight; ctx.fill();
    rr(ctx, bo + radius + 4, -7, 5, 14, 1.5); ctx.fillStyle = NORDIC_DARK; ctx.fill();
    for (const yy of [-3.5, 0, 3.5]) {
      ctx.beginPath();
      ctx.arc(bo + radius + 6.5, yy, 1.4, 0, Math.PI * 2);
      ctx.fillStyle = highlight; ctx.fill();
    }
  } else if (level === 2) {
    rr(ctx, bo, -6.5, radius + 7, 13, 3); ctx.fillStyle = NORDIC_DARK; ctx.fill();
    rr(ctx, bo + 1.5, -5, radius + 4, 10, 2.5); ctx.fillStyle = highlight; ctx.fill();
    rr(ctx, bo + radius + 6, -8, 5.5, 16, 2); ctx.fillStyle = NORDIC_DARK; ctx.fill();
    for (const yy of [-4.5, 0, 4.5]) {
      ctx.beginPath();
      ctx.arc(bo + radius + 8.5, yy, 1.6, 0, Math.PI * 2);
      ctx.fillStyle = highlight; ctx.fill();
    }
  } else if (level === 3) {
    const gap = 4;
    for (const off of [-gap, gap]) {
      rr(ctx, bo, off - 3.5, radius + 6, 7, 2); ctx.fillStyle = NORDIC_DARK; ctx.fill();
      rr(ctx, bo + 1.5, off - 2.5, radius + 3, 5, 1.5); ctx.fillStyle = highlight; ctx.fill();
    }
    rr(ctx, bo + radius + 5, -9, 6, 18, 2); ctx.fillStyle = NORDIC_DARK; ctx.fill();
    for (const yy of [-6, -2, 2, 6]) {
      ctx.beginPath();
      ctx.arc(bo + radius + 8, yy, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = highlight; ctx.fill();
    }
  } else if (level === 4) {
    rr(ctx, bo, -7.5, radius + 8, 15, 4); ctx.fillStyle = NORDIC_DARK; ctx.fill();
    rr(ctx, bo + 1.5, -6, radius + 5, 12, 3); ctx.fillStyle = highlight; ctx.fill();
    rr(ctx, bo + radius + 7, -10, 6, 20, 2); ctx.fillStyle = NORDIC_DARK; ctx.fill();
    for (let i = 0; i < 4; i++) {
      const ang = ((Math.PI / 2) * i) / 3 - Math.PI / 6;
      const yy = Math.sin(ang) * 7;
      ctx.beginPath();
      ctx.arc(bo + radius + 9.5, yy, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = highlight; ctx.fill();
    }
    rr(ctx, bo - 2, -10, 5, 20, 2); ctx.fillStyle = color; ctx.fill();
    ctx.strokeStyle = NORDIC_DARK; ctx.lineWidth = 1.25; ctx.stroke();
  } else {
    rr(ctx, bo - 3, -10, 7, 20, 3); ctx.fillStyle = NORDIC_DARK; ctx.fill();
    rr(ctx, bo - 1.5, -8.5, 4, 17, 2); ctx.fillStyle = color; ctx.fill();

    rr(ctx, bo, -9, radius + 10, 18, 4); ctx.fillStyle = NORDIC_DARK; ctx.fill();
    rr(ctx, bo + 1.5, -7.5, radius + 7, 15, 3); ctx.fillStyle = highlight; ctx.fill();

    rr(ctx, bo + radius + 9, -11, 8, 22, 2.5); ctx.fillStyle = NORDIC_DARK; ctx.fill();
    for (const yy of [-8, -4, 0, 4, 8]) {
      ctx.beginPath();
      ctx.arc(bo + radius + 13, yy, 2, 0, Math.PI * 2);
      ctx.shadowColor = highlight; ctx.shadowBlur = 4;
      ctx.fillStyle = highlight; ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  ctx.restore();

  if (level >= 3) drawHex(ctx, cx, cy, level >= 5 ? 4 : 3.2, NORDIC_WHITE, highlight);
};
