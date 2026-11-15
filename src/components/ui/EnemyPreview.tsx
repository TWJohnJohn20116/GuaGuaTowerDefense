import { useRef, useEffect, useCallback, useMemo } from 'react';
import { drawEnemyModel } from '@/utils/enemyRenderer';
import { getEnemyData } from '@/store/gameStoreUtils';

/**
 * 敵人 Canvas 預覽元件 - 傳入 enemyId 即可顯示獨特敵人模型
 * 用於百科全書、教學、工具提示等 UI 場景
 */
const EnemyPreview = ({
  enemyId,
  color: colorOverride,
  size = 48,
  animate = false,
}: {
  enemyId: string;
  color?: string;
  size?: number;
  animate?: boolean;
}) => {
  const enemyData = useMemo(() => getEnemyData(enemyId), [enemyId]);
  const color = colorOverride || enemyData?.color || '#ef4444';

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(Date.now());

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);

    const cx = size / 2;
    const cy = size / 2;
    const radius = size * 0.32;

    drawEnemyModel(ctx, cx, cy, radius, enemyId, color, timeRef.current);
  }, [enemyId, color, size]);

  useEffect(() => {
    if (!animate) {
      timeRef.current = Date.now();
      draw();
      return;
    }
    let running = true;
    const loop = () => {
      if (!running) return;
      timeRef.current = Date.now();
      draw();
      animRef.current = requestAnimationFrame(loop);
    };
    loop();
    return () => { running = false; cancelAnimationFrame(animRef.current); };
  }, [animate, draw]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
      className="pointer-events-none"
    />
  );
};

export default EnemyPreview;
