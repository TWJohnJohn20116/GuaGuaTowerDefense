/**
 * SceneBrowseParts — 場景工具列零件（HARDLINE）
 *
 * 篩選 chip＝方框 mono；選中＝訊號底訊號字，其餘只有 1px 線。
 * 進度條＝方塊拼接的線，thumb 不存在。
 */

import type React from 'react';

export type SceneFilterAccent =
  | 'yellow'
  | 'violet'
  | 'purple'
  | 'emerald'
  | 'sky'
  | 'amber'
  | 'cyan'
  | 'rose';

const CHIP_ON = 'border-[var(--arc-gold)] bg-[var(--arc-gold)] font-semibold text-[var(--arc-gold-ink)]';
const CHIP_OFF =
  'border-[var(--cn-line-soft)] bg-transparent text-[var(--arc-ink-2)] hover:border-[var(--arc-line-hot)] hover:text-[var(--arc-ink)]';

const BAR_FILL = 'bg-[var(--arc-gold)]';

export interface SceneFilterChipProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  /** 相容參數：HARDLINE 只有一種強調色 */
  accent?: SceneFilterAccent;
  size?: 'md' | 'sm';
  disabled?: boolean;
  className?: string;
}

export function SceneFilterChip({
  active,
  onClick,
  children,
  accent = 'violet',
  size = 'md',
  disabled = false,
  className = '',
}: SceneFilterChipProps) {
  void accent;

  const sizeClass = size === 'md' ? 'h-7 px-2.5 text-[11px]' : 'h-6 px-2 text-[10px]';

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        'arc-chip inline-flex items-center gap-1 font-mono transition-colors duration-150',
        'border',
        sizeClass,
        active ? CHIP_ON : CHIP_OFF,
        disabled ? 'pointer-events-none opacity-35' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </button>
  );
}

export interface SceneFilterChipCountProps {
  count: number | string;
  active: boolean;
  accent?: SceneFilterAccent;
}

/** 篩選 chip 右側數量（可選） */
export function SceneFilterChipCount({ count, active }: SceneFilterChipCountProps) {
  return (
    <span
      className={`ml-1.5 font-mono text-[10px] tabular-nums ${
        active ? 'text-[var(--arc-gold-ink)]' : 'text-[var(--arc-ink-4)]'
      }`}
    >
      {count}
    </span>
  );
}

export interface SceneProgressBarProps {
  /** 0–100 */
  value: number;
  /** 右側文字，例如 3/10 */
  label: React.ReactNode;
  accent?: SceneFilterAccent;
  className?: string;
  minWidthClass?: string;
}

/** 工具列右側進度條 + 數值標籤 */
export function SceneProgressBar({
  value,
  label,
  className = '',
  minWidthClass = 'min-w-[160px]',
}: SceneProgressBarProps) {
  const pct = Math.max(0, Math.min(100, value));

  return (
    <div className={`flex ${minWidthClass} items-center gap-2.5 ${className}`}>
      <div className="h-1.5 flex-1 overflow-hidden rounded-sm border-[3px] border-[var(--cn-line-soft)] bg-[var(--arc-void-2)]">
        <div
          className={`h-full ${BAR_FILL} transition-[width] duration-300 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="whitespace-nowrap font-mono text-[10px] tabular-nums text-[var(--arc-ink-2)]">
        {label}
      </span>
    </div>
  );
}

export { BAR_FILL as SCENE_PROGRESS_BAR_FILL };

export interface SceneCategoryChipProps {
  label: string;
  sub: string;
  active: boolean;
  onClick: () => void;
  accent?: 'violet' | 'amber';
  icon?: React.ReactNode;
  className?: string;
}

/** 分類導航 chip（雙行：標題 + 進度，可選圖示） */
export function SceneCategoryChip({
  label,
  sub,
  active,
  onClick,
  icon,
  className = '',
}: SceneCategoryChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'arc-chip flex shrink-0 items-center gap-2 border px-2.5 py-1.5 text-left transition-colors duration-150',
        active ? CHIP_ON : CHIP_OFF,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {icon}
      <span className="flex flex-col">
        <span className="font-mono text-[10px] uppercase leading-none tracking-[0.08em]">{label}</span>
        <span
          className={`mt-1 font-mono text-[9.5px] leading-none tabular-nums ${
            active ? 'text-[var(--arc-gold-ink)]' : 'text-[var(--arc-ink-4)]'
          }`}
        >
          {sub}
        </span>
      </span>
    </button>
  );
}

export interface SceneBrowseEmptyStateProps {
  icon: React.ReactNode;
  message: React.ReactNode;
  /** scroll：網格捲動區大空狀態；panel：虛線框 compact；inline：列表內嵌 */
  variant?: 'scroll' | 'panel' | 'inline';
  actionLabel?: string;
  onAction?: () => void;
  /** ghost 清除篩選；cyan 主要操作（匯入等） */
  actionTone?: 'ghost' | 'cyan';
  className?: string;
}

const ACTION_TONE: Record<'ghost' | 'cyan', string> = {
  ghost:
    'arc-btn arc-btn--ghost px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--arc-ink-2)] transition-colors hover:text-[var(--arc-ink)]',
  cyan:
    'arc-btn arc-btn--cyan px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] font-semibold',
};

/** 瀏覽網格 / 列表 · 統一空狀態 */
export function SceneBrowseEmptyState({
  icon,
  message,
  variant = 'scroll',
  actionLabel,
  onAction,
  actionTone = 'ghost',
  className = '',
}: SceneBrowseEmptyStateProps) {
  const action =
    actionLabel && onAction ? (
      <button type="button" onClick={onAction} className={ACTION_TONE[actionTone]}>
        {actionLabel}
      </button>
    ) : null;

  if (variant === 'panel') {
    return (
      <div
        className={`flex h-32 items-center justify-center border border-dashed border-[var(--cn-line-soft)] bg-[var(--arc-void-2)] ${className}`}
      >
        <div className="flex flex-col items-center gap-2 px-4 text-center">
          {icon}
          <span className="arc-label">{message}</span>
          {action}
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`flex flex-col items-center justify-center gap-3 py-16 text-center ${className}`}>
        {icon}
        <p className="text-[11px] text-[var(--arc-ink-3)]">{message}</p>
        {action}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 border border-dashed border-[var(--cn-line-soft)] py-16 text-center ${className}`}
    >
      {icon}
      <p className="arc-label">{message}</p>
      {action}
    </div>
  );
}

export default SceneFilterChip;
