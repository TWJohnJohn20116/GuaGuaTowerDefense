/**
 * 成就觀測站 · 清單型檢視（HARDLINE：表格列 + 展開列，卡片全部退場）
 */
import { useState, useRef, useEffect, useMemo } from 'react';
import type { Achievement, AchievementStatus } from '@/types/achievement';
import { RARITY_CONFIG } from '@/types/achievement';
import { Btn, Chip, Dot, Empty, Input, Meter, Num, SegHead } from '@/components/hl';
import { useTranslation } from '@/i18n';
import {
  RARITY_TONE,
  StarPoint,
  TONE_TEXT,
  formatNum,
  getConditionLabel,
  isEarned,
  type ObservatoryFilterMode,
} from './observatoryShared';

const PAGE_SIZE = 60;

interface Props {
  achievements: Achievement[];
  getStatus: (id: string) => AchievementStatus;
  getPct: (id: string) => number;
  getProgress: (id: string) => number[];
  filter: ObservatoryFilterMode;
  onFilterChange: (f: ObservatoryFilterMode) => void;
  search: string;
  onSearchChange: (s: string) => void;
  onClaim: (id: string) => void;
  expandedId?: string | null;
  onExpandedIdChange?: (id: string | null) => void;
  scrollToId?: string | null;
  onScrollHandled?: () => void;
  highlightId?: string | null;
}

