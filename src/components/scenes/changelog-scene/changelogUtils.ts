// 更新日誌 · 工具函式
import type { ChangeSection } from '@/components/changelog';

type VersionType = 'major' | 'minor' | 'patch';

export function getVersionType(version: string): VersionType {
  const parts = version.split('.');
  if (parts.length < 3) return 'patch';
  if (parts[2] === '0' && parts[1] === '0') return 'major';
  if (parts[2] === '0') return 'minor';
  return 'patch';
}

export function countSectionItems(section: ChangeSection): number {
  return section.changes.reduce((sum, c) => sum + c.items.length, 0);
}

/** 版本級別只用來標記狀態，不換整張卡的皮膚 */
export const VERSION_TYPE_STYLE: Record<
  VersionType,
  { label: string; tone: string; border: string }
> = {
  major: { label: '重大', tone: 'text-[var(--hl-alarm)]', border: 'border-[rgba(255,75,62,0.35)]' },
  minor: { label: '功能', tone: 'text-[var(--hl-reach)]', border: 'border-[rgba(111,168,255,0.35)]' },
  patch: { label: '修復', tone: 'text-[var(--hl-ink-3)]', border: 'border-[var(--hl-line-strong)]' },
};

/* ------------------------------------------------------------------ 變更前綴 */

export type ChangeTag = 'add' | 'fix' | 'tune';

/** 每條變更前面的 mono 標籤：只有新增／修正／調整三種。 */
export const CHANGE_TAG_LABEL: Record<ChangeTag, string> = {
  add: '新增',
  fix: '修正',
  tune: '調整',
};

const FIX_HINTS = ['修復', '修正', 'fix', 'bug', '錯誤', '壞掉'];
const TUNE_HINTS = ['調整', '改進', '優化', '平衡', 'improve', 'tune', 'balance', '改', '簡化', '統一'];

/** 從變更條目文字推導前綴；判斷不出來時算「調整」。 */
export function resolveChangeTag(text: string): ChangeTag {
  const lower = text.toLowerCase();
  if (FIX_HINTS.some((k) => lower.includes(k))) return 'fix';
  if (TUNE_HINTS.some((k) => lower.includes(k))) return 'tune';
  if (['新增', 'add', 'new', '加入'].some((k) => lower.includes(k))) return 'add';
  return 'tune';
}
