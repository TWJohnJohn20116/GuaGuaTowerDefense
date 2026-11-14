import type React from 'react';

/**
 * 主選單 · 入口卡
 *
 * 一張卡＝一個模組。上方是大圖示磚，下面是名稱與說明，右下是可見的狀態徽章。
 * 卡片本身就是可點區；hover 與鍵盤焦點共用同一組視覺（抬起 + 加粗墨框）。
 */
const TONE: Record<'signal' | 'vital' | 'caution' | 'ink', { tile: string; badge: string }> = {
  signal: { tile: 'bg-[var(--cn-coral-soft)] text-[var(--cn-coral)]', badge: 'bg-[var(--cn-coral)] text-white' },
  vital: { tile: 'bg-[var(--cn-mint-soft)] text-[var(--cn-mint-deep)]', badge: 'bg-[var(--cn-mint)] text-white' },
  caution: { tile: 'bg-[var(--cn-sun-soft)] text-[var(--cn-sun-deep)]', badge: 'bg-[var(--cn-sun)] text-[var(--cn-ink)]' },
  ink: { tile: 'bg-[var(--cn-sky-soft)] text-[var(--cn-sky-deep)]', badge: 'bg-[var(--cn-sky)] text-white' },
};

export function MenuHomeCard({
  index,
  label,
  sub,
  tag,
  tone = 'ink',
  icon,
  focused,
  onSelect,
  onFocus,
}: {
  index: number;
  label: string;
  sub: string;
  tag?: string;
  tone?: 'signal' | 'vital' | 'caution' | 'ink';
  icon: React.ReactNode;
  focused: boolean;
  onSelect: () => void;
  onFocus: () => void;
}) {
  const t = TONE[tone] ?? TONE.ink;

  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={onFocus}
      onFocus={onFocus}
      className={[
        'group relative flex h-full w-full flex-col gap-3 rounded-[var(--cn-r-lg)] border-[3px] p-4 text-left',
        'transition-[transform,border-color,box-shadow,background-color] duration-[160ms]',
        focused
          ? '-translate-y-1 border-[var(--cn-line)] bg-[var(--cn-card)] shadow-[0_8px_0_var(--cn-line)]'
          : 'border-[var(--cn-line-soft)] bg-[var(--cn-card)] shadow-[0_4px_0_-2px_rgba(46,36,64,0.16)] hover:-translate-y-1 hover:border-[var(--cn-line)] hover:shadow-[0_8px_0_var(--cn-line)]',
      ].join(' ')}
    >
      <span className="flex items-start justify-between gap-2">
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] border-[3px] border-[var(--cn-line)] text-[20px] ${t.tile}`}>
          {icon}
        </span>
        <span className="font-mono text-[11px] font-extrabold tabular-nums text-[var(--cn-ink-4)]">
          {String(index + 1).padStart(2, '0')}
        </span>
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate text-[16px] font-black leading-tight text-[var(--cn-ink)]">{label}</span>
        <span className="line-clamp-2 text-[12px] font-semibold leading-snug text-[var(--cn-ink-3)]">{sub}</span>
      </span>

      {tag && (
        <span
          className={`self-start rounded-full px-2.5 py-0.5 text-[10.5px] font-extrabold ${t.badge}`}
        >
          {tag}
        </span>
      )}
    </button>
  );
}

export default MenuHomeCard;
