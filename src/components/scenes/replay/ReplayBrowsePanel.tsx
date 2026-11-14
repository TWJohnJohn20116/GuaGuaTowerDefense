/**
 * 回放 · 右側詳情（Console 的 336–376px 詳情欄）
 * HARDLINE：實色面板 + 1px 線 + mono 欄位，選中狀態只換線色。
 */
import type React from 'react';
import type { Replay as ReplayData } from '@/store/replayStore';
import { Btn, Field, SegHead, StatCell } from '@/components/hl';
import {
  ChartIcon, StarIcon, PlayIcon,
  DownloadIcon, TrashIcon, EditIcon, RefreshIcon,
} from '@/components/ui/Icons';
import { getPathDisplayName } from './replayUtils';

interface ReplayBrowsePanelProps {
  replay: ReplayData | null;
  formatTime: (s: number) => string;
  formatDate: (ts: number) => string;
  labels: {
    empty: React.ReactNode;
    victory: string;
    defeat: string;
    view: string;
    replayThis: string;
    exportReplay: string;
    delete: string;
    rename: string;
    favorite: string;
    unfavorite: string;
    wave: string;
    score: string;
    duration: string;
    map: string;
    replayInfo: string;
  };
  onPlay: () => void;
  onReplayThis: () => void;
  onExport: () => void;
  onDelete: () => void;
  onRename: () => void;
  onToggleFavorite: () => void;
}

export function ReplayBrowsePanel({
  replay,
  formatTime,
  formatDate,
  labels,
  onPlay,
  onReplayThis,
  onExport,
  onDelete,
  onRename,
  onToggleFavorite,
}: ReplayBrowsePanelProps) {
  if (!replay) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 border border-dashed border-[var(--cn-line-soft)] px-5 py-8 text-center">
        <ChartIcon className="h-5 w-5 text-[var(--arc-ink-4)]" />
        <div className="arc-label">empty</div>
        <div className="arc-micro max-w-[220px] leading-relaxed">{labels.empty}</div>
      </div>
    );
  }

  const title = replay.name || (replay.isVictory ? labels.victory : labels.defeat);
  const outcome = replay.isVictory ? labels.victory : labels.defeat;

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* 識別 */}
      <div className="shrink-0 border-b border-[var(--cn-line-soft)] px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <h2 className="min-w-0 flex-1 truncate text-[15px] font-semibold leading-tight tracking-[-0.01em] text-[var(--arc-ink)]">
            {title}
          </h2>
          <span
            className={[
              'shrink-0 border px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.08em]',
              replay.isVictory
                ? 'border-[rgba(53,224,138,0.35)] text-[var(--arc-vital)]'
                : 'border-[rgba(255,61,113,0.35)] text-[var(--arc-alert)]',
            ].join(' ')}
          >
            {outcome}
          </span>
        </div>
        <div className="mt-1 font-mono text-[10px] tabular-nums text-[var(--arc-ink-4)]">
          {formatDate(replay.timestamp)}
        </div>
      </div>

      {/* 詳情欄位 */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        <Field label={labels.map}>
          <span className="text-[12px] text-[var(--arc-ink)]">{getPathDisplayName(replay.mapId)}</span>
        </Field>
        {getPathDisplayName(replay.mapId) !== replay.mapId && (
          <Field label="id">
            <span className="font-mono text-[10.5px] text-[var(--arc-ink-4)]">{replay.mapId}</span>
          </Field>
        )}

        <div className="mt-3">
          <SegHead label={labels.replayInfo} />
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <StatCell label={labels.wave} value={`W${replay.finalWave}`} />
          <StatCell label={labels.score} value={replay.finalScore.toLocaleString()} tone="reach" />
          <StatCell label={labels.duration} value={formatTime(replay.duration)} tone="muted" />
        </div>

        {replay.tags && replay.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {replay.tags.map((tag) => (
              <span
                key={tag}
                className="border border-[var(--arc-line-strong)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--arc-ink-2)]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 操作 */}
      <div className="shrink-0 space-y-1.5 border-t border-[var(--cn-line-soft)] p-3">
        <Btn
          variant="line"
          size="lg"
          block
          icon={<PlayIcon className="h-3.5 w-3.5" />}
          onClick={onPlay}
        >
          {labels.view}
        </Btn>

        <div className="grid grid-cols-2 gap-1.5">
          <Btn variant="line" size="sm" block icon={<RefreshIcon className="h-3 w-3" />} onClick={onReplayThis}>
            {labels.replayThis}
          </Btn>
          <Btn
            variant={replay.favorite ? 'quiet' : 'line'}
            size="sm"
            block
            icon={<StarIcon className={`h-3 w-3 ${replay.favorite ? 'text-[var(--arc-caution)]' : ''}`} />}
            onClick={onToggleFavorite}
          >
            {replay.favorite ? labels.unfavorite : labels.favorite}
          </Btn>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          <Btn variant="line" size="sm" block onClick={onExport} icon={<DownloadIcon className="h-3 w-3" />}>
            {labels.exportReplay}
          </Btn>
          <Btn variant="line" size="sm" block onClick={onRename} icon={<EditIcon className="h-3 w-3" />}>
            {labels.rename}
          </Btn>
          <Btn variant="danger" size="sm" block onClick={onDelete} icon={<TrashIcon className="h-3 w-3" />}>
            {labels.delete}
          </Btn>
        </div>
      </div>
    </div>
  );
}

export default ReplayBrowsePanel;
