/**
 * 暫停戰況 · 場上敵人彙總 */

import { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/i18n';
import EnemyPreview from '@/components/ui/EnemyPreview';
import { SCENE_TYPOGRAPHY } from '@/components/ui/SceneTypography';
import { AlienIcon } from '@/components/ui/Icons';
import {
 groupFieldEnemies,
 summarizeFieldDebuffs,
 getEnemyColor,
} from './pauseEnemyTraits';
import { PauseEncyclopediaEnemyLink, PauseEncyclopediaEffectLink } from './PauseEncyclopediaEnemyLink';
import { PauseEnemyTraitChip } from './PauseEnemyTraitChip';
import { PauseSectionShell } from './PauseSectionShell';

const TRAIT_TONE_CLASS: Record<string, string> = {
 debuff: 'bg-[var(--hl-deck-2)] text-[var(--hl-caution)] border-[var(--hl-line)]',
};

export function PauseEnemyInsights({ embedded = false }: { embedded?: boolean }) {
 const { t } = useTranslation();
 const g = t.game;
 const enemies = useGameStore((s) => s.enemies);

 const groups = useMemo(() => groupFieldEnemies(enemies, t), [enemies, t]);
 const debuffs = useMemo(() => summarizeFieldDebuffs(enemies, t), [enemies, t]);

 const fieldStats = useMemo(() => {
 const totalHp = enemies.reduce((s, e) => s + e.health, 0);
 const shielded = enemies.filter((e) => (e.shield ?? 0) > 0).length;
 const armored = enemies.filter(
 (e) => (e.armorBonus ?? 0) > 0 || ENEMY_ARMORED_TYPES.has(e.type),
 ).length;
 return { totalHp, shielded, armored };
 }, [enemies]);

 if (enemies.length === 0) {
 const empty = (
 <div className={`text-center text-xs py-5 border border-dashed border-[var(--hl-line)] ${SCENE_TYPOGRAPHY.microMuted}`}>
 {g.pauseNoEnemies}
 </div>
 );
 if (embedded) return empty;
 return (
 <PauseSectionShell
 title={g.pauseFieldThreat}
 icon={<AlienIcon className="h-5 w-5"/>}
 accent="rose"
 count={0}
 >
 {empty}
 </PauseSectionShell>
 );
 }

 const body = (
 <div className="space-y-3">
 <div className="flex items-center justify-end">
 <span className={`${SCENE_TYPOGRAPHY.micro} text-[var(--hl-alarm)] font-mono tabular-nums`}>
 {g.pauseFieldTotalHpLabel} {Math.floor(fieldStats.totalHp).toLocaleString()}
 </span>
 </div>

 <div className="grid grid-cols-3 gap-2">
 <MiniStat label={g.pauseFieldTypeCount} value={groups.length} />
 <MiniStat label={g.pauseFieldShielded} value={fieldStats.shielded} tone="text-[var(--hl-reach)]"/>
 <MiniStat label={g.pauseFieldArmored} value={fieldStats.armored} tone="text-[var(--hl-ink-2)]"/>
 </div>

 {debuffs.length > 0 && (
 <div className="flex flex-wrap gap-1.5">
 {debuffs.map((d) => (
 <span
 key={d.effectType}
 className={`text-[10px] font-bold px-2 py-0.5 border inline-flex items-center gap-1 ${TRAIT_TONE_CLASS.debuff}`}
 >
 {d.label} ?{d.count}
 <PauseEncyclopediaEffectLink effectType={d.effectType} />
 </span>
 ))}
 </div>
 )}

 <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
 {groups.map((grp) => (
 <div key={grp.type} className="bg-[rgba(6,7,10,0.55)] border border-[var(--hl-line)] p-2.5">
 <div className="flex items-center gap-2 mb-1.5">
 <div className="w-8 h-8 bg-[rgba(6,7,10,0.55)] border border-[var(--hl-line)] flex items-center justify-center flex-shrink-0">
 <EnemyPreview enemyId={grp.type} color={getEnemyColor(grp.type)} size={22} />
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-1.5">
 <span className="text-xs font-bold text-[var(--hl-ink)] truncate flex-1">{grp.data?.name ?? grp.type}</span>
 <PauseEncyclopediaEnemyLink enemyType={grp.type} />
 <span className="text-[11px] font-black text-[var(--hl-ink-2)] font-mono tabular-nums">?{grp.count}</span>
 </div>
 <div className={`${SCENE_TYPOGRAPHY.microMuted} font-mono`}>
 HP {Math.floor(grp.totalHp).toLocaleString()} · {g.pauseFieldHpAvg} {grp.avgHpPercent}%
 </div>
 </div>
 </div>
 {grp.traits.length > 0 && (
 <div className="flex flex-wrap gap-1">
 {grp.traits.map((tag) => (
 <PauseEnemyTraitChip key={tag.text} tag={tag} enemyType={grp.type} />
 ))}
 </div>
 )}
 </div>
 ))}
 </div>
 </div>
 );

 if (embedded) return body;

 return (
 <PauseSectionShell
 title={g.pauseFieldThreat}
 icon={<AlienIcon className="h-5 w-5"/>}
 accent="rose"
 count={enemies.length}
 >
 {body}
 </PauseSectionShell>
 );
}

function MiniStat({ label, value, tone = 'text-[var(--hl-ink)]' }: { label: string; value: number; tone?: string }) {
 return (
 <div className="bg-[rgba(6,7,10,0.55)] border border-[var(--hl-line)] p-2 text-center">
 <div className={`${SCENE_TYPOGRAPHY.microMuted} uppercase tracking-wider mb-0.5`}>{label}</div>
 <div className={`text-sm font-bold font-mono ${tone}`}>{value}</div>
 </div>
 );
}

const ENEMY_ARMORED_TYPES = new Set(['armored', 'tank', 'heavy', 'boss', 'miniboss']);

export default PauseEnemyInsights;
