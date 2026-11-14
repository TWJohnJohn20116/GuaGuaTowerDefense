import { useRef, useEffect, useCallback, useMemo } from 'react';
import { drawTowerModel } from '@/components/game/TowerModels';
import { TOWER_DATA } from '@/data/gameData';

// 塔 Canvas 預覽元件 - 只需傳 towerId 即可自動取得顏色等參數
const TowerPreview = ({ 
  towerId,
  // 以下為可選覆蓋（Mod 塔或自訂顏色時使用）
  color: colorOverride,
  highlightColor: highlightOverride,
  size = 64,
  showRange = false,
  rangeRadius = 0,
  animate = false,
  autoCycleLevel = false,
  level: initialLevel = 1,
  /** 動畫模式：靜止 / 閒置旋轉 / 攻擊模擬 */
  animMode,
  /** 皮膚模型集 ID，若指定則以該模型集繪製 */
  skinModelSetId,
}: { 
  towerId: string;
  color?: string;
  highlightColor?: string;
  size?: number;
  showRange?: boolean;
  rangeRadius?: number;
  animate?: boolean;
  animMode?: 'static' | 'idle' | 'attack';
  autoCycleLevel?: boolean;
  level?: number;
  skinModelSetId?: string;
}) => {
  const towerData = useMemo(() => TOWER_DATA[towerId as keyof typeof TOWER_DATA], [towerId]);
  const color = colorOverride || towerData?.color || '#6496ff';
  const highlightColor = highlightOverride || towerData?.highlightColor || color;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const rotationRef = useRef(0);
  const recoilRef = useRef(0);
  const levelRef = useRef(initialLevel);
  const effectiveMode = animMode ?? (animate ? 'idle' : 'static');

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const w = size;
    const h = size;
    canvas.width = w * dpr;
    canvas.height = h * dpr;

    // 設計：
    // - GAME_TILE：對應遊戲中典型 tile 大小，用於計算 radius 與 tileSize，
    //   讓砲管厚度、裝飾邊框、皮膚光暈等與遊戲視覺完全一致。
    // - DRAW_AREA：內部繪製畫布尺寸，比 GAME_TILE 多一圈邊距，
    //   留給超出 tile 的砲管末端、皮膚光暈、漂浮衛星等延伸元素。
    const GAME_TILE = 72;
    const DRAW_AREA = 100;
    const renderScale = (w / DRAW_AREA) * dpr;
    ctx.setTransform(renderScale, 0, 0, renderScale, 0, 0);
    ctx.clearRect(0, 0, DRAW_AREA, DRAW_AREA);

    const cx = DRAW_AREA / 2;
    const cy = DRAW_AREA / 2;
    const radius = GAME_TILE * 0.35;

    if (showRange && rangeRadius > 0) {
      const rangeInternal = rangeRadius / (w / DRAW_AREA);
      const maxRange = DRAW_AREA / 2 - 2;
      ctx.beginPath();
      ctx.arc(cx, cy, Math.min(rangeInternal, maxRange), 0, Math.PI * 2);
      ctx.fillStyle = color + '15';
      ctx.fill();
      ctx.strokeStyle = color + '30';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    drawTowerModel(towerId, {
      ctx, cx, cy, radius,
      rotation: rotationRef.current,
      color, highlight: highlightColor,
      level: levelRef.current,
      recoil: recoilRef.current,
      tileSize: GAME_TILE,
    }, skinModelSetId);
  }, [towerId, color, highlightColor, size, showRange, rangeRadius, skinModelSetId]);

  // 當傳入的 initialLevel 改變時同步更新；非動畫模式下需手動重繪，否則畫面會停留在前一級
  useEffect(() => {
    levelRef.current = initialLevel;
    if (effectiveMode === 'static') draw();
  }, [initialLevel, effectiveMode, draw]);

  useEffect(() => {
    if (effectiveMode === 'static') {
      rotationRef.current = -Math.PI / 4;
      recoilRef.current = 0;
      draw();
      return;
    }
    let running = true;
    let frame = 0;
    const loop = () => {
      if (!running) return;
      frame += 1;
      const prevRotation = rotationRef.current;

      if (effectiveMode === 'attack') {
        rotationRef.current += 0.045;
        recoilRef.current = Math.max(0, recoilRef.current - 0.12);
        if (frame % 28 === 0) recoilRef.current = 1;
      } else {
        rotationRef.current += 0.015;
        recoilRef.current = 0;
      }
      
      if (autoCycleLevel) {
        const currentLap = Math.floor(rotationRef.current / (Math.PI * 2));
        const prevLap = Math.floor(prevRotation / (Math.PI * 2));
        if (currentLap > prevLap) {
          levelRef.current = levelRef.current >= 5 ? 1 : levelRef.current + 1;
        }
      }

      draw();
      animRef.current = requestAnimationFrame(loop);
    };
    loop();
    return () => { running = false; cancelAnimationFrame(animRef.current); };
  }, [effectiveMode, autoCycleLevel, draw]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
      className="pointer-events-none"
    />
  );
};

export default TowerPreview;
