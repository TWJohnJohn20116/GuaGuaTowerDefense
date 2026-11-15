/**
 * GameCanvasStatic.ts - 遊戲畫布靜態層繪製（自由地圖版）
 *
 * 負責繪製：連續場地與路徑帶、戰術建議、範圍指示器、放置預覽。
 * 這些元素只在相關狀態變化時重繪，不需要每幀更新。
 *
 * 與舊版的差異：沒有任何 `grid[r][c]` 查詢，也沒有「整格高亮」。
 * 滑鼠位置是連續座標（hoverPoint），提示一律畫成圓形，半徑＝塔的佔位半徑。
 */

import { drawField, drawHoverRing } from '@/components/game/PathRenderer';
import type { MapPoint, PathConfig, Tower, TowerType } from '@/types/game';
import type { TacticalScore } from '@/components/game/TacticalUtils';
import {
  DEFAULT_TOWER_RADIUS,
  circlesOverlap,
  isBlockedAt,
  isInsideBounds,
  pathClearance,
  pathWidthOf,
} from '@/data/mapGeometry';
import { previewPlacementSynergies, toTowerRef } from '@/data/towerSynergyData';
import { getTowerStatBonusFor } from '@/store/gameStoreUtils';
import { getBoardColors } from '@/utils/themeBoard';

// ===== 類型定義 =====

type GetTowerData = (type: string) => { range: number; color: string } | null | undefined;
type GetSkinVisuals = (type: TowerType) => { color?: string } | null | undefined;

interface StaticLayerParams {
  map: PathConfig | null;
  hoverPoint: MapPoint | null;
  selectedTower: Tower | null;
  selectedTowerType: TowerType | null;
  /** 是否負擔得起選取的塔（原本傳 money，但那只是為了算這個布林） */
  canAffordSelected: boolean;
  tileSize: number;
  offsetX: number;
  offsetY: number;
  getSkinVisuals: GetSkinVisuals;
  getTowerData: GetTowerData;
  showTacticalView: boolean;
  tacticalScores: TacticalScore[];
  showTowerRange: boolean;
  showPath: boolean;
  showHitboxes: boolean;
  multiSelectedTowerIds: string[];
  towers: Tower[];
}

/** 這個點能不能放塔（與 store.placeTower 同一套判定，只差金錢） */
const canPlaceAt = (map: PathConfig | null, point: MapPoint, towers: Tower[]): boolean => {
  if (!isInsideBounds(map, point, DEFAULT_TOWER_RADIUS)) return false;
  if (isBlockedAt(map, point, DEFAULT_TOWER_RADIUS)) return false;
  if (pathClearance(map, point) < pathWidthOf(map) / 2 + DEFAULT_TOWER_RADIUS) return false;
  return !towers.some((t) => circlesOverlap(point, DEFAULT_TOWER_RADIUS, t.pos, t.radius));
};

// ===== 靜態層渲染 =====
export function renderStaticLayer(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  params: StaticLayerParams
): void {
  const {
    map, hoverPoint, selectedTower, selectedTowerType,
    canAffordSelected, tileSize, offsetX, offsetY,
    getSkinVisuals, getTowerData, showTacticalView, tacticalScores, showTowerRange,
    showPath, showHitboxes, multiSelectedTowerIds, towers
  } = params;

  ctx.fillStyle = getBoardColors().floor;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // 碰撞框由動態層處理，這裡僅為了消除未使用變數警告
  if (showHitboxes) {
    // hitboxes 實際在動態層繪製
  }

  // 第一層：整片場地 + 路徑帶（不再有格子）
  drawField(ctx, map, tileSize, offsetX, offsetY, { showPath });

  // 滑鼠位置的圓形提示
  const hoverColor = canAffordSelected ? '#38bdf8' : '#ef4444';
  drawHoverRing(ctx, hoverPoint, DEFAULT_TOWER_RADIUS, tileSize, offsetX, offsetY, hoverColor);

  // 戰術建議層：繪製推薦放置位置
  drawTacticalOverlay(ctx, tileSize, offsetX, offsetY, showTacticalView, tacticalScores);

  // 第二層：繪製塔的範圍指示器（選中或懸停時顯示）
  drawRangeIndicators(ctx, tileSize, offsetX, offsetY, towers, selectedTower, hoverPoint, getTowerData, getSkinVisuals, showTowerRange);

  // 多選塔高亮 (群選)
  if (multiSelectedTowerIds && multiSelectedTowerIds.length > 0) {
    drawMultiSelectHighlight(ctx, tileSize, offsetX, offsetY, towers, multiSelectedTowerIds);
  }

  // 預覽放置塔的範圍
  drawPlacementPreview(ctx, map, tileSize, offsetX, offsetY, selectedTowerType, hoverPoint, towers, getTowerData, getSkinVisuals, showTowerRange);
  drawPlacementSynergyPreview(ctx, tileSize, offsetX, offsetY, selectedTowerType, hoverPoint, towers);
}

