/**
 * 皮膚模型庫 - 每個模型集包含 5 個等級 (1-5) 的獨立繪製函數
 *
 * 設計概念：
 *   每個 SkinModelSet 是一組「樣式統一」的塔模型，從 Lv1 到 Lv5+
 *   逐步升級複雜度與裝飾，並完全替換預設塔模型外觀。
 *   皮膚透過 `modelSet` 欄位指向其中一個模型集。
 *
 * 已實作模型集：
 *   - `crystal`   水晶寶石風 (透明感、稜面、發光)
 *   - `clockwork` 蒸氣機械風 (齒輪、鉚釘、金屬感)
 *   - `arcane`    奧術符文風 (魔法符文、能量環、漂浮)
 */

import type { TowerDrawParams } from '@/components/game/TowerModels';

export type SkinModelDrawer = (p: TowerDrawParams) => void;

export interface SkinModelSet {
  /** 唯一 ID */
  id: string;
  /** 顯示名稱 */
  name: string;
  /** 描述 */
  description: string;
  /** 各等級繪製函數（1-5；Lv5+ 也用 5） */
  drawers: Record<1 | 2 | 3 | 4 | 5, SkinModelDrawer>;
}

// ──────────────────────────────────────────────────────────────────────────
// 通用工具
// ──────────────────────────────────────────────────────────────────────────

const drawBaseDisc = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  color: string
) => {
  if (radius <= 0) return;
  ctx.beginPath();
  ctx.arc(cx, cy, radius + 4, 0, Math.PI * 2);
  ctx.fillStyle = '#1a1d24';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  const g = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, 0, cx, cy, radius);
  g.addColorStop(0, 'rgba(255,255,255,0.22)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.beginPath();
  ctx.arc(cx, cy, radius - 1, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();
};

// 塔皮膚上的等級文字繪製
// 設計變更：每個等級已有不同模型可區分，因此不再於塔上繪製等級數字
const drawLevelText = (
  _ctx: CanvasRenderingContext2D,
  _cx: number,
  _cy: number,
  _level: number,
  _size: number,
) => {
  return;
};

const polygonPath = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  sides: number,
  rotation = 0
) => {
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const a = rotation + (Math.PI * 2 * i) / sides;
    const x = cx + Math.cos(a) * radius;
    const y = cy + Math.sin(a) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
};

// ──────────────────────────────────────────────────────────────────────────
// Crystal 模型集 - 水晶寶石風
// ──────────────────────────────────────────────────────────────────────────

const drawCrystalGem = (
  p: TowerDrawParams,
  sides: number,
  scale: number,
  rings: number
) => {
  const { ctx, cx, cy, radius, color, highlight, level, rotation } = p;
  drawBaseDisc(ctx, cx, cy, radius, color);

  ctx.save();
  ctx.translate(cx, cy);

  // 光暈
  const glow = ctx.createRadialGradient(0, 0, radius * 0.3, 0, 0, radius);
  glow.addColorStop(0, `${highlight}80`);
  glow.addColorStop(1, 'transparent');
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.95, 0, Math.PI * 2);
  ctx.fillStyle = glow;
  ctx.fill();

  // 多層多邊形寶石
  for (let r = rings; r >= 1; r--) {
    const ringRadius = radius * scale * (r / rings);
    const rotOffset = (rotation * 0.4) + (r * Math.PI) / sides;
    polygonPath(ctx, 0, 0, ringRadius, sides, rotOffset);
    ctx.fillStyle = r === 1 ? highlight : `${color}AA`;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }

  // 高光反射
  ctx.beginPath();
  ctx.arc(-radius * 0.2, -radius * 0.2, radius * 0.15, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fill();

  ctx.restore();
  drawLevelText(ctx, cx, cy, level, radius * 0.7);
};

export const CRYSTAL_MODEL_SET: SkinModelSet = {
  id: 'crystal',
  name: '水晶寶石',
  description: '透明感的多面寶石結構，散發魔法光暈',
  drawers: {
    1: (p) => drawCrystalGem(p, 4, 0.55, 1),
    2: (p) => drawCrystalGem(p, 5, 0.65, 1),
    3: (p) => drawCrystalGem(p, 6, 0.75, 2),
    4: (p) => drawCrystalGem(p, 8, 0.85, 2),
    5: (p) => {
      const { ctx, cx, cy, radius, color, highlight, level } = p;
      const outer = ctx.createRadialGradient(cx, cy, radius * 0.6, cx, cy, radius * 1.48);
      outer.addColorStop(0, `${highlight}90`);
      outer.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.8, 0, Math.PI * 2);
      ctx.fillStyle = outer;
      ctx.fill();

      drawCrystalGem(p, 10, 0.9, 3);

      const t = Date.now() * 0.0015;
      for (let i = 0; i < 4; i++) {
        const a = t + (Math.PI / 2) * i;
        const ox = cx + Math.cos(a) * radius * 1.16;
        const oy = cy + Math.sin(a) * radius * 1.16;
        polygonPath(ctx, ox, oy, radius * 0.15, 4, a);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = highlight;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      drawLevelText(ctx, cx, cy, level, radius * 0.7);
    },
  },
};

