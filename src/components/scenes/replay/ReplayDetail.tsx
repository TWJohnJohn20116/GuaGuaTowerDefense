// 回放詳情頁 — HARDLINE Console：TopBar + 左軌清單 + 主區播放器 + 右側詳情
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useReplayStore, type Replay as ReplayData } from '@/store/replayStore';
import { useTranslation } from '@/i18n';
import { ReplayCanvas } from './ReplayCanvas';
import { ReplayControls } from './ReplayControls';
import { ReplayTimeline } from './ReplayTimeline';
import { ReplayNotesPanel } from './ReplayNotesPanel';
import { ReplayTagsPanel } from './ReplayTagsPanel';
import { TimeChart, EventLog, StatBox, MiniStatBox } from './ReplayCharts';
import { exportReplayAsJson, computeAutoBookmarks, getPathDisplayName } from './replayUtils';
import { buildRenderFrame } from './replayPlayback';
import {
  formatGameRecordDifficulty,
  gameDifficultyLabelsFromGameCopy,
} from '@/data/gameRecordLabels';
import {
  MapIcon, StarIcon, DownloadIcon,
  RefreshIcon, EditIcon, ChartIcon,
} from '@/components/ui/Icons';
import { SceneShell } from '@/components/ui/SceneShell';
import { SceneNoticeToast } from '@/components/ui/SceneNoticeToast';
import { Btn, Deck, Num, Rail, RailItem, SegHead, StatCell, TopBar } from '@/components/hl';
import {
  resolveReplayExportFeedback,
  type ReplayFeedback,
} from '@/data/replayFeedback';

interface ReplayDetailProps {
  replay: ReplayData;
  replays: ReplayData[];
  onSelect: (id: string) => void;
  onBack: () => void;
  onRename: () => void;
  onReplayThis: () => void;
  formatTime: (s: number) => string;
  formatDate: (ts: number) => string;
}

