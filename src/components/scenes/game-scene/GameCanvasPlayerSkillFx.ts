/**
 * GameCanvasPlayerSkillFx.ts - 玩家主動技能釋放動畫 (北歐極簡幾何風重設計)
 *
 * 4 個主動技能各以「六角 / 圓 / 短直線」為主要視覺語彙, 配色與塔/子彈系統一致:
 *   - lightningStorm (雷霆風暴): 同心六角脈衝環 + 對每隻敵人畫鋸齒雷, 端點六角光
 *   - frozenTime     (時間凍結): 淡薄荷色徑向暈 + 散布六角雪花 + 細邊外框
 *   - cashRain       (金幣雨)  : 六角金牌 + 幾何 $ 符號 (與 money 塔一致)
 *   - battleInspire  (狂戰激勵): 紫色邊框四角嵌六角 + 塔身六角脈衝環
 *   - meteorStorm    (隕石風暴): 橙色同心六角脈衝環 + 帶火尾隕石與落地衝擊環
 *   - chainLightning (閃電鏈)  : 青色鋸齒閃電沿彈跳路徑逐段生長 + 節點六角光
 *   - warpTrap       (傳送陷阱): 紫紅雙端六角傳送門（拆檔於 GameCanvasPlayerSkillFxWarp.ts）
 */

import type { Enemy, Tower } from '@/types/game';
import type { PlayerSkillAnimation } from '@/store/gameStoreTypes';
import { fxProgress } from '@/data/fxProgress';
import { drawWarpTrap } from './GameCanvasPlayerSkillFxWarp';
import { drawEmpPulse } from './GameCanvasPlayerSkillFxEmp';

type DrawCtx = CanvasRenderingContext2D;

const NORDIC_WHITE = '#f4f7fb';
const NORDIC_DARK = '#1a1d24';

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const alphaHex = (a: number): string =>
  Math.max(0, Math.min(255, Math.round(a * 255))).toString(16).padStart(2, '0');

