/**
 * 敵人獨特模型渲染器
 * 為每種基礎敵人類型提供獨特的視覺外觀
 * 類似 TowerModels.ts 的架構
 */

type DrawFn = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
  t: number
) => void;

// ========== 輔助工具 ==========

/** 繪製基本圓形眼睛 */
const drawEyes = (
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

  // 瞳孔
  ctx.fillStyle = '#111111';
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

/** 繪製白色描邊 */
const drawStroke = (
  ctx: CanvasRenderingContext2D,
  alpha = 0.4,
  width = 1.5
) => {
  ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
  ctx.lineWidth = width;
  ctx.stroke();
};

// ========== 各敵人獨特模型 ==========

/** 普通敵人 - 經典圓形史萊姆 */
const drawNormal: DrawFn = (ctx, x, y, r, color) => {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  drawStroke(ctx);
  // 光澤（簡化版，避免每幀建立漸層）
  ctx.beginPath();
  ctx.arc(x - r * 0.2, y - r * 0.2, r * 0.4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fill();
  drawEyes(ctx, x, y, r);
};

/** 快速敵人 - 流線型水滴形 */
const drawFast: DrawFn = (ctx, x, y, r, color) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.moveTo(r * 0.9, 0);
  ctx.quadraticCurveTo(r * 0.2, -r * 0.9, -r * 0.7, -r * 0.5);
  ctx.quadraticCurveTo(-r, 0, -r * 0.7, r * 0.5);
  ctx.quadraticCurveTo(r * 0.2, r * 0.9, r * 0.9, 0);
  ctx.fillStyle = color;
  ctx.fill();
  drawStroke(ctx);
  ctx.restore();
  // 速度線
  ctx.strokeStyle = color + '60';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - r * 0.6, y - r * 0.25);
  ctx.lineTo(x - r * 1.2, y - r * 0.25);
  ctx.moveTo(x - r * 0.7, y);
  ctx.lineTo(x - r * 1.4, y);
  ctx.moveTo(x - r * 0.6, y + r * 0.25);
  ctx.lineTo(x - r * 1.2, y + r * 0.25);
  ctx.stroke();
  drawEyes(ctx, x - r * 0.05, y, r * 0.75, { tiny: true });
};

/** 精英敵人 - 帶星形裝飾邊框 */
const drawElite: DrawFn = (ctx, x, y, r, color) => {
  const spikes = 6;
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const angle = (i * Math.PI) / spikes - Math.PI / 2;
    const dist = i % 2 === 0 ? r * 1.12 : r * 0.82;
    const px = x + Math.cos(angle) * dist;
    const py = y + Math.sin(angle) * dist;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  drawStroke(ctx, 0.5);
  // 內核
  ctx.beginPath();
  ctx.arc(x, y, r * 0.6, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.fill();
  drawEyes(ctx, x, y, r);
};

/** 極速敵人 - 菱形箭頭 */
const drawSpeedy: DrawFn = (ctx, x, y, r, color) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x, y - r * 0.65);
  ctx.lineTo(x - r * 0.7, y);
  ctx.lineTo(x, y + r * 0.65);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  drawStroke(ctx, 0.5);
  // 尾部速度線
  ctx.strokeStyle = color + '50';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - r * 0.5, y - r * 0.2);
  ctx.lineTo(x - r * 1.4, y - r * 0.2);
  ctx.moveTo(x - r * 0.6, y);
  ctx.lineTo(x - r * 1.6, y);
  ctx.moveTo(x - r * 0.5, y + r * 0.2);
  ctx.lineTo(x - r * 1.4, y + r * 0.2);
  ctx.stroke();
  drawEyes(ctx, x, y, r * 0.6, { tiny: true });
};

/** 坦克敵人 - 方形身體帶履帶 */
const drawTank: DrawFn = (ctx, x, y, r, color) => {
  const w = r * 1.6;
  const h = r * 1.3;
  // 履帶
  ctx.fillStyle = '#22222580';
  ctx.fillRect(x - w / 2 - 3, y - h / 2 + 2, w + 6, h - 4);
  ctx.strokeStyle = '#ffffff20';
  ctx.lineWidth = 1;
  ctx.strokeRect(x - w / 2 - 3, y - h / 2 + 2, w + 6, h - 4);
  // 主體
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(x - w / 2, y - h / 2, w, h, r * 0.2);
  } else {
    ctx.rect(x - w / 2, y - h / 2, w, h);
  }
  ctx.fillStyle = color;
  ctx.fill();
  drawStroke(ctx, 0.5, 2);
  // 裝甲中線
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - w / 2 + 3, y);
  ctx.lineTo(x + w / 2 - 3, y);
  ctx.stroke();
  drawEyes(ctx, x, y - r * 0.1, r * 0.85, { tiny: true });
};

