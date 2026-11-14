// 子彈渲染 (北歐極簡幾何風重設計)
//
// 設計準則 (與塔模型保持視覺一致):
//   1. 用最少的幾何形狀傳達子彈個性: 圓 / 六角 / 三角箭頭 / 短直線 / 漸層光帶。
//   2. 配色: 主體採用 proj.color (依塔別保有識別性), 高光統一 NORDIC_WHITE,
//      尾跡用同色透明度漸層, 不再使用寫實火焰煙霧。
//   3. 五種 hitEffect 各有「鮮明的剪影」:
//        normal    -> 圓 + 細光帶尾
//        explosive -> 較大圓 + 同心暈 + 火紅尾光
//        ice       -> 六角晶體 + 冷藍尾線
//        poison    -> 圓 + 散點霧珠
//        fire      -> 三角箭頭 + 漸層火尾
//        wind      -> 三葉旋轉刃 + 弧形尾跡
//   4. 雷射 / 閃電 (isInstant) 採用「線+端點發光」, 雷射為平直雙線, 閃電為折線。

import type { Projectile, TowerType } from '@/types/game';

type GetSkinVisuals = (type: TowerType) => {
  projectileColor?: string;
  trailColor?: string;
} | undefined;

const NORDIC_WHITE = '#f4f7fb';

const alphaHex = (a: number): string =>
  Math.max(0, Math.min(255, Math.round(a * 255))).toString(16).padStart(2, '0');

// 主入口 ── 取代舊的 drawProjectiles
export const drawProjectilesNordic = (
  ctx: CanvasRenderingContext2D,
  now: number,
  tileSize: number,
  offsetX: number,
  offsetY: number,
  projectiles: Projectile[],
  getSkinVisuals: GetSkinVisuals,
): void => {
  for (let i = 0; i < projectiles.length; i++) {
    const proj = projectiles[i];
    const x = offsetX + proj.x * tileSize + tileSize / 2;
    const y = offsetY + proj.y * tileSize + tileSize / 2;
    const targetX = offsetX + proj.targetX * tileSize + tileSize / 2;
    const targetY = offsetY + proj.targetY * tileSize + tileSize / 2;

    const skin = getSkinVisuals(proj.towerType as TowerType);
    const projColor = skin?.projectileColor || proj.color;
    const trailColor = skin?.trailColor || projColor;

    const instantScale = tileSize / 40;
    if (proj.isInstant) {
      drawInstantNordic(ctx, now, x, y, targetX, targetY, proj, projColor, instantScale);
      continue;
    }

    drawNormalNordic(ctx, x, y, targetX, targetY, tileSize, offsetX, offsetY, proj, projColor, trailColor);
  }
};

// ============================================================
// 瞬間命中 (雷射 / 閃電)
// ============================================================
const drawInstantNordic = (
  ctx: CanvasRenderingContext2D,
  now: number,
  x: number, y: number,
  targetX: number, targetY: number,
  proj: Projectile,
  projColor: string,
  scale: number,
): void => {
  const elapsed = now - (proj.createdAt || now);
  const alpha = Math.max(0, 1 - elapsed / 150);
  if (alpha <= 0) return;

  if (proj.towerType === 'laser') {
    const beamW = (3 + (1 - alpha) * 4) * scale;
    ctx.save();
    ctx.globalAlpha = alpha;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(targetX, targetY);
    ctx.strokeStyle = projColor;
    ctx.lineWidth = beamW;
    ctx.lineCap = 'round';
    ctx.shadowColor = projColor;
    ctx.shadowBlur = 8 * scale;
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(targetX, targetY);
    ctx.strokeStyle = NORDIC_WHITE;
    ctx.lineWidth = beamW * 0.35;
    ctx.stroke();
    ctx.restore();

    // 命中點: 六角光環 (北歐特徵)
    ctx.save();
    ctx.translate(targetX, targetY);
    ctx.rotate(Math.PI / 6);
    const r = 6 * scale * alpha;
    ctx.beginPath();
    for (let k = 0; k < 6; k++) {
      const a = (Math.PI / 3) * k - Math.PI / 2;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = projColor + alphaHex(alpha * 0.55);
    ctx.fill();
    ctx.restore();
    return;
  }

  if (proj.towerType === 'lightning') {
    const dx = targetX - x;
    const dy = targetY - y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const perpX = -dy / len;
    const perpY = dx / len;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.lineCap = 'round';

    const segs = 7;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let k = 1; k < segs; k++) {
      const t = k / segs;
      const bx = x + dx * t;
      const by = y + dy * t;
      const off = (Math.random() - 0.5) * 14 * scale;
      ctx.lineTo(bx + perpX * off, by + perpY * off);
    }
    ctx.lineTo(targetX, targetY);

    ctx.strokeStyle = projColor;
    ctx.lineWidth = 2.5 * scale;
    ctx.shadowColor = projColor;
    ctx.shadowBlur = 8 * scale;
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = NORDIC_WHITE;
    ctx.lineWidth = 1.2 * scale;
    ctx.stroke();
    ctx.restore();

    // 命中點: 圓點 + 放射小光點
    ctx.save();
    ctx.beginPath();
    ctx.arc(targetX, targetY, 5 * scale * alpha, 0, Math.PI * 2);
    ctx.fillStyle = projColor + alphaHex(alpha * 0.7);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(targetX, targetY, 2 * scale * alpha, 0, Math.PI * 2);
    ctx.fillStyle = NORDIC_WHITE + alphaHex(alpha * 0.85);
    ctx.fill();
    ctx.restore();
  }
};

