/**
 * 檔案館 · 總覽帶
 *
 * 一整條把「每個分類的完成度」攤平：一格一類，下面是方塊計量。
 * 這是這個畫面唯一的全局視圖，點一格就切換分類。
 */
import type { AchievementCategory } from '@/types/achievement';
import { CATEGORY_CONFIG } from '@/types/achievement';
import { Num } from '@/components/hl';
import { ProgressBlocks } from './observatoryShared';
import type { CategoryProgress, ObservatoryCategory } from './CategorySidebar';

interface Props {
  categories: CategoryProgress[];
  selected: ObservatoryCategory;
  onSelect: (c: ObservatoryCategory) => void;
  totalEarned: number;
  totalCount: number;
}

export function ArchiveRibbon({ categories, selected, onSelect, totalEarned, totalCount }: Props) {
  const totalPct = totalCount > 0 ? (totalEarned / totalCount) * 100 : 0;

  return (
    <div className="flex shrink-0 items-stretch border-b border-[var(--cn-line-soft)] bg-[var(--arc-void-2)]">
      {/* 起頭：總完成度 */}
      <div className="flex w-[212px] shrink-0 flex-col justify-center gap-1.5 border-r border-[var(--cn-line-soft)] px-3 py-2">
        <div className="flex items-baseline justify-between">
          <span className="arc-label">archive</span>
          <span className="font-mono text-[13px] font-semibold leading-none tabular-nums arc-num text-[var(--arc-gold)]">
            {Math.round(totalPct)}
            <span className="ml-0.5 text-[9px] font-normal text-[var(--arc-ink-3)]">%</span>
          </span>
        </div>
        <ProgressBlocks pct={totalPct} total={24} tone="caution" height={5} fill />
        <Num
          value={`${totalEarned}/${totalCount}`}
          tone="muted"
          size="sm"
          className="font-mono tabular-nums tracking-[0.06em]"
        />
      </div>

      {/* 分類格 */}
      <div className="flex min-w-0 flex-1 items-stretch overflow-x-auto">
        {categories.map(({ category, earned, total }, i) => {
          const active = selected === category;
          const pct = total > 0 ? (earned / total) * 100 : 0;
          return (
            <button
              key={category}
              type="button"
              onClick={() => onSelect(category as ObservatoryCategory)}
              className={[
                'group relative flex min-w-[72px] flex-1 flex-col justify-center gap-1.5 border-r border-[var(--cn-line-soft)] px-2 py-2 text-left',
                'transition-colors duration-150 hover:bg-[var(--arc-deck-2)]',
                active ? 'bg-[var(--arc-deck-2)]' : '',
              ].join(' ')}
            >
              <span
                aria-hidden="true"
                className={`absolute left-0 top-0 h-full w-[2px] ${active ? 'bg-[var(--arc-gold)]' : 'bg-transparent'}`}
              />
              <span className="flex items-center gap-1.5">
                <Num
                  value={String(i + 1).padStart(2, '0')}
                  tone={active ? 'signal' : 'muted'}
                  size="sm"
                  className="font-mono tabular-nums"
                />
                <span
                  className={`min-w-0 flex-1 truncate font-mono text-[9.5px] uppercase tracking-[0.06em] ${
                    active ? 'text-[var(--arc-ink)]' : 'text-[var(--arc-ink-2)]'
                  } hidden xl:inline`}
                >
                  {CATEGORY_CONFIG[category as AchievementCategory].label}
                </span>
                <Num
                  value={`${earned}/${total}`}
                  tone="muted"
                  size="sm"
                  className="shrink-0 font-mono tabular-nums"
                />
              </span>
              <ProgressBlocks pct={pct} total={18} tone={active ? 'caution' : 'ink'} height={4} fill />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ArchiveRibbon;
