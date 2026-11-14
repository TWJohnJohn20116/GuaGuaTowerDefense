/**
 * 自動更新服務
 * 優先使用 Tauri 2 原生更新器（簽名驗證 + 遊戲內安裝）
 * 失敗時回退至 GitHub Releases API（開瀏覽器下載）
 */

import { isTauri } from '@tauri-apps/api/core';
import type { Update } from '@tauri-apps/plugin-updater';

export const APP_VERSION = '1.2.0';
const GITHUB_OWNER = 'TWJohnJohn20116';
const GITHUB_REPO = 'GuaGuaTowerDefense';
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`;
const GITHUB_ALL_RELEASES_URL = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases`;
const GITHUB_RELEASES_URL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`;

// ============================================================
// 類型定義
// ============================================================

export interface UpdateInfo {
  currentVersion: string;
  latestVersion: string;
  hasUpdate: boolean;
  releaseNotes: string;
  downloadUrl: string;
  publishedAt: string;
  /** 是否可在遊戲內一鍵安裝（Tauri 原生更新器） */
  canInstallInApp: boolean;
}

export interface ReleaseInfo {
  version: string;
  releaseNotes: string;
  publishedAt: string;
  downloadUrl: string;
  htmlUrl: string;
}

type UpdateInstallPhase = 'idle' | 'downloading' | 'installing' | 'done' | 'error';

export interface UpdateInstallProgress {
  phase: UpdateInstallPhase;
  /** 0–100，下載階段有效 */
  percent: number;
  errorMessage?: string;
}

// ============================================================
// 原生更新器暫存
// ============================================================

let pendingNativeUpdate: Update | null = null;
// ============================================================
// 版本比較
// ============================================================

function compareVersions(a: string, b: string): number {
  const partsA = a.replace(/^v/, '').split('.').map(Number);
  const partsB = b.replace(/^v/, '').split('.').map(Number);

  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const numA = partsA[i] || 0;
    const numB = partsB[i] || 0;
    if (numA > numB) return 1;
    if (numA < numB) return -1;
  }
  return 0;
}

function noUpdateResult(): UpdateInfo {
  return {
    currentVersion: APP_VERSION,
    latestVersion: APP_VERSION,
    hasUpdate: false,
    releaseNotes: '',
    downloadUrl: GITHUB_RELEASES_URL,
    publishedAt: '',
    canInstallInApp: isTauri(),
  };
}

// ============================================================
// GitHub API 檢查
// ============================================================

async function checkGitHubUpdates(): Promise<UpdateInfo> {
  const response = await fetch(GITHUB_API_URL, {
    headers: { Accept: 'application/vnd.github.v3+json' },
  });

  if (!response.ok) {
    throw new Error(`GitHub API 回應錯誤: ${response.status}`);
  }

  const release = await response.json();
  const latestVersion = (release.tag_name || '').replace(/^v/, '');
  const hasUpdate = compareVersions(latestVersion, APP_VERSION) > 0;

  let downloadUrl = GITHUB_RELEASES_URL;
  if (release.assets?.length) {
    const windowsAsset = release.assets.find((asset: { name: string }) =>
      asset.name.endsWith('-setup.exe') || asset.name.endsWith('.exe')
    );
    if (windowsAsset) {
      downloadUrl = windowsAsset.browser_download_url;
    }
  }

  return {
    currentVersion: APP_VERSION,
    latestVersion,
    hasUpdate,
    releaseNotes: release.body || '',
    downloadUrl,
    publishedAt: release.published_at || '',
    canInstallInApp: false,
  };
}

// ============================================================
// 原生更新器檢查
// ============================================================

async function checkNativeUpdates(): Promise<UpdateInfo | null> {
  if (!isTauri()) return null;

  try {
    const { check } = await import('@tauri-apps/plugin-updater');
    const update = await check();
    pendingNativeUpdate = update ?? null;

    if (!update) {
      return noUpdateResult();
    }

    return {
      currentVersion: APP_VERSION,
      latestVersion: update.version.replace(/^v/, ''),
      hasUpdate: true,
      releaseNotes: update.body ?? '',
      downloadUrl: '',
      publishedAt: update.date ?? '',
      canInstallInApp: true,
    };
  } catch (error) {
    console.warn('[原生更新] 檢查失敗，將回退 GitHub API:', error);
    pendingNativeUpdate = null;
    return null;
  }
}

// ============================================================
// 統一檢查入口
// ============================================================

export async function checkForUpdates(): Promise<UpdateInfo> {
  pendingNativeUpdate = null;

  const nativeResult = await checkNativeUpdates();
  if (nativeResult) {
    return nativeResult;
  }

  try {
    return await checkGitHubUpdates();
  } catch (error) {
    console.error('[更新檢查] 失敗:', error);
    throw error;
  }
}

// ============================================================
// 原生安裝
// ============================================================

export async function installPendingUpdate(
  onProgress?: (progress: UpdateInstallProgress) => void,
): Promise<void> {
  if (!pendingNativeUpdate) {
    throw new Error('沒有可安裝的更新，請先檢查更新');
  }

  const update = pendingNativeUpdate;
  let downloaded = 0;
  let contentLength = 0;

  onProgress?.({ phase: 'downloading', percent: 0 });

  try {
    await update.downloadAndInstall((event) => {
      switch (event.event) {
        case 'Started':
          contentLength = event.data.contentLength ?? 0;
          onProgress?.({ phase: 'downloading', percent: 0 });
          break;
        case 'Progress':
          downloaded += event.data.chunkLength;
          if (contentLength > 0) {
            const percent = Math.min(99, Math.round((downloaded / contentLength) * 100));
            onProgress?.({ phase: 'downloading', percent });
          }
          break;
        case 'Finished':
          onProgress?.({ phase: 'installing', percent: 100 });
          break;
      }
    });

    onProgress?.({ phase: 'done', percent: 100 });
    pendingNativeUpdate = null;

    const { relaunch } = await import('@tauri-apps/plugin-process');
    await relaunch();
  } catch (error) {
    const message = error instanceof Error ? error.message : '更新安裝失敗';
    onProgress?.({ phase: 'error', percent: 0, errorMessage: message });
    throw error;
  }
}

// ============================================================
// 開啟下載頁面（GitHub 備援）
// ============================================================

export async function openDownloadPage(url?: string): Promise<void> {
  const targetUrl = url || GITHUB_RELEASES_URL;
  try {
    const { open } = await import('@tauri-apps/plugin-shell');
    await open(targetUrl);
  } catch {
    window.open(targetUrl, '_blank');
  }
}

// ============================================================
// 更新日誌（從 GitHub 取得所有版本）
// ============================================================

export async function fetchAllReleases(limit: number = 10): Promise<ReleaseInfo[]> {
  try {
    const response = await fetch(`${GITHUB_ALL_RELEASES_URL}?per_page=${limit}`, {
      headers: { Accept: 'application/vnd.github.v3+json' },
    });

    if (!response.ok) {
      throw new Error(`GitHub API 回應錯誤: ${response.status}`);
    }

    const releases = await response.json();
    return releases.map((release: {
      tag_name?: string;
      body?: string;
      published_at?: string;
      html_url?: string;
      assets?: { name: string; browser_download_url: string }[];
    }) => {
      let downloadUrl = GITHUB_RELEASES_URL;
      if (release.assets?.length) {
        const windowsAsset = release.assets.find(
          (asset) => asset.name.endsWith('-setup.exe') || asset.name.endsWith('.exe'),
        );
        if (windowsAsset) {
          downloadUrl = windowsAsset.browser_download_url;
        }
      }

      return {
        version: (release.tag_name || '').replace(/^v/, ''),
        releaseNotes: release.body || '',
        publishedAt: release.published_at || '',
        downloadUrl,
        htmlUrl: release.html_url || '',
      };
    });
  } catch (error) {
    console.error('[取得發布清單] 失敗:', error);
    throw error;
  }
}

// ============================================================
// 本地儲存工具
// ============================================================

export function shouldCheckForUpdates(): boolean {
  try {
    const lastCheck = parseInt(localStorage.getItem('lastUpdateCheck') || '0', 10);
    const hoursSinceLastCheck = (Date.now() - lastCheck) / (1000 * 60 * 60);
    return hoursSinceLastCheck >= 24;
  } catch {
    return true;
  }
}

export function setLastCheckTime(): void {
  try {
    localStorage.setItem('lastUpdateCheck', Date.now().toString());
  } catch { /* 忽略 */ }
}

export function getIgnoredVersion(): string | null {
  try {
    return localStorage.getItem('ignoredUpdateVersion');
  } catch {
    return null;
  }
}

export function setIgnoredVersion(version: string): void {
  try {
    localStorage.setItem('ignoredUpdateVersion', version);
  } catch { /* 忽略 */ }
}
