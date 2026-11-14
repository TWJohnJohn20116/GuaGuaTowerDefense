/**
 * 暫停選單 · 本局資訊與難度資料
 */

import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useStatsStore } from '@/store/statsStore';
import { PATHS } from '@/data/gameData';
import { formatPlayTime } from '@/types/gameEndReport';
import { SectionGroup } from '@/components/ui';
import { SCENE_TYPOGRAPHY } from '@/components/ui/SceneTypography';
import { useTranslation } from '@/i18n';
import type { Translations } from '@/i18n';
import { PauseMainGoals } from './PauseMainGoals';
import { PauseWaveEconomy } from './PauseWaveEconomy';
import {
 WaveIcon, ShieldIcon, HeartIcon, SkullIcon,
 MapIcon, StarIcon, TargetIcon, ClockIcon, CoinIcon, SparklesIcon,
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
function PauseContextBanner({ bare = false }: { bare?: boolean }) {
 const { t } = useTranslation();
 const selectedPath = useGameStore((s) => s.selectedPath);
 const gameDifficulty = useGameStore((s) => s.gameDifficulty);
 const endlessMode = useGameStore((s) => s.endlessMode);
 const mapName = PATHS[selectedPath]?.name ?? selectedPath;

 const tags: { key: string; label: string; tone: string }[] = [];

 if (endlessMode) {
 tags.push({ key: 'endless', label: t.game.pauseTagEndless, tone: 'text-[var(--arc-ink-2)] bg-[var(--arc-deck-2)] border-[var(--cn-line-soft)]' });
 }
 const activeProtocol = useGameStore((s) => s.activeProtocol);
 if (activeProtocol) {
        tags.push({ key: 'protocol', label: `協議 · ${activeProtocol.name}`, tone: 'text-[var(--arc-reach)] bg-[var(--arc-deck-2)] border-[var(--cn-line-soft)]' });
 }

 const body = (
 <>
 {!bare && (
 <div className={`flex items-center gap-2 ${SCENE_TYPOGRAPHY.microLabel}`}>
 <MapIcon className="w-3.5 h-3.5"/>
 {t.game.pauseSessionInfo}
 </div>
 )}
 <div className="text-sm font-bold text-[var(--arc-ink)]">{mapName}</div>
 <div className="flex flex-wrap gap-1.5">
 <span className={`arc-chip ${SCENE_TYPOGRAPHY.micro} font-bold text-[var(--arc-ink-3)]`}>
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
 <div className="arc-panel--flat p-3 space-y-2">
 {body}
 </div>
 );
}

/** 本局難度說明 */
function PauseWaveProgress({ bare = false }: { bare?: boolean }) {
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
 <div className="h-1.5 bg-[var(--arc-deck-3)] border-[3px] border-[var(--cn-line-soft)] overflow-hidden">
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
 <WaveIcon className="w-3.5 h-3.5 text-[var(--arc-reach)]"/>
 {t.game.pauseWaveProgressLabel}
 </span>
 <span className="text-xs font-bold text-[var(--arc-reach)]">{label}</span>
 </div>
 )}
 {bare && (
 <div className="flex items-center justify-between mb-2">
 <span className="text-xs font-bold text-[var(--arc-reach)]">{label}</span>
 </div>
 )}
 {progressBar}
 </>
 );

 if (bare) return <div>{body}</div>;

 return (
 <div className="arc-panel--flat p-3">
 {body}
 </div>
 );
}

/** 本局成就檢查（無傷、無失誤、無減員、限時內） */
function PauseSessionMetrics() {
 const { t } = useTranslation();
 const score = useGameStore((s) => s.score);
 const currentGame = useStatsStore((s) => s.currentGame);
 const elapsed = useElapsedSeconds(currentGame?.gameStartTime);

 if (!currentGame) return null;

 const items = [
 { icon: <StarIcon className="w-4 h-4 text-[var(--arc-caution)]"/>, value: score.toLocaleString(), label: t.game.pauseMetricScore, tone: 'text-[var(--arc-caution)]' },
 { icon: <ClockIcon className="w-4 h-4 text-[var(--arc-ink-2)]"/>, value: formatPlayTime(elapsed), label: t.game.pauseMetricDuration, tone: 'text-[var(--arc-ink-2)]' },
 { icon: <ShieldIcon className="w-4 h-4 text-[var(--arc-reach)]"/>, value: String(currentGame.perfectWaves), label: t.game.pauseMetricPerfectWaves, tone: 'text-[var(--arc-reach)]' },
 { icon: <HeartIcon className="w-4 h-4 text-[var(--arc-alert)]"/>, value: String(currentGame.damageTaken), label: t.game.pauseMetricDamageTaken, tone: 'text-[var(--arc-alert)]' },
 { icon: <SkullIcon className="w-4 h-4 text-[var(--arc-alert)]"/>, value: String(currentGame.totalEnemiesKilled), label: t.game.pauseMetricKills, tone: 'text-[var(--arc-alert)]' },
 { icon: <TargetIcon className="w-4 h-4 text-[var(--arc-caution)]"/>, value: Math.floor(currentGame.totalDamageDealt).toLocaleString(), label: t.game.pauseMetricTotalDamage, tone: 'text-[var(--arc-caution)]' },
 ];

 return (
 <div className="grid grid-cols-3 gap-2">
 {items.map((item) => (
 <div key={item.label} className="arc-panel--sunken p-2.5 text-center">
 <div className="flex justify-center mb-1">{item.icon}</div>
 <div className={`arc-num text-sm font-mono tabular-nums ${item.tone}`}>{item.value}</div>
 <div className={`${SCENE_TYPOGRAPHY.microMuted} uppercase tracking-wider mt-0.5`}>{item.label}</div>
 </div>
 ))}
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
 <div className="arc-panel p-3">
 <div className={`${SCENE_TYPOGRAPHY.microLabel} mb-2 flex items-center gap-1.5 text-[var(--arc-reach)]`}>
 <SparklesIcon className="h-3.5 w-3.5"/>
 {t.game.tacticalProtocol.pauseTitle}
 </div>
 <div className="flex flex-wrap gap-1.5">
 {activeProtocol && (
 <span className="arc-chip text-[10px] font-bold text-[var(--arc-reach)]">
 {activeProtocol.name}
 </span>
 )}
 {protocolDiscount > 0 && (
 <span className="arc-chip text-[10px] font-bold text-[var(--arc-vital)]">
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

 </div>
 );
}
