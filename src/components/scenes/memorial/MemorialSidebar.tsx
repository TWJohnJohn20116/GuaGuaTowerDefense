/**
 * 紀念堂 · 篩選列（HARDLINE Page：搜尋 + Chip 篩選 + 筆數）
 */
import { useTranslation } from '@/i18n';
import { Chip } from '@/components/hl';
import { MEMORIAL_ORIGIN_LABELS, type MemorialOrigin } from '@/data/memorialData';

export type MemorialFilterMode = 'all' | MemorialOrigin;

interface MemorialSidebarProps {
  filter: MemorialFilterMode;
  search: string;
  count: number;
  onFilterChange: (f: MemorialFilterMode) => void;
  onSearchChange: (s: string) => void;
}

export function MemorialSidebar({
  filter,
  search,
  count,
  onFilterChange,
  onSearchChange,
}: MemorialSidebarProps) {
  const { t } = useTranslation();
  const m = t.memorial;

  const filterOptions: { value: MemorialFilterMode; label: string }[] = [
    { value: 'all', label: m.filterAll },
    { value: 'north_outpost', label: MEMORIAL_ORIGIN_LABELS.north_outpost },
    { value: 'meong_organization', label: MEMORIAL_ORIGIN_LABELS.meong_organization },
    { value: 'lambda_family', label: MEMORIAL_ORIGIN_LABELS.lambda_family },
    { value: 'civilian', label: MEMORIAL_ORIGIN_LABELS.civilian },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-[var(--hl-line)] bg-[var(--hl-void-2)] px-4 py-2.5">
      <input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={m.sidebar.searchPlaceholder}
        aria-label={m.sidebar.searchPlaceholder}
        className="hl-input h-7 w-[220px] shrink-0"
      />

      <div className="flex flex-wrap items-center gap-1">
        {filterOptions.map((option) => (
          <Chip
            key={option.value}
            active={filter === option.value}
            onClick={() => onFilterChange(option.value)}
          >
            {option.label}
          </Chip>
        ))}
      </div>

      <span className="ml-auto shrink-0 font-mono text-[10px] tabular-nums uppercase tracking-[0.1em] text-[var(--hl-ink-4)]">
        {m.sidebar.rosterCount.replace('{count}', String(count))}
      </span>
    </div>
  );
}

export default MemorialSidebar;
