/**
 * CANDY POP · 版面
 *
 * 頂列是白色厚卡，底緣一條 3px 墨線；側欄是同一張卡片，選中的列是一顆圓角膠囊。
 * 不使用掃描線、不使用發光。
 */
import type React from 'react';
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

export function Rail({
  children,
  label,
  foot,
  className = '',
}: {
  children: React.ReactNode;
  label?: React.ReactNode;
  foot?: React.ReactNode;
  className?: string;
}) {
  return (
    <nav
      className={[
        'flex w-[236px] shrink-0 flex-col gap-1 rounded-[var(--cn-r-lg)]',
        'border-[3px] border-[var(--cn-line)] bg-[var(--cn-card)] p-2',
        'shadow-[0_5px_0_-1px_rgba(46,36,64,0.18)]',
        className,
      ].join(' ')}
    >
      {label && (
        <div className="px-2.5 pb-1 pt-1.5">
          <span className="arc-label">{label}</span>
        </div>
      )}
      <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">{children}</div>
      {foot && <div className="border-t-[3px] border-[var(--cn-line-soft)] p-2 pt-2.5">{foot}</div>}
    </nav>
  );
}

export function RailItem({
  index,
  label,
  active = false,
  onClick,
  right,
}: {
  index?: string | number;
  label: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => playUiHover()}
      className={[
        'group relative flex items-center gap-2.5 rounded-[14px] border-[3px] px-2.5 py-2.5 text-left',
        'transition-[background-color,border-color,transform] duration-[160ms]',
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
          {index}
        </span>
      )}
      <span
        className={[
          'min-w-0 flex-1 text-[13.5px] leading-snug line-clamp-2',
          active ? 'font-extrabold text-[var(--cn-ink)]' : 'font-bold text-[var(--cn-ink-2)]',
        ].join(' ')}
      >
        {label}
      </span>
      {right}
    </button>
  );
}
