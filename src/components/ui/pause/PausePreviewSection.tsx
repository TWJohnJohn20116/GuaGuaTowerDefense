/**
 * 暫停選單 · 下波預覽（敵人組成 + 敵人特性 + 剋制建議）
 */

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/i18n';
import { ENEMY_DATA, WAVE_CONFIGS, generateEndlessWaveConfig, GAME_CONSTANTS } from '@/data/gameData';
import type { EnemyType } from '@/types/game';
import EnemyPreview from '@/components/ui/EnemyPreview';
import {
 EyeIcon, TargetIcon, LightbulbIcon, TowerIcon, CheckIcon, WaveIcon,
} from '@/components/ui/Icons';
import { getEnemyTraitTags } from './pauseEnemyTraits';
import { buildCounterHints } from './pauseNextWaveHints';
import { PauseEncyclopediaEnemyLink, PauseEncyclopediaTowerLink } from './PauseEncyclopediaEnemyLink';
import { PauseEnemyTraitChip } from './PauseEnemyTraitChip';
import { PauseSectionShell } from './PauseSectionShell';
import { SceneFilterChip } from '@/components/ui/SceneBrowseParts';
import { SceneChoiceButton } from '@/components/ui/SceneChoiceParts';
import { SCENE_TYPOGRAPHY } from '@/components/ui/SceneTypography';

interface WaveEnemyGroup {
 type: EnemyType;
 count: number;
}

export function PausePreviewSection() {
 const { t } = useTranslation();
 const g = t.game;
 const currentWave = useGameStore((s) => s.currentWave);
 const endlessMode = useGameStore((s) => s.endlessMode);
 const maxWaves = useGameStore((s) => s.maxWaves);
 const towers = useGameStore((s) => s.towers);
 const [selectedType, setSelectedType] = useState<EnemyType | null>(null);

 const ownedTowerTypes = useMemo(
 () => new Set(towers.map((tw) => tw.type)),
 [towers],
 );

 const nextWaveConfig = useMemo(() => {
 const nextWave = currentWave + 1;
 if (endlessMode) return generateEndlessWaveConfig(nextWave);
 if (maxWaves > 0 && currentWave >= maxWaves) return null;
 const idx = nextWave - 1;
 if (idx >= 0 && idx < WAVE_CONFIGS.length) return WAVE_CONFIGS[idx];
 return generateEndlessWaveConfig(nextWave);
 }, [currentWave, endlessMode, maxWaves]);

 const enemyGroups = useMemo<WaveEnemyGroup[]>(() => {
 if (!nextWaveConfig) return [];
 return nextWaveConfig.enemies.map((g) => ({
 type: g.type as EnemyType,
 count: g.count,
 }));
 }, [nextWaveConfig]);

 const waveMeta = useMemo(() => {
 if (!nextWaveConfig) return null;
 let total = 0;
 let totalHp = 0;
 let estMs = 0;
 let hasBoss = false;
 let hasElite = false;

 nextWaveConfig.enemies.forEach((g) => {
 const data = ENEMY_DATA[g.type as keyof typeof ENEMY_DATA];
 total += g.count;
 if (data) totalHp += (data.health || 0) * g.count;
 const spawnDelay = 'delay' in g ? (g as { delay?: number }).delay : undefined;
 if (spawnDelay) estMs += spawnDelay;
 estMs += g.count * GAME_CONSTANTS.ENEMY_SPAWN_DELAY;
 if (g.type === 'boss' || g.type === 'miniboss') hasBoss = true;
 if (g.type === 'elite' || g.type === 'berserker' || g.type === 'mage') hasElite = true;
 });

 return {
 total,
 types: nextWaveConfig.enemies.length,
 totalHp,
 estSec: Math.ceil(estMs / 1000),
 hasBoss,
 hasElite,
 };
 }, [nextWaveConfig]);

 useEffect(() => {
 if (enemyGroups.length === 0) {
 setSelectedType(null);
 return;
 }
 setSelectedType((prev) => {
 if (prev && enemyGroups.some((g) => g.type === prev)) return prev;
 return enemyGroups[0].type;
 });
 }, [enemyGroups]);

 const guides = t.tutorial.enemyGuides as Record<
 string,
 {
 weakness?: string;
 tips?: string[];
 counterReasons?: Record<string, string>;
 }
 >;

 const selectedGroup = enemyGroups.find((g) => g.type === selectedType) ?? null;

 return (
 <motion.div
 key="preview"
 initial={{ opacity: 0, y: 5 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -5 }}
 transition={{ duration: 0.18 }}
 className="space-y-4"
 >
 <PauseSectionShell
 title={t.game.pauseWaveLabel.replace('{wave}', String(currentWave + 1))}
 icon={<WaveIcon className="h-5 w-5"/>}
 accent="purple"
 action={
 <SceneFilterChip active accent="purple"onClick={() => {}} disabled size="sm"className="pointer-events-none normal-case tracking-normal">
 {endlessMode ? t.game.pauseEndlessMode : t.game.pauseNormalMode}
 </SceneFilterChip>
 }
 >
 {waveMeta ? (
 <div className="flex gap-2 overflow-x-auto no-scrollbar">
 <MetaChip label={g.pauseEnemyCountLabel} value={waveMeta.total} />
 <MetaChip label={g.pausePreviewTypes} value={waveMeta.types} tone="text-[var(--hl-ink-2)]"/>
 <MetaChip label={g.pausePreviewTotalHp} value={waveMeta.totalHp.toLocaleString()} tone="text-[var(--hl-alarm)]"/>
 <MetaChip label={g.pausePreviewEstimate} value={`${waveMeta.estSec}s`} tone="text-[var(--hl-reach)]"/>
 {waveMeta.hasBoss && <BadgeChip label={g.waveTagBoss} tone="rose"/>}
 {waveMeta.hasElite && <BadgeChip label={g.pausePreviewElite} tone="amber"/>}
 </div>
 ) : (
 <div className={`py-6 text-center text-xs ${SCENE_TYPOGRAPHY.microMuted}`}>{g.pausePreviewNoMoreWaves}</div>
 )}
 </PauseSectionShell>

 {enemyGroups.length > 0 && (
 <div className="grid min-h-0 grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
 <PauseSectionShell
 title={g.pausePreviewEnemyList}
 icon={<EyeIcon className="h-5 w-5"/>}
 accent="indigo"
 action={<span className={SCENE_TYPOGRAPHY.microMuted}>{g.pausePreviewTypeCount.replace('{count}', String(enemyGroups.length))}</span>}
 >
 <div className="flex max-h-[280px] min-h-[200px] flex-col">
 <div className="-mx-0.5 flex gap-2 overflow-x-auto px-0.5 pb-1 no-scrollbar sm:hidden">
 {enemyGroups.map((group) => (
 <EnemyChip
 key={group.type}
 group={group}
 selected={selectedType === group.type}
 onSelect={() => setSelectedType(group.type)}
 layout="chip"
 />
 ))}
 </div>
 <div className="hidden flex-1 space-y-1 overflow-y-auto no-scrollbar sm:block">
 {enemyGroups.map((group) => (
 <EnemyChip
 key={group.type}
 group={group}
 selected={selectedType === group.type}
 onSelect={() => setSelectedType(group.type)}
 layout="row"
 />
 ))}
 </div>
 </div>
 </PauseSectionShell>

 <PauseSectionShell
 title={g.pausePreviewTacticDetail}
 icon={<TargetIcon className="h-5 w-5"/>}
 accent="emerald"
 >
 <div className="min-h-[240px]">
 {selectedGroup ? (
 <EnemyTacticDetail
 type={selectedGroup.type}
 count={selectedGroup.count}
 guide={guides[selectedGroup.type]}
 ownedTowerTypes={ownedTowerTypes}
 />
 ) : (
 <div className={`py-8 text-center text-xs ${SCENE_TYPOGRAPHY.microMuted}`}>{g.pausePreviewSelectEnemy}</div>
 )}
 </div>
 </PauseSectionShell>
 </div>
 )}
 </motion.div>
 );
}

