/**
 * 設定 - 主選單 BGM 專輯選擇（HARDLINE）
 *
 * 專輯卡＝Deck，hover 只換線色；選中＝訊號線。預覽鈕用 hl Btn。
 * 專輯代表色只作用在圖示本身（資料色），不鋪成背景漸層。
 */

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { SectionGroup, SettingRow } from '@/components/ui';
import { ToggleSwitch } from '@/components/ui/ToggleSwitch';
import { Deck, Btn } from '@/components/hl';
import {
  MusicNotesIcon, DownloadIcon, RefreshIcon, SlidersIcon,
  SparklesIcon, GlobeIcon, MonitorIcon, LightningIcon, SnowflakeIcon,
  WaveIcon, StarIcon, PlayIcon, PauseIcon,
} from '@/components/ui/Icons';
import {
  MENU_MUSIC_ALBUMS,
  getMenuAlbumById,
  isRemoteMenuAlbum,
  type MenuMusicAlbum,
} from '@/services/music/menuAlbumCatalog';
import { useMenuMusicStore } from '@/store/menuMusicStore';
import { countCachedMenuAlbumTracks } from '@/services/music/menuMusicCache';
import { ensureMenuAlbumCached } from '@/services/audioCache/menuJamendoService';
import { isJamendoConfigured } from '@/services/audioCache/jamendoClient';
import { syncMusic, unlockMusic, previewMenuAlbum, stopMenuAlbumPreview } from '@/services/musicService';
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/i18n';
import { playUiHover } from '@/services/audioService';

const ALBUM_ICONS: Record<string, ReactNode> = {
  'local-default': <MusicNotesIcon className="h-5 w-5" />,
  'ambient-chill': <SnowflakeIcon className="h-5 w-5" />,
  'lofi-study': <WaveIcon className="h-5 w-5" />,
  'piano-dreams': <StarIcon className="h-5 w-5" />,
  'synthwave': <LightningIcon className="h-5 w-5" />,
  'acoustic-morning': <SparklesIcon className="h-5 w-5" />,
  'space-odyssey': <GlobeIcon className="h-5 w-5" />,
  'orchestral-calm': <MonitorIcon className="h-5 w-5" />,
  'world-fusion': <GlobeIcon className="h-5 w-5" />,
};

function AlbumCard({
  album,
  selected,
  cachedCount,
  previewing,
  onSelect,
  onPreview,
  mm,
}: {
  album: MenuMusicAlbum;
  selected: boolean;
  cachedCount: number;
  previewing: boolean;
  onSelect: () => void;
  onPreview: () => void;
  mm: ReturnType<typeof useTranslation>['t']['settings']['menuMusic'];
}) {
  const remote = isRemoteMenuAlbum(album);
  const cached = remote && cachedCount >= album.trackCount;

  return (
    <Deck
      as="article"
      active={selected}
      className={[
        'group relative flex flex-col transition-colors duration-150',
        selected ? '' : 'hover:border-[var(--arc-line-hot)]',
      ].join(' ')}
    >
      <button
        type="button"
        onClick={onSelect}
        onMouseEnter={() => playUiHover()}
        className="flex w-full flex-col gap-2 p-3 text-left"
      >
        <span className="flex items-start gap-2.5">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center border-[3px] border-[var(--cn-line-soft)]"
            style={{ color: album.accent }}
          >
            {ALBUM_ICONS[album.id] ?? <MusicNotesIcon className="h-5 w-5" />}
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="truncate text-[13px] font-medium leading-tight text-[var(--arc-ink)]">
              {album.title}
            </span>
            <span className="line-clamp-2 text-[10.5px] leading-snug text-[var(--arc-ink-3)]">
              {album.description}
            </span>
          </span>
        </span>

        <span className="mt-0.5 flex items-center gap-2 border-t border-[var(--cn-line-soft)] pt-2">
          <span className="arc-label">{remote ? 'remote' : 'local'}</span>
          <span className="h-px flex-1 bg-[var(--arc-line)]" />
          {remote && (
            <span
              className={`font-mono text-[10px] tabular-nums ${
                cached ? 'text-[var(--arc-vital)]' : 'text-[var(--arc-ink-3)]'
              }`}
            >
              {cached ? mm.cached : `${cachedCount}/${album.trackCount}`}
            </span>
          )}
          {selected && (
            <span className="font-mono text-[9.5px] uppercase tracking-[0.08em] text-[var(--arc-gold)]">
              on
            </span>
          )}
        </span>
      </button>

      <div className="absolute bottom-2 right-2">
        <Btn
          size="sm"
          variant="ghost"
          onClick={onPreview}
          title={previewing ? mm.previewStop : mm.previewAlbum}
        >
          {previewing ? <PauseIcon className="h-3.5 w-3.5" /> : <PlayIcon className="h-3.5 w-3.5" />}
        </Btn>
      </div>
    </Deck>
  );
}

