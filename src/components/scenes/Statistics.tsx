/**
 * 戰績中心 · HARDLINE Console
 *
 * TopBar 52px → 左軌 212px（總覽／歷史／紀錄）＋ 主區（密集表格列）＋ 右側詳情 336–376px。
 * 統計計算、匯出與清空流程全部沿用原 store 與工具函式。
 */
import { useState, useMemo, useEffect } from 'react';
import type React from 'react';
import { useStatsStore } from '@/store/statsStore';
import { SceneShell } from '@/components/ui/SceneShell';
import { Btn, Deck, Num, Rail, RailItem, TopBar } from '@/components/hl';
import { ChartIcon, ClockIcon, StarIcon, TrashIcon, DownloadIcon } from '@/components/ui/Icons';
import { useTranslation } from '@/i18n';
import { StatsContent, type StatsTab } from './statistics/StatsContent';
import { StatsHeaderStats } from './statistics/StatsHeaderStats';
import { StatsToolbar } from './statistics/StatsToolbar';
import { StatsHistoryGrid } from './statistics/StatsHistoryGrid';
import { StatsGameDetailPanel } from './statistics/StatsGameDetailPanel';
import { useStatsFormatters } from './statistics/useStatsFormatters';
import {
  filterGameHistory,
  type StatsDateFilter,
  type StatsModeFilter,
  type StatsOutcomeFilter,
} from './statistics/statsHistoryFilters';
import { StatsExportDialog } from './statistics/StatsExportDialog';
import { StatsClearConfirmDialog } from './statistics/StatsClearConfirmDialog';
import { gameDifficultyLabelsFromGameCopy } from '@/data/gameRecordLabels';

