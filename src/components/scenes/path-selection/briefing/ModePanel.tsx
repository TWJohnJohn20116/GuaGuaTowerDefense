/**
 * 戰前簡報 · 遊戲模式（HARDLINE）
 *
 * 無盡模式用 Toggle；目標波次與波次組都是方塊列，不用圓角卡片。
 */

import { useMemo } from 'react';
import { useTranslation } from '@/i18n';
import { useModStore } from '@/store/modStore';
import { getPlayableWaveSets, getWaveSetSourceLabel } from '@/utils/waveSets';
import { Btn, SegHead, Toggle } from '@/components/hl';

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
    <div className="flex flex-col gap-1.5">
      {/* 無盡模式 */}
      <div className="flex items-center justify-between rounded-[14px] border-[3px] border-[var(--cn-line-soft)] bg-[var(--cn-card-2)] px-3 py-2.5">
        <div className="min-w-0">
          <div className="text-[12.5px] font-medium text-[var(--arc-ink)]">
            {t.pathSelection.endlessMode}
          </div>
          <div className="mt-0.5 text-[10.5px] text-[var(--arc-ink-3)]">
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
        <div className="rounded-[14px] border-[3px] border-[var(--cn-line-soft)] bg-[var(--cn-card-2)] px-3 py-2.5">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="arc-label">{t.pathSelection.targetWaves}</span>
            <span className="font-mono text-[11px] tabular-nums text-[var(--arc-ink)]">
              {usingCustomWaveSet
                ? `${activeWaveSet?.wavesCount ?? 0} ${t.pathSelection.waves}`
                : `${selectedWaves} ${t.pathSelection.waves}`}
            </span>
          </div>
          <div className="grid grid-cols-6 gap-1">
            {WAVE_OPTIONS.map((w) => {
              const active = selectedWaves === w && !usingCustomWaveSet;
              return (
                <Btn
                  key={w}
                  size="sm"
                  variant={active ? 'quiet' : 'ghost'}
                  disabled={usingCustomWaveSet}
                  onClick={() => {
                    setSelectedWaves(w);
                    setCustomWaveSetId('');
                  }}
                  className={`font-mono tabular-nums ${
                    active
                      ? 'border-[var(--arc-gold)] bg-[var(--arc-gold-veil)] text-[var(--arc-gold)]'
                      : 'border-[var(--cn-line-soft)] text-[var(--arc-ink-3)]'
                  }`}
                >
                  {w}
                </Btn>
              );
            })}
          </div>
        </div>
      )}

      {!endlessMode && hasWaveSets && (
        <div className="border-[3px] border-[var(--cn-line-soft)] bg-[var(--arc-void-2)]">
          <div className="flex items-center justify-between gap-3 border-b border-[var(--cn-line-soft)] px-3 py-2">
            <SegHead
              label={t.pathSelectionExt.customWaveLabel}
              className="flex-1"
              right={
                usingCustomWaveSet ? (
                  <Btn
                    size="sm"
                    variant="ghost"
                    onClick={() => setCustomWaveSetId('')}
                  >
                    {t.common.cancel}
                  </Btn>
                ) : undefined
              }
            />
          </div>
          <div className="max-h-44 overflow-y-auto">
            {availableWaveSets.map((ws) => {
              const active = ws.id === customWaveSetId;
              return (
                <button
                  key={ws.id}
                  type="button"
                  onClick={() => setCustomWaveSetId(active ? '' : ws.id)}
                  className="arc-row arc-row-hover w-full text-left"
                >
                  <span
                    className={`h-3 w-[2px] shrink-0 ${
                      active ? 'bg-[var(--arc-gold)]' : 'bg-transparent'
                    }`}
                  />
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block truncate text-[12px] ${
                        active ? 'text-[var(--arc-ink)]' : 'text-[var(--arc-ink-2)]'
                      }`}
                    >
                      {ws.name}
                    </span>
                    <span className="mt-0.5 block truncate font-mono text-[9.5px] uppercase tracking-[0.08em] text-[var(--arc-ink-4)]">
                      {ws.modName}
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-[10px] tabular-nums text-[var(--arc-ink-3)]">
                    {ws.wavesCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default ModePanel;
