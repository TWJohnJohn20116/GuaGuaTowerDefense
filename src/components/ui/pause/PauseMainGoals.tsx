/**
 * 暫停主控台 · 本局目標
 */

import { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useStatsStore } from '@/store/statsStore';
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
 return <CheckIcon className="w-4 h-4 text-[var(--arc-vital)] flex-shrink-0"/>;
 }
 if (status === 'active') {
 return <span className="w-2 h-2 bg-[var(--arc-deck-2)] flex-shrink-0 animate-pulse"/>;
 }
 return <span className="w-2 h-2 bg-[var(--arc-deck-3)] flex-shrink-0"/>;
}

export function PauseMainGoals({ bare = false }: { bare?: boolean }) {
 const { t } = useTranslation();
 const g = t.game;
 const currentWave = useGameStore((s) => s.currentWave);
 const maxWaves = useGameStore((s) => s.maxWaves);
 const endlessMode = useGameStore((s) => s.endlessMode);
 const waveActive = useGameStore((s) => s.waveActive);
 const currentGame = useStatsStore((s) => s.currentGame);

 const goals = useMemo((): GoalRow[] => {
 const rows: GoalRow[] = [];
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
 g, currentWave, maxWaves, endlessMode, waveActive, currentGame,
 ]);

 const list = (
 <div className="space-y-2">
 {goals.map((row) => (
 <div
 key={row.id}
 className={`arc-panel--flat px-3 py-2.5 ${
 row.status === 'done'
 ? 'bg-[var(--arc-deck-2)] border-[var(--cn-line-soft)]'
 : row.status === 'active'
 ? 'bg-[var(--arc-deck-2)] border-[var(--cn-line-soft)]'
 : 'bg-[var(--cn-card-2)] border-[var(--cn-line-soft)]'
 }`}
 >
 <div className="flex items-start gap-2">
 <GoalStatusIcon status={row.status} />
 <div className="flex-1 min-w-0">
 <div className="flex items-center justify-between gap-2">
 <span className="text-xs font-bold text-[var(--arc-ink)]/85">{row.label}</span>
 {row.badge && (
 <span className="text-[10px] font-mono text-[var(--arc-reach)] flex-shrink-0">{row.badge}</span>
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
 <div className="arc-panel p-4">
 <div className={`${SCENE_TYPOGRAPHY.microLabel} text-[var(--arc-vital)] mb-3 flex items-center gap-1.5`}>
 <TargetIcon className="w-3.5 h-3.5"/>
 {g.pauseSessionGoals}
 </div>
 {list}
 </div>
 );
}

export default PauseMainGoals;
