/**
 * 每日挑戰 · 狀態帶底線（HARDLINE）
 *
 * 目前分頁提示、快捷鍵、進度計量。分頁本身在左軌，這裡不再畫 tabs。
 */
import { Key, Meter } from '@/components/hl';

export type DailyChallengeTab = 'today' | 'history';

interface DailyChallengeToolbarProps {
  tab: DailyChallengeTab;
  progressPercent: number;
  historyCompleted: number;
  historyTotal: number;
  labels: {
    today: string;
    history: string;
    todayHint: string;
    historyHint: string;
  };
}

export function DailyChallengeToolbar({
  tab,
  progressPercent,
  historyCompleted,
  historyTotal,
  labels,
}: DailyChallengeToolbarProps) {
  const isToday = tab === 'today';
  const pct = isToday
    ? Math.round(progressPercent)
    : historyTotal > 0
      ? Math.round((historyCompleted / historyTotal) * 100)
      : 0;

  return (
    <div className="flex items-center gap-3 border-t border-[var(--hl-line)] px-4 py-1.5">
      <span className="hl-label shrink-0">{isToday ? labels.today : labels.history}</span>

      <span className="min-w-0 flex-1 truncate text-[11px] text-[var(--hl-ink-3)]">
        {isToday ? labels.todayHint : labels.historyHint}
      </span>

      <span className="hidden shrink-0 items-center gap-1.5 sm:flex">
        <Key>←</Key>
        <Key>→</Key>
        <Key>↵</Key>
      </span>

      <span className="flex w-[140px] shrink-0 items-center gap-2">
        <Meter value={pct} max={100} tone={isToday ? 'signal' : 'vital'} />
        <span className="font-mono text-[10px] tabular-nums text-[var(--hl-ink-2)]">
          {isToday ? `${pct}%` : `${historyCompleted}/${historyTotal}`}
        </span>
      </span>
    </div>
  );
}

export default DailyChallengeToolbar;
