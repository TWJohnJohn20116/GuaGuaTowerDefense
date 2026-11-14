/**
 * 成就觀測站 · 工具列（HARDLINE 細列）
 *
 * 搜尋、狀態篩選、分類進度、下一個目標。分類本身在左軌。
 */
import { useMemo } from 'react';
import { Chip, Meter } from '@/components/hl';
import { NextTargetsRail } from './NextTargetsRail';
import type { Achievement } from '@/types/achievement';
import type { ObservatoryFilterMode } from './observatoryShared';
import { useTranslation } from '@/i18n';

interface TargetItem {
  achievement: Achievement;
  pct: number;
}

interface AchievementsToolbarProps {
  filter: ObservatoryFilterMode;
  search: string;
  categoryEarned: number;
  categoryTotal: number;
  nextTargets: TargetItem[];
  railFocusIndex: number;
  onFilterChange: (f: ObservatoryFilterMode) => void;
  onSearchChange: (s: string) => void;
  onTargetSelect: (id: string) => void;
  onRailKeyDown: (e: React.KeyboardEvent) => void;
}

export function AchievementsToolbar({
  filter,
  search,
  categoryEarned,
  categoryTotal,
  nextTargets,
  railFocusIndex,
  onFilterChange,
  onSearchChange,
  onTargetSelect,
  onRailKeyDown,
}: AchievementsToolbarProps) {
  const { t } = useTranslation();
  const o = t.achievements.observatory;
  const a = t.achievements;

  const statusFilters = useMemo(
    () => [
      { id: 'all' as const, label: o.filterAllStatus },
      { id: 'claimable' as const, label: o.filterClaimable },
      { id: 'in_progress' as const, label: a.filterInProgress },
      { id: 'completed' as const, label: o.filterCompletedEarned },
      { id: 'locked' as const, label: a.filterLocked },
    ],
    [o, a],
  );

  const pct = categoryTotal > 0 ? Math.round((categoryEarned / categoryTotal) * 100) : 0;

  return (
    <div className="flex shrink-0 flex-col gap-2 border-b border-[var(--hl-line)] bg-[var(--hl-void-2)] px-4 py-2">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={o.searchPlaceholder}
          aria-label={o.searchPlaceholder}
          className="hl-input h-7 w-[220px] shrink-0"
        />

        <div className="flex flex-wrap items-center gap-1">
          {statusFilters.map((f) => (
            <Chip key={f.id} active={filter === f.id} onClick={() => onFilterChange(f.id)}>
              {f.label}
            </Chip>
          ))}
        </div>

        <span className="ml-auto flex shrink-0 items-center gap-2">
          <span className="hl-label">{o.progressLabel}</span>
          <span className="w-[110px]">
            <Meter value={pct} max={100} tone="signal" />
          </span>
          <span className="font-mono text-[10px] tabular-nums text-[var(--hl-ink-2)]">
            {`${categoryEarned}/${categoryTotal}`}
          </span>
        </span>
      </div>

      {nextTargets.length > 0 && (
        <div className="flex items-center gap-3">
          <span className="hl-label shrink-0">{o.nextTargetsAria}</span>
          <span className="h-px flex-1 bg-[var(--hl-line)]" />
          <span className="hidden shrink-0 font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--hl-ink-4)] sm:inline">
            {o.keyboardHint}
          </span>
        </div>
      )}

      <NextTargetsRail
        targets={nextTargets}
        focusedIndex={railFocusIndex}
        onSelect={onTargetSelect}
        onKeyDown={onRailKeyDown}
      />
    </div>
  );
}

export default AchievementsToolbar;
