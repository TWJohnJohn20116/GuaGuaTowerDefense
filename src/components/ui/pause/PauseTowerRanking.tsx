/**
 * 暫停選單 · 塔輸出排名 */

import { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useGetTowerData } from '@/components/game/hooks';
import { useTranslation } from '@/i18n';
import { TowerIcon, SwordsIcon } from '@/components/ui/Icons';
import { Num } from '@/components/hl';
import { PauseSectionShell } from './PauseSectionShell';

export function PauseTowerRanking({ embedded = false }: { embedded?: boolean }) {
 const { t } = useTranslation();
 const towers = useGameStore((s) => s.towers);
 const getTowerData = useGetTowerData();

 const ranked = useMemo(
 () =>
 [...towers]
 .sort((a, b) => b.totalDamage - a.totalDamage)
 .slice(0, 5)
 .map((t) => ({
 id: t.id,
 type: t.type,
 level: t.level,
 damage: Math.floor(t.totalDamage),
 kills: t.kills,
 name: getTowerData(t.type)?.name ?? t.type,
 color: getTowerData(t.type)?.color ?? '#888',
 })),
 [towers, getTowerData],
 );

 if (ranked.length === 0) return null;

 const maxDamage = ranked[0]?.damage || 1;

 const body = (
 <div className="space-y-2">
 {ranked.map((row, i) => (
 <div key={row.id} className="flex items-center gap-2">
 <Num value={i + 1} tone="muted" size="sm" className="font-black w-4 tabular-nums" />
 <span
 className="w-2.5 h-2.5 flex-shrink-0"
 style={{ backgroundColor: row.color }}
 />
 <div className="flex-1 min-w-0">
 <div className="flex justify-between text-[11px] font-bold mb-0.5">
 <span className="text-[var(--arc-ink-2)] truncate">
 {row.name}
 <span className="text-[var(--arc-ink-4)] font-normal ml-1">Lv.{row.level}</span>
 </span>
 <Num
 value={row.damage.toLocaleString()}
 tone="caution"
 size="sm"
 className="font-mono tabular-nums flex-shrink-0 ml-2"
 />
 </div>
 <div className="h-1 bg-[var(--arc-deck-3)] overflow-hidden">
 <div
 className="h-full bg-[var(--arc-gold)]"
 style={{ width: `${(row.damage / maxDamage) * 100}%` }}
 />
 </div>
 </div>
 <span className="text-[10px] text-[var(--arc-ink-4)] font-mono tabular-nums flex items-center gap-0.5 flex-shrink-0">
 <TowerIcon className="w-3 h-3 opacity-50"/>
 {row.kills}
 </span>
 </div>
 ))}
 </div>
 );

 if (embedded) return body;

 return (
 <PauseSectionShell
 title={t.game.pauseTowerRanking}
 icon={<SwordsIcon className="h-5 w-5"/>}
 accent="amber"
 >
 {body}
 </PauseSectionShell>
 );
}
