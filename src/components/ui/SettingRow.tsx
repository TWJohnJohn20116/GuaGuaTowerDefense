/**
 * 設定 · 通用列（CANDY POP）
 *
 * 一列一句話：左邊圖示章、中間標籤／說明、右邊控件。
 * 行高固定、說明單行截斷；hover 只換底色，不加位移與陰影，避免整頁列在閃。
 */

import type { ReactNode } from 'react';

export type AccentColor = 'blue' | 'purple' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'indigo' | 'slate';

export interface SettingRowProps {
  icon: ReactNode;
  label: string;
  description?: string;
  control: ReactNode;
  /** 相容參數：全站只有一種強調色，不依 accent 換色 */
  accent?: AccentColor;
  /** 帶 footer（滑桿）的列：上方列高放寬，footer 對齊標籤左緣 */
  expanded?: boolean;
  /** 列下方額外內容（如滑桿、子按鈕） */
  footer?: ReactNode;
}

export function SettingRow({
  icon,
  label,
  description,
  control,
  accent = 'slate',
  expanded = false,
  footer,
}: SettingRowProps) {
  void accent;

  return (
    <div className="group border-b border-[var(--cn-line-soft)] transition-colors duration-150 last:border-b-0 hover:bg-[var(--cn-card-2)]">
      <div className={`flex items-center gap-3 px-3.5 ${expanded ? 'py-3' : 'min-h-[54px] py-2.5'}`}>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] border-2 border-[var(--cn-line-soft)] bg-[var(--cn-card-2)] text-[var(--cn-ink-3)] transition-colors duration-150 group-hover:border-[var(--cn-line-mid)] group-hover:text-[var(--cn-ink-2)]">
          {icon}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-extrabold leading-tight text-[var(--cn-ink)]">
            {label}
          </span>
          {description && (
            <span className="mt-0.5 block truncate text-[11px] font-semibold leading-tight text-[var(--cn-ink-3)]">
              {description}
            </span>
          )}
        </span>

        <span className="flex shrink-0 items-center justify-end gap-2">{control}</span>
      </div>

      {footer && <div className="pb-3 pl-[calc(0.875rem+2rem+0.75rem)] pr-3.5">{footer}</div>}
    </div>
  );
}

export default SettingRow;
