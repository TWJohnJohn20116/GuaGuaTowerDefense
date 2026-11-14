/**
 * 暫停選單 · 本局資訊與難度資料
 */

import { useEffect, useMemo, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useStatsStore } from '@/store/statsStore';
import { useDailyChallengeStore } from '@/store/dailyChallengeStore';
import { PATHS } from '@/data/gameData';
import { findCampaignLevelById } from '@/data/campaignData';
import { getMutatorChallengeById } from '@/data/mutatorChallengeData';
import { formatPlayTime } from '@/types/gameEndReport';
import { SectionGroup } from '@/components/ui';
import { SCENE_TYPOGRAPHY } from '@/components/ui/SceneTypography';
import { useTranslation } from '@/i18n';
import type { Translations } from '@/i18n';
import { PauseMainGoals } from './PauseMainGoals';
import { PauseWaveEconomy } from './PauseWaveEconomy';
import {
 WaveIcon, ShieldIcon, HeartIcon, SkullIcon, FlameIcon,
 DangerIcon, MapIcon, StarIcon, TargetIcon, ClockIcon, CoinIcon, SparklesIcon,
} from '@/components/ui/Icons';

function diffLabel(t: Translations, key: string): string {
 const map: Record<string, string> = {
 easy: t.game.pauseDiffEasy,
 normal: t.game.pauseDiffNormal,
 hard: t.game.pauseDiffHard,
 nightmare: t.game.pauseDiffNightmare,
 impossible: t.game.pauseDiffImpossible,
 custom: t.game.pauseDiffCustom,
 };
 return map[key] ?? key;
}

function mutatorExtras(t: Translations, mutatorRules: ReturnType<typeof useGameStore.getState>['mutatorRules']): string[] {
 const extra: string[] = [];
 if (mutatorRules?.sellingDisabled) extra.push(t.game.pauseMutatorNoSell);
 if (mutatorRules?.skillsDisabled) extra.push(t.game.pauseMutatorNoSkills);
 if (mutatorRules?.buildLockUntilWave) {
 extra.push(t.game.pauseMutatorBuildLock.replace('{wave}', String(mutatorRules.buildLockUntilWave)));
 }
 return extra;
}

function useElapsedSeconds(startMs: number | null | undefined): number {
 const [elapsed, setElapsed] = useState(0);
 useEffect(() => {
 if (!startMs) {
 setElapsed(0);
 return;
 }
 const tick = () => setElapsed(Math.floor((Date.now() - startMs) / 1000));
 tick();
 const id = window.setInterval(tick, 1000);
 return () => window.clearInterval(id);
 }, [startMs]);
 return elapsed;
}

/** 標籤：本局模式與狀態快照 */
export function PauseContextBanner({ bare = false }: { bare?: boolean }) {
 const { t } = useTranslation();
 const selectedPath = useGameStore((s) => s.selectedPath);
 const gameDifficulty = useGameStore((s) => s.gameDifficulty);
 const endlessMode = useGameStore((s) => s.endlessMode);
 const isCampaign = useGameStore((s) => s.isCampaign);
 const campaignLevelId = useGameStore((s) => s.campaignLevelId);
 const mutatorChallengeId = useGameStore((s) => s.mutatorChallengeId);

 const level = isCampaign ? findCampaignLevelById(campaignLevelId) : undefined;
 const mutator = mutatorChallengeId ? getMutatorChallengeById(mutatorChallengeId) : undefined;
 const mapName = PATHS[selectedPath]?.name ?? selectedPath;

 const tags: { key: string; label: string; tone: string }[] = [];

 if (isCampaign && level) {
 tags.push({ key: 'campaign', label: `${t.game.pauseTagCampaign} · ${level.title}`, tone: 'text-[var(--hl-reach)] bg-[var(--hl-deck-2)] border-[var(--hl-line)]' });
 }
 if (mutator) {
 tags.push({ key: 'mutator', label: `${t.game.pauseTagMutator} · ${mutator.name}`, tone: 'text-[var(--hl-ink-2)] bg-[var(--hl-deck-2)] border-[var(--hl-line)]' });
 }
 if (endlessMode) {
 tags.push({ key: 'endless', label: t.game.pauseTagEndless, tone: 'text-[var(--hl-ink-2)] bg-[var(--hl-deck-2)] border-[var(--hl-line)]' });
 }
 const activeProtocol = useGameStore((s) => s.activeProtocol);
 if (activeProtocol) {
        tags.push({ key: 'protocol', label: `協議 · ${activeProtocol.name}`, tone: 'text-[var(--hl-reach)] bg-[var(--hl-deck-2)] border-[var(--hl-line)]' });
 }

 const body = (
 <>
 {!bare && (
 <div className={`flex items-center gap-2 ${SCENE_TYPOGRAPHY.microLabel}`}>
 <MapIcon className="w-3.5 h-3.5"/>
 {t.game.pauseSessionInfo}
 </div>
 )}
 <div className="text-sm font-bold text-[var(--hl-ink)]">{mapName}</div>
 <div className="flex flex-wrap gap-1.5">
 <span className={`${SCENE_TYPOGRAPHY.micro} font-bold px-2 py-1 border border-[var(--hl-line)] bg-[var(--hl-deck-2)] text-[var(--hl-ink-3)]`}>
 {t.game.pauseDifficultyPrefix.replace('{diff}', diffLabel(t, gameDifficulty))}
 </span>
 {tags.map((t) => (
 <span key={t.key} className={`text-[10px] font-bold px-2 py-1 border ${t.tone}`}>
 {t.label}
 </span>
 ))}
 </div>
 </>
 );

 if (bare) return <div className="space-y-2">{body}</div>;

 return (
 <div className="border border-[var(--hl-line)] bg-[var(--hl-deck-2)] p-3 space-y-2">
 {body}
 </div>
 );
}