// ============================================================
// 一般子彈
// ============================================================
const drawNormalNordic = (
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  targetX: number, targetY: number,
  tileSize: number,
  offsetX: number,
  offsetY: number,
  proj: Projectile,
  projColor: string,
  trailColor: string,
): void => {
  const scale = tileSize / 40;
  const r = (proj.size || 5) * scale;
  const angle = proj.rotation ?? Math.atan2(targetY - y, targetX - x);
  const hitEffect = proj.hitEffect || 'normal';

  // 軌跡點 (歷史殘影, 由邏輯層產生)
  if (proj.trailPoints && proj.trailPoints.length > 0) {
    for (let i = 0; i < proj.trailPoints.length; i++) {
      const point = proj.trailPoints[i];
      const px = offsetX + point.x * tileSize + tileSize / 2;
      const py = offsetY + point.y * tileSize + tileSize / 2;
      const tr = Math.max(1, r * (1 - i * 0.1) * point.alpha);
      ctx.beginPath();
      ctx.arc(px, py, tr, 0, Math.PI * 2);
      ctx.fillStyle = trailColor + alphaHex(point.alpha * 0.4);
      ctx.fill();
    }
  }

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // 尾跡 (動態方向)
  drawTrailNordic(ctx, r, hitEffect, projColor, trailColor);

  // 主體
  drawBodyNordic(ctx, r, scale, hitEffect, projColor);

  ctx.restore();
};

