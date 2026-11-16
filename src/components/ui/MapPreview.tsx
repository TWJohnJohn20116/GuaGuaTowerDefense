import { useEffect, useRef } from 'react';
import type { MapInfo } from '@/components/scenes/encyclopedia/EncyclopediaTypes';
import { drawField } from '@/components/game/PathRenderer';
import { boundsOf } from '@/data/mapGeometry';
import type { PathConfig } from '@/types/game';

interface MapPreviewProps {
  map: MapInfo;
  width?: number;
  height?: number;
  className?: string;
}

/**
 * 選圖／百科用的地圖縮圖。
 *
 * 自由制之後不再「把 waypoints 膨脹成格子再逐格畫」——
 * 直接交給 PathRenderer.drawField 畫連續場地與路徑帶，跟遊戲內看到的是同一套渲染。
 */
export default function MapPreview({ map, width = 360, height = 264, className = '' }: MapPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const pathConfig: PathConfig = {
    name: map.name,
    description: map.description,
    difficulty: String(map.difficulty),
    waypoints: map.waypoints,
    segments: map.segments,
  };
  const bounds = boundsOf(pathConfig);
  // 預留邊距，讓路徑帶的圓角端點與起終點標記不會貼在縮圖邊緣
  const padding = 16;
  const cellSize = Math.min(
    (width - padding * 2) / bounds.width,
    (height - padding * 2) / bounds.height,
  );
  const offsetX = (width - bounds.width * cellSize) / 2;
  const offsetY = (height - bounds.height * cellSize) / 2;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);
    drawField(ctx, pathConfig, cellSize, offsetX, offsetY, { showTerrain: false });
    // pathConfig 每次 render 都是新物件，但它的內容只取決於 map；
    // 列 deps 會每輪重畫，所以只列真正會變的來源（TD-17 判定：非債）
  }, [map, width, height, cellSize, offsetX, offsetY]);

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
