/**
 * 成就觀測站 · 下一個目標（HARDLINE：一排小方格，選中＝訊號線 + 訊號膜）
 */
import type { Achievement } from '@/types/achievement';
import { RARITY_CONFIG } from '@/types/achievement';
import { useTranslation } from '@/i18n';
import { Meter } from '@/components/hl';
import { RARITY_TONE, TONE_TEXT } from './observatoryShared';

interface TargetItem {
  achievement: Achievement;
  pct: number;
}

interface Props {
  targets: TargetItem[];
  focusedIndex: number;
  onSelect: (id: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

export function NextTargetsRail({ targets, focusedIndex, onSelect, onKeyDown }: Props) {
  const { t } = useTranslation();
  if (targets.length === 0) return null;

  return (
    <div
      tabIndex={0}
      role="listbox"
      aria-label={t.achievements.observatory.nextTargetsAria}
      onKeyDown={onKeyDown}
      className="flex gap-1 overflow-x-auto pb-0.5 outline-none"
    >
      {targets.map(({ achievement, pct }, i) => {
        const focused = i === focusedIndex;
        const tone = RARITY_TONE[achievement.rarity];
        return (
          <button
            key={achievement.id}
            type="button"
            role="option"
            aria-selected={focused}
            onClick={() => onSelect(achievement.id)}
            className={[
              'flex w-[132px] shrink-0 flex-col gap-1 border px-2 py-1.5 text-left transition-colors duration-150',
              focused
                ? 'border-[var(--hl-signal)] bg-[var(--hl-signal-veil)]'
                : 'border-[var(--hl-line)] bg-[var(--hl-deck)] hover:border-[var(--hl-line-hot)]',
            ].join(' ')}
          >
            <span className="flex items-center justify-between gap-1.5">
              <span
                className={`font-mono text-[9px] uppercase tracking-[0.06em] ${TONE_TEXT[tone]}`}
              >
                {RARITY_CONFIG[achievement.rarity].label}
              </span>
              <span className="font-mono text-[10px] tabular-nums text-[var(--hl-ink-2)]">
                {`${Math.round(pct)}%`}
              </span>
            </span>
            <span className="truncate text-[11.5px] text-[var(--hl-ink)]">{achievement.name}</span>
            <Meter value={pct} max={100} tone={focused ? 'signal' : 'ink'} />
          </button>
        );
      })}
    </div>
  );
}

export default NextTargetsRail;