// ──────────────────────────────────────────────────────────────────────────
// Clockwork 模型集 - 蒸氣機械齒輪風
// ──────────────────────────────────────────────────────────────────────────

const drawGear = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  teeth: number,
  rotation: number,
  fill: string,
  stroke: string
) => {
  const outerR = radius;
  const innerR = radius * 0.78;
  const toothW = (Math.PI * 2) / teeth / 3;

  ctx.beginPath();
  for (let i = 0; i < teeth; i++) {
    const baseA = rotation + (Math.PI * 2 * i) / teeth;
    const a1 = baseA - toothW;
    const a2 = baseA + toothW;
    const a3 = baseA + (Math.PI * 2) / teeth - toothW;
    ctx.lineTo(cx + Math.cos(a1) * innerR, cy + Math.sin(a1) * innerR);
    ctx.lineTo(cx + Math.cos(a1) * outerR, cy + Math.sin(a1) * outerR);
    ctx.lineTo(cx + Math.cos(a2) * outerR, cy + Math.sin(a2) * outerR);
    ctx.lineTo(cx + Math.cos(a2) * innerR, cy + Math.sin(a2) * innerR);
    ctx.lineTo(cx + Math.cos(a3) * innerR, cy + Math.sin(a3) * innerR);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1.5;
  ctx.stroke();
};

const drawRivets = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  count: number,
  color: string
) => {
  for (let i = 0; i < count; i++) {
    const a = (Math.PI * 2 * i) / count;
    const x = cx + Math.cos(a) * radius;
    const y = cy + Math.sin(a) * radius;
    ctx.beginPath();
    ctx.arc(x, y, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }
};

export const CLOCKWORK_MODEL_SET: SkinModelSet = {
  id: 'clockwork',
  name: '蒸汽機械',
  description: '黃銅齒輪與鉚釘構成的工業風塔',
  drawers: {
    1: (p) => {
      const { ctx, cx, cy, radius, color, highlight, level } = p;
      drawBaseDisc(ctx, cx, cy, radius, color);
      drawGear(ctx, cx, cy, radius * 0.6, 8, Date.now() * 0.002, highlight, '#000');
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.15, 0, Math.PI * 2);
      ctx.fillStyle = '#1a1d24';
      ctx.fill();
      drawLevelText(ctx, cx, cy, level, radius * 0.55);
    },
    2: (p) => {
      const { ctx, cx, cy, radius, color, highlight, level } = p;
      drawBaseDisc(ctx, cx, cy, radius, color);
      drawGear(ctx, cx, cy, radius * 0.7, 10, Date.now() * 0.0015, highlight, '#000');
      drawGear(ctx, cx, cy, radius * 0.4, 6, -Date.now() * 0.003, '#1a1d24', highlight);
      drawRivets(ctx, cx, cy, radius * 0.85, 6, '#444');
      drawLevelText(ctx, cx, cy, level, radius * 0.55);
    },
    3: (p) => {
      const { ctx, cx, cy, radius, color, highlight, level } = p;
      drawBaseDisc(ctx, cx, cy, radius, color);
      const t = Date.now() * 0.0015;
      drawGear(ctx, cx + radius * 0.3, cy - radius * 0.25, radius * 0.35, 8, t, highlight, '#000');
      drawGear(ctx, cx - radius * 0.3, cy + radius * 0.25, radius * 0.35, 8, -t * 1.2, highlight, '#000');
      drawGear(ctx, cx, cy, radius * 0.45, 10, t * 0.6, '#1a1d24', highlight);
      drawRivets(ctx, cx, cy, radius * 0.85, 8, '#666');
      drawLevelText(ctx, cx, cy, level, radius * 0.4);
    },
    4: (p) => {
      const { ctx, cx, cy, radius, color, highlight, level } = p;
      drawBaseDisc(ctx, cx, cy, radius, color);
      const t = Date.now() * 0.0015;
      drawGear(ctx, cx, cy, radius * 0.85, 14, t * 0.5, highlight, '#000');
      drawGear(ctx, cx, cy, radius * 0.55, 10, -t, '#1a1d24', highlight);
      drawGear(ctx, cx, cy, radius * 0.28, 6, t * 1.5, highlight, '#000');
      drawRivets(ctx, cx, cy, radius * 0.95, 12, '#888');
      drawLevelText(ctx, cx, cy, level, radius * 0.35);
    },
    5: (p) => {
      const { ctx, cx, cy, radius, color, highlight, level } = p;
      const glow = ctx.createRadialGradient(cx, cy, radius * 0.5, cx, cy, radius * 1.48);
      glow.addColorStop(0, `${highlight}50`);
      glow.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.72, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      drawBaseDisc(ctx, cx, cy, radius, color);
      const t = Date.now() * 0.0015;
      // 四個外圍小齒輪
      const orbR = radius * 0.85;
      for (let i = 0; i < 4; i++) {
        const a = (Math.PI / 2) * i + t * 0.3;
        const ox = cx + Math.cos(a) * orbR * 0.6;
        const oy = cy + Math.sin(a) * orbR * 0.6;
        drawGear(ctx, ox, oy, radius * 0.22, 6, t * (i % 2 ? 1 : -1), highlight, '#000');
      }
      // 中央大齒輪
      drawGear(ctx, cx, cy, radius * 0.45, 12, t * 0.8, '#1a1d24', highlight);
      // 旋轉指針
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * 1.5);
      ctx.fillStyle = highlight;
      ctx.fillRect(-1, -radius * 0.4, 2, radius * 0.4);
      ctx.restore();
      drawRivets(ctx, cx, cy, radius * 1.0, 16, '#aaa');
      drawLevelText(ctx, cx, cy, level, radius * 0.32);
    },
  },
};

