/**
 * SceneStatParts — 場景統計區塊元件（HARDLINE）
 *
 * 統計＝標籤 + 等寬數值 + 1px 線。沒有漸層底、沒有內陰影、沒有放大動效。
 */

import type React from 'react';
import { Deck, SegHead } from '@/components/hl';

export type SceneStatColor =
  | 'red'
  | 'yellow'
  | 'purple'
  | 'blue'
  | 'orange'
  | 'pink'
  | 'green'
  | 'cyan';

/** 資料色：只用來標記數值狀態 */
const STAT_INK: Record<SceneStatColor, string> = {
  red: 'var(--hl-alarm)',
  yellow: 'var(--hl-caution)',
  purple: 'var(--hl-reach)',
  blue: 'var(--hl-reach)',
  orange: 'var(--hl-caution)',
  pink: 'var(--hl-reach)',
  green: 'var(--hl-vital)',
  cyan: 'var(--hl-reach)',
};

export function StatRecordSection({
  icon,
  title,
  accent,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  /** 相容參數：HARDLINE 不換整塊底色 */
  accent?: string;
  children: React.ReactNode;
}) {
  void accent;
  return (
    <Deck notch className="flex flex-col gap-3 p-4">
      <div className="flex items-center gap-2.5">
        <span className="flex h-5 w-5 items-center justify-center text-[var(--hl-ink-3)]">{icon}</span>
        <span className="hl-label text-[var(--hl-ink-2)]">{title}</span>
        <span className="h-px flex-1 bg-[var(--hl-line)]" />
      </div>
      {children}
    </Deck>
  );
}

export function StatHeroBlock({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  accent: 'yellow' | 'purple' | 'cyan';
}) {
  const tone: Record<typeof accent, string> = {
    yellow: 'var(--hl-caution)',
    purple: 'var(--hl-reach)',
    cyan: 'var(--hl-reach)',
  };

  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-[var(--hl-line)] text-[var(--hl-ink-2)]">
        {icon}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="hl-label">{label}</span>
        <span
          className="font-mono text-[22px] font-semibold leading-none tabular-nums"
          style={{ color: tone[accent] }}
        >
          {value}
        </span>
        <span className="truncate text-[10.5px] text-[var(--hl-ink-3)]">{sub}</span>
      </span>
    </div>
  );
}

export function StatSectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return <SegHead label={title} right={<span className="text-[var(--hl-ink-3)]">{icon}</span>} />;
}

export function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: SceneStatColor;
}) {
  return (
    <div className="flex flex-col gap-2.5 border border-[var(--hl-line)] bg-[var(--hl-deck)] p-3 transition-colors duration-150 hover:border-[var(--hl-line-hot)]">
      <div className="flex items-center gap-2">
        <span className="flex h-4 w-4 items-center justify-center" style={{ color: STAT_INK[color] }}>
          {icon}
        </span>
        <span className="hl-label truncate">{label}</span>
      </div>
      <p
        className="font-mono text-[15px] font-semibold leading-none tabular-nums"
        style={{ color: STAT_INK[color] }}
      >
        {value}
      </p>
    </div>
  );
}

export function StatBestRecordCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2.5 border border-[var(--hl-line)] bg-[var(--hl-void-2)] p-3">
      <div className="flex items-center gap-2 text-[var(--hl-ink-3)]">
        <span className="flex h-4 w-4 items-center justify-center">{icon}</span>
        <span className="hl-label truncate">{label}</span>
      </div>
      <p className="font-mono text-[13.5px] font-semibold leading-none tabular-nums text-[var(--hl-ink)]">
        {value}
      </p>
    </div>
  );
}
