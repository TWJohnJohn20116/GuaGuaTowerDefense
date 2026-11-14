/**
 * 設定 · 區段卡（CANDY POP）
 *
 * 一個區段＝一張白卡：頂部是圖示章＋標題＋說明（含筆數），下面是設定列。
 * 區段之間靠卡片邊界分開，不再用細線串成一大張表——否則整頁讀起來像試算表。
 */

import type { ReactNode } from 'react';

export interface SectionGroupProps {
  title: string;
  description?: string;
  icon: ReactNode;
  /** 相容參數：分類已顯示在左側導覽，區段頭不再重複貼標籤 */
  accent?: import('./SettingRow').AccentColor;
  /** 相容參數：同上，區段頭不重複顯示分類 */
  badge?: string;
  count?: number;
  children: ReactNode;
  action?: ReactNode;
  /** 內容欄位數量：1=單欄、2=雙欄、3=三欄 */
  columns?: 1 | 2 | 3;
}

export function SectionGroup({
  title,
  description,
  icon,
  badge,
  count,
  children,
  action,
  columns,
}: SectionGroupProps) {
  void badge;

  const colClass =
    columns === 1
      ? 'grid-cols-1'
      : columns === 2
        ? 'grid-cols-1 lg:grid-cols-2'
        : columns === 3
          ? 'grid-cols-1 md:grid-cols-2 2xl:grid-cols-3'
          : 'grid-cols-1 lg:grid-cols-2';

  return (
    <section className="arc-panel overflow-hidden">
      <header className="flex items-center gap-3 border-b-[3px] border-[var(--cn-line-soft)] bg-[var(--cn-card-2)] px-3.5 py-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border-2 border-[var(--cn-line)] bg-[var(--cn-card)] text-[var(--cn-ink)]">
          {icon}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="arc-title truncate text-[15px]">{title}</h3>
            {typeof count === 'number' && (
              <span className="shrink-0 rounded-full border-2 border-[var(--cn-line-soft)] bg-[var(--cn-card)] px-1.5 font-mono text-[10px] font-extrabold tabular-nums text-[var(--cn-ink-3)]">
                {count}
              </span>
            )}
          </div>
          {description && (
            <p className="mt-0.5 truncate text-[11.5px] font-semibold leading-snug text-[var(--cn-ink-3)]">
              {description}
            </p>
          )}
        </div>

        {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
      </header>

      <div className={`grid ${colClass}`}>{children}</div>
    </section>
  );
}

export default SectionGroup;
