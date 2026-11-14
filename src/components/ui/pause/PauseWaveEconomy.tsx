/**
 * 暫停主控台 · 下波經濟估算與獎勵 */

import { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { findCampaignLevelById } from '@/data/campaignData';
import { TOWER_DATA } from '@/data/gameData';
import { getMutatorChallengeById } from '@/data/mutatorChallengeData';
import { SCENE_TYPOGRAPHY } from '@/components/ui/SceneTypography';
import { useTranslation } from '@/i18n';
import { sanitizeUnlockTowers } from '@/utils/campaignRewards';
import {
 resolveNextWaveConfig,
 estimateWaveKillBounty,
 getCustomWaveClearBonus,
 countWaveEnemies,
} from './pauseWaveEconomyUtils';
import {
 CoinIcon, WaveIcon, TrophyIcon, SparklesIcon, InfinityIcon,
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
 const isCampaign = useGameStore((s) => s.isCampaign);
 const campaignLevelId = useGameStore((s) => s.campaignLevelId);
 const mutatorChallengeId = useGameStore((s) => s.mutatorChallengeId);

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

 const victoryRewards = useMemo(() => {
 const items: { label: string; coins?: number; talent?: number; note?: string }[] = [];
 if (isCampaign && campaignLevelId) {
 const level = findCampaignLevelById(campaignLevelId);
 if (level) {
 const towers = sanitizeUnlockTowers(level.rewards.unlockTower);
 const towerNote = towers.length > 0
        ? `解鎖 ${towers.map((type) => TOWER_DATA[type]?.name ?? type).join('、')}`
 : undefined;
 items.push({
 label: g.pauseEcoCampaignClear,
        note: towerNote ? `額外解鎖：${towerNote}` : '本關無額外解鎖獎勵',
 });
 }
 }
 if (mutatorChallengeId) {
 const m = getMutatorChallengeById(mutatorChallengeId);
 if (m?.rewards) {
 items.push({
 label: g.pauseEcoMutatorClear,
 coins: m.rewards.coins,
 talent: m.rewards.talentPoints,
 });
 }
 }
 return items;
 }, [isCampaign, campaignLevelId, mutatorChallengeId, g.pauseEcoCampaignClear, g.pauseEcoMutatorClear]);

 const hasNext = Boolean(nextConfig);
 const nextEnemyCount = nextConfig ? countWaveEnemies(nextConfig) : 0;

 const body = (
 <div className="space-y-3">
 <div className="grid grid-cols-2 gap-2">
 <div className="bg-[rgba(6,7,10,0.55)] border border-[var(--hl-line)] p-2.5">
 <div className={`${SCENE_TYPOGRAPHY.microMuted} uppercase mb-0.5`}>{g.pauseEcoCurrentMoney}</div>
 <div className="text-sm font-black text-[var(--hl-caution)] font-mono">${money}</div>
 </div>
 {hasNext ? (
 <div className="bg-[rgba(6,7,10,0.55)] border border-[var(--hl-line)] p-2.5">
 <div className={`${SCENE_TYPOGRAPHY.microMuted} uppercase mb-0.5 flex items-center gap-1`}>
 <WaveIcon className="w-3 h-3"/>
 {g.pauseEcoNextKillEstimate}
 </div>
 <div className="text-sm font-black text-[var(--hl-caution)] font-mono">+${nextKillBounty}</div>
 <div className={`${SCENE_TYPOGRAPHY.microMuted} mt-0.5`}>
 {g.pauseEcoEnemyCount.replace('{count}', String(nextEnemyCount))}
 </div>
 </div>
 ) : (
 <div className="bg-[rgba(6,7,10,0.55)] border border-[var(--hl-line)] p-2.5 flex items-center justify-center">
 <span className={SCENE_TYPOGRAPHY.microMuted}>{g.pauseEcoLastWave}</span>
 </div>
 )}
 </div>

 {customBonus != null && (
 <div className="border border-[var(--hl-line)] bg-[var(--hl-deck-2)] px-3 py-2 flex items-center justify-between">
 <span className="text-[11px] text-[var(--hl-ink-2)]">
 {waveActive ? g.pauseEcoWaveClearBonusActive : g.pauseEcoWaveClearBonusNext}
 </span>
 <span className="text-sm font-bold text-[var(--hl-caution)] font-mono">+${customBonus}</span>
 </div>
 )}

 {victoryRewards.length > 0 && (
 <div className="space-y-1.5">
 <div className={`${SCENE_TYPOGRAPHY.microMuted} uppercase tracking-wider flex items-center gap-1`}>
 <TrophyIcon className="w-3 h-3 text-[var(--hl-caution)]"/>
 {g.pauseEcoVictoryRewards}
 </div>
 {victoryRewards.map((r) => (
 <div
 key={r.label}
 className="flex items-center justify-between text-[11px] bg-[rgba(6,7,10,0.55)] border border-[var(--hl-line)] px-3 py-2"
 >
 <span className="text-[var(--hl-ink)]/65">{r.label}</span>
 <span className="font-mono font-bold text-[var(--hl-caution)] text-right max-w-[60%]">
 {r.note ?? (
 <>
 {r.coins ? g.pauseEcoCoinsReward.replace('{amount}', String(r.coins)) : ''}
 {r.coins && r.talent ? ' · ' : ''}
 {r.talent ? (
 <span className="inline-flex items-center gap-0.5">
 <SparklesIcon className="w-3 h-3 inline"/>
 {g.pauseEcoTalentReward.replace('{amount}', String(r.talent))}
 </span>
 ) : null}
 </>
 )}
 </span>
 </div>
 ))}
 </div>
 )}

 {endlessMode && (
 <div className={`${SCENE_TYPOGRAPHY.microMuted} flex items-center gap-1.5 border-t border-[var(--hl-line)] pt-2`}>
 <InfinityIcon className="w-3 h-3"/>
 {g.pauseEcoEndlessNote}
 </div>
 )}
 </div>
 );

 if (bare) return body;

 return (
 <div className="border border-[var(--hl-line)] bg-[var(--hl-void-2)] p-4 space-y-3">
 <div className={`${SCENE_TYPOGRAPHY.microLabel} text-[var(--hl-caution)] flex items-center gap-1.5`}>
 <CoinIcon className="w-3.5 h-3.5"/>
 {g.pauseSessionEconomy}
 </div>
 {body}
 </div>
 );
}

export default PauseWaveEconomy;
