/**
 * 檔案館 · 共用（HARDLINE）
 *
 * 稀有度用「代碼 + 方塊列」表達，不寫長字：C / U / R / E / L。
 * 顏色只表達稀有度本身，不用來裝飾卡片。
 */
import type { AchievementRarity, AchievementStatus } from '@/types/achievement';

export const RARITY_ORDER: AchievementRarity[] = [
  'legendary',
  'epic',
  'rare',
  'uncommon',
  'common',
];

export const isEarned = (s: AchievementStatus) => s === 'completed' || s === 'claimed';

export type ObservatoryFilterMode = 'all' | 'completed' | 'in_progress' | 'locked' | 'claimable';

export type RarityTone = 'ink' | 'vital' | 'reach' | 'caution' | 'alarm';

export const RARITY_TONE: Record<AchievementRarity, RarityTone> = {
  common: 'ink',
  uncommon: 'vital',
  rare: 'reach',
  epic: 'caution',
  legendary: 'alarm',
};

/** 稀有度代碼：檔案館用字母分級，比五個中文詞好掃。 */
export const RARITY_CODE: Record<AchievementRarity, string> = {
  common: 'C',
  uncommon: 'U',
  rare: 'R',
  epic: 'E',
  legendary: 'L',
};

/** 稀有度級數 1–5，用來畫方塊列。 */
export const RARITY_RANK: Record<AchievementRarity, number> = {
  common: 1,
  uncommon: 2,
  rare: 3,
  epic: 4,
  legendary: 5,
};

export const TONE_TEXT: Record<RarityTone, string> = {
  ink: 'text-[var(--hl-ink-2)]',
  vital: 'text-[var(--hl-vital)]',
  reach: 'text-[var(--hl-reach)]',
  caution: 'text-[var(--hl-caution)]',
  alarm: 'text-[var(--hl-alarm)]',
};

export const TONE_FILL: Record<RarityTone, string> = {
  ink: 'bg-[var(--hl-ink-3)]',
  vital: 'bg-[var(--hl-vital)]',
  reach: 'bg-[var(--hl-reach)]',
  caution: 'bg-[var(--hl-caution)]',
  alarm: 'bg-[var(--hl-alarm)]',
};

export const TONE_BORDER: Record<RarityTone, string> = {
  ink: 'border-[var(--hl-ink-3)]',
  vital: 'border-[var(--hl-vital)]',
  reach: 'border-[var(--hl-reach)]',
  caution: 'border-[var(--hl-caution)]',
  alarm: 'border-[var(--hl-alarm)]',
};

/** 狀態字形：檔案館的「卷宗狀態」欄。 */
export const STATE_GLYPH: Record<AchievementStatus, string> = {
  completed: '!',
  claimed: '✓',
  in_progress: '▸',
  locked: '·',
};

export const STATE_TONE: Record<AchievementStatus, RarityTone> = {
  completed: 'caution',
  claimed: 'vital',
  in_progress: 'reach',
  locked: 'ink',
};

/** 稀有度方塊列：5 格，亮到第 rank 格。 */
export function RarityBlocks({
  rank,
  tone,
  size = 6,
  className = '',
}: {
  rank: number;
  tone: RarityTone;
  size?: number;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-[2px] ${className}`} aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`block border ${
            i < rank ? `${TONE_FILL[tone]} ${TONE_BORDER[tone]}` : 'border-[var(--hl-line-strong)] bg-transparent'
          }`}
          style={{ width: size, height: size }}
        />
      ))}
    </span>
  );
}

/** 進度方塊列：檔案館的主要計量語言，取代細長進度條。 */
export function ProgressBlocks({
  pct,
  total = 20,
  tone = 'ink',
  height = 6,
  fill = false,
  className = '',
}: {
  pct: number;
  total?: number;
  tone?: RarityTone;
  height?: number;
  /** true：方塊均分容器寬度（表格欄位、帶狀計量） */
  fill?: boolean;
  className?: string;
}) {
  const filled = Math.round((Math.max(0, Math.min(100, pct)) / 100) * total);
  return (
    <span
      className={`inline-flex items-stretch gap-[2px] ${fill ? 'w-full' : ''} ${className}`}
      aria-hidden="true"
    >
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`block ${fill ? 'flex-1 min-w-[2px]' : 'w-[3px]'} ${
            i < filled ? TONE_FILL[tone] : 'bg-[var(--hl-line)]'
          }`}
          style={{ height }}
        />
      ))}
    </span>
  );
}

/** 稀有度標記（舊 API，保留給其他呼叫端） */
export function StarPoint({
  tone = 'ink',
  lit,
  size = 18,
  className = '',
}: {
  tone?: RarityTone;
  lit: boolean;
  size?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={[
        'inline-block shrink-0 border',
        lit ? `${TONE_FILL[tone]} border-transparent` : 'border-[var(--hl-line-strong)] bg-transparent',
        className,
      ].join(' ')}
      style={{ width: size, height: size }}
    />
  );
}

export const formatNum = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}K`;
  return String(n);
};

export { getAchievementConditionLabel as getConditionLabel } from '@/i18n/achievementConditionLabels';
