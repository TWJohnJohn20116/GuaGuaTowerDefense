/**
 * HARDLINE · 面（surface）
 *
 * 這個系統不用玻璃、不用陰影、不用圓角。面板靠「實色 + 1px 線 + 左上切角」建立層級。
 * 切角只在不會被 popover 撐破的容器上用。
 */
import type React from 'react';

/* ------------------------------------------------------------------ Deck */

interface DeckProps {
  children: React.ReactNode;
  className?: string;
  /** 左上切角。容器內有 dropdown / popover 時不要開。 */
  notch?: boolean;
  /** 底色層級：base（deck）/ sunken（更暗）/ raised（更亮） */
  tone?: 'base' | 'sunken' | 'raised' | 'bare';
  /** 選中態：換訊號線 + 訊號膜 */
  active?: boolean;
  as?: 'div' | 'section' | 'article' | 'aside' | 'li' | 'header' | 'footer';
}

const TONE: Record<NonNullable<DeckProps['tone']>, string> = {
  base: 'bg-[var(--hl-deck)]',
  sunken: 'bg-[var(--hl-void-2)]',
  raised: 'bg-[var(--hl-deck-2)]',
  bare: 'bg-transparent',
};

export function Deck({
  children,
  className = '',
  notch = false,
  tone = 'base',
  active = false,
  as: Tag = 'div',
}: DeckProps) {
  return (
    <Tag
      className={[
        'border border-[var(--hl-line)]',
        TONE[tone],
        notch ? 'hl-cut-tl' : '',
        active
          ? 'border-[var(--hl-signal)] bg-[var(--hl-signal-veil)]'
          : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </Tag>
  );
}

/* -------------------------------------------------------------- SegHead */

/** 區段頭：mono 標籤 + 一路延伸的結構線。全專案取代「小標＋裝飾線」。 */
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
    <div className={`flex items-center gap-2.5 w-full ${className}`}>
      <span className="hl-label whitespace-nowrap">{label}</span>
      <span className="h-px flex-1 bg-[var(--hl-line)]" />
      {right}
    </div>
  );
}

/* ----------------------------------------------------------------- Rule */

export function Rule({ vertical = false, className = '' }: { vertical?: boolean; className?: string }) {
  return vertical ? (
    <span className={`block w-px self-stretch bg-[var(--hl-line)] ${className}`} />
  ) : (
    <hr className={`h-px w-full border-0 bg-[var(--hl-line)] ${className}`} />
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
      ? 'text-[var(--hl-signal)]'
      : tone === 'vital'
        ? 'text-[var(--hl-vital)]'
        : tone === 'alarm'
          ? 'text-[var(--hl-alarm)]'
          : tone === 'caution'
            ? 'text-[var(--hl-caution)]'
            : tone === 'reach'
              ? 'text-[var(--hl-reach)]'
              : tone === 'muted'
                ? 'text-[var(--hl-ink-2)]'
                : 'text-[var(--hl-ink)]';

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <span className="hl-label">{label}</span>
      <span className={`hl-num text-[15px] leading-none ${color}`}>
        {value}
        {unit && (
          <span className="ml-1 text-[10px] font-normal text-[var(--hl-ink-3)]">{unit}</span>
        )}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ Key */

/** 鍵位提示：方框 mono。 */
export function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-[18px] min-w-[18px] items-center justify-center border border-[var(--hl-line-strong)] px-1 font-mono text-[10px] leading-none text-[var(--hl-ink-2)]">
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
      className={`flex flex-col items-center justify-center gap-3 border border-dashed border-[var(--hl-line)] px-6 py-10 text-center ${className}`}
    >
      <div className="hl-label">empty</div>
      <div className="hl-sub text-[var(--hl-ink)]">{title}</div>
      {hint && <div className="hl-micro max-w-sm">{hint}</div>}
      {action}
    </div>
  );
}
