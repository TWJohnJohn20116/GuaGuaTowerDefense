/**
 * 戰績中心 · 篩選列（分頁在左軌，這裡只放條件）
 */
import { useTranslation } from '@/i18n';
import { Chip, Num, SegHead } from '@/components/hl';
import type { StatsTab } from './StatsContent';
import type { StatsDateFilter, StatsModeFilter, StatsOutcomeFilter } from './statsHistoryFilters';

interface StatsToolbarProps {
  activeTab: StatsTab;
  historyCount: number;
  filteredCount?: number;
  outcomeFilter?: StatsOutcomeFilter;
  dateFilter?: StatsDateFilter;
  modeFilter?: StatsModeFilter;
  search?: string;
  onOutcomeFilterChange?: (v: StatsOutcomeFilter) => void;
  onDateFilterChange?: (v: StatsDateFilter) => void;
  onModeFilterChange?: (v: StatsModeFilter) => void;
  onSearchChange?: (v: string) => void;
}

export function StatsToolbar({
  activeTab,
  historyCount,
  filteredCount,
  outcomeFilter = 'all',
  dateFilter = 'all',
  modeFilter = 'all',
  search = '',
  onOutcomeFilterChange,
  onDateFilterChange,
  onModeFilterChange,
  onSearchChange,
}: StatsToolbarProps) {
  const { t } = useTranslation();
  const e = t.encyclopedia;
  const tb = t.statistics.toolbar;

  const visible = filteredCount ?? historyCount;

  const outcomeOptions: { id: StatsOutcomeFilter; label: string }[] = [
    { id: 'all', label: tb.filterOutcomeAll },
    { id: 'victory', label: tb.filterVictory },
    { id: 'defeat', label: tb.filterDefeat },
  ];

  const dateOptions: { id: StatsDateFilter; label: string }[] = [
    { id: 'all', label: tb.filterDateAll },
    { id: 'today', label: tb.filterToday },
    { id: '7d', label: tb.filter7d },
    { id: '30d', label: tb.filter30d },
  ];

  const modeOptions: { id: StatsModeFilter; label: string }[] = [
    { id: 'all', label: tb.filterModeAll },
    { id: 'campaign', label: tb.filterCampaign },
    { id: 'standard', label: tb.filterStandard },
    { id: 'endless', label: tb.filterEndless },
    { id: 'mutator', label: tb.filterMutator },
    { id: 'mod', label: tb.filterMod },
    { id: 'unknown', label: tb.filterUnknown },
  ];

  return (
    <div className="shrink-0 border-b border-[var(--hl-line)] bg-[var(--hl-void)] px-4 py-2.5 sm:px-5">
      <SegHead
        label={activeTab === 'overview' ? e.statsOverview : activeTab === 'history' ? e.statsHistory : e.statsRecords}
        right={
          activeTab === 'history'
            ? <Num value={`${visible}/${historyCount}`} size="sm" tone="muted" />
            : undefined
        }
      />

      {activeTab === 'history' ? (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {outcomeOptions.map(({ id, label }) => (
            <Chip key={`o-${id}`} active={outcomeFilter === id} onClick={() => onOutcomeFilterChange?.(id)}>
              {label}
            </Chip>
          ))}
          <span className="mx-1 h-4 w-px bg-[var(--hl-line)]" />
          {dateOptions.map(({ id, label }) => (
            <Chip key={`d-${id}`} active={dateFilter === id} onClick={() => onDateFilterChange?.(id)}>
              {label}
            </Chip>
          ))}
          <span className="mx-1 h-4 w-px bg-[var(--hl-line)]" />
          {modeOptions.map(({ id, label }) => (
            <Chip key={`m-${id}`} active={modeFilter === id} onClick={() => onModeFilterChange?.(id)}>
              {label}
            </Chip>
          ))}
          <div className="ml-auto w-full sm:w-[220px]">
            <input
              className="hl-input"
              value={search}
              onChange={(ev) => onSearchChange?.(ev.target.value)}
              placeholder={tb.searchPlaceholder}
            />
          </div>
        </div>
      ) : (
        <div className="mt-1.5 hl-micro">
          {activeTab === 'overview' ? tb.overviewHint : tb.recordsHint}
        </div>
      )}
    </div>
  );
}

export default StatsToolbar;
