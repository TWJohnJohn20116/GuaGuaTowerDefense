/**
 * 戰績中心 · 歷史戰局列（密集表格列，arc-row 結構）
 */
import type { GameRecord } from '@/store/statsStore';
import {
  TrophyIcon, SkullIcon,
} from '@/components/ui/Icons';
import { Num } from '@/components/hl';
import { GameModeBadge, STATS_COLS } from './statsShared';
import { useTranslation } from '@/i18n';
import {
  formatGameRecordDifficulty,
  formatGameRecordMap,
  gameDifficultyLabelsFromGameCopy,
} from '@/data/gameRecordLabels';

interface StatsHistoryCardProps {
  game: GameRecord;
  selected: boolean;
  onSelect: () => void;
  formatDuration: (ms: number) => string;
  formatDate: (timestamp: number) => string;
  victoryLabel: string;
  defeatLabel: string;
}

export function StatsHistoryCard({
  game,
  selected,
  onSelect,
  formatDuration,
  formatDate,
  victoryLabel,
  defeatLabel,
}: StatsHistoryCardProps) {
  const { t } = useTranslation();
  const diffLabels = gameDifficultyLabelsFromGameCopy(t.game);
  const resultLabel = game.isVictory ? victoryLabel : defeatLabel;
  const mapLabel = formatGameRecordMap(game.mapId);
  const diffLabel = formatGameRecordDifficulty(game.difficulty, diffLabels);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`${resultLabel} · ${mapLabel} · ${diffLabel}`}
      className={[
        'arc-row arc-row-hover relative w-full text-left',
        selected ? 'bg-[var(--arc-gold-veil)]' : '',
      ].join(' ')}
    >
      {/* 選中：左緣訊號條，與 Rail 同一種標記 */}
      <span
        className={[
          'absolute left-0 top-0 h-full w-[2px]',
          selected ? 'bg-[var(--arc-gold)]' : 'bg-transparent',
        ].join(' ')}
      />

      <span className={`${STATS_COLS.result} flex items-center gap-1.5`}>
        {game.isVictory
          ? <TrophyIcon className="h-3 w-3 text-[var(--arc-vital)]" />
          : <SkullIcon className="h-3 w-3 text-[var(--arc-alert)]" />}
        <span
          className={[
            'arc-label',
            game.isVictory ? 'text-[var(--arc-vital)]' : 'text-[var(--arc-alert)]',
          ].join(' ')}
        >
          {resultLabel}
        </span>
      </span>

      <span className={`${STATS_COLS.map} min-w-0`}>
        <span className="block truncate text-[12.5px] text-[var(--arc-ink)]">
          {mapLabel}
          <span className="ml-1.5 font-mono text-[10px] text-[var(--arc-ink-3)]">{diffLabel}</span>
        </span>
      </span>

      <span className={STATS_COLS.mode}>
        <GameModeBadge mode={game.gameMode} />
      </span>

      <span className={STATS_COLS.wave}>
        <Num value={String(game.finalWave)} size="sm" tone="muted" />
      </span>

      <span className={STATS_COLS.score}>
        <Num value={game.score.toLocaleString()} size="sm" />
      </span>

      <span className={STATS_COLS.duration}>
        <Num value={formatDuration(game.duration)} size="sm" tone="muted" />
      </span>

      <span className={STATS_COLS.date}>
        <span className="font-mono text-[10px] tabular-nums text-[var(--arc-ink-4)]">
          {formatDate(game.date)}
        </span>
      </span>
    </button>
  );
}

export default StatsHistoryCard;
