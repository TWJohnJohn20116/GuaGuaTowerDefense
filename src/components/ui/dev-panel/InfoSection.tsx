import { useState, useEffect, useMemo, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useStatsStore } from '@/store/statsStore';
import { TOWER_DATA } from '@/data/gameData';
import { useTranslation } from '@/i18n';
import { ChartIcon, CoinIcon, HeartIcon, WaveIcon, TowerIcon, AlienIcon, TimerIcon, LightningIcon } from '@/components/ui/Icons';
import { DevSection, DevInfoRow } from './common';
import { Deck } from '@/components/hl';

// 即時 FPS 計算 hook（在 InfoSection mount 期間每秒更新）
const useLiveFPS = () => {
  const [fps, setFps] = useState(0);
  const framesRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  useEffect(() => {
    let rafId = 0;
    const loop = () => {
      framesRef.current++;
      const now = performance.now();
      const elapsed = now - lastTimeRef.current;
      if (elapsed >= 1000) {
        setFps(Math.round((framesRef.current * 1000) / elapsed));
        framesRef.current = 0;
        lastTimeRef.current = now;
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return fps;
};

const formatDuration = (ms: number): string => {
  if (ms <= 0) return '0:00';
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const InfoSection = () => {
  const { t } = useTranslation();
  const u = t.dev.ui;
  const scene = useGameStore((s) => s.scene);
  const isPlaying = useGameStore((s) => s.isPlaying);
  const isPaused = useGameStore((s) => s.isPaused);
  const isGameOver = useGameStore((s) => s.isGameOver);
  const isVictory = useGameStore((s) => s.isVictory);
  const gameSpeed = useGameStore((s) => s.gameSpeed);
  const selectedPath = useGameStore((s) => s.selectedPath);
  const gameDifficulty = useGameStore((s) => s.gameDifficulty);

  const money = useGameStore((s) => s.money);
  const health = useGameStore((s) => s.health);
  const score = useGameStore((s) => s.score);
  const currentWave = useGameStore((s) => s.currentWave);
  const maxWaves = useGameStore((s) => s.maxWaves);
  const waveActive = useGameStore((s) => s.waveActive);

  const enemyCount = useGameStore((s) => s.enemies.length);
  const towers = useGameStore((s) => s.towers);
  const towerCount = towers.length;
  const projectileCount = useGameStore((s) => s.projectiles.length);

  const gameStartTime = useStatsStore((s) => s.currentGame?.gameStartTime ?? 0);

  // 即時計時：每秒刷新顯示
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!isPlaying || isPaused || isGameOver || isVictory) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isPlaying, isPaused, isGameOver, isVictory]);

  const elapsedMs = isPlaying && gameStartTime > 0 ? now - gameStartTime : 0;

  // 塔類型統計
  const towerTypeStats = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const t of towers) {
      acc[t.type] = (acc[t.type] || 0) + 1;
    }
    return Object.entries(acc).sort((a, b) => b[1] - a[1]);
  }, [towers]);

  // 即時 FPS
  const fps = useLiveFPS();
  const fpsColor = fps >= 55 ? 'emerald' : fps >= 40 ? 'amber' : 'rose';

  const flowState = isGameOver
    ? 'GAME OVER'
    : isVictory
      ? 'VICTORY'
      : isPaused
        ? 'PAUSED'
        : isPlaying
          ? 'PLAYING'
          : 'IDLE';

  return (
    <div className="space-y-3">
      <DevSection
        title={t.dev.secSceneState}
        icon={<ChartIcon className="w-4 h-4" />}
        accent="emerald"
        keywords={['scene', 'state', 'flow', 'speed', 'difficulty', '場景', '狀態']}
      >
        <DevInfoRow label="Scene" value={scene} color="cyan" />
        <DevInfoRow label="Flow" value={flowState} color={isGameOver ? 'rose' : isVictory ? 'emerald' : isPaused ? 'amber' : 'cyan'} />
        <DevInfoRow label="Speed" value={`${gameSpeed}x`} color="amber" />
        <DevInfoRow label="Path" value={selectedPath || '—'} />
        <DevInfoRow label="Difficulty" value={gameDifficulty} />
      </DevSection>

      <DevSection
        title={t.dev.secResources}
        icon={<CoinIcon className="w-4 h-4" />}
        accent="amber"
        keywords={['resource', 'money', 'health', 'score', '資源', '金錢', '生命']}
      >
        <DevInfoRow label="Money" value={`$${Math.floor(money)}`} color="amber" />
        <DevInfoRow label="Health" value={health} color="rose" />
        <DevInfoRow label="Score" value={score} color="purple" />
      </DevSection>

      <DevSection
        title={t.dev.secWave}
        icon={<WaveIcon className="w-4 h-4" />}
        accent="cyan"
        keywords={['wave', 'active', '波次']}
      >
        <DevInfoRow label="Wave" value={`${currentWave} / ${maxWaves || '∞'}`} color="cyan" />
        <DevInfoRow label="Active" value={waveActive ? 'YES' : 'NO'} color={waveActive ? 'emerald' : 'white'} />
      </DevSection>

      <DevSection
        title={t.dev.secEntityCount}
        icon={<AlienIcon className="w-4 h-4" />}
        accent="rose"
        keywords={['entity', 'count', 'enemy', 'tower', 'projectile', '實體', '計數', '數量']}
      >
        <DevInfoRow label="Enemies" value={enemyCount} color={enemyCount > 0 ? 'rose' : 'white'} />
        <DevInfoRow label="Towers" value={<span className="flex items-center gap-1 justify-end"><TowerIcon className="w-3 h-3 inline" /> {towerCount}</span>} color={towerCount > 0 ? 'cyan' : 'white'} />
        <DevInfoRow label="Projectiles" value={projectileCount} color={projectileCount > 0 ? 'purple' : 'white'} />
      </DevSection>

      <DevSection
        title={t.dev.secGameTimer}
        icon={<TimerIcon className="w-4 h-4" />}
        accent="emerald"
        keywords={['timer', 'time', 'duration', '計時', '時長', '計時器']}
      >
        <DevInfoRow label={u.sessionDuration} value={formatDuration(elapsedMs)} color={elapsedMs > 0 ? 'emerald' : 'white'} />
        <DevInfoRow label={u.statusLabel} value={isPaused ? u.timerPaused : isPlaying ? u.timerPlaying : u.timerIdle} color={isPaused ? 'amber' : 'white'} />
      </DevSection>

      <DevSection
        title={t.dev.secLivePerf}
        icon={<LightningIcon className="w-4 h-4" />}
        accent="amber"
        keywords={['perf', 'performance', 'fps', '效能', '幀率']}
      >
        <DevInfoRow label="FPS" value={`${fps}`} color={fpsColor} />
        <Deck tone="sunken" className="h-1.5 overflow-hidden">
          <div
            className={`h-full transition-all ${
              fps >= 55 ? 'bg-[var(--cn-mint)]' : fps >= 40 ? 'bg-[var(--cn-sun)]' : 'bg-[var(--cn-alert)]'
            }`}
            style={{ width: `${Math.min(100, (fps / 60) * 100)}%` }}
          />
        </Deck>
        <div className="text-[9px] text-[var(--arc-ink-4)] tracking-widest uppercase">
          {u.fpsTargetHint}
        </div>
      </DevSection>

      {towerTypeStats.length > 0 && (
        <DevSection
          title={t.dev.secTowerDistribution}
          icon={<TowerIcon className="w-4 h-4" />}
          accent="cyan"
          keywords={['tower', 'distribution', 'stats', '塔', '分布', '統計']}
        >
          {towerTypeStats.map(([type, count]) => {
            const data = TOWER_DATA[type as keyof typeof TOWER_DATA];
            return (
              <div
                key={type}
                className="flex items-center justify-between text-[11px] font-bold tracking-widest uppercase"
              >
                <span className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5  flex-shrink-0 inline-block"
                    style={{ backgroundColor: data?.color || '#888' }}
                  />
                  <span className="text-[var(--arc-ink-3)]">{data?.name || type}</span>
                </span>
                <span className="text-[var(--arc-reach)]/90 font-mono">{count}</span>
              </div>
            );
          })}
        </DevSection>
      )}

      <Deck className="arc-panel--flat p-3 flex items-center gap-2">
        <HeartIcon className="w-3.5 h-3.5 text-[var(--arc-ink-4)] flex-shrink-0" />
        <span className="text-[10px] text-[var(--arc-ink-4)] leading-relaxed">
          {u.infoLiveHint}
        </span>
      </Deck>
    </div>
  );
};
