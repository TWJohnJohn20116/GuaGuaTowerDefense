/**
 * 戰前簡報 · 難度分段（HARDLINE）
 *
 * 六個方塊並排：mono 編號、名稱、5 格難度刻度。
 * 沒有漸層、沒有發光；選中＝訊號線 + 訊號膜。
 */

import type { GameDifficulty } from '@/types/game';
import { useTranslation } from '@/i18n';
import { Btn, Segments } from '@/components/hl';
import { DIFFICULTY_META, DIFF_ORDER, getGameDifficultyLabel } from './difficulty';

interface DifficultyRowProps {
  selected: GameDifficulty;
  onChange: (d: GameDifficulty) => void;
}

export function DifficultyRow({ selected, onChange }: DifficultyRowProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
      {DIFF_ORDER.map((diff, i) => {
        const meta = DIFFICULTY_META[diff];
        const active = diff === selected;
        return (
          <Btn
            key={diff}
            size="lg"
            variant={active ? 'quiet' : 'ghost'}
            onClick={() => onChange(diff)}
            aria-pressed={active}
            className={`h-auto flex-col gap-1.5 py-2.5 ${
              active
                ? 'border-[var(--hl-signal)] bg-[var(--hl-signal-veil)]'
                : 'border-[var(--hl-line)] bg-[var(--hl-deck-2)]'
            }`}
          >
            <span className="flex w-full items-center justify-between">
              <span
                className={`font-mono text-[9.5px] tabular-nums ${
                  active ? 'text-[var(--hl-signal)]' : 'text-[var(--hl-ink-4)]'
                }`}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className={`font-mono text-[9px] tabular-nums ${meta.text}`}>
                {meta.stars > 0 ? `${meta.stars}/5` : '—'}
              </span>
            </span>
            <span
              className={`w-full truncate text-center text-[11.5px] font-semibold ${
                active ? 'text-[var(--hl-ink)]' : 'text-[var(--hl-ink-2)]'
              }`}
            >
              {getGameDifficultyLabel(t, diff)}
            </span>
            <Segments total={5} filled={meta.stars} size="sm" tone={meta.tone} />
          </Btn>
        );
      })}
    </div>
  );
}

export default DifficultyRow;
