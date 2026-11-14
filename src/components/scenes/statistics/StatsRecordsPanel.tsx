import { useStatsStore } from '@/store/statsStore';
import { useStatsFormatters } from './useStatsFormatters';
import { TopGamesList } from './statsShared';
import { Deck, SegHead } from '@/components/hl';
import { TrophyIcon, HeartIcon, ClockIcon } from '@/components/ui/Icons';

export function StatsRecordsPanel() {
  const { formatDuration, formatDate, e } = useStatsFormatters();
  const getBestGames = useStatsStore((s) => s.getBestGames);

  const sections = [
    { icon: <TrophyIcon className="h-3.5 w-3.5 text-[var(--hl-ink-4)]" />, title: e.statsHighScoreRank, games: getBestGames('score') },
    { icon: <HeartIcon className="h-3.5 w-3.5 text-[var(--hl-ink-4)]" />, title: e.statsHighWaveRank, games: getBestGames('wave') },
    { icon: <ClockIcon className="h-3.5 w-3.5 text-[var(--hl-ink-4)]" />, title: e.statsFastestRank, games: getBestGames('duration') },
  ];

  return (
    <div className="flex flex-col gap-5">
      {sections.map((section) => (
        <div key={section.title} className="flex flex-col gap-2">
          <SegHead label={section.title} right={section.icon} />
          <Deck className="overflow-hidden">
            <TopGamesList
              games={section.games}
              formatDuration={formatDuration}
              formatDate={formatDate}
            />
          </Deck>
        </div>
      ))}
    </div>
  );
}
