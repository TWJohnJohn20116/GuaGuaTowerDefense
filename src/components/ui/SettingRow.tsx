/**
 * 設定 - 通用列元件（HARDLINE）
 *
 * 一列一句話：左圖示框、中間標籤／說明、右邊控件。
 * 方角、1px 線、統一行高；hover 只換底色，不加光暈、不加位移。
 * 控件由呼叫端決定（開關 / 滑桿 / 下拉 / 輸入），外觀一律方角。
 */

import type { ReactNode } from 'react';

export type AccentColor = 'blue' | 'purple' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'indigo' | 'slate';

export interface SettingRowProps {
  icon: ReactNode;
  label: string;
  description?: string;
  control: ReactNode;
  /** 相容參數；HARDLINE 只有一種強調色，不再依 accent 換色 */
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
  // accent 只為相容保留，不參與渲染
  void accent;

  return (
    <div className="group border-b border-[var(--hl-line)] transition-colors duration-150 last:border-b-0 hover:bg-[var(--hl-deck-2)]">
      <div className={`flex items-center gap-3 px-4 ${expanded ? 'py-3' : 'h-[52px]'}`}>
        {/* 圖示框：28px 方框，hover 才亮 */}
        <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-[var(--hl-line)] text-[var(--hl-ink-3)] transition-colors duration-150 group-hover:border-[var(--hl-line-hot)] group-hover:text-[var(--hl-ink-2)]">
          {icon}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-medium leading-tight text-[var(--hl-ink)]">
            {label}
          </span>
          {description && (
            <span className="mt-0.5 block truncate text-[10.5px] leading-tight text-[var(--hl-ink-3)]">
              {description}
            </span>
          )}
        </span>

        <span className="flex shrink-0 items-center justify-end gap-2">{control}</span>
      </div>

      {footer && <div className="px-[calc(1rem+1.75rem+0.75rem)] pb-3">{footer}</div>}
    </div>
  );
}

export default SettingRow;
