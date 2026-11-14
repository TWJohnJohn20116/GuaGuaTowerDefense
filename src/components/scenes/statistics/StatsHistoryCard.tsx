/**
 * 戰績中心 · 歷史戰局列（密集表格列，hl-row 結構）
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
  gameDifficultyLabelsFromDetail,
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
  const diffLabels = gameDifficultyLabelsFromDetail(t.mutatorChallenge.detail);
  const resultLabel = game.isVictory ? victoryLabel : defeatLabel;
  const mapLabel = formatGameRecordMap(game.mapId);
  const diffLabel = formatGameRecordDifficulty(game.difficulty, diffLabels);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`${resultLabel} · ${mapLabel} · ${diffLabel}`}
      className={[
        'hl-row hl-row-hover relative w-full text-left',
        selected ? 'bg-[var(--hl-signal-veil)]' : '',
      ].join(' ')}
    >
      {/* 選中：左緣訊號條，與 Rail 同一種標記 */}
      <span
        className={[
          'absolute left-0 top-0 h-full w-[2px]',
          selected ? 'bg-[var(--hl-signal)]' : 'bg-transparent',
        ].join(' ')}
      />

      <span className={`${STATS_COLS.result} flex items-center gap-1.5`}>
        {game.isVictory
          ? <TrophyIcon className="h-3 w-3 text-[var(--hl-vital)]" />
          : <SkullIcon className="h-3 w-3 text-[var(--hl-alarm)]" />}
        <span
          className={[
            'hl-label',
            game.isVictory ? 'text-[var(--hl-vital)]' : 'text-[var(--hl-alarm)]',
          ].join(' ')}
        >
          {resultLabel}
        </span>
      </span>

      <span className={`${STATS_COLS.map} min-w-0`}>
        <span className="block truncate text-[12.5px] text-[var(--hl-ink)]">
          {mapLabel}
          <span className="ml-1.5 font-mono text-[10px] text-[var(--hl-ink-3)]">{diffLabel}</span>
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
        <span className="font-mono text-[10px] tabular-nums text-[var(--hl-ink-4)]">
          {formatDate(game.date)}
        </span>
      </span>
    </button>
  );
}

export default StatsHistoryCard;
