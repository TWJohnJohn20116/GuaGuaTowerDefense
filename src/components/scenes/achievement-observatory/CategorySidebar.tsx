/**
 * 檔案館 · 分類左軌（HARDLINE）
 *
 * 每列＝編號、分類名、迷你方塊計量、筆數。選中只有左緣訊號條。
 */
import type { AchievementCategory } from '@/types/achievement';
import { CATEGORY_CONFIG } from '@/types/achievement';
import { useTranslation } from '@/i18n';
import { Chip } from '@/components/hl';
import { ProgressBlocks } from './observatoryShared';

export type ObservatoryCategory = AchievementCategory | 'all' | 'playstyle';

export interface CategoryProgress {
  category: AchievementCategory;
  earned: number;
  total: number;
}

interface Props {
  categories: CategoryProgress[];
  selected: ObservatoryCategory;
  onSelect: (c: ObservatoryCategory) => void;
  totalEarned: number;
  totalCount: number;
  playstyle?: { earned: number; total: number };
}

export function CategorySidebar({
  categories,
  selected,
  onSelect,
  totalEarned,
  totalCount,
  playstyle,
}: Props) {
  const { t } = useTranslation();
  const o = t.achievements.observatory;
  const ps = playstyle ?? { earned: 0, total: 0 };

  const rows: { id: ObservatoryCategory; label: string; earned: number; total: number }[] = [
    { id: 'all', label: o.categoryAll, earned: totalEarned, total: totalCount },
    { id: 'playstyle', label: o.categoryPlaystyle, earned: ps.earned, total: ps.total },
    ...categories.map((c) => ({
      id: c.category as ObservatoryCategory,
      label: CATEGORY_CONFIG[c.category].label,
      earned: c.earned,
      total: c.total,
    })),
  ];

  return (
    <div className="flex flex-col">
      {rows.map((row, i) => {
        const active = selected === row.id;
        const pct = row.total > 0 ? (row.earned / row.total) * 100 : 0;
        return (
          <button
            key={row.id}
            type="button"
            onClick={() => onSelect(row.id)}
            className={[
              'group relative flex flex-col gap-1.5 border-b border-[var(--hl-line)] px-3 py-2 text-left',
              'transition-colors duration-150 hover:bg-[var(--hl-deck-2)]',
              active ? 'bg-[var(--hl-deck-2)]' : '',
            ].join(' ')}
          >
            <span
              aria-hidden="true"
              className={`absolute left-0 top-0 h-full w-[2px] ${active ? 'bg-[var(--hl-signal)]' : 'bg-transparent'}`}
            />
            <span className="flex items-center gap-2">
              <span
                className={`w-[16px] shrink-0 font-mono text-[9px] tabular-nums ${
                  active ? 'text-[var(--hl-signal)]' : 'text-[var(--hl-ink-4)]'
                }`}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <span
                className={`min-w-0 flex-1 truncate text-[12px] ${
                  active ? 'font-semibold text-[var(--hl-ink)]' : 'text-[var(--hl-ink-2)]'
                }`}
              >
                {row.label}
              </span>
              <span className="shrink-0 font-mono text-[9.5px] tabular-nums text-[var(--hl-ink-4)]">
                {`${row.earned}/${row.total}`}
              </span>
            </span>
            <span className="block pl-[24px]">
              <ProgressBlocks pct={pct} total={16} tone={active ? 'caution' : 'ink'} height={4} fill />
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** 窄屏橫向版 */
export function CategorySidebarMobile(props: Props) {
  const { t } = useTranslation();
  const o = t.achievements.observatory;
  const ps = props.playstyle ?? { earned: 0, total: 0 };

  return (
    <div className="overflow-x-auto border-b border-[var(--hl-line)] px-2 py-1.5 lg:hidden">
      <div className="flex min-w-max items-center gap-1">
        <Chip active={props.selected === 'all'} onClick={() => props.onSelect('all')}>
          {`${o.categoryAll} ${props.totalEarned}/${props.totalCount}`}
        </Chip>
        <Chip active={props.selected === 'playstyle'} onClick={() => props.onSelect('playstyle')}>
          {`${o.categoryPlaystyle} ${ps.earned}/${ps.total}`}
        </Chip>
        {props.categories.map(({ category, earned, total }) => (
          <Chip
            key={category}
            active={props.selected === category}
            onClick={() => props.onSelect(category)}
          >
            {`${CATEGORY_CONFIG[category].label} ${earned}/${total}`}
          </Chip>
        ))}
      </div>
    </div>
  );
}

export default CategorySidebar;