export function StarList({
  achievements,
  getStatus,
  getPct,
  getProgress,
  filter,
  onFilterChange,
  search,
  onSearchChange,
  onClaim,
  expandedId: expandedIdProp,
  onExpandedIdChange,
  scrollToId,
  onScrollHandled,
  highlightId,
}: Props) {
  const { t } = useTranslation();
  const o = t.achievements.observatory;
  const a = t.achievements;

  const filters = useMemo(
    () => [
      { id: 'all' as const, label: a.all },
      { id: 'in_progress' as const, label: a.filterInProgress },
      { id: 'completed' as const, label: o.filterCompletedEarned },
      { id: 'locked' as const, label: a.filterLocked },
    ],
    [o, a],
  );

  const [internalExpandedId, setInternalExpandedId] = useState<string | null>(null);
  const expandedId = expandedIdProp !== undefined ? expandedIdProp : internalExpandedId;
  const setExpandedId = (id: string | null) => {
    if (onExpandedIdChange) onExpandedIdChange(id);
    else setInternalExpandedId(id);
  };

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const rowRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    if (!scrollToId) return;
    const idx = achievements.findIndex((x) => x.id === scrollToId);
    if (idx >= 0 && idx >= visibleCount) {
      setVisibleCount(Math.ceil((idx + 1) / PAGE_SIZE) * PAGE_SIZE);
    }
  }, [scrollToId, achievements, visibleCount]);

  useEffect(() => {
    if (!scrollToId) return;
    const timer = window.setTimeout(() => {
      rowRefs.current.get(scrollToId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      onScrollHandled?.();
    }, 50);
    return () => window.clearTimeout(timer);
  }, [scrollToId, visibleCount, achievements, onScrollHandled]);

  const visible = achievements.slice(0, visibleCount);
  const hasMore = visibleCount < achievements.length;

  return (
    <div className="flex flex-col gap-2 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={o.searchPlaceholderShort}
          aria-label={o.searchPlaceholderShort}
          className="h-7 w-[220px] shrink-0"
        />
        <div className="flex flex-wrap items-center gap-1">
          {filters.map((f) => (
            <Chip key={f.id} active={filter === f.id} onClick={() => onFilterChange(f.id)}>
              {f.label}
            </Chip>
          ))}
        </div>
      </div>

      <div className="flex flex-col border-t border-[var(--cn-line-soft)]">
        {visible.map((item, i) => {
          const status = getStatus(item.id);
          const pct = getPct(item.id);
          const earned = isEarned(status);
          const secretLocked = (item.secret || item.hidden) && !earned;
          const tone = RARITY_TONE[item.rarity];
          const cfg = RARITY_CONFIG[item.rarity];
          const expanded = expandedId === item.id;
          const claimable = status === 'completed';

          return (
            <div
              key={item.id}
              ref={(el) => {
                if (el) rowRefs.current.set(item.id, el);
                else rowRefs.current.delete(item.id);
              }}
              className={
                highlightId === item.id
                  ? 'bg-[var(--arc-gold-veil)]'
                  : expanded
                    ? 'bg-[var(--arc-deck-2)]'
                    : ''
              }
            >
              <button
                type="button"
                onClick={() => setExpandedId(expanded ? null : item.id)}
                aria-expanded={expanded}
                className="flex items-center gap-3 min-h-10 border-b border-[var(--cn-line-soft)] px-3 transition-colors last:border-b-0 hover:bg-[var(--arc-deck-2)] w-full text-left"
              >
                <Num
                  value={String(i + 1).padStart(2, '0')}
                  tone="muted"
                  size="sm"
                  className="w-6 shrink-0 font-mono tabular-nums"
                />
                <StarPoint tone={tone} lit={earned} size={8} />
                <span className="min-w-0 flex-1">
                  <span
                    className={`block truncate text-[12.5px] ${
                      earned ? 'text-[var(--arc-ink-2)]' : 'text-[var(--arc-ink)]'
                    }`}
                  >
                    {secretLocked ? '？？？' : item.name}
                  </span>
                  <span className="mt-0.5 block truncate text-[10.5px] text-[var(--arc-ink-3)]">
                    {secretLocked ? o.secretLocked : item.description}
                  </span>
                </span>
                <span className={`shrink-0 font-mono text-[9px] uppercase tracking-[0.06em] ${TONE_TEXT[tone]}`}>
                  {cfg.label}
                </span>
                <Num
                  value={earned ? '100%' : pct > 0 ? `${Math.round(pct)}%` : '—'}
                  tone="muted"
                  size="sm"
                  className="w-12 shrink-0 text-right font-mono tabular-nums"
                />
                {claimable ? (
                  <Dot tone="caution" pulse />
                ) : status === 'claimed' ? (
                  <Dot tone="vital" />
                ) : (
                  <span className="h-1.5 w-1.5" />
                )}
              </button>

              {expanded && (
                <div className="border-b border-[var(--cn-line-soft)] bg-[var(--arc-void-2)] px-3 py-2.5">
                  <SegHead
                    label={o.detailCondition}
                    right={
                      <span className={`font-mono text-[9.5px] uppercase tracking-[0.06em] ${TONE_TEXT[tone]}`}>
                        {`${cfg.label} +${cfg.points}`}
                      </span>
                    }
                  />

                  <div className="mt-2 flex flex-col gap-2">
                    {item.conditions.map((cond, ci) => {
                      const progressValues = getProgress(item.id);
                      const cur = Math.min(progressValues[ci] ?? 0, cond.target);
                      const condPct = cond.target > 0 ? (cur / cond.target) * 100 : 0;
                      return (
                        <div key={ci}>
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="min-w-0 truncate text-[11.5px] text-[var(--arc-ink-2)]">
                              {secretLocked
                                ? '？？？'
                                : getConditionLabel(t.achievements, cond.type)}
                            </span>
                            <Num
                              value={`${formatNum(cur)}/${formatNum(cond.target)}`}
                              tone="ink"
                              size="sm"
                              className="shrink-0 font-mono tabular-nums"
                            />
                          </div>
                          <Meter
                            value={condPct}
                            max={100}
                            tone={condPct >= 100 ? 'vital' : 'ink'}
                            className="mt-1"
                          />
                        </div>
                      );
                    })}
                  </div>

                  {item.rewards.length > 0 && (
                    <div className="mt-2 flex flex-wrap items-center gap-1">
                      <span className="arc-label">{o.detailReward}</span>
                      {item.rewards.map((r, ri) => (
                        <Num
                          key={ri}
                          value={
                            r.type === 'points'
                              ? o.rewardPointsUnit.replace('{value}', String(r.value))
                              : String(r.value)
                          }
                          tone="ink"
                          size="sm"
                          className="border-[3px] border-[var(--cn-line-soft)] px-1.5 py-0.5 font-mono tabular-nums"
                        />
                      ))}
                    </div>
                  )}

                  {claimable && (
                    <div className="mt-2">
                      <Btn size="sm" variant="signal" block onClick={() => onClaim(item.id)}>
                        {o.claimBtn}
                      </Btn>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {achievements.length === 0 && <Empty title={o.noResults} className="mt-2" />}

      {hasMore && (
        <div className="flex items-center gap-2 border-t border-[var(--cn-line-soft)] pt-2">
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

export default StarList;