function MetaChip({
 label,
 value,
 tone = 'text-[var(--hl-ink)]',
}: {
 label: string;
 value: string | number;
 tone?: string;
}) {
 return (
 <div className="flex-shrink-0 bg-[rgba(6,7,10,0.55)] border border-[var(--hl-line)] px-3 py-2 min-w-[4.5rem] text-center">
 <div className={`${SCENE_TYPOGRAPHY.microMuted} uppercase`}>{label}</div>
 <div className={`text-sm font-bold font-mono ${tone}`}>{value}</div>
 </div>
 );
}

function BadgeChip({ label, tone }: { label: string; tone: 'rose' | 'amber' }) {
 const cls = tone === 'rose'
 ? 'text-[var(--hl-alarm)] border-[var(--hl-line)] bg-[var(--hl-deck-2)]'
 : 'text-[var(--hl-caution)] border-[var(--hl-line)] bg-[var(--hl-deck-2)]';
 return (
 <span className={`flex-shrink-0 self-center text-[9px] font-black tracking-widest px-2 py-1.5 border ${cls}`}>
 {label}
 </span>
 );
}

function EnemyChip({
 group,
 selected,
 onSelect,
 layout,
}: {
 group: WaveEnemyGroup;
 selected: boolean;
 onSelect: () => void;
 layout: 'chip' | 'row';
}) {
 const data = ENEMY_DATA[group.type as keyof typeof ENEMY_DATA];

 if (layout === 'chip') {
 return (
 <SceneFilterChip
 active={selected}
 accent="purple"
 onClick={onSelect}
 className="flex min-w-[5.5rem] flex-shrink-0 flex-col items-center gap-1.5 px-3 py-2.5 normal-case tracking-normal"
 >
 <div className="flex h-10 w-10 items-center justify-center border border-[var(--hl-line)] bg-[rgba(6,7,10,0.55)]">
 <EnemyPreview enemyId={group.type} color={data?.color || '#888'} size={28} />
 </div>
 <span className="max-w-[5rem] truncate text-[10px] font-bold">{data?.name || group.type}</span>
 <span className="font-mono text-[10px] text-[var(--hl-ink)]/45">?{group.count}</span>
 </SceneFilterChip>
 );
 }

 return (
 <SceneChoiceButton
 active={selected}
 accent="purple"
 onClick={onSelect}
 className="flex w-full items-center gap-2.5 px-2.5 py-2 text-left normal-case tracking-normal"
 >
 <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center border border-[var(--hl-line)] bg-[rgba(6,7,10,0.55)]">
 <EnemyPreview enemyId={group.type} color={data?.color || '#888'} size={24} />
 </div>
 <div className="min-w-0 flex-1">
 <div className="truncate text-xs font-bold text-[var(--hl-ink)]">{data?.name || group.type}</div>
 <div className="font-mono text-[10px] text-[var(--hl-ink)]/45">?{group.count}</div>
 </div>
 </SceneChoiceButton>
 );
}

