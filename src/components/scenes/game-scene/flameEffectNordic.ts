// 火焰塔噴射特效 - 北歐極簡幾何風重設計
//
// 取代原本「多層漸層火焰 + 隨機火星」的寫實風格, 改以同一套幾何語彙傳達「火焰流」:
//   1. 主視覺: 從炮口到目標的「漸層能量流」, 用兩條平行光帶構成 (薄底層 + 高光)
//   2. 節奏感: 沿流動方向以「等距移動的六角粒子」表達「噴射」, 從炮口往外移動
//   3. 目標處: 六邊形脈衝光 (替代寫實圓形紅光), 與其他北歐元素一致
//   4. 配色: 以塔色 (#ff6432) 為主, NORDIC_WHITE 為高光, 不再有亂噴的火星顆粒

import type { RenderSnapshot } from '@/data/renderSnapshot';
import { enemyFrameById } from '@/data/renderSnapshot';

const NORDIC_WHITE = '#f4f7fb';
const FLAME_DARK = '#1a1d24';

const alphaHex = (a: number): string =>
  Math.max(0, Math.min(255, Math.round(a * 255))).toString(16).padStart(2, '0');

export const drawFlameEffectsNordic = (
  ctx: CanvasRenderingContext2D,
  now: number,
  tileSize: number,
  offsetX: number,
  offsetY: number,
  snapshot: RenderSnapshot,
): void => {
  const towerFrames = snapshot.towers;
  for (let i = 0; i < snapshot.towerCount; i++) {
    const tower = towerFrames[i];
    if (tower.type !== 'flame' || !tower.targetId) continue;
    // 目標位置由同一份 snapshot 解析（契約的 targetId → 敵人 frame），不再掃 store 的 Enemy 陣列
    const target = enemyFrameById(snapshot, tower.targetId);
    if (!target || target.health <= 0) continue;

    const tx = offsetX + tower.pos.x * tileSize;
    const ty = offsetY + tower.pos.y * tileSize;
    const ex = offsetX + target.x * tileSize + tileSize / 2;
    const ey = offsetY + target.y * tileSize + tileSize / 2;

    const fdx = ex - tx;
    const fdy = ey - ty;
    const dist = Math.sqrt(fdx * fdx + fdy * fdy);
    if (dist <= 0) continue;
    const angle = Math.atan2(fdy, fdx);
    const muzzle = tileSize * 0.5;
    const flameLen = Math.max(0, dist - tileSize * 0.25);
    if (flameLen <= muzzle) continue;

    ctx.save();
    ctx.translate(tx, ty);
    ctx.rotate(angle);

    drawFlameStream(ctx, muzzle, flameLen, tileSize, now);

    ctx.restore();

    drawTargetPulse(ctx, ex, ey, now);
  }
};

// 主能量流: 外層柔光暈 + 內層高光帶 + 移動六角粒子
const drawFlameStream = (
  ctx: CanvasRenderingContext2D,
  muzzle: number,
  flameLen: number,
  tileSize: number,
  now: number,
): void => {
  const baseWidth = tileSize * 0.18;

  // 外層柔光暈 (橢圓)
  const outerGrad = ctx.createLinearGradient(muzzle, 0, flameLen, 0);
  outerGrad.addColorStop(0, 'rgba(255, 100, 50, 0.32)');
  outerGrad.addColorStop(0.6, 'rgba(255, 130, 50, 0.16)');
  outerGrad.addColorStop(1, 'rgba(255, 150, 50, 0)');
  ctx.fillStyle = outerGrad;
  ctx.beginPath();
  ctx.moveTo(muzzle, -baseWidth * 0.5);
  ctx.quadraticCurveTo((muzzle + flameLen) / 2, -baseWidth * 1.2, flameLen, 0);
  ctx.quadraticCurveTo((muzzle + flameLen) / 2, baseWidth * 1.2, muzzle, baseWidth * 0.5);
  ctx.closePath();
  ctx.fill();

  // 內層高光帶 (兩條平行)
  const midGrad = ctx.createLinearGradient(muzzle, 0, flameLen, 0);
  midGrad.addColorStop(0, '#ff6432');
  midGrad.addColorStop(0.7, '#ffaa44');
  midGrad.addColorStop(1, 'rgba(255, 200, 100, 0)');
  ctx.fillStyle = midGrad;
  ctx.beginPath();
  ctx.moveTo(muzzle, -baseWidth * 0.32);
  ctx.lineTo(flameLen, -baseWidth * 0.06);
  ctx.lineTo(flameLen, baseWidth * 0.06);
  ctx.lineTo(muzzle, baseWidth * 0.32);
  ctx.closePath();
  ctx.fill();

  // 中央極亮細線
  const coreGrad = ctx.createLinearGradient(muzzle, 0, flameLen * 0.95, 0);
  coreGrad.addColorStop(0, NORDIC_WHITE);
  coreGrad.addColorStop(0.6, '#ffd070' + 'cc');
  coreGrad.addColorStop(1, 'rgba(255, 200, 100, 0)');
  ctx.shadowColor = '#ffaa44';
  ctx.shadowBlur = 6;
  ctx.fillStyle = coreGrad;
  ctx.fillRect(muzzle, -baseWidth * 0.08, flameLen - muzzle, baseWidth * 0.16);
  ctx.shadowBlur = 0;

  // 移動的六角粒子 (3 顆, 從炮口往目標方向流動)
  const phase = (now / 220) % 1;
  for (let i = 0; i < 3; i++) {
    const t = (phase + i / 3) % 1;
    const px = muzzle + (flameLen - muzzle) * t;
    const py = Math.sin(t * Math.PI) * baseWidth * 0.18;
    const size = baseWidth * 0.22 * (1 - Math.abs(t - 0.5) * 0.4);
    const alpha = 0.9 - t * 0.55;
    drawHexBit(ctx, px, py, size, '#ffcc66', alpha);
  }
};

// 目標處六邊形脈衝 (取代圓形紅光)
const drawTargetPulse = (
  ctx: CanvasRenderingContext2D,
  ex: number,
  ey: number,
  now: number,
): void => {
  const pulse = (Math.sin(now / 220) + 1) / 2;
  const r = 8 + pulse * 4;

  ctx.save();
  ctx.translate(ex, ey);
  ctx.rotate(now / 1800);

  // 外環
  ctx.beginPath();
  for (let k = 0; k < 6; k++) {
    const a = (Math.PI / 3) * k - Math.PI / 2;
    const px = Math.cos(a) * r;
    const py = Math.sin(a) * r;
    if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.strokeStyle = '#ff6432' + alphaHex(0.45 + pulse * 0.3);
  ctx.lineWidth = 1.4;
  ctx.stroke();

  // 內核小光
  ctx.beginPath();
  ctx.arc(0, 0, 2.5 + pulse * 1.2, 0, Math.PI * 2);
  ctx.fillStyle = NORDIC_WHITE + alphaHex(0.6 + pulse * 0.3);
  ctx.shadowColor = '#ff8844';
  ctx.shadowBlur = 8;
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.restore();
};

// 小六邊形「能量碎片」(本地座標, x/y 為中心)
const drawHexBit = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
  alpha: number,
): void => {
  if (r <= 0 || alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  for (let k = 0; k < 6; k++) {
    const a = (Math.PI / 3) * k - Math.PI / 2;
    const px = x + Math.cos(a) * r;
    const py = y + Math.sin(a) * r;
    if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 4;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = FLAME_DARK;
  ctx.lineWidth = 0.6;
  ctx.stroke();
  ctx.restore();
};
