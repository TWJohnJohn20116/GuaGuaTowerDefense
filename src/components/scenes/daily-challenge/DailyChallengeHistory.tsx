/**
 * 每日挑戰 · 過去 30 天（HARDLINE 表格列，不用卡片）
 *
 * 每列：mono 日期、模板、結果。完成用 vital，未完成留灰。
 */
import { useMemo } from 'react';
import { useTranslation } from '@/i18n';
import { Dot, Empty, SegHead } from '@/components/hl';
import type { DailyChallengeHistoryEntry } from '@/types/dailyChallenge';

interface DailyChallengeHistoryProps {
  history: DailyChallengeHistoryEntry[];
}

/** 將 YYYY-MM-DD 轉為 MM/DD 短格式 */
function shortDate(date: string): string {
  const parts = date.split('-');
  return parts.length >= 3 ? `${parts[1]}/${parts[2]}` : date;
}

export function DailyChallengeHistory({ history }: DailyChallengeHistoryProps) {
  const { t } = useTranslation();
  const entries = useMemo(() => history.slice(0, 30), [history]);
  const completed = entries.filter((e) => e.completed).length;

  return (
    <section className="px-4 pb-4 pt-3">
      <SegHead
        label={t.dailyChallenge.pastThirtyDays}
        right={
          <span className="flex items-center gap-2 font-mono text-[10px] tabular-nums text-[var(--hl-ink-3)]">
            <span className="text-[var(--hl-vital)]">{completed}</span>
            <span className="text-[var(--hl-ink-4)]">/</span>
            <span>{entries.length}</span>
          </span>
        }
      />

      {entries.length === 0 ? (
        <Empty title={t.dailyChallenge.noHistory} className="mt-3" />
      ) : (
        <div className="mt-2 flex flex-col border-t border-[var(--hl-line)]">
          <div className="flex items-center gap-3 border-b border-[var(--hl-line)] py-1.5">
            <span className="w-10 shrink-0 font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--hl-ink-4)]">
              date
            </span>
            <span className="min-w-0 flex-1 font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--hl-ink-4)]">
              template
            </span>
            <span className="w-[72px] shrink-0 text-right font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--hl-ink-4)]">
              status
            </span>
          </div>

          {entries.map((entry, idx) => (
            <div
              key={entry.date}
              className="hl-row hl-row-hover"
              title={`${entry.date} — ${entry.completed ? t.dailyChallenge.completed : t.dailyChallenge.incomplete}`}
            >
              <span className="w-10 shrink-0 font-mono text-[10px] tabular-nums text-[var(--hl-ink-3)]">
                {shortDate(entry.date)}
              </span>
              <Dot tone={entry.completed ? 'vital' : 'ink'} />
              <span
                className={`min-w-0 flex-1 truncate text-[12px] ${
                  entry.completed ? 'text-[var(--hl-ink-2)]' : 'text-[var(--hl-ink-3)]'
                }`}
              >
                {entry.templateId}
              </span>
              <span className="w-6 shrink-0 text-right font-mono text-[9.5px] tabular-nums text-[var(--hl-ink-4)]">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <span
                className={`w-[72px] shrink-0 text-right font-mono text-[9.5px] uppercase tracking-[0.08em] ${
                  entry.completed ? 'text-[var(--hl-vital)]' : 'text-[var(--hl-ink-4)]'
                }`}
              >
                {entry.completed ? t.dailyChallenge.completed : t.dailyChallenge.incomplete}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default DailyChallengeHistory;
