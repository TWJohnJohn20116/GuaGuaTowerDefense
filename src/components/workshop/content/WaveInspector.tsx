/**
 * 內容頁 · 波次檢視器（右欄上半）
 *
 * 選中的是「一波」時改波次層欄位；選中的是「一組」時多出這一組的數量與空隙。
 * 所有改動都往上丟（on*），不自己存世界資料——唯一真相仍在 store。
 */
import { useTranslation } from '@/i18n';
import { fillTemplate } from '@/i18n/fileMetaExtraLabels';
import { Btn, Chip, Deck, Empty, Field, IconBtn, Input, Num, SegHead, Toggle } from '@/components/hl';
import { PlusIcon, TrashIcon, WarningIcon } from '@/components/ui/Icons';
import { SelectableRow } from '@/components/ui/SelectableRow';
import {
  blockEndMs,
  delayOf,
  enemyLabel,
  flattenWave,
  summarizeWave,
  waveHpScale,
  waveIntervalMs,
  SPAWN_INTERVAL_MS,
  type EnemyLookup,
  type TimelineBlock,
  type TimelineWave,
} from '@/workshop/content/timeline';
import type { WaveBar } from '@/workshop/content/waveAnalysis';

/** 波次層可改的欄位（檢視器唯一的寫入形狀） */
export type WaveFieldPatch = Partial<
  Pick<TimelineWave, 'reward' | 'hpScale' | 'intervalMs' | 'enabled' | 'chapter' | 'name'>
>;

interface WaveInspectorProps {
  wave: TimelineWave | null;
  waveIndex: number | null;
  segment: TimelineBlock | null;
  bar: WaveBar | null;
  lookup: EnemyLookup;
  enemyNames?: Readonly<Record<string, string>>;
  onSelectSegment: (blockId: string) => void;
  onPatchWave: (patch: WaveFieldPatch) => void;
  onSegmentCount: (blockId: string, count: number) => void;
  onSegmentGap: (blockId: string, delayMs: number) => void;
  onSegmentShift: (blockId: string, startMs: number) => void;
  onRemoveSegment: (blockId: string) => void;
  onAddSegment: () => void;
  onDeleteWave: () => void;
  onMoveSegmentToWave: (toWave: number) => void;
  className?: string;
}

