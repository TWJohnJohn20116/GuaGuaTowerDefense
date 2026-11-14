/**
 * 壓力測試 HUD
 *
 * 只在壓測模式開啟時掛載，量的是「玩家實際感受到的幀」：
 * 自己用 requestAnimationFrame 取樣，不依賴遊戲迴圈，所以連
 * 「遊戲迴圈卡住不跑」這種情況也照樣看得到（fps 會掉到很低而不是停住）。
 *
 * 除了 FPS，還一併顯示：
 * - 幀時間 avg / p50 / p95 / max（掉幀看 p95 比看平均準）
 * - 卡頓幀數（> 16.7ms）與最慢一幀
 * - 實體數量（敵人／塔／子彈／粒子／傷害文字）
 * - JS heap（Chromium 才有 performance.memory）
 * - perfMonitor 逐階段耗時（updateEnemies / updateTowers / …）
 */
import { useEffect, useRef, useState } from 'react';
import { useDevStore } from '@/store/devStore';
import { useGameStore } from '@/store/gameStore';
import { useSettingsStore } from '@/store/settingsStore';
import { getSnapshot, isPerfEnabled, setPerfEnabled, type PerfSnapshot } from '@/utils/perfMonitor';

const SAMPLE_FRAMES = 240;
const PUBLISH_MS = 250;
/** 60Hz 下一幀 16.7ms；超過這個就記一次卡頓 */
const JANK_THRESHOLD_MS = 16.7;

interface FrameStats {
  fps: number;
  avg: number;
  p50: number;
  p95: number;
  max: number;
  jank: number;
  samples: number;
}

const percentile = (sorted: number[], ratio: number): number => {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.round((sorted.length - 1) * ratio)));
  return sorted[idx];
};

