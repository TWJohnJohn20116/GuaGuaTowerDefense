/**
 * 每日挑戰 · 歷史右欄摘要（HARDLINE）
 *
 * 完成率計量 + 三個等寬數值 + 一行說明。沒有徑向漸層底圖。
 */
import { useTranslation } from '@/i18n';
import { Field, Meter, SegHead, StatCell } from '@/components/hl';

interface DailyChallengeHistoryPanelProps {
  totalCompleted: number;
  currentStreak: number;
  longestStreak: number;
  historyCompleted: number;
  historyTotal: number;
}

export function DailyChallengeHistoryPanel({
  totalCompleted,
  currentStreak,
  longestStreak,
  historyCompleted,
  historyTotal,
}: DailyChallengeHistoryPanelProps) {
  const { t } = useTranslation();
  const hp = t.dailyChallenge.historyPanel;
  const rate = historyTotal > 0 ? Math.round((historyCompleted / historyTotal) * 100) : 0;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-[var(--hl-line)] px-4 py-3">
        <SegHead
          label={hp.challengeStats}
          right={
            <span className="font-mono text-[10px] tabular-nums text-[var(--hl-ink-2)]">
              {`${historyCompleted}/${historyTotal}`}
            </span>
          }
        />
        <div className="mt-2.5 flex items-end justify-between gap-3">
          <StatCell
            label={hp.completionRate}
            value={rate}
            unit="%"
            tone={rate >= 50 ? 'vital' : 'ink'}
          />
          <span className="w-[132px]">
            <Meter value={rate} max={100} tone={rate >= 50 ? 'vital' : 'signal'} />
          </span>
        </div>
      </div>

      <div className="px-4 py-3">
        <div className="grid grid-cols-3 gap-x-3">
          <StatCell label={t.dailyChallenge.totalCompleted} value={totalCompleted} />
          <StatCell
            label={t.dailyChallenge.streak}
            value={currentStreak}
            tone={currentStreak > 0 ? 'signal' : 'ink'}
          />
          <StatCell label={t.dailyChallenge.longestStreak} value={longestStreak} tone="muted" />
        </div>
      </div>

      <div className="mt-auto border-t border-[var(--hl-line)] px-4 py-3">
        <Field label={hp.recentDays.replace('{total}', String(historyTotal)).replace('{completed}', String(historyCompleted))}>
          <span className="font-mono text-[11px] tabular-nums text-[var(--hl-ink-2)]">
            {`${historyCompleted}/${historyTotal}`}
          </span>
        </Field>
        <p className="mt-2 text-[11px] leading-relaxed text-[var(--hl-ink-3)]">{hp.recentHint}</p>
      </div>
    </div>
  );
}

export default DailyChallengeHistoryPanel;
