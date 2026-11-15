// 北歐極簡幾何風 - 塔模型共用工具
//
// 本檔案統一提供底座、能量核心、柔光、圓角矩形等繪製函式, 供各塔的 nordic
// 重設計檔案共用。各塔只需聚焦在「炮管 / 噴嘴 / 發射器」這些特色部位的設計,
// 共用部份從此處取用以保證視覺語言一致 (相同邊距、相同陰影、相同光感)。

/** 暗部／輪廓：與 UI 的墨線同一個顏色，塔才不會像另一個世界來的 */
export const NORDIC_DARK = '#2e2440';
export const NORDIC_WHITE = '#f4f7fb';
const NORDIC_LINE = 'rgba(255,255,255,0.35)';
const NORDIC_LINE_SOFT = 'rgba(255,255,255,0.18)';
const NORDIC_LINE_FAINT = 'rgba(255,255,255,0.12)';

export const rr = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void => {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
};

// 通用底座 (圓盤 + 細白邊 + 柔和高光)
// ringCount: 0=Lv1 1=Lv2~3 2=Lv4~5 用以表達等級成長
export const drawNordicBase = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  color: string,
  ringCount: 0 | 1 | 2,
): void => {
  if (radius <= 0) return;

  // 紙板底座：墨色外輪廓 → 白卡盤 → 糖果色內盤 → 3px 墨線
  ctx.beginPath();
  ctx.arc(cx, cy, radius + 5.5, 0, Math.PI * 2);
  ctx.fillStyle = NORDIC_DARK;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx, cy, radius + 2.5, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  ctx.strokeStyle = NORDIC_DARK;
  ctx.lineWidth = 3;
  ctx.stroke();

  if (ringCount >= 1) {
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.75, 0, Math.PI * 2);
    ctx.strokeStyle = NORDIC_LINE_SOFT;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  if (ringCount >= 2) {
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.5, 0, Math.PI * 2);
    ctx.strokeStyle = NORDIC_LINE_FAINT;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  const g = ctx.createRadialGradient(
    cx - radius * 0.35,
    cy - radius * 0.35,
    0,
    cx,
    cy,
    radius,
  );
  g.addColorStop(0, 'rgba(255,255,255,0.22)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.beginPath();
  ctx.arc(cx, cy, radius - 1, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();
};

// 六邊形 (可用作能量核心、雪花、燈座等)
export const drawHex = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  fill: string,
  stroke?: string,
  rotation = 0,
): void => {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 2 + rotation;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
};

// 三角箭頭 (尖端朝右, 用作炮口指標)
export const drawArrow = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  fill: string,
): void => {
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.lineTo(x + size * 1.1, y);
  ctx.lineTo(x, y + size);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
};

// 柔和發光環 (徑向漸層)
export const drawSoftGlow = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  color: string,
  intensity: number,
): void => {
  const alpha = Math.round(intensity * 0xff).toString(16).padStart(2, '0');
  const g = ctx.createRadialGradient(cx, cy, radius * 0.4, cx, cy, radius);
  g.addColorStop(0, color + alpha);
  g.addColorStop(1, 'transparent');
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();
};

// 等距分布的小點 (用作裝飾燈、能量點)
export const drawDots = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  count: number,
  distance: number,
  dotR: number,
  color: string,
  rotation = 0,
): void => {
  for (let i = 0; i < count; i++) {
    const a = (Math.PI * 2 * i) / count - Math.PI / 2 + rotation;
    const dx = cx + Math.cos(a) * distance;
    const dy = cy + Math.sin(a) * distance;
    ctx.beginPath();
    ctx.arc(dx, dy, dotR, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }
};

// 等級 -> 底座環數對映 (供統一規範使用)
export const ringForLevel = (level: number): 0 | 1 | 2 =>
  level >= 4 ? 2 : level >= 2 ? 1 : 0;