const useFrameSampler = (active: boolean): FrameStats => {
  const [stats, setStats] = useState<FrameStats>({
    fps: 0, avg: 0, p50: 0, p95: 0, max: 0, jank: 0, samples: 0,
  });
  const frameTimesRef = useRef<number[]>([]);

  useEffect(() => {
    if (!active) return;

    let rafId = 0;
    let last = performance.now();
    frameTimesRef.current = [];

    const loop = (now: number) => {
      const dt = now - last;
      last = now;
      // 分頁切到背景時 dt 會是幾百毫秒，不該算進幀時間
      if (dt > 0 && dt < 1000) {
        const buf = frameTimesRef.current;
        buf.push(dt);
        if (buf.length > SAMPLE_FRAMES) buf.shift();
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    const publish = setInterval(() => {
      const samples = frameTimesRef.current;
      if (samples.length === 0) return;

      const sorted = [...samples].sort((a, b) => a - b);
      const total = samples.reduce((sum, v) => sum + v, 0);
      const avg = total / samples.length;

      setStats({
        fps: avg > 0 ? Math.round(1000 / avg) : 0,
        avg,
        p50: percentile(sorted, 0.5),
        p95: percentile(sorted, 0.95),
        max: sorted[sorted.length - 1] ?? 0,
        jank: samples.filter((v) => v > JANK_THRESHOLD_MS).length,
        samples: samples.length,
      });
    }, PUBLISH_MS);

    return () => {
      cancelAnimationFrame(rafId);
      clearInterval(publish);
    };
  }, [active]);

  return stats;
};

const ms = (v: number): string => (v >= 10 ? v.toFixed(1) : v.toFixed(2));

const fpsTone = (fps: number): string => {
  if (fps >= 55) return 'text-[var(--arc-vital)]';
  if (fps >= 30) return 'text-[var(--arc-caution)]';
  return 'text-[var(--arc-alert)]';
};

const frameTone = (v: number): string => {
  if (v <= JANK_THRESHOLD_MS) return 'text-[var(--arc-vital)]';
  if (v <= 33) return 'text-[var(--arc-caution)]';
  return 'text-[var(--arc-alert)]';
};

const Row = ({ label, value, tone = '' }: { label: string; value: string; tone?: string }) => (
  <div className="flex items-baseline justify-between gap-3">
    <span className="text-[9.5px] uppercase tracking-[0.12em] text-[var(--arc-ink-4)]">{label}</span>
    <span className={`arc-num font-mono text-[11px] font-bold ${tone || 'text-[var(--arc-ink)]'}`}>{value}</span>
  </div>
);

export const StressTestHud = () => {
  const active = useDevStore((s) => s.stressTestActive);
  const lastRun = useDevStore((s) => s.stressTestLastRun);

  // 只訂閱長度，避免每幀陣列換參考就重繪整個 HUD
  const enemies = useGameStore((s) => s.enemies.length);
  const towers = useGameStore((s) => s.towers.length);
  const projectiles = useGameStore((s) => s.projectiles.length);
  const impactParticles = useGameStore((s) => s.impactParticles.length);
  const damageTexts = useGameStore((s) => s.damageTexts.length);
  const deathAnimations = useGameStore((s) => s.deathAnimations.length);
  const showTacticalView = useGameStore((s) => s.showTacticalView);
  const animationsEnabled = useSettingsStore((s) => s.visual.animationsEnabled);

  const stats = useFrameSampler(active);

  const [perf, setPerf] = useState<PerfSnapshot>(getSnapshot());
  const [heapMb, setHeapMb] = useState<number | null>(null);

  // 開 HUD 就順便打開逐階段計時，關掉時還原
  useEffect(() => {
    if (!active) return;
    const wasEnabled = isPerfEnabled();
    if (!wasEnabled) setPerfEnabled(true);

    const id = setInterval(() => {
      setPerf(getSnapshot());
      const memory = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory;
      setHeapMb(memory ? memory.usedJSHeapSize / (1024 * 1024) : null);
    }, PUBLISH_MS);

    return () => {
      clearInterval(id);
      if (!wasEnabled) setPerfEnabled(false);
    };
  }, [active]);

  if (!active) return null;

  const stages = Object.entries(perf.stages).sort((a, b) => b[1].total - a[1].total);
  const logicPerFrame = perf.framesInWindow > 0
    ? stages.reduce((sum, [, s]) => sum + s.total, 0) / perf.framesInWindow
    : 0;

  return (
    <div
      className="pointer-events-none fixed left-4 top-4 z-[9997] w-[286px] rounded-sm border border-[rgba(255,61,113,0.45)] bg-[var(--cn-card-2)] p-3 font-mono text-[11px] text-[var(--arc-ink)]"
      role="status"
      aria-label="壓力測試監控"
    >
      <div className="mb-2 flex items-center justify-between border-b border-[rgba(255,61,113,0.35)] pb-1.5">
        <span className="text-[9.5px] font-black uppercase tracking-[0.28em] text-[var(--arc-alert)]">
          Stress Test
        </span>
        <span className={`text-[20px] leading-none font-black tabular-nums ${fpsTone(stats.fps)}`}>
          {stats.fps}
          <span className="ml-1 text-[9px] font-bold uppercase tracking-widest text-[var(--arc-ink-4)]">fps</span>
        </span>
      </div>

      <div className="space-y-1">
        <Row label="frame avg" value={`${ms(stats.avg)} ms`} tone={frameTone(stats.avg)} />
        <Row label="p50 / p95" value={`${ms(stats.p50)} / ${ms(stats.p95)}`} />
        <Row label="worst" value={`${ms(stats.max)} ms`} tone={frameTone(stats.max)} />
        <Row
          label={`jank >${JANK_THRESHOLD_MS}ms`}
          value={`${stats.jank} / ${stats.samples}`}
          tone={stats.jank > stats.samples * 0.3 ? 'text-[var(--arc-alert)]' : 'text-[var(--arc-ink-2)]'}
        />
      </div>

      <div className="mt-2 space-y-1 border-t border-[var(--cn-line-soft)] pt-2">
        <Row label="enemies" value={enemies.toLocaleString()} tone={enemies > 5000 ? 'text-[var(--arc-alert)]' : ''} />
        <Row label="towers" value={towers.toLocaleString()} />
        <Row label="projectiles" value={projectiles.toLocaleString()} />
        <Row label="particles" value={impactParticles.toLocaleString()} />
        <Row label="damage texts" value={damageTexts.toLocaleString()} />
        <Row label="death fx" value={deathAnimations.toLocaleString()} />
        {heapMb !== null && <Row label="js heap" value={`${heapMb.toFixed(1)} MB`} />}
      </div>

      <div className="mt-2 space-y-1 border-t border-[var(--cn-line-soft)] pt-2">
        <Row label="logic / frame" value={`${ms(logicPerFrame)} ms`} tone={frameTone(logicPerFrame)} />
        {stages.slice(0, 6).map(([name, s]) => (
          <Row key={name} label={name} value={`${ms(s.avg)} ms · max ${ms(s.max)}`} />
        ))}
        {stages.length === 0 && <Row label="stages" value="收集…" />}
      </div>

      <div className="mt-2 border-t border-[var(--cn-line-soft)] pt-1.5 text-[9px] uppercase tracking-[0.1em] text-[var(--arc-ink-4)]">
        <div className="flex justify-between">
          <span>tactical view</span>
          <span>{showTacticalView ? 'on' : 'off'}</span>
        </div>
        <div className="flex justify-between">
          <span>animations</span>
          <span>{animationsEnabled ? 'on' : 'off'}</span>
        </div>
        {lastRun && (
          <div className="flex justify-between">
            <span>last spawn</span>
            <span>
              {lastRun.enemies.toLocaleString()}e / {lastRun.towers}t
              {lastRun.reason === 'not-in-game' ? ' · 需進遊戲' : ''}
              {lastRun.reason === 'no-path' ? ' · 無路徑' : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StressTestHud;
