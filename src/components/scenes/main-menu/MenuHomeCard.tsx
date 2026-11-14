import type React from 'react';

/**
 * 主選單 · 目錄列
 *
 * 一列＝一個模組。左到右：編號、圖示框、名稱與說明、狀態、箭頭。
 * 沒有卡片外框，列本身就是可點區；hover 與鍵盤焦點共用同一組視覺。
 */
export function MenuHomeCard({
  index,
  label,
  sub,
  tag,
  tone = 'signal',
  icon,
  focused,
  onSelect,
  onFocus,
}: {
  index: number;
  label: string;
  sub: string;
  tag?: string;
  tone?: 'signal' | 'vital' | 'caution';
  icon: React.ReactNode;
  focused: boolean;
  onSelect: () => void;
  onFocus: () => void;
}) {
  const tagClass =
    tone === 'vital'
      ? 'border-[rgba(56,224,143,0.42)] text-[var(--hl-vital)]'
      : tone === 'caution'
        ? 'border-[rgba(255,182,39,0.42)] text-[var(--hl-caution)]'
        : 'border-[var(--hl-signal-edge)] text-[var(--hl-signal)]';

  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={onFocus}
      onFocus={onFocus}
      className={`group relative flex w-full items-center gap-3.5 border-b border-[var(--hl-line)] py-2.5 pl-4 pr-3 text-left transition-colors duration-150 ${
        focused ? 'bg-[var(--hl-deck-2)]' : 'bg-transparent hover:bg-[var(--hl-deck-2)]'
      }`}
    >
      {/* 左緣訊號條 */}
      <span
        aria-hidden="true"
        className={`absolute left-0 top-0 h-full w-[2px] transition-colors duration-150 ${
          focused ? 'bg-[var(--hl-signal)]' : 'bg-transparent group-hover:bg-[var(--hl-signal)]'
        }`}
      />

      <span
        className={`w-[24px] shrink-0 font-mono text-[10px] tabular-nums tracking-[0.08em] transition-colors ${
          focused ? 'text-[var(--hl-signal)]' : 'text-[var(--hl-ink-4)] group-hover:text-[var(--hl-signal)]'
        }`}
      >
        {String(index + 1).padStart(2, '0')}
      </span>

      <span
        className={`flex h-[26px] w-[26px] shrink-0 items-center justify-center border transition-colors duration-150 ${
          focused
            ? 'border-[var(--hl-signal)] text-[var(--hl-signal)]'
            : 'border-[var(--hl-line-strong)] text-[var(--hl-ink-2)] group-hover:border-[var(--hl-line-hot)] group-hover:text-[var(--hl-ink)]'
        }`}
      >
        {icon}
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
        <span className="truncate text-[14px] font-semibold leading-tight tracking-[-0.01em] text-[var(--hl-ink)]">
          {label}
        </span>
        <span className="truncate text-[11px] leading-snug text-[var(--hl-ink-3)]">{sub}</span>
      </span>

      {tag && (
        <span
          className={`hidden shrink-0 border px-1.5 py-[1px] font-mono text-[9px] uppercase tracking-[0.12em] sm:block ${tagClass}`}
        >
          {tag}
        </span>
      )}

      <span
        className={`shrink-0 font-mono text-[12px] transition-all duration-150 ${
          focused
            ? 'translate-x-0.5 text-[var(--hl-signal)]'
            : 'text-transparent group-hover:translate-x-0.5 group-hover:text-[var(--hl-signal)]'
        }`}
      >
        →
      </span>
    </button>
  );
}

export default MenuHomeCard;