// 通用六邊形繪製: 中心 (cx,cy), 外接圓 r, 自旋 rotation, 描邊或填充
const hexPath = (ctx: DrawCtx, cx: number, cy: number, r: number, rotation = 0) => {
  ctx.beginPath();
  for (let k = 0; k < 6; k++) {
    const a = (Math.PI / 3) * k - Math.PI / 2 + rotation;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
};

// 公開繪製函式
export function drawPlayerSkillAnimations(
  ctx: DrawCtx,
  now: number,
  canvasWidth: number,
  canvasHeight: number,
  tileSize: number,
  offsetX: number,
  offsetY: number,
  animations: PlayerSkillAnimation[],
  enemies: Enemy[],
  towers: Tower[],
): void {
  if (animations.length === 0) return;

  for (const anim of animations) {
    const elapsed = now - anim.startTime;
    const visualDuration = Math.min(anim.duration, 1500);
    if (elapsed > Math.max(visualDuration, anim.duration)) continue;
    const visualProgress = fxProgress(anim.startTime, visualDuration, now);

    switch (anim.skillId) {
      case 'lightningStorm':
        drawLightningStorm(ctx, visualProgress, canvasWidth, canvasHeight, tileSize, offsetX, offsetY, enemies);
        break;
      case 'frozenTime':
        drawFrozenTime(ctx, elapsed, anim.duration, canvasWidth, canvasHeight);
        break;
      case 'cashRain':
        drawCashRain(ctx, visualProgress, canvasWidth, canvasHeight, anim.id);
        break;
      case 'battleInspire':
        drawBattleInspire(ctx, elapsed, anim.duration, canvasWidth, canvasHeight, tileSize, offsetX, offsetY, towers);
        break;
      case 'meteorStorm':
        drawMeteorStorm(ctx, visualProgress, canvasWidth, canvasHeight, tileSize, offsetX, offsetY, enemies);
        break;
      case 'chainLightning':
        drawChainLightning(ctx, visualProgress, tileSize, offsetX, offsetY, anim.chainPath);
        break;
      case 'holyHeal':
        drawHolyHeal(ctx, visualProgress, canvasWidth, canvasHeight, anim.id);
        break;
      case 'aegisBarrier':
        drawAegisBarrier(ctx, elapsed, anim.duration, canvasWidth, canvasHeight);
        break;
      case 'warpTrap':
        drawWarpTrap(ctx, visualProgress, tileSize, offsetX, offsetY, anim.warpJumps);
        break;
      case 'empPulse':
        drawEmpPulse(ctx, visualProgress, canvasWidth, canvasHeight);
        break;
    }
  }
}

// ===== 雷霆風暴 (北歐風) =====
function drawLightningStorm(
  ctx: DrawCtx,
  progress: number,
  cw: number,
  ch: number,
  tileSize: number,
  offsetX: number,
  offsetY: number,
  enemies: Enemy[],
): void {
  // 同心六角脈衝環 (3 圈, 由內向外擴張)
  const cx = cw / 2;
  const cy = ch / 2;
  const maxR = Math.max(cw, ch) * 0.65;
  ctx.save();
  for (let i = 0; i < 3; i++) {
    const phase = Math.min(1, Math.max(0, progress * 1.4 - i * 0.18));
    if (phase <= 0 || phase >= 1) continue;
    const r = maxR * phase;
    const a = (1 - phase) * 0.42;
    ctx.strokeStyle = '#fde047' + alphaHex(a);
    ctx.lineWidth = 2 + (1 - phase) * 4;
    ctx.shadowColor = '#fde047';
    ctx.shadowBlur = 18 * (1 - phase);
    hexPath(ctx, cx, cy, r, progress * Math.PI * 0.5);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
  ctx.restore();

  // 對每隻敵人畫一道雷
  for (const e of enemies) {
    if (e.health <= 0) continue;
    const ex = offsetX + e.x * tileSize + tileSize / 2;
    const ey = offsetY + e.y * tileSize + tileSize / 2;
    drawSingleLightning(ctx, ex, ey, progress, e.id);
  }
}

function drawSingleLightning(
  ctx: DrawCtx,
  targetX: number,
  targetY: number,
  progress: number,
  seedKey: string,
): void {
  const startY = targetY - 200;
  const startX = targetX + pseudoRandom(seedKey + 'x') * 40 - 20;

  const alpha = 1 - easeOut(progress);
  if (alpha <= 0) return;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.shadowColor = '#fde047';
  ctx.shadowBlur = 12;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(startX, startY);
  const segments = 8;
  const dx = targetX - startX;
  const dy = targetY - startY;
  for (let i = 1; i < segments; i++) {
    const t = i / segments;
    const bx = startX + dx * t;
    const by = startY + dy * t;
    const offset = (pseudoRandom(seedKey + i) - 0.5) * 24;
    ctx.lineTo(bx + offset, by);
  }
  ctx.lineTo(targetX, targetY);

  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 3.5;
  ctx.stroke();
  ctx.strokeStyle = NORDIC_WHITE;
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // 命中點: 六角光 (取代圓形)
  ctx.save();
  ctx.translate(targetX, targetY);
  ctx.rotate(Math.PI / 6);
  hexPath(ctx, 0, 0, 9 * alpha);
  ctx.fillStyle = '#fef9c3' + alphaHex(alpha);
  ctx.fill();
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}

// ===== 時間凍結 (北歐風) =====
function drawFrozenTime(
  ctx: DrawCtx,
  elapsed: number,
  duration: number,
  cw: number,
  ch: number,
): void {
  const fadeIn = Math.min(1, elapsed / 600);
  const fadeOut = elapsed > duration - 800 ? Math.max(0, (duration - elapsed) / 800) : 1;
  const alpha = Math.min(fadeIn, fadeOut) * 0.2;
  if (alpha <= 0) return;

  // 徑向冷色暈
  ctx.save();
  const cx = cw / 2;
  const cy = ch / 2;
  const gradient = ctx.createRadialGradient(cx, cy, Math.min(cw, ch) * 0.12, cx, cy, Math.max(cw, ch) * 0.78);
  gradient.addColorStop(0, `rgba(186, 230, 253, ${alpha * 0.42})`);
  gradient.addColorStop(0.5, `rgba(125, 211, 252, ${alpha})`);
  gradient.addColorStop(1, `rgba(56, 189, 248, ${alpha * 1.2})`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, cw, ch);

  // 細邊外框 (北歐極簡感)
  ctx.strokeStyle = `rgba(224, 242, 254, ${alpha * 4})`;
  ctx.lineWidth = 2;
  ctx.strokeRect(3, 3, cw - 6, ch - 6);

  // 六角雪花粒子 (替代圓點)
  const flakes = 24;
  for (let i = 0; i < flakes; i++) {
    const seed = i / flakes;
    const fx = (seed * 1.7 + (elapsed / 6000)) % 1 * cw;
    const fy = (seed * 2.3 + (elapsed / 3000)) % 1 * ch;
    const size = 3 + ((i * 13) % 5);
    const rot = elapsed / 1200 + i * 0.7;
    ctx.save();
    ctx.translate(fx, fy);
    ctx.rotate(rot);
    hexPath(ctx, 0, 0, size);
    ctx.fillStyle = `rgba(240, 249, 255, ${alpha * 4})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(186, 230, 253, ${alpha * 6})`;
    ctx.lineWidth = 0.6;
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

// ===== 金幣雨 (北歐風: 六角金牌) =====
function drawCashRain(
  ctx: DrawCtx,
  progress: number,
  cw: number,
  ch: number,
  seedKey: string,
): void {
  if (progress >= 1) return;
  ctx.save();
  const coinCount = 16;
  for (let i = 0; i < coinCount; i++) {
    const seed = seedKey + i;
    const startX = pseudoRandom(seed + 'x') * cw;
    const delay = pseudoRandom(seed + 'd') * 0.4;
    const t = (progress - delay) / (1 - delay);
    if (t <= 0 || t >= 1) continue;
    const y = -40 + (ch + 80) * easeOut(t);
    const x = startX + Math.sin(t * Math.PI * 3) * 14;

    const alpha = t > 0.85 ? (1 - t) / 0.15 : 1;
    ctx.globalAlpha = alpha;

    // 旋轉的六角金牌
    const rot = t * Math.PI * 4;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);

    // 外圈深底
    hexPath(ctx, 0, 0, 14);
    ctx.fillStyle = NORDIC_DARK;
    ctx.fill();

    // 金面
    hexPath(ctx, 0, 0, 12);
    ctx.fillStyle = '#fde68a';
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // 幾何 $ 符號 (與 money 塔一致)
    ctx.strokeStyle = '#7c2d12';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(-1.6, -2, 3, -Math.PI * 0.2, Math.PI * 0.9, true);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(1.6, 2, 3, Math.PI * 0.8, Math.PI * 1.9, true);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -7);
    ctx.lineTo(0, 7);
    ctx.stroke();

    ctx.restore();
  }
  ctx.restore();
}

// ===== 狂戰激勵 (北歐風) =====
function drawBattleInspire(
  ctx: DrawCtx,
  elapsed: number,
  duration: number,
  cw: number,
  ch: number,
  tileSize: number,
  offsetX: number,
  offsetY: number,
  towers: Tower[],
): void {
  const fadeIn = Math.min(1, elapsed / 400);
  const fadeOut = elapsed > duration - 600 ? Math.max(0, (duration - elapsed) / 600) : 1;
  const baseAlpha = Math.min(fadeIn, fadeOut);
  if (baseAlpha <= 0) return;

  const pulse = 0.5 + 0.5 * Math.sin(elapsed / 200);

  // 紫色邊框
  ctx.save();
  ctx.strokeStyle = `rgba(168, 85, 247, ${baseAlpha * (0.45 + pulse * 0.35)})`;
  ctx.lineWidth = 4 + pulse * 3;
  ctx.shadowColor = '#a855f7';
  ctx.shadowBlur = 16;
  ctx.strokeRect(6, 6, cw - 12, ch - 12);
  ctx.shadowBlur = 0;

  // 四角嵌六角形 (北歐裝飾節點)
  const cornerOffset = 22;
  const corners: [number, number][] = [
    [cornerOffset, cornerOffset],
    [cw - cornerOffset, cornerOffset],
    [cornerOffset, ch - cornerOffset],
    [cw - cornerOffset, ch - cornerOffset],
  ];
  for (const [cx, cy] of corners) {
    hexPath(ctx, cx, cy, 8 + pulse * 2, elapsed / 600);
    ctx.fillStyle = `rgba(216, 180, 254, ${baseAlpha * (0.5 + pulse * 0.35)})`;
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.strokeStyle = NORDIC_WHITE + alphaHex(baseAlpha);
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
  ctx.restore();

  // 塔身六角脈衝環 (取代圓形)
  for (const tower of towers) {
    const tx = offsetX + tower.gridPos.col * tileSize + tileSize / 2;
    const ty = offsetY + tower.gridPos.row * tileSize + tileSize / 2;
    const ringAlpha = baseAlpha * (0.3 + pulse * 0.4);
    const ringRadius = tileSize * (0.5 + pulse * 0.15);
    ctx.save();
    ctx.strokeStyle = `rgba(216, 180, 254, ${ringAlpha})`;
    ctx.lineWidth = 2;
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 10;
    hexPath(ctx, tx, ty, ringRadius, elapsed / 400);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();
  }
}

// ===== 隕石風暴 (北歐風: 六角石塊 + 落地衝擊) =====
function drawMeteorStorm(
  ctx: DrawCtx,
  progress: number,
  cw: number,
  ch: number,
  tileSize: number,
  offsetX: number,
  offsetY: number,
  enemies: Enemy[],
): void {
  // 同心六角脈衝環 (橙色, 由內向外擴張)
  const cx = cw / 2;
  const cy = ch / 2;
  const maxR = Math.max(cw, ch) * 0.6;
  ctx.save();
  for (let i = 0; i < 3; i++) {
    const phase = Math.min(1, Math.max(0, progress * 1.5 - i * 0.16));
    if (phase <= 0 || phase >= 1) continue;
    const r = maxR * phase;
    const a = (1 - phase) * 0.36;
    ctx.strokeStyle = '#fb923c' + alphaHex(a);
    ctx.lineWidth = 2 + (1 - phase) * 4;
    ctx.shadowColor = '#f97316';
    ctx.shadowBlur = 16 * (1 - phase);
    hexPath(ctx, cx, cy, r, -progress * Math.PI * 0.4);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
  ctx.restore();

  // 對每隻敵人砸一顆隕石
  for (const e of enemies) {
    if (e.health <= 0) continue;
    const ex = offsetX + e.x * tileSize + tileSize / 2;
    const ey = offsetY + e.y * tileSize + tileSize / 2;
    drawSingleMeteor(ctx, ex, ey, progress, e.id);
  }
}

function drawSingleMeteor(
  ctx: DrawCtx,
  targetX: number,
  targetY: number,
  progress: number,
  seedKey: string,
): void {
  // 隕石自右上飛入, 於 progress~0.6 落地, 之後爆出衝擊環
  const fallT = Math.min(1, progress / 0.6);
  const angle = -Math.PI * 0.78; // 由右上往左下
  const dist = 220 * (1 - easeOut(fallT));
  const mx = targetX - Math.cos(angle) * dist;
  const my = targetY - Math.sin(angle) * dist;

  ctx.save();

  if (fallT < 1) {
    // 拖尾
    const tailLen = 46;
    const tx = mx - Math.cos(angle) * tailLen;
    const ty = my - Math.sin(angle) * tailLen;
    const grad = ctx.createLinearGradient(mx, my, tx, ty);
    grad.addColorStop(0, '#fdba74' + alphaHex(0.9));
    grad.addColorStop(1, '#f97316' + '00');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.shadowColor = '#f97316';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(mx, my);
    ctx.lineTo(tx, ty);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 隕石本體 (六角石塊)
    const rot = progress * Math.PI * 5 + pseudoRandom(seedKey) * 6;
    ctx.save();
    ctx.translate(mx, my);
    ctx.rotate(rot);
    hexPath(ctx, 0, 0, 8);
    ctx.fillStyle = NORDIC_DARK;
    ctx.fill();
    hexPath(ctx, 0, 0, 6);
    ctx.fillStyle = '#fb923c';
    ctx.shadowColor = '#f97316';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#fff7ed';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  } else {
    // 落地衝擊: 六角環擴張 + 中心閃光
    const blastT = Math.min(1, (progress - 0.6) / 0.4);
    const r = 6 + 26 * easeOut(blastT);
    const a = 1 - blastT;
    ctx.save();
    ctx.translate(targetX, targetY);
    ctx.rotate(blastT * Math.PI * 0.3);
    hexPath(ctx, 0, 0, r);
    ctx.strokeStyle = '#fdba74' + alphaHex(a * 0.9);
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#f97316';
    ctx.shadowBlur = 14 * a;
    ctx.stroke();
    hexPath(ctx, 0, 0, 8 * a);
    ctx.fillStyle = '#fed7aa' + alphaHex(a);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  ctx.restore();
}

// ===== 閃電鏈 (北歐風: 青色鋸齒閃電沿彈跳路徑生長) =====
const CHAIN_CYAN = '#22d3ee';
const CHAIN_CYAN_LIGHT = '#a5f3fc';

function drawChainLightning(
  ctx: DrawCtx,
  progress: number,
  tileSize: number,
  offsetX: number,
  offsetY: number,
  chainPath?: Array<{ x: number; y: number }>,
): void {
  if (!chainPath || chainPath.length === 0) return;

  // 格座標 → 螢幕座標
  const pts = chainPath.map((p) => ({
    x: offsetX + p.x * tileSize + tileSize / 2,
    y: offsetY + p.y * tileSize + tileSize / 2,
  }));

  // 前 55% 逐段生長，後 45% 整體淡出
  const growT = Math.min(1, progress / 0.55);
  const alpha = progress < 0.55 ? 1 : Math.max(0, 1 - (progress - 0.55) / 0.45);
  if (alpha <= 0) return;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // 起點脈衝六角環
  const startR = tileSize * (0.4 + growT * 0.5);
  ctx.strokeStyle = CHAIN_CYAN + alphaHex(0.45 * (1 - growT) + 0.2);
  ctx.lineWidth = 2;
  ctx.shadowColor = CHAIN_CYAN;
  ctx.shadowBlur = 14;
  hexPath(ctx, pts[0].x, pts[0].y, startR, progress * Math.PI);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // 沿彈跳路徑逐段畫鋸齒閃電
  const totalSegs = pts.length - 1;
  if (totalSegs > 0) {
    const grownSegs = growT * totalSegs;
    for (let i = 0; i < totalSegs; i++) {
      const segReveal = Math.min(1, Math.max(0, grownSegs - i));
      if (segReveal <= 0) break;
      drawLightningSegment(ctx, pts[i], pts[i + 1], segReveal, `chain${i}`);
    }
  }

  // 已點亮的節點畫六角光
  const litNodes = Math.min(pts.length, Math.ceil(growT * pts.length));
  for (let i = 0; i < litNodes; i++) {
    const p = pts[i];
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(Math.PI / 6 + progress * Math.PI);
    hexPath(ctx, 0, 0, 7);
    ctx.fillStyle = CHAIN_CYAN_LIGHT + alphaHex(0.85);
    ctx.shadowColor = CHAIN_CYAN;
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.strokeStyle = NORDIC_WHITE;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }
  ctx.shadowBlur = 0;
  ctx.restore();
}

// 兩節點間的鋸齒閃電；segReveal 控制顯露比例 (0..1) 以呈現生長
function drawLightningSegment(
  ctx: DrawCtx,
  from: { x: number; y: number },
  to: { x: number; y: number },
  segReveal: number,
  seedKey: string,
): void {
  const ex = from.x + (to.x - from.x) * segReveal;
  const ey = from.y + (to.y - from.y) * segReveal;
  const dx = ex - from.x;
  const dy = ey - from.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 0.5) return;
  // 線段法向量（鋸齒偏移方向）
  const nx = -dy / len;
  const ny = dx / len;
  const segs = Math.max(3, Math.floor(len / 14));

  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  for (let i = 1; i < segs; i++) {
    const t = i / segs;
    const bx = from.x + dx * t;
    const by = from.y + dy * t;
    const jitter = (pseudoRandom(seedKey + i) - 0.5) * 16;
    ctx.lineTo(bx + nx * jitter, by + ny * jitter);
  }
  ctx.lineTo(ex, ey);

  ctx.strokeStyle = CHAIN_CYAN;
  ctx.lineWidth = 3.5;
  ctx.shadowColor = CHAIN_CYAN;
  ctx.shadowBlur = 12;
  ctx.stroke();

  ctx.strokeStyle = CHAIN_CYAN_LIGHT;
  ctx.lineWidth = 1.4;
  ctx.shadowBlur = 0;
  ctx.stroke();
}

// ===== 聖光治療 (北歐風: 翡翠綠上升光點 + 中心醫療十字) =====
const HEAL_GREEN = '#34d399';
const HEAL_GREEN_LIGHT = '#a7f3d0';

function drawHolyHeal(
  ctx: DrawCtx,
  progress: number,
  cw: number,
  ch: number,
  seedKey: string,
): void {
  if (progress >= 1) return;
  const cx = cw / 2;
  const cy = ch / 2;

  // 柔和的徑向綠光暈（淡入淡出）
  const haloAlpha = Math.sin(progress * Math.PI) * 0.22;
  if (haloAlpha > 0) {
    ctx.save();
    const grad = ctx.createRadialGradient(cx, cy, Math.min(cw, ch) * 0.08, cx, cy, Math.max(cw, ch) * 0.6);
    grad.addColorStop(0, `rgba(167, 243, 208, ${haloAlpha})`);
    grad.addColorStop(0.6, `rgba(52, 211, 153, ${haloAlpha * 0.5})`);
    grad.addColorStop(1, 'rgba(52, 211, 153, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, cw, ch);
    ctx.restore();
  }

  // 同心六角脈衝環（綠色，由內向外擴張）
  const maxR = Math.max(cw, ch) * 0.5;
  ctx.save();
  for (let i = 0; i < 3; i++) {
    const phase = Math.min(1, Math.max(0, progress * 1.5 - i * 0.16));
    if (phase <= 0 || phase >= 1) continue;
    const r = maxR * phase;
    const a = (1 - phase) * 0.4;
    ctx.strokeStyle = HEAL_GREEN + alphaHex(a);
    ctx.lineWidth = 2 + (1 - phase) * 3;
    ctx.shadowColor = HEAL_GREEN;
    ctx.shadowBlur = 14 * (1 - phase);
    hexPath(ctx, cx, cy, r, progress * Math.PI * 0.3);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
  ctx.restore();

  // 上升的治療光點（六角形，由下往上飄）
  ctx.save();
  const sparkCount = 18;
  for (let i = 0; i < sparkCount; i++) {
    const seed = seedKey + i;
    const startX = pseudoRandom(seed + 'x') * cw;
    const delay = pseudoRandom(seed + 'd') * 0.35;
    const t = (progress - delay) / (1 - delay);
    if (t <= 0 || t >= 1) continue;
    const y = ch + 30 - (ch + 60) * easeOut(t);
    const x = startX + Math.sin(t * Math.PI * 2 + i) * 16;
    const a = t < 0.15 ? t / 0.15 : t > 0.8 ? (1 - t) / 0.2 : 1;
    const size = 4 + (i % 3);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t * Math.PI * 2 + i);
    hexPath(ctx, 0, 0, size);
    ctx.fillStyle = HEAL_GREEN_LIGHT + alphaHex(a * 0.9);
    ctx.shadowColor = HEAL_GREEN;
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.restore();
  }
  ctx.shadowBlur = 0;
  ctx.restore();

  // 中心醫療十字 + 六角光環
  const crossAlpha = Math.sin(progress * Math.PI);
  if (crossAlpha > 0) {
    ctx.save();
    ctx.translate(cx, cy);
    const scale = 0.7 + easeOut(Math.min(1, progress * 1.5)) * 0.6;
    ctx.scale(scale, scale);
    // 六角光環
    hexPath(ctx, 0, 0, 34, progress * Math.PI * 0.5);
    ctx.strokeStyle = HEAL_GREEN + alphaHex(crossAlpha * 0.8);
    ctx.lineWidth = 2.5;
    ctx.shadowColor = HEAL_GREEN;
    ctx.shadowBlur = 16;
    ctx.stroke();
    // 醫療十字（白底）
    ctx.lineCap = 'round';
    ctx.strokeStyle = NORDIC_WHITE + alphaHex(crossAlpha);
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(0, -16); ctx.lineTo(0, 16);
    ctx.moveTo(-16, 0); ctx.lineTo(16, 0);
    ctx.stroke();
    // 醫療十字（綠芯）
    ctx.strokeStyle = HEAL_GREEN + alphaHex(crossAlpha);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -16); ctx.lineTo(0, 16);
    ctx.moveTo(-16, 0); ctx.lineTo(16, 0);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();
  }
}

// ===== 聖盾結界 (北歐風: 天藍雙層六角結界罩 + 展開衝擊環, 全程持續顯示) =====
const AEGIS_BLUE = '#93c5fd';
const AEGIS_BLUE_DEEP = '#3b82f6';

function drawAegisBarrier(
  ctx: DrawCtx,
  elapsed: number,
  duration: number,
  cw: number,
  ch: number,
): void {
  const total = Math.min(1, elapsed / duration);
  if (total >= 1) return;
  const cx = cw / 2;
  const cy = ch / 2;
  const t = elapsed / 1000;

  // 展開衝擊環（前 1.2 秒三道天藍擴散環）
  if (elapsed < 1200) {
    const maxR = Math.max(cw, ch) * 0.62;
    ctx.save();
    for (let i = 0; i < 3; i++) {
      const phase = Math.min(1, Math.max(0, (elapsed / 1200) * 1.5 - i * 0.18));
      if (phase <= 0 || phase >= 1) continue;
      const r = maxR * phase;
      const a = (1 - phase) * 0.45;
      ctx.strokeStyle = AEGIS_BLUE + alphaHex(a);
      ctx.lineWidth = 2 + (1 - phase) * 4;
      ctx.shadowColor = AEGIS_BLUE;
      ctx.shadowBlur = 16 * (1 - phase);
      hexPath(ctx, cx, cy, r, phase * Math.PI * 0.4);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  // 結界淡入淡出包絡：前 0.8s 淡入、最後 1.2s 淡出
  const fadeIn = Math.min(1, elapsed / 800);
  const fadeOut = Math.min(1, (duration - elapsed) / 1200);
  const envelope = Math.min(fadeIn, fadeOut);
  if (envelope <= 0) return;

  // 淡藍徑向護幕（整場輕微籠罩 + 呼吸）
  const haloAlpha = envelope * (0.1 + Math.sin(t * 2.4) * 0.03);
  ctx.save();
  const grad = ctx.createRadialGradient(cx, cy, Math.min(cw, ch) * 0.1, cx, cy, Math.max(cw, ch) * 0.62);
  grad.addColorStop(0, `rgba(147, 197, 253, ${haloAlpha * 0.5})`);
  grad.addColorStop(0.7, `rgba(59, 130, 246, ${haloAlpha * 0.3})`);
  grad.addColorStop(1, 'rgba(59, 130, 246, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, cw, ch);
  ctx.restore();

  // 中央雙層六角結界（外環正轉、內環反轉 + 頂點光珠）
  const R = Math.min(cw, ch) * 0.21;
  ctx.save();
  ctx.translate(cx, cy);

  const outerRot = t * 0.35;
  ctx.strokeStyle = AEGIS_BLUE + alphaHex(envelope * 0.55);
  ctx.lineWidth = 2.5;
  ctx.shadowColor = AEGIS_BLUE;
  ctx.shadowBlur = 14;
  hexPath(ctx, 0, 0, R, outerRot);
  ctx.stroke();

  const innerRot = -t * 0.5;
  ctx.strokeStyle = AEGIS_BLUE_DEEP + alphaHex(envelope * 0.45);
  ctx.lineWidth = 1.8;
  ctx.shadowBlur = 8;
  hexPath(ctx, 0, 0, R * 0.66, innerRot);
  ctx.stroke();

  // 外環頂點光珠
  ctx.shadowBlur = 10;
  for (let k = 0; k < 6; k++) {
    const a = (Math.PI / 3) * k - Math.PI / 2 + outerRot;
    const px = Math.cos(a) * R;
    const py = Math.sin(a) * R;
    ctx.fillStyle = NORDIC_WHITE + alphaHex(envelope * 0.85);
    ctx.beginPath();
    ctx.arc(px, py, 2.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // 中心盾形光核（脈動）
  const corePulse = 0.8 + Math.sin(t * 3.2) * 0.2;
  ctx.shadowBlur = 16;
  ctx.strokeStyle = NORDIC_WHITE + alphaHex(envelope * 0.7);
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(0, -11 * corePulse);
  ctx.lineTo(9 * corePulse, -5 * corePulse);
  ctx.lineTo(9 * corePulse, 4 * corePulse);
  ctx.lineTo(0, 11 * corePulse);
  ctx.lineTo(-9 * corePulse, 4 * corePulse);
  ctx.lineTo(-9 * corePulse, -5 * corePulse);
  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = AEGIS_BLUE + alphaHex(envelope * 0.22);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.restore();
}

// 確定性偽隨機（同個 seed 永遠回傳同一個值, 0-1 區間）
function pseudoRandom(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}
