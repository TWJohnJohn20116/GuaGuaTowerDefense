/**
 * 戰績中心 · 右欄戰局詳情（336–376px，密集欄位）
 */
import type { GameRecord } from '@/store/statsStore';
import { useTranslation } from '@/i18n';
import {
  ChartIcon, TrophyIcon, SkullIcon, TowerIcon, CoinIcon,
} from '@/components/ui/Icons';
import { Deck, SegHead, Field, Num, Empty, Dot } from '@/components/hl';
import { getStatsGameModeLabel } from '@/store/statsGameMode';
import {
  formatGameRecordDifficulty,
  formatGameRecordMap,
  gameDifficultyLabelsFromDetail,
} from '@/data/gameRecordLabels';

interface StatsGameDetailPanelProps {
  game: GameRecord | null;
  formatDuration: (ms: number) => string;
  formatDate: (timestamp: number) => string;
}

export function StatsGameDetailPanel({
  game,
  formatDuration,
  formatDate,
}: StatsGameDetailPanelProps) {
  const { t } = useTranslation();
  const e = t.encyclopedia;
  const fl = t.statistics.fieldLabels;
  const diffLabels = gameDifficultyLabelsFromDetail(t.mutatorChallenge.detail);

  if (!game) {
    return (
      <Empty
        title={t.statistics.detail.selectHintLine1}
        hint={t.statistics.detail.selectHintLine2}
      />
    );
  }

  const resultTone = game.isVictory
    ? 'text-[var(--hl-vital)] border-[rgba(56,224,143,0.4)]'
    : 'text-[var(--hl-alarm)] border-[rgba(255,75,62,0.4)]';

  return (
    <div className="flex h-full flex-col gap-3.5">
      {/* 結果列 */}
      <div className={`flex items-center gap-2 border px-2.5 py-2 ${resultTone}`}>
        {game.isVictory
          ? <TrophyIcon className="h-4 w-4" />
          : <SkullIcon className="h-4 w-4" />}
        <span className="hl-label text-current">
          {game.isVictory ? e.statsVictory : e.statsDefeat}
        </span>
        <span className="ml-auto font-mono text-[10px] tabular-nums text-[var(--hl-ink-3)]">
          {formatDate(game.date)}
        </span>
      </div>

      <div className="flex min-w-0 flex-col">
        <h2 className="truncate text-[17px] font-semibold leading-tight tracking-[-0.01em] text-[var(--hl-ink)]">
          {formatGameRecordMap(game.mapId)}
        </h2>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className="border border-[var(--hl-line)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--hl-ink-3)]">
            {formatGameRecordDifficulty(game.difficulty, diffLabels)}
          </span>
          <span className="border border-[var(--hl-line)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--hl-ink-3)]">
            {getStatsGameModeLabel(game.gameMode)}
          </span>
        </div>
      </div>

      {/* 主數據 */}
      <div className="flex flex-col">
        <SegHead label={e.statsGameDetail} right={<ChartIcon className="h-3.5 w-3.5 text-[var(--hl-ink-4)]" />} />
        <div className="mt-1 flex flex-col">
          <Field label={e.statsScore}><Num value={game.score.toLocaleString()} size="md" /></Field>
          <Field label={e.statsWave}><Num value={String(game.finalWave)} size="md" /></Field>
          <Field label={e.statsDuration}><Num value={formatDuration(game.duration)} size="md" tone="muted" /></Field>
        </div>
      </div>

      {/* 塔數據 */}
      <div className="flex flex-col">
        <SegHead label={e.statsTowerStats} right={<TowerIcon className="h-3.5 w-3.5 text-[var(--hl-ink-4)]" />} />
        <div className="mt-1 grid grid-cols-2 gap-1.5">
          {[
            { label: e.statsTowerPlaced, value: String(game.towersPlaced) },
            { label: e.statsTowerUpgraded, value: String(game.towersUpgraded) },
            { label: fl.towersSold, value: String(game.towersSold) },
            { label: e.statsPeakTowers, value: String(game.peakTowerCount) },
          ].map((item) => (
            <Deck key={item.label} tone="sunken" className="px-2 py-1.5">
              <span className="hl-label block truncate">{item.label}</span>
              <span className="mt-1 block"><Num value={item.value} size="sm" /></span>
            </Deck>
          ))}
        </div>
      </div>

      {/* 經濟／戰鬥 */}
      <div className="flex flex-col">
        <SegHead label={e.statsEconomyStats} right={<CoinIcon className="h-3.5 w-3.5 text-[var(--hl-ink-4)]" />} />
        <div className="mt-1 flex flex-col">
          <Field label={e.statsTotalEarned}>
            <Num value={Math.floor(game.totalMoneyEarned).toLocaleString()} size="sm" tone="signal" />
          </Field>
          <Field label={e.statsTotalSpent}>
            <Num value={Math.floor(game.totalMoneySpent).toLocaleString()} size="sm" tone="muted" />
          </Field>
          <Field label={e.statsTotalDamage}>
            <Num value={Math.floor(game.totalDamageDealt).toLocaleString()} size="sm" />
          </Field>
          <Field label={e.statsTotalKills}>
            <Num value={game.totalEnemiesKilled.toLocaleString()} size="sm" tone="muted" />
          </Field>
        </div>
      </div>

      {/* 塔效率 */}
      {game.towerStats.length > 0 && (
        <div className="flex flex-col pb-2">
          <SegHead label={e.statsTowerEfficiency} right={<TowerIcon className="h-3.5 w-3.5 text-[var(--hl-ink-4)]" />} />
          <div className="mt-1 flex flex-col">
            {game.towerStats
              .slice()
              .sort((a, b) => b.totalDamage - a.totalDamage)
              .slice(0, 3)
              .map((tower, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b border-[var(--hl-line)] py-1.5 last:border-b-0"
                >
                  <span className="flex min-w-0 items-center gap-1.5">
                    <Dot tone="ink" />
                    <span className="truncate font-mono text-[10.5px] text-[var(--hl-ink-2)]">{tower.type}</span>
                  </span>
                  <Num value={Math.floor(tower.totalDamage).toLocaleString()} size="sm" tone="muted" />
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default StatsGameDetailPanel;
