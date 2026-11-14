/**
 * 暫停主控台 · 本局目標
 */

import { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useStatsStore } from '@/store/statsStore';
import { findCampaignLevelById } from '@/data/campaignData';
import { getMutatorChallengeById } from '@/data/mutatorChallengeData';
import {
 calculateCampaignStars,
 getStarRequirementPercents,
} from '@/utils/campaignStars';
import { SCENE_TYPOGRAPHY } from '@/components/ui/SceneTypography';
import { useTranslation } from '@/i18n';
import {
 TargetIcon, CheckIcon,
} from '@/components/ui/Icons';

type GoalStatus = 'done' | 'active' | 'pending';

interface GoalRow {
 id: string;
 label: string;
 detail?: string;
 status: GoalStatus;
 badge?: string;
}

function GoalStatusIcon({ status }: { status: GoalStatus }) {
 if (status === 'done') {
 return <CheckIcon className="w-4 h-4 text-[var(--hl-vital)] flex-shrink-0"/>;
 }
 if (status === 'active') {
 return <span className="w-2 h-2 bg-[var(--hl-deck-2)] flex-shrink-0 animate-pulse"/>;
 }
 return <span className="w-2 h-2 bg-[var(--hl-deck-4)] flex-shrink-0"/>;
}

export function PauseMainGoals({ bare = false }: { bare?: boolean }) {
 const { t } = useTranslation();
 const g = t.game;
 const currentWave = useGameStore((s) => s.currentWave);
 const maxWaves = useGameStore((s) => s.maxWaves);
 const endlessMode = useGameStore((s) => s.endlessMode);
 const waveActive = useGameStore((s) => s.waveActive);
 const health = useGameStore((s) => s.health);
 const startingHealth = useGameStore((s) => s.difficultyModifiers.startingHealth);
 const isCampaign = useGameStore((s) => s.isCampaign);
 const campaignLevelId = useGameStore((s) => s.campaignLevelId);
 const mutatorChallengeId = useGameStore((s) => s.mutatorChallengeId);
 const currentGame = useStatsStore((s) => s.currentGame);

 const goals = useMemo((): GoalRow[] => {
 const rows: GoalRow[] = [];
 const level = isCampaign ? findCampaignLevelById(campaignLevelId) : undefined;
 const mutator = mutatorChallengeId ? getMutatorChallengeById(mutatorChallengeId) : undefined;
 const { twoStarPercent, threeStarPercent } = getStarRequirementPercents();
 const healthPct = startingHealth > 0
 ? Math.round((health / startingHealth) * 100)
 : 0;

 if (endlessMode || maxWaves <= 0) {
 rows.push({
 id: 'endless',
 label: g.pauseGoalEndlessSurvival,
 detail: g.pauseGoalEndlessDetail,
 status: 'active',
 badge: g.pauseGoalWaveBadge.replace('{wave}', String(currentWave)),
 });
 } else {
 const cleared = !waveActive && currentWave >= maxWaves;
 rows.push({
 id: 'clear',
 label: g.pauseGoalClearAllWaves.replace('{max}', String(maxWaves)),
 status: cleared ? 'done' : 'active',
 badge: `${Math.min(currentWave, maxWaves)}/${maxWaves}`,
 });
 }

 if (isCampaign && level) {
 const stars = calculateCampaignStars(health, startingHealth);
 rows.push({
 id: 'campaign-stars',
 label: g.pauseGoalCampaignStars,
 detail: g.pauseGoalStarRequirements
 .replace('{three}', String(threeStarPercent))
 .replace('{two}', String(twoStarPercent)),
 status: stars >= 3 ? 'done' : stars >= 2 ? 'active' : 'pending',
 badge: g.pauseGoalStarBadge
 .replace('{stars}', String(stars))
 .replace('{hp}', String(healthPct)),
 });
 if (level.specialRules?.length) {
 rows.push({
 id: 'campaign-rules',
 label: g.pauseGoalSpecialRules,
 detail: level.specialRules.slice(0, 2).join(' · '),
 status: 'active',
 });
 }
 }

 if (mutator) {
 rows.push({
 id: 'mutator-clear',
 label: g.pauseGoalMutatorClear.replace('{name}', mutator.name),
 detail: mutator.tips,
 status: 'active',
 });
 }

 if (currentGame) {
 const perfectThisWave = waveActive && currentGame.lastWaveDamageTaken === 0;
 rows.push({
 id: 'perfect-wave',
 label: waveActive ? g.pauseGoalPerfectWaveActive : g.pauseGoalPerfectWaveNext,
 detail: waveActive
 ? (perfectThisWave
 ? g.pauseGoalPerfectKeep
 : g.pauseGoalPerfectLeak.replace('{damage}', String(currentGame.lastWaveDamageTaken)))
 : g.pauseGoalPerfectTotal.replace('{count}', String(currentGame.perfectWaves)),
 status: perfectThisWave ? 'active' : currentGame.perfectWaves > 0 ? 'done' : 'pending',
 badge: waveActive && perfectThisWave ? g.pauseGoalInProgress : undefined,
 });
 }

 return rows;
 }, [
 g, currentWave, maxWaves, endlessMode, waveActive, health, startingHealth,
 isCampaign, campaignLevelId, mutatorChallengeId, currentGame,
 ]);

 const list = (
 <div className="space-y-2">
 {goals.map((row) => (
 <div
 key={row.id}
 className={` border px-3 py-2.5 ${
 row.status === 'done'
 ? 'bg-[var(--hl-deck-2)] border-[var(--hl-line)]'
 : row.status === 'active'
 ? 'bg-[var(--hl-deck-2)] border-[var(--hl-line)]'
 : 'bg-[rgba(6,7,10,0.55)] border-[var(--hl-line)]'
 }`}
 >
 <div className="flex items-start gap-2">
 <GoalStatusIcon status={row.status} />
 <div className="flex-1 min-w-0">
 <div className="flex items-center justify-between gap-2">
 <span className="text-xs font-bold text-[var(--hl-ink)]/85">{row.label}</span>
 {row.badge && (
 <span className="text-[10px] font-mono text-[var(--hl-reach)] flex-shrink-0">{row.badge}</span>
 )}
 </div>
 {row.detail && (
 <div className={`${SCENE_TYPOGRAPHY.microMuted} mt-1 leading-snug`}>{row.detail}</div>
 )}
 </div>
 </div>
 </div>
 ))}
 </div>
 );

 if (bare) return list;

 return (
 <div className="border border-[var(--hl-line)] bg-[var(--hl-void-2)] p-4">
 <div className={`${SCENE_TYPOGRAPHY.microLabel} text-[var(--hl-vital)] mb-3 flex items-center gap-1.5`}>
 <TargetIcon className="w-3.5 h-3.5"/>
 {g.pauseSessionGoals}
 </div>
 {list}
 </div>
 );
}

export default PauseMainGoals;
