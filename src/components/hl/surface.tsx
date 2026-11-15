/**
 * CANDY POP · 面（surface）
 *
 * 卡片是白色厚紙：粗墨線外框、22px 圓角、貼紙式硬投影。
 * 不用切角、不用發光、不用玻璃。
 */
import type React from 'react';

interface DeckProps {
  children: React.ReactNode;
  className?: string;
  /** 保留相容參數；CANDY 不使用切角 */
  notch?: boolean;
  tone?: 'base' | 'sunken' | 'raised' | 'bare';
  active?: boolean;
  /** 保留相容參數；CANDY 不使用角落括號 */
  bracket?: boolean;
  as?: 'div' | 'section' | 'article' | 'aside' | 'li' | 'header' | 'footer';
}

const TONE: Record<NonNullable<DeckProps['tone']>, string> = {
  base: 'arc-panel',
  raised: 'arc-panel bg-[var(--cn-card)] shadow-[0_10px_0_-2px_rgba(46,36,64,0.18)]',
  sunken: 'arc-panel--sunken',
  bare: 'bg-transparent',
};

export function Deck({
  children,
  className = '',
  tone = 'base',
  active = false,
  as: Tag = 'div',
}: DeckProps) {
  return (
    <Tag
      className={[TONE[tone], active ? 'arc-panel--active' : '', className]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </Tag>
  );
}

/* ------------------------------------------------------------- SegHead */

/** 區段頭：糖果標籤 + 延伸的粗虛線。 */
export function SegHead({
  label,
  right,
  className = '',
}: {
  label: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex w-full items-center gap-3 ${className}`}>
      <span className="arc-banner">
        <span className="arc-label !text-[var(--cn-ink)]">{label}</span>
      </span>
      <span className="h-[3px] flex-1 rounded-full bg-[var(--cn-line-soft)]" />
      {right}
    </div>
  );
}

/* ----------------------------------------------------------------- Rule */

export function Rule({ vertical = false, className = '' }: { vertical?: boolean; className?: string }) {
  return vertical ? (
    <span className={`block w-[3px] self-stretch rounded-full bg-[var(--cn-line-soft)] ${className}`} />
  ) : (
    <hr className={`arc-divider ${className}`} />
  );
}

/* -------------------------------------------------------------- StatCell */

export function StatCell({
  label,
  value,
  unit,
  tone = 'ink',
  className = '',
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  unit?: React.ReactNode;
  tone?: 'ink' | 'signal' | 'vital' | 'alarm' | 'caution' | 'reach' | 'muted';
  className?: string;
}) {
  const color =
    tone === 'signal'
      ? 'text-[var(--cn-signal-text)]'
      : tone === 'vital'
        ? 'text-[var(--cn-vital-text)]'
        : tone === 'alarm'
          ? 'text-[var(--cn-alarm-text)]'
          : tone === 'caution'
            ? 'text-[var(--cn-caution-text)]'
            : tone === 'reach'
              ? 'text-[var(--cn-reach-text)]'
              : tone === 'muted'
                ? 'text-[var(--cn-ink-3)]'
                : 'text-[var(--cn-ink)]';

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <span className="arc-label">{label}</span>
      <span className={`arc-num text-[20px] ${color}`}>
        {value}
        {unit && (
          <span className="ml-1 text-[12px] font-extrabold text-[var(--cn-ink-3)]">{unit}</span>
        )}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ Key */

/** 鍵位提示：小圓角實體鍵。 */
export function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-[24px] min-w-[24px] items-center justify-center rounded-[7px] border-2 border-[var(--cn-line)] bg-[var(--cn-card)] px-1.5 font-mono text-[11px] font-extrabold leading-none text-[var(--cn-ink)] shadow-[0_2px_0_var(--cn-line)]">
      {children}
    </kbd>
  );
}

/* ---------------------------------------------------------------- Empty */

export function Empty({
  title,
  hint,
  action,
  className = '',
}: {
  title: React.ReactNode;
  hint?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 rounded-[var(--cn-r-lg)] border-[3px] border-dashed border-[var(--cn-line-mid)] bg-[var(--cn-card)] px-8 py-12 text-center ${className}`}
    >
      <div className="text-[34px] leading-none">🫧</div>
      <div className="arc-title text-[17px]">{title}</div>
      {hint && <div className="arc-micro max-w-sm">{hint}</div>}
      {action}
    </div>
  );
}
