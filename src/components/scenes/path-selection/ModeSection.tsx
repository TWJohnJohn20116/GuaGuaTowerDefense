/**
 * 簡報層 · 遊戲模式
 *
 * 兩個控制塊並排靠左（無盡開關、目標波次），波次組清單收在下方。
 * 關鍵約束：**點任何一個控制都不准移動其他控制的位置**。
 * 舊版把波次塊用條件渲染拿掉，無盡一開左塊就撐滿整行、開關被推到最右邊——
 * 所以這裡改成：無盡開啟時波次塊灰掉停用，而不是消失。
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
  // 無盡模式沒有終點，波次長度與波次組都失去意義——停用而不是隱藏
  const waveBlockOff = endlessMode || usingWaveSet;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-start gap-2">
        {/* 無盡模式：寬度由內容決定，開關緊貼說明，不會被推走 */}
        <div className="flex items-center gap-3 rounded-[var(--cn-r-md)] border-[3px] border-[var(--cn-line-soft)] bg-[var(--cn-card)] px-3 py-2">
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

        {/* 目標波次：無盡時灰掉，位置不動 */}
        <div
          className={[
            'flex flex-wrap items-center gap-2 rounded-[var(--cn-r-md)] border-[3px] border-[var(--cn-line-soft)] bg-[var(--cn-card)] px-3 py-2',
            'transition-opacity duration-[160ms]',
            endlessMode ? 'opacity-45' : '',
          ].join(' ')}
        >
          <span className="arc-label shrink-0">{t.pathSelection.targetWaves}</span>

          {/* 固定寬度的籤：邊框恆為 2px、陰影只往下，選中只換色，位置不會隨點擊位移 */}
          <div role="radiogroup" className="flex flex-wrap items-center gap-1.5">
            {WAVE_OPTIONS.map((waves) => {
              const active = selectedWaves === waves && !usingWaveSet;
              return (
                <button
                  key={waves}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  disabled={waveBlockOff}
                  onClick={() => {
                    setSelectedWaves(waves);
                    setCustomWaveSetId('');
                  }}
                  onMouseEnter={() => playUiHover()}
                  className={[
                    'min-w-[56px] rounded-[var(--cn-r-pill)] border-2 px-3 py-1.5',
                    'font-mono text-[12px] font-extrabold tabular-nums',
                    'transition-[background-color,border-color,color] duration-[160ms]',
                    'disabled:cursor-not-allowed',
                    active
                      ? 'border-[var(--cn-line)] bg-[var(--cn-sun)] text-[var(--cn-ink)]'
                      : 'border-[var(--cn-line-soft)] bg-[var(--cn-card-2)] text-[var(--cn-ink-2)] hover:border-[var(--cn-line-mid)] hover:text-[var(--cn-ink)]',
                  ].join(' ')}
                >
                  {waves}
                </button>
              );
            })}
          </div>

          <span className="ml-1 shrink-0 font-mono text-[12px] font-extrabold tabular-nums text-[var(--cn-ink)]">
            {endlessMode
              ? '∞'
              : usingWaveSet
                ? `${activeWaveSet?.waves ?? 0} ${t.pathSelection.waves}`
                : `${selectedWaves} ${t.pathSelection.waves}`}
          </span>
        </div>
      </div>

      {/* 自訂波次組：無盡時同樣灰掉而非消失 */}
      {hasWaveSets && (
        <details
          className={[
            'group rounded-[var(--cn-r-md)] border-[3px] border-[var(--cn-line-soft)] bg-[var(--cn-card)]',
            'transition-opacity duration-[160ms]',
            endlessMode ? 'pointer-events-none opacity-45' : '',
          ].join(' ')}
        >
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
