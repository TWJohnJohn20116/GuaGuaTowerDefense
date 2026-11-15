/**
 * CANDY POP · 版面
 *
 * 頂列是白色厚卡，底緣一條 3px 墨線；側欄是同一張卡片，選中的列是一顆圓角膠囊。
 * 不使用掃描線、不使用發光。
 */
import type React from 'react';
import { IconBtn } from './controls';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/ui/Icons';
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/i18n';
import { playUiHover } from '@/services/audioService';
import type { GameScene } from '@/types/game';

/* --------------------------------------------------------------- BackKey */

export function BackKey({
  to,
  onClick,
  label,
  className = '',
}: {
  to?: GameScene;
  onClick?: () => void;
  label?: string;
  className?: string;
}) {
  const { t } = useTranslation();
  const setScene = useGameStore((s) => s.setScene);
  const goBackScene = useGameStore((s) => s.goBackScene);

  return (
    <button
      type="button"
      aria-label={label || t.common.back}
      onMouseEnter={() => playUiHover()}
      onClick={() => {
        if (onClick) return onClick();
        if (to) return setScene(to);
        goBackScene();
      }}
      className={`arc-btn h-10 gap-1.5 px-4 text-[13px] ${className}`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M15 5 8 12l7 7" />
      </svg>
      <span className="text-[12px] font-extrabold">{label || t.common.back}</span>
    </button>
  );
}

/* ---------------------------------------------------------------- TopBar */

interface TopBarProps {
  title: React.ReactNode;
  meta?: React.ReactNode;
  back?: { to?: GameScene; onClick?: () => void; label?: string } | false;
  right?: React.ReactNode;
  glyph?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export function TopBar({
  title,
  meta,
  back = {},
  right,
  glyph,
  className = '',
  children,
}: TopBarProps) {
  return (
    <header
      className={[
        'relative z-30 flex h-[68px] shrink-0 items-center gap-3 px-4',
        'rounded-[var(--cn-r-lg)] border-[3px] border-[var(--cn-line)] bg-[var(--cn-card)]',
        'shadow-[0_5px_0_-1px_rgba(46,36,64,0.18)]',
        className,
      ].join(' ')}
    >
      {back !== false && <BackKey to={back?.to} onClick={back?.onClick} label={back?.label} />}

      {glyph && (
        <span className="flex h-11 w-11 items-center justify-center rounded-[14px] border-[3px] border-[var(--cn-line)] bg-[var(--cn-sun)] text-[var(--cn-ink)]">
          {glyph}
        </span>
      )}

      <div className="flex min-w-0 flex-col justify-center gap-0.5">
        {meta && (
          <span className="truncate rounded-full bg-[var(--cn-coral-soft)] px-2 py-0.5 text-[10.5px] font-extrabold text-[var(--cn-accent-text)]">
            {meta}
          </span>
        )}
        <span className="arc-title truncate text-[21px] leading-tight">{title}</span>
      </div>

      {children}

      <div className="ml-auto flex shrink-0 items-center gap-2">{right}</div>
    </header>
  );
}

/* ------------------------------------------------------------------ Rail */

/**
 * 側欄。
 *
 * 收合是「可選能力」：只有傳 onToggleCollapsed 的呼叫端才會出現切換鍵，
 * 其餘場景（成就、百科、商店…）行為完全不變。收合後寬度收到 76px，
 * 只留序號圓點；文字改用 aria-label／title，鍵盤與螢幕閱讀器仍讀得到。
 */
export function Rail({
  children,
  label,
  foot,
  className = '',
  collapsed = false,
  onToggleCollapsed,
  collapseLabel,
  expandLabel,
}: {
  children: React.ReactNode;
  label?: React.ReactNode;
  foot?: React.ReactNode;
  className?: string;
  collapsed?: boolean;
  /** 有傳才會出現收合鍵；不傳＝固定寬度（既有場景的行為） */
  onToggleCollapsed?: () => void;
  collapseLabel?: string;
  expandLabel?: string;
}) {
  return (
    <nav
      className={[
        'flex shrink-0 flex-col gap-1 rounded-[var(--cn-r-lg)]',
        'border-[3px] border-[var(--cn-line)] bg-[var(--cn-card)] p-2',
        'shadow-[0_5px_0_-1px_rgba(46,36,64,0.18)]',
        'transition-[width] duration-200 ease-out',
        collapsed ? 'w-[76px]' : 'w-[236px]',
        className,
      ].join(' ')}
    >
      {collapsed && onToggleCollapsed ? (
        // 收合時切換鍵要「長得像這條側欄裡的一個控制項」：與 RailItem 同一組圓角與 3px 線，
        // 否則一顆孤立的小箭頭會像是掉在側欄頂端的雜物（實機回報過）
        <button
          type="button"
          aria-label={expandLabel ?? ''}
          title={expandLabel ?? ''}
          onClick={onToggleCollapsed}
          className={[
            'mb-1 flex h-9 w-full shrink-0 items-center justify-center rounded-[14px]',
            'border-[3px] border-[var(--cn-line-soft)] bg-[var(--cn-card-2)] text-[var(--cn-ink-3)]',
            'transition-[border-color,color,background-color] duration-[160ms]',
            'hover:border-[var(--cn-line)] hover:bg-[var(--cn-card)] hover:text-[var(--cn-ink)]',
          ].join(' ')}
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      ) : (
        (label || onToggleCollapsed) && (
          <div className="flex items-center gap-1 pb-1 pl-2.5 pr-0.5 pt-1.5">
            {label && <span className="arc-label min-w-0 flex-1 truncate">{label}</span>}
            {onToggleCollapsed && (
              <IconBtn label={collapseLabel ?? ''} className="h-6 w-6 shrink-0" onClick={onToggleCollapsed}>
                <ChevronLeftIcon className="h-3.5 w-3.5" />
              </IconBtn>
            )}
          </div>
        )
      )}
      <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">{children}</div>
      {foot && !collapsed && <div className="border-t-[3px] border-[var(--cn-line-soft)] p-2 pt-2.5">{foot}</div>}
    </nav>
  );
}

export function RailItem({
  index,
  icon,
  label,
  active = false,
  onClick,
  right,
  compact = false,
}: {
  index?: string | number;
  /** 收合時圓圈改顯示圖示：只留序號沒人猜得出是哪一頁 */
  icon?: React.ReactNode;
  label: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  right?: React.ReactNode;
  /** 側欄收合時只留序號圓點；文字轉成 title／aria-label */
  compact?: boolean;
}) {
  const text = compact && typeof label === 'string' ? label : undefined;
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => playUiHover()}
      aria-label={text}
      title={text}
      className={[
        'group relative flex items-center gap-2.5 rounded-[14px] border-[3px] py-2.5 text-left',
        'transition-[background-color,border-color,transform] duration-[160ms]',
        compact ? 'justify-center px-0' : 'px-2.5',
        active
          ? 'border-[var(--cn-line)] bg-[var(--cn-sun-soft)] shadow-[0_3px_0_var(--cn-sun-deep)]'
          : 'border-transparent bg-transparent hover:border-[var(--cn-line-soft)] hover:bg-[var(--cn-card-2)]',
      ].join(' ')}
    >
      {index !== undefined && (
        <span
          className={[
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-extrabold',
            active
              ? 'border-[var(--cn-line)] bg-[var(--cn-sun)] text-[var(--cn-ink)]'
              : 'border-[var(--cn-line-soft)] bg-[var(--cn-card-2)] text-[var(--cn-ink-3)]',
          ].join(' ')}
        >
          {compact && icon ? icon : index}
        </span>
      )}
      {!compact && (
        <span
          className={[
            'min-w-0 flex-1 text-[13.5px] leading-snug line-clamp-2',
            active ? 'font-extrabold text-[var(--cn-ink)]' : 'font-bold text-[var(--cn-ink-2)]',
          ].join(' ')}
        >
          {label}
        </span>
      )}
      {!compact && right}
    </button>
  );
}
