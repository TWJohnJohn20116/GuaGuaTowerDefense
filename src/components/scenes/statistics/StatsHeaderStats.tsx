// 戰績中心 · 頂列統計（等寬數值 + 結構線分隔）
import type React from 'react';
import { useTranslation } from '@/i18n';
import { TrophyIcon, ChartIcon, ClockIcon } from '@/components/ui/Icons';
import { Num, Rule } from '@/components/hl';

interface StatsHeaderStatsProps {
  gamesPlayed: number;
  gamesWon: number;
  winRate: number;
  playtimeLabel: string;
}

function TopStat({
  icon,
  label,
  value,
  tone = 'ink',
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: 'ink' | 'signal';
}) {
  return (
    <span className="flex items-center gap-2">
      <span className="text-[var(--arc-ink-3)]">{icon}</span>
      <span className="flex flex-col justify-center leading-none">
        <span className="arc-label">{label}</span>
        <span className="mt-0.5"><Num value={value} size="sm" tone={tone} /></span>
      </span>
    </span>
  );
}

export function StatsHeaderStats({
  gamesPlayed,
  gamesWon,
  winRate,
  playtimeLabel,
}: StatsHeaderStatsProps) {
  const { t } = useTranslation();
  const h = t.statistics.headerStats;

  return (
    <div className="flex items-center gap-3">
      <TopStat
        icon={<ChartIcon className="h-3.5 w-3.5" />}
        label={h.totalGames}
        value={gamesPlayed.toLocaleString()}
        tone="signal"
      />
      <Rule vertical className="h-6" />
      <TopStat
        icon={<TrophyIcon className="h-3.5 w-3.5" />}
        label={h.winRate}
        value={`${winRate.toFixed(1)}%`}
      />
      <Rule vertical className="h-6" />
      <TopStat
        icon={<TrophyIcon className="h-3.5 w-3.5" />}
        label={h.wins}
        value={gamesWon.toLocaleString()}
      />
      <Rule vertical className="h-6" />
      <TopStat
        icon={<ClockIcon className="h-3.5 w-3.5" />}
        label={h.totalPlaytime}
        value={playtimeLabel}
      />
    </div>
  );
}

export default StatsHeaderStats;
