/**
 * 回放場景 — HARDLINE Console
 * TopBar + 左軌 212px 清單 + 主區播放器（待機） + 右側詳情 336–376px。
 * 播放／插值／匯出／匯入行為完全不動，只換版面語言。
 */
import { useState, useMemo, useEffect } from 'react';
import { useReplayStore } from '@/store/replayStore';
import type { Replay as ReplayData } from '@/store/replayStore';
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/i18n';
import { SceneShell } from '@/components/ui/SceneShell';
import { SceneNoticeToast } from '@/components/ui/SceneNoticeToast';
import {
  resolveReplayExportFeedback,
  resolveReplayImportError,
  resolveReplayImportFeedback,
  type ReplayFeedback,
} from '@/data/replayFeedback';
import { Btn, Empty, Rail, RailItem, TopBar } from '@/components/hl';
import {
  ChartIcon, TrashIcon, UploadIcon, DownloadIcon,
} from '@/components/ui/Icons';
import { ReplayDetail } from './replay/ReplayDetail';
import { resolveReplayRestartArgs } from '@/data/replayRestart';
import { ReplayHeaderStats } from './replay/ReplayHeaderStats';
import { ReplayToolbar, type ReplayTab, type ReplayFilterMode, type ReplaySortMode } from './replay/ReplayToolbar';
import { ReplayBrowsePanel } from './replay/ReplayBrowsePanel';
import { ReplayStage } from './replay/ReplayStage';
import { ReplayBatchExportDialog } from './replay/ReplayBatchExportDialog';
import { ReplayConfirmDialog } from './replay/ReplayConfirmDialog';
import { ReplayRenameDialog } from './replay/ReplayRenameDialog';
import {
  formatReplayTime, formatReplayDate,
  exportReplayAsJson, triggerImportReplay,
} from './replay/replayUtils';
import { replayMatchesSearch } from '@/data/replayBrowseSearch';
import { gameDifficultyLabelsFromDetail } from '@/data/gameRecordLabels';

type ViewMode = 'browse' | 'playback';

type PendingReplayConfirm =
  | { kind: 'delete'; id: string }
  | { kind: 'clearAll' }
  | { kind: 'replayThis'; replay: ReplayData };

