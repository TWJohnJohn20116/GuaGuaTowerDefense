/**
 * 敵人模型渲染的共用原語
 *
 * 從 `enemyRenderer.ts` 拆出（TD-07）：所有敵人造型都靠這三個東西畫——
 * `DrawFn` 是造型函式的統一簽名，`drawEyes` 是所有造型共用的眼睛，
 * `drawStroke` 是統一的白色描邊。拆出來之後，新增造型只要 import 這支。
 */

export type DrawFn = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
  t: number
) => void;

/** 繪製基本圓形眼睛 */
export const drawEyes = (
  ctx: CanvasRenderingContext2D,
  x: number, y: number, r: number,
  opts?: {
    angry?: boolean;
    slit?: boolean;
    glow?: boolean;
    tiny?: boolean;
    offsetY?: number;
    dark?: boolean;
  }
) => {
  const o = opts || {};
  const eyeR = r * (o.tiny ? 0.15 : 0.22);
  const pupilR = eyeR * 0.55;
  const ex = r * 0.28;
  const ey = r * (o.offsetY ?? 0.08);

  // 發光紅眼
  if (o.glow) {
    ctx.save();
    ctx.fillStyle = '#ff4444';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(x - ex, y - ey, eyeR, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + ex, y - ey, eyeR, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();
    return;
  }

  // 暗色空洞眼
  if (o.dark) {
    ctx.fillStyle = '#000000cc';
    ctx.beginPath();
    ctx.arc(x - ex, y - ey, eyeR, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + ex, y - ey, eyeR, 0, Math.PI * 2);
    ctx.fill();
    // 微光
    ctx.fillStyle = '#ffffff50';
    ctx.beginPath();
    ctx.arc(x - ex - eyeR * 0.2, y - ey - eyeR * 0.2, eyeR * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + ex - eyeR * 0.2, y - ey - eyeR * 0.2, eyeR * 0.25, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  // 眼白
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x - ex, y - ey, eyeR, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + ex, y - ey, eyeR, 0, Math.PI * 2);
  ctx.fill();

  // 瞳孔（墨色，與描邊同一色）
  ctx.fillStyle = '#2e2440';
  if (o.slit) {
    // 細長瞳孔（忍者風格）
    [-1, 1].forEach(dir => {
      ctx.save();
      ctx.translate(x + dir * ex, y - ey);
      ctx.scale(0.4, 1);
      ctx.beginPath();
      ctx.arc(0, 0, pupilR, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  } else {
    ctx.beginPath();
    ctx.arc(x - ex, y - ey, pupilR, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + ex, y - ey, pupilR, 0, Math.PI * 2);
    ctx.fill();
  }

  // 憤怒眉毛
  if (o.angry) {
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = Math.max(1, r * 0.08);
    ctx.beginPath();
    ctx.moveTo(x - ex - eyeR, y - ey - eyeR * 0.6);
    ctx.lineTo(x - ex + eyeR * 0.5, y - ey - eyeR * 1.4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + ex + eyeR, y - ey - eyeR * 0.6);
    ctx.lineTo(x + ex - eyeR * 0.5, y - ey - eyeR * 1.4);
    ctx.stroke();
  }
};

/**
 * 繪製墨色描邊（紙片風格）
 *
 * 原本是白色細邊，在淺色紙底上等於看不見。現在統一成 UI 的墨色、
 * 線寬至少 2px，敵人與塔才會是同一種「貼紙」而不是另一套畫風。
 */
export const drawStroke = (
  ctx: CanvasRenderingContext2D,
  alpha = 1,
  width = 2.5
) => {
  ctx.strokeStyle = `rgba(46,36,64,${Math.max(0.78, alpha)})`;
  ctx.lineWidth = Math.max(2, width);
  ctx.stroke();
};
