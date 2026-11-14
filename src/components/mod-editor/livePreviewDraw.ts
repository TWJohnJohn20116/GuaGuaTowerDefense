/**
 * Mod 編輯器即時預覽：畫布繪製原語
 *
 * 從 `LivePreview.tsx` 拆出（TD-07）。這裡只放「怎麼畫一個塔／敵人／投射物」
 * 這種與 React 無關的 canvas 繪製，元件本身留在 `LivePreview.tsx`。
 * 搬移時逐字保留原本的座標、顏色與線寬——這些數字直接決定畫面，
 * 改動屬於視覺變更，不在這次拆檔範圍。
 */

import type { CustomTowerData, CustomEnemyData } from '@/types/game';
import { drawTowerModel } from '@/components/game/TowerModels';
import { drawEnemyModel } from '@/utils/enemyRenderer';

// 從 CSS 變數取得主題顏色
const getThemeColor = (varName: string, fallback: string): string => {
  if (typeof document === 'undefined') return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || fallback;
};
export const getThemeBg = () => getThemeColor('--color-bg', '#1a1d24');
export const getThemeText = () => getThemeColor('--color-text', '#d4d4dc');

// 繪製塔（使用實際遊戲模型）
export const drawTower = (
  ctx: CanvasRenderingContext2D,
  tower: CustomTowerData,
  x: number,
  y: number,
  size: number,
  selected: boolean,
  showRange: boolean,
  rotation: number = 0,
  fxLabels?: { splash: string; slow: string; poison: string; chain: string },
) => {
  // 顯示範圍
  if (showRange) {
    ctx.beginPath();
    ctx.arc(x, y, tower.range * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = tower.color + '20';
    ctx.fill();
    ctx.strokeStyle = tower.color + '40';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // 選中效果
  if (selected) {
    ctx.beginPath();
    ctx.arc(x, y, size + 8, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // 不使用光暈（HARDLINE 沒有發光）

  // 使用實際模型渲染
  const modelType = tower.modelType || 'basic';
  const scale = tower.modelScale || 1;
  drawTowerModel(modelType, {
    ctx, cx: x, cy: y,
    radius: size * scale,
    rotation,
    color: tower.color,
    highlight: tower.highlightColor || tower.color + '80',
    level: 1, recoil: 0,
    tileSize: size * 2.86,
  });

  // 效果指示器（文字標籤，避免 emoji）
  const effectLabels: string[] = [];
  if (tower.splash && fxLabels) effectLabels.push(fxLabels.splash);
  if (tower.slowEffect && fxLabels) effectLabels.push(fxLabels.slow);
  if (tower.poisonEffect && fxLabels) effectLabels.push(fxLabels.poison);
  if (tower.lightningEffect && fxLabels) effectLabels.push(fxLabels.chain);

  if (effectLabels.length > 0) {
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = tower.color;
    ctx.fillText(effectLabels.join(' '), x, y + size + 14);
  }
};

// 繪製敵人（使用實際遊戲模型）
export const drawEnemy = (
  ctx: CanvasRenderingContext2D,
  enemy: CustomEnemyData,
  x: number,
  y: number,
  selected: boolean,
  animOffset: number,
  skipBuiltinHp = false,
  abilityTag?: string,
) => {
  const size = enemy.size * 1.2;
  const scale = enemy.modelScale || 1;
  const scaledSize = size * scale;

  // 選中效果
  if (selected) {
    ctx.beginPath();
    ctx.arc(x, y, scaledSize + 8, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // 不使用光暈（HARDLINE 沒有發光）

  // 使用實際模型渲染
  const modelType = enemy.modelType || 'normal';
  drawEnemyModel(ctx, x, y, scaledSize, modelType, enemy.color, animOffset * 50);

  // 生命條（戰鬥模式由外層繪製）
  if (!skipBuiltinHp) {
    const barWidth = scaledSize * 2;
    const barHeight = 4;
    ctx.fillStyle = '#333';
    ctx.fillRect(x - barWidth / 2, y - scaledSize - 10, barWidth, barHeight);
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(x - barWidth / 2, y - scaledSize - 10, barWidth, barHeight);
  }

  // 能力標記
  if (enemy.ability) {
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(abilityTag ?? 'A', x, y + scaledSize + 14);
  }
};

// 繪製投射物動畫
export const drawProjectile = (
  ctx: CanvasRenderingContext2D,
  tower: CustomTowerData,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  progress: number,
) => {
  const x = startX + (endX - startX) * progress;
  const y = startY + (endY - startY) * progress;
  const color = tower.projectileColor || tower.color;
  const size = tower.projectileSize || 4;

  ctx.save();
  ctx.strokeStyle = color + '55';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(x, y);
  ctx.stroke();

  if (progress > 0.92) {
    ctx.beginPath();
    ctx.arc(endX, endY, 10 * (1 - progress) * 12, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${0.35 * (1 - progress) * 12})`;
    ctx.fill();
  }

  ctx.beginPath();
  ctx.arc(x, y, size + 1.5, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  for (let i = 1; i <= 4; i++) {
    const trailProgress = Math.max(0, progress - i * 0.08);
    const tx = startX + (endX - startX) * trailProgress;
    const ty = startY + (endY - startY) * trailProgress;
    ctx.beginPath();
    ctx.arc(tx, ty, size * (1 - i * 0.18), 0, Math.PI * 2);
    ctx.fillStyle = color + Math.round(90 - i * 18).toString(16).padStart(2, '0');
    ctx.fill();
  }
  ctx.restore();
};
