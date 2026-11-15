/**
 * CANDY POP · 資料顯示
 *
 * 數值是深墨色粗等寬（不發光）；計量條是圓頭糖果條，填色用飽和色。
 */
import type React from 'react';

type Tone = 'signal' | 'vital' | 'alarm' | 'caution' | 'reach' | 'ink';

const BAR: Record<Tone, string> = {
  signal: 'bg-[var(--cn-coral)]',
  vital: 'bg-[var(--cn-mint)]',
  alarm: 'bg-[var(--cn-alert)]',
  caution: 'bg-[var(--cn-sun)]',
  reach: 'bg-[var(--cn-grape)]',
  ink: 'bg-[var(--cn-ink-3)]',
};

/** 連續計量條 */
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
        'relative h-3 w-full overflow-hidden rounded-full',
        showTrack
          ? 'border-[3px] border-[var(--cn-line)] bg-[var(--cn-card-2)]'
          : 'bg-transparent',
        className,
      ].join(' ')}
    >
      <span
        className={`block h-full rounded-full transition-[width] duration-300 ease-out ${BAR[tone]}`}
        style={{ width: `${pct * 100}%` }}
      />
    </div>
  );
}

/**
 * 分段計量條：波次、星等、難度
 *
 * fluid 給「格寬會變動」的場合用（例：六格難度卡，每格只有 60–100px）：
 * 點改成 flex-1 等分，不會像固定 12px 圓點那樣在窄格裡溢出卡片。
 */
export function Segments({
  total,
  filled,
  tone = 'signal',
  size = 'md',
  fluid = false,
  className = '',
}: {
  total: number;
  filled: number;
  tone?: Tone;
  size?: 'sm' | 'md';
  fluid?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-1 ${fluid ? 'w-full' : ''} ${className}`}>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={[
            'block rounded-full border-2 border-[var(--cn-line)]',
            fluid ? 'h-3 min-w-0 flex-1' : size === 'sm' ? 'h-3 w-3' : 'h-4 w-4',
            i < filled ? BAR[tone] : 'bg-[var(--cn-card)]',
          ].join(' ')}
        />
      ))}
    </div>
  );
}

export function Num({
  value,
  unit,
  tone = 'ink',
  size = 'md',
  className = '',
}: {
  value: React.ReactNode;
  unit?: string;
  tone?: Tone | 'muted';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const color =
    tone === 'muted'
      ? 'text-[var(--cn-ink-3)]'
      : tone === 'signal'
        ? 'text-[var(--cn-signal-text)]'
        : tone === 'vital'
          ? 'text-[var(--cn-vital-text)]'
          : tone === 'alarm'
            ? 'text-[var(--cn-alarm-text)]'
            : tone === 'caution'
              ? 'text-[var(--cn-caution-text)]'
              : tone === 'reach'
                ? 'text-[var(--cn-reach-text)]'
                : 'text-[var(--cn-ink)]';

  const sz = size === 'lg' ? 'text-[26px]' : size === 'sm' ? 'text-[12px]' : 'text-[15px]';

  return (
    <span className={`arc-num ${sz} ${color} ${className}`}>
      {value}
      {unit && <span className="ml-0.5 text-[11px] font-extrabold text-[var(--cn-ink-3)]">{unit}</span>}
    </span>
  );
}

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
    <div className="flex items-baseline justify-between gap-4 border-b-[3px] border-[var(--cn-line-soft)] py-3 last:border-b-0">
      <div className="min-w-0">
        <div className="arc-label">{label}</div>
        {hint && <div className="mt-1 text-[11.5px] font-semibold leading-snug text-[var(--cn-ink-3)]">{hint}</div>}
      </div>
      <div className="shrink-0 text-right">{children}</div>
    </div>
  );
}

/** 狀態點：圓點，帶墨線外框 */
export function Dot({ tone = 'signal', pulse = false }: { tone?: Tone; pulse?: boolean }) {
  return (
    <span
      className={[
        'inline-block h-3 w-3 rounded-full border-2 border-[var(--cn-line)]',
        BAR[tone],
        pulse ? 'animate-pulse' : '',
      ].join(' ')}
    />
  );
}
