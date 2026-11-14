/**
 * 檔案館 · 卷宗清單（HARDLINE）
 *
 * 依分類分段落，每段一個黏性表頭；清單本體是密集列，不是卡片牆。
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Achievement, AchievementCategory, AchievementStatus } from '@/types/achievement';
import { CATEGORY_CONFIG } from '@/types/achievement';
import { Btn, Empty, Num } from '@/components/hl';
import { useTranslation } from '@/i18n';
import { AchievementGridCard } from './AchievementGridCard';

const PAGE_SIZE = 48;

interface AchievementsGridProps {
  achievements: Achievement[];
  selectedId: string | null;
  highlightId: string | null;
  scrollToId: string | null;
  getStatus: (id: string) => AchievementStatus;
  getPct: (id: string) => number;
  onSelect: (id: string) => void;
  onScrollHandled: () => void;
}

export function AchievementsGrid({
  achievements,
  selectedId,
  highlightId,
  scrollToId,
  getStatus,
  getPct,
  onSelect,
  onScrollHandled,
}: AchievementsGridProps) {
  const { t } = useTranslation();
  const o = t.achievements.observatory;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const rowRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    if (!scrollToId) return;
    const idx = achievements.findIndex((a) => a.id === scrollToId);
    if (idx >= 0 && idx >= visibleCount) {
      setVisibleCount(Math.ceil((idx + 1) / PAGE_SIZE) * PAGE_SIZE);
    }
  }, [scrollToId, achievements, visibleCount]);

  useEffect(() => {
    if (!scrollToId) return;
    const timer = window.setTimeout(() => {
      rowRefs.current.get(scrollToId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      onScrollHandled();
    }, 80);
    return () => window.clearTimeout(timer);
  }, [scrollToId, visibleCount, achievements, onScrollHandled]);

  const visible = achievements.slice(0, visibleCount);
  const hasMore = visibleCount < achievements.length;

  /** 依分類分組，保留原順序 */
  const groups = useMemo(() => {
    const map = new Map<AchievementCategory, Achievement[]>();
    for (const a of visible) {
      const list = map.get(a.category);
      if (list) list.push(a);
      else map.set(a.category, [a]);
    }
    return [...map.entries()];
  }, [visible]);

  if (achievements.length === 0) {
    return <Empty title={o.noResults} className="m-3" />;
  }

  return (
    <div className="flex flex-col">
      {/* 表頭 */}
      <div className="sticky top-0 z-10 grid grid-cols-[18px_18px_minmax(0,1fr)_182px_62px_44px] items-center gap-3 border-b border-[var(--cn-line-soft)] bg-[var(--arc-void)] py-1.5 pl-2 pr-3">
        <span />
        <span className="text-center font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--arc-ink-4)]">r</span>
        <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--arc-ink-4)]">entry</span>
        <span className="hidden font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--arc-ink-4)] sm:block">
          progress
        </span>
        <span className="text-right font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--arc-ink-4)]">state</span>
        <span className="text-right font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--arc-ink-4)]">pts</span>
      </div>

      {groups.map(([category, list]) => {
        const earned = list.filter((a) => {
          const s = getStatus(a.id);
          return s === 'completed' || s === 'claimed';
        }).length;
        return (
          <section key={category}>
            {/* 分類段頭 */}
            <div className="sticky top-[28px] z-[9] flex items-center gap-2.5 border-b border-[var(--cn-line-soft)] bg-[var(--arc-deck)] px-2 py-1.5">
              <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--arc-ink)]">
                {CATEGORY_CONFIG[category].label}
              </span>
              <span className="h-px flex-1 bg-[var(--arc-line)]" />
              <Num
                value={`${earned}/${list.length}`}
                tone="muted"
                size="sm"
                className="font-mono tabular-nums"
              />
            </div>

            {list.map((a) => (
              <div
                key={a.id}
                ref={(el) => {
                  if (el) rowRefs.current.set(a.id, el);
                  else rowRefs.current.delete(a.id);
                }}
              >
                <AchievementGridCard
                  achievement={a}
                  status={getStatus(a.id)}
                  pct={getPct(a.id)}
                  selected={selectedId === a.id}
                  highlighted={highlightId === a.id}
                  onSelect={() => onSelect(a.id)}
                />
              </div>
            ))}
          </section>
        );
      })}

      {hasMore && (
        <div className="flex items-center gap-2 border-t border-[var(--cn-line-soft)] p-2">
          <Num
            value={`${visibleCount}/${achievements.length}`}
            tone="muted"
            size="sm"
            className="font-mono tabular-nums"
          />
          <Btn size="sm" variant="line" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>
            {`+${PAGE_SIZE}`}
          </Btn>
        </div>
      )}
    </div>
  );
}

export default AchievementsGrid;
