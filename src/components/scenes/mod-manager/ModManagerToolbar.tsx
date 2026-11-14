/**
 * Mod 管理器 · 工具列 — HARDLINE 帶狀（h-11）
 *
 * 一整條帶：搜尋｜排序｜方向｜（右）計數。分組之間用 1px 垂直線隔開。
 * 類型／狀態／標籤篩選在左軌，不佔這條帶。
 */
import { useTranslation } from '@/i18n';
import { Btn, Chip, IconBtn, Input, Num } from '@/components/hl';
import { SearchIcon, PlusIcon, XIcon } from '@/components/ui/Icons';
import type { ModType } from '@/types/game';

export type ModTypeFilter = ModType | 'all';
export type ModEnabledFilter = 'all' | 'enabled' | 'disabled';
export type ModSortBy = 'name' | 'score' | 'type' | 'enabled' | 'updated';
export type ModSortDir = 'asc' | 'desc';

interface ModManagerToolbarProps {
  search: string;
  sortBy: ModSortBy;
  sortDir: ModSortDir;
  filterTotal: number;
  enabledInView: number;
  onSearchChange: (s: string) => void;
  onSortByChange: (s: ModSortBy) => void;
  onSortDirToggle: () => void;
  onImport: () => void;
}

export function ModManagerToolbar({
  search,
  sortBy,
  sortDir,
  filterTotal,
  enabledInView,
  onSearchChange,
  onSortByChange,
  onSortDirToggle,
  onImport,
}: ModManagerToolbarProps) {
  const { t } = useTranslation();
  const tb = t.modManager.toolbar;

  const sortLabels: Record<ModSortBy, string> = {
    name: tb.sortName,
    score: tb.sortScore,
    type: tb.sortType,
    enabled: tb.sortEnabled,
    updated: tb.sortUpdated,
  };

  return (
    <div className="flex h-11 shrink-0 items-center gap-2.5 border-b border-[var(--cn-line-soft)] bg-[var(--arc-void)] px-3">
      {/* 搜尋 */}
      <div className="relative flex items-center">
        <SearchIcon className="pointer-events-none absolute left-2 h-3.5 w-3.5 text-[var(--arc-ink-4)]" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={tb.searchPlaceholder}
          className="h-7 w-[240px] pl-7 pr-7 text-[11.5px]"
        />
        {search.trim() !== '' && (
          <IconBtn
            label={tb.clearSearch}
            onClick={() => onSearchChange('')}
            className="absolute right-1 flex h-5 w-5 items-center justify-center text-[var(--arc-ink-4)] hover:text-[var(--arc-ink)]"
          >
            <XIcon className="h-3 w-3" />
          </IconBtn>
        )}
      </div>

      <span className="h-5 w-px shrink-0 bg-[var(--arc-line)]" aria-hidden="true" />

      {/* 排序 */}
      <span className="arc-label shrink-0">{tb.sortLabel}</span>
      <div className="flex items-center gap-1">
        {(Object.keys(sortLabels) as ModSortBy[]).map((id) => (
          <Chip key={id} active={sortBy === id} onClick={() => onSortByChange(id)}>
            {sortLabels[id]}
          </Chip>
        ))}
      </div>

      <Btn size="sm" variant="line" onClick={onSortDirToggle}>
        {sortDir === 'asc' ? tb.sortAsc : tb.sortDesc}
      </Btn>

      <span className="h-5 w-px shrink-0 bg-[var(--arc-line)]" aria-hidden="true" />

      <Btn size="sm" variant="line" icon={<PlusIcon className="h-3.5 w-3.5" />} onClick={onImport}>
        {tb.importMod}
      </Btn>

      {/* 右側計數 */}
      <div className="ml-auto flex shrink-0 items-center gap-2 border-[3px] border-[var(--cn-line-soft)] px-2 py-1">
        <span className="arc-label">rows</span>
        <Num value={filteredPad(filterTotal)} size="sm" className="tabular-nums" />
        <span className="text-[var(--arc-ink-4)]">·</span>
        <span className="arc-label">on</span>
        <Num value={filteredPad(enabledInView)} tone="vital" size="sm" className="tabular-nums" />
      </div>
    </div>
  );
}

function filteredPad(n: number): string {
  return String(n).padStart(2, '0');
}

export default ModManagerToolbar;
