/**
 * 暫停選單 · 區段外框（HARDLINE：mono 標籤 + 一路延伸的結構線）
 */

import type { ReactNode } from 'react';
import { Deck, SegHead } from '@/components/hl';

interface PauseSectionShellProps {
  title: string;
  icon?: ReactNode;
  /** 舊 API 相容：HARDLINE 只有一種強調色，accent 不再影響外觀 */
  accent?: string;
  description?: string;
  action?: ReactNode;
  /** 右側計數（筆數、項目數） */
  count?: number;
  children: ReactNode;
}

export function PauseSectionShell({
  title,
  icon,
  description,
  action,
  count,
  children,
}: PauseSectionShellProps) {
  return (
    <Deck as="section" className="p-2.5">
      <SegHead
        label={
          <span className="flex items-center gap-1.5">
            {icon && <span className="flex h-3.5 w-3.5 items-center justify-center text-[var(--arc-ink-3)]">{icon}</span>}
            {title}
            {typeof count === 'number' && (
              <span className="font-mono text-[9.5px] tabular-nums text-[var(--arc-ink-4)]">×{count}</span>
            )}
          </span>
        }
        right={action}
      />
      {description && <p className="mt-1.5 text-[10.5px] leading-snug text-[var(--arc-ink-3)]">{description}</p>}
      <div className="mt-2 space-y-2">{children}</div>
    </Deck>
  );
}

export default PauseSectionShell;