export function ReplayDetail({
  replay,
  replays,
  onSelect,
  onBack,
  onRename,
  onReplayThis,
  formatTime,
  formatDate,
}: ReplayDetailProps) {
  const { t } = useTranslation();
  const r = t.replay;
  const diffLabels = gameDifficultyLabelsFromGameCopy(t.game);
  const toggleFavorite = useReplayStore((s) => s.toggleFavorite);
  const setTags = useReplayStore((s) => s.setTags);
  const addNote = useReplayStore((s) => s.addNote);
  const deleteNote = useReplayStore((s) => s.deleteNote);
  const updateNote = useReplayStore((s) => s.updateNote);

  const [playing, setPlaying] = useState(false);
  const [notice, setNotice] = useState<{ message: string; tone: ReplayFeedback['tone'] } | null>(null);
  // playhead 雙軌：ref 為精確值（畫布每幀讀取，60fps）；state 以 ~10Hz 節流同步（驅動圖表 / 時間軸）
  const playheadRef = useRef(0);
  const [playhead, setPlayheadState] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [loop, setLoop] = useState(false);

  // 外部跳轉（拖時間軸 / 快捷鍵 / 書籤）：同步 ref 與 state
  const setPlayhead = useCallback((value: number | ((prev: number) => number)) => {
    const next = typeof value === 'function' ? value(playheadRef.current) : value;
    playheadRef.current = next;
    setPlayheadState(next);
  }, []);

  // 自動播放：rAF 以真實幀率推進精確 playhead，UI 狀態每 ~100ms 同步一次
  useEffect(() => {
    if (!playing) return;
    let rafId = 0;
    let lastTime = performance.now();
    let lastUiSync = 0;

    const tick = (now: number) => {
      const dt = Math.min(0.25, (now - lastTime) / 1000);
      lastTime = now;
      let next = playheadRef.current + dt * speed;

      if (next > replay.duration) {
        if (loop) {
          next = 0;
        } else {
          playheadRef.current = replay.duration;
          setPlayheadState(replay.duration);
          setPlaying(false);
          return;
        }
      }
      playheadRef.current = next;

      if (now - lastUiSync >= 100) {
        lastUiSync = now;
        setPlayheadState(next);
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      // 暫停時把精確值同步回 UI
      setPlayheadState(playheadRef.current);
    };
  }, [playing, replay.duration, speed, loop]);

  // 鍵盤快捷
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case ' ':
          e.preventDefault();
          setPlaying((p) => !p);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setPlayhead((p) => Math.max(0, p - 5));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setPlayhead((p) => Math.min(replay.duration, p + 5));
          break;
        case 'Home':
          e.preventDefault();
          setPlayhead(0);
          break;
        case 'End':
          e.preventDefault();
          setPlayhead(replay.duration);
          break;
        case 'l':
        case 'L':
          e.preventDefault();
          setLoop((l) => !l);
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFavorite(replay.id);
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [replay.duration, replay.id, toggleFavorite]);

  // 插值後的統計幀（10Hz 更新已足夠平滑；畫布另以 60fps 直讀 ref 插值）
  const currentFrame = useMemo(() => {
    return buildRenderFrame(replay.snapshots, playhead);
  }, [replay.snapshots, playhead]);

  const pastEvents = useMemo(() => {
    return replay.events.filter((e) => e.time <= playhead);
  }, [replay.events, playhead]);

  const autoBookmarks = useMemo(() => {
    return computeAutoBookmarks(
      replay.snapshots,
      replay.events,
      {
        lowHP: r.bookmarkLowHP,
        bigDamage: r.bookmarkBigDamage,
        victory: r.bookmarkVictory,
        defeat: r.bookmarkDefeat,
      },
      replay.snapshots[0]?.health ?? 20
    );
  }, [replay.snapshots, replay.events, r]);

  const handleExport = () => {
    const fb = resolveReplayExportFeedback(exportReplayAsJson(replay));
    setNotice({ message: r[fb.messageKey], tone: fb.tone });
    window.setTimeout(() => setNotice(null), 2200);
  };

  const progressPercent = ((playhead / Math.max(1, replay.duration)) * 100).toFixed(1);
  const title = replay.name || (replay.isVictory ? r.victory : r.defeat);

  return (
    <SceneShell accent="info" scrollable={false}>
      <SceneNoticeToast message={notice?.message ?? null} tone={notice?.tone} />
      <div className="flex h-full w-full flex-col">
        <TopBar
          title={title}
          meta={`${r.title} / ${formatDate(replay.timestamp)}`}
          glyph={<ChartIcon className="h-4 w-4" />}
          back={{ label: r.backToList, onClick: onBack }}
          right={(
            <div className="flex flex-wrap items-center gap-1.5">
              <Btn
                variant="line"
                size="sm"
                onClick={() => toggleFavorite(replay.id)}
                title={replay.favorite ? r.unfavorite : r.favorite}
                icon={<StarIcon className={`h-3 w-3 ${replay.favorite ? 'text-[var(--arc-caution)]' : ''}`} />}
              >
                {replay.favorite ? r.unfavorite : r.favorite}
              </Btn>
              <Btn
                variant="line"
                size="sm"
                onClick={onRename}
                title={r.rename}
                icon={<EditIcon className="h-3 w-3" />}
              >
                {r.rename}
              </Btn>
              <Btn
                variant="line"
                size="sm"
                onClick={handleExport}
                title={r.exportReplay}
                icon={<DownloadIcon className="h-3 w-3" />}
              >
                {r.exportReplay}
              </Btn>
              <Btn
                variant="quiet"
                size="sm"
                onClick={onReplayThis}
                title={r.replayThisHint}
                icon={<RefreshIcon className="h-3 w-3" />}
              >
                {r.replayThis}
              </Btn>
            </div>
          )}
        />

        <div className="flex min-h-0 flex-1">
          {/* 左軌：清單 */}
          <Rail
            label={r.replayList}
            foot={(
              <div className="flex items-center justify-between">
                <span className="arc-label">{r.progress}</span>
                <Num value={progressPercent} unit="%" tone="signal" size="sm" />
              </div>
            )}
          >
            {replays.map((rep, i) => (
              <RailItem
                key={rep.id}
                index={i + 1}
                active={rep.id === replay.id}
                onClick={() => onSelect(rep.id)}
                label={rep.name || (rep.isVictory ? r.victory : r.defeat)}
                right={(
                  <span
                    className={[
                      'shrink-0 font-mono text-[9.5px] tabular-nums',
                      rep.id === replay.id ? 'text-[var(--arc-gold)]' : 'text-[var(--arc-ink-4)]',
                    ].join(' ')}
                  >
                    W{rep.finalWave}
                  </span>
                )}
              />
            ))}
          </Rail>

          {/* 主區：播放器 */}
          <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto px-4 py-3">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-[var(--cn-line-soft)] pb-2.5">
              <span className="flex items-center gap-1.5">
                <MapIcon className="h-3 w-3 text-[var(--arc-ink-3)]" />
                <span className="text-[12.5px] text-[var(--arc-ink)]">{getPathDisplayName(replay.mapId)}</span>
                {getPathDisplayName(replay.mapId) !== replay.mapId && (
                  <span className="font-mono text-[10px] text-[var(--arc-ink-4)]">({replay.mapId})</span>
                )}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--arc-ink-3)]">
                {formatGameRecordDifficulty(replay.difficulty, diffLabels)}
              </span>
              {replay.endlessMode && (
                <span className="border border-[rgba(111,140,255,0.35)] px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.08em] text-[var(--arc-reach)]">
                  {r.endlessMode}
                </span>
              )}
              <span className="arc-num text-[10.5px] leading-none text-[var(--arc-ink-3)]">
                W{replay.finalWave} · {Math.floor(replay.finalScore).toLocaleString()} · {formatTime(replay.duration)}
              </span>
            </div>

            {/* 畫布（60fps 插值繪製） */}
            <div className="mt-3 flex justify-center border-[3px] border-[var(--cn-line-soft)] bg-[var(--arc-void-2)] p-2">
              <ReplayCanvas
                snapshots={replay.snapshots}
                playheadRef={playheadRef}
                mapId={replay.mapId}
                width={720}
                height={528}
                events={replay.events}
              />
            </div>

            {/* 時間軸 + 控制 */}
            <Deck className="mt-3 space-y-2.5 p-3">
              <ReplayTimeline
                playhead={playhead}
                duration={replay.duration}
                onPlayheadChange={setPlayhead}
                events={replay.events}
                notes={replay.notes}
                autoBookmarks={autoBookmarks}
                formatTime={formatTime}
              />
              <ReplayControls
                playing={playing}
                onTogglePlay={() => setPlaying((p) => !p)}
                playhead={playhead}
                duration={replay.duration}
                onPlayheadChange={setPlayhead}
                speed={speed}
                onSpeedChange={setSpeed}
                loop={loop}
                onToggleLoop={() => setLoop((l) => !l)}
                snapshots={replay.snapshots}
                onJumpToWave={(w) => {
                  const target = replay.snapshots.find((s) => s.currentWave === w);
                  if (target) setPlayhead(target.time);
                }}
                formatTime={formatTime}
              />
              <div className="arc-label border-t border-[var(--cn-line-soft)] pt-2 text-[9.5px] leading-relaxed">
                {r.keyboardHints}
              </div>
            </Deck>

            {/* 圖表 + 事件 */}
            <div className="mt-3 grid grid-cols-1 gap-2.5 lg:grid-cols-2">
              <TimeChart title={r.moneyOverTime} snapshots={replay.snapshots} field="money" tone="caution" playhead={playhead} />
              <TimeChart title={r.healthOverTime} snapshots={replay.snapshots} field="health" tone="vital" playhead={playhead} />
              <TimeChart title={r.scoreOverTime} snapshots={replay.snapshots} field="score" tone="reach" playhead={playhead} />
              <EventLog events={pastEvents} formatTime={formatTime} />
            </div>
          </main>

          {/* 右側：詳情 */}
          <aside className="flex w-[336px] shrink-0 flex-col overflow-y-auto border-l border-[var(--cn-line-soft)] bg-[var(--arc-deck)] p-3 xl:w-[376px]">
            <SegHead label={r.statsPanel} />

            <div className="mt-3 grid grid-cols-2 gap-2">
              <StatBox
                label={t.game.money}
                value={currentFrame ? `$${Math.floor(currentFrame.money)}` : '-'}
                tone="caution"
              />
              <StatBox
                label={t.game.health}
                value={currentFrame ? String(Math.round(currentFrame.health)) : '-'}
                tone="alarm"
              />
              <StatBox
                label={r.score}
                value={currentFrame ? Math.floor(currentFrame.score).toLocaleString() : '-'}
                tone="reach"
              />
              <StatBox
                label={r.wave}
                value={currentFrame ? String(currentFrame.currentWave) : '-'}
                tone="ink"
              />
            </div>

            <Deck className="mt-2 flex flex-wrap">
              <MiniStatBox label={r.enemiesAlive} value={currentFrame?.enemyCount ?? '-'} tone="alarm" />
              <MiniStatBox label={r.towersBuilt} value={currentFrame?.towerCount ?? '-'} tone="reach" />
              <MiniStatBox label={r.bulletsActive} value={currentFrame?.projectileCount ?? '-'} tone="caution" />
            </Deck>
            <Deck className="mt-1.5 flex flex-wrap">
              <MiniStatBox
                label={r.totalDamage}
                value={currentFrame ? Math.floor(currentFrame.totalDamage).toLocaleString() : '-'}
                tone="caution"
              />
              <MiniStatBox label={r.totalKills} value={currentFrame?.totalKills ?? '-'} tone="vital" />
              <MiniStatBox label={r.progress} value={`${progressPercent}%`} tone="signal" />
            </Deck>

            <div className="mt-4">
              <ReplayTagsPanel tags={replay.tags || []} onChange={(tags) => setTags(replay.id, tags)} />
            </div>

            <div className="mt-4 flex min-h-0 flex-1 flex-col">
              <ReplayNotesPanel
                notes={replay.notes || []}
                playhead={playhead}
                onAdd={(time, text) => addNote(replay.id, time, text)}
                onDelete={(noteId) => deleteNote(replay.id, noteId)}
                onUpdate={(noteId, text) => updateNote(replay.id, noteId, text)}
                onJump={(time) => setPlayhead(time)}
                formatTime={formatTime}
              />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-x-4 border-t border-[var(--cn-line-soft)] pt-3">
              <StatCell label={r.duration} value={formatTime(replay.duration)} tone="muted" />
              <StatCell label={r.finalScore} value={Math.floor(replay.finalScore).toLocaleString()} tone="reach" />
            </div>
          </aside>
        </div>
      </div>
    </SceneShell>
  );
}
