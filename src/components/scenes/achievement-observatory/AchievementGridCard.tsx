/**
 * 檔案館 · 卷宗列（HARDLINE）
 *
 * 一列就是一份卷宗：狀態字形、稀有度代碼、名稱、進度方塊、狀態、點數。
 * 不用卡片，因為這裡要一次掃很多筆。
 */
import type { Achievement, AchievementStatus } from '@/types/achievement';
import { RARITY_CONFIG } from '@/types/achievement';
import {
  ProgressBlocks,
  RARITY_CODE,
  RARITY_TONE,
  STATE_GLYPH,
  STATE_TONE,
  TONE_TEXT,
  isEarned,
} from './observatoryShared';
import { useTranslation } from '@/i18n';

export interface AchievementGridCardProps {
  achievement: Achievement;
  status: AchievementStatus;
  pct: number;
  selected: boolean;
  highlighted: boolean;
  onSelect: () => void;
}

export function AchievementGridCard({
  achievement,
  status,
  pct,
  selected,
  highlighted,
  onSelect,
}: AchievementGridCardProps) {
  const { t } = useTranslation();
  const o = t.achievements.observatory;
  const cfg = RARITY_CONFIG[achievement.rarity];
  const tone = RARITY_TONE[achievement.rarity];
  const earned = isEarned(status);
  const claimable = status === 'completed';
  const secretLocked = (achievement.secret || achievement.hidden) && !earned;
  const stateTone = STATE_TONE[status];

  const statusLabel = claimable
    ? o.filterClaimable
    : earned
      ? o.earnedBadge
      : pct > 0
        ? `${Math.round(pct)}%`
        : o.lockedBadge;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={[
        'group relative grid w-full grid-cols-[18px_18px_minmax(0,1fr)_182px_62px_44px] items-center gap-3',
        'border-b border-[var(--hl-line)] py-2 pl-2 pr-3 text-left transition-colors duration-150',
        selected
          ? 'bg-[var(--hl-deck-2)]'
          : highlighted
            ? 'bg-[rgba(255,182,39,0.07)]'
            : 'bg-transparent hover:bg-[var(--hl-deck-2)]',
      ].join(' ')}
    >
      {/* 選中記號：左緣 2px 訊號條 */}
      <span
        aria-hidden="true"
        className={`absolute left-0 top-0 h-full w-[2px] ${selected ? 'bg-[var(--hl-signal)]' : 'bg-transparent'}`}
      />

      {/* 狀態字形 */}
      <span
        className={`text-center font-mono text-[11px] leading-none ${TONE_TEXT[stateTone]} ${
          claimable ? 'animate-pulse' : ''
        }`}
        title={statusLabel}
      >
        {STATE_GLYPH[status]}
      </span>

      {/* 稀有度代碼 */}
      <span
        className={`text-center font-mono text-[10px] leading-none tracking-[0.06em] ${
          earned ? TONE_TEXT[tone] : 'text-[var(--hl-ink-4)]'
        }`}
      >
        {RARITY_CODE[achievement.rarity]}
      </span>

      {/* 名稱 */}
      <span className="min-w-0">
        <span
          className={`block truncate text-[13px] leading-tight ${
            earned ? 'text-[var(--hl-ink-2)]' : 'text-[var(--hl-ink)]'
          }`}
        >
          {secretLocked ? '?????' : achievement.name}
        </span>
      </span>

      {/* 進度方塊 */}
      <span className="hidden w-full sm:block">
        <ProgressBlocks
          pct={earned ? 100 : pct}
          total={20}
          tone={earned ? 'vital' : claimable ? 'caution' : 'ink'}
          height={7}
          fill
        />
      </span>

      {/* 狀態字 */}
      <span
        className={`truncate text-right font-mono text-[9.5px] uppercase tracking-[0.08em] ${
          claimable
            ? 'text-[var(--hl-caution)]'
            : earned
              ? 'text-[var(--hl-vital)]'
              : 'text-[var(--hl-ink-4)]'
        }`}
      >
        {statusLabel}
      </span>

      {/* 點數 */}
      <span className="text-right font-mono text-[10.5px] tabular-nums text-[var(--hl-ink-3)]">
        +{cfg.points}
      </span>
    </button>
  );
}

export default AchievementGridCard;
