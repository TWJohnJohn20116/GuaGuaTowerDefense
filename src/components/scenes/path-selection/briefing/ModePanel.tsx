/**
 * 戰前簡報 · 遊戲模式（CANDY POP）
 *
 * 三層：無盡開關 → 目標波次方塊 → 自訂波次組清單。
 * 波次方塊是 radio（改變出擊長度），不是動作鍵；自訂波次組清單預設收起，
 * 避免十幾個波次組把主區撐爆。
 */

import { useMemo } from 'react';
import { useTranslation } from '@/i18n';
import { useModStore } from '@/store/modStore';
import { getPlayableWaveSets, getWaveSetSourceLabel } from '@/utils/waveSets';
import { Btn, Toggle } from '@/components/hl';

interface ModePanelProps {
  endlessMode: boolean;
  setEndlessMode: (e: boolean) => void;
  selectedWaves: number;
  setSelectedWaves: (w: number) => void;
  customWaveSetId: string;
  setCustomWaveSetId: (id: string) => void;
}

const WAVE_OPTIONS = [10, 15, 20, 30, 50, 100];

export function ModePanel({
  endlessMode,
  setEndlessMode,
  selectedWaves,
  setSelectedWaves,
  customWaveSetId,
  setCustomWaveSetId,
}: ModePanelProps) {
  const { t } = useTranslation();
  const mods = useModStore((s) => s.mods);

  const availableWaveSets = useMemo(() => {
    return getPlayableWaveSets().map((w) => ({
      id: w.id,
      name: w.name,
      modName: getWaveSetSourceLabel(w),
      wavesCount: w.waves.length,
    }));
  }, [mods]);

  const hasWaveSets = availableWaveSets.length > 0;
  const usingCustomWaveSet = !!customWaveSetId && hasWaveSets;
  const activeWaveSet = availableWaveSets.find((w) => w.id === customWaveSetId);

  return (
    <div className="flex flex-col gap-2">
      {/* 無盡開關與波次長度並排：兩者都決定「這一局多長」，放同一列才看得出互斥 */}
      <div
        className={`grid gap-2 ${
          endlessMode ? '' : 'lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]'
        }`}
      >
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
            onChange={(v) => setEndlessMode(v)}
            label={t.pathSelection.endlessMode}
          />
        </div>

        {!endlessMode && (
        <div className="rounded-[var(--cn-r-md)] border-[3px] border-[var(--cn-line-soft)] bg-[var(--cn-card)] px-3 py-2.5">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="arc-label">{t.pathSelection.targetWaves}</span>
            <span className="font-mono text-[12px] font-extrabold tabular-nums text-[var(--cn-ink)]">
              {usingCustomWaveSet
                ? `${activeWaveSet?.wavesCount ?? 0} ${t.pathSelection.waves}`
                : `${selectedWaves} ${t.pathSelection.waves}`}
            </span>
          </div>
          <div role="radiogroup" className="grid grid-cols-6 gap-1.5">
            {WAVE_OPTIONS.map((w) => {
              const active = selectedWaves === w && !usingCustomWaveSet;
              return (
                <button
                  key={w}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  disabled={usingCustomWaveSet}
                  onClick={() => {
                    setSelectedWaves(w);
                    setCustomWaveSetId('');
                  }}
                  className={[
                    'rounded-[var(--cn-r-sm)] border-[3px] py-1.5 font-mono text-[12px] font-extrabold tabular-nums',
                    'transition-[background-color,border-color,box-shadow] duration-[160ms]',
                    'disabled:cursor-not-allowed disabled:opacity-40',
                    active
                      ? 'border-[var(--cn-line)] bg-[var(--cn-sun)] text-[var(--cn-ink)] shadow-[0_3px_0_var(--cn-sun-deep)]'
                      : 'border-[var(--cn-line-soft)] bg-[var(--cn-card-2)] text-[var(--cn-ink-2)] hover:border-[var(--cn-line-mid)] hover:text-[var(--cn-ink)]',
                  ].join(' ')}
                >
                  {w}
                </button>
              );
            })}
          </div>
        </div>
      )}
      </div>

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
              {usingCustomWaveSet ? activeWaveSet?.name : `${availableWaveSets.length}`}
            </span>
          </summary>

          <div className="max-h-44 overflow-y-auto border-t-[3px] border-[var(--cn-line-soft)]">
            {availableWaveSets.map((ws) => {
              const active = ws.id === customWaveSetId;
              return (
                <button
                  key={ws.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCustomWaveSetId(active ? '' : ws.id)}
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
                        active ? 'font-extrabold text-[var(--cn-ink)]' : 'font-bold text-[var(--cn-ink-2)]',
                      ].join(' ')}
                    >
                      {ws.name}
                    </span>
                    <span className="mt-0.5 block truncate font-mono text-[9.5px] uppercase tracking-[0.06em] text-[var(--cn-ink-4)]">
                      {ws.modName}
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-[11px] font-extrabold tabular-nums text-[var(--cn-ink-3)]">
                    {ws.wavesCount}
                  </span>
                </button>
              );
            })}
          </div>

          {usingCustomWaveSet && (
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

export default ModePanel;
