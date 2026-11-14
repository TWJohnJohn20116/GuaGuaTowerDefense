// 成就觀測站 · 頂列數值（HARDLINE StatCell）
import { StatCell } from '@/components/hl';
import { useTranslation } from '@/i18n';
import { formatNum } from './observatoryShared';

interface AchievementsHeaderStatsProps {
  earnedCount: number;
  totalCount: number;
  points: number;
  claimableCount: number;
}

export function AchievementsHeaderStats({
  earnedCount,
  totalCount,
  points,
  claimableCount,
}: AchievementsHeaderStatsProps) {
  const { t } = useTranslation();
  const o = t.achievements.observatory;

  return (
    <div className="flex items-stretch divide-x divide-[var(--hl-line)] border border-[var(--hl-line)]">
      <div className="px-3 py-1.5">
        <StatCell label={o.statUnlocked} value={`${earnedCount}/${totalCount}`} tone="signal" />
      </div>
      <div className="px-3 py-1.5">
        <StatCell label={o.statPoints} value={formatNum(points)} />
      </div>
      <div className="px-3 py-1.5">
        <StatCell
          label={o.statClaimable}
          value={claimableCount}
          tone={claimableCount > 0 ? 'caution' : 'muted'}
        />
      </div>
    </div>
  );
}

export default AchievementsHeaderStats;
