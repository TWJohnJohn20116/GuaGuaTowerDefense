/**
 * 結算畫面 · 結果帶
 *
 * 左：大字結果（勝利／失敗）+ mono 副資訊（關卡、難度、時間）
 * 右：三個 StatCell（分數、波次、星等），星等用 Segments
 *
 * 只有一種強調色，結果只用資料色（vital / alarm）標記狀態，不做發光與漸層。
 */

import type React from 'react';
import { Deck, Dot, Num, Rule, Segments, StatCell } from '@/components/hl';

interface GameEndMetaItem {
  label: string;
  value: React.ReactNode;
}

interface GameEndResultBandProps {
  tone: 'vital' | 'alarm';
  headline: React.ReactNode;
  tag: React.ReactNode;
  meta: GameEndMetaItem[];
  score: React.ReactNode;
  wave: React.ReactNode;
  stars: number;
  starsMax?: number;
  /** 評級徽章（勝利畫面用），放在大字右側 */
  badge?: React.ReactNode;
}

const HEADLINE_TONE: Record<'vital' | 'alarm', string> = {
  vital: 'text-[var(--arc-vital)]',
  alarm: 'text-[var(--arc-alert)]',
};

export function GameEndResultBand({
  tone,
  headline,
  tag,
  meta,
  score,
  wave,
  stars,
  starsMax = 3,
  badge,
}: GameEndResultBandProps) {
  return (
    <Deck
      notch
      className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-stretch lg:gap-0"
    >
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 lg:pr-6">
        <div className="flex items-center gap-2">
          <Dot tone={tone} />
          <span className="arc-label">{tag}</span>
        </div>

        <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
          <h1
            className={`text-[30px] font-bold leading-[1.04] tracking-[-0.02em] sm:text-[36px] ${HEADLINE_TONE[tone]}`}
          >
            {headline}
          </h1>
          {badge}
        </div>

        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1.5">
          {meta.map((item) => (
            <span key={item.label} className="flex items-baseline gap-1.5">
              <span className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-[var(--arc-ink-4)]">
                {item.label}
              </span>
              <Num
                value={item.value}
                tone="ink"
                size="sm"
                className="font-mono tabular-nums"
              />
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-start gap-5 border-t border-[var(--cn-line-soft)] pt-4 lg:flex-nowrap lg:items-center lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
        <StatCell label="score" value={score} />
        <Rule vertical className="h-8" />
        <StatCell label="wave" value={wave} />
        <Rule vertical className="h-8" />
        <div className="flex flex-col gap-1.5">
          <span className="arc-label">stars</span>
          <span
            className={`arc-num text-[15px] leading-none ${
              stars > 0 ? 'text-[var(--arc-caution)]' : 'text-[var(--arc-ink-3)]'
            }`}
          >
            {stars}
            <span className="ml-1 text-[10px] font-normal text-[var(--arc-ink-3)]">/ {starsMax}</span>
          </span>
          <Segments total={starsMax} filled={stars} tone="caution" size="sm" />
        </div>
      </div>
    </Deck>
  );
}
