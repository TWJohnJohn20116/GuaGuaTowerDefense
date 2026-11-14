/**
 * 設定 - 關於分頁（HARDLINE）
 *
 * 四張 Deck：版本資訊、資料位置、檢查更新、更新日誌。
 * 版本號與路徑走 mono tabular；標籤 mono 10px；折疊用 hl Btn。
 */

import { useState, useCallback } from 'react';
import { DocumentIcon, DownloadIcon, FolderIcon } from '@/components/ui/Icons';
import MarkdownRenderer from '@/components/ui/MarkdownRenderer';
import { useTranslation } from '@/i18n';
import { Deck, SegHead, Btn, Field, Dot } from '@/components/hl';
import {
  APP_VERSION,
  checkForUpdates,
  openDownloadPage,
  fetchAllReleases,
  type UpdateInfo,
  type ReleaseInfo,
  type UpdateInstallProgress,
} from '@/services/updateService';
import AboutUpdatePanel from '@/components/scenes/settings/AboutUpdatePanel';
import { AudioCreditsPanel } from '@/components/scenes/settings/AudioCreditsPanel';

type CheckStatus = 'idle' | 'checking' | 'latest' | 'available' | 'error';

export default function AboutTab() {
  const { t } = useTranslation();
  const a = t.settings.aboutTab;
  const [checkStatus, setCheckStatus] = useState<CheckStatus>('idle');
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [showFullNotes, setShowFullNotes] = useState(false);
  const [installProgress, setInstallProgress] = useState<UpdateInstallProgress>({
    phase: 'idle',
    percent: 0,
  });

  // 更新日誌
  const [releases, setReleases] = useState<ReleaseInfo[]>([]);
  const [releasesStatus, setReleasesStatus] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle');
  const [showChangelog, setShowChangelog] = useState(false);
  const [expandedRelease, setExpandedRelease] = useState<string | null>(null);

  const handleCheckUpdate = useCallback(async () => {
    setCheckStatus('checking');
    setInstallProgress({ phase: 'idle', percent: 0 });
    try {
      const info = await checkForUpdates();
      setUpdateInfo(info);
      setCheckStatus(info.hasUpdate ? 'available' : 'latest');
    } catch {
      setCheckStatus('error');
    }
  }, []);

  const loadReleases = useCallback(async () => {
    if (releasesStatus === 'loading') return;
    setReleasesStatus('loading');
    try {
      const data = await fetchAllReleases(20);
      setReleases(data);
      setReleasesStatus('loaded');
      setShowChangelog(true);
      if (data.length > 0) setExpandedRelease(data[0].version);
    } catch {
      setReleasesStatus('error');
    }
  }, [releasesStatus]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('zh-TW', {
        year: 'numeric', month: 'long', day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <>
      {/* 版本資訊 */}
      <Deck notch className="flex flex-col p-3">
        <SegHead label={a.versionInfo} right={<span className="arc-label text-[var(--arc-gold)]">{a.badgeAbout}</span>} />
        <div className="mt-2">
          <Field label={a.currentVersion}>
            <span className="flex items-center gap-1.5">
              <Dot tone="vital" />
              <span className="font-mono text-[13px] font-semibold tabular-nums text-[var(--arc-ink)]">
                v{APP_VERSION}
              </span>
            </span>
          </Field>
          <Field label={a.appName}>
            <span className="text-[12px] text-[var(--arc-ink-2)]">{a.appNameValue}</span>
          </Field>
          <Field label={a.framework}>
            <span className="text-[12px] text-[var(--arc-ink-2)]">{a.frameworkValue}</span>
          </Field>
        </div>
      </Deck>

      {/* 資料位置 */}
      <Deck notch className="flex flex-col p-3">
        <SegHead
          label={a.dataLocation}
          right={<span className="text-[var(--arc-ink-3)]"><FolderIcon className="h-3 w-3" /></span>}
        />
        <div className="mt-2 flex flex-col gap-1.5 border-[3px] border-[var(--cn-line-soft)] bg-[var(--arc-void-2)] p-2.5">
          <span className="arc-label">{a.dataLocationHint}</span>
          <span className="break-all font-mono text-[11px] leading-relaxed text-[var(--arc-ink-2)]">
            %APPDATA%\com.guagua.towerdefense
          </span>
        </div>
      </Deck>

      {/* 檢查更新 */}
      <Deck notch className="flex flex-col p-3">
        <SegHead
          label={a.checkUpdate}
          right={<span className="arc-label text-[var(--arc-gold)]">{a.badgeUpdate}</span>}
        />
        <div className="mt-2">
          <AboutUpdatePanel
            checkStatus={checkStatus}
            updateInfo={updateInfo}
            showFullNotes={showFullNotes}
            installProgress={installProgress}
            onToggleNotes={() => setShowFullNotes(!showFullNotes)}
            onCheckUpdate={handleCheckUpdate}
            onInstallProgress={setInstallProgress}
          />
        </div>
      </Deck>

      {/* 音訊素材鳴謝 */}
      <div className="col-span-full">
        <AudioCreditsPanel />
      </div>

      {/* 更新日誌 */}
      <div className="col-span-full">
        <ChangelogSection
          labels={a}
          releases={releases}
          releasesStatus={releasesStatus}
          showChangelog={showChangelog}
          expandedRelease={expandedRelease}
          onLoad={loadReleases}
          onToggleChangelog={setShowChangelog}
          onToggleRelease={(v) => setExpandedRelease(expandedRelease === v ? null : v)}
          onRetry={() => setReleasesStatus('idle')}
          formatDate={formatDate}
        />
      </div>
    </>
  );
}

// ============================================================
// 子元件
// ============================================================

function StatusLine({ kind, text }: { kind: 'success' | 'error'; text: string }) {
  const tone = kind === 'success' ? 'vital' : 'alarm';
  return (
    <div className="flex items-center gap-2 border-[3px] border-[var(--cn-line-soft)] bg-[var(--arc-void-2)] px-2.5 py-2">
      <Dot tone={tone} />
      <span
        className={`min-w-0 flex-1 text-[11px] leading-snug ${
          kind === 'success' ? 'text-[var(--arc-vital)]' : 'text-[var(--arc-alert)]'
        }`}
      >
        {text}
      </span>
    </div>
  );
}

function ChangelogSection({ labels, releases, releasesStatus, showChangelog, expandedRelease, onLoad, onToggleChangelog, onToggleRelease, onRetry, formatDate }: {
  labels: ReturnType<typeof useTranslation>['t']['settings']['aboutTab'];
  releases: ReleaseInfo[];
  releasesStatus: 'idle' | 'loading' | 'loaded' | 'error';
  showChangelog: boolean;
  expandedRelease: string | null;
  onLoad: () => void;
  onToggleChangelog: (v: boolean) => void;
  onToggleRelease: (v: string) => void;
  onRetry: () => void;
  formatDate: (d: string) => string;
}) {
  return (
    <Deck notch className="flex flex-col">
      <div className="flex items-center gap-2.5 border-b border-[var(--cn-line-soft)] px-3 py-2.5">
        <span className="flex h-6 w-6 items-center justify-center border-[3px] border-[var(--cn-line-soft)] text-[var(--arc-ink-2)]">
          <DocumentIcon className="h-3.5 w-3.5" />
        </span>
        <span className="arc-label text-[var(--arc-ink-2)]">{labels.changelog}</span>
        <span className="h-px flex-1 bg-[var(--arc-line)]" />
        <span className="font-mono text-[10px] tabular-nums text-[var(--arc-ink-4)]">
          {releases.length > 0 ? String(releases.length).padStart(2, '0') : '—'}
        </span>
        {releasesStatus === 'loaded' && showChangelog && (
          <Btn size="sm" variant="ghost" onClick={() => onToggleChangelog(false)}>
            {labels.collapse}
          </Btn>
        )}
      </div>

      <div className="flex flex-col gap-2 p-3">
        {releasesStatus === 'idle' && (
          <Btn
            variant="line"
            block
            icon={<DownloadIcon className="h-3.5 w-3.5" />}
            onClick={onLoad}
          >
            {labels.fetchChangelog}
          </Btn>
        )}

        {releasesStatus === 'loading' && (
          <div className="flex items-center gap-2 py-4">
            <Dot tone="signal" pulse />
            <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-[var(--arc-ink-3)]">
              {labels.loadingChangelog}
            </span>
          </div>
        )}

        {releasesStatus === 'error' && (
          <div className="flex flex-col gap-2">
            <StatusLine kind="error" text={`${labels.fetchChangelogFailed} · ${labels.networkError}`} />
            <Btn variant="line" block size="sm" onClick={onRetry}>
              {labels.retry}
            </Btn>
          </div>
        )}

        {releasesStatus === 'loaded' && showChangelog && (
          releases.length === 0 ? (
            <p className="py-3 text-center font-mono text-[10.5px] text-[var(--arc-ink-3)]">{labels.noReleases}</p>
          ) : (
            releases.map((release, index) => (
              <ReleaseCard
                key={release.version}
                labels={labels}
                release={release}
                isLatest={index === 0}
                isExpanded={expandedRelease === release.version}
                isCurrent={release.version === APP_VERSION}
                onToggle={() => onToggleRelease(release.version)}
                formatDate={formatDate}
              />
            ))
          )
        )}

        {releasesStatus === 'loaded' && !showChangelog && (
          <Btn
            variant="line"
            block
            icon={<DocumentIcon className="h-3.5 w-3.5" />}
            onClick={() => onToggleChangelog(true)}
          >
            {labels.expandChangelog.replace('{count}', String(releases.length))}
          </Btn>
        )}
      </div>
    </Deck>
  );
}

function ReleaseCard({ labels, release, isLatest, isExpanded, isCurrent, onToggle, formatDate }: {
  labels: ReturnType<typeof useTranslation>['t']['settings']['aboutTab'];
  release: ReleaseInfo;
  isLatest: boolean;
  isExpanded: boolean;
  isCurrent: boolean;
  onToggle: () => void;
  formatDate: (d: string) => string;
}) {
  return (
    <Deck className="flex flex-col">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-2.5 px-2.5 py-2 text-left transition-colors duration-150 hover:bg-[var(--arc-deck-3)]"
      >
        <span
          className={`shrink-0 border px-1.5 py-0.5 font-mono text-[10.5px] font-semibold tabular-nums ${
            isLatest
              ? 'border-[var(--arc-gold-edge)] text-[var(--arc-gold)]'
              : 'border-[var(--cn-line-soft)] text-[var(--arc-ink-2)]'
          }`}
        >
          v{release.version}
        </span>
        {isLatest && (
          <span className="shrink-0 border border-[var(--arc-vital)] px-1.5 py-0.5 font-mono text-[9px] uppercase leading-none tracking-[0.08em] text-[var(--arc-vital)]">
            {labels.latest}
          </span>
        )}
        {isCurrent && (
          <span className="shrink-0 border border-[var(--arc-reach)] px-1.5 py-0.5 font-mono text-[9px] uppercase leading-none tracking-[0.08em] text-[var(--arc-reach)]">
            {labels.current}
          </span>
        )}
        <span className="ml-auto hidden shrink-0 font-mono text-[10px] tabular-nums text-[var(--arc-ink-4)] sm:block">
          {formatDate(release.publishedAt)}
        </span>
        <span className="shrink-0 font-mono text-[10px] text-[var(--arc-ink-4)]">
          {isExpanded ? '−' : '+'}
        </span>
      </button>

      {isExpanded && (
        <div className="flex flex-col gap-2 border-t border-[var(--cn-line-soft)] p-2.5">
          <span className="font-mono text-[10px] text-[var(--arc-ink-4)] sm:hidden">
            {formatDate(release.publishedAt)}
          </span>
          {release.releaseNotes ? (
            <div className="max-h-80 overflow-y-auto border-[3px] border-[var(--cn-line-soft)] bg-[var(--arc-void-2)] p-2.5">
              <MarkdownRenderer content={release.releaseNotes} />
            </div>
          ) : (
            <p className="py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--arc-ink-4)]">
              {labels.noReleaseNotes}
            </p>
          )}
          <div className="flex gap-2">
            <Btn
              variant="line"
              size="sm"
              className="flex-1"
              icon={<DownloadIcon className="h-3.5 w-3.5" />}
              onClick={() => openDownloadPage(release.downloadUrl)}
            >
              {labels.downloadVersion}
            </Btn>
            <Btn
              variant="ghost"
              size="sm"
              onClick={() => openDownloadPage(release.htmlUrl)}
            >
              GitHub
            </Btn>
          </div>
        </div>
      )}
    </Deck>
  );
}
