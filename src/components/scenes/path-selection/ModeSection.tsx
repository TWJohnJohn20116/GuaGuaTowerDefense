/**
 * 簡報層 · 遊戲模式
 *
 * 三層，順序就是決策順序：無盡開關（這局有沒有終點）→ 目標波次（多長）
 * → 自訂波次組（用哪套波）。後兩者互斥：選了波次組就由該組的波數決定長度。
 * 波次組清單預設收起，十幾組攤開會把簡報層撐得比地圖資訊還長。
 */

import { useMemo } from 'react';
import { useTranslation } from '@/i18n';
import { useModStore } from '@/store/modStore';
import { getPlayableWaveSets, getWaveSetSourceLabel } from '@/utils/waveSets';
import { Btn, Toggle } from '@/components/hl';
import { playUiHover } from '@/services/audioService';

const WAVE_OPTIONS = [10, 15, 20, 30, 50, 100];

interface ModeSectionProps {
  endlessMode: boolean;
  setEndlessMode: (endless: boolean) => void;
  selectedWaves: number;
  setSelectedWaves: (waves: number) => void;
  customWaveSetId: string;
  setCustomWaveSetId: (id: string) => void;
}

export function ModeSection({
  endlessMode,
  setEndlessMode,
  selectedWaves,
  setSelectedWaves,
  customWaveSetId,
  setCustomWaveSetId,
}: ModeSectionProps) {
  const { t } = useTranslation();
  const mods = useModStore((state) => state.mods);

  const waveSets = useMemo(
    () =>
      getPlayableWaveSets().map((set) => ({
        id: set.id,
        name: set.name,
        source: getWaveSetSourceLabel(set),
        waves: set.waves.length,
      })),
    [mods],
  );

  const hasWaveSets = waveSets.length > 0;
  const usingWaveSet = !!customWaveSetId && hasWaveSets;
  const activeWaveSet = waveSets.find((set) => set.id === customWaveSetId);

  return (
    <div className="flex flex-col gap-2">
      <div className={`grid gap-2 ${endlessMode ? '' : 'lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]'}`}>
        {/* 無盡開關 */}
        <div className="flex items-center justify-between gap-3 rounded-[var(--cn-r-md)] border-[3px] border-[var(--cn-line-soft)] bg-[var(--cn-card)] px-3 py-2.5">
          <div className="min-w-0">
            <div className="text-[12.5px] font-extrabold text-[var(--cn-ink)]">
              {t.pathSelection.endlessMode}
            </div>
            <div className="mt-0.5 text-[11px] font-semibold text-[var(--cn-ink-3)]">
              {t.pathSelection.endlessDesc}
            </div>
          </div>
          <Toggle
            on={endlessMode}
            onChange={setEndlessMode}
            label={t.pathSelection.endlessMode}
          />
        </div>

        {/* 目標波次 */}
        {!endlessMode && (
          <div className="rounded-[var(--cn-r-md)] border-[3px] border-[var(--cn-line-soft)] bg-[var(--cn-card)] px-3 py-2.5">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="arc-label">{t.pathSelection.targetWaves}</span>
              <span className="font-mono text-[12px] font-extrabold tabular-nums text-[var(--cn-ink)]">
                {usingWaveSet
                  ? `${activeWaveSet?.waves ?? 0} ${t.pathSelection.waves}`
                  : `${selectedWaves} ${t.pathSelection.waves}`}
              </span>
            </div>
            <div role="radiogroup" className="grid grid-cols-6 gap-1.5">
              {WAVE_OPTIONS.map((waves) => {
                const active = selectedWaves === waves && !usingWaveSet;
                return (
                  <button
                    key={waves}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    disabled={usingWaveSet}
                    onClick={() => {
                      setSelectedWaves(waves);
                      setCustomWaveSetId('');
                    }}
                    onMouseEnter={() => playUiHover()}
                    className={[
                      'rounded-[var(--cn-r-sm)] border-[3px] py-1.5 font-mono text-[12px] font-extrabold tabular-nums',
                      'transition-[background-color,border-color,box-shadow] duration-[160ms]',
                      'disabled:cursor-not-allowed disabled:opacity-40',
                      active
                        ? 'border-[var(--cn-line)] bg-[var(--cn-sun)] text-[var(--cn-ink)] shadow-[0_3px_0_var(--cn-sun-deep)]'
                        : 'border-[var(--cn-line-soft)] bg-[var(--cn-card-2)] text-[var(--cn-ink-2)] hover:border-[var(--cn-line-mid)] hover:text-[var(--cn-ink)]',
                    ].join(' ')}
                  >
                    {waves}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 自訂波次組 */}
      {!endlessMode && hasWaveSets && (
        <details className="group rounded-[var(--cn-r-md)] border-[3px] border-[var(--cn-line-soft)] bg-[var(--cn-card)]">
          <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2.5 [&::-webkit-details-marker]:hidden">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-[var(--cn-line-soft)] text-[10px] leading-none text-[var(--cn-ink-3)] transition-transform duration-200 group-open:rotate-90">
              ▸
            </span>
            <span className="min-w-0 flex-1 truncate text-[12px] font-extrabold text-[var(--cn-ink-2)]">
              {t.pathSelectionExt.customWaveLabel}
            </span>
            <span className="shrink-0 truncate font-mono text-[10px] font-extrabold uppercase tracking-[0.06em] text-[var(--cn-ink-4)]">
              {usingWaveSet ? activeWaveSet?.name : String(waveSets.length)}
            </span>
          </summary>

          <div className="max-h-44 overflow-y-auto border-t-[3px] border-[var(--cn-line-soft)]">
            {waveSets.map((set) => {
              const active = set.id === customWaveSetId;
              return (
                <button
                  key={set.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCustomWaveSetId(active ? '' : set.id)}
                  onMouseEnter={() => playUiHover()}
                  className={[
                    'flex w-full items-center gap-2.5 border-b border-[var(--cn-line-soft)] px-3 py-2 text-left last:border-b-0',
                    'transition-colors duration-[160ms]',
                    active ? 'bg-[var(--cn-coral-soft)]' : 'hover:bg-[var(--cn-card-2)]',
                  ].join(' ')}
                >
                  <span
                    className={`h-4 w-[3px] shrink-0 rounded-full ${active ? 'bg-[var(--cn-coral)]' : 'bg-transparent'}`}
                  />
                  <span className="min-w-0 flex-1">
                    <span
                      className={[
                        'block truncate text-[12px]',
                        active
                          ? 'font-extrabold text-[var(--cn-ink)]'
                          : 'font-bold text-[var(--cn-ink-2)]',
                      ].join(' ')}
                    >
                      {set.name}
                    </span>
                    <span className="mt-0.5 block truncate font-mono text-[9.5px] uppercase tracking-[0.06em] text-[var(--cn-ink-4)]">
                      {set.source}
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-[11px] font-extrabold tabular-nums text-[var(--cn-ink-3)]">
                    {set.waves}
                  </span>
                </button>
              );
            })}
          </div>

          {usingWaveSet && (
            <div className="flex justify-end border-t-[3px] border-[var(--cn-line-soft)] px-3 py-2">
              <Btn size="sm" variant="ghost" onClick={() => setCustomWaveSetId('')}>
                {t.common.cancel}
              </Btn>
            </div>
          )}
        </details>
      )}
    </div>
  );
}

export default ModeSection;
