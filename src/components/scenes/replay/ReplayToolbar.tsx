/**
 * 回放 · 工具列（HARDLINE：mono Chip 篩選 + 1px 計量）
 * 版面：Console 主區上緣的一條結構線，不用卡片。
 */
import { useTranslation } from '@/i18n';
import { Chip, Meter } from '@/components/hl';
import { CustomSelect } from '@/components/ui/CustomSelect';

export type ReplayTab = 'library' | 'favorites';
export type ReplayFilterMode = 'all' | 'victory' | 'defeat';
export type ReplaySortMode = 'newest' | 'oldest' | 'score' | 'wave' | 'duration';

interface ReplayToolbarProps {
  tab: ReplayTab;
  filter: ReplayFilterMode;
  sort: ReplaySortMode;
  search: string;
  total: number;
  visible: number;
  favoriteCount: number;
  onTabChange: (tab: ReplayTab) => void;
  onFilterChange: (filter: ReplayFilterMode) => void;
  onSortChange: (sort: ReplaySortMode) => void;
  onSearchChange: (value: string) => void;
}

export function ReplayToolbar({
  tab,
  filter,
  sort,
  search,
  total,
  visible,
  favoriteCount,
  onTabChange,
  onFilterChange,
  onSortChange,
  onSearchChange,
}: ReplayToolbarProps) {
  const { t } = useTranslation();
  const s = t.replay.toolbar;

  const filterOptions: { id: ReplayFilterMode; label: string }[] = [
    { id: 'all', label: s.filterAll },
    { id: 'victory', label: s.filterVictory },
    { id: 'defeat', label: s.filterDefeat },
  ];

  const sortOptions: { id: ReplaySortMode; label: string }[] = [
    { id: 'newest', label: s.sortNewest },
    { id: 'oldest', label: s.sortOldest },
    { id: 'score', label: s.sortScore },
    { id: 'wave', label: s.sortWave },
    { id: 'duration', label: s.sortDuration },
  ];

  return (
    <div className="flex shrink-0 flex-col gap-2.5 border-b border-[var(--hl-line)] bg-[var(--hl-void)] px-4 py-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <Chip active={tab === 'library'} onClick={() => onTabChange('library')}>
          {s.tabLibrary}
          <span className="text-[var(--hl-ink-4)]">{String(total).padStart(2, '0')}</span>
        </Chip>
        <Chip active={tab === 'favorites'} onClick={() => onTabChange('favorites')}>
          {s.tabFavorites}
          <span className="text-[var(--hl-ink-4)]">{String(favoriteCount).padStart(2, '0')}</span>
        </Chip>

        <span className="mx-1 h-4 w-px bg-[var(--hl-line)]" />

        {tab === 'library' ? (
          filterOptions.map(({ id, label }) => (
            <Chip key={id} active={filter === id} onClick={() => onFilterChange(id)}>
              {label}
            </Chip>
          ))
        ) : (
          <span className="hl-micro">{s.favoritesHint.replace('{count}', String(favoriteCount))}</span>
        )}
      </div>

      {tab === 'library' && (
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={s.searchPlaceholder}
            className="hl-input h-7 min-w-0 flex-1 text-[11.5px] sm:max-w-xs"
          />
          <CustomSelect<ReplaySortMode>
            value={sort}
            onChange={onSortChange}
            options={sortOptions.map((o) => ({ value: o.id, label: o.label }))}
            variant="glass"
            size="sm"
            className="w-auto shrink-0"
          />
          <div className="ml-auto flex min-w-[132px] items-center gap-2">
            <Meter value={visible} max={Math.max(1, total)} tone="signal" className="h-1" />
            <span className="hl-num shrink-0 text-[10px] leading-none text-[var(--hl-ink-3)]">
              {visible}/{total}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReplayToolbar;
