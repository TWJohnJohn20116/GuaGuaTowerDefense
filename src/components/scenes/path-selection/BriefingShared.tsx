/**
 * 戰前簡報 · 共用組件（CANDY POP）
 *
 * 這裡只有四件事：
 *   1. SectionHeader：卡片內的區段頭（標題 + 一行說明 + 右側資料）
 *   2. Badge：純資料標籤（不發光、不漸層）
 *   3. BriefingHero：地圖預覽（左）+ 名稱／說明／數據（右）
 *   4. EmptyBriefing：沒有可選地圖時的空狀態
 *
 * 出擊列不放這裡——它需要完整的地圖與難度資訊，留在 MapBriefing 內組裝。
 */

import type { ReactNode } from 'react';
import type { PathConfig } from '@/types/game';
import { Empty, Segments, StatCell } from '@/components/hl';
import { PathPreview } from './PathPreview';

// ──────────────────────────────────────────────────────────────────────────
// 區段頭
// ──────────────────────────────────────────────────────────────────────────

export function SectionHeader({
  title,
  hint,
  right,
}: {
  title: string;
  hint?: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <span className="arc-title text-[15px]">{title}</span>
        {hint && (
          <p className="mt-1 text-[11px] font-semibold leading-snug text-[var(--cn-ink-3)]">
            {hint}
          </p>
        )}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// 資料標籤
// ──────────────────────────────────────────────────────────────────────────

type BadgeTone = 'signal' | 'vital' | 'reach' | 'caution' | 'alarm' | 'muted';

const BADGE_TONE: Record<BadgeTone, string> = {
  signal: 'border-[var(--cn-coral)] text-[var(--cn-coral-deep)] bg-[var(--cn-coral-soft)]',
  vital: 'border-[var(--cn-mint)] text-[var(--cn-mint-deep)] bg-[var(--cn-mint-soft)]',
  reach: 'border-[var(--cn-grape)] text-[var(--cn-grape-deep)] bg-[var(--cn-grape-soft)]',
  caution: 'border-[var(--cn-sun)] text-[var(--cn-sun-deep)] bg-[var(--cn-sun-soft)]',
  alarm: 'border-[var(--cn-alert)] text-[var(--cn-alert-deep)] bg-[var(--cn-alert-soft)]',
  muted: 'border-[var(--cn-line-soft)] text-[var(--cn-ink-3)] bg-[var(--cn-card)]',
};

export function Badge({ label, tone = 'muted' }: { label: string; tone?: BadgeTone }) {
  return (
    <span
      className={`whitespace-nowrap rounded-[var(--cn-r-pill)] border-2 px-2 py-0.5 text-[10px] font-extrabold leading-[16px] tracking-[0.04em] ${BADGE_TONE[tone]}`}
    >
      {label}
    </span>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Hero
// ──────────────────────────────────────────────────────────────────────────

type SegmentTone = 'signal' | 'vital' | 'alarm' | 'caution' | 'reach' | 'ink';

interface BriefingHeroProps {
  path: PathConfig;
  /** 標題上方的說明（章節／任務目標） */
  eyebrow: string;
  title: string;
  description: string;
  topBadges?: ReactNode;
  /** 底部資料格 */
  stats: { label: string; value: string | number; unit?: string }[];
  /** 地圖原生難度：與玩家選的「難度設定」分開呈現，避免兩組星星混在一起 */
  nativeDifficulty?: { label: string; filled: number; tone: SegmentTone; caption: string };
}

export function BriefingHero({
  path,
  eyebrow,
  title,
  description,
  topBadges,
  stats,
  nativeDifficulty,
}: BriefingHeroProps) {
  return (
    <section className="arc-panel grid shrink-0 overflow-hidden lg:grid-cols-[232px_minmax(0,1fr)]">
      <div className="flex flex-col justify-center gap-2 border-b-[3px] border-[var(--cn-line-soft)] bg-[var(--cn-card-2)] p-3 lg:border-b-0 lg:border-r-[3px]">
        <PathPreview pathConfig={path} size="normal" className="w-full shrink-0" />
        <div className="flex items-center justify-between rounded-[var(--cn-r-sm)] border-2 border-[var(--cn-line-soft)] bg-[var(--cn-card)] px-2 py-1 text-[10px] font-extrabold text-[var(--cn-ink-3)]">
          <span>grid 15 × 11</span>
          <span className="font-mono uppercase tracking-[0.06em]">{path.category ?? 'path'}</span>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="arc-label">{eyebrow}</span>
            <h2 className="mt-1 text-[26px] font-black leading-[1.15] tracking-[-0.02em] text-[var(--cn-ink)]">
              {title}
            </h2>
          </div>
          {topBadges && <div className="flex shrink-0 flex-wrap justify-end gap-1">{topBadges}</div>}
        </div>

        {description && (
          <p className="max-w-[68ch] text-[13px] font-medium leading-relaxed text-[var(--cn-ink-2)]">
            {description}
          </p>
        )}

        <div className="mt-auto grid grid-cols-2 gap-2 border-t-[3px] border-[var(--cn-line-soft)] pt-3 sm:grid-cols-4">
          {stats.map((s) => (
            <StatCell key={s.label} label={s.label} value={s.value} unit={s.unit} />
          ))}
          {nativeDifficulty && (
            <div className="flex flex-col gap-1">
              <span className="arc-label">{nativeDifficulty.label}</span>
              <span className="flex items-center gap-2">
                <Segments
                  total={5}
                  filled={nativeDifficulty.filled}
                  size="sm"
                  tone={nativeDifficulty.tone}
                />
                <span className="text-[11px] font-extrabold text-[var(--cn-ink-3)]">
                  {nativeDifficulty.caption}
                </span>
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// 空狀態
// ──────────────────────────────────────────────────────────────────────────

export function EmptyBriefing({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center p-6">
      <Empty title={title} hint={hint} className="w-full max-w-[420px]" />
    </div>
  );
}