/** 本局難度說明 */
export function PauseWaveProgress({ bare = false }: { bare?: boolean }) {
 const { t } = useTranslation();
 const currentWave = useGameStore((s) => s.currentWave);
 const maxWaves = useGameStore((s) => s.maxWaves);
 const endlessMode = useGameStore((s) => s.endlessMode);
 const waveActive = useGameStore((s) => s.waveActive);

 const activeSuffix = waveActive ? t.game.pauseWaveActiveSuffix : '';
 const label = endlessMode || maxWaves <= 0
 ? t.game.pauseWaveEndlessFormat.replace('{wave}', String(currentWave)) + activeSuffix
 : t.game.pauseWaveNormalFormat
 .replace('{current}', String(currentWave))
 .replace('{max}', String(maxWaves)) + activeSuffix;

 const percent = endlessMode || maxWaves <= 0
 ? Math.min(100, currentWave * 5)
 : Math.min(100, (currentWave / maxWaves) * 100);

 const progressBar = !endlessMode && maxWaves > 0 && (
 <div className="h-1.5 bg-[var(--hl-deck-3)] overflow-hidden">
 <div
 className="h-full "
 style={{ width: `${percent}%` }}
 />
 </div>
 );

 const body = (
 <>
 {!bare && (
 <div className="flex items-center justify-between mb-2">
 <span className={`${SCENE_TYPOGRAPHY.microLabel} flex items-center gap-1.5`}>
 <WaveIcon className="w-3.5 h-3.5 text-[var(--hl-reach)]"/>
 {t.game.pauseWaveProgressLabel}
 </span>
 <span className="text-xs font-bold text-[var(--hl-reach)]">{label}</span>
 </div>
 )}
 {bare && (
 <div className="flex items-center justify-between mb-2">
 <span className="text-xs font-bold text-[var(--hl-reach)]">{label}</span>
 </div>
 )}
 {progressBar}
 </>
 );

 if (bare) return <div>{body}</div>;

 return (
 <div className="border border-[var(--hl-line)] bg-[var(--hl-deck-2)] p-3">
 {body}
 </div>
 );
}

/** 本局成就檢查（無傷、無失誤、無減員、限時內） */
export function PauseSessionMetrics() {
 const { t } = useTranslation();
 const score = useGameStore((s) => s.score);
 const currentGame = useStatsStore((s) => s.currentGame);
 const elapsed = useElapsedSeconds(currentGame?.gameStartTime);

 if (!currentGame) return null;

 const items = [
 { icon: <StarIcon className="w-4 h-4 text-[var(--hl-caution)]"/>, value: score.toLocaleString(), label: t.game.pauseMetricScore, tone: 'text-[var(--hl-caution)]' },
 { icon: <ClockIcon className="w-4 h-4 text-[var(--hl-ink-2)]"/>, value: formatPlayTime(elapsed), label: t.game.pauseMetricDuration, tone: 'text-[var(--hl-ink-2)]' },
 { icon: <ShieldIcon className="w-4 h-4 text-[var(--hl-reach)]"/>, value: String(currentGame.perfectWaves), label: t.game.pauseMetricPerfectWaves, tone: 'text-[var(--hl-reach)]' },
 { icon: <HeartIcon className="w-4 h-4 text-[var(--hl-alarm)]"/>, value: String(currentGame.damageTaken), label: t.game.pauseMetricDamageTaken, tone: 'text-[var(--hl-alarm)]' },
 { icon: <SkullIcon className="w-4 h-4 text-[var(--hl-alarm)]"/>, value: String(currentGame.totalEnemiesKilled), label: t.game.pauseMetricKills, tone: 'text-[var(--hl-alarm)]' },
 { icon: <TargetIcon className="w-4 h-4 text-[var(--hl-caution)]"/>, value: Math.floor(currentGame.totalDamageDealt).toLocaleString(), label: t.game.pauseMetricTotalDamage, tone: 'text-[var(--hl-caution)]' },
 ];

 return (
 <div className="grid grid-cols-3 gap-2">
 {items.map((item) => (
 <div key={item.label} className="border border-[var(--hl-line)] bg-[rgba(6,7,10,0.55)] p-2.5 text-center">
 <div className="flex justify-center mb-1">{item.icon}</div>
 <div className={`text-sm font-black font-mono tabular-nums ${item.tone}`}>{item.value}</div>
 <div className={`${SCENE_TYPOGRAPHY.microMuted} uppercase tracking-wider mt-0.5`}>{item.label}</div>
 </div>
 ))}
 </div>
 );
}

