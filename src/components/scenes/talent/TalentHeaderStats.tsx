// 天賦樹 · 頂列統計（等寬數值 + 結構線分隔）
import type React from 'react';
import { useTranslation } from '@/i18n';
import { TreeIcon, SparklesIcon, CoinIcon } from '@/components/ui/Icons';
import { Num, Rule } from '@/components/hl';

interface TalentHeaderStatsProps {
  talentPoints: number;
  totalSpentPoints: number;
  totalEarnedPoints: number;
}

function TopStat({
  icon,
  label,
  value,
  tone = 'ink',
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone?: 'ink' | 'signal';
}) {
  return (
    <span className="flex items-center gap-2">
      <span className="text-[var(--arc-ink-3)]">{icon}</span>
      <span className="flex flex-col justify-center leading-none">
        <span className="arc-label">{label}</span>
        <span className="mt-0.5"><Num value={String(value)} size="sm" tone={tone} /></span>
      </span>
    </span>
  );
}

export function TalentHeaderStats({
  talentPoints, totalSpentPoints, totalEarnedPoints,
}: TalentHeaderStatsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-3">
      <TopStat
        icon={<SparklesIcon className="h-3.5 w-3.5" />}
        label={t.talent.availablePoints}
        value={talentPoints}
        tone="signal"
      />
      <Rule vertical className="h-6" />
      <TopStat
        icon={<CoinIcon className="h-3.5 w-3.5" />}
        label={t.talent.invested}
        value={totalSpentPoints}
      />
      <Rule vertical className="h-6" />
      <TopStat
        icon={<TreeIcon className="h-3.5 w-3.5" />}
        label={t.talent.totalEarned}
        value={totalEarnedPoints}
      />
    </div>
  );
}

export default TalentHeaderStats;
