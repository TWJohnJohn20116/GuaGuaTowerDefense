/**
 * 教學頁的共用零件 — HARDLINE「規格文件」語彙
 *
 * 這個系統的教學不是卡片牆，是一份規格書：
 *   區段用 SegHead，步驟用編號列，按鍵用 <Key>，數值用 mono。
 * 面板只有實色 + 1px 線，沒有陰影、沒有漸層、沒有第二個強調色。
 */
import type React from 'react';
import type { TOWER_DATA } from '@/data/gameData';
import { ThemeIcon } from '@/components/ui/Icons';
import { Deck, Key, SegHead } from '@/components/hl';

type Tone = 'ink' | 'signal' | 'vital' | 'alarm' | 'caution' | 'reach' | 'muted';

const TONE_TEXT: Record<Tone, string> = {
  ink: 'text-[var(--arc-ink)]',
  signal: 'text-[var(--arc-gold)]',
  vital: 'text-[var(--arc-vital)]',
  alarm: 'text-[var(--arc-alert)]',
  caution: 'text-[var(--arc-caution)]',
  reach: 'text-[var(--arc-reach)]',
  muted: 'text-[var(--arc-ink-2)]',
};

/* --------------------------------------------------------- SpecSection */

/** 區段：mono 標籤 + 一路延伸的結構線，下面接內容。 */
export function SpecSection({
  label,
  right,
  children,
  className = '',
}: {
  label: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <SegHead label={label} right={right} />
      <div className="mt-2.5">{children}</div>
    </section>
  );
}

/* ------------------------------------------------------------- SpecRow */

/** 編號列：規格書的步驟／條目。 */
export function SpecRow({
  index,
  title,
  desc,
  right,
}: {
  index: string | number;
  title: React.ReactNode;
  desc?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[26px_1fr_auto] items-start gap-3 border-b border-[var(--cn-line-soft)] py-2.5 last:border-b-0">
      <span className="pt-0.5 font-mono text-[10px] tabular-nums leading-none text-[var(--arc-ink-4)]">
        {typeof index === 'number' ? String(index).padStart(2, '0') : index}
      </span>
      <div className="min-w-0">
        <div className="text-[12.5px] font-medium leading-snug text-[var(--arc-ink)]">{title}</div>
        {desc && (
          <div className="mt-0.5 text-[11.5px] leading-relaxed text-[var(--arc-ink-2)]">{desc}</div>
        )}
      </div>
      {right && <div className="shrink-0 pt-0.5">{right}</div>}
    </div>
  );
}

/* ------------------------------------------------------------- SpecNote */