function EnemyTacticDetail({
 type,
 count,
 guide,
 ownedTowerTypes,
}: {
 type: EnemyType;
 count: number;
 guide?: {
 weakness?: string;
 tips?: string[];
 counterReasons?: Record<string, string>;
 };
 ownedTowerTypes: Set<import('@/types/game').TowerType>;
}) {
 const { t } = useTranslation();
 const g = t.game;
 const data = ENEMY_DATA[type as keyof typeof ENEMY_DATA];
 const traits = getEnemyTraitTags(type, undefined, t);
 const counters = buildCounterHints(guide?.counterReasons, ownedTowerTypes);
 const topTip = guide?.tips?.[0];

 return (
 <div className="space-y-3">
 <div className="flex items-start gap-3">
 <div className="w-12 h-12 bg-[rgba(6,7,10,0.55)] border border-[var(--hl-line)] flex items-center justify-center flex-shrink-0">
 <EnemyPreview enemyId={type} color={data?.color || '#888'} size={34} />
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2">
 <h4 className="text-base font-bold text-[var(--hl-ink)] truncate">{data?.name || type}</h4>
 <span className="text-xs font-mono text-[var(--hl-ink-3)] flex-shrink-0">?{count}</span>
 <PauseEncyclopediaEnemyLink enemyType={type} className="ml-auto"/>
 </div>
 <div className={`${SCENE_TYPOGRAPHY.microMuted} font-mono mt-1`}>
 HP {data?.health ?? '?'} · {g.speed} {data?.speed?.toFixed(1) ?? '?'} · ${data?.reward ?? '?'}
 </div>
 </div>
 </div>

 {traits.length > 0 && (
 <div className="flex flex-wrap gap-1">
 {traits.map((tag) => (
 <PauseEnemyTraitChip key={tag.text} tag={tag} enemyType={type} />
 ))}
 </div>
 )}

 {guide?.weakness && (
 <div className="bg-[var(--hl-deck-2)] border border-[var(--hl-line)] px-3 py-2 text-[11px] text-[var(--hl-ink-2)] flex items-start gap-2">
 <TargetIcon className="w-3.5 h-3.5 text-[var(--hl-alarm)] flex-shrink-0 mt-0.5"/>
 <span>{g.pausePreviewWeaknessPrefix}{guide.weakness}</span>
 </div>
 )}

 {counters.length > 0 && (
 <div className="space-y-1.5">
 <div className={`${SCENE_TYPOGRAPHY.microMuted} uppercase tracking-wider flex items-center gap-1`}>
 <TowerIcon className="w-3 h-3"/> {g.pausePreviewRecommendedCounters}
 </div>
 {counters.map((c) => (
 <div
 key={c.towerKey}
 className={`flex items-center gap-2 px-2.5 py-2 border text-[11px] ${
 c.owned
 ? 'bg-[var(--hl-deck-2)] border-[var(--hl-line)]'
 : 'bg-[var(--hl-deck-2)] border-[var(--hl-line)]'
 }`}
 >
 {c.owned ? (
 <CheckIcon className="w-3.5 h-3.5 text-[var(--hl-vital)] flex-shrink-0"/>
 ) : (
 <TowerIcon className="w-3.5 h-3.5 text-[var(--hl-caution)] flex-shrink-0"/>
 )}
 <span className={`font-bold truncate max-w-[4.5rem] sm:max-w-none ${c.owned ? 'text-[var(--hl-vital)]' : 'text-[var(--hl-caution)]'}`}>
 {c.towerName}
 </span>
 <PauseEncyclopediaTowerLink towerType={c.towerType} towerKey={c.towerKey} />
 <span className="text-[var(--hl-ink-3)] flex-1 min-w-0 line-clamp-2 sm:line-clamp-1">{c.reason}</span>
 </div>
 ))}
 </div>
 )}

 {topTip && (
 <div className="bg-[var(--hl-deck-2)] border border-[var(--hl-line)] px-3 py-2 text-[10px] text-[var(--hl-ink-3)] flex items-start gap-2">
 <LightbulbIcon className="w-3.5 h-3.5 text-[var(--hl-caution)] flex-shrink-0 mt-0.5"/>
 <span>{topTip}</span>
 </div>
 )}
 </div>
 );
}

export default PausePreviewSection;
