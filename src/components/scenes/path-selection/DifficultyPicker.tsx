/**
 * 簡報層 · 玩家難度 6 格
 *
 * 六張方塊卡：序號 + 名稱 + 5 格刻度，點擊即切換（radio 語意，不是動作鍵）。
 * 自訂難度不畫刻度（stars = 0），右側參數格與滑桿會接手說明它到底多難。
 */

import type { GameDifficulty } from '@/types/game';
import { useTranslation } from '@/i18n';
import { Segments } from '@/components/hl';
import { playUiHover } from '@/services/audioService';
import {
  GAME_DIFFICULTY_META,
  GAME_DIFFICULTY_ORDER,
  getGameDifficultyLabel,
} from './difficultyMeta';

interface DifficultyPickerProps {
  selected: GameDifficulty;
  onChange: (difficulty: GameDifficulty) => void;
}

export function DifficultyPicker({ selected, onChange }: DifficultyPickerProps) {
  const { t } = useTranslation();

  return (
    <div role="radiogroup" className="grid grid-cols-3 gap-2 sm:grid-cols-6">
      {GAME_DIFFICULTY_ORDER.map((difficulty, index) => {
        const meta = GAME_DIFFICULTY_META[difficulty];
        const active = difficulty === selected;
        return (
          <button
            key={difficulty}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(difficulty)}
            onMouseEnter={() => playUiHover()}
            className={[
              'flex flex-col items-center justify-center gap-2 rounded-[var(--cn-r-md)] border-[3px] px-1.5 py-2.5',
              'transition-[background-color,border-color,box-shadow] duration-[160ms]',
              active
                ? 'border-[var(--cn-line)] bg-[var(--cn-coral-soft)] shadow-[0_4px_0_var(--cn-coral-deep)]'
                : 'border-[var(--cn-line-soft)] bg-[var(--cn-card)] shadow-[0_3px_0_var(--cn-line-soft)] hover:border-[var(--cn-line-mid)] hover:bg-[var(--cn-card-2)]',
            ].join(' ')}
          >
            <span
              className={[
                'font-mono text-[9.5px] font-extrabold leading-none tabular-nums',
                active ? 'text-[var(--cn-signal-text)]' : 'text-[var(--cn-ink-4)]',
              ].join(' ')}
            >
              {String(index + 1).padStart(2, '0')}
            </span>
            <span
              className={[
                'w-full truncate text-center text-[12px] leading-tight',
                active ? 'font-black text-[var(--cn-ink)]' : 'font-bold text-[var(--cn-ink-2)]',
              ].join(' ')}
            >
              {getGameDifficultyLabel(t, difficulty)}
            </span>
            {meta.stars > 0 ? (
              <Segments total={5} filled={meta.stars} size="sm" tone={meta.tone} fluid />
            ) : (
              <span className="h-3 w-full" aria-hidden="true" />
            )}
          </button>
        );
      })}
    </div>
  );
}

export default DifficultyPicker;