// ──────────────────────────────────────────────────────────────────────────
// Arcane 模型集 - 奧術符文風
// ──────────────────────────────────────────────────────────────────────────

const drawRuneRing = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  symbols: number,
  rotation: number,
  color: string
) => {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  ctx.strokeStyle = `${color}66`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.stroke();
  // 符文
  ctx.fillStyle = color;
  for (let i = 0; i < symbols; i++) {
    const a = (Math.PI * 2 * i) / symbols;
    ctx.save();
    ctx.rotate(a);
    ctx.fillRect(-1.5, -radius - 2, 3, 4);
    ctx.fillRect(-3, -radius + 2, 6, 1.5);
    ctx.restore();
  }
  ctx.restore();
};

export const ARCANE_MODEL_SET: SkinModelSet = {
  id: 'arcane',
  name: '奧術符文',
  description: '漂浮的符文環與魔法核心，散發奧術能量',
  drawers: {
    1: (p) => {
      const { ctx, cx, cy, radius, color, highlight, level } = p;
      drawBaseDisc(ctx, cx, cy, radius, color);
      drawRuneRing(ctx, cx, cy, radius * 0.55, 6, Date.now() * 0.001, highlight);
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = highlight;
      ctx.shadowBlur = 8;
      ctx.shadowColor = highlight;
      ctx.fill();
      ctx.shadowBlur = 0;
      drawLevelText(ctx, cx, cy, level, radius * 0.5);
    },
    2: (p) => {
      const { ctx, cx, cy, radius, color, highlight, level } = p;
      drawBaseDisc(ctx, cx, cy, radius, color);
      drawRuneRing(ctx, cx, cy, radius * 0.7, 8, Date.now() * 0.0015, highlight);
      drawRuneRing(ctx, cx, cy, radius * 0.45, 6, -Date.now() * 0.002, highlight);
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = highlight;
      ctx.shadowBlur = 10;
      ctx.shadowColor = highlight;
      ctx.fill();
      ctx.shadowBlur = 0;
      drawLevelText(ctx, cx, cy, level, radius * 0.45);
    },
    3: (p) => {
      const { ctx, cx, cy, radius, color, highlight, level } = p;
      drawBaseDisc(ctx, cx, cy, radius, color);
      const t = Date.now() * 0.0012;
      drawRuneRing(ctx, cx, cy, radius * 0.85, 12, t, highlight);
      drawRuneRing(ctx, cx, cy, radius * 0.6, 8, -t * 1.5, highlight);
      drawRuneRing(ctx, cx, cy, radius * 0.38, 5, t * 2, highlight);
      // 五芒星
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-Math.PI / 2);
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = (Math.PI * 2 * i) / 5;
        const x = Math.cos(a) * radius * 0.3;
        const y = Math.sin(a) * radius * 0.3;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        const a2 = a + Math.PI / 5;
        const x2 = Math.cos(a2) * radius * 0.13;
        const y2 = Math.sin(a2) * radius * 0.13;
        ctx.lineTo(x2, y2);
      }
      ctx.closePath();
      ctx.strokeStyle = highlight;
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 6;
      ctx.shadowColor = highlight;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.restore();
      drawLevelText(ctx, cx, cy, level, radius * 0.35);
    },
    4: (p) => {
      const { ctx, cx, cy, radius, color, highlight, level } = p;
      const aura = ctx.createRadialGradient(cx, cy, radius * 0.5, cx, cy, radius * 1.32);
      aura.addColorStop(0, `${highlight}40`);
      aura.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.48, 0, Math.PI * 2);
      ctx.fillStyle = aura;
      ctx.fill();

      drawBaseDisc(ctx, cx, cy, radius, color);
      const t = Date.now() * 0.001;
      drawRuneRing(ctx, cx, cy, radius * 0.95, 14, t, highlight);
      drawRuneRing(ctx, cx, cy, radius * 0.7, 10, -t * 1.5, highlight);
      drawRuneRing(ctx, cx, cy, radius * 0.45, 6, t * 2, highlight);
      // 三個漂浮 orb
      for (let i = 0; i < 3; i++) {
        const a = (Math.PI * 2 * i) / 3 + t * 0.8;
        const ox = cx + Math.cos(a) * radius * 0.55;
        const oy = cy + Math.sin(a) * radius * 0.55;
        ctx.beginPath();
        ctx.arc(ox, oy, 3, 0, Math.PI * 2);
        ctx.fillStyle = highlight;
        ctx.shadowBlur = 8;
        ctx.shadowColor = highlight;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      drawLevelText(ctx, cx, cy, level, radius * 0.32);
    },
    5: (p) => {
      const { ctx, cx, cy, radius, color, highlight, level } = p;
      const aura = ctx.createRadialGradient(cx, cy, radius * 0.4, cx, cy, radius * 1.72);
      aura.addColorStop(0, `${highlight}60`);
      aura.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.88, 0, Math.PI * 2);
      ctx.fillStyle = aura;
      ctx.fill();

      drawBaseDisc(ctx, cx, cy, radius, color);
      const t = Date.now() * 0.001;
      drawRuneRing(ctx, cx, cy, radius * 1.05, 18, t, highlight);
      drawRuneRing(ctx, cx, cy, radius * 0.8, 12, -t * 1.5, highlight);
      drawRuneRing(ctx, cx, cy, radius * 0.55, 8, t * 2, highlight);
      drawRuneRing(ctx, cx, cy, radius * 0.3, 5, -t * 3, highlight);

      // 中央能量核心
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.18, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 20;
      ctx.shadowColor = highlight;
      ctx.fill();
      ctx.shadowBlur = 0;

      // 六個漂浮符文
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI * 2 * i) / 6 + t * 0.5;
        const ox = cx + Math.cos(a) * radius * 0.7;
        const oy = cy + Math.sin(a) * radius * 0.7;
        ctx.save();
        ctx.translate(ox, oy);
        ctx.rotate(a + Math.PI / 2);
        ctx.strokeStyle = highlight;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-3, 0);
        ctx.lineTo(3, 0);
        ctx.moveTo(0, -3);
        ctx.lineTo(0, 3);
        ctx.shadowBlur = 5;
        ctx.shadowColor = highlight;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.restore();
      }
      drawLevelText(ctx, cx, cy, level, radius * 0.32);
    },
  },
};

// ──────────────────────────────────────────────────────────────────────────
// 註冊表
// ──────────────────────────────────────────────────────────────────────────

export const SKIN_MODEL_SETS: Record<string, SkinModelSet> = {
  crystal: CRYSTAL_MODEL_SET,
  clockwork: CLOCKWORK_MODEL_SET,
  arcane: ARCANE_MODEL_SET,
};

/** 取得模型集 */
export const getSkinModelSet = (id?: string): SkinModelSet | undefined =>
  id ? SKIN_MODEL_SETS[id] : undefined;

/** 依等級取得繪製函數 */
export const getSkinDrawer = (id: string | undefined, level: number): SkinModelDrawer | undefined => {
  const set = getSkinModelSet(id);
  if (!set) return undefined;
  const clamped = Math.max(1, Math.min(5, level)) as 1 | 2 | 3 | 4 | 5;
  return set.drawers[clamped];
};

/** 取得所有可用模型集（用於 UI 選擇） */
export const getAllSkinModelSets = (): SkinModelSet[] => Object.values(SKIN_MODEL_SETS);
