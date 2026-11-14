/**
 * 更新通知元件
 * 啟動時自動檢查更新；支援 Tauri 原生一鍵安裝或 GitHub 備援下載
 * HARDLINE：右下固定，1px 線 + 訊號左緣，mono 標籤，無漸層與光暈。
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CelebrationIcon, XIcon, DownloadIcon, RefreshIcon } from '@/components/ui/Icons';
import { playUiHover } from '@/services/audioService';
import { Btn, Deck, IconBtn, Num } from '@/components/hl';
import {
  APP_VERSION,
  checkForUpdates,
  installPendingUpdate,
  openDownloadPage,
  shouldCheckForUpdates,
  setLastCheckTime,
  getIgnoredVersion,
  setIgnoredVersion,
  type UpdateInfo,
  type UpdateInstallProgress,
} from '@/services/updateService';

export default function UpdateNotification() {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [visible, setVisible] = useState(false);
  const [installProgress, setInstallProgress] = useState<UpdateInstallProgress>({
    phase: 'idle',
    percent: 0,
  });

  useEffect(() => {
    if (!shouldCheckForUpdates()) return;

    const check = async () => {
      try {
        const info = await checkForUpdates();
        setLastCheckTime();

        if (info.hasUpdate) {
          const ignored = getIgnoredVersion();
          if (ignored === info.latestVersion) return;

          setUpdateInfo(info);
          setVisible(true);
        }
      } catch {
        // 靜默失敗
      }
    };

    const timer = setTimeout(check, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!updateInfo?.canInstallInApp) {
      openDownloadPage(updateInfo?.downloadUrl);
      setVisible(false);
      return;
    }

    setInstallProgress({ phase: 'downloading', percent: 0 });
    try {
      await installPendingUpdate(setInstallProgress);
    } catch {
      setInstallProgress({ phase: 'error', percent: 0, errorMessage: '安裝失敗，請改用手動下載' });
    }
  }, [updateInfo]);

  const handleIgnore = () => {
    if (updateInfo) setIgnoredVersion(updateInfo.latestVersion);
    setVisible(false);
  };

  const preview = updateInfo?.releaseNotes
    ? updateInfo.releaseNotes.replace(/[#*`\->\[\]()]/g, '').trim().slice(0, 120)
    : '';

  const isInstalling = installProgress.phase === 'downloading' || installProgress.phase === 'installing';
  const canInstallInApp = updateInfo?.canInstallInApp ?? false;

  return (
    <AnimatePresence>
      {visible && updateInfo && (
        <motion.div
          className="fixed bottom-3 right-3 z-[9999] w-full max-w-[340px] px-3 sm:px-0"
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 16 }}
          transition={{ duration: 0.16 }}
        >
          <Deck className="arc-panel--flat rounded-sm overflow-hidden border-l-2 border-l-[var(--arc-gold)]">
            <header className="flex items-start gap-2.5 border-b border-[var(--cn-line-soft)] px-3 py-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border border-[var(--arc-line-strong)] text-[var(--arc-gold)]">
                <CelebrationIcon className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="arc-label text-[var(--arc-gold)]">update / available</div>
                <h3 className="arc-title mt-1 truncate text-[15px] font-semibold leading-tight text-[var(--arc-ink)]">
                  發現新版本
                </h3>
                <p className="mt-0.5 truncate font-mono text-[9.5px] uppercase tracking-[0.06em] text-[var(--arc-ink-4)]">
                  {canInstallInApp ? '可遊戲內更新' : 'Guagua TD 更新'}
                </p>
              </div>
              {!isInstalling && (
                <IconBtn
                  label="close"
                  className="flex h-6 w-6 shrink-0 items-center justify-center text-[var(--arc-ink-3)] transition-colors hover:text-[var(--arc-ink)]"
                  onClick={() => setVisible(false)}
                >
                  <XIcon className="h-3 w-3" />
                </IconBtn>
              )}
            </header>

            <div className="px-3 py-2.5">
              <div className="arc-num flex items-baseline gap-2 rounded-sm border-[3px] border-[var(--cn-line-soft)] bg-[var(--arc-void-2)] px-2 py-1.5 font-mono text-[11px] tabular-nums">
                <span className="text-[var(--arc-ink-4)]">v{APP_VERSION}</span>
                <span className="text-[var(--arc-ink-4)]">→</span>
                <span className="font-semibold text-[var(--arc-gold)]">v{updateInfo.latestVersion}</span>
              </div>

              {preview && !isInstalling && (
                <p className="mt-2 line-clamp-3 text-[11px] leading-relaxed text-[var(--arc-ink-3)]">
                  {preview}
                  {updateInfo.releaseNotes.length > 120 ? '…' : ''}
                </p>
              )}

              {isInstalling && (
                <div className="mt-2">
                  <div className="flex items-baseline justify-between">
                    <span className="arc-label flex items-center gap-1.5">
                      <RefreshIcon className="h-3 w-3 animate-spin text-[var(--arc-gold)]" />
                      {installProgress.phase === 'installing' ? '正在安裝…' : '正在下載…'}
                    </span>
                    <Num
                      value={`${installProgress.percent}%`}
                      tone="signal"
                      size="sm"
                      className="font-mono tabular-nums"
                    />
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-sm border-[3px] border-[var(--cn-line-soft)] bg-[var(--arc-void-2)]">
                    <motion.div
                      className="h-full bg-[var(--arc-gold)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${installProgress.percent}%` }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>
                </div>
              )}

              {installProgress.phase === 'error' && (
                <p className="mt-2 border-l-2 border-[var(--arc-alert)] pl-2 text-[11px] text-[var(--arc-alert)]">
                  {installProgress.errorMessage}
                </p>
              )}

              {!isInstalling && (
                <div className="mt-2.5 flex flex-col gap-1.5">
                  <Btn
                    variant="signal"
                    size="sm"
                    block
                    icon={<DownloadIcon className="h-3.5 w-3.5" />}
                    onClick={handleInstall}
                    onMouseEnter={() => playUiHover()}
                  >
                    {canInstallInApp ? '立即更新' : '下載更新'}
                  </Btn>
                  <Btn
                    variant="line"
                    size="sm"
                    block
                    onClick={handleIgnore}
                    onMouseEnter={() => playUiHover()}
                  >
                    忽略
                  </Btn>
                </div>
              )}

              {installProgress.phase === 'error' && (
                <Btn
                  variant="line"
                  size="sm"
                  block
                  className="mt-2"
                  onClick={() => openDownloadPage(updateInfo.downloadUrl)}
                >
                  改為瀏覽器下載
                </Btn>
              )}
            </div>
          </Deck>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
