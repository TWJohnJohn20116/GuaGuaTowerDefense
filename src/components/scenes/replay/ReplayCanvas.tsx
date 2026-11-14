// 回放畫布 - 直接調用遊戲本體的 drawGrid/drawTowerModel/drawEnemyModel
// 達到與實際遊戲畫面一模一樣的效果
//
// 流暢度：內部 requestAnimationFrame 迴圈每幀讀取 playheadRef，
// 透過 replayPlayback 在相鄰快照間做實體插值繪製（顯示器幀率，遠超 24 FPS）。
import { useRef, useEffect, useMemo } from 'react';
import { GAME_CONSTANTS, TOWER_DATA, ENEMY_DATA } from '@/data/gameData';
import { drawGrid } from '@/components/game/PathRenderer';
import { drawTowerModel } from '@/components/game/TowerModels';
import { drawEnemyModel } from '@/utils/enemyRenderer';
import { initializeGrid } from '@/store/gameStoreUtils';
import { useSettingsStore } from '@/store/settingsStore';
import { shouldDrawReplayEnemyHealthBar } from '@/data/replayCanvasDisplay';
import { healthBarColorCss } from '@/data/healthBarColor';
import { createFrameLoopGuard } from '@/utils/frameLoopGuard';
import type { ReplaySnapshot, ReplayEvent } from '@/store/replayStore';
import { buildRenderFrame } from './replayPlayback';

interface ReplayCanvasProps {
  /** 全部快照（內部依 playhead 插值） */
  snapshots: ReplaySnapshot[];
  /** 精確播放進度（秒）— 用 ref 避免 60fps 重渲染 React 樹 */
  playheadRef: React.MutableRefObject<number>;
  mapId: string;
  width?: number;
  height?: number;
  /** 全部事件（內部依 playhead 過濾鄰近事件做高亮） */
  events?: ReplayEvent[];
}

