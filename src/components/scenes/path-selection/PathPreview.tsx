import { useEffect, useRef } from 'react';
import { PATHS } from '@/data/gameData';
import type { PathConfig } from '@/types/game';
import { boundsOf, pathPolylines, pathWidthOf } from '@/data/mapGeometry';

/**
 * 選圖頁的路徑縮圖。
 *
 * 舊版把 waypoints 膨脹成格子、建一張 dummyGrid 再交給 drawGrid；
 * 自由制沒有格子，這裡改成直接沿折線描帶（深色底 + 發光路徑 + 起終點）。
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
  const padding = size === 'small' ? 8 : size === 'large' ? 24 : 12;
  const w = bounds.width * cellSize + padding * 2;
  const h = bounds.height * cellSize + padding * 2;

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

    const lines = pathPolylines(path);
    const bandWidth = Math.max(3, pathWidthOf(path) * cellSize);

    // 路徑帶：外描邊 + 內填，圓角接合
    for (const line of lines) {
      if (line.length < 2) continue;
      const trace = () => {
        ctx.beginPath();
        ctx.moveTo(padding + line[0].col * cellSize, padding + line[0].row * cellSize);
        for (let i = 1; i < line.length; i++) {
          ctx.lineTo(padding + line[i].col * cellSize, padding + line[i].row * cellSize);
        }
      };
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      trace();
      ctx.lineWidth = bandWidth + 3;
      ctx.strokeStyle = 'rgba(8, 12, 20, 0.9)';
      ctx.stroke();
      trace();
      ctx.lineWidth = bandWidth;
      ctx.strokeStyle = '#3f5a7a';
      ctx.stroke();
      trace();
      ctx.lineWidth = Math.max(1, bandWidth * 0.22);
      ctx.strokeStyle = 'rgba(147, 197, 253, 0.55)';
      ctx.stroke();
    }

    // 起終點
    for (const line of lines) {
      if (line.length < 2) continue;
      const first = line[0];
      const last = line[line.length - 1];
      ctx.beginPath();
      ctx.arc(padding + first.col * cellSize, padding + first.row * cellSize, cellSize * 0.32, 0, Math.PI * 2);
      ctx.fillStyle = '#34d399';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(padding + last.col * cellSize, padding + last.row * cellSize, cellSize * 0.32, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444';
      ctx.fill();
    }
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
