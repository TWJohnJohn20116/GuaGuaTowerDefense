/**
 * SceneShell — HARDLINE 場景殼
 *
 * 全畫面底色 #06070A，細格線，沒有粒子、沒有光暈、沒有整頁換皮。
 * accent 參數保留給舊呼叫端；HARDLINE 只有一種強調色，因此不再改變配色。
 */

import type React from 'react';
import { BackKey } from '@/components/hl';

export type SceneAccent = 'default' | 'success' | 'danger' | 'info' | 'warning' | 'purple' | 'pink';

export interface SceneShellProps {
  accent?: SceneAccent;
  children: React.ReactNode;
  scrollable?: boolean;
  className?: string;
  showGrid?: boolean;
  /** 相容參數；HARDLINE 不畫粒子 */
  showParticles?: boolean;
  particleCount?: number;
}

export function SceneShell({
  children,
  scrollable = true,
  className = '',
  showGrid = true,
  showParticles = false,
}: SceneShellProps) {
  void showParticles;

  return (
    <div className={`relative h-full w-full overflow-hidden bg-[var(--hl-void)] text-[var(--hl-ink)] ${className}`}>
      {/* 結構格：48px 細線，安靜但看得出來這是張面板 */}
      {showGrid && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(236,239,242,0.022) 1px, transparent 1px), linear-gradient(to bottom, rgba(236,239,242,0.022) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      )}

      {scrollable ? (
        <div className="relative z-10 h-full w-full overflow-y-auto">{children}</div>
      ) : (
        <div className="relative z-10 h-full w-full">{children}</div>
      )}
    </div>
  );
}

interface SceneShellHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  accent?: SceneAccent;
  showBack?: boolean;
  backTo?: import('@/types/game').GameScene;
  backLabel?: string;
  onBack?: () => void;
  right?: React.ReactNode;
  className?: string;
}

function SceneShellHeader({
  title,
  subtitle,
  icon,
  showBack = true,
  backTo,
  backLabel,
  onBack,
  right,
  className = '',
}: SceneShellHeaderProps) {
  return (
    <header
      className={`sticky top-0 z-30 flex h-[52px] shrink-0 items-center gap-3 border-b border-[var(--hl-line)] bg-[var(--hl-void)] px-4 ${className}`}
    >
      {showBack && <BackKey to={backTo} onClick={onBack} label={backLabel} />}

      {icon && (
        <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-[var(--hl-line)] text-[var(--hl-ink-2)]">
          {icon}
        </span>
      )}

      <div className="flex min-w-0 flex-col justify-center">
        <span className="truncate text-[15px] font-semibold leading-tight tracking-[-0.01em] text-[var(--hl-ink)]">
          {title}
        </span>
        {subtitle && (
          <span className="truncate font-mono text-[9.5px] uppercase tracking-[0.14em] text-[var(--hl-ink-4)]">
            {subtitle}
          </span>
        )}
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2">{right}</div>
    </header>
  );
}

interface SceneShellBodyProps {
  children: React.ReactNode;
  maxWidth?: string;
  className?: string;
}

function SceneShellBody({ children, maxWidth = 'max-w-6xl', className = '' }: SceneShellBodyProps) {
  return (
    <main className={`relative z-10 px-5 pb-12 pt-5 sm:px-7 ${className}`}>
      <div className={`mx-auto ${maxWidth} flex flex-col gap-5`}>{children}</div>
    </main>
  );
}

SceneShell.Header = SceneShellHeader;
SceneShell.Body = SceneShellBody;

export default SceneShell;