// 尾跡 (在 translate+rotate 後的本地座標, 子彈朝 +X)
const drawTrailNordic = (
  ctx: CanvasRenderingContext2D,
  r: number,
  hitEffect: string,
  projColor: string,
  trailColor: string,
): void => {
  if (hitEffect === 'fire') {
    const len = r * 4.5;
    const g = ctx.createLinearGradient(-len, 0, r, 0);
    g.addColorStop(0, 'transparent');
    g.addColorStop(0.5, projColor + '40');
    g.addColorStop(1, projColor);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(-len, 0);
    ctx.quadraticCurveTo(-len * 0.5, -r * 0.9, r, 0);
    ctx.quadraticCurveTo(-len * 0.5, r * 0.9, -len, 0);
    ctx.closePath();
    ctx.fill();
    return;
  }
  if (hitEffect === 'explosive') {
    const len = r * 4;
    const g = ctx.createLinearGradient(-len, 0, r, 0);
    g.addColorStop(0, 'transparent');
    g.addColorStop(0.6, projColor + '40');
    g.addColorStop(1, projColor + 'aa');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(-len * 0.4, 0, len * 0.6, r * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  if (hitEffect === 'ice') {
    const len = r * 4;
    const g = ctx.createLinearGradient(-len, 0, r, 0);
    g.addColorStop(0, 'transparent');
    g.addColorStop(1, trailColor + '88');
    ctx.fillStyle = g;
    ctx.fillRect(-len, -r * 0.4, len + r, r * 0.8);
    for (let i = 0; i < 4; i++) {
      const sx = -len * (0.2 + i * 0.2);
      const sy = (i % 2 === 0 ? -1 : 1) * r * 0.5;
      ctx.beginPath();
      ctx.arc(sx, sy, Math.max(0.8, r * 0.18), 0, Math.PI * 2);
      ctx.fillStyle = NORDIC_WHITE + 'aa';
      ctx.fill();
    }
    return;
  }
  if (hitEffect === 'poison') {
    const len = r * 3.8;
    for (let i = 0; i < 5; i++) {
      const px = -len * (i / 5);
      const py = Math.sin(i * 1.4) * r * 0.4;
      const ps = r * (1 - i * 0.13);
      ctx.beginPath();
      ctx.arc(px, py, ps, 0, Math.PI * 2);
      ctx.fillStyle = projColor + alphaHex(0.35 - i * 0.05);
      ctx.fill();
    }
    return;
  }
  if (hitEffect === 'wind') {
    const len = r * 3;
    const g = ctx.createLinearGradient(-len, 0, 0, 0);
    g.addColorStop(0, 'transparent');
    g.addColorStop(1, trailColor + '60');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(-len * 0.5, 0, len * 0.5, r * 0.9, 0, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  // normal: 一條細光帶
  const len = r * 3;
  const h = r * 0.55;
  const g = ctx.createLinearGradient(-len, 0, 0, 0);
  g.addColorStop(0, 'transparent');
  g.addColorStop(1, trailColor);
  ctx.fillStyle = g;
  ctx.fillRect(-len, -h / 2, len, h);
};

// 子彈主體 (在 translate+rotate 後的本地座標, +X 朝目標)
const drawBodyNordic = (
  ctx: CanvasRenderingContext2D,
  r: number,
  scale: number,
  hitEffect: string,
  projColor: string,
): void => {
  if (hitEffect === 'fire') {
    // 三角箭頭主體
    ctx.beginPath();
    ctx.moveTo(r * 1.4, 0);
    ctx.lineTo(-r * 0.6, -r * 0.85);
    ctx.lineTo(-r * 0.6, r * 0.85);
    ctx.closePath();
    ctx.shadowColor = projColor;
    ctx.shadowBlur = 6 * scale;
    ctx.fillStyle = projColor;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.moveTo(r * 0.7, 0);
    ctx.lineTo(-r * 0.25, -r * 0.45);
    ctx.lineTo(-r * 0.25, r * 0.45);
    ctx.closePath();
    ctx.fillStyle = NORDIC_WHITE;
    ctx.fill();
    return;
  }
  if (hitEffect === 'ice') {
    // 六角晶體
    ctx.save();
    ctx.rotate(Math.PI / 6);
    ctx.beginPath();
    for (let k = 0; k < 6; k++) {
      const a = (Math.PI / 3) * k - Math.PI / 2;
      const px = Math.cos(a) * r * 1.05;
      const py = Math.sin(a) * r * 1.05;
      if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.shadowColor = projColor;
    ctx.shadowBlur = 6 * scale;
    ctx.fillStyle = projColor;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = NORDIC_WHITE;
    ctx.lineWidth = 1 * scale;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = NORDIC_WHITE;
    ctx.fill();
    ctx.restore();
    return;
  }
  if (hitEffect === 'wind') {
    // 三葉旋轉刃 (用 Date.now() 自我旋轉)
    ctx.save();
    ctx.rotate(Date.now() * 0.012);
    for (let i = 0; i < 3; i++) {
      ctx.save();
      ctx.rotate((Math.PI * 2 * i) / 3);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(r * 0.5, -r * 0.4, r * 1.4, 0);
      ctx.quadraticCurveTo(r * 0.5, r * 0.4, 0, 0);
      ctx.closePath();
      ctx.fillStyle = projColor;
      ctx.fill();
      ctx.strokeStyle = NORDIC_WHITE;
      ctx.lineWidth = 0.8 * scale;
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.45, 0, Math.PI * 2);
    ctx.fillStyle = NORDIC_WHITE;
    ctx.fill();
    return;
  }
  if (hitEffect === 'poison') {
    // 圓 + 三個小點 (毒滴感)
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.shadowColor = projColor;
    ctx.shadowBlur = 5 * scale;
    ctx.fillStyle = projColor;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = NORDIC_WHITE;
    ctx.lineWidth = 1 * scale;
    ctx.stroke();
    for (let i = 0; i < 3; i++) {
      const a = (Math.PI * 2 * i) / 3 - Math.PI / 2;
      const dx = Math.cos(a) * r * 0.5;
      const dy = Math.sin(a) * r * 0.5;
      ctx.beginPath();
      ctx.arc(dx, dy, r * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = NORDIC_WHITE;
      ctx.fill();
    }
    return;
  }
  if (hitEffect === 'explosive') {
    // 大圓 + 同心發光環
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.3, 0, Math.PI * 2);
    ctx.fillStyle = projColor + '40';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.shadowColor = projColor;
    ctx.shadowBlur = 8 * scale;
    ctx.fillStyle = projColor;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = NORDIC_WHITE;
    ctx.lineWidth = 1.2 * scale;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-r * 0.25, -r * 0.25, r * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = NORDIC_WHITE + 'aa';
    ctx.fill();
    return;
  }

  // normal: 圓 + 細白邊 + 內核高光
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.6, 0, Math.PI * 2);
  ctx.fillStyle = projColor + '30';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = projColor;
  ctx.fill();
  ctx.strokeStyle = NORDIC_WHITE;
  ctx.lineWidth = r > 6 * scale ? 1.5 * scale : 1 * scale;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(-r * 0.25, -r * 0.25, r * 0.42, 0, Math.PI * 2);
  ctx.fillStyle = NORDIC_WHITE + '90';
  ctx.fill();
};
