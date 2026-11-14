/**
 * 戰績中心 · 共用列與徽章（HARDLINE）
 *
 * 全部走 hl-row 結構：密集列、1px 分隔線、數值一律 mono tabular。
 */
import type { GameRecord } from '@/store/statsStore';
import { useTranslation } from '@/i18n';
import { Deck, SegHead, Num, Dot } from '@/components/hl';
import { getStatsGameModeLabel } from '@/store/statsGameMode';
import {
  formatGameRecordDifficulty,
  formatGameRecordMap,
  gameDifficultyLabelsFromDetail,
} from '@/data/gameRecordLabels';

/* --------------------------------------------------------- 模式徽章 */

export function GameModeBadge({ mode }: { mode?: Parameters<typeof getStatsGameModeLabel>[0] }) {
  return (
    <span className="inline-flex items-center border border-[var(--hl-line)] px-1.5 py-0.5 font-mono text-[10px] tracking-[0.06em] text-[var(--hl-ink-3)]">
      {getStatsGameModeLabel(mode)}
    </span>
  );
}

/* ------------------------------------------------------------- 欄位 */

/** 表格列共用欄寬，header 與 row 必須一致 */
export const STATS_COLS = {
  result: 'w-[76px] shrink-0',
  map: 'min-w-0 flex-1',
  mode: 'w-[76px] shrink-0 hidden sm:block',
  wave: 'w-[64px] shrink-0 text-right',
  score: 'w-[86px] shrink-0 text-right',
  duration: 'w-[76px] shrink-0 text-right hidden md:block',
  date: 'w-[132px] shrink-0 text-right hidden lg:block',
} as const;

export function StatsTableHead({
  labels,
}: {
  labels: {
    result: string;
    map: string;
    mode: string;
    wave: string;
    score: string;
    duration: string;
    date: string;
  };
}) {
  return (
    <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-[var(--hl-line)] bg-[var(--hl-void)] px-3 py-1.5">
      <span className={`${STATS_COLS.result} hl-label`}>{labels.result}</span>
      <span className={`${STATS_COLS.map} hl-label`}>{labels.map}</span>
      <span className={`${STATS_COLS.mode} hl-label`}>{labels.mode}</span>
      <span className={`${STATS_COLS.wave} hl-label`}>{labels.wave}</span>
      <span className={`${STATS_COLS.score} hl-label`}>{labels.score}</span>
      <span className={`${STATS_COLS.duration} hl-label`}>{labels.duration}</span>
      <span className={`${STATS_COLS.date} hl-label`}>{labels.date}</span>
    </div>
  );
}

/* ------------------------------------------------------- 歷史戰局列 */

export function GameHistoryRow({
  game,
  onClick,
  formatDuration,
  formatDate,
}: {
  game: GameRecord;
  onClick: () => void;
  formatDuration: (ms: number) => string;
  formatDate: (timestamp: number) => string;
}) {
  const { t } = useTranslation();
  const e = t.encyclopedia;
  const diffLabels = gameDifficultyLabelsFromDetail(t.mutatorChallenge.detail);

  return (
    <button
      type="button"
      onClick={onClick}
      className="hl-row hl-row-hover w-full text-left"
    >
      <span className={`${STATS_COLS.result} flex items-center gap-1.5`}>
        <Dot tone={game.isVictory ? 'vital' : 'alarm'} />
        <span
          className={[
            'hl-label',
            game.isVictory ? 'text-[var(--hl-vital)]' : 'text-[var(--hl-alarm)]',
          ].join(' ')}
        >
          {game.isVictory ? e.statsVictory : e.statsDefeat}
        </span>
      </span>

      <span className={`${STATS_COLS.map} min-w-0`}>
        <span className="block truncate text-[12.5px] text-[var(--hl-ink)]">
          {formatGameRecordMap(game.mapId)}
          <span className="ml-1.5 font-mono text-[10px] text-[var(--hl-ink-3)]">
            {formatGameRecordDifficulty(game.difficulty, diffLabels)}
          </span>
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

/* --------------------------------------------------------- 排行榜列 */

export function TopGamesList({
  games,
  formatDuration,
  formatDate,
}: {
  games: GameRecord[];
  formatDuration: (ms: number) => string;
  formatDate: (timestamp: number) => string;
}) {
  const { t } = useTranslation();
  const e = t.encyclopedia;
  const diffLabels = gameDifficultyLabelsFromDetail(t.mutatorChallenge.detail);

  if (games.length === 0) {
    return <div className="hl-micro px-3 py-4 text-center">{e.statsNoRecord}</div>;
  }

  return (
    <div className="flex flex-col">
      {games.map((game, index) => (
        <div key={game.id} className="flex items-center gap-3 border-b border-[var(--hl-line)] px-3 py-2 last:border-b-0">
          <span
            className={[
              'w-6 shrink-0 border text-center font-mono text-[10px] tabular-nums',
              index === 0
                ? 'border-[var(--hl-signal)] text-[var(--hl-signal)]'
                : 'border-[var(--hl-line)] text-[var(--hl-ink-3)]',
            ].join(' ')}
          >
            {index + 1}
          </span>

          <span className="min-w-0 flex-1">
            <span className="block truncate text-[12.5px] text-[var(--hl-ink)]">
              {formatGameRecordMap(game.mapId)}
              <span className="ml-1.5 font-mono text-[10px] text-[var(--hl-ink-3)]">
                {formatGameRecordDifficulty(game.difficulty, diffLabels)}
              </span>
            </span>
            <span className="mt-0.5 flex items-center gap-1.5">
              <GameModeBadge mode={game.gameMode} />
              <span className="font-mono text-[10px] text-[var(--hl-ink-4)]">{formatDate(game.date)}</span>
            </span>
          </span>

          <span className="shrink-0 text-right">
            <Num value={game.score.toLocaleString()} size="sm" />
          </span>
          <span className="w-[64px] shrink-0 text-right">
            <Num value={String(game.finalWave)} size="sm" tone="muted" />
          </span>
          <span className="w-[76px] shrink-0 text-right">
            <Num value={formatDuration(game.duration)} size="sm" tone="muted" />
          </span>
        </div>
      ))}
    </div>
  );
}
