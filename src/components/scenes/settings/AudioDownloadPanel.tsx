/**
 * 設定 - 音訊 API 下載進度面板（HARDLINE）
 *
 * 進度＝方塊計量條 + mono 百分比；狀態用資料色文字，不用發光圓環。
 */
import { useCallback, useEffect } from 'react';
import { useTranslation } from '@/i18n';
import {
  DownloadIcon,
  RefreshIcon,
  CheckIcon,
  MusicNotesIcon,
  BellIcon,
} from '@/components/ui/Icons';
import { Btn, Dot, Meter } from '@/components/hl';
import {
  useAudioDownloadStore,
  selectDownloadStats,
  type AudioDownloadItem,
  type AudioDownloadItemState,
} from '@/store/audioDownloadStore';
import {
  isRemoteAudioEnabled,
  refreshAudioDownloadQueue,
  retryFailedAudioDownloads,
  startAudioPrefetch,
} from '@/services/audioCache/audioFetchService';
import { isJamendoConfigured } from '@/services/audioCache/jamendoClient';
import { isFreesoundConfigured } from '@/services/audioCache/freesoundClient';

function formatBytes(bytes?: number): string {
  if (bytes == null || bytes <= 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function statusLabel(state: AudioDownloadItemState, a: ReturnType<typeof useTranslation>['t']['settings']['audioDownload']): string {
  switch (state) {
    case 'pending':
      return a.statusPending;
    case 'downloading':
      return a.statusDownloading;
    case 'done':
      return a.statusDone;
    case 'failed':
      return a.statusFailed;
    case 'skipped':
      return a.statusSkipped;
    default:
      return state;
  }
}

function statusTone(state: AudioDownloadItemState): string {
  switch (state) {
    case 'downloading':
      return 'text-[var(--arc-reach)]';
    case 'done':
      return 'text-[var(--arc-vital)]';
    case 'failed':
      return 'text-[var(--arc-alert)]';
    case 'skipped':
      return 'text-[var(--arc-caution)]';
    default:
      return 'text-[var(--arc-ink-4)]';
  }
}

function ItemRow({ item }: { item: AudioDownloadItem }) {
  const { t } = useTranslation();
  const a = t.settings.audioDownload;
  return (
    <li className="flex items-center gap-2.5 border-b border-[var(--cn-line-soft)] px-3 py-2 last:border-b-0">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center border-[3px] border-[var(--cn-line-soft)] text-[var(--arc-ink-3)]">
        {item.kind === 'music' ? (
          <MusicNotesIcon className="h-3.5 w-3.5" />
        ) : (
          <BellIcon className="h-3.5 w-3.5" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12px] text-[var(--arc-ink)]">{item.label}</p>
        <p className={`font-mono text-[10px] ${statusTone(item.state)}`}>
          {statusLabel(item.state, a)}
          {item.state === 'done' && item.bytes != null && (
            <span className="ml-1.5 font-mono tabular-nums text-[var(--arc-ink-4)]">{formatBytes(item.bytes)}</span>
          )}
        </p>
        {item.error && (
          <p className="mt-0.5 truncate font-mono text-[9.5px] text-[var(--arc-alert)]">{item.error}</p>
        )}
      </div>
      {item.state === 'downloading' && <Dot tone="reach" pulse />}
      {(item.state === 'done' || item.state === 'skipped') && (
        <CheckIcon className="h-3.5 w-3.5 shrink-0 text-[var(--arc-vital)]" />
      )}
    </li>
  );
}

export function AudioDownloadPanel() {
  const { t } = useTranslation();
  const a = t.settings.audioDownload;
  const status = useAudioDownloadStore((s) => s.status);
  const items = useAudioDownloadStore((s) => s.items);
  const startedAt = useAudioDownloadStore((s) => s.startedAt);
  const finishedAt = useAudioDownloadStore((s) => s.finishedAt);
  const stats = selectDownloadStats(items);
  const enabled = isRemoteAudioEnabled();

  const reload = useCallback(async () => {
    await refreshAudioDownloadQueue();
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const handleStart = () => startAudioPrefetch(true);
  const handleRetry = () => retryFailedAudioDownloads();

  const statusText =
    status === 'running'
      ? `${a.statusDownloading}…`
      : status === 'done'
        ? a.statusDone
        : status === 'partial'
          ? a.statusFailed
          : stats.total === 0
            ? a.remoteDisabled
            : a.startPrefetch;

  const musicItems = items.filter((i) => i.kind === 'music');
  const sfxItems = items.filter((i) => i.kind === 'sfx');

  if (!enabled) {
    return (
      <div className="m-3 flex flex-col items-center gap-1.5 border border-dashed border-[var(--cn-line-soft)] px-4 py-6 text-center">
        <span className="text-[11.5px] text-[var(--arc-ink-2)]">{a.remoteDisabled}</span>
        <span className="font-mono text-[9.5px] text-[var(--arc-ink-4)]">
          VITE_JAMENDO_CLIENT_ID / VITE_FREESOUND_API_KEY
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* 進度總覽 */}
      <div className="flex flex-col gap-2.5 border-b border-[var(--cn-line-soft)] p-3 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-center gap-2">
            <Dot tone={status === 'running' ? 'signal' : status === 'partial' ? 'alarm' : 'vital'} pulse={status === 'running'} />
            <span className="min-w-0 flex-1 truncate text-[12px] text-[var(--arc-ink)]">{statusText}</span>
            <span className="shrink-0 font-mono text-[12px] font-semibold tabular-nums text-[var(--arc-gold)]">
              {stats.percent}%
            </span>
          </div>

          <Meter value={stats.percent} max={100} tone="signal" />

          <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] tabular-nums">
            <span className="text-[var(--arc-vital)]">
              {a.statusDone} {stats.done}/{stats.total}
            </span>
            {stats.failed > 0 && (
              <span className="text-[var(--arc-alert)]">{a.statusFailed} {stats.failed}</span>
            )}
            {stats.downloading > 0 && (
              <span className="text-[var(--arc-reach)]">{a.statusDownloading} {stats.downloading}</span>
            )}
          </div>

          <div className="flex items-center gap-2 font-mono text-[9.5px] text-[var(--arc-ink-4)]">
            <span>
              {isJamendoConfigured() && 'Jamendo'}
              {isJamendoConfigured() && isFreesoundConfigured() && ' · '}
              {isFreesoundConfigured() && 'Freesound'}
            </span>
            {startedAt != null && (
              <span className="ml-auto tabular-nums">
                {finishedAt != null
                  ? `${Math.max(1, Math.round((finishedAt - startedAt) / 1000))}s`
                  : `${a.statusDownloading}…`}
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-1.5">
          <Btn
            size="sm"
            variant="signal"
            disabled={status === 'running'}
            onClick={handleStart}
            icon={<DownloadIcon className="h-3.5 w-3.5" />}
          >
            {status === 'running' ? a.statusDownloading : a.startPrefetch}
          </Btn>
          <Btn
            size="sm"
            variant="line"
            onClick={() => void reload()}
            icon={<RefreshIcon className="h-3.5 w-3.5" />}
          >
            {a.refresh}
          </Btn>
          {stats.failed > 0 && (
            <Btn size="sm" variant="line" disabled={status === 'running'} onClick={handleRetry}>
              {a.retryFailed}
            </Btn>
          )}
        </div>
      </div>

      {musicItems.length > 0 && (
        <div className="border-b border-[var(--cn-line-soft)]">
          <div className="flex items-center gap-2 px-3 py-2">
            <span className="arc-label">{t.settings.music}</span>
            <span className="h-px flex-1 bg-[var(--arc-line)]" />
            <span className="font-mono text-[10px] tabular-nums text-[var(--arc-ink-4)]">
              {String(musicItems.length).padStart(2, '0')}
            </span>
          </div>
          <ul className="flex max-h-44 flex-col overflow-y-auto">
            {musicItems.map((item) => (
              <ItemRow key={item.key} item={item} />
            ))}
          </ul>
        </div>
      )}

      {sfxItems.length > 0 && (
        <div>
          <div className="flex items-center gap-2 px-3 py-2">
            <span className="arc-label">{t.settings.sound}</span>
            <span className="h-px flex-1 bg-[var(--arc-line)]" />
            <span className="font-mono text-[10px] tabular-nums text-[var(--arc-ink-4)]">
              {String(sfxItems.length).padStart(2, '0')}
            </span>
          </div>
          <ul className="flex max-h-52 flex-col overflow-y-auto">
            {sfxItems.map((item) => (
              <ItemRow key={item.key} item={item} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
