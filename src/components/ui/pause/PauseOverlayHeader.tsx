/**
 * 暫停選單頂列 — HARDLINE：mono 小標 + 17px 標題 + 右側儀表格
 */

import type { ReactNode } from 'react';
import { PauseIcon } from '@/components/ui/Icons';

interface PauseOverlayHeaderProps {
  title: string;
  subtitle: string;
  right?: ReactNode;
}

export function PauseOverlayHeader({ title, subtitle, right }: PauseOverlayHeaderProps) {
  return (
    <div className="flex h-[52px] shrink-0 items-center justify-between gap-3 border-b border-[var(--hl-line)] px-4">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-[var(--hl-line)] text-[var(--hl-signal)]">
          <PauseIcon className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0">
          <div className="hl-label truncate">{subtitle}</div>
          <h2 className="mt-1 truncate text-[17px] font-semibold leading-none text-[var(--hl-ink)]">{title}</h2>
        </div>
      </div>
      {right}
    </div>
  );
}

export default PauseOverlayHeader;
