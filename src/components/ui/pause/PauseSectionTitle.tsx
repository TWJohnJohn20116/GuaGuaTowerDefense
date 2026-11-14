/**
 * 暫停區塊標題 · 分頁 Tab 用
 */

import type { ReactNode } from 'react';

interface PauseSectionTitleProps {
 children: ReactNode;
 className?: string;
}

export function PauseSectionTitle({ children, className = '' }: PauseSectionTitleProps) {
 return (
 <div className={`flex items-center gap-2.5 ${className}`}>
 <span className="hl-label whitespace-nowrap">{children}</span>
 <span className="h-px flex-1 bg-[var(--hl-line)]" />
 </div>
 );
}

export default PauseSectionTitle;
