// 元素型塔 - 北歐極簡幾何風重設計
//
// 包含: frost / poison / flame / wind 共 4 種, 各 5 等級。
// 設計關鍵: 用「圖形語彙」直接傳達元素屬性 ──
//   frost: 六角雪花
//   poison: 罐體 + 多孔噴口
//   flame: 漏斗噴嘴 + 火種
//   wind: 風扇葉

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
// frost 冰凍塔 - 六角雪花為主軸, 炮管為冰刺
// ============================================================
export const drawFrostTowerNordic = (p: TowerDrawParams): void => {
  const { ctx, cx, cy, radius, rotation, color, highlight, level, recoil } = p;

  drawNordicBase(ctx, cx, cy, radius, color, ringForLevel(level));
  if (level >= 3) drawSoftGlow(ctx, cx, cy, radius * 1.15, highlight, 0.22 + (level - 3) * 0.05);

  if (level >= 2) {
    const armCount = Math.min(6, 2 + level);
    const armR = radius * 0.85;
    ctx.strokeStyle = highlight + 'aa';
    ctx.lineWidth = level >= 4 ? 1.5 : 1;
    for (let i = 0; i < armCount; i++) {
      const a = (Math.PI * 2 * i) / armCount - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * armR, cy + Math.sin(a) * armR);
      ctx.stroke();
    }
  }

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  const bo = -recoil;

  const drawSpike = (len: number, w: number) => {
    ctx.beginPath();
    ctx.moveTo(bo, -w);
    ctx.lineTo(bo + len, 0);
    ctx.lineTo(bo, w);
    ctx.closePath();
    ctx.fillStyle = NORDIC_DARK; ctx.fill();
    ctx.beginPath();
    ctx.moveTo(bo + 2, -w * 0.55);
    ctx.lineTo(bo + len - 2, 0);
    ctx.lineTo(bo + 2, w * 0.55);
    ctx.closePath();
    ctx.fillStyle = highlight; ctx.fill();
  };

  if (level === 1) {
    drawSpike(radius + 8, 3.5);
  } else if (level === 2) {
    drawSpike(radius + 10, 4);
    rr(ctx, bo - 2, -5, 5, 10, 2); ctx.fillStyle = NORDIC_DARK; ctx.fill();
  } else if (level === 3) {
    for (const off of [-3.5, 3.5]) {
      ctx.save(); ctx.translate(0, off);
      drawSpike(radius + 10, 2.8);
      ctx.restore();
    }
    rr(ctx, bo - 2, -7, 5, 14, 2); ctx.fillStyle = NORDIC_DARK; ctx.fill();
  } else if (level === 4) {
    for (const off of [-5, 0, 5]) {
      ctx.save(); ctx.translate(0, off);
      drawSpike(radius + 12, 2.5);
      ctx.restore();
    }
    rr(ctx, bo - 3, -9, 6, 18, 2.5); ctx.fillStyle = color; ctx.fill();
    ctx.strokeStyle = NORDIC_DARK; ctx.lineWidth = 1.5; ctx.stroke();
  } else {
    drawSpike(radius + 16, 6);
    for (const off of [-6.5, 6.5]) {
      ctx.save(); ctx.translate(0, off);
      drawSpike(radius + 10, 3);
      ctx.restore();
    }
    rr(ctx, bo - 4, -11, 8, 22, 3); ctx.fillStyle = color; ctx.fill();
    ctx.strokeStyle = NORDIC_DARK; ctx.lineWidth = 2; ctx.stroke();
  }

  ctx.restore();

  drawHex(ctx, cx, cy, level >= 5 ? 4.5 : level >= 3 ? 3.5 : 2.5, NORDIC_WHITE, highlight, Math.PI / 6);
  if (level >= 4) drawDots(ctx, cx, cy, 6, radius * 0.55, 1, highlight);
};

