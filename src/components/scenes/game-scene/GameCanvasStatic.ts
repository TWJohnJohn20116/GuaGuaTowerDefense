/**
 * GameCanvasStatic.ts - 遊戲畫布靜態層繪製
 * 
 * 負責繪製：地板格子、戰術建議、範圍指示器、塔模型
 * 這些元素只在相關狀態變化時重繪，不需要每幀更新
 */

import { drawGrid, drawTileHover } from '@/components/game/PathRenderer';
import type { TowerType, Tower } from '@/types/game';
import { previewPlacementSynergies, toTowerRef } from '@/data/towerSynergyData';
import { getTowerStatBonus } from '@/data/towerCombatStats';

// ===== 調適調試繪圖 =====

function drawDebugGrid(
  ctx: CanvasRenderingContext2D,
  _canvasWidth: number,
  _canvasHeight: number,
  tileSize: number,
  offsetX: number,
  offsetY: number
): void {
  ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
  ctx.lineWidth = 1;
  
  for (let row = 0; row <= 20; row++) {
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY + row * tileSize);
    ctx.lineTo(offsetX + 20 * tileSize, offsetY + row * tileSize);
    ctx.stroke();
  }
  
  for (let col = 0; col <= 20; col++) {
    ctx.beginPath();
    ctx.moveTo(offsetX + col * tileSize, offsetY);
    ctx.lineTo(offsetX + col * tileSize, offsetY + 20 * tileSize);
    ctx.stroke();
  }
}

function drawDebugPath(
  ctx: CanvasRenderingContext2D,
  tileSize: number,
  offsetX: number,
  offsetY: number,
  _params: StaticLayerParams
): void {
  // 嘗試從 gameStore 獲取當前路徑（這裡用簡化的方式）
  // 實際應該傳入 waypoints
  ctx.strokeStyle = 'rgba(0, 255, 255, 0.6)';
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 5]);
  
  // 繪製一條範例路徑（實際實現需要傳入 waypoints）
  // 第一點 Y=0 是畫布頂部，不需要偏移
  ctx.beginPath();
  ctx.moveTo(offsetX + 2 * tileSize + tileSize / 2, offsetY + 0 * tileSize);
  ctx.lineTo(offsetX + 2 * tileSize + tileSize / 2, offsetY + 5 * tileSize + tileSize / 2);
  ctx.lineTo(offsetX + 8 * tileSize + tileSize / 2, offsetY + 5 * tileSize + tileSize / 2);
  ctx.lineTo(offsetX + 8 * tileSize + tileSize / 2, offsetY + 10 * tileSize + tileSize / 2);
  ctx.lineTo(offsetX + 14 * tileSize + tileSize / 2, offsetY + 10 * tileSize + tileSize / 2);
  ctx.lineTo(offsetX + 14 * tileSize + tileSize / 2, offsetY + 15 * tileSize + tileSize / 2);
  ctx.lineTo(offsetX + 18 * tileSize + tileSize / 2, offsetY + 15 * tileSize + tileSize / 2);
  ctx.stroke();
  ctx.setLineDash([]);
}

// ===== 類型定義 =====

type GetTowerData = (type: string) => any;
type GetSkinVisuals = (type: TowerType) => any;

export interface TacticalScore {
  col: number;
  row: number;
  recommendation: string;
  score: number;
}

export interface StaticLayerParams {
  grid: any[][];
  hoveredTile: { col: number; row: number } | null;
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
  multiSelectedTowerIds?: string[];
  showGrid: boolean;
  showPath: boolean;
  showEnemyPath: boolean;
  showHitboxes: boolean;
  towers: Tower[];
}

