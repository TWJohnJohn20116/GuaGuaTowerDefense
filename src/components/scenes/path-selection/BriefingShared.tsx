/**
 * 戰前簡報共用組件（HARDLINE）
 *
 * - SectionHeader：區段頭，mono 標籤 + 一路延伸的 1px 線
 * - StatChip：行內資料，mono 標籤 + 等寬數值
 * - BriefingHero：地圖預覽（左）+ 標題與資料格（右）
 * - BriefingFooter：獎勵 + 出擊鈕（全畫面唯一的訊號色面積）
 * - EmptyBriefing：空狀態
 * - Badge：純文字資料標籤（不發光、不漸層）
 */

import type { ReactNode } from 'react';
import type { PathConfig } from '@/types/game';
import { useTranslation } from '@/i18n';
import { Btn, Empty, SegHead, StatCell } from '@/components/hl';
import { PathPreview } from './PathPreview';

// ──────────────────────────────────────────────────────────────────────────
// 區段頭
// ──────────────────────────────────────────────────────────────────────────

export function SectionHeader({
  title,
  right,
}: {
  title: string;
  right?: ReactNode;
}) {
  return <SegHead label={title} right={right} className="mb-2.5" />;
}

// ──────────────────────────────────────────────────────────────────────────
// 行內資料
// ──────────────────────────────────────────────────────────────────────────

export function StatChip({ label, value }: { label: string; value: string | number }) {
  return (
    <span className="hl-kv border border-[var(--hl-line)] px-2 py-1">
      <span className="uppercase tracking-[0.08em]">{label}</span>
      <span className="tabular-nums text-[var(--hl-ink)]">{value}</span>
    </span>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// 資料標籤
// ──────────────────────────────────────────────────────────────────────────

type BadgeTone = 'signal' | 'vital' | 'caution' | 'alarm' | 'muted';

const BADGE_TONE: Record<BadgeTone, string> = {
  signal: 'border-[var(--hl-signal-edge)] text-[var(--hl-signal)]',
  vital: 'border-[var(--hl-vital)]/40 text-[var(--hl-vital)]',
  caution: 'border-[var(--hl-caution)]/40 text-[var(--hl-caution)]',
  alarm: 'border-[var(--hl-alarm)]/40 text-[var(--hl-alarm)]',
  muted: 'border-[var(--hl-line)] text-[var(--hl-ink-3)]',
};

export function Badge({ label, tone = 'muted' }: { label: string; tone?: BadgeTone }) {
  return (
    <span
      className={`whitespace-nowrap border px-1.5 py-0.5 font-mono text-[9.5px] uppercase leading-[14px] tracking-[0.08em] ${BADGE_TONE[tone]}`}
    >
      {label}
    </span>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Hero
// ──────────────────────────────────────────────────────────────────────────

interface BriefingHeroProps {
  path: PathConfig;
  /** 標題上方的 mono 路徑（章節／任務目標） */
  eyebrow: string;
  title: string;
  description: string;
  topBadges?: ReactNode;
  /** 底部資料格 */
  stats: { label: string; value: string | number; unit?: string }[];
}

export function BriefingHero({
  path,
  eyebrow,
  title,
  description,
  topBadges,
  stats,
}: BriefingHeroProps) {
  return (
    <div className="grid grid-cols-1 border-b border-[var(--hl-line)] lg:grid-cols-[300px_1fr]">
      <div className="border-b border-[var(--hl-line)] bg-[var(--hl-void-2)] p-3 lg:border-b-0 lg:border-r">
        <PathPreview pathConfig={path} size="large" className="w-full border border-[var(--hl-line)]" />
        <div className="mt-2 flex items-center justify-between font-mono text-[9.5px] uppercase tracking-[0.1em] text-[var(--hl-ink-4)]">
          <span>grid 15 × 11</span>
          <span>{path.category ?? 'path'}</span>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-3 p-4 lg:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="hl-label">{eyebrow}</span>
            <h2 className="mt-1.5 text-[26px] font-bold leading-[1.15] tracking-[-0.015em] text-[var(--hl-ink)]">
              {title}
            </h2>
          </div>
          {topBadges && (
            <div className="flex shrink-0 flex-col items-end gap-1">{topBadges}</div>
          )}
        </div>

        {description && (
          <p className="max-w-[76ch] text-[13px] leading-relaxed text-[var(--hl-ink-2)]">
            {description}
          </p>
        )}

        <div className="mt-auto grid grid-cols-2 gap-x-4 gap-y-3 border-t border-[var(--hl-line)] pt-3 sm:grid-cols-4">
          {stats.map((s) => (
            <StatCell key={s.label} label={s.label} value={s.value} unit={s.unit} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// 出擊列
// ──────────────────────────────────────────────────────────────────────────

interface BriefingFooterProps {
  unlocked?: boolean;
  rewardCoins: number;
  rewardTalent?: number;
  rewardNote?: string;
  rewardLabel?: string;
  lockedHint?: string;
  buttonLabel?: string;
  lockedButtonLabel?: string;
  onStart: () => void;
}

export function BriefingFooter({
  unlocked = true,
  rewardCoins,
  rewardTalent,
  rewardNote,
  rewardLabel,
  lockedHint,
  buttonLabel,
  lockedButtonLabel,
  onStart,
}: BriefingFooterProps) {
  const { t } = useTranslation();
  const c = t.pathSelection.campaign;
  const resolvedRewardLabel = rewardLabel ?? c.expectedReward;
  const resolvedLockedHint = lockedHint ?? c.lockedHint;
  const resolvedButtonLabel = buttonLabel ?? c.deploy;
  const resolvedLockedButtonLabel = lockedButtonLabel ?? c.locked;

  return (
    <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-[var(--hl-line)] bg-[var(--hl-void-2)] px-4 py-2.5">
      <div className="flex min-w-0 items-center gap-5">
        <StatCell
          label={unlocked ? resolvedRewardLabel : c.levelLocked}
          value={
            unlocked
              ? rewardNote
                ? '—'
                : rewardCoins
              : '—'
          }
          unit={unlocked && !rewardNote ? 'coins' : undefined}
          tone={unlocked ? 'signal' : 'muted'}
        />
        {unlocked && rewardTalent !== undefined && (
          <StatCell label={c.rewardTalent} value={rewardTalent} tone="reach" />
        )}
        {!unlocked && (
          <span className="min-w-0 max-w-[46ch] truncate text-[11px] text-[var(--hl-ink-3)]">
            {resolvedLockedHint}
          </span>
        )}
        {unlocked && rewardNote && (
          <span className="min-w-0 max-w-[46ch] truncate text-[11px] text-[var(--hl-ink-3)]">
            {rewardNote}
          </span>
        )}
      </div>

      {unlocked ? (
        <Btn variant="signal" size="lg" onClick={onStart}>
          {resolvedButtonLabel}
        </Btn>
      ) : (
        <Btn variant="line" size="lg" disabled>
          {resolvedLockedButtonLabel}
        </Btn>
      )}
    </footer>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// 空狀態
// ──────────────────────────────────────────────────────────────────────────

export function EmptyBriefing({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <Empty title={title} hint={hint} className="w-full max-w-[420px]" />
    </div>
  );
}