// ============================================================
// poison 毒塔 - 罐體 + 噴霧器, 多孔噴口
// ============================================================
export const drawPoisonTowerNordic = (p: TowerDrawParams): void => {
  const { ctx, cx, cy, radius, rotation, color, highlight, level, recoil } = p;

  drawNordicBase(ctx, cx, cy, radius, color, ringForLevel(level));
  if (level >= 4) drawSoftGlow(ctx, cx, cy, radius * 1.1, highlight, 0.22);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  const bo = -recoil;

  const drawNozzle = (offX: number, offY: number, holes: number) => {
    rr(ctx, offX, offY - 4, 6, 8, 2); ctx.fillStyle = NORDIC_DARK; ctx.fill();
    for (let i = 0; i < holes; i++) {
      const t = holes === 1 ? 0 : (i / (holes - 1)) * 6 - 3;
      ctx.beginPath();
      ctx.arc(offX + 3, offY + t, 1.1, 0, Math.PI * 2);
      ctx.fillStyle = highlight; ctx.fill();
    }
  };

  if (level === 1) {
    rr(ctx, bo, -4, radius + 4, 8, 2); ctx.fillStyle = NORDIC_DARK; ctx.fill();
    rr(ctx, bo + 1.5, -2.5, radius + 1, 5, 1.5); ctx.fillStyle = highlight; ctx.fill();
    drawNozzle(bo + radius + 4, 0, 1);
  } else if (level === 2) {
    rr(ctx, bo, -5, radius + 5, 10, 2.5); ctx.fillStyle = NORDIC_DARK; ctx.fill();
    rr(ctx, bo + 1.5, -3.5, radius + 2, 7, 2); ctx.fillStyle = highlight; ctx.fill();
    drawNozzle(bo + radius + 5, 0, 3);
  } else if (level === 3) {
    for (const off of [-3.5, 3.5]) {
      rr(ctx, bo, off - 2.5, radius + 5, 5, 1.5); ctx.fillStyle = NORDIC_DARK; ctx.fill();
      rr(ctx, bo + 1.5, off - 1.5, radius + 2, 3, 1); ctx.fillStyle = highlight; ctx.fill();
    }
    drawNozzle(bo + radius + 5, 0, 3);
    rr(ctx, bo - 1, -6, 3, 12, 1); ctx.fillStyle = NORDIC_DARK; ctx.fill();
  } else if (level === 4) {
    for (const off of [-5, 0, 5]) {
      rr(ctx, bo, off - 2, radius + 6, 4, 1.5); ctx.fillStyle = NORDIC_DARK; ctx.fill();
      rr(ctx, bo + 1.5, off - 1, radius + 3, 2, 1); ctx.fillStyle = highlight; ctx.fill();
    }
    drawNozzle(bo + radius + 6, 0, 5);
    rr(ctx, bo - 3, -8, 5, 16, 2); ctx.fillStyle = color; ctx.fill();
    ctx.strokeStyle = NORDIC_DARK; ctx.lineWidth = 1.25; ctx.stroke();
  } else {
    rr(ctx, bo - 4, -10, 8, 20, 3); ctx.fillStyle = NORDIC_DARK; ctx.fill();
    rr(ctx, bo - 2.5, -8.5, 5, 17, 2); ctx.fillStyle = color; ctx.fill();

    for (const off of [-7, 0, 7]) {
      rr(ctx, bo, off - 3, radius + 7, 6, 2); ctx.fillStyle = NORDIC_DARK; ctx.fill();
      rr(ctx, bo + 1.5, off - 2, radius + 4, 4, 1.5); ctx.fillStyle = highlight; ctx.fill();
    }
    rr(ctx, bo + radius + 7, -9, 9, 18, 3); ctx.fillStyle = NORDIC_DARK; ctx.fill();
    for (const yy of [-6, -2, 2, 6]) {
      ctx.beginPath();
      ctx.arc(bo + radius + 11.5, yy, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = highlight; ctx.shadowColor = highlight; ctx.shadowBlur = 4;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  ctx.restore();

  if (level >= 2) drawHex(ctx, cx, cy, level >= 5 ? 4.2 : level >= 4 ? 3.5 : 2.8, NORDIC_WHITE, highlight);
};

// ============================================================
// flame 火焰塔 - 漏斗噴嘴 + 火種
// ============================================================
export const drawFlameTowerNordic = (p: TowerDrawParams): void => {
  const { ctx, cx, cy, radius, rotation, color, highlight, level, recoil } = p;

  drawNordicBase(ctx, cx, cy, radius, color, ringForLevel(level));
  if (level >= 3) drawSoftGlow(ctx, cx, cy, radius * 1.15, highlight, 0.25 + (level - 3) * 0.06);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  const bo = -recoil;

  const drawFunnel = (len: number, base: number, tip: number) => {
    ctx.beginPath();
    ctx.moveTo(bo, -base);
    ctx.lineTo(bo + len, -tip);
    ctx.lineTo(bo + len + 2, -tip);
    ctx.lineTo(bo + len + 2, tip);
    ctx.lineTo(bo + len, tip);
    ctx.lineTo(bo, base);
    ctx.closePath();
    ctx.fillStyle = NORDIC_DARK; ctx.fill();
    ctx.beginPath();
    ctx.moveTo(bo + 1.5, -base + 1);
    ctx.lineTo(bo + len - 0.5, -tip + 0.8);
    ctx.lineTo(bo + len - 0.5, tip - 0.8);
    ctx.lineTo(bo + 1.5, base - 1);
    ctx.closePath();
    ctx.fillStyle = highlight; ctx.fill();
  };

  if (level === 1) {
    drawFunnel(radius + 6, 4, 3);
  } else if (level === 2) {
    drawFunnel(radius + 8, 5, 4);
    ctx.beginPath();
    ctx.arc(bo + radius + 11, 0, 2.2, 0, Math.PI * 2);
    ctx.fillStyle = highlight;
    ctx.shadowColor = highlight; ctx.shadowBlur = 5; ctx.fill(); ctx.shadowBlur = 0;
  } else if (level === 3) {
    for (const off of [-3.5, 3.5]) {
      ctx.save(); ctx.translate(0, off);
      drawFunnel(radius + 8, 3, 2.5);
      ctx.restore();
    }
    rr(ctx, bo - 2, -7, 5, 14, 2); ctx.fillStyle = NORDIC_DARK; ctx.fill();
  } else if (level === 4) {
    for (const off of [-4.5, 4.5]) {
      ctx.save(); ctx.translate(0, off);
      drawFunnel(radius + 10, 3.5, 3);
      ctx.restore();
    }
    rr(ctx, bo - 4, -9, 8, 18, 3); ctx.fillStyle = color; ctx.fill();
    ctx.strokeStyle = NORDIC_DARK; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.beginPath();
    ctx.arc(bo - 0.5, 0, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = highlight;
    ctx.shadowColor = highlight; ctx.shadowBlur = 6; ctx.fill(); ctx.shadowBlur = 0;
  } else {
    drawFunnel(radius + 14, 8, 5);
    rr(ctx, bo - 5, -11, 9, 22, 4); ctx.fillStyle = NORDIC_DARK; ctx.fill();
    rr(ctx, bo - 3.5, -9.5, 6, 19, 3); ctx.fillStyle = color; ctx.fill();

    for (const off of [-7, 7]) {
      rr(ctx, bo - 6, off - 2, 4, 4, 1); ctx.fillStyle = NORDIC_DARK; ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(bo + 1, 0, 3, 0, Math.PI * 2);
    ctx.fillStyle = NORDIC_WHITE;
    ctx.shadowColor = highlight; ctx.shadowBlur = 10; ctx.fill(); ctx.shadowBlur = 0;
  }

  ctx.restore();

  if (level >= 3) drawHex(ctx, cx, cy, level >= 5 ? 4.5 : 3.4, NORDIC_WHITE, highlight);
};

// ============================================================
// wind 風塔 - 風扇葉 (無方向性, 不旋轉跟敵)
// ============================================================
export const drawWindTowerNordic = (p: TowerDrawParams): void => {
  const { ctx, cx, cy, radius, color, highlight, level } = p;

  drawNordicBase(ctx, cx, cy, radius, color, ringForLevel(level));
  if (level >= 3) drawSoftGlow(ctx, cx, cy, radius * 1.1, highlight, 0.22);

  const blades = level === 1 ? 2 : level === 2 ? 3 : level === 3 ? 4 : level === 4 ? 5 : 6;
  const armLen = radius * 0.78;
  const baseRot = (Date.now() / (level >= 5 ? 250 : 400)) % (Math.PI * 2);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(baseRot);
  for (let i = 0; i < blades; i++) {
    ctx.save();
    ctx.rotate((Math.PI * 2 * i) / blades);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(armLen * 0.4, -3.5, armLen, -1);
    ctx.lineTo(armLen, 1);
    ctx.quadraticCurveTo(armLen * 0.4, 3.5, 0, 0);
    ctx.closePath();
    ctx.fillStyle = highlight;
    ctx.globalAlpha = 0.85;
    ctx.fill();
    ctx.strokeStyle = NORDIC_DARK;
    ctx.globalAlpha = 1;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();

  ctx.beginPath();
  ctx.arc(cx, cy, level >= 5 ? 5 : 4, 0, Math.PI * 2);
  ctx.fillStyle = NORDIC_DARK; ctx.fill();
  drawHex(ctx, cx, cy, level >= 5 ? 3 : 2.4, NORDIC_WHITE, highlight);

  if (level >= 4) drawDots(ctx, cx, cy, blades, radius * 0.95, 1.2, highlight, baseRot);
};
