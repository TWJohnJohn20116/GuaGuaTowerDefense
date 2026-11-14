/**
 * HARDLINE · 資料顯示
 *
 * 數值一律等寬，標籤一律 mono。計量條是方塊拼接的線，不是圓角膠囊。
 */
import type React from 'react';

type Tone = 'signal' | 'vital' | 'alarm' | 'caution' | 'reach' | 'ink';

const BAR: Record<Tone, string> = {
  signal: 'bg-[var(--hl-signal)]',
  vital: 'bg-[var(--hl-vital)]',
  alarm: 'bg-[var(--hl-alarm)]',
  caution: 'bg-[var(--hl-caution)]',
  reach: 'bg-[var(--hl-reach)]',
  ink: 'bg-[var(--hl-ink-2)]',
};

/** 單一計量條 */
export function Meter({
  value,
  max = 1,
  tone = 'signal',
  showTrack = true,
  className = '',
}: {
  value: number;
  max?: number;
  tone?: Tone;
  showTrack?: boolean;
  className?: string;
}) {
  const pct = max <= 0 ? 0 : Math.max(0, Math.min(1, value / max));
  return (
    <div
      className={[
        'relative h-1.5 w-full overflow-hidden',
        showTrack ? 'border border-[var(--hl-line)] bg-[var(--hl-void-2)]' : 'bg-transparent',
        className,
      ].join(' ')}
    >
      <span
        className={`block h-full transition-[width] duration-300 ease-out ${BAR[tone]}`}
        style={{ width: `${pct * 100}%` }}
      />
    </div>
  );
}

/**
 * 分段計量條：塔防的波次、星等、難度用。
 * 每一格是獨立方塊，比連續條更符合這個系統。
 */
export function Segments({
  total,
  filled,
  tone = 'signal',
  size = 'md',
  className = '',
}: {
  total: number;
  filled: number;
  tone?: Tone;
  size?: 'sm' | 'md';
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={[
            'block',
            size === 'sm' ? 'h-1 w-3' : 'h-2 w-4',
            i < filled ? BAR[tone] : 'bg-[var(--hl-line)]',
          ].join(' ')}
        />
      ))}
    </div>
  );
}

/** 數值 + 單位的行內組合，表格與檢視欄位都用這個 */
export function Num({
  value,
  unit,
  tone = 'ink',
  size = 'md',
}: {
  value: React.ReactNode;
  unit?: string;
  tone?: Tone | 'muted';
  size?: 'sm' | 'md' | 'lg';
}) {
  const color =
    tone === 'muted'
      ? 'text-[var(--hl-ink-3)]'
      : tone === 'signal'
        ? 'text-[var(--hl-signal)]'
        : tone === 'vital'
          ? 'text-[var(--hl-vital)]'
          : tone === 'alarm'
            ? 'text-[var(--hl-alarm)]'
            : tone === 'caution'
              ? 'text-[var(--hl-caution)]'
              : tone === 'reach'
                ? 'text-[var(--hl-reach)]'
                : 'text-[var(--hl-ink)]';

  const sz = size === 'lg' ? 'text-[22px]' : size === 'sm' ? 'text-[11px]' : 'text-[13.5px]';

  return (
    <span className={`font-mono tabular-nums font-semibold leading-none ${sz} ${color}`}>
      {value}
      {unit && <span className="ml-0.5 text-[9.5px] font-normal text-[var(--hl-ink-3)]">{unit}</span>}
    </span>
  );
}

/** 標籤 + 值的欄位列：設定、詳情、檢視全部共用 */
export function Field({
  label,
  children,
  hint,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
  hint?: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-[var(--hl-line)] py-2 last:border-b-0">
      <div className="min-w-0">
        <div className="hl-label">{label}</div>
        {hint && <div className="mt-1 text-[10.5px] leading-snug text-[var(--hl-ink-3)]">{hint}</div>}
      </div>
      <div className="shrink-0 text-right">{children}</div>
    </div>
  );
}

/** 狀態點：方塊，不是圓點 */
export function Dot({ tone = 'signal', pulse = false }: { tone?: Tone; pulse?: boolean }) {
  return (
    <span
      className={[
        'inline-block h-1.5 w-1.5',
        BAR[tone],
        pulse ? 'animate-pulse' : '',
      ].join(' ')}
    />
  );
}