export function ReplayCanvas({
  snapshots,
  playheadRef,
  mapId,
  width = 720,
  height = 528,
  events = [],
}: ReplayCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  const grid = useMemo(() => initializeGrid(mapId), [mapId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { GRID_COLS, GRID_ROWS } = GAME_CONSTANTS;
    const tileSize = Math.floor(Math.min(width / GRID_COLS, height / GRID_ROWS));
    const offsetX = (width - tileSize * GRID_COLS) / 2;
    const offsetY = (height - tileSize * GRID_ROWS) / 2;

    const draw = () => {
      const playhead = playheadRef.current;
      const frame = buildRenderFrame(snapshots, playhead);

      ctx.fillStyle = '#0a0c10';
      ctx.fillRect(0, 0, width, height);

      const showEnemyPath = useSettingsStore.getState().gameplay.showEnemyPath;
      const showHealthBars = useSettingsStore.getState().visual.showHealthBars;
      drawGrid(ctx, grid, tileSize, offsetX, offsetY, showEnemyPath);

      if (!frame) return;

      const time = Date.now();
      const recentEvents = events.filter((e) => Math.abs(playhead - e.time) < 1.5);

      frame.towers.forEach((t) => {
        const data = TOWER_DATA[t.type as keyof typeof TOWER_DATA];
        const color = t.color || data?.color || '#88c0d0';
        const highlight = data?.highlightColor || color;
        const cx = offsetX + t.x * tileSize;
        const cy = offsetY + t.y * tileSize;
        const radius = tileSize * 0.35;
        drawTowerModel(t.type, {
          ctx, cx, cy, radius,
          rotation: t.rotation ?? 0,
          color, highlight,
          level: t.level,
          recoil: 0,
          tileSize,
        });

        // 事件高亮 - 若塔事件發生在 1.2 秒內,畫脈動環
        const towerEvent = recentEvents.find(
          (e) =>
            (e.type === 'towerPlaced' || e.type === 'towerUpgraded' || e.type === 'towerSold') &&
            e.data?.towerId === t.id &&
            Math.abs(playhead - e.time) < 1.2
        );
        if (towerEvent) {
          const dt = Math.abs(playhead - towerEvent.time);
          const alpha = Math.max(0, 1 - dt / 1.2);
          const ringR = radius + 4 + dt * 16;
          const ringColor =
            towerEvent.type === 'towerPlaced'
              ? '#22c55e'
              : towerEvent.type === 'towerUpgraded'
                ? '#fbbf24'
                : '#ef4444';
          ctx.strokeStyle = ringColor;
          ctx.lineWidth = 3;
          ctx.globalAlpha = alpha * 0.8;
          ctx.beginPath();
          ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      });

      frame.enemies.forEach((e) => {
        const data = ENEMY_DATA[e.type as keyof typeof ENEMY_DATA];
        const color = e.color || data?.color || '#ef4444';
        const ex = offsetX + e.x * tileSize + tileSize / 2;
        const ey = offsetY + e.y * tileSize + tileSize / 2;
        const baseSize = e.size ?? data?.size ?? 20;
        const radius = (baseSize / 50) * tileSize * 0.4;

        // 生成 / 死亡過渡的淡入淡出
        if (e.alpha < 1) ctx.globalAlpha = e.alpha;
        drawEnemyModel(ctx, ex, ey, radius, e.type, color, time);

        if (shouldDrawReplayEnemyHealthBar({ hpRatio: e.hp, showHealthBars })) {
          const barW = radius * 2;
          const barH = 3;
          const barY = ey - radius - barH - 2;
          ctx.fillStyle = '#1a1d24';
          ctx.fillRect(ex - barW / 2, barY, barW, barH);
          ctx.fillStyle = healthBarColorCss(e.hp);
          ctx.fillRect(ex - barW / 2, barY, barW * e.hp, barH);
        }
        if (e.alpha < 1) ctx.globalAlpha = 1;
      });

      frame.projectiles.forEach((p) => {
        const px = offsetX + p.x * tileSize;
        const py = offsetY + p.y * tileSize;
        ctx.fillStyle = p.color || '#fff';
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color || '#fff';
        ctx.beginPath();
        ctx.arc(px, py, (p.size ?? 4) * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 全域事件提示 (波次開始/結束/勝利/失敗)
      const globalEvent = recentEvents.find(
        (e) =>
          e.type === 'waveStarted' || e.type === 'waveCompleted' || e.type === 'victory' || e.type === 'gameOver' || e.type === 'skillActivated'
      );
      if (globalEvent) {
        const dt = Math.abs(playhead - globalEvent.time);
        const alpha = Math.max(0, 1 - dt / 1.5);
        const text =
          globalEvent.type === 'waveStarted'
            ? `WAVE ${globalEvent.data?.waveNum ?? ''} START`
            : globalEvent.type === 'waveCompleted'
              ? `WAVE ${globalEvent.data?.waveNum ?? ''} CLEAR`
              : globalEvent.type === 'victory'
                ? 'VICTORY'
                : globalEvent.type === 'gameOver'
                  ? 'GAME OVER'
                  : 'SKILL';
        const eventColor =
          globalEvent.type === 'victory'
            ? '#22c55e'
            : globalEvent.type === 'gameOver'
              ? '#ef4444'
              : globalEvent.type === 'skillActivated'
                ? '#a855f7'
                : '#3b82f6';
        ctx.globalAlpha = alpha;
        ctx.fillStyle = eventColor;
        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 12;
        ctx.shadowColor = eventColor;
        ctx.fillText(text, width / 2, 40);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
        ctx.textAlign = 'left';
      }
    };

    // 每幀插值繪製（顯示器幀率）
    // 單幀異常只掉一幀：迴圈排程放在 guard 外，避免一次拋錯就讓回放永久定格
    const frameGuard = createFrameLoopGuard({ label: 'replay-canvas' });
    const loop = () => {
      frameGuard.run(draw);
      animationRef.current = requestAnimationFrame(loop);
    };
    animationRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [snapshots, mapId, width, height, grid, events, playheadRef]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="block border-[3px] border-[var(--cn-line-soft)] bg-[#0a0c10]"
    />
  );
}