export default function Statistics() {
  const { t } = useTranslation();
  const e = t.encyclopedia;
  const st = t.statistics;
  const { formatDuration, formatDate } = useStatsFormatters();
  const gameHistory = useStatsStore((s) => s.gameHistory);
  const globalStats = useStatsStore((s) => s.globalStats);
  const personalBests = useStatsStore((s) => s.personalBests);
  const clearHistory = useStatsStore((s) => s.clearHistory);

  const [activeTab, setActiveTab] = useState<StatsTab>('overview');
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [outcomeFilter, setOutcomeFilter] = useState<StatsOutcomeFilter>('all');
  const [dateFilter, setDateFilter] = useState<StatsDateFilter>('all');
  const [modeFilter, setModeFilter] = useState<StatsModeFilter>('all');
  const [historySearch, setHistorySearch] = useState('');
  const [exportOpen, setExportOpen] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);

  const usingHistoryFilters =
    outcomeFilter !== 'all' ||
    dateFilter !== 'all' ||
    modeFilter !== 'all' ||
    historySearch.trim().length > 0;

  const difficultyLabels = gameDifficultyLabelsFromGameCopy(t.game);

  const filteredHistory = useMemo(
    () => filterGameHistory(
      gameHistory,
      outcomeFilter,
      dateFilter,
      modeFilter,
      historySearch,
      difficultyLabels,
    ),
    [gameHistory, outcomeFilter, dateFilter, modeFilter, historySearch, difficultyLabels],
  );

  const selectedGame = useMemo(
    () => gameHistory.find((g) => g.id === selectedGameId) || null,
    [gameHistory, selectedGameId],
  );

  const playtimeLabel = formatDuration(globalStats.totalPlaytime * 1000);

  useEffect(() => {
    if (activeTab !== 'history') return;
    if (filteredHistory.length === 0) {
      setSelectedGameId(null);
      return;
    }
    if (!selectedGameId || !filteredHistory.some((g) => g.id === selectedGameId)) {
      setSelectedGameId(filteredHistory[0].id);
    }
  }, [activeTab, filteredHistory, selectedGameId]);

  const handleTabChange = (tab: StatsTab) => {
    setActiveTab(tab);
  };

  const handleSelectGame = (gameId: string) => {
    setSelectedGameId(gameId);
    setActiveTab('history');
  };

  const tabs: { id: StatsTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'overview', label: e.statsOverview, icon: <ChartIcon className="h-3 w-3" /> },
    { id: 'history', label: e.statsHistory, icon: <ClockIcon className="h-3 w-3" />, count: gameHistory.length },
    { id: 'records', label: e.statsRecords, icon: <StarIcon className="h-3 w-3" /> },
  ];

  return (
    <SceneShell scrollable={false}>
      <div className="flex h-full w-full flex-col">
        <TopBar
          title={e.statsOverview}
          meta={e.statsOverviewDesc}
          back={{ to: 'mainMenu' }}
          glyph={<ChartIcon className="h-4 w-4" />}
          right={
            <div className="flex items-center gap-2">
              <StatsHeaderStats
                gamesPlayed={globalStats.totalGamesPlayed}
                gamesWon={globalStats.totalGamesWon}
                winRate={globalStats.winRate}
                playtimeLabel={playtimeLabel}
              />
              {gameHistory.length > 0 && (
                <>
                  <span className="h-6 w-px bg-[var(--arc-line)]" />
                  <Btn
                    variant="line"
                    size="sm"
                    icon={<DownloadIcon className="h-3 w-3" />}
                    onClick={() => setExportOpen(true)}
                  >
                    {st.exportData}
                  </Btn>
                  {activeTab === 'history' && (
                    <Btn
                      variant="danger"
                      size="sm"
                      icon={<TrashIcon className="h-3 w-3" />}
                      onClick={() => setClearOpen(true)}
                    >
                      {e.statsClearRecord}
                    </Btn>
                  )}
                </>
              )}
            </div>
          }
        />

        <div className="flex min-h-0 flex-1">
          <Rail label={t.statistics.headerStats.totalGames}>
            {tabs.map((tab, i) => (
              <RailItem
                key={tab.id}
                index={i + 1}
                label={
                  <span className="flex items-center gap-1.5">
                    <span className="text-[var(--arc-ink-4)]">{tab.icon}</span>
                    {tab.label}
                  </span>
                }
                active={activeTab === tab.id}
                onClick={() => handleTabChange(tab.id)}
                right={tab.count !== undefined ? (
                  <span className="font-mono text-[10px] tabular-nums text-[var(--arc-ink-3)]">
                    {tab.count}
                  </span>
                ) : undefined}
              />
            ))}

            <div className="mt-auto border-t border-[var(--cn-line-soft)] px-3 py-2.5">
              <div className="flex items-center justify-between">
                <span className="arc-label">{st.headerStats.winRate}</span>
                <Num value={`${globalStats.winRate.toFixed(1)}%`} size="sm" tone="muted" />
              </div>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="arc-label">{st.headerStats.totalPlaytime}</span>
                <Num value={playtimeLabel} size="sm" tone="muted" />
              </div>
            </div>
          </Rail>

          <main className="flex min-w-0 flex-1 flex-col bg-[var(--arc-void)]">
            <StatsToolbar
              activeTab={activeTab}
              historyCount={gameHistory.length}
              filteredCount={filteredHistory.length}
              outcomeFilter={outcomeFilter}
              dateFilter={dateFilter}
              modeFilter={modeFilter}
              search={historySearch}
              onOutcomeFilterChange={setOutcomeFilter}
              onDateFilterChange={setDateFilter}
              onModeFilterChange={setModeFilter}
              onSearchChange={setHistorySearch}
            />

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
              {activeTab === 'history' ? (
                <StatsHistoryGrid
                  games={filteredHistory}
                  selectedId={selectedGameId}
                  onSelect={setSelectedGameId}
                  formatDuration={formatDuration}
                  formatDate={formatDate}
                  victoryLabel={e.statsVictory}
                  defeatLabel={e.statsDefeat}
                  emptyLabel={
                    gameHistory.length === 0
                      ? e.statsNoRecord
                      : st.toolbar.noFilterResults
                  }
                />
              ) : (
                <StatsContent
                  activeTab={activeTab}
                  onSelectGame={(game) => handleSelectGame(game.id)}
                />
              )}
            </div>
          </main>

          {activeTab === 'history' && (
            <Deck as="aside" className="flex w-[336px] shrink-0 flex-col overflow-y-auto arc-panel--flat p-4 xl:w-[376px]">
              <StatsGameDetailPanel
                game={selectedGame}
                formatDuration={formatDuration}
                formatDate={formatDate}
              />
            </Deck>
          )}
        </div>
      </div>

      <StatsExportDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        allGames={gameHistory}
        filteredGames={filteredHistory}
        globalStats={globalStats}
        personalBests={personalBests}
        usingFilters={usingHistoryFilters}
      />
      <StatsClearConfirmDialog
        open={clearOpen}
        onClose={() => setClearOpen(false)}
        onConfirm={() => {
          clearHistory();
          setClearOpen(false);
        }}
      />
    </SceneShell>
  );
}
