import { useStatsStore } from '@/store/statsStore';
import type { GameRecord } from '@/store/statsStore';
import { useTranslation } from '@/i18n';
import { useStatsFormatters } from './useStatsFormatters';
import { GameHistoryRow, TopGamesList } from './statsShared';
import { Deck, SegHead, StatCell, Num } from '@/components/hl';
import {
  TrophyIcon, MedalIcon, ClockIcon, FlameIcon, SkullIcon, SwordsIcon,
  ChartIcon, HeartIcon, StarIcon, TowerIcon,
} from '@/components/ui/Icons';

interface Props {
  onSelectGame?: (game: GameRecord) => void;
}

export function StatsOverviewPanel({ onSelectGame }: Props) {
  const { t } = useTranslation();
  const st = t.statistics;
  const { formatDuration, formatDate, e } = useStatsFormatters();
  const gameHistory = useStatsStore((s) => s.gameHistory);
  const personalBests = useStatsStore((s) => s.personalBests);
  const globalStats = useStatsStore((s) => s.globalStats);
  const getBestGames = useStatsStore((s) => s.getBestGames);

  return (
    <div className="flex flex-col gap-5">
      {/* Hero：三個大數值 */}
      <Deck notch className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-3">
        <StatCell
          label={e.statsWins}
          value={globalStats.totalGamesWon.toLocaleString()}
          unit={`/ ${globalStats.totalGamesPlayed.toLocaleString()}`}
          tone="vital"
        />
        <StatCell
          label={e.statsWinRate}
          value={`${globalStats.winRate.toFixed(1)}%`}
          unit={globalStats.winRate >= 60
            ? st.overview.winRateHigh
            : globalStats.winRate >= 30
              ? st.overview.winRateMid
              : st.overview.winRateLow}
          tone="signal"
        />
        <StatCell
          label={e.statsTotalPlaytime}
          value={formatDuration(globalStats.totalPlaytime * 1000)}
          unit={`${e.statsAverageWave} ${globalStats.averageWave.toFixed(1)}`}
        />
      </Deck>

      {/* 戰鬥統計 */}
      <div className="flex flex-col gap-2">
        <SegHead label={st.overview.combatStats} right={<FlameIcon className="h-3.5 w-3.5 text-[var(--arc-ink-4)]" />} />
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5">
          {[
            { icon: <SkullIcon className="h-3.5 w-3.5" />, label: e.statsTotalKills, value: globalStats.totalEnemiesKilled.toLocaleString() },
            { icon: <SwordsIcon className="h-3.5 w-3.5" />, label: e.statsTotalDamage, value: Math.floor(globalStats.totalDamageDealt).toLocaleString() },
            { icon: <ChartIcon className="h-3.5 w-3.5" />, label: e.statsAverageScore, value: Math.floor(globalStats.averageScore).toLocaleString() },
            { icon: <HeartIcon className="h-3.5 w-3.5" />, label: e.statsAverageWave, value: globalStats.averageWave.toFixed(1) },
            { icon: <TowerIcon className="h-3.5 w-3.5" />, label: st.fieldLabels.totalTowersSold, value: (globalStats.totalTowersSold ?? 0).toLocaleString() },
          ].map((item) => (
            <Deck key={item.label} className="flex flex-col gap-1.5 px-3 py-2.5">
              <span className="flex items-center gap-1.5 text-[var(--arc-ink-3)]">
                {item.icon}
                <span className="arc-label truncate">{item.label}</span>
              </span>
              <Num value={item.value} size="md" />
            </Deck>
          ))}
        </div>
      </div>

      {/* 個人最佳 */}
      <div className="flex flex-col gap-2">
        <SegHead label={e.statsPersonalBests} right={<MedalIcon className="h-3.5 w-3.5 text-[var(--arc-ink-4)]" />} />
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: <StarIcon className="h-3 w-3" />, label: e.statsHighestScore, value: personalBests.highestScore.toLocaleString() },
            { icon: <HeartIcon className="h-3 w-3" />, label: e.statsHighestWave, value: personalBests.highestWave.toString() },
            { icon: <ClockIcon className="h-3 w-3" />, label: e.statsFastestVictory, value: personalBests.fastestVictory < Infinity ? formatDuration(personalBests.fastestVictory) : '---' },
            { icon: <SwordsIcon className="h-3 w-3" />, label: e.statsHighestDPS, value: Math.floor(personalBests.highestDPS).toLocaleString() },
            { icon: <SkullIcon className="h-3 w-3" />, label: e.statsMostKills, value: personalBests.mostKills.toLocaleString() },
          ].map((item) => (
            <Deck key={item.label} tone="sunken" className="flex items-center justify-between px-3 py-2">
              <span className="flex min-w-0 items-center gap-1.5 text-[var(--arc-ink-3)]">
                {item.icon}
                <span className="arc-label truncate">{item.label}</span>
              </span>
              <Num value={item.value} size="sm" />
            </Deck>
          ))}
        </div>
      </div>

      {/* 最近戰局 */}
      <div className="flex flex-col gap-2">
        <SegHead label={e.statsRecentGames} right={<ClockIcon className="h-3.5 w-3.5 text-[var(--arc-ink-4)]" />} />
        <Deck className="overflow-hidden">
          {gameHistory.length === 0 ? (
            <div className="arc-micro px-3 py-6 text-center">{e.statsNoRecord}</div>
          ) : (
            <div className="flex flex-col">
              {gameHistory.slice(0, 5).map((game) => (
                <GameHistoryRow
                  key={game.id}
                  game={game}
                  onClick={() => onSelectGame?.(game)}
                  formatDuration={formatDuration}
                  formatDate={formatDate}
                />
              ))}
            </div>
          )}
        </Deck>
      </div>

      {/* 排行榜：保留在總覽的快速一覽（前三名） */}
      <div className="flex flex-col gap-2">
        <SegHead label={e.statsHighScoreRank} right={<TrophyIcon className="h-3.5 w-3.5 text-[var(--arc-ink-4)]" />} />
        <Deck tone="sunken" className="overflow-hidden">
          <TopGamesList
            games={getBestGames('score').slice(0, 3)}
            formatDuration={formatDuration}
            formatDate={formatDate}
          />
        </Deck>
      </div>
    </div>
  );
}
