// 下一波預覽 - 顯示即將生成的敵人列表
import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { WAVE_CONFIGS, ENEMY_DATA, GAME_CONSTANTS } from '@/data/gameData';
import { findPlayableWaveSet } from '@/utils/waveSets';
import { useTranslation } from '@/i18n';
import EnemyPreview from '@/components/ui/EnemyPreview';
import { Num, SegHead } from '@/components/hl';

interface NextWavePreviewProps {
  show: boolean;
}

export function NextWavePreview({ show }: NextWavePreviewProps) {
  const { t } = useTranslation();

  const currentWave = useGameStore((s) => s.currentWave);
  const waveActive = useGameStore((s) => s.waveActive);
  const endlessMode = useGameStore((s) => s.endlessMode);
  const maxWaves = useGameStore((s) => s.maxWaves);
  const customWaveSetId = useGameStore((s) => s.customWaveSetId);
  const generateEndlessWave = useGameStore((s) => s.generateEndlessWave);

  const nextWaveData = useMemo(() => {
    if (waveActive) return null;
    if (!endlessMode && maxWaves > 0 && currentWave >= maxWaves) return null;

    const nextWaveNum = currentWave + 1;
    let waveConfig: { enemies: { type: string; count: number; delay?: number }[] } | null = null;

    if (customWaveSetId) {
      const ws = findPlayableWaveSet(customWaveSetId);
      if (ws && ws.waves[nextWaveNum - 1]) {
        waveConfig = { enemies: ws.waves[nextWaveNum - 1].enemies };
      }
    }

    if (!waveConfig) {
      if (endlessMode) {
        waveConfig = generateEndlessWave(nextWaveNum);
      } else {
        waveConfig = WAVE_CONFIGS[nextWaveNum - 1] ?? generateEndlessWave(nextWaveNum);
      }
    }

    if (!waveConfig) return null;

    let totalHP = 0;
    let totalCount = 0;
    let duration = 0;
    let hasBoss = false;
    let hasElite = false;

    waveConfig.enemies.forEach((eg) => {
      const eData = ENEMY_DATA[eg.type as keyof typeof ENEMY_DATA];
      if (eData) totalHP += (eData.health || 50) * eg.count;
      totalCount += eg.count;
      if (eg.delay) duration += eg.delay;
      duration += eg.count * GAME_CONSTANTS.ENEMY_SPAWN_DELAY;
      if (eg.type === 'boss' || eg.type === 'miniboss') hasBoss = true;
      if (eg.type === 'elite' || eg.type === 'berserker' || eg.type === 'mage') hasElite = true;
    });

    return {
      waveNum: nextWaveNum,
      enemies: waveConfig.enemies,
      totalHP,
      totalCount,
      duration,
      hasBoss,
      hasElite,
    };
  }, [currentWave, waveActive, endlessMode, maxWaves, customWaveSetId, generateEndlessWave]);

  if (!show || !nextWaveData) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 6 }}
        transition={{ duration: 0.14 }}
        className="absolute bottom-full left-0 z-50 arc-panel mb-2 w-[300px]"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 border-b border-[var(--cn-line-soft)] px-3 py-2">
          <SegHead label={`${t.game.nextWave} · W${nextWaveData.waveNum}`} />
          <div className="flex shrink-0 items-center gap-1">
            {nextWaveData.hasBoss && (
              <span className="border border-[rgba(255,61,113,0.5)] px-1 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.08em] text-[var(--arc-alert)]">
                {t.game.waveTagBoss}
              </span>
            )}
            {nextWaveData.hasElite && (
              <span className="border border-[rgba(255,166,43,0.5)] px-1 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.08em] text-[var(--arc-caution)]">
                {t.game.waveTagElite}
              </span>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-stretch border-b border-[var(--cn-line-soft)]">
          {[
            { label: t.game.unitEnemy, value: nextWaveData.totalCount, tone: 'ink' as const },
            { label: 'hp', value: nextWaveData.totalHP.toLocaleString(), tone: 'alarm' as const },
            { label: 'time', value: `${(nextWaveData.duration / 1000).toFixed(0)}s`, tone: 'muted' as const },
          ].map((cell) => (
            <div key={cell.label} className="flex flex-1 flex-col gap-1 border-r border-[var(--cn-line-soft)] px-2.5 py-1.5 last:border-r-0">
              <span className="arc-label">{cell.label}</span>
              <Num value={cell.value} tone={cell.tone} size="sm" />
            </div>
          ))}
        </div>

        {/* Enemy List */}
        <div className="max-h-48 space-y-px overflow-y-auto bg-[var(--arc-line)]">
          {nextWaveData.enemies.map((eg, idx) => {
            const eData = ENEMY_DATA[eg.type as keyof typeof ENEMY_DATA];
            const groupHP = (eData?.health || 50) * eg.count;
            return (
              <div
                key={idx}
                className="flex items-center gap-2 bg-[var(--arc-deck)] px-2.5 py-1.5"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center border-[3px] border-[var(--cn-line-soft)]">
                  <EnemyPreview enemyId={eg.type} size={22} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[10.5px] font-medium text-[var(--arc-ink)]">
                    {eData?.name || eg.type}
                  </span>
                  <span className="block font-mono text-[9px] tabular-nums text-[var(--arc-ink-4)]">
                    HP {eData?.health ?? '?'} · ×{eg.count}
                  </span>
                </span>
                <Num value={groupHP.toLocaleString()} tone="caution" size="sm" />
              </div>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
