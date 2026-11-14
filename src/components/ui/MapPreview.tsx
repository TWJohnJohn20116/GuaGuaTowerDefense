import { useEffect, useRef } from 'react';
import type { MapInfo } from '@/components/scenes/encyclopedia/EncyclopediaTypes';
import { drawGrid } from '@/components/game/PathRenderer';
import type { Tile, TileType, GridPosition } from '@/types/game';

interface MapPreviewProps {
  map: MapInfo;
  width?: number;
  height?: number;
  className?: string;
}

const generateWaypointTiles = (waypoints: GridPosition[]): Set<string> => {
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
};

export default function MapPreview({ map, width = 360, height = 264, className = '' }: MapPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const gridRows = 11;
  const gridCols = 15;
  const cellSize = Math.min(width / gridCols, height / gridRows);
  
  // 置中偏移
  const offsetX = (width - gridCols * cellSize) / 2;
  const offsetY = (height - gridRows * cellSize) / 2;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空背景
    ctx.clearRect(0, 0, width, height);

    const hasSegments = map.segments && map.segments.length > 0;
    
    // 計算所有路徑格子
    const pathTiles = new Set<string>();
    if (hasSegments) {
      for (const segment of map.segments!) {
        const segTiles = generateWaypointTiles(segment.waypoints);
        segTiles.forEach(t => pathTiles.add(t));
      }
    } else {
      const segTiles = generateWaypointTiles(map.waypoints);
      segTiles.forEach(t => pathTiles.add(t));
    }

    // 計算起點、終點、叉路點
    let startPos: GridPosition | undefined;
    const endPoints = new Set<string>();
    const forkPoints = new Set<string>();
    
    if (hasSegments) {
      const startSeg = map.segments![0];
      if (startSeg) startPos = startSeg.waypoints[0];
      
      for (const segment of map.segments!) {
        if (segment.next.length > 1) {
          const lastWp = segment.waypoints[segment.waypoints.length - 1];
          forkPoints.add(`${lastWp.col},${lastWp.row}`);
        } else if (segment.next.length === 0) {
          const lastWp = segment.waypoints[segment.waypoints.length - 1];
          endPoints.add(`${lastWp.col},${lastWp.row}`);
        }
      }
    } else if (map.waypoints.length > 0) {
      startPos = map.waypoints[0];
      const endPos = map.waypoints[map.waypoints.length - 1];
      if (endPos) endPoints.add(`${endPos.col},${endPos.row}`);
    }

    // 建立 dummyGrid
    const dummyGrid: Tile[][] = [];
    for (let row = 0; row < gridRows; row++) {
      const rowTiles: Tile[] = [];
      for (let col = 0; col < gridCols; col++) {
        let type: TileType = 'empty';
        const key = `${col},${row}`;
        
        if (pathTiles.has(key)) {
          if (startPos && col === startPos.col && row === startPos.row) {
            type = 'start';
          } else if (endPoints.has(key)) {
            type = 'end';
          } else if (forkPoints.has(key)) {
            type = 'fork';
          } else {
            type = 'path';
          }
        }
        
        rowTiles.push({ type, row, col, towerId: null });
      }
      dummyGrid.push(rowTiles);
    }

    // 繪製與遊戲內一致的路徑
    drawGrid(ctx, dummyGrid, cellSize, offsetX, offsetY);

  }, [map, width, height, gridCols, gridRows, cellSize, offsetX, offsetY]);

  return (
    <div className={`overflow-hidden bg-[#0a0a0c] ${className}`}>
      <canvas 
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full h-full"
      />
    </div>
  );
}