function SelectedAlbumBanner({
  album,
  cachedCount,
  previewing,
  onPreview,
  mm,
}: {
  album: MenuMusicAlbum;
  cachedCount: number;
  previewing: boolean;
  onPreview: () => void;
  mm: ReturnType<typeof useTranslation>['t']['settings']['menuMusic'];
}) {
  const remote = isRemoteMenuAlbum(album);
  return (
    <Deck className="col-span-full flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center border-[3px] border-[var(--cn-line-soft)]"
          style={{ color: album.accent }}
        >
          {ALBUM_ICONS[album.id] ?? <MusicNotesIcon className="h-5 w-5" />}
        </span>
        <div className="min-w-0">
          <div className="arc-label">{mm.currentlyUsing}</div>
          <div className="mt-0.5 truncate text-[13.5px] font-medium text-[var(--arc-ink)]">{album.title}</div>
          <div className="mt-0.5 truncate text-[10.5px] text-[var(--arc-ink-3)]">{album.description}</div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {remote && (
          <div className="flex flex-col items-end border-[3px] border-[var(--cn-line-soft)] px-2 py-1">
            <span className="arc-label">{mm.cachedTracks}</span>
            <span className="font-mono text-[12px] font-semibold tabular-nums text-[var(--arc-ink)]">
              {cachedCount} / {album.trackCount}
            </span>
          </div>
        )}
        <Btn
          size="sm"
          variant={previewing ? 'line' : 'quiet'}
          onClick={onPreview}
          icon={previewing ? <PauseIcon className="h-3.5 w-3.5" /> : <PlayIcon className="h-3.5 w-3.5" />}
        >
          {previewing ? mm.previewStop : mm.previewStart}
        </Btn>
      </div>
    </Deck>
  );
}

