import { useEffect, useRef } from 'react';
import { PATHS } from '@/data/gameData';
import type { PathConfig, GridPosition, Tile, TileType } from '@/types/game';
import { drawGrid } from '@/components/game/PathRenderer';

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

export const PathPreview = ({ 
  pathKey, 
  pathConfig, 
  size = 'normal',
  className = '',
}: { 
  pathKey?: string; 
  pathConfig?: PathConfig;
  size?: 'small' | 'normal' | 'large';
  className?: string;
}) => {
  const path = pathConfig || (pathKey ? PATHS[pathKey] : null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const gridCols = 15;
  const gridRows = 11;
  const cellSize = size === 'small' ? 16 : size === 'large' ? 32 : 24;
  const padding = size === 'small' ? 8 : size === 'large' ? 24 : 12; // 增加 large 的 padding 防止邊緣被裁切
  const w = gridCols * cellSize + padding * 2;
  const h = gridRows * cellSize + padding * 2;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !path) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, w, h);

    // 背景與暈影
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, '#1a1f2e');
    bgGrad.addColorStop(1, '#141925');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    const vignette = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.6);
    vignette.addColorStop(0, 'transparent');
    vignette.addColorStop(1, 'rgba(20, 25, 37, 0.5)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);

    const hasSegments = path.category === 'advanced' && path.segments && path.segments.length > 0;
    
    // 計算所有路徑格子
    const pathTiles = new Set<string>();
    if (hasSegments) {
      for (const segment of path.segments!) {
        const segTiles = generateWaypointTiles(segment.waypoints);
        segTiles.forEach(t => pathTiles.add(t));
      }
    } else if (path.waypoints) {
      const segTiles = generateWaypointTiles(path.waypoints);
      segTiles.forEach(t => pathTiles.add(t));
    }

    // 計算起點、終點、叉路點
    let startPos: GridPosition | undefined;
    const endPoints = new Set<string>();
    const forkPoints = new Set<string>();
    
    if (hasSegments) {
      const startSeg = path.segments!.find(s => s.id === path.startSegmentId) || path.segments![0];
      if (startSeg) startPos = startSeg.waypoints[0];
      
      for (const segment of path.segments!) {
        if (segment.next.length > 1) {
          const lastWp = segment.waypoints[segment.waypoints.length - 1];
          forkPoints.add(`${lastWp.col},${lastWp.row}`);
        } else if (segment.next.length === 0) {
          const lastWp = segment.waypoints[segment.waypoints.length - 1];
          endPoints.add(`${lastWp.col},${lastWp.row}`);
        }
      }
    } else if (path.waypoints && path.waypoints.length > 0) {
      startPos = path.waypoints[0];
      const endPos = path.waypoints[path.waypoints.length - 1];
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
    drawGrid(ctx, dummyGrid, cellSize, padding, padding);

  }, [path, size, cellSize, padding, w, h]);

  if (!path) return null;

  return (
    <canvas
      ref={canvasRef}
      width={w}
      height={h}
      className={`block ${className}`}
      style={{ 
        borderRadius: 0,
        width: '100%',
        height: 'auto',
        aspectRatio: `${w} / ${h}`,
      }}
    />
  );
};
