/**
 * SceneShell — CANDY POP 場景殼
 *
 * 奶油紙底 + 細點紋；標頭是一張厚卡，不是貼在視窗上緣的深色橫條。
 * accent 參數保留給舊呼叫端（CANDY 用同一組色盤，不再逐場景換色）。
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
  /** 相容參數；CANDY 不畫粒子 */
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
    <div className={`relative h-full w-full overflow-hidden bg-[var(--cn-paper)] text-[var(--cn-ink)] ${className}`}>
      {/* 細點紋：淺色紙張的質感，不是格線 */}
      {showGrid && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(rgba(46,36,64,0.07) 1.2px, transparent 1.2px)',
            backgroundSize: '22px 22px',
          }}
        />
      )}

      {scrollable ? (
        <div className="relative z-10 h-full w-full overflow-y-auto">{children}</div>
      ) : (
        <div className="relative z-10 h-full w-full p-3">{children}</div>
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
      className={`sticky top-0 z-30 mx-3 mt-3 flex h-[70px] shrink-0 items-center gap-3 rounded-[var(--cn-r-lg)] border-[3px] border-[var(--cn-line)] bg-[var(--cn-card)] px-4 shadow-[0_5px_0_-1px_rgba(46,36,64,0.18)] ${className}`}
    >
      {showBack && <BackKey to={backTo} onClick={onBack} label={backLabel} />}

      {icon && (
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border-[3px] border-[var(--cn-line)] bg-[var(--cn-sun)] text-[var(--cn-ink)]">
          {icon}
        </span>
      )}

      <div className="flex min-w-0 flex-col justify-center gap-0.5">
        <span className="arc-title truncate text-[21px] leading-tight">{title}</span>
        {subtitle && (
          <span className="truncate rounded-full bg-[var(--cn-coral-soft)] px-2 py-0.5 text-[10.5px] font-extrabold text-[var(--cn-accent-text)]">
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
    <main className={`relative z-10 px-4 pb-12 pt-4 sm:px-6 ${className}`}>
      <div className={`mx-auto ${maxWidth} flex flex-col gap-4`}>{children}</div>
    </main>
  );
}

SceneShell.Header = SceneShellHeader;
SceneShell.Body = SceneShellBody;

export default SceneShell;
