/**
 * SceneChoiceParts - 場景選項按鈕群（設定 HUD、控制等）
 * 支援 inline（橫排文字）與 stack（圖示+標籤）兩種佈局
 */

import type React from 'react';

export type SceneChoiceAccent = 'purple' | 'amber' | 'cyan' | 'emerald' | 'violet' | 'blue';

const ACCENT_ACTIVE: Record<SceneChoiceAccent, string> = {
  purple: 'border-[var(--hl-line-strong)] bg-purple-500/15 text-[var(--hl-ink-2)] shadow-[0_0_18px_rgba(168,85,247,0.18)]',
  amber: 'border-[rgba(255,182,39,0.38)] bg-[rgba(255,182,39,0.12)] text-[var(--hl-caution)] shadow-[0_0_18px_rgba(245,158,11,0.18)]',
  cyan: 'border-[rgba(111,168,255,0.38)] bg-[rgba(111,168,255,0.12)] text-[var(--hl-reach)] shadow-[0_0_18px_rgba(34,211,238,0.18)]',
  emerald: 'border-[rgba(56,224,143,0.38)] bg-[rgba(56,224,143,0.12)] text-[var(--hl-vital)] shadow-[0_0_18px_rgba(16,185,129,0.18)]',
  violet: 'border-[var(--hl-line-strong)] bg-violet-500/15 text-[var(--hl-ink-2)] shadow-[0_0_18px_rgba(167,139,250,0.18)]',
  blue: 'border-[rgba(111,168,255,0.38)] bg-[rgba(111,168,255,0.12)] text-[var(--hl-reach)] shadow-[0_0_12px_rgba(59,130,246,0.4)]',
};

const IDLE =
  'border-[var(--hl-line)] bg-[var(--hl-deck-2)] text-[var(--hl-ink-3)] hover:border-[var(--hl-line-strong)] hover:bg-[var(--hl-deck-3)] hover:text-[var(--hl-ink-2)]';

const LAYOUT_BASE = {
  inline:
    'group flex flex-1 items-center justify-center gap-2  border px-3 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-all',
  stack:
    'group flex flex-1 flex-col items-center justify-center gap-1  border px-3 py-2.5 transition-all',
} as const;

/** 供特殊佈局（如 9 宮格）直接取 class */
export function sceneChoiceClass(
  active: boolean,
  accent: SceneChoiceAccent,
  layout: 'inline' | 'stack' = 'inline',
): string {
  return `${LAYOUT_BASE[layout]} ${active ? ACCENT_ACTIVE[accent] : IDLE}`;
}

export interface SceneChoiceRowProps {
  children: React.ReactNode;
  className?: string;
}

export function SceneChoiceRow({ children, className = '' }: SceneChoiceRowProps) {
  return <div className={`flex w-full flex-wrap gap-2 ${className}`}>{children}</div>;
}

export interface SceneChoiceButtonProps {
  active: boolean;
  accent?: SceneChoiceAccent;
  layout?: 'inline' | 'stack';
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  title?: string;
  type?: 'button' | 'submit' | 'reset';
}

export function SceneChoiceButton({
  active,
  accent = 'purple',
  layout = 'inline',
  onClick,
  children,
  className = '',
  title,
  type = 'button',
}: SceneChoiceButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      title={title}
      className={`${sceneChoiceClass(active, accent, layout)} ${className}`}
    >
      {children}
    </button>
  );
}