// ===== 靜態層渲染 =====
export function renderStaticLayer(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  params: StaticLayerParams
): void {
  const {
    grid, hoveredTile, selectedTower, selectedTowerType,
    canAffordSelected, tileSize, offsetX, offsetY,
    getSkinVisuals, getTowerData, showTacticalView, tacticalScores, showTowerRange,
    showGrid, showPath, showEnemyPath, showHitboxes, multiSelectedTowerIds, towers
  } = params;

  ctx.fillStyle = '#1a1d24';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // 調適：繪製網格（如果開啟）
  if (showGrid) {
    drawDebugGrid(ctx, canvasWidth, canvasHeight, tileSize, offsetX, offsetY);
  }

  // 調適：繪製路徑（如果開啟）
  if (showPath) {
    drawDebugPath(ctx, tileSize, offsetX, offsetY, params);
  }

  // 調適：繪製碰撞框（由動態層處理，這裡僅為了消除未使用變數警告）
  if (showHitboxes) {
    // hitboxes 實際在動態層繪製
  }

  // 第一層：繪製地板格子與連通式路徑
  drawGrid(ctx, grid, tileSize, offsetX, offsetY, showEnemyPath);
  drawTileHover(ctx, grid, hoveredTile, selectedTowerType, canAffordSelected, tileSize, offsetX, offsetY);

  // 戰術建議層：繪製推薦放置位置
  drawTacticalOverlay(ctx, tileSize, offsetX, offsetY, showTacticalView, tacticalScores);

  // 第二層：繪製塔的範圍指示器（選中或懸停時顯示）
  drawRangeIndicators(ctx, tileSize, offsetX, offsetY, towers ?? [], selectedTower, hoveredTile, getTowerData, getSkinVisuals, showTowerRange);

  // 多選塔高亮 (群選)
  if (multiSelectedTowerIds && multiSelectedTowerIds.length > 0) {
    drawMultiSelectHighlight(ctx, tileSize, offsetX, offsetY, towers ?? [], multiSelectedTowerIds);
  }

  // 預覽放置塔的範圍
  drawPlacementPreview(ctx, grid, tileSize, offsetX, offsetY, selectedTowerType, hoveredTile, getTowerData, getSkinVisuals, showTowerRange);
  drawPlacementSynergyPreview(ctx, tileSize, offsetX, offsetY, selectedTowerType, hoveredTile, grid, towers);
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
      if (selected.has(tower.id)) {
        const cx = offsetX + tower.gridPos.col * tileSize + tileSize / 2;
        const cy = offsetY + tower.gridPos.row * tileSize + tileSize / 2;
        const radius = tileSize * 0.45;
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
    const x = offsetX + score.col * tileSize;
    const y = offsetY + score.row * tileSize;

    // 根據推薦等級選擇顏色
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

    // 繪製填充
    ctx.fillStyle = color;
    ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);

    // 繪製邊框
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 2, y + 2, tileSize - 4, tileSize - 4);

    // 顯示排名數字（前 5 名）
    if (index < 5) {
      ctx.fillStyle = borderColor;
      ctx.font = `bold ${tileSize * 0.4}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.globalAlpha = opacity;
      ctx.fillText(`${index + 1}`, x + tileSize / 2, y + tileSize / 2);
      ctx.globalAlpha = 1;
    }

    // 最佳位置加上閃爍效果
    if (score.recommendation === 'best' && index < 3) {
      const pulse = (Math.sin(performance.now() / 300) + 1) / 2 * 0.3;
      ctx.fillStyle = `rgba(46, 204, 113, ${pulse})`;
      ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);
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
  hoveredTile: { col: number; row: number } | null,
  getTowerData: GetTowerData,
  getSkinVisuals: GetSkinVisuals,
  showTowerRange: boolean
): void {
  if (!showTowerRange) return;

  for (const tower of towers) {
      const isSelected = selectedTower?.id === tower.id;
      const isHovered = hoveredTile && hoveredTile.col === tower.gridPos.col && hoveredTile.row === tower.gridPos.row;

      if (isSelected || isHovered) {
        const x = offsetX + tower.gridPos.col * tileSize;
        const y = offsetY + tower.gridPos.row * tileSize;
        const centerX = x + tileSize / 2;
        const centerY = y + tileSize / 2;
        const towerData = getTowerData(tower.type);
        if (!towerData) continue;
        // range 是格子單位，乘以 tileSize 轉換為像素
        const rangeInPixels = towerData.range * getTowerStatBonus(tower).rangeMultiplier * tileSize;

        // 獲取皮膚顏色用於範圍指示器
        const rangeSkinVisuals = getSkinVisuals(tower.type as TowerType);
        const rangeColor = rangeSkinVisuals?.color || towerData.color;

        ctx.beginPath();
        ctx.arc(centerX, centerY, rangeInPixels, 0, Math.PI * 2);

        if (isSelected) {
          // 選中時：使用皮膚顏色
          ctx.fillStyle = rangeColor + '33'; // 20% opacity
          ctx.fill();
          ctx.strokeStyle = rangeColor + '80'; // 50% opacity
          ctx.lineWidth = 2;
          ctx.stroke();
        } else if (isHovered) {
          // 懸停時：白色半透明
          ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
    }
  }
}

// ===== 放置預覽範圍 =====
function drawPlacementPreview(
  ctx: CanvasRenderingContext2D,
  grid: any[][],
  tileSize: number,
  offsetX: number,
  offsetY: number,
  selectedTowerType: TowerType | null,
  hoveredTile: { col: number; row: number } | null,
  getTowerData: GetTowerData,
  getSkinVisuals: GetSkinVisuals,
  showTowerRange: boolean
): void {
  if (!showTowerRange) return;
  if (!selectedTowerType || !hoveredTile) return;

  const tile = grid[hoveredTile.row]?.[hoveredTile.col];
  if (!tile || tile.type !== 'empty' || tile.towerId) return;

  const x = offsetX + hoveredTile.col * tileSize;
  const y = offsetY + hoveredTile.row * tileSize;
  const centerX = x + tileSize / 2;
  const centerY = y + tileSize / 2;
  const previewTowerData = getTowerData(selectedTowerType);

  // 獲取預覽塔的皮膚
  const previewSkinVisuals = getSkinVisuals(selectedTowerType);
  const previewColor = previewSkinVisuals?.color || previewTowerData?.color || '#5b9bd5';

  if (!previewTowerData) return;

  // range 是格子單位，乘以 tileSize 轉換為像素
  const previewRangeInPixels = previewTowerData.range * tileSize;
  ctx.beginPath();
  ctx.arc(centerX, centerY, previewRangeInPixels, 0, Math.PI * 2);
  // 使用皮膚顏色的透明度版本
  ctx.fillStyle = previewColor + '1a'; // 10% opacity
  ctx.fill();
  ctx.strokeStyle = previewColor + '66'; // 40% opacity
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
  hoveredTile: { col: number; row: number } | null,
  grid: any[][],
  towers: Tower[],
): void {
  if (!selectedTowerType || !hoveredTile) return;
  const tile = grid[hoveredTile.row]?.[hoveredTile.col];
  if (!tile || tile.type !== 'empty' || tile.towerId) return;

  const previews = previewPlacementSynergies(
    selectedTowerType,
    hoveredTile.col,
    hoveredTile.row,
    towers.map(toTowerRef),
  );
  if (previews.length === 0) return;

  const fromX = offsetX + hoveredTile.col * tileSize + tileSize / 2;
  const fromY = offsetY + hoveredTile.row * tileSize + tileSize / 2;
  ctx.save();
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
  ctx.fillStyle = 'rgba(14, 116, 144, 0.35)';
  ctx.lineWidth = 2.4;
  ctx.setLineDash([6, 4]);
  for (const preview of previews) {
    const toX = offsetX + preview.partnerCol * tileSize + tileSize / 2;
    const toY = offsetY + preview.partnerRow * tileSize + tileSize / 2;
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
    ctx.fillRect(
      offsetX + preview.partnerCol * tileSize + 2,
      offsetY + preview.partnerRow * tileSize + 2,
      tileSize - 4,
      tileSize - 4,
    );
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
