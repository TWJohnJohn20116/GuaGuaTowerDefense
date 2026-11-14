import { useState } from 'react';
import { useStatsStore } from '@/store/statsStore';
import type { GameRecord } from '@/store/statsStore';
import { useStatsFormatters } from './useStatsFormatters';
import { GameHistoryRow } from './statsShared';
import { ClockIcon, TrashIcon } from '@/components/ui/Icons';
import { Deck, Btn } from '@/components/hl';
import { StatsClearConfirmDialog } from './StatsClearConfirmDialog';

interface Props {
  onSelectGame: (game: GameRecord) => void;
}

export function StatsHistoryPanel({ onSelectGame }: Props) {
  const { formatDuration, formatDate, e } = useStatsFormatters();
  const gameHistory = useStatsStore((s) => s.gameHistory);
  const clearHistory = useStatsStore((s) => s.clearHistory);
  const [clearOpen, setClearOpen] = useState(false);

  return (
    <Deck className="flex flex-col overflow-hidden">
      <div className="flex items-center gap-2.5 border-b border-[var(--hl-line)] px-3 py-2">
        <span className="flex items-center gap-1.5 text-[var(--hl-ink-3)]">
          <ClockIcon className="h-3.5 w-3.5" />
        </span>
        <span className="hl-label text-[var(--hl-ink)]">{e.statsCompleteHistory}</span>
        {gameHistory.length > 0 && (
          <Btn
            variant="danger"
            size="sm"
            className="ml-auto"
            icon={<TrashIcon className="h-3 w-3" />}
            onClick={() => setClearOpen(true)}
          >
            {e.statsClearRecord}
          </Btn>
        )}
      </div>

      {gameHistory.length === 0 ? (
        <div className="hl-micro px-3 py-6 text-center">{e.statsNoRecord}</div>
      ) : (
        <div className="flex max-h-[600px] flex-col overflow-y-auto">
          {gameHistory.map((game) => (
            <GameHistoryRow
              key={game.id}
              game={game}
              onClick={() => onSelectGame(game)}
              formatDuration={formatDuration}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}

      <StatsClearConfirmDialog
        open={clearOpen}
        onClose={() => setClearOpen(false)}
        onConfirm={() => {
          clearHistory();
          setClearOpen(false);
        }}
      />
    </Deck>
  );
}
