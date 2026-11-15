/**
 * 內容頁 · 波次檢視器
 *
 * 時間軸選中哪一波，這裡就是那一波的完整設定：敵人組成、每組延遲、通關獎勵。
 * 所有數字改動都往上丟（on*），不自己存狀態——世界資料只有 store 一份。
 */
import { useTranslation } from '@/i18n';
import { fillTemplate } from '@/i18n/fileMetaExtraLabels';
import { Btn, Deck, Empty, Field, Input, Num, SegHead } from '@/components/hl';
import { PlusIcon, TrashIcon, WarningIcon } from '@/components/ui/Icons';
import { SelectableRow } from '@/components/ui/SelectableRow';
import {
  SPAWN_INTERVAL_MS,
  blockEndMs,
  delayOf,
  enemyLabel,
  flattenWave,
  summarizeWave,
  type EnemyLookup,
  type TimelineWave,
} from '@/workshop/content/timeline';

interface WaveInspectorProps {
  wave: TimelineWave | null;
  /** 被選中的方塊；null 代表只看整波 */
  blockId: string | null;
  lookup: EnemyLookup;
  enemyNames?: Readonly<Record<string, string>>;
  onSelectBlock: (blockId: string) => void;
  onRewardChange: (reward: number) => void;
  onCountChange: (blockId: string, count: number) => void;
  onDelayChange: (blockId: string, delay: number) => void;
  onRemoveBlock: (blockId: string) => void;
  onAddGroup: () => void;
  onDeleteWave: () => void;
  onMoveBlock: (blockId: string, startMs: number) => void;
  className?: string;
}

