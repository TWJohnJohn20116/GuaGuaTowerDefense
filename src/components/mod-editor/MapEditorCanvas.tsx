import { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { GridPosition } from '@/types/game';

const GRID_COLS = 15;
const GRID_ROWS = 11;

/* HARDLINE 畫布配色：底 + 1px 格線 + 三種狀態色（訊號 / 生命 / 危險）。 */
const C = {
  bg: '#080b0f',
  empty: '#12151b',
  path: '#2b3441',
  start: '#12301f',
  end: '#301614',
  hoverDefault: 'rgba(217, 255, 63, 0.16)',
  hoverStart: 'rgba(56, 224, 143, 0.24)',
  hoverEnd: 'rgba(255, 75, 62, 0.24)',
  hoverErase: 'rgba(255, 75, 62, 0.16)',
  startMark: '#38e08f',
  endMark: '#ff4b3e',
  linkLine: 'rgba(217, 255, 63, 0.32)',
  pointStart: '#38e08f',
  pointEnd: '#ff4b3e',
  pointMid: '#6fa8ff',
  pointEdge: '#06070a',
  pointIndex: '#eceff2',
} as const;

export type PathCell = {
  col: number;
  row: number;
  type: 'empty' | 'path' | 'start' | 'end';
};

export const MapEditorCanvas = ({
  pathCells,
  onCellClick,
  currentTool,
  waypoints,
}: {
  pathCells: PathCell[][];
  onCellClick: (col: number, row: number) => void;
  currentTool: 'path' | 'start' | 'end' | 'eraser';
  waypoints: GridPosition[];
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions] = useState({ width: 600, height: 440 });
  const [hoveredCell, setHoveredCell] = useState<{ col: number; row: number } | null>(null);
  
  const tileSize = Math.min(
    (dimensions.width - 20) / GRID_COLS,
    (dimensions.height - 20) / GRID_ROWS
  );
  
  const gridWidth = tileSize * GRID_COLS;
  const gridHeight = tileSize * GRID_ROWS;
  const offsetX = (dimensions.width - gridWidth) / 2;
  const offsetY = (dimensions.height - gridHeight) / 2;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 清除畫布
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 繪製格子
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const x = offsetX + col * tileSize;
        const y = offsetY + row * tileSize;
        const cell = pathCells[row]?.[col];
        const cellType = cell?.type || 'empty';
        
        // 底色
        let fillColor: string = C.empty;
        if (cellType === 'path') fillColor = C.path;
        else if (cellType === 'start') fillColor = C.start;
        else if (cellType === 'end') fillColor = C.end;
        
        ctx.fillStyle = fillColor;
        ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);
        
        // 懸停效果
        if (hoveredCell && hoveredCell.col === col && hoveredCell.row === row) {
          let hoverColor: string = C.hoverDefault;
          if (currentTool === 'start') hoverColor = C.hoverStart;
          else if (currentTool === 'end') hoverColor = C.hoverEnd;
          else if (currentTool === 'eraser') hoverColor = C.hoverErase;
          
          ctx.fillStyle = hoverColor;
          ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);
        }
        
        // 繪製標記
        if (cellType === 'start') {
          ctx.fillStyle = C.startMark;
          ctx.font = `bold ${tileSize * 0.5}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('S', x + tileSize / 2, y + tileSize / 2);
        } else if (cellType === 'end') {
          ctx.fillStyle = C.endMark;
          ctx.font = `bold ${tileSize * 0.5}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('E', x + tileSize / 2, y + tileSize / 2);
        }
      }
    }
    
    // 繪製路徑點連線（1px 虛線，不發光）
    if (waypoints.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = C.linkLine;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      
      const firstPoint = waypoints[0];
      ctx.moveTo(
        offsetX + firstPoint.col * tileSize + tileSize / 2,
        offsetY + firstPoint.row * tileSize + tileSize / 2
      );
      
      for (let i = 1; i < waypoints.length; i++) {
        const point = waypoints[i];
        ctx.lineTo(
          offsetX + point.col * tileSize + tileSize / 2,
          offsetY + point.row * tileSize + tileSize / 2
        );
      }
      
      ctx.stroke();
      ctx.setLineDash([]);
    }
    
    // 繪製路徑點（方塊標記，不是圓點）
    waypoints.forEach((point, index) => {
      const x = offsetX + point.col * tileSize + tileSize / 2;
      const y = offsetY + point.row * tileSize + tileSize / 2;
      const half = tileSize * 0.15;
      
      ctx.fillStyle = index === 0 ? C.pointStart : index === waypoints.length - 1 ? C.pointEnd : C.pointMid;
      ctx.fillRect(x - half, y - half, half * 2, half * 2);
      ctx.strokeStyle = C.pointEdge;
      ctx.lineWidth = 1;
      ctx.strokeRect(x - half, y - half, half * 2, half * 2);
      
      // 順序編號
      ctx.fillStyle = C.pointIndex;
      ctx.font = `bold ${tileSize * 0.2}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${index + 1}`, x, y);
    });
    
  }, [pathCells, hoveredCell, currentTool, waypoints, tileSize, offsetX, offsetY]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - offsetX;
    const y = e.clientY - rect.top - offsetY;
    
    const col = Math.floor(x / tileSize);
    const row = Math.floor(y / tileSize);
    
    if (col >= 0 && col < GRID_COLS && row >= 0 && row < GRID_ROWS) {
      setHoveredCell({ col, row });
    } else {
      setHoveredCell(null);
    }
  }, [tileSize, offsetX, offsetY]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - offsetX;
    const y = e.clientY - rect.top - offsetY;
    
    const col = Math.floor(x / tileSize);
    const row = Math.floor(y / tileSize);
    
    if (col >= 0 && col < GRID_COLS && row >= 0 && row < GRID_ROWS) {
      onCellClick(col, row);
    }
  }, [tileSize, offsetX, offsetY, onCellClick]);

  return (
    <motion.div
      className="relative overflow-hidden border border-[var(--hl-line)] bg-[var(--hl-void-2)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredCell(null)}
        onClick={handleClick}
        className="block cursor-crosshair"
      />
      
      {/* 工具提示：方框 + mono，不用圓角標籤 */}
      <div className="pointer-events-none absolute bottom-2 left-2">
        <span className="border border-[var(--hl-line)] bg-[var(--hl-void)] px-2 py-1 font-mono text-[10px] text-[var(--hl-ink-3)]">
          點擊格子放置路徑 | 拖曳連續繪製
        </span>
      </div>
    </motion.div>
  );
};