// ===== 多選高亮 =====
function drawMultiSelectHighlight(
  ctx: CanvasRenderingContext2D,
  tileSize: number,
  offsetX: number,
  offsetY: number,
  towers: Tower[],
  multiSelectedTowerIds: string[]
): void {
  const time = Date.now();
  const pulse = Math.sin(time * 0.005) * 0.15 + 0.7;
  const selected = new Set(multiSelectedTowerIds);

  for (const tower of towers) {
    if (!selected.has(tower.id)) continue;
    const cx = offsetX + tower.pos.x * tileSize;
    const cy = offsetY + tower.pos.y * tileSize;
    const radius = tileSize * Math.max(0.45, tower.radius);
    // 外發光
    ctx.save();
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 20;
    ctx.strokeStyle = `rgba(168, 85, 247, ${pulse})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
    // 內圈虛線
    ctx.shadowBlur = 0;
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = `rgba(255, 255, 255, ${pulse * 0.7})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }
}

// ===== 戰術建議覆蓋層 =====
function drawTacticalOverlay(
  ctx: CanvasRenderingContext2D,
  tileSize: number,
  offsetX: number,
  offsetY: number,
  showTacticalView: boolean,
  tacticalScores: TacticalScore[]
): void {
  if (!showTacticalView || tacticalScores.length === 0) return;

  // 只顯示前 15 個最佳位置
  const topScores = tacticalScores.slice(0, 15);

  topScores.forEach((score, index) => {
    const cx = offsetX + score.x * tileSize;
    const cy = offsetY + score.y * tileSize;
    const radius = tileSize * DEFAULT_TOWER_RADIUS;

    let color: string;
    let borderColor: string;
    let opacity: number;

    switch (score.recommendation) {
      case 'best':
        color = 'rgba(46, 204, 113, 0.4)';
        borderColor = 'rgba(46, 204, 113, 0.9)';
        opacity = 1;
        break;
      case 'good':
        color = 'rgba(52, 152, 219, 0.35)';
        borderColor = 'rgba(52, 152, 219, 0.8)';
        opacity = 0.9;
        break;
      case 'fair':
        color = 'rgba(241, 196, 15, 0.3)';
        borderColor = 'rgba(241, 196, 15, 0.7)';
        opacity = 0.8;
        break;
      default:
        color = 'rgba(149, 165, 166, 0.25)';
        borderColor = 'rgba(149, 165, 166, 0.6)';
        opacity = 0.6;
    }

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // 顯示排名數字（前 5 名）
    if (index < 5) {
      ctx.fillStyle = borderColor;
      ctx.font = `bold ${tileSize * 0.4}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.globalAlpha = opacity;
      ctx.fillText(`${index + 1}`, cx, cy);
      ctx.globalAlpha = 1;
    }

    // 最佳位置加上閃爍效果
    if (score.recommendation === 'best' && index < 3) {
      const pulse = (Math.sin(performance.now() / 300) + 1) / 2 * 0.3;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(46, 204, 113, ${pulse})`;
      ctx.fill();
    }
  });
}

