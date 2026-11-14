/**
 * 場景詳情面板 · 共用區塊（HARDLINE）
 *
 * 詳情＝一疊 Deck：標籤 mono 10px、數值 mono tabular-nums、間隔只有 1px 線。
 * 沒有圓角、沒有內陰影、沒有彩色發光。
 */
import type React from 'react';

export interface DetailStatCell {
  label: string;
  value: string;
  /** 資料色（#rrggbb）。不給就用主文字色。 */
  color?: string;
}

export interface DetailTraitTag {
  label: string;
  color: string;
}

const cardBase = 'border border-[var(--hl-line)] bg-[var(--hl-deck)]';

/** 詳情 · 3 欄數值格 */
export function DetailStatGrid({ stats }: { stats: DetailStatCell[] }) {
  return (
    <div className="grid grid-cols-3 gap-0 border border-[var(--hl-line)]">
      {stats.map((s, i) => (
        <div
          key={s.label}
          className={[
            'flex flex-col gap-1.5 px-3 py-2.5 bg-[var(--hl-deck)]',
            i > 0 ? 'border-l border-[var(--hl-line)]' : '',
          ].join(' ')}
        >
          <span className="hl-label truncate">{s.label}</span>
          <span
            className="font-mono text-[13px] font-semibold leading-none tabular-nums"
            style={{ color: s.color ?? 'var(--hl-ink)' }}
          >
            {s.value}
          </span>
        </div>
      ))}
    </div>
  );
}

/** 詳情 · 特性標籤列（只換線色，不上底色） */
export function DetailTraitRow({ traits }: { traits: DetailTraitTag[] }) {
  if (traits.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {traits.map((tr) => (
        <span
          key={tr.label}
          className="border px-1.5 py-1 font-mono text-[9.5px] uppercase leading-none tracking-[0.1em]"
          style={{ color: tr.color, borderColor: `color-mix(in srgb, ${tr.color} 45%, transparent)` }}
        >
          {tr.label}
        </span>
      ))}
    </div>
  );
}

/** 詳情 · 區塊標籤（mono 10px + 圖示） */
export function DetailSectionLabel({
  icon,
  label,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  accent?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-4 w-4 items-center justify-center" style={{ color: accent ?? 'var(--hl-ink-3)' }}>
        {icon}
      </span>
      <span className="hl-label">{label}</span>
    </div>
  );
}

/** 詳情 · 空狀態 */
export function DetailEmptyState({
  icon,
  message,
  hints,
}: {
  icon: React.ReactNode;
  message: React.ReactNode;
  hints?: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center border border-[var(--hl-line)] text-[var(--hl-ink-4)]">
        {icon}
      </div>
      <div className="hl-label">empty</div>
      <div className="max-w-[28ch] text-[11.5px] leading-relaxed text-[var(--hl-ink-3)]">{message}</div>
      {hints}
    </div>
  );
}

/** 詳情 · 小數值格 */
export function DetailMiniStatCell({
  label,
  children,
  valueClassName = 'text-[var(--hl-ink)]',
}: {
  label: React.ReactNode;
  children: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="flex flex-col gap-1 border border-[var(--hl-line)] bg-[var(--hl-deck)] px-2.5 py-2">
      <span className="hl-label truncate">{label}</span>
      <span className={`font-mono text-[12.5px] font-semibold leading-none tabular-nums ${valueClassName}`}>
        {children}
      </span>
    </div>
  );
}

/** 詳情面板 · Hero 頂部 */
export function DetailHeroSection({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-start gap-4 border-b border-[var(--hl-line)] pb-4 ${className}`}>
      {children}
    </div>
  );
}

/** 詳情面板 · 區塊容器 */
export function DetailBlock({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`flex flex-col gap-2.5 ${className}`}>{children}</div>;
}

/** 詳情面板 · 數值格 */
export function DetailCell({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${cardBase} px-3 py-2.5 ${className}`}>{children}</div>
  );
}

/** 詳情 · 內嵌說明塊 */
export function DetailInset({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`${cardBase} bg-[var(--hl-void-2)] px-3 py-2.5 ${className}`}>{children}</div>
  );
}

/** 詳情 · 橫列（圖示 + 內容） */
export function DetailRow({
  children,
  className = '',
  size = 'md',
}: {
  children: React.ReactNode;
  className?: string;
  size?: 'md' | 'sm';
}) {
  return (
    <div
      className={[
        'flex items-center gap-3 border border-[var(--hl-line)] bg-[var(--hl-deck)]',
        size === 'sm' ? 'px-2.5 py-2' : 'px-3 py-2.5',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}

/** 詳情 · 可裁切外殼 */
export function DetailSurface({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`overflow-hidden ${cardBase} ${className}`}>{children}</div>;
}

/** 等寬字徽章（快捷鍵等） */
export function SceneMonoBadge({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center border border-[var(--hl-line)] bg-[var(--hl-void-2)] px-1.5 py-0.5 font-mono text-[10.5px] tabular-nums text-[var(--hl-ink)] ${className}`}
    >
      {children}
    </span>
  );
}