export function WaveInspector({
  wave,
  waveIndex,
  segment,
  bar,
  lookup,
  enemyNames,
  onSelectSegment,
  onPatchWave,
  onSegmentCount,
  onSegmentGap,
  onSegmentShift,
  onRemoveSegment,
  onAddSegment,
  onDeleteWave,
  onMoveSegmentToWave,
  className = '',
}: WaveInspectorProps) {
  const { t } = useTranslation();
  const c = t.studio.content;
  const w = c.wave;
  const ins = c.detail;

  if (!wave || waveIndex === null) {
    return (
      <Deck tone="sunken" className={`flex min-h-0 flex-col gap-2 p-3 ${className}`}>
        <SegHead label={c.inspector} />
        <Empty title={c.inspectorEmpty} hint={c.inspectorHint} />
      </Deck>
    );
  }

  const summary = summarizeWave(wave, lookup);
  const groups = flattenWave(wave);
  const interval = waveIntervalMs(wave);
  const hpScale = waveHpScale(wave);
  const enabled = wave.enabled !== false;
  const title = wave.name || fillTemplate(c.waveLabel, { n: String(waveIndex + 1) });

  return (
    <Deck tone="sunken" className={`flex min-h-0 flex-col gap-1 overflow-y-auto p-3 ${className}`}>
      <SegHead
        label={title}
        right={
          <div className="flex items-center gap-1">
            <Num value={String(summary.enemyCount)} size="sm" tone="muted" unit={c.enemyUnit} />
            <Toggle on={enabled} onChange={(value) => onPatchWave({ enabled: value })} label={ins.enabled} />
          </div>
        }
      />

      <div className="grid grid-cols-3 gap-1.5">
        <div className="rounded-[var(--cn-r-md)] border-[3px] border-[var(--cn-line-soft)] bg-[var(--cn-card)] p-1.5">
          <div className="arc-label">{c.cumulativeHp}</div>
          <Num value={String(summary.totalHp)} size="sm" tone="signal" />
        </div>
        <div className="rounded-[var(--cn-r-md)] border-[3px] border-[var(--cn-line-soft)] bg-[var(--cn-card)] p-1.5">
          <div className="arc-label">{c.killReward}</div>
          <Num value={String(summary.totalReward)} size="sm" tone="vital" />
        </div>
        <div className="rounded-[var(--cn-r-md)] border-[3px] border-[var(--cn-line-soft)] bg-[var(--cn-card)] p-1.5">
          <div className="arc-label">{c.durationUnit}</div>
          <Num value={(summary.durationMs / 1000).toFixed(1)} size="sm" unit={c.seconds} />
        </div>
      </div>

      {bar && (
        <div className="flex flex-wrap items-center gap-2 rounded-[var(--cn-r-md)] bg-[var(--cn-card-2)] px-2 py-1">
          <span className="arc-label">{ins.difficulty}</span>
          <Num value={String(bar.difficulty)} size="sm" tone={bar.difficulty >= 80 ? 'alarm' : 'ink'} />
          <span className="arc-label ml-auto">{ins.economy}</span>
          <Num value={String(Math.round(bar.moneyBefore))} size="sm" tone="caution" />
          <span className="font-mono text-[9.5px] text-[var(--cn-ink-3)]">
            {fillTemplate(ins.affordable, { n: String(bar.affordableTowers) })}
          </span>
        </div>
      )}

      <Field label={ins.name}>
        <Input
          value={wave.name ?? ''}
          placeholder={fillTemplate(ins.namePh, { n: String(waveIndex + 1) })}
          onChange={(event) => onPatchWave({ name: event.target.value })}
          className="h-7 w-36 px-1.5 text-[11px]"
          aria-label={ins.name}
        />
      </Field>

      <Field label={c.reward} hint={c.rewardHint}>
        <Input
          type="number"
          min={0}
          step={5}
          value={wave.reward}
          onChange={(event) => onPatchWave({ reward: Math.max(0, Number.parseInt(event.target.value, 10) || 0) })}
          className="h-7 w-24 text-right font-mono text-[11px] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          aria-label={c.reward}
        />
      </Field>

      <Field label={ins.hpScale} hint={ins.hpScaleHint}>
        <div className="flex items-center gap-1">
          <Input
            type="number"
            min={0.05}
            step={0.1}
            value={hpScale}
            onChange={(event) => onPatchWave({ hpScale: Math.max(0.05, Number.parseFloat(event.target.value) || 1) })}
            className="h-7 w-20 text-right font-mono text-[11px] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            aria-label={ins.hpScale}
          />
          <span className="font-mono text-[10px] text-[var(--cn-ink-3)]">×</span>
        </div>
      </Field>

      <Field label={ins.interval} hint={fillTemplate(ins.intervalHint, { ms: String(SPAWN_INTERVAL_MS) })}>
        <div className="flex items-center gap-1">
          <Input
            type="number"
            min={50}
            step={50}
            value={wave.intervalMs ?? ''}
            placeholder={String(SPAWN_INTERVAL_MS)}
            onChange={(event) => {
              const raw = event.target.value.trim();
              onPatchWave({ intervalMs: raw === '' ? undefined : Math.max(50, Number.parseInt(raw, 10) || 50) });
            }}
            className="h-7 w-20 text-right font-mono text-[11px] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            aria-label={ins.interval}
          />
          {wave.intervalMs !== undefined && (
            <Chip onClick={() => onPatchWave({ intervalMs: undefined })} className="px-1.5 py-0.5 text-[9px]">
              {ins.intervalFollow}
            </Chip>
          )}
        </div>
      </Field>

      <Field label={ins.chapter}>
        <Input
          value={wave.chapter ?? ''}
          placeholder={w.noChapter}
          onChange={(event) => onPatchWave({ chapter: event.target.value })}
          className="h-7 w-32 px-1.5 text-[11px]"
          aria-label={ins.chapter}
        />
      </Field>

      <SegHead
        label={c.enemy}
        right={<Num value={String(groups.length)} size="sm" tone="muted" />}
      />

      {groups.length === 0 ? (
        <Empty title={c.emptyWave} hint={c.emptyWaveHint} />
      ) : (
        <ul className="flex flex-col gap-1">
          {groups.map((block) => {
            const active = segment?.id === block.id;
            const missing = !lookup(block.type);
            const gap = delayOf(wave, block.id);
            return (
              <li key={block.id}>
                <div
                  className={[
                    'rounded-[var(--cn-r-md)] border-[3px] px-1.5 py-1',
                    active ? 'border-[var(--cn-grape)] bg-[var(--cn-card)]' : 'border-[var(--cn-line-soft)] bg-[var(--cn-card)]',
                  ].join(' ')}
                >
                  <SelectableRow
                    variant="bare"
                    active={active}
                    tone="grape"
                    onClick={() => onSelectSegment(block.id)}
                    className="gap-1.5"
                  >
                    {missing && <WarningIcon className="h-3.5 w-3.5 shrink-0 text-[var(--cn-alert-deep)]" />}
                    <span className="truncate text-[11.5px] font-semibold text-[var(--cn-ink)]">
                      {enemyLabel(block.type, enemyNames)}
                    </span>
                    <span className="ml-auto font-mono text-[9.5px] text-[var(--cn-ink-3)]">
                      {fillTemplate(c.spawnAt, { s: (block.startMs / 1000).toFixed(1) })}
                    </span>
                  </SelectableRow>

                  {active && (
                    <div className="mt-1 flex flex-wrap items-end gap-1 border-t-[3px] border-[var(--cn-line-soft)] pt-1">
                      <label className="flex flex-col gap-0.5">
                        <span className="font-mono text-[9px] text-[var(--cn-ink-3)]">{ins.segmentCount}</span>
                        <Input
                          type="number"
                          min={1}
                          value={block.count}
                          onChange={(event) => onSegmentCount(block.id, Math.max(1, Number.parseInt(event.target.value, 10) || 1))}
                          className="h-6 w-14 px-1 text-right font-mono text-[10px] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                      </label>
                      <label className="flex flex-col gap-0.5">
                        <span className="font-mono text-[9px] text-[var(--cn-ink-3)]">{ins.segmentGap}</span>
                        <Input
                          type="number"
                          min={0}
                          step={100}
                          value={gap}
                          onChange={(event) => onSegmentGap(block.id, Math.max(0, Number.parseInt(event.target.value, 10) || 0))}
                          className="h-6 w-20 px-1 text-right font-mono text-[10px] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                      </label>
                      <label className="flex flex-col gap-0.5">
                        <span className="font-mono text-[9px] text-[var(--cn-ink-3)]">{ins.segmentStart}</span>
                        <Input
                          type="number"
                          min={0}
                          step={100}
                          value={block.startMs}
                          onChange={(event) => onSegmentShift(block.id, Math.max(0, Number.parseInt(event.target.value, 10) || 0))}
                          className="h-6 w-20 px-1 text-right font-mono text-[10px] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                      </label>
                      <span className="font-mono text-[9px] text-[var(--cn-ink-3)]">
                        {fillTemplate(c.durationSec, { s: ((blockEndMs(block, interval) - block.startMs) / 1000).toFixed(1) })}
                      </span>
                      <IconBtn
                        label={c.removeGroup}
                        className="ml-auto h-6 w-6 text-[var(--cn-alert-deep)]"
                        onClick={() => onRemoveSegment(block.id)}
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                      </IconBtn>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-1 flex flex-wrap items-center gap-1 border-t-[3px] border-[var(--cn-line-soft)] pt-1.5">
        <Btn size="sm" variant="line" icon={<PlusIcon className="h-3.5 w-3.5" />} onClick={onAddSegment}>
          {c.addGroup}
        </Btn>
        <Btn size="sm" variant="ghost" disabled={waveIndex <= 0} onClick={() => onMoveSegmentToWave(waveIndex - 1)}>
          {ins.moveToPrevWave}
        </Btn>
        <Btn size="sm" variant="ghost" onClick={() => onMoveSegmentToWave(waveIndex + 1)}>
          {ins.moveToNextWave}
        </Btn>
        <Btn
          size="sm"
          variant="ghost"
          className="ml-auto text-[var(--cn-alert-deep)]"
          icon={<TrashIcon className="h-3.5 w-3.5" />}
          onClick={onDeleteWave}
        >
          {c.deleteWave}
        </Btn>
      </div>
    </Deck>
  );
}
