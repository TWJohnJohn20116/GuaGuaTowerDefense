/**
 * 設定 - 區段群組元件（HARDLINE）
 *
 * 區段＝一個 Deck：上面一行 mono 標籤 + 結構線，下面是設定列串。
 * 不再有彩色光條、不再有彩虹徽章；強調色只有訊號色一種。
 */

import type { ReactNode } from 'react';
import { Deck } from '@/components/hl';

export interface SectionGroupProps {
  title: string;
  description?: string;
  icon: ReactNode;
  /** 相容參數：HARDLINE 不再依 accent 上色 */
  accent?: import('./SettingRow').AccentColor;
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
  const colClass =
    columns === 1
      ? 'grid-cols-1'
      : columns === 2
        ? 'grid-cols-1 lg:grid-cols-2'
        : columns === 3
          ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
          : 'grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3';

  return (
    <section className="flex flex-col">
      {/* 區段頭：mono 標籤 + 延伸線 */}
      <header className="flex items-center gap-2.5 pb-2">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center text-[var(--arc-ink-3)]">
          {icon}
        </span>
        <span className="arc-label whitespace-nowrap text-[var(--arc-ink-2)]">{title}</span>

        {badge && (
          <span className="rounded-sm border border-[var(--arc-gold-edge)] px-1.5 py-0.5 font-mono text-[10px] uppercase leading-none tracking-[0.1em] text-[var(--arc-gold)]">
            {badge}
          </span>
        )}
        {typeof count === 'number' && (
          <span className="font-mono text-[10px] tabular-nums leading-none text-[var(--arc-ink-4)]">
            {String(count).padStart(2, '0')}
          </span>
        )}

        <span className="arc-divider flex-1" />

        {action && <span className="flex shrink-0 items-center gap-2">{action}</span>}
      </header>

      {description && (
        <p className="pb-2 text-[11px] leading-relaxed text-[var(--arc-ink-3)]">{description}</p>
      )}

      <Deck notch className="overflow-hidden">
        <div className={`grid ${colClass} gap-0`}>{children}</div>
      </Deck>
    </section>
  );
}

export default SectionGroup;