/** 每日刷新 + 環境提示（不顯示細項） */
function PauseChallengeRules() {
 const { t } = useTranslation();
 const todayChallenge = useDailyChallengeStore((s) => s.todayChallenge);
 const mutatorChallengeId = useGameStore((s) => s.mutatorChallengeId);
 const mutatorRules = useGameStore((s) => s.mutatorRules);

 const dailySummary = useMemo(() => {
 if (!todayChallenge || todayChallenge.completed) return null;
 const { template, progress } = todayChallenge;
 let total = 0;
 let done = 0;
 template.conditions.forEach((c, i) => {
 total += c.target;
 done += Math.min(c.target, progress[i] ?? 0);
 });
 const pct = total > 0 ? Math.round((done / total) * 100) : 0;
 const nextCond = template.conditions.find((c, i) => (progress[i] ?? 0) < c.target);
 return { name: template.name, pct, nextLabel: nextCond?.label };
 }, [todayChallenge]);

 const def = mutatorChallengeId ? getMutatorChallengeById(mutatorChallengeId) : undefined;
 const tags = def?.tags ?? [];
 const extra = mutatorExtras(t, mutatorRules);
 const allTags = [...tags, ...extra];
 const hasMutators = Boolean(def || mutatorRules) && allTags.length > 0;

 if (!dailySummary && !hasMutators) return null;

 return (
 <SectionGroup
 title={t.game.pauseChallengeRules}
 icon={<FlameIcon className="h-5 w-5"/>}
 accent="amber"
 columns={1}
 >
 <div className="col-span-full space-y-3">
 {dailySummary && (
 <div className="border border-[var(--hl-line)] bg-[var(--hl-void-2)] p-3">
 <div className={`mb-2 flex items-center gap-2 ${SCENE_TYPOGRAPHY.microLabel} text-[var(--hl-caution)]`}>
 <FlameIcon className="h-3.5 w-3.5"/>
 {t.game.pauseDailyChallengePct.replace('{pct}', String(dailySummary.pct))}
 </div>
 <div className="mb-2 truncate text-xs text-[var(--hl-ink-2)]">{dailySummary.name}</div>
 {dailySummary.nextLabel && (
 <div className={SCENE_TYPOGRAPHY.microMuted}>
 {t.game.pauseNextGoal.replace('{label}', dailySummary.nextLabel)}
 </div>
 )}
 </div>
 )}
 {hasMutators && (
 <div className="border border-[var(--hl-line)] bg-[var(--hl-void-2)] p-3">
 <div className={`mb-2 flex items-center gap-1.5 ${SCENE_TYPOGRAPHY.microLabel} text-[var(--hl-ink-2)]`}>
 <DangerIcon className="h-3.5 w-3.5"/>
 {t.game.pauseMutatorRulesTitle}
 </div>
 <div className="flex flex-wrap gap-1.5">
 {allTags.map((tag) => (
 <span
 key={tag}
 className="border border-[var(--hl-line)] bg-[var(--hl-deck-2)] px-2 py-1 text-[10px] font-bold text-[var(--hl-ink-2)]"
 >
 {tag}
 </span>
 ))}
 </div>
 </div>
 )}
 </div>
 </SectionGroup>
 );
}

/** 每日刷新與場地提示 */
export function PauseDailyMini() {
 const { t } = useTranslation();
 const todayChallenge = useDailyChallengeStore((s) => s.todayChallenge);

 const summary = useMemo(() => {
 if (!todayChallenge || todayChallenge.completed) return null;
 const { template, progress } = todayChallenge;
 let total = 0;
 let done = 0;
 template.conditions.forEach((c, i) => {
 total += c.target;
 done += Math.min(c.target, progress[i] ?? 0);
 });
 const pct = total > 0 ? Math.round((done / total) * 100) : 0;
 const nextCond = template.conditions.find((c, i) => (progress[i] ?? 0) < c.target);
 return { name: template.name, pct, nextLabel: nextCond?.label };
 }, [todayChallenge]);

 if (!summary) return null;

 return (
 <div className="border border-[var(--hl-line)] bg-[var(--hl-void-2)] p-3">
 <div className={`flex items-center gap-2 ${SCENE_TYPOGRAPHY.microLabel} text-[var(--hl-caution)] mb-2`}>
 <FlameIcon className="w-3.5 h-3.5"/>
 {t.game.pauseDailyChallengePct.replace('{pct}', String(summary.pct))}
 </div>
 <div className="text-xs text-[var(--hl-ink-2)] mb-2 truncate">{summary.name}</div>
 {summary.nextLabel && (
 <div className={SCENE_TYPOGRAPHY.microMuted}>
 {t.game.pauseNextGoal.replace('{label}', summary.nextLabel)}
 </div>
 )}
 </div>
 );
}

