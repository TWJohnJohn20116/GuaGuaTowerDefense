/**
 * 戰績中心 · 歷史戰局表格（密集列）
 */
import type { GameRecord } from '@/store/statsStore';
import { Empty } from '@/components/hl';
import { useTranslation } from '@/i18n';
import { StatsHistoryCard } from './StatsHistoryCard';
import { StatsTableHead } from './statsShared';

export interface StatsHistoryGridProps {
  games: GameRecord[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  formatDuration: (ms: number) => string;
  formatDate: (timestamp: number) => string;
  victoryLabel: string;
  defeatLabel: string;
  emptyLabel: string;
}

export function StatsHistoryGrid({
  games,
  selectedId,
  onSelect,
  formatDuration,
  formatDate,
  victoryLabel,
  defeatLabel,
  emptyLabel,
}: StatsHistoryGridProps) {
  const { t } = useTranslation();
  const e = t.encyclopedia;

  if (games.length === 0) {
    return <Empty title={emptyLabel} />;
  }

  return (
    <div className="flex flex-col">
      <StatsTableHead
        labels={{
          result: e.statsResult,
          map: e.statsMap,
          mode: t.statistics.fieldLabels.gameMode,
          wave: e.statsWave,
          score: e.statsScore,
          duration: e.statsDuration,
          date: e.statsDate,
        }}
      />
      {games.map((game) => (
        <StatsHistoryCard
          key={game.id}
          game={game}
          selected={selectedId === game.id}
          onSelect={() => onSelect(game.id)}
          formatDuration={formatDuration}
          formatDate={formatDate}
          victoryLabel={victoryLabel}
          defeatLabel={defeatLabel}
        />
      ))}
    </div>
  );
}

export default StatsHistoryGrid;