export function MenuMusicAlbumPanel() {
  const { t } = useTranslation();
  const mm = t.settings.menuMusic;
  const selectedAlbumId = useMenuMusicStore((s) => s.selectedAlbumId);
  const shuffle = useMenuMusicStore((s) => s.shuffle);
  const setSelectedAlbumId = useMenuMusicStore((s) => s.setSelectedAlbumId);
  const setShuffle = useMenuMusicStore((s) => s.setShuffle);
  const musicEnabled = useGameStore((s) => s.musicEnabled);

  const [cacheMap, setCacheMap] = useState<Record<string, number>>({});
  const [downloading, setDownloading] = useState(false);
  const [status, setStatus] = useState('');
  const [previewAlbumId, setPreviewAlbumId] = useState<string | null>(null);

  const selectedAlbum = getMenuAlbumById(selectedAlbumId) ?? MENU_MUSIC_ALBUMS[1];

  const refreshCacheCounts = useCallback(async () => {
    const next: Record<string, number> = {};
    await Promise.all(
      MENU_MUSIC_ALBUMS.filter(isRemoteMenuAlbum).map(async (album) => {
        next[album.id] = await countCachedMenuAlbumTracks(album.id);
      }),
    );
    setCacheMap(next);
  }, []);

  useEffect(() => {
    void refreshCacheCounts();
  }, [refreshCacheCounts, selectedAlbumId]);

  useEffect(() => () => {
    stopMenuAlbumPreview();
  }, []);

  const handleSelect = (albumId: string) => {
    stopMenuAlbumPreview();
    setPreviewAlbumId(null);
    setSelectedAlbumId(albumId);
    unlockMusic();
    if (musicEnabled) syncMusic(undefined, true);
  };

  const handlePreview = async (albumId: string) => {
    if (!musicEnabled) {
      setStatus(mm.enableBgmFirst);
      window.setTimeout(() => setStatus(''), 2500);
      return;
    }
    if (previewAlbumId === albumId) {
      stopMenuAlbumPreview();
      setPreviewAlbumId(null);
      return;
    }
    unlockMusic();
    const ok = await previewMenuAlbum(albumId);
    if (ok) {
      setPreviewAlbumId(albumId);
    } else {
      setStatus(mm.previewFailed);
      window.setTimeout(() => setStatus(''), 2500);
    }
  };

  const handleDownloadSelected = async () => {
    if (!isRemoteMenuAlbum(selectedAlbum)) return;
    setDownloading(true);
    setStatus('');
    const ok = await ensureMenuAlbumCached(selectedAlbumId);
    await refreshCacheCounts();
    setDownloading(false);
    setStatus(ok ? mm.downloadSuccess : mm.downloadFailed);
    if (ok && musicEnabled) syncMusic(undefined, true);
    window.setTimeout(() => setStatus(''), 3000);
  };

  const jamendoReady = isJamendoConfigured();
  const canDownload = isRemoteMenuAlbum(selectedAlbum);

  return (
    <SectionGroup
      title={mm.title}
      description={mm.description}
      icon={<MusicNotesIcon className="h-3.5 w-3.5" />}
      badge={mm.badge}
      count={MENU_MUSIC_ALBUMS.length}
      columns={3}
    >
      {!jamendoReady && (
        <p className="col-span-full border-b border-[var(--cn-line-soft)] bg-[var(--arc-void-2)] px-3 py-2 text-[11px] leading-relaxed text-[var(--arc-caution)]">
          {mm.jamendoHint}
        </p>
      )}

      <div className="col-span-full p-2">
        <SelectedAlbumBanner
          album={selectedAlbum}
          cachedCount={cacheMap[selectedAlbum.id] ?? 0}
          previewing={previewAlbumId === selectedAlbum.id}
          onPreview={() => void handlePreview(selectedAlbum.id)}
          mm={mm}
        />
      </div>

      <div className="col-span-full grid grid-cols-1 gap-2 p-2 md:grid-cols-2 xl:grid-cols-3">
        {MENU_MUSIC_ALBUMS.map((album) => (
          <AlbumCard
            key={album.id}
            album={album}
            selected={selectedAlbumId === album.id}
            cachedCount={cacheMap[album.id] ?? 0}
            previewing={previewAlbumId === album.id}
            onSelect={() => handleSelect(album.id)}
            onPreview={() => void handlePreview(album.id)}
            mm={mm}
          />
        ))}
      </div>

      <div className="col-span-full flex flex-col">
        <SettingRow
          icon={<SlidersIcon className="h-3.5 w-3.5" />}
          label={mm.shuffleLabel}
          description={mm.shuffleDesc}
          control={
            <ToggleSwitch
              enabled={shuffle}
              onToggle={() => setShuffle(!shuffle)}
              size="sm"
            />
          }
        />

        <div className="flex flex-wrap items-center gap-2 border-t border-[var(--cn-line-soft)] px-3 py-2.5">
          <Btn
            size="sm"
            variant="line"
            onClick={() => void refreshCacheCounts()}
            icon={<RefreshIcon className="h-3.5 w-3.5" />}
          >
            {mm.refreshCache}
          </Btn>
          <Btn
            size="sm"
            variant="quiet"
            disabled={!jamendoReady || downloading || !canDownload}
            onClick={() => void handleDownloadSelected()}
            icon={<DownloadIcon className="h-3.5 w-3.5" />}
          >
            {downloading ? mm.downloading : mm.downloadAlbum}
          </Btn>
          {status && (
            <span className="ml-auto font-mono text-[10.5px] text-[var(--arc-vital)]">{status}</span>
          )}
        </div>
      </div>
    </SectionGroup>
  );
}

export default MenuMusicAlbumPanel;
