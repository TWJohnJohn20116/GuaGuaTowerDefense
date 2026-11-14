/**
 * 設定 - 關於分頁：更新檢查區塊（HARDLINE）
 *
 * 狀態列用訊號點 + mono 文字；安裝進度用方塊計量條（Meter）。
 */

import { DownloadIcon, RefreshIcon } from '@/components/ui/Icons';
import MarkdownRenderer from '@/components/ui/MarkdownRenderer';
import { Btn, Dot, Meter } from '@/components/hl';
import { useTranslation } from '@/i18n';
import {
  installPendingUpdate,
  openDownloadPage,
  type UpdateInfo,
  type UpdateInstallProgress,
} from '@/services/updateService';

type CheckStatus = 'idle' | 'checking' | 'latest' | 'available' | 'error';

interface AboutUpdatePanelProps {
  checkStatus: CheckStatus;
  updateInfo: UpdateInfo | null;
  showFullNotes: boolean;
  installProgress: UpdateInstallProgress;
  onToggleNotes: () => void;
  onCheckUpdate: () => void;
  onInstallProgress: (progress: UpdateInstallProgress) => void;
}

export default function AboutUpdatePanel({
  checkStatus,
  updateInfo,
  showFullNotes,
  installProgress,
  onToggleNotes,
  onCheckUpdate,
  onInstallProgress,
}: AboutUpdatePanelProps) {
  const { t } = useTranslation();
  const u = t.settings.aboutTab.update;
  const isInstalling = installProgress.phase === 'downloading' || installProgress.phase === 'installing';

  const handleInstall = async () => {
    if (!updateInfo) return;
    if (!updateInfo.canInstallInApp) {
      openDownloadPage(updateInfo.downloadUrl);
      return;
    }
    try {
      await installPendingUpdate(onInstallProgress);
    } catch {
      openDownloadPage(updateInfo.downloadUrl);
    }
  };

  return (
    <div className="flex flex-col gap-2.5">
      {checkStatus === 'latest' && (
        <StatusLine kind="success" title={u.alreadyLatest} desc={u.alreadyLatestDesc} />
      )}

      {checkStatus === 'available' && updateInfo && (
        <div className="flex flex-col gap-2.5 border-[3px] border-[var(--cn-line-soft)] bg-[var(--arc-void-2)] p-2.5">
          <div className="flex items-center gap-2">
            <Dot tone="signal" pulse />
            <span className="min-w-0 flex-1 truncate text-[12px] text-[var(--arc-gold)]">
              {u.newVersionFound.replace('{version}', updateInfo.latestVersion)}
            </span>
            <span className="shrink-0 border-[3px] border-[var(--cn-line-soft)] px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-[var(--arc-ink-2)]">
              v{updateInfo.currentVersion} → v{updateInfo.latestVersion}
            </span>
          </div>

          {updateInfo.canInstallInApp && (
            <span className="font-mono text-[9.5px] uppercase tracking-[0.08em] text-[var(--arc-vital)]">
              {u.inAppUpdate}
            </span>
          )}

          {updateInfo.releaseNotes && !isInstalling && (
            <UpdateNotesPreview
              notes={updateInfo.releaseNotes}
              showFull={showFullNotes}
              onToggle={onToggleNotes}
              viewFullLabel={u.viewFullNotes}
              collapseLabel={u.collapse}
            />
          )}

          {isInstalling && (
            <InstallProgressBar
              progress={installProgress}
              installingLabel={u.installing}
              downloadingLabel={u.downloading}
            />
          )}

          {installProgress.phase === 'error' && (
            <span className="text-[11px] leading-relaxed text-[var(--arc-alert)]">
              {installProgress.errorMessage ?? u.installFailed}
            </span>
          )}

          {!isInstalling && (
            <div className="flex flex-col gap-1.5">
              <Btn
                variant="signal"
                block
                icon={<DownloadIcon className="h-3.5 w-3.5" />}
                onClick={handleInstall}
              >
                {updateInfo.canInstallInApp ? u.updateAndRestart : u.downloadNewVersion}
              </Btn>
              {updateInfo.canInstallInApp && (
                <Btn variant="ghost" block size="sm" onClick={() => openDownloadPage(updateInfo.downloadUrl)}>
                  {u.browserDownload}
                </Btn>
              )}
            </div>
          )}
        </div>
      )}

      {checkStatus === 'error' && (
        <StatusLine kind="error" title={u.checkFailed} desc={t.settings.aboutTab.networkError} />
      )}

      <Btn
        variant="line"
        block
        onClick={onCheckUpdate}
        disabled={checkStatus === 'checking' || isInstalling}
        icon={<RefreshIcon className={`h-3.5 w-3.5 ${checkStatus === 'checking' ? 'animate-spin' : ''}`} />}
      >
        {checkStatus === 'checking' ? u.checking : u.checkUpdate}
      </Btn>
    </div>
  );
}

function StatusLine({ kind, title, desc }: { kind: 'success' | 'error'; title: string; desc: string }) {
  const tone = kind === 'success' ? 'vital' : 'alarm';
  return (
    <div className="flex items-start gap-2 border-[3px] border-[var(--cn-line-soft)] bg-[var(--arc-void-2)] px-2.5 py-2">
      <span className="mt-1">
        <Dot tone={tone} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span
          className={`text-[12px] leading-snug ${
            kind === 'success' ? 'text-[var(--arc-vital)]' : 'text-[var(--arc-alert)]'
          }`}
        >
          {title}
        </span>
        <span className="text-[10.5px] leading-snug text-[var(--arc-ink-3)]">{desc}</span>
      </span>
    </div>
  );
}

function InstallProgressBar({ progress, installingLabel, downloadingLabel }: {
  progress: UpdateInstallProgress;
  installingLabel: string;
  downloadingLabel: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="arc-label">
          {progress.phase === 'installing' ? installingLabel : downloadingLabel}
        </span>
        <span className="font-mono text-[11px] font-semibold tabular-nums text-[var(--arc-gold)]">
          {progress.percent}%
        </span>
      </div>
      <Meter value={progress.percent} max={100} tone="signal" />
    </div>
  );
}

function UpdateNotesPreview({ notes, showFull, onToggle, viewFullLabel, collapseLabel }: {
  notes: string;
  showFull: boolean;
  onToggle: () => void;
  viewFullLabel: string;
  collapseLabel: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 border-[3px] border-[var(--cn-line-soft)] bg-[var(--arc-void-2)] p-2.5">
      <div className="flex items-center gap-2">
        <span className="arc-label">release-notes</span>
        <span className="h-px flex-1 bg-[var(--arc-line)]" />
        <span className="font-mono text-[10px] tabular-nums text-[var(--arc-ink-4)]">{notes.length}</span>
      </div>
      <div className={showFull ? 'max-h-80 overflow-y-auto' : ''}>
        <MarkdownRenderer
          content={showFull ? notes : notes.slice(0, 300) + (notes.length > 300 ? '\n\n...' : '')}
          compact={!showFull}
        />
      </div>
      {notes.length > 300 && (
        <Btn size="sm" variant="ghost" onClick={onToggle}>
          {showFull ? collapseLabel : viewFullLabel}
        </Btn>
      )}
    </div>
  );
}
