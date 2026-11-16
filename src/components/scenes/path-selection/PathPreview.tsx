import { useEffect, useRef } from 'react';
import { PATHS } from '@/data/gameData';
import type { PathConfig } from '@/types/game';
import { boundsOf } from '@/data/mapGeometry';
import { drawField } from '@/components/game/PathRenderer';

/**
 * 選圖頁的路徑縮圖。
 *
 * 這裡刻意直接呼叫遊戲本體的 `drawField`：預覽就該是「進去之後會看到的樣子」。
 * 舊版（自由化之前）自己畫深色底＋固定藍灰路徑，跟遊戲內的奶油場地與主題色路徑
 * 是兩套視覺，玩家選圖時看到的和實際進場不同——那是不一致，不是風格。
 */
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

  const bounds = boundsOf(path);
  const cellSize = size === 'small' ? 16 : size === 'large' ? 32 : 24;
  // 邊距至少一格：路徑帶半寬約 0.45 格，留一格才不會貼邊被誤認為裁切
  const padding = cellSize;
  const w = bounds.width * cellSize + padding * 2;
  const h = bounds.height * cellSize + padding * 2;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !path) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, w, h);
    // 與遊戲內同一套渲染：場地色、路徑寬度、起終點標記全部一致
    drawField(ctx, path, cellSize, padding, padding, { showTerrain: false });
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
