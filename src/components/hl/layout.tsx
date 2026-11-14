/**
 * HARDLINE · 版面
 *
 * 全專案只有一種頂列、一種側欄。場景不准自己畫箭頭或自己發明頂列高度。
 */
import type React from 'react';
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/i18n';
import { playUiHover } from '@/services/audioService';
import type { GameScene } from '@/types/game';

/* --------------------------------------------------------------- BackKey */

/** 全專案唯二的返回外觀之一：36×36 方塊，chevron。 */
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
      className={[
        'group inline-flex h-9 items-center gap-1.5 border border-[var(--hl-line-strong)] bg-transparent px-2.5',
        'text-[var(--hl-ink-2)] transition-colors duration-150',
        'hover:border-[var(--hl-signal)] hover:text-[var(--hl-signal)]',
        'active:translate-y-px',
        className,
      ].join(' ')}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
        <path d="M15 5 8 12l7 7" />
      </svg>
      <span className="font-mono text-[10px] tracking-[0.12em] uppercase">
        {label || t.common.back}
      </span>
    </button>
  );
}

/* ---------------------------------------------------------------- TopBar */

export interface TopBarProps {
  title: React.ReactNode;
  /** 標題上方的 mono 路徑，例如 "settings / audio" */
  meta?: React.ReactNode;
  back?: { to?: GameScene; onClick?: () => void; label?: string } | false;
  right?: React.ReactNode;
  /** 標題左側的圖示，會放在方框裡 */
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
        'relative z-30 flex h-[52px] shrink-0 items-center gap-3 border-b border-[var(--hl-line)]',
        'bg-[var(--hl-void)] px-4',
        className,
      ].join(' ')}
    >
      {back !== false && <BackKey to={back?.to} onClick={back?.onClick} label={back?.label} />}

      {glyph && (
        <span className="flex h-7 w-7 items-center justify-center border border-[var(--hl-line)] text-[var(--hl-ink-2)]">
          {glyph}
        </span>
      )}

      <div className="flex min-w-0 flex-col justify-center">
        {meta && (
          <span className="truncate font-mono text-[9.5px] tracking-[0.14em] text-[var(--hl-ink-4)] uppercase">
            {meta}
          </span>
        )}
        <span className="truncate text-[15px] font-semibold leading-tight tracking-[-0.01em] text-[var(--hl-ink)]">
          {title}
        </span>
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
        'flex w-[212px] shrink-0 flex-col border-r border-[var(--hl-line)] bg-[var(--hl-deck)]',
        className,
      ].join(' ')}
    >
      {label && (
        <div className="border-b border-[var(--hl-line)] px-3 py-2.5">
          <span className="hl-label">{label}</span>
        </div>
      )}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">{children}</div>
      {foot && <div className="border-t border-[var(--hl-line)] p-2.5">{foot}</div>}
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
        'group relative flex items-center gap-2.5 border-b border-[var(--hl-line)]/60 px-3 py-2.5 text-left',
        'transition-colors duration-150 hover:bg-[var(--hl-deck-2)]',
        active ? 'bg-[var(--hl-deck-2)]' : '',
      ].join(' ')}
    >
      {/* 左緣訊號條：選中唯一的標記 */}
      <span
        className={[
          'absolute left-0 top-0 h-full w-[2px] transition-colors',
          active ? 'bg-[var(--hl-signal)]' : 'bg-transparent',
        ].join(' ')}
      />
      {index !== undefined && (
        <span
          className={[
            'w-[18px] shrink-0 font-mono text-[9.5px] tracking-wider',
            active ? 'text-[var(--hl-signal)]' : 'text-[var(--hl-ink-4)]',
          ].join(' ')}
        >
          {String(index).padStart(2, '0')}
        </span>
      )}
      <span
        className={[
          'min-w-0 flex-1 text-[12.5px] leading-snug line-clamp-2',
          active ? 'font-semibold text-[var(--hl-ink)]' : 'text-[var(--hl-ink-2)]',
        ].join(' ')}
      >
        {label}
      </span>
      {right}
    </button>
  );
}

/* ------------------------------------------------------------- Breadcrumb */

export function Crumbs({ items }: { items: React.ReactNode[] }) {
  return (
    <div className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.1em] text-[var(--hl-ink-4)] uppercase">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-[var(--hl-line-hot)]">/</span>}
          <span className={i === items.length - 1 ? 'text-[var(--hl-ink-2)]' : ''}>{item}</span>
        </span>
      ))}
    </div>
  );
}
