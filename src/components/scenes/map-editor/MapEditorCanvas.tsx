/**
 * 地圖編輯器 · 主畫布
 *
 *  - 繪製格子網格
 *  - 標示起點 / 終點
 *  - 繪製路徑點與連線
 *  - 處理點擊：依 editMode 新增 / 設起點 / 設終點 / 刪除
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { GAME_CONSTANTS } from '@/data/gameData';
import type { GridPosition } from '@/types/game';
import type { EditMode } from './types';

interface MapEditorCanvasProps {
  waypoints: GridPosition[];
  setWaypoints: (next: GridPosition[]) => void;
  editMode: EditMode;
}

export function MapEditorCanvas({ waypoints, setWaypoints, editMode }: MapEditorCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const { GRID_COLS, GRID_ROWS } = GAME_CONSTANTS;
  const tileSize = Math.min(
    (dimensions.width - 40) / GRID_COLS,
    (dimensions.height - 40) / GRID_ROWS
  );
  const gridWidth = tileSize * GRID_COLS;
  const gridHeight = tileSize * GRID_ROWS;
  const offsetX = (dimensions.width - gridWidth) / 2;
  const offsetY = (dimensions.height - gridHeight) / 2;

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // 計算路徑格子（用於底色高亮）
  const generatePathTiles = useCallback(() => {
    const tiles = new Set<string>();
    for (let i = 0; i < waypoints.length - 1; i++) {
      const start = waypoints[i];
      const end = waypoints[i + 1];
      const dx = Math.sign(end.col - start.col);
      const dy = Math.sign(end.row - start.row);
      let col = start.col;
      let row = start.row;
      while (col !== end.col || row !== end.row) {
        tiles.add(`${col},${row}`);
        if (col !== end.col) col += dx;
        if (row !== end.row) row += dy;
      }
      tiles.add(`${end.col},${end.row}`);
    }
    return tiles;
  }, [waypoints]);

  // 繪製
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !tileSize) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 透明底：深底與 1px 外框由父層提供，這裡只繪製格盤
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const pathTiles = generatePathTiles();
    const startPos = waypoints[0];
    const endPos = waypoints[waypoints.length - 1];

    // HARDLINE token 的 canvas 等值色（不用漸層、不用發光）
    const INK = '#eceff2';
    const LINE = '#222831';
    const REACH = '#6f8cff';
    const VITAL = '#35e08a';
    const ALARM = '#ff4b3e';

    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const x = offsetX + col * tileSize;
        const y = offsetY + row * tileSize;
        let fillColor = 'rgba(236,239,242,0.03)';
        const key = `${col},${row}`;
        if (pathTiles.has(key)) fillColor = 'rgba(236,239,242,0.09)';
        if (startPos && col === startPos.col && row === startPos.row) fillColor = 'rgba(53,224,138,0.28)';
        if (endPos && col === endPos.col && row === endPos.row) fillColor = 'rgba(255,61,113,0.28)';
        ctx.fillStyle = fillColor;
        ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);
        ctx.strokeStyle = LINE;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, tileSize, tileSize);
      }
    }

    if (waypoints.length > 0) {
      ctx.strokeStyle = REACH;
      ctx.lineWidth = 2;
      ctx.beginPath();
      waypoints.forEach((wp, i) => {
        const x = offsetX + wp.col * tileSize + tileSize / 2;
        const y = offsetY + wp.row * tileSize + tileSize / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      waypoints.forEach((wp, i) => {
        const x = offsetX + wp.col * tileSize + tileSize / 2;
        const y = offsetY + wp.row * tileSize + tileSize / 2;
        // 方塊節點：不用圓形，維持硬線語彙
        const half = 6;
        ctx.beginPath();
        ctx.rect(x - half, y - half, half * 2, half * 2);
        ctx.fillStyle = i === 0 ? VITAL : i === waypoints.length - 1 ? ALARM : REACH;
        ctx.fill();
        ctx.strokeStyle = INK;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = '#06070a';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${i + 1}`, x, y);
      });
    }
  }, [waypoints, tileSize, offsetX, offsetY, GRID_COLS, GRID_ROWS, generatePathTiles]);

  // 點擊處理
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || !tileSize) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - offsetX;
      const y = e.clientY - rect.top - offsetY;
      const col = Math.floor(x / tileSize);
      const row = Math.floor(y / tileSize);
      if (col < 0 || col >= GRID_COLS || row < 0 || row >= GRID_ROWS) return;
      const pos = { col, row };

      switch (editMode) {
        case 'path': {
          const exists = waypoints.findIndex((wp) => wp.col === col && wp.row === row);
          if (exists === -1) setWaypoints([...waypoints, pos]);
          break;
        }
        case 'start': {
          if (waypoints.length === 0) setWaypoints([pos]);
          else setWaypoints([pos, ...waypoints.slice(1)]);
          break;
        }
        case 'end': {
          if (waypoints.length === 0) setWaypoints([pos]);
          else setWaypoints([...waypoints.slice(0, -1), pos]);
          break;
        }
        case 'erase': {
          setWaypoints(waypoints.filter((wp) => wp.col !== col || wp.row !== row));
          break;
        }
      }
    },
    [editMode, waypoints, setWaypoints, tileSize, offsetX, offsetY, GRID_COLS, GRID_ROWS]
  );

  return (
    <div ref={containerRef} className="relative h-full flex-1 bg-[var(--arc-void-2)]">
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="absolute inset-0 cursor-crosshair"
        onClick={handleClick}
      />
    </div>
  );
}

export default MapEditorCanvas;
