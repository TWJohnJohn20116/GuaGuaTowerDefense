/** 敵人本體的靜態貼紙原語；局部路徑維持在 ±26，供既有精靈畫幅快取。 */
export type DrawFn = (
  ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, t: number
) => void;

const INK = '#2e2440';
const WHITE = '#ffffff';
const tintCache = new Map<string, string>();

function begin(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number): boolean {
  if (!Number.isFinite(radius) || radius <= 0 || !Number.isFinite(x) || !Number.isFinite(y)) return false;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(radius / 30, radius / 30);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  return true;
}

/** 白邊只加在外部剪影，內部細節採墨線，避免小尺寸變成一團白線。 */
function paint(ctx: CanvasRenderingContext2D, fill: string | null, edge = false, stroke = INK, width = 2.8): void {
  if (edge) {
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = width + 4.8;
    ctx.stroke();
  }
  if (fill !== null) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  ctx.strokeStyle = stroke;
  ctx.lineWidth = width;
  ctx.stroke();
}

function circle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, fill: string, edge = false, width = 2.8): void {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  paint(ctx, fill, edge, INK, width);
}

function rect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fill: string, corner = 5, edge = false, width = 2.8): void {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, corner);
  paint(ctx, fill, edge, INK, width);
}

function ellipse(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, fill: string, edge = false, width = 2.8): void {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  paint(ctx, fill, edge, INK, width);
}

function line(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color = INK, width = 2.8): void {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

function hex(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, fill: string, edge = false, width = 2.8): void {
  ctx.beginPath();
  for (let i = 0; i < 6; i += 1) {
    const a = i * Math.PI / 3 - Math.PI / 2;
    const px = x + Math.cos(a) * r;
    const py = y + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  paint(ctx, fill, edge, INK, width);
}

function eyes(ctx: CanvasRenderingContext2D, x = 0, y = 2, size = 1, angry = false, slit = false): void {
  for (let i = 0; i < 2; i += 1) {
    const side = i === 0 ? -1 : 1;
    const ex = x + side * 7 * size;
    circle(ctx, ex, y, 4.5 * size, WHITE, false, 1.6);
    ctx.beginPath();
    if (slit) ctx.ellipse(ex + size, y, 0.9 * size, 2.5 * size, 0, 0, Math.PI * 2);
    else ctx.arc(ex + size, y + size * 0.2, 2.1 * size, 0, Math.PI * 2);
    ctx.fillStyle = INK;
    ctx.fill();
    if (angry) line(ctx, ex - side * 4.5 * size, y - 7 * size, ex + side * 4.5 * size, y - 10 * size, INK, 2.4);
  }
}

function tint(color: string): string {
  const hit = tintCache.get(color);
  if (hit !== undefined) return hit;
  let value = '#fff8ef';
  if (/^#[0-9a-f]{6}$/i.test(color)) {
    const hexColor = Number.parseInt(color.slice(1), 16);
    const r = Math.round(((hexColor >> 16) & 255) * 0.4 + 255 * 0.6);
    const g = Math.round(((hexColor >> 8) & 255) * 0.4 + 255 * 0.6);
    const b = Math.round((hexColor & 255) * 0.4 + 255 * 0.6);
    value = 'rgb(' + r + ',' + g + ',' + b + ')';
  }
  if (tintCache.size >= 128) tintCache.clear();
  tintCache.set(color, value);
  return value;
}

function detail(radius: number): boolean {
  return radius >= 10;
}

/** 所有方法只畫幾何，不讀狀態與時間；相同輸入可以安全烘焙一次。 */
export const enemy = { begin, paint, circle, rect, ellipse, line, hex, eyes, tint, detail };
