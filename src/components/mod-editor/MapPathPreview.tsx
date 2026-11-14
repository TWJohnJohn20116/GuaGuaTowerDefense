/**
 * Mod 地圖路徑 Canvas 預覽（與 MapEditorPanel 同款繪製邏輯）
 */
import { useRef, useEffect, useState } from 'react';
import { GAME_CONSTANTS } from '@/data/gameData';
import type { CustomMapData, Tile } from '@/types/game';
import { drawGrid as drawGameGrid } from '@/components/game/PathRenderer';
import { MapIcon } from '@/components/ui/Icons';
import { useTranslation } from '@/i18n';

interface MapPathPreviewProps {
  map: CustomMapData;
  className?: string;
  canvasClassName?: string;
  emptyLabel?: string;
  /** inline：標準區塊；background：卡片沉浸式背景 */
  variant?: 'inline' | 'background';
}

export function drawMapPathToCanvas(
  ctx: CanvasRenderingContext2D,
  map: CustomMapData,
  gridWidth: number,
  gridHeight: number,
  tileSize: number,
) {
  const { GRID_COLS, GRID_ROWS } = GAME_CONSTANTS;
  const style = getComputedStyle(document.documentElement);
  const colorBg = style.getPropertyValue('--color-bg').trim() || '#2e3440';

  ctx.clearRect(0, 0, gridWidth, gridHeight);
  ctx.fillStyle = colorBg;
  ctx.fillRect(0, 0, gridWidth, gridHeight);

  const blocked = map.blockedCells ?? [];
  blocked.forEach((cell) => {
    if (cell.row >= 0 && cell.row < GRID_ROWS && cell.col >= 0 && cell.col < GRID_COLS) {
      ctx.fillStyle = 'rgba(60, 65, 75, 0.85)';
      ctx.fillRect(cell.col * tileSize + 1, cell.row * tileSize + 1, tileSize - 2, tileSize - 2);
      ctx.strokeStyle = 'rgba(120, 125, 140, 0.5)';
      ctx.lineWidth = 1;
      ctx.strokeRect(cell.col * tileSize + 1, cell.row * tileSize + 1, tileSize - 2, tileSize - 2);
    }
  });

  const dummyGrid: Tile[][] = Array.from({ length: GRID_ROWS }, (_, r) =>
    Array.from({ length: GRID_COLS }, (_, c) => ({
      type: 'empty',
      row: r,
      col: c,
      towerId: null,
    } as Tile)),
  );

  if (map.waypoints.length > 1) {
    const pathConnections: boolean[][] = Array.from({ length: GRID_ROWS }, () =>
      Array(GRID_COLS).fill(false),
    );

    map.waypoints.forEach((wp) => {
      if (wp.row >= 0 && wp.row < GRID_ROWS && wp.col >= 0 && wp.col < GRID_COLS) {
        pathConnections[wp.row][wp.col] = true;
      }
    });

    for (let i = 0; i < map.waypoints.length - 1; i++) {
      const p1 = map.waypoints[i];
      const p2 = map.waypoints[i + 1];
      let r = p1.row;
      let c = p1.col;

      while (r !== p2.row || c !== p2.col) {
        if (r >= 0 && r < GRID_ROWS && c >= 0 && c < GRID_COLS) {
          pathConnections[r][c] = true;
        }
        if (r < p2.row) r++;
        else if (r > p2.row) r--;
        else if (c < p2.col) c++;
        else if (c > p2.col) c--;
      }
    }

    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (pathConnections[r][c]) {
          dummyGrid[r][c].type = 'path';
        }
      }
    }
  }

  drawGameGrid(ctx, dummyGrid, gridWidth, gridHeight, tileSize);

  if (map.waypoints.length > 0) {
    const start = map.waypoints[0];
    if (start.row >= 0 && start.row < GRID_ROWS && start.col >= 0 && start.col < GRID_COLS) {
      dummyGrid[start.row][start.col].type = 'start';
    }
    if (map.waypoints.length > 1) {
      const end = map.waypoints[map.waypoints.length - 1];
      if (end.row >= 0 && end.row < GRID_ROWS && end.col >= 0 && end.col < GRID_COLS) {
        dummyGrid[end.row][end.col].type = 'end';
      }
    }
  }

  drawGameGrid(ctx, dummyGrid, tileSize, 0, 0);
}

export function MapPathPreview({
  map,
  className = '',
  canvasClassName = '',
  emptyLabel,
  variant = 'inline',
}: MapPathPreviewProps) {
  const { t } = useTranslation();
  const m = t.modEditorExt;
  const resolvedEmpty = emptyLabel ?? m.mapEmptyPath;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [previewWidth, setPreviewWidth] = useState(280);
  const { GRID_COLS, GRID_ROWS } = GAME_CONSTANTS;

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setPreviewWidth(entries[0].contentRect.width);
      }
    });
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const tileSize = Math.max(8, Math.floor(previewWidth / GRID_COLS));
  const gridWidth = tileSize * GRID_COLS;
  const gridHeight = tileSize * GRID_ROWS;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawMapPathToCanvas(ctx, map, gridWidth, gridHeight, tileSize);
  }, [map, gridWidth, gridHeight, tileSize]);

  const hasPath = map.waypoints.length >= 2;
  const isBackground = variant === 'background';

  // 畫布外框：1px 線 + 下沉底，不加陰影。
  const containerClass = isBackground
    ? `absolute inset-0 overflow-hidden ${className}`
    : `relative overflow-hidden border border-[var(--hl-line)] bg-[var(--hl-void-2)] ${className}`;

  const canvasClass = isBackground
    ? `absolute left-1/2 top-1/2 min-h-[120%] min-w-[120%] -translate-x-1/2 -translate-y-1/2 opacity-20 ${canvasClassName}`
    : `block h-auto w-full ${canvasClassName}`;

  return (
    <div ref={containerRef} className={containerClass}>
      {hasPath ? (
        <canvas
          ref={canvasRef}
          width={gridWidth}
          height={gridHeight}
          className={canvasClass}
          style={{ imageRendering: 'pixelated' }}
        />
      ) : !isBackground ? (
        <div className="flex flex-col items-center justify-center gap-2 py-10">
          <MapIcon className="h-7 w-7 text-[var(--hl-ink-4)]" />
          <span className="hl-label">{resolvedEmpty}</span>
        </div>
      ) : null}
    </div>
  );
}
