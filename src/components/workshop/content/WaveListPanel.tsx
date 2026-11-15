/**
 * 內容頁 · 波次清單（左欄）
 *
 * 這一欄負責「波次的順序與批次操作」，不管單波的內容——內容交給檢視器。
 * 刻意做成剪輯軟體的樣子：一條一條的片段、可以拖、可以多選、可以摺疊章節。
 *
 * 互動約定（與時間軸一致）：
 *   點 = 只選這一波；Shift+點 = 連選；Ctrl/Cmd+點 = 加選／取消
 *   拖曳列 = 排序；拖曳時顯示插入位置的橫線
 */
import { useState } from 'react';
import { useTranslation } from '@/i18n';
import { fillTemplate } from '@/i18n/fileMetaExtraLabels';
import { Btn, Deck, Empty, IconBtn, Input, Num, SegHead, Toggle } from '@/components/hl';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  CopyIcon,
  EditIcon,
  PlusIcon,
  TrashIcon,
  WarningIcon,
} from '@/components/ui/Icons';
import type { TimelineWave } from '@/workshop/content/timeline';
import { listChapters } from '@/workshop/content/waveModel';
import type { WaveSummaryRow } from '@/workshop/content/waveAnalysis';

/** 批次編輯要套用的欄位（undefined＝不改這一項） */
export interface WaveBatchPatch {
  rewardAdd?: number;
  hpScaleMul?: number;
  countMul?: number;
  intervalMs?: number;
}

interface WaveListPanelProps {
  waves: readonly TimelineWave[];
  rows: readonly WaveSummaryRow[];
  selected: readonly number[];
  onSelect: (indices: number[]) => void;
  onAddWave: () => void;
  onDuplicate: (times: number) => void;
  onDelete: () => void;
  onReorder: (from: number, to: number) => void;
  onToggleEnabled: (index: number) => void;
  onBatch: (patch: WaveBatchPatch) => void;
  onSetChapter: (indices: readonly number[], chapter: string) => void;
  className?: string;
}

/** 大數字縮寫：3200 → 3.2k，讓摘要列塞得進 380px 欄寬 */
function compact(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return String(Math.round(value));
}

