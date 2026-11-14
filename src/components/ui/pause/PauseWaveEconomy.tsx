/**
 * 暫停主控台 · 下波經濟估算與獎勵 */

import { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { SCENE_TYPOGRAPHY } from '@/components/ui/SceneTypography';
import { useTranslation } from '@/i18n';
import {
 resolveNextWaveConfig,
 estimateWaveKillBounty,
 getCustomWaveClearBonus,
 countWaveEnemies,
} from './pauseWaveEconomyUtils';
import {
 CoinIcon, WaveIcon, InfinityIcon,
} from '@/components/ui/Icons';

export function PauseWaveEconomy({ bare = false }: { bare?: boolean }) {
 const { t } = useTranslation();
 const g = t.game;
 const currentWave = useGameStore((s) => s.currentWave);
 const maxWaves = useGameStore((s) => s.maxWaves);
 const endlessMode = useGameStore((s) => s.endlessMode);
 const waveActive = useGameStore((s) => s.waveActive);
 const money = useGameStore((s) => s.money);
 const enemyRewardMult = useGameStore((s) => s.difficultyModifiers.enemyRewardMult);
 const customWaveSetId = useGameStore((s) => s.customWaveSetId);
 const nextConfig = useMemo(
 () => resolveNextWaveConfig(currentWave, endlessMode, maxWaves, customWaveSetId),
 [currentWave, endlessMode, maxWaves, customWaveSetId],
 );

 const nextKillBounty = useMemo(
 () => (nextConfig ? estimateWaveKillBounty(nextConfig, enemyRewardMult) : 0),
 [nextConfig, enemyRewardMult],
 );

 const customBonus = useMemo(
 () => getCustomWaveClearBonus(customWaveSetId, currentWave),
 [customWaveSetId, currentWave],
 );

 const hasNext = Boolean(nextConfig);
 const nextEnemyCount = nextConfig ? countWaveEnemies(nextConfig) : 0;

 const body = (
 <div className="space-y-3">
 <div className="grid grid-cols-2 gap-2">
 <div className="arc-panel--sunken p-2.5">
 <div className={`${SCENE_TYPOGRAPHY.microMuted} uppercase mb-0.5`}>{g.pauseEcoCurrentMoney}</div>
 <div className="arc-num text-sm font-black text-[var(--arc-caution)] font-mono">${money}</div>
 </div>
 {hasNext ? (
 <div className="arc-panel--sunken p-2.5">
 <div className={`${SCENE_TYPOGRAPHY.microMuted} uppercase mb-0.5 flex items-center gap-1`}>
 <WaveIcon className="w-3 h-3"/>
 {g.pauseEcoNextKillEstimate}
 </div>
 <div className="arc-num text-sm font-black text-[var(--arc-caution)] font-mono">+${nextKillBounty}</div>
 <div className={`${SCENE_TYPOGRAPHY.microMuted} mt-0.5`}>
 {g.pauseEcoEnemyCount.replace('{count}', String(nextEnemyCount))}
 </div>
 </div>
 ) : (
 <div className="arc-panel--sunken p-2.5 flex items-center justify-center">
 <span className={SCENE_TYPOGRAPHY.microMuted}>{g.pauseEcoLastWave}</span>
 </div>
 )}
 </div>

 {customBonus != null && (
 <div className="arc-panel--flat px-3 py-2 flex items-center justify-between">
 <span className="text-[11px] text-[var(--arc-ink-2)]">
 {waveActive ? g.pauseEcoWaveClearBonusActive : g.pauseEcoWaveClearBonusNext}
 </span>
 <span className="arc-num text-sm font-bold text-[var(--arc-caution)] font-mono">+${customBonus}</span>
 </div>
 )}

 {endlessMode && (
 <div className={`${SCENE_TYPOGRAPHY.microMuted} flex items-center gap-1.5 border-t border-[var(--cn-line-soft)] pt-2`}>
 <InfinityIcon className="w-3 h-3"/>
 {g.pauseEcoEndlessNote}
 </div>
 )}
 </div>
 );

 if (bare) return body;

 return (
 <div className="arc-panel p-4 space-y-3">
 <div className={`${SCENE_TYPOGRAPHY.microLabel} text-[var(--arc-caution)] flex items-center gap-1.5`}>
 <CoinIcon className="w-3.5 h-3.5"/>
 {g.pauseSessionEconomy}
 </div>
 {body}
 </div>
 );
}

export default PauseWaveEconomy;
