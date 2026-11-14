/**
 * 成就觀測站 · 分類完成度（HARDLINE：一條細列，分類在左軌時可省略）
 */
import { CATEGORY_CONFIG, type AchievementCategory } from '@/types/achievement';
import { Meter } from '@/components/hl';
import type { CategoryProgress } from './CategorySidebar';
import { useTranslation } from '@/i18n';

interface CategoryCompletionStripProps {
  categories: CategoryProgress[];
  playstyle: { earned: number; total: number };
  totalEarned: number;
  totalCount: number;
  selectedCategory: string;
  onCategoryChange: (category: AchievementCategory | 'all' | 'playstyle') => void;
}

export function CategoryCompletionStrip({
  categories,
  playstyle,
  totalEarned,
  totalCount,
  selectedCategory,
  onCategoryChange,
}: CategoryCompletionStripProps) {
  const { t } = useTranslation();
  const o = t.achievements.observatory;

  const items = [
    { id: 'all' as const, label: o.categoryAll, earned: totalEarned, total: totalCount },
    {
      id: 'playstyle' as const,
      label: o.categoryPlaystyle,
      earned: playstyle.earned,
      total: playstyle.total,
    },
    ...categories.map((c) => ({
      id: c.category as AchievementCategory,
      label: CATEGORY_CONFIG[c.category].label,
      earned: c.earned,
      total: c.total,
    })),
  ];

  return (
    <div className="flex gap-1 overflow-x-auto pb-0.5">
      {items.map((item) => {
        const active = selectedCategory === item.id;
        const pct = item.total > 0 ? Math.round((item.earned / item.total) * 100) : 0;
        return (
          <button
            key={String(item.id)}
            type="button"
            onClick={() => onCategoryChange(item.id)}
            className={[
              'flex w-[108px] shrink-0 flex-col gap-1 border px-2 py-1.5 text-left transition-colors duration-150',
              active
                ? 'border-[var(--hl-signal)] bg-[var(--hl-signal-veil)]'
                : 'border-[var(--hl-line)] bg-[var(--hl-deck)] hover:border-[var(--hl-line-hot)]',
            ].join(' ')}
          >
            <span className="truncate font-mono text-[9px] uppercase tracking-[0.06em] text-[var(--hl-ink-4)]">
              {item.label}
            </span>
            <span className="font-mono text-[10px] tabular-nums text-[var(--hl-ink-2)]">
              {`${item.earned}/${item.total}`}
            </span>
            <Meter value={pct} max={100} tone={active ? 'signal' : 'ink'} />
          </button>
        );
      })}
    </div>
  );
}

export default CategoryCompletionStrip;
