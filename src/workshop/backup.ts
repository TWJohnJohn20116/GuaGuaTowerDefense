/**
 * 工作區自動備份（localStorage，保留最近 3 份）
 *
 * 為什麼不進專案檔：備份是「救命用」，不該要求使用者手動匯出；
 * 只留最近三份、每 20 秒最多寫一次，避免一直序列化整個工作區。
 */
import type { WorkshopAsset, WorkshopProject } from '@/types/workshop';

const BACKUP_KEY = 'guagua-workshop-backups';
const MAX_BACKUPS = 3;
const MIN_INTERVAL_MS = 20000;

export interface WorkspaceBackup {
  at: number;
  projects: WorkshopProject[];
  assets: WorkshopAsset[];
}

let lastWrite = 0;

export function readBackups(): WorkspaceBackup[] {
  try {
    const raw = localStorage.getItem(BACKUP_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is WorkspaceBackup => typeof item === 'object' && item !== null && Array.isArray((item as WorkspaceBackup).projects))
      .sort((a, b) => b.at - a.at);
  } catch {
    return [];
  }
}

export function writeBackup(projects: WorkshopProject[], assets: WorkshopAsset[], force = false): void {
  const now = Date.now();
  if (!force && now - lastWrite < MIN_INTERVAL_MS) return;
  lastWrite = now;
  const next: WorkspaceBackup[] = [{ at: now, projects, assets }, ...readBackups()].slice(0, MAX_BACKUPS);
  try {
    localStorage.setItem(BACKUP_KEY, JSON.stringify(next));
  } catch {
    // 容量不足時放棄這輪備份，不影響編輯
  }
}

export function clearBackups(): void {
  try {
    localStorage.removeItem(BACKUP_KEY);
  } catch {
    // ignore
  }
}
