import { useEffect, useState } from 'react';
import { getSnapshot, type PerfSnapshot } from '@/utils/perfMonitor';
import { useDevStore } from '@/store/devStore';
import { useGameStore } from '@/store/gameStore';

const POLL_MS = 250;

const formatMs = (v: number): string => {
  if (v >= 10) return v.toFixed(1);
  if (v >= 1) return v.toFixed(2);
  return v.toFixed(3);
};

const colorForAvg = (avg: number): string => {
  if (avg < 0.5) return 'text-[var(--hl-vital)]';
  if (avg < 2) return 'text-lime-400';
  if (avg < 5) return 'text-[var(--hl-caution)]';
  if (avg < 10) return 'text-[var(--hl-caution)]';
  return 'text-[var(--hl-alarm)]';
};

export const PerfOverlay = () => {
  const show = useDevStore((s) => s.showPerfMonitor);
  // 只訂閱 length（避免每幀因 array reference 變動而重渲染；PerfOverlay 已用 250ms poll 自行刷新）
  const enemyCount = useGameStore((s) => s.enemies.length);
  const towerCount = useGameStore((s) => s.towers.length);
  const projectileCount = useGameStore((s) => s.projectiles.length);

  const [snapshot, setSnapshot] = useState<PerfSnapshot>(getSnapshot());

  useEffect(() => {
    if (!show) return;
    const id = setInterval(() => setSnapshot(getSnapshot()), POLL_MS);
    return () => clearInterval(id);
  }, [show]);

  if (!show) return null;

  const entries = Object.entries(snapshot.stages).sort((a, b) => b[1].total - a[1].total);
  const fps = snapshot.windowMs > 0 ? Math.round((snapshot.framesInWindow * 1000) / snapshot.windowMs) : 0;
  const totalLoopMs = entries.reduce((sum, [, s]) => sum + s.total, 0);
  const avgLoopMsPerFrame = snapshot.framesInWindow > 0 ? totalLoopMs / snapshot.framesInWindow : 0;

  return (
    <div className="fixed top-4 right-4 z-[9998] bg-black/85 text-[var(--hl-ink)] text-xs font-mono  border border-[rgba(56,224,143,0.38)]  p-3 min-w-[260px] pointer-events-none">
      <div className="flex items-center justify-between border-b border-[rgba(56,224,143,0.38)] pb-1.5 mb-2">
        <span className="text-[var(--hl-vital)] font-semibold tracking-wider">PERF MONITOR</span>
        <span className="text-[var(--hl-vital)]">{fps} fps</span>
      </div>
      <div className="grid grid-cols-3 gap-x-2 text-[10px] text-nordic-muted mb-1.5">
        <div>敵人 <span className="text-[var(--hl-ink)]">{enemyCount}</span></div>
        <div>塔 <span className="text-[var(--hl-ink)]">{towerCount}</span></div>
        <div>子彈 <span className="text-[var(--hl-ink)]">{projectileCount}</span></div>
      </div>
      <div className="border-t border-[rgba(56,224,143,0.38)] pt-1.5">
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-2 text-[10px] text-nordic-muted/80 mb-1">
          <span>Stage</span>
          <span className="text-right">avg</span>
          <span className="text-right">max</span>
          <span className="text-right">n</span>
        </div>
        {entries.length === 0 ? (
          <div className="text-nordic-muted/60 italic text-[10px] py-1">收集中...</div>
        ) : (
          entries.map(([name, s]) => (
            <div key={name} className="grid grid-cols-[1fr_auto_auto_auto] gap-x-2 text-[10px]">
              <span className="truncate">{name}</span>
              <span className={`text-right ${colorForAvg(s.avg)}`}>{formatMs(s.avg)}ms</span>
              <span className="text-right text-nordic-muted">{formatMs(s.max)}</span>
              <span className="text-right text-nordic-muted/60">{s.count}</span>
            </div>
          ))
        )}
      </div>
      <div className="border-t border-[rgba(56,224,143,0.38)] pt-1.5 mt-1.5 text-[10px]">
        <div className="flex justify-between">
          <span className="text-nordic-muted">每幀總耗時</span>
          <span className={colorForAvg(avgLoopMsPerFrame)}>{formatMs(avgLoopMsPerFrame)}ms</span>
        </div>
        <div className="flex justify-between text-nordic-muted/60">
          <span>視窗</span>
          <span>{snapshot.windowMs.toFixed(0)}ms / {snapshot.framesInWindow} frames</span>
        </div>
      </div>
    </div>
  );
};

export default PerfOverlay;
