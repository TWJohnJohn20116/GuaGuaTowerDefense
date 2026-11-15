/**
 * 戰前簡報 · 難度分段（CANDY POP）
 *
 * 六張方塊卡：編號 + 名稱 + 5 格刻度。點擊即切換，選中＝墨線 + 珊瑚膜 + 硬投影收合。
 * 不使用 Btn：難度卡是「可選資料格」，不是動作鍵，行為與外觀都更接近 radio。
 */

import type { GameDifficulty } from '@/types/game';
import { useTranslation } from '@/i18n';
import { Segments } from '@/components/hl';
import { DIFFICULTY_META, DIFF_ORDER, getGameDifficultyLabel } from './difficulty';

interface DifficultyRowProps {
  selected: GameDifficulty;
  onChange: (d: GameDifficulty) => void;
}

export function DifficultyRow({ selected, onChange }: DifficultyRowProps) {
  const { t } = useTranslation();

  return (
    <div role="radiogroup" className="grid flex-1 grid-cols-3 gap-2 sm:grid-cols-6">
      {DIFF_ORDER.map((diff, i) => {
        const meta = DIFFICULTY_META[diff];
        const active = diff === selected;
        return (
          <button
            key={diff}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(diff)}
            className={[
              'flex flex-col items-center justify-center gap-2 rounded-[var(--cn-r-md)] border-[3px] px-2 py-2.5',
              'transition-[background-color,border-color,box-shadow,transform] duration-[160ms]',
              active
                ? 'border-[var(--cn-line)] bg-[var(--cn-coral-soft)] shadow-[0_4px_0_var(--cn-coral-deep)]'
                : 'border-[var(--cn-line-soft)] bg-[var(--cn-card)] shadow-[0_3px_0_var(--cn-line-soft)] hover:border-[var(--cn-line-mid)] hover:bg-[var(--cn-card-2)]',
            ].join(' ')}
          >
            <span
              className={[
                'font-mono text-[9.5px] font-extrabold tabular-nums leading-none',
                active ? 'text-[var(--cn-signal-text)]' : 'text-[var(--cn-ink-4)]',
              ].join(' ')}
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            <span
              className={[
                'w-full truncate text-center text-[12px] leading-tight',
                active
                  ? 'font-black text-[var(--cn-ink)]'
                  : 'font-bold text-[var(--cn-ink-2)]',
              ].join(' ')}
            >
              {getGameDifficultyLabel(t, diff)}
            </span>
            <Segments total={5} filled={meta.stars} size="sm" tone={meta.tone} fluid />
          </button>
        );
      })}
    </div>
  );
}

export default DifficultyRow;