export default function Replay() {
  const { t, language } = useTranslation();
  const r = t.replay;
  const replays = useReplayStore((s) => s.replays);
  const deleteReplay = useReplayStore((s) => s.deleteReplay);
  const clearAll = useReplayStore((s) => s.clearAll);
  const importReplay = useReplayStore((s) => s.importReplay);
  const renameReplay = useReplayStore((s) => s.renameReplay);
  const toggleFavorite = useReplayStore((s) => s.toggleFavorite);
  const startGame = useGameStore((s) => s.startGame);

  const [viewMode, setViewMode] = useState<ViewMode>('browse');
  const [tab, setTab] = useState<ReplayTab>('library');
  const [filter, setFilter] = useState<ReplayFilterMode>('all');
  const [sort, setSort] = useState<ReplaySortMode>('newest');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [batchExportOpen, setBatchExportOpen] = useState(false);
  const [notice, setNotice] = useState<{ message: string; tone: ReplayFeedback['tone'] } | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState<PendingReplayConfirm | null>(null);
  const [pendingRename, setPendingRename] = useState<{ id: string; name: string } | null>(null);

  const showFeedback = (fb: ReplayFeedback) => {
    setNotice({ message: r[fb.messageKey], tone: fb.tone });
    window.setTimeout(() => setNotice(null), 2200);
  };

  const usingFilters = tab === 'favorites' || filter !== 'all' || search.trim().length > 0;
  const favoriteReplays = useMemo(() => replays.filter((r) => r.favorite), [replays]);
  const difficultyLabels = gameDifficultyLabelsFromDetail(t.mutatorChallenge.detail);

  const formatTime = (sec: number) => formatReplayTime(sec);
  const formatDate = (ts: number) => formatReplayDate(ts, language);

  const stats = useMemo(() => {
    const victories = replays.filter((rep) => rep.isVictory).length;
    const favorites = replays.filter((rep) => rep.favorite).length;
    return { total: replays.length, victories, favorites };
  }, [replays]);

  const filteredReplays = useMemo<ReplayData[]>(() => {
    let list = replays.filter((rep) => {
      if (tab === 'favorites' && !rep.favorite) return false;
      if (filter === 'victory' && !rep.isVictory) return false;
      if (filter === 'defeat' && rep.isVictory) return false;
      if (!replayMatchesSearch(rep, search, difficultyLabels)) return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'newest': return b.timestamp - a.timestamp;
        case 'oldest': return a.timestamp - b.timestamp;
        case 'score': return b.finalScore - a.finalScore;
        case 'wave': return b.finalWave - a.finalWave;
        case 'duration': return b.duration - a.duration;
        default: return 0;
      }
    });
    return list;
  }, [replays, tab, filter, search, sort, difficultyLabels]);

  const selected = useMemo(
    () => filteredReplays.find((rep) => rep.id === selectedId) || null,
    [filteredReplays, selectedId],
  );

  useEffect(() => {
    if (filteredReplays.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !filteredReplays.some((rep) => rep.id === selectedId)) {
      setSelectedId(filteredReplays[0].id);
    }
  }, [filteredReplays, selectedId]);

  const handleTabChange = (next: ReplayTab) => {
    setTab(next);
    if (next === 'favorites') setFilter('all');
  };

  const handleImport = async () => {
    try {
      const data = await triggerImportReplay();
      const newId = importReplay(data);
      showFeedback(resolveReplayImportFeedback(newId));
    } catch (e) {
      console.error(e);
      showFeedback(resolveReplayImportError());
    }
  };

  const handleRename = (id: string, currentName: string) => {
    setPendingConfirm(null);
    setPendingRename({ id, name: currentName });
  };

  const startFromReplay = (replay: ReplayData) => {
    const args = resolveReplayRestartArgs(replay);
    startGame(
      args.pathName,
      args.difficulty,
      args.endless,
      args.maxWaves,
      args.customModifiers,
      args.customWaveSetId,
      args.mutator,
    );
  };

  const handleReplayThis = (replay: ReplayData) => {
    setPendingRename(null);
    setPendingConfirm({ kind: 'replayThis', replay });
  };

  const handleConfirmPending = () => {
    if (!pendingConfirm) return;
    if (pendingConfirm.kind === 'delete') deleteReplay(pendingConfirm.id);
    else if (pendingConfirm.kind === 'clearAll') clearAll();
    else startFromReplay(pendingConfirm.replay);
    setPendingConfirm(null);
  };

  const actionDialogs = (
    <>
      <ReplayConfirmDialog
        open={pendingConfirm !== null}
        kind={pendingConfirm?.kind ?? 'delete'}
        onClose={() => setPendingConfirm(null)}
        onConfirm={handleConfirmPending}
      />
      <ReplayRenameDialog
        open={pendingRename !== null}
        originalName={pendingRename?.name ?? ''}
        onClose={() => setPendingRename(null)}
        onConfirm={(name) => {
          if (pendingRename) renameReplay(pendingRename.id, name);
          setPendingRename(null);
        }}
      />
    </>
  );

  if (viewMode === 'playback' && selected) {
    return (
      <>
        <ReplayDetail
          key={selected.id}
          replay={selected}
          replays={filteredReplays}
          onSelect={setSelectedId}
          onBack={() => setViewMode('browse')}
          onRename={() => handleRename(selected.id, selected.name)}
          onReplayThis={() => handleReplayThis(selected)}
          formatTime={formatTime}
          formatDate={formatDate}
        />
        {actionDialogs}
      </>
    );
  }

  return (
    <SceneShell scrollable={false}>
      <SceneNoticeToast message={notice?.message ?? null} tone={notice?.tone} />
      <div className="flex h-full w-full flex-col">
        <TopBar
          title={r.title}
          meta={r.subtitle}
          glyph={<ChartIcon className="h-4 w-4" />}
          back={{ to: 'mainMenu' }}
          right={(
            <div className="flex flex-wrap items-center gap-1.5">
              <ReplayHeaderStats
                total={stats.total}
                victories={stats.victories}
                favorites={stats.favorites}
              />
              <Btn
                variant="line"
                size="sm"
                onClick={handleImport}
                icon={<UploadIcon className="h-3 w-3" />}
              >
                {r.importReplay}
              </Btn>
              {replays.length > 0 && (
                <>
                  <Btn
                    variant="line"
                    size="sm"
                    onClick={() => setBatchExportOpen(true)}
                    icon={<DownloadIcon className="h-3 w-3" />}
                  >
                    {r.batchExport}
                  </Btn>
                  <Btn
                    variant="danger"
                    size="sm"
                    onClick={() => setPendingConfirm({ kind: 'clearAll' })}
                    icon={<TrashIcon className="h-3 w-3" />}
                  >
                    {r.clearAll}
                  </Btn>
                </>
              )}
            </div>
          )}
        />

        <div className="flex min-h-0 flex-1">
          {/* 左軌：清單 */}
          <Rail
            label={tab === 'favorites' ? r.toolbar.tabFavorites : r.toolbar.tabLibrary}
            foot={(
              <div className="flex items-center justify-between">
                <span className="hl-label">{r.progress}</span>
                <span className="hl-num text-[10.5px] leading-none text-[var(--hl-ink-2)]">
                  {filteredReplays.length}/{stats.total}
                </span>
              </div>
            )}
          >
            {filteredReplays.length === 0 ? (
              <div className="px-3 py-3 hl-micro">{r.noReplays}</div>
            ) : (
              filteredReplays.map((rep, i) => (
                <RailItem
                  key={rep.id}
                  index={i + 1}
                  active={rep.id === selectedId}
                  onClick={() => setSelectedId(rep.id)}
                  label={rep.name || (rep.isVictory ? r.victory : r.defeat)}
                  right={(
                    <span className="shrink-0 font-mono text-[9.5px] tabular-nums text-[var(--hl-ink-4)]">
                      W{rep.finalWave}
                    </span>
                  )}
                />
              ))
            )}
          </Rail>

          {/* 主區 */}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <ReplayToolbar
              tab={tab}
              filter={filter}
              sort={sort}
              search={search}
              total={stats.total}
              visible={filteredReplays.length}
              favoriteCount={stats.favorites}
              onTabChange={handleTabChange}
              onFilterChange={setFilter}
              onSortChange={setSort}
              onSearchChange={setSearch}
            />

            <div className="flex min-h-0 flex-1">
              <main className="min-h-0 min-w-0 flex-1 overflow-y-auto p-4">
                {selected ? (
                  <ReplayStage
                    replay={selected}
                    formatTime={formatTime}
                    formatDate={formatDate}
                    onPlay={() => setViewMode('playback')}
                  />
                ) : (
                  <Empty title={r.browse.selectHintLine1} hint={r.browse.selectHintLine2} />
                )}
              </main>

              <aside className="flex w-[336px] shrink-0 flex-col overflow-y-auto border-l border-[var(--hl-line)] bg-[var(--hl-deck)] p-3 xl:w-[376px]">
                <ReplayBrowsePanel
                  replay={selected}
                  formatTime={formatTime}
                  formatDate={formatDate}
                  labels={{
                    empty: <>{r.browse.selectHintLine1}<br />{r.browse.selectHintLine2}</>,
                    victory: r.victory,
                    defeat: r.defeat,
                    view: r.view,
                    replayThis: r.replayThis,
                    exportReplay: r.exportReplay,
                    delete: r.delete,
                    rename: r.rename,
                    favorite: r.favorite,
                    unfavorite: r.unfavorite,
                    wave: r.wave,
                    score: r.score,
                    duration: r.duration,
                    map: r.browse.map,
                    replayInfo: r.browse.replayInfo,
                  }}
                  onPlay={() => selected && setViewMode('playback')}
                  onReplayThis={() => selected && handleReplayThis(selected)}
                  onExport={() => {
                    if (!selected) return;
                    showFeedback(resolveReplayExportFeedback(exportReplayAsJson(selected)));
                  }}
                  onDelete={() => {
                    if (!selected) return;
                    setPendingConfirm({ kind: 'delete', id: selected.id });
                  }}
                  onRename={() => selected && handleRename(selected.id, selected.name)}
                  onToggleFavorite={() => selected && toggleFavorite(selected.id)}
                />
              </aside>
            </div>
          </div>
        </div>
      </div>

      <ReplayBatchExportDialog
        open={batchExportOpen}
        onClose={() => setBatchExportOpen(false)}
        allReplays={replays}
        filteredReplays={filteredReplays}
        favoriteReplays={favoriteReplays}
        usingFilters={usingFilters}
      />
      {actionDialogs}
    </SceneShell>
  );
}