// ===== 塔的範圍指示器 =====
function drawRangeIndicators(
  ctx: CanvasRenderingContext2D,
  tileSize: number,
  offsetX: number,
  offsetY: number,
  towers: Tower[],
  selectedTower: Tower | null,
  hoverPoint: MapPoint | null,
  getTowerData: GetTowerData,
  getSkinVisuals: GetSkinVisuals,
  showTowerRange: boolean
): void {
  if (!showTowerRange) return;

  for (const tower of towers) {
    const isSelected = selectedTower?.id === tower.id;
    const isHovered = !!hoverPoint && circlesOverlap(hoverPoint, 0.05, tower.pos, tower.radius);

    if (!isSelected && !isHovered) continue;

    const centerX = offsetX + tower.pos.x * tileSize;
    const centerY = offsetY + tower.pos.y * tileSize;
    const towerData = getTowerData(tower.type);
    if (!towerData) continue;
    // range 是格子單位，乘以 tileSize 轉換為像素
    const rangeInPixels = towerData.range * getTowerStatBonusFor(tower).rangeMultiplier * tileSize;

    const rangeSkinVisuals = getSkinVisuals(tower.type as TowerType);
    const rangeColor = rangeSkinVisuals?.color || towerData.color;

    ctx.beginPath();
    ctx.arc(centerX, centerY, rangeInPixels, 0, Math.PI * 2);

    if (isSelected) {
      ctx.fillStyle = rangeColor + '33';
      ctx.fill();
      ctx.strokeStyle = rangeColor + '80';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
}

// ===== 放置預覽範圍 =====
function drawPlacementPreview(
  ctx: CanvasRenderingContext2D,
  map: PathConfig | null,
  tileSize: number,
  offsetX: number,
  offsetY: number,
  selectedTowerType: TowerType | null,
  hoverPoint: MapPoint | null,
  towers: Tower[],
  getTowerData: GetTowerData,
  getSkinVisuals: GetSkinVisuals,
  showTowerRange: boolean
): void {
  if (!showTowerRange) return;
  if (!selectedTowerType || !hoverPoint) return;
  if (!canPlaceAt(map, hoverPoint, towers)) return;

  const previewTowerData = getTowerData(selectedTowerType);
  if (!previewTowerData) return;

  const centerX = offsetX + hoverPoint.x * tileSize;
  const centerY = offsetY + hoverPoint.y * tileSize;
  const previewSkinVisuals = getSkinVisuals(selectedTowerType);
  const previewColor = previewSkinVisuals?.color || previewTowerData.color || '#5b9bd5';

  // range 是格子單位，乘以 tileSize 轉換為像素
  const previewRangeInPixels = previewTowerData.range * tileSize;
  ctx.beginPath();
  ctx.arc(centerX, centerY, previewRangeInPixels, 0, Math.PI * 2);
  ctx.fillStyle = previewColor + '1a';
  ctx.fill();
  ctx.strokeStyle = previewColor + '66';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawPlacementSynergyPreview(
  ctx: CanvasRenderingContext2D,
  tileSize: number,
  offsetX: number,
  offsetY: number,
  selectedTowerType: TowerType | null,
  hoverPoint: MapPoint | null,
  towers: Tower[],
): void {
  if (!selectedTowerType || !hoverPoint) return;

  const previews = previewPlacementSynergies(
    selectedTowerType,
    hoverPoint.x,
    hoverPoint.y,
    towers.map(toTowerRef),
  );
  if (previews.length === 0) return;

  const fromX = offsetX + hoverPoint.x * tileSize;
  const fromY = offsetY + hoverPoint.y * tileSize;
  ctx.save();
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
  ctx.fillStyle = 'rgba(14, 116, 144, 0.35)';
  ctx.lineWidth = 2.4;
  ctx.setLineDash([6, 4]);
  for (const preview of previews) {
    const toX = offsetX + preview.partnerCol * tileSize;
    const toY = offsetY + preview.partnerRow * tileSize;
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(toX, toY, tileSize * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(186, 230, 253, 0.95)';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(previews.map((p) => p.name).join(' · '), fromX, fromY + tileSize * 0.42);
  ctx.restore();
}

// 已將 drawTowers 移至 GameCanvasDynamic.ts 處理
