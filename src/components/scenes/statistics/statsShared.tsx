/**
 * 戰績中心 · 共用列與徽章（HARDLINE）
 *
 * 全部走 hl-row 結構：密集列、1px 分隔線、數值一律 mono tabular。
 */
import type { GameRecord } from '@/store/statsStore';
import { useTranslation } from '@/i18n';
import {
  ChartIcon, TrophyIcon, ClockIcon, SwordsIcon, CoinIcon,
  TowerIcon, SkullIcon, HeartIcon, StarIcon,
} from '@/components/ui/Icons';
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

/* --------------------------------------------------------- 詳情彈窗 */

export function GameDetailModal({
  game,
  onClose,
  formatDuration,
  formatDate,
}: {
  game: GameRecord;
  onClose: () => void;
  formatDuration: (ms: number) => string;
  formatDate: (timestamp: number) => string;
}) {
  const { t } = useTranslation();
  const e = t.encyclopedia;
  const fl = t.statistics.fieldLabels;
  const diffLabels = gameDifficultyLabelsFromDetail(t.mutatorChallenge.detail);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(6,7,10,0.82)] p-4"
      onClick={onClose}
    >
      <div className="w-full max-w-[760px]" onClick={(ev) => ev.stopPropagation()}>
        <Deck notch className="flex max-h-[82vh] w-full flex-col overflow-hidden">
          <div className="flex items-center gap-2.5 border-b border-[var(--hl-line)] px-4 py-2.5">
            {game.isVictory
              ? <TrophyIcon className="h-3.5 w-3.5 text-[var(--hl-vital)]" />
              : <SkullIcon className="h-3.5 w-3.5 text-[var(--hl-alarm)]" />}
            <span className="text-[15px] font-semibold text-[var(--hl-ink)]">{e.statsGameDetail}</span>
            <button
              type="button"
              onClick={onClose}
              className="ml-auto border border-[var(--hl-line-strong)] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--hl-ink-2)] transition-colors duration-150 hover:border-[var(--hl-line-hot)] hover:text-[var(--hl-ink)]"
            >
              {e.statsClose}
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
              {[
                { label: e.statsResult, value: game.isVictory ? e.statsVictory : e.statsDefeat },
                { label: fl.gameMode, value: getStatsGameModeLabel(game.gameMode) },
                { label: e.statsMap, value: formatGameRecordMap(game.mapId) },
                { label: e.statsDifficulty, value: formatGameRecordDifficulty(game.difficulty, diffLabels) },
                { label: e.statsDate, value: formatDate(game.date) },
              ].map((item) => (
                <Deck key={item.label} tone="sunken" className="px-2.5 py-2">
                  <span className="hl-label block truncate">{item.label}</span>
                  <span className="mt-1 block truncate font-mono text-[11px] text-[var(--hl-ink)]">
                    {item.value}
                  </span>
                </Deck>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3">
              {[
                { icon: <StarIcon className="h-3 w-3" />, label: e.statsScore, value: game.score.toLocaleString() },
                { icon: <HeartIcon className="h-3 w-3" />, label: e.statsWave, value: String(game.finalWave) },
                { icon: <ClockIcon className="h-3 w-3" />, label: e.statsDuration, value: formatDuration(game.duration) },
                { icon: <SwordsIcon className="h-3 w-3" />, label: e.statsTotalDamage, value: Math.floor(game.totalDamageDealt).toLocaleString() },
                { icon: <SkullIcon className="h-3 w-3" />, label: e.statsTotalKills, value: game.totalEnemiesKilled.toLocaleString() },
                { icon: <ChartIcon className="h-3 w-3" />, label: e.statsAverageDPS, value: Math.floor(game.averageDPS).toLocaleString() },
              ].map((item) => (
                <Deck key={item.label} className="flex items-center justify-between px-2.5 py-2">
                  <span className="flex items-center gap-1.5 text-[var(--hl-ink-3)]">
                    {item.icon}
                    <span className="hl-label">{item.label}</span>
                  </span>
                  <Num value={item.value} size="sm" />
                </Deck>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <Deck tone="sunken" className="p-3">
                <SegHead label={e.statsTowerStats} right={<TowerIcon className="h-3 w-3 text-[var(--hl-ink-4)]" />} />
                <div className="mt-2 flex flex-col">
                  {[
                    { label: e.statsTowerPlaced, value: game.towersPlaced },
                    { label: e.statsTowerUpgraded, value: game.towersUpgraded },
                    { label: fl.towersSold, value: game.towersSold },
                    { label: e.statsPeakTowers, value: game.peakTowerCount },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between border-b border-[var(--hl-line)] py-1.5 last:border-b-0">
                      <span className="hl-label">{row.label}</span>
                      <Num value={String(row.value)} size="sm" />
                    </div>
                  ))}
                </div>
              </Deck>

              <Deck tone="sunken" className="p-3">
                <SegHead label={e.statsEconomyStats} right={<CoinIcon className="h-3 w-3 text-[var(--hl-ink-4)]" />} />
                <div className="mt-2 flex flex-col">
                  {[
                    { label: e.statsTotalEarned, value: Math.floor(game.totalMoneyEarned).toLocaleString(), tone: 'signal' as const },
                    { label: e.statsTotalSpent, value: Math.floor(game.totalMoneySpent).toLocaleString(), tone: 'muted' as const },
                    { label: e.statsPeakMoney, value: Math.floor(game.peakMoney).toLocaleString(), tone: 'signal' as const },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between border-b border-[var(--hl-line)] py-1.5 last:border-b-0">
                      <span className="hl-label">{row.label}</span>
                      <Num value={row.value} size="sm" tone={row.tone} />
                    </div>
                  ))}
                </div>
              </Deck>
            </div>

            {game.towerStats.length > 0 && (
              <Deck tone="sunken" className="mt-3 p-3">
                <SegHead label={e.statsTowerEfficiency} right={<TowerIcon className="h-3 w-3 text-[var(--hl-ink-4)]" />} />
                <div className="mt-2 flex flex-col">
                  {game.towerStats
                    .slice()
                    .sort((a, b) => b.totalDamage - a.totalDamage)
                    .slice(0, 5)
                    .map((tower, index) => (
                      <div key={index} className="flex items-center justify-between border-b border-[var(--hl-line)] py-1.5 last:border-b-0">
                        <span className="font-mono text-[10.5px] text-[var(--hl-ink-2)]">{tower.type}</span>
                        <span className="flex items-center gap-4">
                          <span className="flex items-baseline gap-1">
                            <span className="hl-label">{e.statsDamageLabel}</span>
                            <Num value={Math.floor(tower.totalDamage).toLocaleString()} size="sm" />
                          </span>
                          <span className="flex items-baseline gap-1">
                            <span className="hl-label">{e.statsKillsLabel}</span>
                            <Num value={String(tower.kills)} size="sm" tone="muted" />
                          </span>
                          <span className="flex items-baseline gap-1">
                            <span className="hl-label">{e.statsEffStatLabel}</span>
                            <Num value={tower.damagePerCost.toFixed(1)} size="sm" tone="muted" />
                          </span>
                        </span>
                      </div>
                    ))}
                </div>
              </Deck>
            )}

            <Deck tone="sunken" className="mt-3 p-3">
              <SegHead label={e.statsOtherStats} right={<ChartIcon className="h-3 w-3 text-[var(--hl-ink-4)]" />} />
              <div className="mt-2 grid grid-cols-3 gap-2">
                {[
                  { label: e.statsPerfectWaves, value: String(game.perfectWaves) },
                  { label: e.statsDamageTaken, value: String(game.damageTaken) },
                  { label: e.statsFinalHealth, value: String(game.finalHealth) },
                ].map((row) => (
                  <div key={row.label} className="border border-[var(--hl-line)] px-2 py-1.5">
                    <span className="hl-label block truncate">{row.label}</span>
                    <span className="mt-1 block"><Num value={row.value} size="sm" /></span>
                  </div>
                ))}
              </div>
            </Deck>
          </div>
        </Deck>
      </div>
    </div>
  );
}
