/**
 * 暫停戰況 · 本波敵人與塔種對照
 */

import { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/i18n';
import { WAVE_CONFIGS, generateEndlessWaveConfig } from '@/data/gameData';
import type { EnemyType, TowerType } from '@/types/game';
import { TOWER_DATA } from '@/data/gameData';
import { TowerIcon, CheckIcon, WarningIcon, TargetIcon } from '@/components/ui/Icons';
import { SCENE_TYPOGRAPHY } from '@/components/ui/SceneTypography';
import { Deck } from '@/components/hl';
import { COUNTER_KEY_TO_TOWER } from './pauseNextWaveHints';
import { getEnemyDisplayName } from './pauseEnemyTraits';
import { PauseEncyclopediaTowerLink } from './PauseEncyclopediaEnemyLink';
import { PauseSectionShell } from './PauseSectionShell';

interface TowerMatchRow {
 towerType: TowerType;
 towerName: string;
 color: string;
 builtCount: number;
 reasons: string[];
 needed: boolean;
}

function collectCounterNeeds(
 enemyTypes: Iterable<EnemyType>,
 guides: Record<string, { counterReasons?: Record<string, string> }>,
): Map<TowerType, { reasons: Set<string> }> {
 const map = new Map<TowerType, { reasons: Set<string> }>();

 for (const type of enemyTypes) {
 const guide = guides[type];
 if (!guide?.counterReasons) continue;
 const enemyName = getEnemyDisplayName(type);

 for (const [key, reason] of Object.entries(guide.counterReasons)) {
 const towerType = COUNTER_KEY_TO_TOWER[key];
 if (!towerType) continue;
 const entry = map.get(towerType) ?? { reasons: new Set<string>() };
 entry.reasons.add(`${enemyName}：${reason}`);
 map.set(towerType, entry);
 }
 }

 return map;
}

export function PauseBattleTowerMatch({ embedded = false }: { embedded?: boolean }) {
 const { t } = useTranslation();
 const g = t.game;
 const enemies = useGameStore((s) => s.enemies);
 const towers = useGameStore((s) => s.towers);
 const currentWave = useGameStore((s) => s.currentWave);
 const endlessMode = useGameStore((s) => s.endlessMode);
 const maxWaves = useGameStore((s) => s.maxWaves);

 const guides = t.tutorial.enemyGuides as Record<
 string,
 { counterReasons?: Record<string, string> }
 >;

 const nextWaveTypes = useMemo(() => {
 const nextWave = currentWave + 1;
 let config;
 if (endlessMode) {
 config = generateEndlessWaveConfig(nextWave);
 } else if (maxWaves > 0 && currentWave >= maxWaves) {
 return [] as EnemyType[];
 } else {
 const idx = nextWave - 1;
 config = idx >= 0 && idx < WAVE_CONFIGS.length
 ? WAVE_CONFIGS[idx]
 : generateEndlessWaveConfig(nextWave);
 }
 return config.enemies.map((g) => g.type as EnemyType);
 }, [currentWave, endlessMode, maxWaves]);

 const rows = useMemo(() => {
 const fieldTypes = enemies.map((e) => e.type);
 const allTypes = [...new Set([...fieldTypes, ...nextWaveTypes])];
 if (allTypes.length === 0) return [];

 const needs = collectCounterNeeds(allTypes, guides);
 const builtByType = towers.reduce((acc, tw) => {
 acc.set(tw.type, (acc.get(tw.type) ?? 0) + 1);
 return acc;
 }, new Map<TowerType, number>());

 const result: TowerMatchRow[] = [...needs.entries()].map(([towerType, { reasons }]) => {
 const data = TOWER_DATA[towerType];
 const builtCount = builtByType.get(towerType) ?? 0;
 return {
 towerType,
 towerName: data?.name ?? towerType,
 color: data?.color ?? '#888',
 builtCount,
 reasons: [...reasons],
 needed: builtCount === 0,
 };
 });

 return result.sort((a, b) => {
 if (a.needed !== b.needed) return a.needed ? -1 : 1;
 return b.reasons.length - a.reasons.length;
 });
 }, [enemies, nextWaveTypes, guides, towers]);

 const gapCount = rows.filter((r) => r.needed).length;
 const readyCount = rows.filter((r) => !r.needed).length;

 if (rows.length === 0) {
 const empty = (
 <div className="text-center text-[var(--arc-ink-4)] text-xs py-4">
 {g.pauseMatchNoNeed}
 </div>
 );
 if (embedded) return empty;
 return (
 <PauseSectionShell
 title={g.pauseTowerMatch}
 icon={<TargetIcon className="h-5 w-5"/>}
 accent="emerald"
 >
 {empty}
 </PauseSectionShell>
 );
 }

 const headerBadges = (
 <div className="flex gap-2 text-[10px] font-bold">
 {readyCount > 0 && (
 <span className="arc-chip text-[var(--arc-vital)]">
 {g.pauseMatchReady.replace('{count}', String(readyCount))}
 </span>
 )}
 {gapCount > 0 && (
 <span className="arc-chip text-[var(--arc-caution)]">
 {g.pauseMatchGap.replace('{count}', String(gapCount))}
 </span>
 )}
 </div>
 );

 const body = (
 <>
 {embedded && <div className="flex justify-end mb-2">{headerBadges}</div>}
 <div className={`${SCENE_TYPOGRAPHY.microMuted} mb-2`}>
 {g.pauseMatchHintPrefix && `${g.pauseMatchHintPrefix} `}
 <strong className="text-[var(--arc-ink-3)] font-normal">{g.pauseMatchHintField}</strong>
 {` ${g.pauseMatchHintAnd} `}
 <strong className="text-[var(--arc-ink-3)] font-normal">{g.pauseMatchHintNext}</strong>
 {g.pauseMatchHintSuffix && ` ${g.pauseMatchHintSuffix}`}
 </div>
 <div className="space-y-2 max-h-44 overflow-y-auto no-scrollbar">
 {rows.map((row) => (
 <Deck
 key={row.towerType}
 className={`arc-panel--flat p-3 ${
 row.needed
 ? 'bg-[var(--arc-deck-2)] border-[var(--cn-line-soft)]'
 : 'bg-[var(--arc-deck-2)] border-[var(--cn-line-soft)]'
 }`}
 >
 <div className="flex items-center justify-between gap-2 mb-1.5">
 <div className="flex items-center gap-2 min-w-0">
 {row.needed ? (
 <WarningIcon className="w-4 h-4 text-[var(--arc-caution)] flex-shrink-0"/>
 ) : (
 <CheckIcon className="w-4 h-4 text-[var(--arc-vital)] flex-shrink-0"/>
 )}
 <span
 className="w-2.5 h-2.5 flex-shrink-0"
 style={{ backgroundColor: row.color }}
 />
 <span className="text-sm font-bold text-[var(--arc-ink)] truncate">{row.towerName}</span>
 <PauseEncyclopediaTowerLink towerType={row.towerType} />
 </div>
 <span className="arc-num text-[11px] font-mono tabular-nums flex items-center gap-1 flex-shrink-0">
 <TowerIcon className="w-3 h-3 opacity-50"/>
 <span className={row.builtCount > 0 ? 'text-[var(--arc-vital)]' : 'text-[var(--arc-caution)]'}>
 ?{row.builtCount}
 </span>
 </span>
 </div>
 <ul className="space-y-0.5 pl-6">
 {row.reasons.slice(0, 2).map((r) => (
 <li key={r} className="text-[10px] text-[var(--arc-ink-3)] leading-snug list-disc">
 {r}
 </li>
 ))}
 {row.reasons.length > 2 && (
 <li className={SCENE_TYPOGRAPHY.microMuted}>
 {g.pauseMatchMoreReasons.replace('{count}', String(row.reasons.length - 2))}
 </li>
 )}
 </ul>
 </Deck>
 ))}
 </div>
 </>
 );

 if (embedded) return body;

 return (
 <PauseSectionShell
 title={g.pauseTowerMatch}
 icon={<TargetIcon className="h-5 w-5"/>}
 accent="emerald"
 action={headerBadges}
 >
 {body}
 </PauseSectionShell>
 );
}

export default PauseBattleTowerMatch;
