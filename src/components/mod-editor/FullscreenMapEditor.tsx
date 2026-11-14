import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { GAME_CONSTANTS } from '@/data/gameData';
import type { CustomMapData, GridPosition, Tile } from '@/types/game';
import {
  PointerIcon, PencilIcon, TrashIcon, UndoIcon, RedoIcon, 
  RefreshIcon, PlayIcon, MapIcon, DocumentIcon, BoxIcon, PinIcon, CopyIcon,
} from '@/components/ui/Icons';
import { drawGrid as drawGameGrid } from '@/components/game/PathRenderer';
import { useTranslation } from '@/i18n';
import { fillTemplate } from '@/i18n/fileMetaExtraLabels';
import {
  mirrorWaypointsHorizontal,
  mirrorWaypointsVertical,
  mirrorCellsHorizontal,
  mirrorCellsVertical,
  appendOffsetPath,
  appendOffsetBlocked,
} from './mapEditorAdvancedTools';
import { Btn, Deck, Input, Rule, SegHead, Empty } from '@/components/hl';

// 編輯模式
type EditMode = 'select' | 'brush' | 'erase' | 'block';

// 歷史記錄
interface HistoryState {
  waypoints: GridPosition[];
  blockedCells: GridPosition[];
}

export const FullscreenMapEditor = ({
  map,
  onChange,
  onClose,
}: {
  map: CustomMapData;
  onChange: (map: CustomMapData) => void;
  onClose: () => void;
}) => {
  const { t } = useTranslation();
  const m = t.modEditorExt;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { GRID_COLS, GRID_ROWS } = GAME_CONSTANTS;
  
  // 狀態
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [mode, setMode] = useState<EditMode>('brush');
  const [hoverPos, setHoverPos] = useState<GridPosition | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);
  
  // 歷史記錄
  const [history, setHistory] = useState<HistoryState[]>([{
    waypoints: [...map.waypoints],
    blockedCells: [...(map.blockedCells ?? [])],
  }]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // 視圖設定
  const [showGrid, setShowGrid] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  // 移除 viewMode 狀態
  // const [viewMode, setViewMode] = useState<'editor' | 'game'>('game');
  const [previewTime, setPreviewTime] = useState(0);

  // 面板狀態
  const [activeTab, setActiveTab] = useState<'properties' | 'points' | 'history'>('properties');

  const tileSize = useMemo(() => {
    if (dimensions.width === 0) return 40;
    // 預留邊距給懸浮的 UI 面板 (左側工具列 100px，右側面板 350px，頂部 100px)
    const availableWidth = dimensions.width - 100 - 350; 
    const availableHeight = dimensions.height - 100;
    return Math.max(20, Math.min(
      Math.floor(availableWidth / GRID_COLS),
      Math.floor(availableHeight / GRID_ROWS)
    ));
  }, [dimensions, GRID_COLS, GRID_ROWS]);

  const offsetX = useMemo(() => {
    // 讓畫布偏向左側工具列和右側面板之間的中間，而不是整個螢幕的中間
    const leftPadding = 100;
    const rightPadding = 350;
    const availableWidth = dimensions.width - leftPadding - rightPadding;
    return leftPadding + Math.floor((availableWidth - GRID_COLS * tileSize) / 2);
  }, [dimensions, GRID_COLS, tileSize]);

  const offsetY = useMemo(() => {
    const topPadding = 80;
    const availableHeight = dimensions.height - topPadding;
    return topPadding + Math.floor((availableHeight - GRID_ROWS * tileSize) / 2);
  }, [dimensions, GRID_ROWS, tileSize]);

  // 視窗大小
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

  // 預覽動畫
  useEffect(() => {
    if (!showPreview) return;
    let animationFrame: number;
    let lastTime = performance.now();
    const loop = (time: number) => {
      const dt = time - lastTime;
      lastTime = time;
      setPreviewTime(prev => prev + dt * 0.001); // 1單位/秒
      animationFrame = requestAnimationFrame(loop);
    };
    animationFrame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrame);
  }, [showPreview]);

  // 歷史操作
  const pushHistory = useCallback((waypoints: GridPosition[], blockedCells?: GridPosition[]) => {
    const blocked = blockedCells ?? map.blockedCells ?? [];
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ waypoints: [...waypoints], blockedCells: [...blocked] });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    onChange({ ...map, waypoints, blockedCells: blocked });
  }, [history, historyIndex, map, onChange]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      onChange({ ...map, waypoints: [...history[newIndex].waypoints], blockedCells: [...history[newIndex].blockedCells] });
      setSelectedPointIndex(null);
    }
  }, [historyIndex, history, map, onChange]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      onChange({ ...map, waypoints: [...history[newIndex].waypoints], blockedCells: [...history[newIndex].blockedCells] });
      setSelectedPointIndex(null);
    }
  }, [historyIndex, history, map, onChange]);

  // 座標轉換
  const getGridPos = useCallback((e: React.MouseEvent | React.TouchEvent): GridPosition | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const x = clientX - rect.left - offsetX;
    const y = clientY - rect.top - offsetY;

    const col = Math.floor(x / tileSize);
    const row = Math.floor(y / tileSize);

    if (col >= 0 && col < GRID_COLS && row >= 0 && row < GRID_ROWS) {
      return { col, row };
    }
    return null;
  }, [offsetX, offsetY, tileSize, GRID_COLS, GRID_ROWS]);

  // 滑鼠事件
  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getGridPos(e);
    if (!pos) return;
    setIsDragging(true);

    const existingIndex = map.waypoints.findIndex(p => p.col === pos.col && p.row === pos.row);

    if (mode === 'select') {
      if (existingIndex !== -1) {
        setSelectedPointIndex(existingIndex);
      } else {
        setSelectedPointIndex(null);
      }
    } else if (mode === 'brush') {
      if (existingIndex === -1) {
        // 如果點擊了空白處，且有選中點，插入到選中點後面，否則加到最後
        const newWaypoints = [...map.waypoints];
        if (selectedPointIndex !== null && selectedPointIndex < newWaypoints.length) {
          newWaypoints.splice(selectedPointIndex + 1, 0, pos);
          setSelectedPointIndex(selectedPointIndex + 1);
        } else {
          newWaypoints.push(pos);
          setSelectedPointIndex(newWaypoints.length - 1);
        }
        pushHistory(newWaypoints);
      } else {
        setSelectedPointIndex(existingIndex);
      }
    } else if (mode === 'erase') {
      if (existingIndex !== -1) {
        const newWaypoints = map.waypoints.filter((_, i) => i !== existingIndex);
        pushHistory(newWaypoints);
        setSelectedPointIndex(null);
      }
    } else if (mode === 'block') {
      const onPath = map.waypoints.some((wp) => wp.col === pos.col && wp.row === pos.row);
      if (onPath) return;
      const blocked = [...(map.blockedCells ?? [])];
      const bIdx = blocked.findIndex((c) => c.col === pos.col && c.row === pos.row);
      if (bIdx === -1) blocked.push(pos);
      else blocked.splice(bIdx, 1);
      pushHistory(map.waypoints, blocked);
    }
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getGridPos(e);
    setHoverPos(pos);

    if (!isDragging || !pos) return;

    if (mode === 'brush') {
      const lastPoint = map.waypoints[selectedPointIndex ?? map.waypoints.length - 1];
      if (!lastPoint) return;
      
      // 避免重複點
      if (lastPoint.col === pos.col && lastPoint.row === pos.row) return;

      // 如果相鄰，直接加入
      const isAdjacent = Math.abs(lastPoint.col - pos.col) <= 1 && Math.abs(lastPoint.row - pos.row) <= 1;
      
      if (isAdjacent) {
        const existingIndex = map.waypoints.findIndex(p => p.col === pos.col && p.row === pos.row);
        if (existingIndex === -1) {
          const newWaypoints = [...map.waypoints];
          if (selectedPointIndex !== null) {
            newWaypoints.splice(selectedPointIndex + 1, 0, pos);
            onChange({ ...map, waypoints: newWaypoints });
            setSelectedPointIndex(selectedPointIndex + 1);
          } else {
            newWaypoints.push(pos);
            onChange({ ...map, waypoints: newWaypoints });
            setSelectedPointIndex(newWaypoints.length - 1);
          }
        }
      }
    } else if (mode === 'select' && selectedPointIndex !== null) {
      // 拖曳移動點
      const existingIndex = map.waypoints.findIndex(p => p.col === pos.col && p.row === pos.row);
      if (existingIndex === -1) {
        const newWaypoints = [...map.waypoints];
        newWaypoints[selectedPointIndex] = pos;
        onChange({ ...map, waypoints: newWaypoints });
      }
    } else if (mode === 'erase') {
      const existingIndex = map.waypoints.findIndex(p => p.col === pos.col && p.row === pos.row);
      if (existingIndex !== -1) {
        const newWaypoints = map.waypoints.filter((_, i) => i !== existingIndex);
        onChange({ ...map, waypoints: newWaypoints });
        setSelectedPointIndex(null);
      }
    } else if (mode === 'block') {
      const onPath = map.waypoints.some((wp) => wp.col === pos.col && wp.row === pos.row);
      if (onPath) return;
      const blocked = [...(map.blockedCells ?? [])];
      const bIdx = blocked.findIndex((c) => c.col === pos.col && c.row === pos.row);
      if (bIdx === -1) blocked.push(pos);
      else blocked.splice(bIdx, 1);
      onChange({ ...map, blockedCells: blocked });
    }
  };

  const handlePointerUp = () => {
    if (isDragging) {
      setIsDragging(false);
      // 記錄拖曳結束後的狀態
      const lastHistory = history[historyIndex];
      const wpChanged = JSON.stringify(lastHistory.waypoints) !== JSON.stringify(map.waypoints);
      const blockChanged = JSON.stringify(lastHistory.blockedCells) !== JSON.stringify(map.blockedCells ?? []);
      if (wpChanged || blockChanged) {
        pushHistory(map.waypoints, map.blockedCells);
      }
    }
  };

  // 繪製
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const style = getComputedStyle(document.documentElement);
    const colorBg = style.getPropertyValue('--color-bg').trim() || '#2e3440';
    const colorBorder = style.getPropertyValue('--color-border').trim() || '#4c566a';

    // 繪製背景底板 (現在只有一種真實模擬模式)
    ctx.fillStyle = colorBg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 生成假 grid 模擬真實遊戲畫面
    const dummyGrid: Tile[][] = Array.from({ length: GRID_ROWS }, (_, r) => 
      Array.from({ length: GRID_COLS }, (_, c) => ({ 
        type: 'empty', 
        row: r, 
        col: c,
        towerId: null
      } as Tile))
    );

      (map.blockedCells ?? []).forEach((cell) => {
        if (cell.row >= 0 && cell.row < GRID_ROWS && cell.col >= 0 && cell.col < GRID_COLS) {
          ctx.fillStyle = 'rgba(32, 37, 46, 0.9)';
          ctx.fillRect(
            offsetX + cell.col * tileSize + 1,
            offsetY + cell.row * tileSize + 1,
            tileSize - 2,
            tileSize - 2,
          );
          ctx.strokeStyle = 'rgba(120, 132, 150, 0.35)';
          ctx.lineWidth = 1;
          ctx.strokeRect(
            offsetX + cell.col * tileSize + 1,
            offsetY + cell.row * tileSize + 1,
            tileSize - 2,
            tileSize - 2,
          );
        }
      });

      // 建立完整的路徑連線
      if (map.waypoints.length > 1) {
        // 先建立一個紀錄連通狀態的網格
        const pathConnections: boolean[][] = Array.from({ length: GRID_ROWS }, () => 
          Array(GRID_COLS).fill(false)
        );

        // 標記所有節點
        map.waypoints.forEach(wp => {
          if (wp.row >= 0 && wp.row < GRID_ROWS && wp.col >= 0 && wp.col < GRID_COLS) {
            pathConnections[wp.row][wp.col] = true;
          }
        });

        // 根據節點順序，將中間經過的格子也標記為路徑
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

        // 更新 dummyGrid 的類型
        for (let r = 0; r < GRID_ROWS; r++) {
          for (let c = 0; c < GRID_COLS; c++) {
            if (pathConnections[r][c]) {
              dummyGrid[r][c].type = 'path';
            }
          }
        }
      }

      // 覆蓋起點與終點標記
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

      drawGameGrid(ctx, dummyGrid, tileSize, offsetX, offsetY);

      // 遊戲模式的網格
      if (showGrid) {
        ctx.strokeStyle = colorBorder; 
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.3;
        for (let i = 0; i <= GRID_ROWS; i++) {
          ctx.beginPath();
          ctx.moveTo(offsetX, offsetY + i * tileSize);
          ctx.lineTo(offsetX + GRID_COLS * tileSize, offsetY + i * tileSize);
          ctx.stroke();
        }
        for (let i = 0; i <= GRID_COLS; i++) {
          ctx.beginPath();
          ctx.moveTo(offsetX + i * tileSize, offsetY);
          ctx.lineTo(offsetX + i * tileSize, offsetY + GRID_ROWS * tileSize);
          ctx.stroke();
        }
        ctx.globalAlpha = 1.0;
      }

      // 繪製 Hover (遊戲模式也要有提示)
      if (hoverPos && hoverPos.col >= 0 && hoverPos.col < GRID_COLS && hoverPos.row >= 0 && hoverPos.row < GRID_ROWS) {
        const hoverColor = mode === 'erase'
          ? 'rgba(255, 75, 62, 0.35)'
          : mode === 'block'
            ? 'rgba(236, 239, 242, 0.14)'
            : 'rgba(217, 255, 63, 0.24)';
        ctx.fillStyle = hoverColor;
        ctx.fillRect(
          offsetX + hoverPos.col * tileSize,
          offsetY + hoverPos.row * tileSize,
          tileSize,
          tileSize
        );
      }

      // 繪製選取的節點與數字標記
      map.waypoints.forEach((wp, i) => {
        const x = offsetX + wp.col * tileSize + tileSize / 2;
        const y = offsetY + wp.row * tileSize + tileSize / 2;
        const isSelected = i === selectedPointIndex;

        // 如果被選取，畫一個 1px 訊號色外框（不用填充光暈）
        if (isSelected) {
          const r = tileSize * 0.4;
          ctx.lineWidth = 1;
          ctx.strokeStyle = '#ffd447';
          ctx.strokeRect(x - r, y - r, r * 2, r * 2);
        }

        // 畫數字標記
        ctx.fillStyle = '#eceff2';
        ctx.font = `bold ${tileSize * 0.3}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${i + 1}`, x, y);
      });

      // 繪製預覽流動：方塊標記，不發光
    if (showPreview && map.waypoints.length > 1) {
      const totalLen = map.waypoints.length - 1;
      // 計算多個流動物件
      const count = Math.max(3, Math.floor(totalLen / 2));
      
      ctx.fillStyle = '#ffd447';
      
      for (let i = 0; i < count; i++) {
        const offset = (previewTime + i * (totalLen / count)) % totalLen;
        const segment = Math.floor(offset);
        const t = offset - segment;
        
        if (segment < map.waypoints.length - 1) {
          const p1 = map.waypoints[segment];
          const p2 = map.waypoints[segment + 1];
          
          const x = offsetX + (p1.col + (p2.col - p1.col) * t) * tileSize + tileSize / 2;
          const y = offsetY + (p1.row + (p2.row - p1.row) * t) * tileSize + tileSize / 2;
          const half = Math.max(2, tileSize * 0.15) / 2;
          
          ctx.fillRect(x - half, y - half, half * 2, half * 2);
        }
      }
    }

  }, [dimensions, map.waypoints, map.blockedCells, offsetX, offsetY, tileSize, GRID_COLS, GRID_ROWS, showGrid, showPreview, previewTime, mode, hoverPos, selectedPointIndex]);

  // 工具列按鈕組件
  interface ToolBtnProps {
    icon: React.ComponentType<{ className?: string }>;
    active?: boolean;
    onClick: () => void;
    tooltip: string;
  }
  const ToolBtn = ({ icon: Icon, active, onClick, tooltip }: ToolBtnProps) => (
    <Btn
      size="sm"
      variant="ghost"
      onClick={onClick}
      title={tooltip}
      aria-label={tooltip}
      aria-pressed={!!active}
      className={`h-9 w-9 justify-center px-0 ${
        active
          ? 'border-[var(--arc-gold)] bg-[var(--arc-gold-veil)] text-[var(--arc-gold)]'
          : 'text-[var(--arc-ink-2)]'
      }`}
      icon={<Icon className="h-4 w-4" />}
    />
  );

  const tabBtn = (id: 'properties' | 'points' | 'history', label: string) => (
    <Btn
      key={id}
      size="sm"
      variant="ghost"
      onClick={() => setActiveTab(id)}
      aria-pressed={activeTab === id}
      className={`h-9 flex-1 justify-center border-r border-[var(--cn-line-soft)] last:border-r-0 ${
        activeTab === id
          ? 'bg-[var(--arc-gold-veil)] text-[var(--arc-gold)]'
          : 'text-[var(--arc-ink-3)] hover:text-[var(--arc-ink)]'
      }`}
    >
      {label}
    </Btn>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex overflow-hidden bg-[var(--arc-void)] font-sans"
    >
      {/* 畫布與事件層 (移到最底層) */}
      <div 
        ref={containerRef}
        className="absolute inset-0 z-0 cursor-crosshair touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          className="block"
        />
      </div>

      {/* 懸浮左側工具列：方塊按鈕，選中＝訊號色 */}
      <div className="pointer-events-auto absolute left-4 top-1/2 z-50 flex w-16 -translate-y-1/2 flex-col items-center gap-1 arc-panel py-2">
        <div className="mb-1 flex h-9 w-9 items-center justify-center border-[3px] border-[var(--cn-line-soft)] text-[var(--arc-ink-3)]">
          <MapIcon className="h-4 w-4" />
        </div>
        
        <div className="flex w-full flex-col items-center gap-1 px-2">
          <ToolBtn icon={PointerIcon} active={mode === 'select'} onClick={() => setMode('select')} tooltip={m.mapFsToolSelect} />
          <ToolBtn icon={PencilIcon} active={mode === 'brush'} onClick={() => setMode('brush')} tooltip={m.mapFsToolBrush} />
          <ToolBtn icon={BoxIcon} active={mode === 'block'} onClick={() => setMode('block')} tooltip={m.mapFsToolBlock} />
          <ToolBtn icon={TrashIcon} active={mode === 'erase'} onClick={() => setMode('erase')} tooltip={m.mapFsToolErase} />
        </div>

        <Rule className="my-1 w-8" />

        <div className="flex w-full flex-col items-center gap-1 px-2">
          <ToolBtn icon={UndoIcon} onClick={undo} tooltip={m.mapFsToolUndo} active={false} />
          <ToolBtn icon={RedoIcon} onClick={redo} tooltip={m.mapFsToolRedo} active={false} />
          <ToolBtn icon={RefreshIcon} onClick={() => {
            onChange({ ...map, waypoints: [...map.waypoints].reverse() });
            pushHistory([...map.waypoints].reverse());
          }} tooltip={m.mapFsToolReverse} active={false} />
          <ToolBtn icon={CopyIcon} onClick={() => {
            const waypoints = appendOffsetPath(map.waypoints, 0, 1, GRID_COLS, GRID_ROWS);
            const blocked = appendOffsetBlocked(map.blockedCells ?? [], 0, 1, GRID_COLS, GRID_ROWS);
            pushHistory(waypoints, blocked);
          }} tooltip={m.mapFsToolDupBlocked} active={false} />
          <ToolBtn icon={DocumentIcon} onClick={() => {
            const waypoints = mirrorWaypointsHorizontal(map.waypoints, GRID_COLS);
            const blocked = mirrorCellsHorizontal(map.blockedCells ?? [], GRID_COLS);
            pushHistory(waypoints, blocked);
          }} tooltip={m.mapFsToolMirrorHBlocked} active={false} />
          <ToolBtn icon={RefreshIcon} onClick={() => {
            const waypoints = mirrorWaypointsVertical(map.waypoints, GRID_ROWS);
            const blocked = mirrorCellsVertical(map.blockedCells ?? [], GRID_ROWS);
            pushHistory(waypoints, blocked);
          }} tooltip={m.mapFsToolMirrorVBlocked} active={false} />
          <ToolBtn icon={BoxIcon} onClick={() => {
            pushHistory(map.waypoints, []);
          }} tooltip={m.mapFsToolClearBlocks} active={false} />
          <ToolBtn icon={TrashIcon} onClick={() => pushHistory([], [])} tooltip={m.mapFsToolClear} active={false} />
        </div>

        <Rule className="my-1 w-8" />

        <div className="flex w-full flex-col items-center gap-1 px-2">
          <ToolBtn icon={PlayIcon} active={showPreview} onClick={() => setShowPreview(!showPreview)} tooltip={m.mapFsToggleFlow} />
          <ToolBtn icon={DocumentIcon} active={showGrid} onClick={() => setShowGrid(!showGrid)} tooltip={m.mapFsToggleGrid} />
        </div>
      </div>

      {/* 頂部操作區 */}
      <div className="pointer-events-none absolute left-24 right-[340px] top-4 z-50 flex items-center justify-between gap-3">
        <Deck className="pointer-events-auto flex h-11 items-center gap-3 px-3">
          <span className="max-w-[240px] truncate text-[13.5px] font-medium text-[var(--arc-ink)]">
            {map.name || m.unnamedMap}
          </span>
          <span className="h-5 w-px bg-[var(--arc-line)]" />
          <span className="font-mono text-[10px] tabular-nums text-[var(--arc-ink-3)]">
            {fillTemplate(m.mapFsNodeCount, { count: String(map.waypoints.length) })}
          </span>
        </Deck>
        
        <div className="pointer-events-auto flex items-center gap-1.5">
          <Btn size="sm" variant="line" onClick={onClose}>
            {m.mapFsExit}
          </Btn>
          <Btn size="sm" variant="signal" onClick={onClose}>
            {m.mapFsSaveReturn}
          </Btn>
        </div>
      </div>

      {/* 懸浮右側面板 */}
      <div className="pointer-events-auto absolute bottom-4 right-4 top-20 z-50 flex w-80 flex-col overflow-hidden arc-panel">
        <div className="flex shrink-0 border-b border-[var(--cn-line-soft)]">
          {tabBtn('properties', m.mapFsTabProps)}
          {tabBtn('points', m.mapFsTabPoints)}
          {tabBtn('history', m.mapFsTabHistory)}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {activeTab === 'properties' && (
            <div className="space-y-4">
              <label className="flex flex-col gap-1.5">
                <span className="arc-label">{m.mapFsMapNameLabel}</span>
                <Input
                  type="text"
                  value={map.name}
                  onChange={e => onChange({ ...map, name: e.target.value })}
                  placeholder={m.mapFsNamePh}
                />
              </label>
              
              <label className="flex flex-col gap-1.5">
                <span className="arc-label">{m.mapFsMapDescLabel}</span>
                <textarea
                  value={map.description}
                  onChange={e => onChange({ ...map, description: e.target.value })}
                  className="h-24 w-full resize-none border-[3px] border-[var(--cn-line-soft)] bg-[var(--arc-void-2)] px-2.5 py-2 text-[12.5px] leading-snug text-[var(--arc-ink)] outline-none transition-colors placeholder:text-[var(--arc-ink-4)] focus:border-[var(--arc-gold)]"
                  placeholder={m.mapDescPh}
                />
              </label>

              <div>
                <SegHead label={m.mapFsDiffLabel} className="mb-2" />
                <div className="grid grid-cols-2 gap-1">
                  {[
                    { id: 'veryEasy', label: m.diffVeryEasy },
                    { id: 'easy', label: m.diffEasy },
                    { id: 'medium', label: m.diffMedium },
                    { id: 'hard', label: m.diffHard }
                  ].map(diff => (
                    <Btn
                      key={diff.id}
                      size="sm"
                      variant="line"
                      block
                      onClick={() => onChange({ ...map, difficulty: diff.id })}
                      aria-pressed={map.difficulty === diff.id}
                      className={
                        map.difficulty === diff.id
                          ? 'border-[var(--arc-gold)] bg-[var(--arc-gold-veil)] text-[var(--arc-gold)]'
                          : undefined
                      }
                    >
                      {diff.label}
                    </Btn>
                  ))}
                </div>
              </div>

              <div className="border border-[rgba(255,182,39,0.38)] p-3">
                <h4 className="mb-1.5 flex items-center gap-1.5 font-mono text-[10px] tracking-[0.08em] text-[var(--arc-caution)]">
                  <DocumentIcon className="h-3 w-3" /> {m.mapFsEditTipsTitle}
                </h4>
                <ul className="list-disc space-y-1 pl-4 text-[10.5px] leading-snug text-[rgba(255,182,39,0.78)]">
                  <li>{m.mapFsTipBrush}</li>
                  <li>{m.mapFsTipConnect}</li>
                  <li>{m.mapFsTipBlock}</li>
                  <li>{m.mapFsTipStartEnd}</li>
                  <li>{m.mapFsTipMinNodes}</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'points' && (
            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] text-[var(--arc-ink-3)]">
                  {fillTemplate(m.mapFsPointsTotal, { count: String(map.waypoints.length) })}
                </span>
                <Btn
                  size="sm"
                  variant="danger"
                  onClick={() => {
                    onChange({ ...map, waypoints: [] });
                    pushHistory([], map.blockedCells);
                  }}
                >
                  {m.mapFsClearAll}
                </Btn>
              </div>
              
              {map.waypoints.length === 0 ? (
                <Empty title={m.mapFsNoPoints} hint={m.mapFsNoPointsHint} />
              ) : (
                <div className="border-[3px] border-[var(--cn-line-soft)]">
                  {selectedPointIndex !== null && (
                    <div className="flex gap-1 border-b border-[var(--cn-line-soft)] p-1.5">
                      <Btn
                        size="sm"
                        variant="line"
                        block
                        className="text-[var(--arc-vital)]"
                        disabled={selectedPointIndex === 0}
                        onClick={() => {
                          const newWaypoints = [...map.waypoints];
                          const [pt] = newWaypoints.splice(selectedPointIndex!, 1);
                          newWaypoints.unshift(pt);
                          pushHistory(newWaypoints);
                          setSelectedPointIndex(0);
                        }}
                        icon={<PlayIcon className="h-3 w-3" />}
                      >
                        {m.mapFsSetStart}
                      </Btn>
                      <Btn
                        size="sm"
                        variant="line"
                        block
                        className="text-[var(--arc-alert)]"
                        disabled={selectedPointIndex === map.waypoints.length - 1}
                        onClick={() => {
                          const newWaypoints = [...map.waypoints];
                          const [pt] = newWaypoints.splice(selectedPointIndex!, 1);
                          newWaypoints.push(pt);
                          pushHistory(newWaypoints);
                          setSelectedPointIndex(newWaypoints.length - 1);
                        }}
                        icon={<PinIcon className="h-3 w-3" />}
                      >
                        {m.mapFsSetEnd}
                      </Btn>
                    </div>
                  )}
                  {map.waypoints.map((wp, i) => (
                    <div 
                      key={i}
                      onClick={() => {
                        setMode('select');
                        setSelectedPointIndex(i);
                      }}
                      className={`flex cursor-pointer items-center justify-between gap-2 border-b border-[var(--cn-line-soft)] px-2 py-1.5 transition-colors last:border-b-0 ${
                        selectedPointIndex === i ? 'bg-[var(--arc-gold-veil)]' : 'hover:bg-[var(--arc-deck-2)]'
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center border font-mono text-[10px] tabular-nums ${
                            i === 0
                              ? 'border-[rgba(53,224,138,0.5)] text-[var(--arc-vital)]'
                              : i === map.waypoints.length - 1
                                ? 'border-[rgba(255,61,113,0.5)] text-[var(--arc-alert)]'
                                : 'border-[var(--arc-line-strong)] text-[var(--arc-ink-3)]'
                          }`}
                        >
                          {i + 1}
                        </span>
                        <span className="truncate font-mono text-[11px] tabular-nums text-[var(--arc-ink-2)]">
                          {wp.col}, {wp.row}
                        </span>
                      </div>
                      <Btn
                        size="sm"
                        variant="ghost"
                        className="text-[var(--arc-ink-3)] hover:text-[var(--arc-alert)]"
                        onClick={(e) => {
                          e.stopPropagation();
                          const newWaypoints = map.waypoints.filter((_, idx) => idx !== i);
                          onChange({ ...map, waypoints: newWaypoints });
                          pushHistory(newWaypoints);
                          if (selectedPointIndex === i) setSelectedPointIndex(null);
                        }}
                        icon={<TrashIcon className="h-3 w-3" />}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="arc-label">{m.mapFsHistLabel}</span>
                <span className="font-mono text-[10px] tabular-nums text-[var(--arc-ink-3)]">
                  {historyIndex + 1} / {history.length}
                </span>
              </div>
              
              <div className="border-[3px] border-[var(--cn-line-soft)]">
                {history.map((h, i) => (
                  <div 
                    key={i}
                    onClick={() => {
                      setHistoryIndex(i);
                      onChange({ ...map, waypoints: [...h.waypoints], blockedCells: [...h.blockedCells] });
                      setSelectedPointIndex(null);
                    }}
                    className={`flex cursor-pointer items-center gap-2 border-b border-[var(--cn-line-soft)] px-2 py-1.5 transition-colors last:border-b-0 ${
                      i === historyIndex
                        ? 'bg-[var(--arc-gold-veil)] text-[var(--arc-gold)]'
                        : i > historyIndex
                          ? 'text-[var(--arc-ink-4)]'
                          : 'text-[var(--arc-ink-2)] hover:bg-[var(--arc-deck-2)]'
                    }`}
                  >
                    <span
                      className={`block h-1.5 w-1.5 shrink-0 ${
                        i === historyIndex
                          ? 'bg-[var(--arc-gold)]'
                          : i > historyIndex
                            ? 'bg-[var(--arc-line-strong)]'
                            : 'bg-[var(--arc-ink-4)]'
                      }`}
                    />
                    <span className="truncate text-[12px]">
                      {i === 0 ? m.mapFsHistInitial : fillTemplate(m.mapFsHistEdit, { count: h.waypoints.length })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