export function WaveListPanel({
  waves,
  rows,
  selected,
  onSelect,
  onAddWave,
  onDuplicate,
  onDelete,
  onReorder,
  onToggleEnabled,
  onBatch,
  onSetChapter,
  className = '',
}: WaveListPanelProps) {
  const { t } = useTranslation();
  const c = t.studio.content.wave;

  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dropAt, setDropAt] = useState<number | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameText, setRenameText] = useState('');
  const [batchReward, setBatchReward] = useState('5');
  const [batchHp, setBatchHp] = useState('1.2');
  const [batchCount, setBatchCount] = useState('1.2');
  const [batchInterval, setBatchInterval] = useState('');

  const chapters = listChapters(waves);
  const selectedSet = new Set(selected);

  /** mods 只收三個修飾鍵，滑鼠事件與鍵盤事件都能直接餵進來 */
  const pick = (index: number, mods: { shiftKey: boolean; ctrlKey: boolean; metaKey: boolean }) => {
    if (mods.shiftKey && selected.length > 0) {
      const anchor = selected[selected.length - 1];
      const from = Math.min(anchor, index);
      const to = Math.max(anchor, index);
      const range: number[] = [];
      for (let at = from; at <= to; at += 1) range.push(at);
      onSelect(range);
      return;
    }
    if (mods.ctrlKey || mods.metaKey) {
      onSelect(selectedSet.has(index) ? selected.filter((item) => item !== index) : [...selected, index]);
      return;
    }
    onSelect([index]);
  };

  const handleDrop = (to: number) => {
    if (dragFrom !== null && dragFrom !== to) onReorder(dragFrom, to > dragFrom ? to - 1 : to);
    setDragFrom(null);
    setDropAt(null);
  };

  const startRename = (chapter: string) => {
    setRenaming(chapter);
    setRenameText(chapter);
  };

  const commitRename = () => {
    if (renaming === null) return;
    const indices = waves
      .map((wave, index) => ((wave.chapter ?? '') === renaming ? index : -1))
      .filter((index) => index >= 0);
    onSetChapter(indices, renameText.trim());
    setRenaming(null);
  };

  const renderRow = (index: number) => {
    const row = rows[index];
    const wave = waves[index];
    if (!row || !wave) return null;
    const active = selectedSet.has(index);
    const title = row.name || fillTemplate(c.waveFallback, { n: String(index + 1) });
    return (
      <li key={`wave-${index}`}>
        {dropAt === index && <div className="mb-1 h-1 rounded-full bg-[var(--cn-signal)]" aria-hidden="true" />}
        <div
          draggable
          onDragStart={() => setDragFrom(index)}
          onDragOver={(event) => {
            event.preventDefault();
            setDropAt(index);
          }}
          onDragLeave={() => setDropAt((at) => (at === index ? null : at))}
          onDrop={(event) => {
            event.preventDefault();
            handleDrop(index);
          }}
          onDragEnd={() => {
            setDragFrom(null);
            setDropAt(null);
          }}
          className={[
            'rounded-[var(--cn-r-md)] border-[3px]',
            active
              ? 'border-[var(--cn-grape)] bg-[var(--cn-card-2)]'
              : 'border-[var(--cn-line-soft)] bg-[var(--cn-card)]',
            row.enabled ? '' : 'opacity-55',
          ].join(' ')}
        >
          <div className="flex items-center gap-2 px-2 py-1.5">
            <button
              type="button"
              aria-pressed={active}
              aria-label={title}
              onClick={(event) => pick(index, event)}
              className="flex min-w-0 flex-1 items-center gap-2 text-left"
            >
              <span className="w-6 shrink-0 text-center font-mono text-[11px] font-extrabold text-[var(--cn-ink-3)]">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="truncate text-[12px] font-extrabold text-[var(--cn-ink)]">{title}</span>
                  {row.bossLike && (
                    <span className="shrink-0 rounded-[4px] border-2 border-[var(--cn-line)] bg-[var(--cn-coral-soft)] px-1 font-mono text-[8.5px] font-extrabold text-[var(--cn-signal-text)]">
                      {c.boss}
                    </span>
                  )}
                  {row.issueCount > 0 && (
                    <span className="flex items-center gap-0.5 text-[var(--cn-caution-text)]">
                      <WarningIcon className="h-3 w-3" />
                      <span className="font-mono text-[9px] font-extrabold">{row.issueCount}</span>
                    </span>
                  )}
                </span>
                <span className="mt-0.5 flex items-center gap-1.5 overflow-hidden whitespace-nowrap font-mono text-[9.5px] text-[var(--cn-ink-3)]">
                  <span>{fillTemplate(c.summaryEnemies, { n: String(row.enemyCount) })}</span>
                  <span>·</span>
                  <span>{fillTemplate(c.summaryHp, { n: compact(row.totalHp) })}</span>
                  <span>·</span>
                  <span>+{row.waveReward}</span>
                </span>
              </span>
            </button>
            <Toggle on={row.enabled} onChange={() => onToggleEnabled(index)} label={c.toggleEnabled} />
          </div>
        </div>
      </li>
    );
  };

  const hasSelection = selected.length > 0;

  return (
    <Deck className={`flex min-h-0 flex-col gap-2 overflow-hidden p-2.5 ${className}`}>
      <SegHead
        label={c.list}
        right={
          <div className="flex items-center gap-1">
            <Num value={String(waves.length)} size="sm" tone="muted" />
            <IconBtn label={c.add} onClick={onAddWave} className="h-7 w-7">
              <PlusIcon className="h-4 w-4" />
            </IconBtn>
          </div>
        }
      />

      {waves.length === 0 ? (
        <Empty
          title={c.empty}
          hint={c.emptyHint}
          action={<Btn size="sm" variant="signal" icon={<PlusIcon className="h-3.5 w-3.5" />} onClick={onAddWave}>{c.add}</Btn>}
        />
      ) : (
        <>
          <div className="flex shrink-0 flex-wrap items-center gap-1">
            <Btn size="sm" variant="line" onClick={() => onSelect(waves.map((_, index) => index))}>
              {c.selectAll}
            </Btn>
            {hasSelection && (
              <Btn size="sm" variant="ghost" onClick={() => onSelect([])}>
                {c.clearSelection}
              </Btn>
            )}
            {hasSelection && (
              <span className="arc-label text-[var(--cn-ink-3)]">
                {fillTemplate(c.selectedCount, { n: String(selected.length) })}
              </span>
            )}
          </div>

          <ul className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pr-0.5">
            {chapters.map((chapter) => (
              <li key={`chapter-${chapter.chapter || '__none__'}`} className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1 rounded-[var(--cn-r-sm)] bg-[var(--cn-card-2)] px-1.5 py-1">
                  <IconBtn
                    label={chapter.chapter || c.noChapter}
                    className="h-5 w-5"
                    onClick={() => {
                      const indices: number[] = [];
                      waves.forEach((wave, index) => {
                        if ((wave.chapter ?? '') === chapter.chapter) indices.push(index);
                      });
                      onSelect(indices);
                    }}
                  >
                    <ChevronRightIcon className="h-3 w-3" />
                  </IconBtn>
                  {renaming === chapter.chapter ? (
                    <Input
                      autoFocus
                      value={renameText}
                      onChange={(event) => setRenameText(event.target.value)}
                      onBlur={commitRename}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') commitRename();
                        if (event.key === 'Escape') setRenaming(null);
                      }}
                      aria-label={c.chapterName}
                      className="h-6 flex-1 px-1 font-mono text-[10.5px]"
                    />
                  ) : (
                    <button
                      type="button"
                      onDoubleClick={() => startRename(chapter.chapter)}
                      onClick={() => {
                        const indices: number[] = [];
                        waves.forEach((wave, index) => {
                          if ((wave.chapter ?? '') === chapter.chapter) indices.push(index);
                        });
                        onSelect(indices);
                      }}
                      className="flex min-w-0 flex-1 items-center gap-1 text-left"
                    >
                      <span className="truncate text-[10.5px] font-extrabold text-[var(--cn-ink-2)]">
                        {chapter.chapter || c.noChapter}
                      </span>
                      <span className="font-mono text-[9px] text-[var(--cn-ink-3)]">×{chapter.count}</span>
                    </button>
                  )}
                  <IconBtn label={c.chapterRename} className="h-5 w-5" onClick={() => startRename(chapter.chapter)}>
                    <EditIcon className="h-3 w-3" />
                  </IconBtn>
                </div>
                <ul className="flex flex-col gap-1.5">
                  {waves.map((wave, index) => ((wave.chapter ?? '') === chapter.chapter ? renderRow(index) : null))}
                </ul>
              </li>
            ))}
          </ul>

          <div className="flex shrink-0 flex-col gap-1.5 border-t-[3px] border-[var(--cn-line-soft)] pt-1.5">
            <div className="flex flex-wrap items-center gap-1">
              <Btn size="sm" variant="line" icon={<CopyIcon className="h-3.5 w-3.5" />} onClick={() => onDuplicate(1)} disabled={!hasSelection}>
                {c.duplicate}
              </Btn>
              <Btn size="sm" variant="ghost" onClick={() => onDuplicate(3)} disabled={!hasSelection}>
                {fillTemplate(c.duplicateN, { n: '3' })}
              </Btn>
              <Btn
                size="sm"
                variant="ghost"
                className="text-[var(--cn-alert-deep)]"
                icon={<TrashIcon className="h-3.5 w-3.5" />}
                onClick={onDelete}
                disabled={!hasSelection}
              >
                {c.delete}
              </Btn>
              <IconBtn label={c.moveUp} className="h-7 w-7" disabled={selected.length !== 1} onClick={() => onReorder(selected[0], selected[0] - 1)}>
                <ChevronUpIcon className="h-4 w-4" />
              </IconBtn>
              <IconBtn label={c.moveDown} className="h-7 w-7" disabled={selected.length !== 1} onClick={() => onReorder(selected[0], selected[0] + 1)}>
                <ChevronDownIcon className="h-4 w-4" />
              </IconBtn>
            </div>

            {hasSelection && (
              <div className="rounded-[var(--cn-r-md)] border-[3px] border-[var(--cn-line-soft)] bg-[var(--cn-card-2)] p-1.5">
                <div className="mb-1 flex items-center justify-between">
                  <span className="arc-label">{c.batchTitle}</span>
                  <span className="font-mono text-[9px] text-[var(--cn-ink-3)]">{c.batchHint}</span>
                </div>
                <div className="flex flex-wrap items-end gap-1">
                  <label className="flex flex-col gap-0.5">
                    <span className="font-mono text-[9px] text-[var(--cn-ink-3)]">{c.batchRewardAdd}</span>
                    <Input value={batchReward} onChange={(event) => setBatchReward(event.target.value)} className="h-6 w-14 px-1 text-right font-mono text-[10px] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
                  </label>
                  <label className="flex flex-col gap-0.5">
                    <span className="font-mono text-[9px] text-[var(--cn-ink-3)]">{c.batchHpMul}</span>
                    <Input value={batchHp} onChange={(event) => setBatchHp(event.target.value)} className="h-6 w-14 px-1 text-right font-mono text-[10px] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
                  </label>
                  <label className="flex flex-col gap-0.5">
                    <span className="font-mono text-[9px] text-[var(--cn-ink-3)]">{c.batchCountMul}</span>
                    <Input value={batchCount} onChange={(event) => setBatchCount(event.target.value)} className="h-6 w-14 px-1 text-right font-mono text-[10px] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
                  </label>
                  <label className="flex flex-col gap-0.5">
                    <span className="font-mono text-[9px] text-[var(--cn-ink-3)]">{c.batchInterval}</span>
                    <Input
                      value={batchInterval}
                      placeholder="—"
                      onChange={(event) => setBatchInterval(event.target.value)}
                      className="h-6 w-16 px-1 text-right font-mono text-[10px] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                  </label>
                  <Btn
                    size="sm"
                    variant="signal"
                    onClick={() =>
                      onBatch({
                        rewardAdd: Number.parseInt(batchReward, 10) || 0,
                        hpScaleMul: Number.parseFloat(batchHp) || 1,
                        countMul: Number.parseFloat(batchCount) || 1,
                        intervalMs: batchInterval.trim() === '' ? undefined : Number.parseInt(batchInterval, 10) || undefined,
                      })
                    }
                  >
                    {c.batchApply}
                  </Btn>
                </div>
              </div>
            )}
            <p className="arc-label text-[var(--cn-ink-3)]">{c.listHint}</p>
          </div>
        </>
      )}
    </Deck>
  );
}
