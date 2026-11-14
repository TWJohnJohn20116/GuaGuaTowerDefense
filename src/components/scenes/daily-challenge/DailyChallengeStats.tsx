// 每日挑戰 · 狀態帶數值（HARDLINE StatCell，等寬、無底板顏色）
import { useTranslation } from '@/i18n';
import { StatCell } from '@/components/hl';

interface DailyChallengeStatsProps {
  totalCompleted: number;
  currentStreak: number;
  longestStreak: number;
}

export function DailyChallengeStats({
  totalCompleted,
  currentStreak,
  longestStreak,
}: DailyChallengeStatsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-stretch divide-x divide-[var(--hl-line)] border border-[var(--hl-line)]">
      <div className="px-3 py-1.5">
        <StatCell label={t.dailyChallenge.totalCompleted} value={totalCompleted} />
      </div>
      <div className="px-3 py-1.5">
        <StatCell
          label={t.dailyChallenge.streak}
          value={currentStreak}
          tone={currentStreak > 0 ? 'signal' : 'ink'}
        />
      </div>
      <div className="px-3 py-1.5">
        <StatCell label={t.dailyChallenge.longestStreak} value={longestStreak} tone="muted" />
      </div>
    </div>
  );
}

export default DailyChallengeStats;