export function WaveInspector({
  wave,
  blockId,
  lookup,
  enemyNames,
  onSelectBlock,
  onRewardChange,
  onCountChange,
  onDelayChange,
  onRemoveBlock,
  onAddGroup,
  onDeleteWave,
  onMoveBlock,
  className = '',
}: WaveInspectorProps) {
  const { t } = useTranslation();
  const c = t.studio.content;

  if (!wave) {
    return (
      <Deck tone="sunken" className={`flex min-h-0 flex-col gap-2 p-3 ${className}`}>
        <SegHead label={c.inspector} />
        <Empty title={c.inspectorEmpty} hint={c.inspectorHint} />
      </Deck>
    );
  }

  const summary = summarizeWave(wave, lookup);
  const groups = flattenWave(wave);

  return (
    <Deck tone="sunken" className={`flex min-h-0 flex-col gap-2 overflow-y-auto p-3 ${className}`}>
      <SegHead
        label={fillTemplate(c.waveLabel, { n: String(wave.index + 1) })}
        right={<Num value={String(summary.enemyCount)} size="sm" tone="muted" unit={c.enemyUnit} />}
      />

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-[var(--cn-r-md)] border-[3px] border-[var(--cn-line-soft)] bg-[var(--cn-card)] p-2">
          <div className="arc-label">{c.cumulativeHp}</div>
          <Num value={String(summary.totalHp)} size="sm" tone="signal" />
        </div>
        <div className="rounded-[var(--cn-r-md)] border-[3px] border-[var(--cn-line-soft)] bg-[var(--cn-card)] p-2">
          <div className="arc-label">{c.killReward}</div>
          <Num value={String(summary.totalReward)} size="sm" tone="vital" />
        </div>
        <div className="rounded-[var(--cn-r-md)] border-[3px] border-[var(--cn-line-soft)] bg-[var(--cn-card)] p-2">
          <div className="arc-label">{c.duration}</div>
          <Num value={(summary.durationMs / 1000).toFixed(1)} size="sm" unit={c.seconds} />
        </div>
      </div>

      <Field label={c.reward} hint={c.rewardHint}>
        <Input
          type="number"
          min={0}
          step={5}
          value={wave.reward}
          onChange={(event) => onRewardChange(Math.max(0, Number.parseInt(event.target.value, 10) || 0))}
          aria-label={c.reward}
          className="h-8 w-24 text-right font-mono text-[12px]"
        />
      </Field>

      <SegHead label={c.enemy} right={<Num value={String(groups.length)} size="sm" tone="muted" />} />

      {groups.length === 0 ? (
        <Empty title={c.emptyWave} hint={c.emptyWaveHint} />
      ) : (
        <ul className="flex flex-col gap-1.5">
          {groups.map((block) => {
            const delay = delayOf(wave, block.id);
            const selected = blockId === block.id;
            const missing = !lookup(block.type);
            return (
              <li key={block.id}>
                <div
                  className={[
                    'flex flex-wrap items-center gap-1.5 rounded-[var(--cn-r-md)] border-[3px] px-2 py-1.5',
                    selected
                      ? 'border-[var(--cn-grape)] bg-[var(--cn-card)]'
                      : 'border-[var(--cn-line-soft)] bg-[var(--cn-card)]',
                  ].join(' ')}
                >
                  <SelectableRow
                    variant="bare"
                    active={selected}
                    onClick={() => onSelectBlock(block.id)}
                    className="gap-1.5"
                  >
                    {missing && <WarningIcon className="h-3.5 w-3.5 shrink-0 text-[var(--cn-alert-deep)]" />}
                    <span className="truncate text-[11.5px] font-semibold text-[var(--cn-ink)]">
                      {enemyLabel(block.type, enemyNames)}
                    </span>
                    {missing && <span className="arc-label text-[var(--cn-alert-deep)]">{c.missingAsset}</span>}
                  </SelectableRow>

                  <label className="flex items-center gap-1">
                    <span className="arc-label">{c.count}</span>
                    <Input
                      type="number"
                      min={1}
                      value={block.count}
                      onChange={(event) => onCountChange(block.id, Math.max(1, Number.parseInt(event.target.value, 10) || 1))}
                      className="h-7 w-14 text-right font-mono text-[11px]"
                    />
                  </label>

                  <label className="flex items-center gap-1">
                    <span className="arc-label">{c.delay}</span>
                    <Input
                      type="number"
                      min={0}
                      step={SPAWN_INTERVAL_MS}
                      value={delay}
                      onChange={(event) => onDelayChange(block.id, Math.max(0, Number.parseInt(event.target.value, 10) || 0))}
                      className="h-7 w-16 text-right font-mono text-[11px]"
                    />
                  </label>

                  <span className="font-mono text-[10px] text-[var(--cn-ink-3)]">
                    {fillTemplate(c.spawnAt, { s: (block.startMs / 1000).toFixed(1) })}
                  </span>
                  <span className="font-mono text-[10px] text-[var(--cn-ink-3)]">
                    {fillTemplate(c.durationSec, { s: ((blockEndMs(block) - block.startMs) / 1000).toFixed(1) })}
                  </span>

                  <Btn
                    size="sm"
                    variant="ghost"
                    className="text-[var(--cn-alert-deep)]"
                    onClick={() => onMoveBlock(block.id, Math.max(0, block.startMs - SPAWN_INTERVAL_MS))}
                    aria-label={c.earlier}
                    title={c.earlier}
                  >
                    −
                  </Btn>
                  <Btn
                    size="sm"
                    variant="ghost"
                    onClick={() => onMoveBlock(block.id, block.startMs + SPAWN_INTERVAL_MS)}
                    aria-label={c.later}
                    title={c.later}
                  >
                    +
                  </Btn>
                  <Btn
                    size="sm"
                    variant="ghost"
                    className="text-[var(--cn-alert-deep)]"
                    icon={<TrashIcon className="h-3.5 w-3.5" />}
                    onClick={() => onRemoveBlock(block.id)}
                    aria-label={c.removeGroup}
                    title={c.removeGroup}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex items-center gap-1.5">
        <Btn size="sm" variant="line" icon={<PlusIcon className="h-3.5 w-3.5" />} onClick={onAddGroup}>
          {c.addGroup}
        </Btn>
        <Btn size="sm" variant="ghost" className="text-[var(--cn-alert-deep)]" icon={<TrashIcon className="h-3.5 w-3.5" />} onClick={onDeleteWave}>
          {c.deleteWave}
        </Btn>
      </div>
    </Deck>
  );
}
