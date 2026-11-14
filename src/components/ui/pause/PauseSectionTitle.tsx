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
 <span className="arc-label whitespace-nowrap">{children}</span>
 <hr className="arc-divider flex-1" />
 </div>
 );
}

export default PauseSectionTitle;