/** 環境提示內容 */
export function PauseMutatorRules() {
 const { t } = useTranslation();
 const mutatorChallengeId = useGameStore((s) => s.mutatorChallengeId);
 const mutatorRules = useGameStore((s) => s.mutatorRules);

 const def = mutatorChallengeId ? getMutatorChallengeById(mutatorChallengeId) : undefined;
 if (!def && !mutatorRules) return null;

 const tags = def?.tags ?? [];
 const extra = mutatorExtras(t, mutatorRules);

 const allTags = [...tags, ...extra];
 if (allTags.length === 0) return null;

 return (
 <div className="border border-[var(--hl-line)] bg-[var(--hl-void-2)] p-3">
 <div className={`${SCENE_TYPOGRAPHY.microLabel} text-[var(--hl-ink-2)] mb-2 flex items-center gap-1.5`}>
 <DangerIcon className="w-3.5 h-3.5"/>
 {t.game.pauseMutatorRulesTitle}
 </div>
 <div className="flex flex-wrap gap-1.5">
 {allTags.map((tag) => (
 <span
 key={tag}
 className="text-[10px] font-bold px-2 py-1 border border-[var(--hl-line)] bg-[var(--hl-deck-2)] text-[var(--hl-ink-2)]"
 >
 {tag}
 </span>
 ))}
 </div>
 </div>
 );
}

/** 主控台按鈕列 */
export function PauseSessionPanel() {
 const { t } = useTranslation();
 const activeProtocol = useGameStore((s) => s.activeProtocol);
 const protocolDiscount = useGameStore((s) => s.protocolNextTowerDiscount);

 return (
 <div className="space-y-4">
 <SectionGroup
 title={t.game.pauseSessionInfo}
 icon={<MapIcon className="h-5 w-5"/>}
 accent="cyan"
 columns={1}
 >
 <div className="col-span-full space-y-3">
 <PauseContextBanner bare />
 <PauseWaveProgress bare />
 {(activeProtocol || protocolDiscount > 0) && (
 <div className="border border-[var(--hl-line)] bg-[var(--hl-void-2)] p-3">
 <div className={`${SCENE_TYPOGRAPHY.microLabel} mb-2 flex items-center gap-1.5 text-[var(--hl-reach)]`}>
 <SparklesIcon className="h-3.5 w-3.5"/>
 {t.game.tacticalProtocol.pauseTitle}
 </div>
 <div className="flex flex-wrap gap-1.5">
 {activeProtocol && (
 <span className="border border-[var(--hl-line)] bg-[var(--hl-deck-2)] px-2 py-1 text-[10px] font-bold text-[var(--hl-reach)]">
 {activeProtocol.name}
 </span>
 )}
 {protocolDiscount > 0 && (
 <span className="border border-[var(--hl-line)] bg-[var(--hl-deck-2)] px-2 py-1 text-[10px] font-bold text-[var(--hl-vital)]">
 {t.game.tacticalProtocol.discountHud.replace('{pct}', String(Math.round(protocolDiscount * 100)))}
 </span>
 )}
 </div>
 </div>
 )}
 </div>
 </SectionGroup>

 <SectionGroup
 title={t.game.pauseSessionGoals}
 icon={<TargetIcon className="h-5 w-5"/>}
 accent="emerald"
 columns={1}
 >
 <div className="col-span-full">
 <PauseMainGoals bare />
 </div>
 </SectionGroup>

 <SectionGroup
 title={t.game.pauseSessionEconomy}
 icon={<CoinIcon className="h-5 w-5"/>}
 accent="amber"
 columns={1}
 >
 <div className="col-span-full">
 <PauseWaveEconomy bare />
 </div>
 </SectionGroup>

 <SectionGroup
 title={t.game.pauseSessionMetrics}
 icon={<StarIcon className="h-5 w-5"/>}
 accent="purple"
 columns={1}
 >
 <div className="col-span-full">
 <PauseSessionMetrics />
 </div>
 </SectionGroup>

 <PauseChallengeRules />
 </div>
 );
}