/** 註記區塊：只有左側 2px 訊號條，不是彩色卡片。 */
export function SpecNote({
  label,
  tone = 'caution',
  children,
}: {
  label: React.ReactNode;
  tone?: Tone;
  children: React.ReactNode;
}) {
  const bar =
    tone === 'signal'
      ? 'bg-[var(--arc-gold)]'
      : tone === 'vital'
        ? 'bg-[var(--arc-vital)]'
        : tone === 'alarm'
          ? 'bg-[var(--arc-alert)]'
          : tone === 'reach'
            ? 'bg-[var(--arc-reach)]'
            : 'bg-[var(--arc-caution)]';

  return (
    <div className="flex gap-2.5 border-[3px] border-[var(--cn-line-soft)] bg-[var(--arc-void-2)] p-2.5">
      <span className={`w-[2px] shrink-0 self-stretch ${bar}`} />
      <div className="min-w-0">
        <div className="arc-label mb-1">{label}</div>
        <div className="text-[11.5px] leading-relaxed text-[var(--arc-ink-2)]">{children}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ SpecCell */

/** 數值格：標籤 + mono 數值，格子之間只有 1px 線。 */
export function SpecCell({
  label,
  value,
  tone = 'ink',
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  tone?: Tone;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1 border-r border-b border-[var(--cn-line-soft)] px-2.5 py-2 last:border-r-0">
      <span className="arc-label truncate">{label}</span>
      <span className={`arc-num text-[14px] leading-none ${TONE_TEXT[tone]}`}>{value}</span>
    </div>
  );
}

/** 數值格的外框：格線本身是邊框，不用每格自己畫卡片。 */
export function SpecGrid({
  children,
  cols = 4,
}: {
  children: React.ReactNode;
  cols?: 2 | 3 | 4 | 5;
}) {
  const colClass =
    cols === 2 ? 'grid-cols-2' : cols === 3 ? 'grid-cols-3' : cols === 5 ? 'grid-cols-2 sm:grid-cols-5' : 'grid-cols-2 sm:grid-cols-4';
  return (
    <div className={`grid ${colClass} border-l border-t border-[var(--cn-line-soft)]`}>{children}</div>
  );
}

/* --------------------------------------------------------------- 卡片型 */

// 塔預覽列
export const TowerCard = ({
  type: _type,
  data,
  isActive,
  onClick,
}: {
  type: string;
  data: typeof TOWER_DATA[keyof typeof TOWER_DATA];
  isActive: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={[
      'flex w-full items-center gap-3 border px-3 py-2.5 text-left transition-colors duration-150',
      isActive
        ? 'border-[var(--arc-gold)] bg-[var(--arc-gold-veil)]'
        : 'border-[var(--cn-line-soft)] bg-[var(--arc-deck)] hover:border-[var(--arc-line-hot)]',
    ].join(' ')}
  >
    <span
      className="h-9 w-9 shrink-0 border border-[var(--arc-line-strong)]"
      style={{ backgroundColor: data.color }}
    />
    <span className="min-w-0 flex-1">
      <span className="block truncate text-[12.5px] font-medium text-[var(--arc-ink)]">{data.name}</span>
      <span className="mt-0.5 block font-mono text-[10.5px] tabular-nums text-[var(--arc-caution)]">
        ${data.cost}
      </span>
    </span>
  </button>
);

// 快捷鍵列：動作 + <Key>
export const KeybindCard = ({
  action,
  keyName,
  icon,
}: {
  action: string;
  keyName: string;
  icon: string;
}) => (
  <div className="flex items-center justify-between gap-3 border-b border-[var(--cn-line-soft)] px-1 py-2 last:border-b-0">
    <span className="flex min-w-0 items-center gap-2">
      <ThemeIcon icon={icon} className="h-3.5 w-3.5 shrink-0 text-[var(--arc-ink-3)]" />
      <span className="truncate text-[12px] text-[var(--arc-ink-2)]">{action}</span>
    </span>
    <Key>{keyName}</Key>
  </div>
);

// 提示條目
export const TipCard = ({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) => (
  <Deck className="flex items-start gap-2.5 p-3">
    <ThemeIcon icon={icon} className="mt-0.5 h-4 w-4 shrink-0 text-[var(--arc-ink-3)]" />
    <div className="min-w-0">
      <div className="text-[12.5px] font-medium text-[var(--arc-ink)]">{title}</div>
      <div className="mt-1 text-[11.5px] leading-relaxed text-[var(--arc-ink-2)]">{description}</div>
    </div>
  </Deck>
);

// 步驟指示器：方塊，不是圓點
export const StepIndicator = ({
  current,
  total,
  onSelect,
}: {
  current: number;
  total: number;
  onSelect: (i: number) => void;
}) => (
  <div className="flex items-center gap-1">
    {Array.from({ length: total }).map((_, i) => (
      <button
        key={i}
        type="button"
        onClick={() => onSelect(i)}
        aria-label={String(i + 1)}
        className={[
          'h-2 transition-colors',
          i === current ? 'w-6 bg-[var(--arc-gold)]' : 'w-4 bg-[var(--arc-line-strong)] hover:bg-[var(--arc-line-hot)]',
        ].join(' ')}
      />
    ))}
  </div>
);

// 策略指南
export const StrategyCard = ({
  guide,
  index,
}: {
  guide: { title: string; icon: string; points: string[] };
  index: number;
}) => (
  <Deck className="p-3.5">
    <div className="mb-2.5 flex items-center gap-2 border-b border-[var(--cn-line-soft)] pb-2">
      <span className="arc-label">{String(index + 1).padStart(2, '0')}</span>
      <ThemeIcon icon={guide.icon} className="h-3.5 w-3.5 text-[var(--arc-ink-3)]" />
      <span className="min-w-0 truncate text-[12.5px] font-medium text-[var(--arc-ink)]">{guide.title}</span>
    </div>
    <ul className="space-y-1.5">
      {guide.points.map((point, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className="mt-1.5 h-1 w-1 shrink-0 bg-[var(--arc-gold)]" />
          <span className="text-[11.5px] leading-relaxed text-[var(--arc-ink-2)]">{point}</span>
        </li>
      ))}
    </ul>
  </Deck>
);

// 升級指南
export const UpgradeCard = ({
  guide,
  index,
}: {
  guide: { title: string; description: string; icon: string; color: string; benefits: string[] };
  index: number;
}) => (
  <Deck className="p-3.5">
    <div className="mb-2.5 flex items-baseline gap-2 border-b border-[var(--cn-line-soft)] pb-2">
      <span className="arc-label">{String(index + 1).padStart(2, '0')}</span>
      <span className="min-w-0 truncate text-[12.5px] font-medium text-[var(--arc-ink)]">{guide.title}</span>
      <span className="ml-auto shrink-0 font-mono text-[10px] text-[var(--arc-ink-3)]">{guide.description}</span>
    </div>
    <ul className="space-y-1.5">
      {guide.benefits.map((benefit, i) => (
        <li key={i} className="flex items-start gap-2">
          <ThemeIcon icon={guide.icon} className="mt-0.5 h-3 w-3 shrink-0 text-[var(--arc-ink-3)]" />
          <span className="text-[11.5px] leading-relaxed text-[var(--arc-ink-2)]">{benefit}</span>
        </li>
      ))}
    </ul>
  </Deck>
);

// 自動戰鬥指南
export const AutoBattleCard = ({
  guide,
  index,
}: {
  guide: { title: string; content: string; icon: string };
  index: number;
}) => (
  <Deck className="flex items-start gap-2.5 p-3">
    <span className="arc-label mt-0.5 shrink-0">{String(index + 1).padStart(2, '0')}</span>
    <ThemeIcon icon={guide.icon} className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--arc-ink-3)]" />
    <div className="min-w-0">
      <div className="text-[12.5px] font-medium text-[var(--arc-ink)]">{guide.title}</div>
      <div className="mt-1 text-[11.5px] leading-relaxed text-[var(--arc-ink-2)]">{guide.content}</div>
    </div>
  </Deck>
);

// 模組步驟列
export const ModStepCard = ({
  step,
  index,
}: {
  step: { title: string; content: string };
  index: number;
}) => (
  <SpecRow index={index + 1} title={step.title} desc={step.content} />
);
