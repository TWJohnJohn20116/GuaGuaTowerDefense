import type React from 'react';
import type { HomeEntrySize } from '@/data/mainMenuHome';

/**
 * 主選單 · 入口磚
 *
 * 兩種尺寸檔，這是打破「一整片等寬格子」的關鍵：
 *   tile    大磚：圖示 64px、標題 21px，適合 5／4 欄
 *   compact 小磚：圖示 44px、標題 15px，適合 3／2 欄
 *
 * 構圖是海報式：圖示釘頂、文字釘底，中間刻意留白；tile 磚再用一枚
 * 極淡的大序號壓在右下角充當圖形，避免高卡片中間出現一片死白。
 *
 * 裝飾色（角落圓 + 序號）只看 index 循環，與業務狀態無關；
 * 狀態語意只走 tone（徽章顏色）。
 */
const TONE: Record<'signal' | 'vital' | 'caution' | 'ink', { tile: string; badge: string }> = {
  signal: {
    tile: 'bg-[var(--cn-coral-soft)] text-[var(--cn-signal-text)]',
    badge: 'bg-[var(--cn-cta)] text-[var(--cn-on-cta)]',
  },
  vital: {
    tile: 'bg-[var(--cn-mint-soft)] text-[var(--cn-mint-deep)]',
    badge: 'bg-[var(--cn-fill-success)] text-[var(--cn-on-fill)]',
  },
  caution: {
    tile: 'bg-[var(--cn-sun-soft)] text-[var(--cn-caution-text)]',
    badge: 'bg-[var(--cn-sun)] text-[var(--cn-on-sun)]',
  },
  ink: {
    tile: 'bg-[var(--cn-card-2)] text-[var(--cn-ink-2)]',
    badge: 'bg-[var(--cn-fill-sky)] text-[var(--cn-on-fill)]',
  },
};

/** 牆面裝飾色：四色循環，讓 11 張白磚不是一整片白 */
const DECO = [
  'bg-[var(--cn-coral)]',
  'bg-[var(--cn-mint)]',
  'bg-[var(--cn-sun)]',
  'bg-[var(--cn-sky)]',
];

export function MenuHomeCard({
  index,
  label,
  sub,
  tag,
  tone = 'ink',
  size = 'compact',
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
  size?: HomeEntrySize;
  icon: React.ReactNode;
  focused: boolean;
  onSelect: () => void;
  onFocus: () => void;
}) {
  const t = TONE[tone] ?? TONE.ink;
  const isTile = size === 'tile';
  const order = String(index + 1).padStart(2, '0');

  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={onFocus}
      onFocus={onFocus}
      className={[
        'group relative flex h-full w-full flex-col overflow-hidden rounded-[18px] border-[3px] text-left',
        'transition-[transform,border-color,box-shadow,background-color] duration-[160ms]',
        focused
          ? '-translate-y-1 border-[var(--cn-line)] bg-[var(--cn-card)] shadow-[0_8px_0_var(--cn-line)]'
          : 'border-[var(--cn-line-soft)] bg-[var(--cn-card)] shadow-[0_4px_0_-2px_rgba(46,36,64,0.16)] hover:-translate-y-1 hover:border-[var(--cn-line)] hover:shadow-[0_8px_0_var(--cn-line)]',
      ].join(' ')}
    >
      {/* 角落色塊 */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-[0.13] ${DECO[index % DECO.length]}`}
      />

      {/* 極淡大序號：撐住高卡片中間那片留白，不當文字讀 */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute -bottom-2 right-2 hidden select-none font-mono font-black leading-none tracking-tighter text-[var(--cn-ink)] opacity-[0.05] lg:block ${
          isTile ? 'text-[72px]' : 'text-[52px]'
        }`}
      >
        {order}
      </span>

      <span
        className={`relative flex min-h-0 flex-1 flex-col ${
          isTile ? 'px-3 py-2.5 lg:px-4 lg:py-3.5' : 'px-3 py-2.5'
        }`}
      >
        {/* 頂：圖示磚 + 序號 */}
        <span className="flex items-start justify-between gap-2">
          <span
            className={[
              'flex shrink-0 items-center justify-center border-[3px] border-[var(--cn-line)] transition-transform duration-200 group-hover:-rotate-6',
              t.tile,
              // 窄螢幕統一用緊湊尺寸，避免 132px 行高被大圖示撐破
              isTile
                ? 'h-11 w-11 rounded-[15px] lg:h-16 lg:w-16 lg:rounded-[20px]'
                : 'h-10 w-10 rounded-[14px] lg:h-11 lg:w-11 lg:rounded-[15px]',
            ].join(' ')}
          >
            {icon}
          </span>
          <span className="font-mono text-[10px] font-extrabold tabular-nums text-[var(--cn-ink-4)]">
            {order}
          </span>
        </span>

        {/* 底：名稱 / 副標 / 狀態徽章，mt-auto 把文字釘在底邊 */}
        <span className="mt-auto flex flex-col gap-1 pt-2">
          <span className="flex items-center gap-2">
            <span
              className={[
                'truncate font-black leading-tight text-[var(--cn-ink)]',
                isTile ? 'text-[16px] lg:text-[21px]' : 'text-[14px] lg:text-[15px]',
              ].join(' ')}
            >
              {label}
            </span>
            {tag && (
              <span
                className={[
                  'shrink-0 rounded-full font-extrabold',
                  t.badge,
                  isTile ? 'px-2 py-0.5 text-[10px]' : 'px-1.5 py-[1px] text-[9px]',
                ].join(' ')}
              >
                {tag}
              </span>
            )}
          </span>

          <span
            className={[
              'font-semibold leading-snug text-[var(--cn-ink-3)]',
              isTile ? 'line-clamp-2 text-[11px] lg:text-[12px]' : 'line-clamp-2 text-[10.5px] lg:text-[11px]',
            ].join(' ')}
          >
            {sub}
          </span>

          {/* 進入提示：hover／焦點才亮，箭頭往右滑 */}
          <span
            aria-hidden="true"
            className="flex items-center gap-1 font-mono text-[11px] font-black text-[var(--cn-signal-text)] opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
          >
            <span className="transition-transform duration-150 group-hover:translate-x-0.5">→</span>
          </span>
        </span>
      </span>
    </button>
  );
}

export default MenuHomeCard;
