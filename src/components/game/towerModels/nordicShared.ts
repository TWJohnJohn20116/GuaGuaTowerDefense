import type { TowerDrawParams } from '../TowerModels';

/** 與目前介面的墨色一致；動態圖層測試亦以此色辨識塔身。 */
export const NORDIC_DARK = '#2e2440';
const WHITE = '#ffffff';
const tintCache = new Map<string, string>();

type BaseShape = 'round' | 'hex' | 'square';

function paint(ctx: CanvasRenderingContext2D, fill: string | null, stroke = NORDIC_DARK, lineWidth = 3.1): void {
  if (fill !== null) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

function rect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, fill: string, radius = 5, lineWidth = 3.1): void {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  paint(ctx, fill, NORDIC_DARK, lineWidth);
}

function circle(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, fill: string, lineWidth = 3.1): void {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  paint(ctx, fill, NORDIC_DARK, lineWidth);
}

function line(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color = NORDIC_DARK, width = 3.1): void {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

function hex(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, fill: string, lineWidth = 3.1): void {
  ctx.beginPath();
  for (let i = 0; i < 6; i += 1) {
    const angle = i * Math.PI / 3 - Math.PI / 2;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  paint(ctx, fill, NORDIC_DARK, lineWidth);
}

function bolt(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  circle(ctx, x, y, 2.1, WHITE, 1.8);
}

function hub(ctx: CanvasRenderingContext2D, fill = WHITE, radius = 9, x = -7, y = 0): void {
  circle(ctx, x, y, radius, fill);
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, Math.PI * 2);
  ctx.fillStyle = NORDIC_DARK;
  ctx.fill();
}

/** 淺色只在新皮膚顏色首次出現時計算，不在每座塔每幀配置色票。 */
function tint(color: string): string {
  const cached = tintCache.get(color);
  if (cached !== undefined) return cached;
  let result = '#fff8ef';
  if (/^#[0-9a-f]{6}$/i.test(color)) {
    const value = Number.parseInt(color.slice(1), 16);
    const r = Math.round(((value >> 16) & 255) * 0.3 + 255 * 0.7);
    const g = Math.round(((value >> 8) & 255) * 0.3 + 255 * 0.7);
    const b = Math.round((value & 255) * 0.3 + 255 * 0.7);
    result = 'rgb(' + r + ',' + g + ',' + b + ')';
  }
  if (tintCache.size >= 128) tintCache.clear();
  tintCache.set(color, result);
  return result;
}

function level(p: TowerDrawParams): number {
  return Number.isFinite(p.level) ? Math.max(1, Math.min(5, Math.floor(p.level))) : 1;
}

function detail(p: TowerDrawParams): boolean {
  return p.radius >= 16;
}

/**
 * 以設計稿的 35 單位內盤半徑繪製，底座先畫，武器才旋轉與後座。
 * 成功會保留一層 save；每個塔的繪製器結束時必須 restore。
 * 僅改繪製座標，不改世界位置、碰撞範圍或遊戲資料。
 */
function begin(p: TowerDrawParams, shape: BaseShape = 'round', aimed = true): boolean {
  if (!Number.isFinite(p.radius) || p.radius <= 0 || !Number.isFinite(p.cx) || !Number.isFinite(p.cy)) return false;
  const { ctx } = p;
  const scale = p.radius / 35;
  ctx.save();
  ctx.translate(p.cx, p.cy);
  ctx.scale(scale, scale);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  if (shape === 'hex') {
    hex(ctx, 0, 0, 46, WHITE);
    hex(ctx, 0, 0, 37, p.color);
  } else if (shape === 'square') {
    rect(ctx, -42, -42, 84, 84, WHITE, 21);
    rect(ctx, -34, -34, 68, 68, tint(p.color), 15);
  } else {
    circle(ctx, 0, 0, 43, WHITE);
    circle(ctx, 0, 0, 35, p.color);
  }
  if (detail(p)) {
    bolt(ctx, -26, -20);
    bolt(ctx, -26, 20);
  }
  if (aimed) {
    ctx.rotate(Number.isFinite(p.rotation) ? p.rotation : 0);
    const recoil = Number.isFinite(p.recoil) ? Math.max(0, p.recoil) : 0;
    ctx.translate(-recoil / scale, 0);
  }
  return true;
}

/** 單一共用繪製介面；所有工具均直接畫 Canvas，不建立逐幀圖形物件。 */
export const sticker = { begin, level, detail, rect, circle, line, paint, hex, hub, bolt, tint };