/** 重型敵人 - 六邊形厚甲 */
const drawHeavy: DrawFn = (ctx, x, y, r, color) => {
  // 外六邊形
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3 - Math.PI / 6;
    const px = x + Math.cos(angle) * r;
    const py = y + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  drawStroke(ctx, 0.5, 2.5);
  // 內六邊形裝甲層
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3 - Math.PI / 6;
    const px = x + Math.cos(angle) * r * 0.6;
    const py = y + Math.sin(angle) * r * 0.6;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 1;
  ctx.stroke();
  drawEyes(ctx, x, y, r * 0.7, { angry: true });
};

/** Boss - 帶皇冠的威嚴外觀 */
const drawBoss: DrawFn = (ctx, x, y, r, color, t) => {
  // 脈動光環
  const pulse = Math.sin(t * 0.005) * 0.08;
  ctx.beginPath();
  ctx.arc(x, y, r * (1.15 + pulse), 0, Math.PI * 2);
  ctx.fillStyle = color + '18';
  ctx.fill();
  // 帶刺身體
  ctx.beginPath();
  const points = 8;
  for (let i = 0; i < points; i++) {
    const angle = (i * Math.PI * 2) / points - Math.PI / 2;
    const dist = i % 2 === 0 ? r * 1.08 : r * 0.82;
    const px = x + Math.cos(angle) * dist;
    const py = y + Math.sin(angle) * dist;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  drawStroke(ctx, 0.6, 2);
  // 皇冠
  const cy = y - r * 0.7;
  ctx.fillStyle = '#ffd700';
  ctx.beginPath();
  ctx.moveTo(x - r * 0.45, cy + r * 0.12);
  ctx.lineTo(x - r * 0.4, cy - r * 0.2);
  ctx.lineTo(x - r * 0.15, cy);
  ctx.lineTo(x, cy - r * 0.3);
  ctx.lineTo(x + r * 0.15, cy);
  ctx.lineTo(x + r * 0.4, cy - r * 0.2);
  ctx.lineTo(x + r * 0.45, cy + r * 0.12);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#b8860b';
  ctx.lineWidth = 1;
  ctx.stroke();
  drawEyes(ctx, x, y + r * 0.05, r, { glow: true });
};

/** 飛行敵人 - 帶拍動翅膀 */
const drawFlyer: DrawFn = (ctx, x, y, r, color, t) => {
  const wingFlap = Math.sin(t * 0.015) * 0.4;
  // 左翼
  ctx.save();
  ctx.translate(x - r * 0.5, y - r * 0.1);
  ctx.rotate(-0.4 + wingFlap);
  ctx.beginPath();
  ctx.ellipse(-r * 0.4, 0, r * 0.7, r * 0.22, 0, 0, Math.PI * 2);
  ctx.fillStyle = color + 'bb';
  ctx.fill();
  ctx.restore();
  // 右翼
  ctx.save();
  ctx.translate(x + r * 0.5, y - r * 0.1);
  ctx.rotate(0.4 - wingFlap);
  ctx.beginPath();
  ctx.ellipse(r * 0.4, 0, r * 0.7, r * 0.22, 0, 0, Math.PI * 2);
  ctx.fillStyle = color + 'bb';
  ctx.fill();
  ctx.restore();
  // 身體
  ctx.beginPath();
  ctx.arc(x, y, r * 0.65, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  drawStroke(ctx);
  drawEyes(ctx, x, y, r * 0.6);
};

/** 治療敵人 - 帶十字治療標記 */
const drawHealer: DrawFn = (ctx, x, y, r, color, t) => {
  const glow = 0.3 + Math.sin(t * 0.008) * 0.15;
  // 治療光環
  ctx.beginPath();
  ctx.arc(x, y, r * 1.1, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(74, 222, 128, ${glow * 0.2})`;
  ctx.fill();
  // 身體
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  drawStroke(ctx);
  // 十字標記
  const cs = r * 0.35;
  ctx.fillStyle = '#4ade80';
  ctx.fillRect(x - cs * 0.3, y - r * 0.5, cs * 0.6, r);
  ctx.fillRect(x - r * 0.5, y - cs * 0.3, r, cs * 0.6);
  drawEyes(ctx, x, y + r * 0.2, r * 0.65);
};

/** 生產敵人 - 史萊姆母體，內含小史萊姆 */
const drawSpawner: DrawFn = (ctx, x, y, r, color, t) => {
  const pulse = Math.sin(t * 0.004) * 0.08;
  
  // 主體史萊姆（較大，半透明）
  ctx.beginPath();
  ctx.arc(x, y, r * (1 + pulse), 0, Math.PI * 2);
  ctx.fillStyle = color + 'cc';
  ctx.fill();
  drawStroke(ctx, 0.4);
  
  // 主體光澤
  ctx.beginPath();
  ctx.arc(x - r * 0.25, y - r * 0.3, r * 0.45, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fill();
  
  // 內部小史萊姆（3個，隨時間輕微移動）
  const babyOffset1 = Math.sin(t * 0.003) * 0.05;
  const babyOffset2 = Math.sin(t * 0.003 + 2) * 0.05;
  const babyOffset3 = Math.sin(t * 0.003 + 4) * 0.05;
  
  // 小史萊姆 1（左下）
  ctx.save();
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.arc(x - r * 0.35, y + r * (0.2 + babyOffset1), r * 0.28, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 1;
  ctx.stroke();
  // 小史萊姆光澤
  ctx.beginPath();
  ctx.arc(x - r * 0.42, y + r * (0.12 + babyOffset1), r * 0.12, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fill();
  ctx.restore();
  
  // 小史萊姆 2（右下）
  ctx.save();
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.arc(x + r * 0.32, y + r * (0.25 + babyOffset2), r * 0.25, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 1;
  ctx.stroke();
  // 小史萊姆光澤
  ctx.beginPath();
  ctx.arc(x + r * 0.26, y + r * (0.18 + babyOffset2), r * 0.1, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fill();
  ctx.restore();
  
  // 小史萊姆 3（中上）
  ctx.save();
  ctx.globalAlpha = 0.65;
  ctx.beginPath();
  ctx.arc(x + r * 0.05, y - r * (0.15 + babyOffset3), r * 0.22, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 1;
  ctx.stroke();
  // 小史萊姆光澤
  ctx.beginPath();
  ctx.arc(x, y - r * (0.22 + babyOffset3), r * 0.09, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fill();
  ctx.restore();
  
  // 母體眼睛（溫和的表情）
  drawEyes(ctx, x, y - r * 0.15, r * 0.85);
  
  // 生產光環效果（脈動）
  const glowAlpha = 0.15 + Math.sin(t * 0.005) * 0.1;
  ctx.beginPath();
  ctx.arc(x, y, r * 1.25, 0, Math.PI * 2);
  ctx.strokeStyle = color + Math.floor(glowAlpha * 255).toString(16).padStart(2, '0');
  ctx.lineWidth = 2;
  ctx.stroke();
};

/** 護盾敵人 - 帶能量護盾 */
const drawShield: DrawFn = (ctx, x, y, r, color, t) => {
  const shimmer = 0.6 + Math.sin(t * 0.006) * 0.2;
  // 身體
  ctx.beginPath();
  ctx.arc(x, y, r * 0.75, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  drawStroke(ctx);
  // 護盾弧形
  ctx.beginPath();
  ctx.arc(x, y, r, -Math.PI * 0.55, Math.PI * 0.55);
  ctx.strokeStyle = `rgba(100, 200, 255, ${shimmer})`;
  ctx.lineWidth = 3;
  ctx.stroke();
  // 護盾填充
  ctx.beginPath();
  ctx.arc(x, y, r, -Math.PI * 0.55, Math.PI * 0.55);
  ctx.lineTo(x, y);
  ctx.closePath();
  ctx.fillStyle = `rgba(100, 200, 255, ${shimmer * 0.12})`;
  ctx.fill();
  drawEyes(ctx, x - r * 0.08, y, r * 0.65);
};

/** 隱身敵人 - 忍者菱形 */
const drawStealth: DrawFn = (ctx, x, y, r, color) => {
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.lineTo(x + r * 0.7, y);
  ctx.lineTo(x, y + r * 0.8);
  ctx.lineTo(x - r * 0.7, y);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  drawStroke(ctx, 0.3);
  // 忍者面罩
  ctx.strokeStyle = '#33333380';
  ctx.lineWidth = Math.max(1, r * 0.12);
  ctx.beginPath();
  ctx.moveTo(x - r * 0.5, y - r * 0.05);
  ctx.lineTo(x + r * 0.5, y - r * 0.05);
  ctx.stroke();
  drawEyes(ctx, x, y, r * 0.65, { slit: true });
};

/** 狂戰士 - 帶魔角 */
const drawBerserker: DrawFn = (ctx, x, y, r, color) => {
  // 角（先畫，在身體後面）
  ctx.fillStyle = '#6B3A2A';
  // 左角
  ctx.beginPath();
  ctx.moveTo(x - r * 0.45, y - r * 0.5);
  ctx.lineTo(x - r * 0.65, y - r * 1.25);
  ctx.lineTo(x - r * 0.1, y - r * 0.6);
  ctx.closePath();
  ctx.fill();
  // 右角
  ctx.beginPath();
  ctx.moveTo(x + r * 0.45, y - r * 0.5);
  ctx.lineTo(x + r * 0.65, y - r * 1.25);
  ctx.lineTo(x + r * 0.1, y - r * 0.6);
  ctx.closePath();
  ctx.fill();
  // 身體
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  drawStroke(ctx, 0.5);
  drawEyes(ctx, x, y, r, { angry: true });
};

/** 裝甲敵人 - 八邊形帶鉚釘 */
const drawArmored: DrawFn = (ctx, x, y, r, color) => {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4 - Math.PI / 8;
    const px = x + Math.cos(angle) * r;
    const py = y + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  drawStroke(ctx, 0.5, 2);
  // 鉚釘
  ctx.fillStyle = '#c0c0c0';
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4;
    ctx.beginPath();
    ctx.arc(
      x + Math.cos(angle) * r * 0.72,
      y + Math.sin(angle) * r * 0.72,
      Math.max(1, r * 0.07),
      0, Math.PI * 2
    );
    ctx.fill();
  }
  drawEyes(ctx, x, y, r * 0.75, { tiny: true });
};

/** 法師敵人 - 帶法師帽和魔法光芒 */
const drawMage: DrawFn = (ctx, x, y, r, color, t) => {
  const sparkle = Math.sin(t * 0.01) * 0.5 + 0.5;
  // 身體
  ctx.beginPath();
  ctx.arc(x, y + r * 0.15, r * 0.82, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  drawStroke(ctx);
  // 法師帽
  ctx.beginPath();
  ctx.moveTo(x, y - r * 1.35);
  ctx.lineTo(x - r * 0.65, y - r * 0.25);
  ctx.lineTo(x + r * 0.65, y - r * 0.25);
  ctx.closePath();
  ctx.fillStyle = '#2a1a4a';
  ctx.fill();
  // 帽帶
  ctx.fillStyle = '#ffd700';
  ctx.fillRect(x - r * 0.55, y - r * 0.4, r * 1.1, Math.max(2, r * 0.12));
  // 帽尖星星
  ctx.fillStyle = `rgba(255, 255, 100, ${sparkle})`;
  ctx.beginPath();
  const starX = x;
  const starY = y - r * 1.35;
  const starR = r * 0.15;
  for (let i = 0; i < 5; i++) {
    const a1 = (i * Math.PI * 2) / 5 - Math.PI / 2;
    const a2 = a1 + Math.PI / 5;
    ctx.lineTo(starX + Math.cos(a1) * starR, starY + Math.sin(a1) * starR);
    ctx.lineTo(starX + Math.cos(a2) * starR * 0.4, starY + Math.sin(a2) * starR * 0.4);
  }
  ctx.closePath();
  ctx.fill();
  drawEyes(ctx, x, y + r * 0.2, r * 0.7);
};

/** 小Boss - 帶金冠的中型Boss */
const drawMiniboss: DrawFn = (ctx, x, y, r, color) => {
  // 身體
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  drawStroke(ctx, 0.5, 2);
  // 光澤（簡化版）
  ctx.beginPath();
  ctx.arc(x - r * 0.2, y - r * 0.2, r * 0.4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fill();
  // 小金冠
  const cy = y - r * 0.6;
  ctx.fillStyle = '#ffd700';
  ctx.beginPath();
  ctx.moveTo(x - r * 0.4, cy + r * 0.1);
  ctx.lineTo(x - r * 0.35, cy - r * 0.15);
  ctx.lineTo(x - r * 0.12, cy + r * 0.02);
  ctx.lineTo(x, cy - r * 0.22);
  ctx.lineTo(x + r * 0.12, cy + r * 0.02);
  ctx.lineTo(x + r * 0.35, cy - r * 0.15);
  ctx.lineTo(x + r * 0.4, cy + r * 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#b8860b';
  ctx.lineWidth = 0.8;
  ctx.stroke();
  drawEyes(ctx, x, y + r * 0.05, r);
};

/** 蟲群 - 小蟲帶觸角和腳 */
const drawSwarm: DrawFn = (ctx, x, y, r, color) => {
  // 橢圓身體
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1.3, 1);
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.75, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  drawStroke(ctx, 0.3);
  ctx.restore();
  // 觸角
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, r * 0.09);
  ctx.beginPath();
  ctx.moveTo(x - r * 0.3, y - r * 0.55);
  ctx.quadraticCurveTo(x - r * 0.5, y - r * 1.1, x - r * 0.65, y - r * 0.9);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + r * 0.3, y - r * 0.55);
  ctx.quadraticCurveTo(x + r * 0.5, y - r * 1.1, x + r * 0.65, y - r * 0.9);
  ctx.stroke();
  // 觸角尖端小球
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x - r * 0.65, y - r * 0.9, r * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.65, y - r * 0.9, r * 0.08, 0, Math.PI * 2);
  ctx.fill();
  // 小腳
  ctx.strokeStyle = color + '90';
  ctx.lineWidth = Math.max(0.5, r * 0.06);
  [-0.45, 0, 0.45].forEach(off => {
    ctx.beginPath();
    ctx.moveTo(x + off * r, y + r * 0.45);
    ctx.lineTo(x + off * r - r * 0.15, y + r * 0.85);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + off * r, y + r * 0.45);
    ctx.lineTo(x + off * r + r * 0.15, y + r * 0.85);
    ctx.stroke();
  });
  drawEyes(ctx, x, y - r * 0.05, r * 0.55, { tiny: true });
};

/** 幽靈 - 半透明幽靈形狀帶波浪底 */
const drawGhost: DrawFn = (ctx, x, y, r, color, t) => {
  const wave = t * 0.008;
  ctx.save();
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  // 頂部圓弧
  ctx.arc(x, y - r * 0.2, r * 0.82, Math.PI, 0, false);
  // 右邊下延
  const rightX = x + r * 0.82;
  const leftX = x - r * 0.82;
  const bottom = y + r * 0.6;
  ctx.lineTo(rightX, bottom);
  // 波浪底部（從右到左）
  const numWaves = 3;
  const waveW = (rightX - leftX) / numWaves;
  for (let i = numWaves; i > 0; i--) {
    const sx = leftX + i * waveW;
    const ex2 = leftX + (i - 1) * waveW;
    const mx = (sx + ex2) / 2;
    const waveY = bottom + r * 0.2 + Math.sin(wave + i * 1.8) * r * 0.12;
    ctx.quadraticCurveTo(mx, waveY, ex2, bottom);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
  // 幽暗眼睛
  drawEyes(ctx, x, y - r * 0.15, r * 0.7, { dark: true });
};

/** 爆破敵人 - 圓形炸彈帶引線火花 */
const drawBomber: DrawFn = (ctx, x, y, r, color, t) => {
  // 炸彈身體
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  drawStroke(ctx, 0.4);
  // 光澤（簡化版）
  ctx.beginPath();
  ctx.arc(x - r * 0.2, y - r * 0.2, r * 0.35, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fill();
  // 引線
  ctx.strokeStyle = '#6B4226';
  ctx.lineWidth = Math.max(1.5, r * 0.1);
  ctx.beginPath();
  ctx.moveTo(x + r * 0.25, y - r * 0.85);
  ctx.quadraticCurveTo(x + r * 0.55, y - r * 1.15, x + r * 0.15, y - r * 1.25);
  ctx.stroke();
  // 引線火花
  const sparkAlpha = 0.5 + Math.sin(t * 0.02) * 0.5;
  ctx.beginPath();
  ctx.arc(x + r * 0.15, y - r * 1.25, r * 0.18, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255, 200, 50, ${sparkAlpha})`;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.15, y - r * 1.25, r * 0.08, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255, 255, 220, ${Math.min(1, sparkAlpha + 0.3)})`;
  ctx.fill();
  drawEyes(ctx, x, y, r * 0.85, { angry: true });
};

/** 干擾敵人 - 天線碟與脈動電波 */
const drawJammer: DrawFn = (ctx, x, y, r, color, t) => {
  const pulse = 0.45 + Math.sin(t * 0.01) * 0.25;
  ctx.beginPath();
  ctx.arc(x, y, r * (1.15 + pulse * 0.12), 0, Math.PI * 2);
  ctx.fillStyle = `rgba(167, 139, 250, ${0.12 + pulse * 0.1})`;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  drawStroke(ctx, 0.4);
  ctx.strokeStyle = `rgba(221, 214, 254, ${0.35 + pulse * 0.4})`;
  ctx.lineWidth = Math.max(1, r * 0.08);
  for (let i = 1; i <= 2; i++) {
    ctx.beginPath();
    ctx.arc(x, y - r * 0.15, r * (0.55 + i * 0.28 + pulse * 0.08), -Math.PI * 0.85, -Math.PI * 0.15);
    ctx.stroke();
  }
  ctx.fillStyle = '#ddd6fe';
  ctx.beginPath();
  ctx.moveTo(x, y - r * 0.15);
  ctx.lineTo(x - r * 0.35, y + r * 0.15);
  ctx.lineTo(x + r * 0.35, y + r * 0.15);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#7c3aed';
  ctx.beginPath();
  ctx.arc(x, y - r * 0.22, r * 0.16, 0, Math.PI * 2);
  ctx.fill();
  drawEyes(ctx, x, y + r * 0.18, r * 0.7, { slit: true });
};

/** 護航敵人 - 盾牌與鋼青護甲環 */
const drawEscort: DrawFn = (ctx, x, y, r, color, t) => {
  const pulse = 0.45 + Math.sin(t * 0.008) * 0.2;
  ctx.beginPath();
  ctx.arc(x, y, r * (1.12 + pulse * 0.1), 0, Math.PI * 2);
  ctx.fillStyle = `rgba(148, 163, 184, ${0.12 + pulse * 0.08})`;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  drawStroke(ctx, 0.4);
  ctx.save();
  ctx.strokeStyle = `rgba(226, 232, 240, ${0.4 + pulse * 0.35})`;
  ctx.lineWidth = Math.max(1.2, r * 0.1);
  ctx.beginPath();
  ctx.arc(x, y, r * 0.72, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  ctx.fillStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.moveTo(x, y - r * 0.55);
  ctx.lineTo(x + r * 0.38, y - r * 0.18);
  ctx.lineTo(x + r * 0.28, y + r * 0.32);
  ctx.lineTo(x, y + r * 0.52);
  ctx.lineTo(x - r * 0.28, y + r * 0.32);
  ctx.lineTo(x - r * 0.38, y - r * 0.18);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#64748b';
  ctx.beginPath();
  ctx.arc(x, y - r * 0.05, r * 0.14, 0, Math.PI * 2);
  ctx.fill();
  drawEyes(ctx, x, y + r * 0.08, r * 0.65, { angry: true });
};

/** 預設渲染（用於 Mod 自訂敵人等未知類型） */
const drawDefault: DrawFn = (ctx, x, y, r, color) => {
  // 圓形身體帶光澤
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  drawStroke(ctx, 0.4);
  // 光澤（簡化版）
  ctx.beginPath();
  ctx.arc(x - r * 0.2, y - r * 0.2, r * 0.4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fill();
  drawEyes(ctx, x, y, r);
};

// ========== 渲染器映射表 ==========

const ENEMY_RENDERERS: Record<string, DrawFn> = {
  normal: drawNormal,
  fast: drawFast,
  elite: drawElite,
  speedy: drawSpeedy,
  tank: drawTank,
  heavy: drawHeavy,
  boss: drawBoss,
  flyer: drawFlyer,
  healer: drawHealer,
  spawner: drawSpawner,
  shield: drawShield,
  stealth: drawStealth,
  berserker: drawBerserker,
  armored: drawArmored,
  mage: drawMage,
  miniboss: drawMiniboss,
  swarm: drawSwarm,
  ghost: drawGhost,
  bomber: drawBomber,
  jammer: drawJammer,
  escort: drawEscort,
};

// ========== 匯出主函數 ==========

/**
 * 繪製敵人獨特模型
 * @param ctx Canvas 2D 渲染上下文
 * @param x 敵人中心 X 座標
 * @param y 敵人中心 Y 座標
 * @param radius 敵人基礎半徑
 * @param enemyType 敵人類型字串
 * @param color 敵人顏色
 * @param time 當前時間戳（用於動畫效果）
 */
export const drawEnemyModel = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  /** 選填：mod 自訂敵人沒有 modelType 時走 drawDefault */
  enemyType: string | undefined,
  color: string,
  time: number
) => {
  ctx.save();
  const renderer = (enemyType && ENEMY_RENDERERS[enemyType]) || drawDefault;
  renderer(ctx, x, y, radius, color, time);
  ctx.restore();
};
