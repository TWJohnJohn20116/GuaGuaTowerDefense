/**
 * SceneSidebarNav — 場景側欄導航（HARDLINE）
 *
 * 選中只有一種標記：左緣 2px 訊號條。
 * 不做滑動高亮、不做彩色 icon 底、不做圓角。
 */

import type React from 'react';
import { playUiHover } from '@/services/audioService';

export interface SceneSidebarNavItem {
  id: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  icon: React.ReactNode;
  /** 相容參數：HARDLINE 只有一種強調色 */
  accent?: string;
}

export interface SceneSidebarNavProps {
  items: SceneSidebarNavItem[];
  activeId: string;
  onSelect: (id: string) => void;
  /** 相容參數：不再有滑動高亮 */
  layoutId?: string;
  variant?: 'bar' | 'tint';
  /** 相容參數 */
  tintAccent?: 'violet' | 'amber' | 'emerald' | 'cyan';
  className?: string;
  footer?: React.ReactNode;
  header?: React.ReactNode;
}

export interface SceneSidebarNavButtonProps {
  item: SceneSidebarNavItem;
  active: boolean;
  onClick: () => void;
  layoutId?: string;
  variant?: 'bar' | 'tint';
  tintAccent?: SceneSidebarNavProps['tintAccent'];
  className?: string;
  children?: React.ReactNode;
}

export function SceneSidebarNavButton({
  item,
  active,
  onClick,
  className = '',
  children,
}: SceneSidebarNavButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => playUiHover()}
      className={[
        'group relative flex w-full items-center gap-2.5 border-b border-[var(--cn-line-soft)] px-3 py-2.5 text-left',
        'transition-colors duration-150 hover:bg-[var(--arc-deck-2)]',
        active ? 'bg-[var(--arc-deck-2)]' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* 左緣訊號條：選中唯一標記 */}
      <span
        className={[
          'absolute left-0 top-0 h-full w-[2px] transition-colors duration-150',
          active ? 'bg-[var(--arc-gold)]' : 'bg-transparent',
        ].join(' ')}
      />

      <span
        className={[
          'flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border transition-colors duration-150',
          active
            ? 'border-[var(--arc-gold-edge)] text-[var(--arc-gold)]'
            : 'border-[var(--cn-line-soft)] text-[var(--arc-ink-3)] group-hover:border-[var(--arc-line-hot)] group-hover:text-[var(--arc-ink-2)]',
        ].join(' ')}
      >
        {item.icon}
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={[
            'block truncate text-[12.5px]',
            active ? 'font-semibold text-[var(--arc-ink)]' : 'text-[var(--arc-ink-2)]',
          ].join(' ')}
        >
          {item.label}
        </span>
        {item.description != null && (
          <span className="mt-0.5 block truncate font-mono text-[9.5px] leading-none text-[var(--arc-ink-4)]">
            {item.description}
          </span>
        )}
      </span>

      {children}
    </button>
  );
}

export function SceneSidebarNav({
  items,
  activeId,
  onSelect,
  className = '',
  footer,
  header,
}: SceneSidebarNavProps) {
  return (
    <div className={`flex flex-col ${className}`}>
      {header}
      {items.map((item) => (
        <SceneSidebarNavButton
          key={item.id}
          item={item}
          active={activeId === item.id}
          onClick={() => onSelect(item.id)}
        />
      ))}
      {footer}
    </div>
  );
}

export interface SceneSectionBannerProps {
  icon: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** 相容參數：HARDLINE 不使用分類色 */
  accent?: string;
  className?: string;
}

/** 右側內容區分類列：mono 標籤 + 標題，只有 1px 底線 */
export function SceneSectionBanner({
  icon,
  title,
  subtitle,
  className = '',
}: SceneSectionBannerProps) {
  return (
    <div
      className={`flex items-center gap-3 border-b border-[var(--cn-line-soft)] px-5 py-3 ${className}`}
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center border-[3px] border-[var(--cn-line-soft)] text-[var(--arc-ink-2)]">
        {icon}
      </span>
      <div className="min-w-0">
        <div className="arc-title truncate text-[15px] font-semibold leading-tight text-[var(--arc-ink)]">
          {title}
        </div>
        {subtitle != null && (
          <div className="mt-0.5 truncate font-mono text-[9.5px] uppercase tracking-[0.12em] text-[var(--arc-ink-4)]">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}
