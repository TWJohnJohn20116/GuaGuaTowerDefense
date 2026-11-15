/**
 * 內容頁 · 波次時間軸
 *
 * 橫軸 = 整場時間（秒），每一列 = 一種敵人，方塊 = 一次「生成 N 隻」的事件。
 * 拖曳方塊改出現時間、拖方塊右緣改數量；點一下選中，細節交給 WaveInspector。
 * 下方是即時算出來的累積 HP / 累積獎勵曲線（同一份 timeline 資料）。
 */
import type React from 'react';
import { useRef, useState } from 'react';
import { useTranslation } from '@/i18n';
import { fillTemplate } from '@/i18n/fileMetaExtraLabels';
import { Btn, Dot, Empty, Num, SegHead } from '@/components/hl';
import { ClockIcon, PlusIcon } from '@/components/ui/Icons';
import {
  SPAWN_INTERVAL_MS,
  enemyLabel,
  type TimelineBlock,
  type TimelineWave,
  type WaveCurve,
} from '@/workshop/content/timeline';

interface DragState {
  mode: 'move' | 'resize';
  waveIndex: number;
  block: TimelineBlock;
  /** 按下時的指標 x（px） */
  startX: number;
  /** 這個追蹤區每一 px 代表幾毫秒 */
  msPerPx: number;
}

interface PreviewState {
  waveIndex: number;
  blockId: string;
  startMs: number;
  count: number;
}

interface WaveTimelineProps {
  waves: TimelineWave[];
  curve: WaveCurve;
  selectedWaveIndex: number | null;
  selectedBlockId: string | null;
  /** 專案自訂敵人的顯示名稱（官方敵人由 ENEMY_DATA 提供） */
  enemyNames?: Readonly<Record<string, string>>;
  onSelectWave: (index: number) => void;
  onSelectBlock: (waveIndex: number, blockId: string) => void;
  onMoveBlock: (waveIndex: number, blockId: string, startMs: number) => void;
  onResizeBlock: (waveIndex: number, blockId: string, count: number) => void;
  onAddWave: () => void;
  className?: string;
}

export function WaveTimeline({
  waves,
  curve,
  selectedWaveIndex,
  selectedBlockId,
  enemyNames,
  onSelectWave,
  onSelectBlock,
  onMoveBlock,
  onResizeBlock,
  onAddWave,
  className = '',
}: WaveTimelineProps) {
  const { t } = useTranslation();
  const c = t.studio.content;
  const dragRef = useRef<DragState | null>(null);
  const [preview, setPreview] = useState<PreviewState | null>(null);

  const totalMs = Math.max(curve.durationMs, 1);
  const waveStarts: number[] = [];
  let acc = 0;
  for (const wave of waves) {
    waveStarts.push(acc);
    acc += wave.durationMs;
  }

  const rows: { type: string; cells: { waveIndex: number; block: TimelineBlock }[] }[] = [];
  const rowIndex = new Map<string, number>();
  waves.forEach((wave, waveIndex) => {
    for (const row of wave.rows) {
      let at = rowIndex.get(row.type);
      if (at === undefined) {
        at = rows.length;
        rowIndex.set(row.type, at);
        rows.push({ type: row.type, cells: [] });
      }
      for (const block of row.blocks) rows[at].cells.push({ waveIndex, block });
    }
  });

  const pct = (ms: number) => `${(Math.max(0, ms) / totalMs) * 100}%`;

  const shownBlock = (waveIndex: number, block: TimelineBlock): TimelineBlock => {
    if (preview && preview.waveIndex === waveIndex && preview.blockId === block.id) {
      return { ...block, startMs: preview.startMs, count: preview.count };
    }
    return block;
  };

  const beginDrag = (
    event: React.PointerEvent<HTMLElement>,
    mode: 'move' | 'resize',
    waveIndex: number,
    block: TimelineBlock,
  ) => {
    event.stopPropagation();
    event.preventDefault();
    const track = event.currentTarget.parentElement;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      mode,
      waveIndex,
      block,
      startX: event.clientX,
      msPerPx: totalMs / Math.max(1, rect.width),
    };
    setPreview({ waveIndex, blockId: block.id, startMs: block.startMs, count: block.count });
    onSelectBlock(waveIndex, block.id);
  };

  const moveDrag = (event: React.PointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const deltaMs = (event.clientX - drag.startX) * drag.msPerPx;
    if (drag.mode === 'move') {
      setPreview({
        waveIndex: drag.waveIndex,
        blockId: drag.block.id,
        startMs: Math.max(0, Math.round(drag.block.startMs + deltaMs)),
        count: drag.block.count,
      });
      return;
    }
    const units = Math.round(deltaMs / SPAWN_INTERVAL_MS);
    setPreview({
      waveIndex: drag.waveIndex,
      blockId: drag.block.id,
      startMs: drag.block.startMs,
      count: Math.max(1, drag.block.count + units),
    });
  };

  const endDrag = (event: React.PointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    dragRef.current = null;
    setPreview(null);
    if (!drag) return;
    const deltaMs = (event.clientX - drag.startX) * drag.msPerPx;
    if (drag.mode === 'move') {
      onMoveBlock(drag.waveIndex, drag.block.id, Math.max(0, Math.round(drag.block.startMs + deltaMs)));
      return;
    }
    const units = Math.round(deltaMs / SPAWN_INTERVAL_MS);
    onResizeBlock(drag.waveIndex, drag.block.id, Math.max(1, drag.block.count + units));
  };

  return (
    <div className={`flex min-h-0 flex-col gap-2 ${className}`}>
      <SegHead
        label={c.timeline}
        right={
          <div className="flex items-center gap-2">
            <ClockIcon className="h-3.5 w-3.5 text-[var(--cn-ink-3)]" />
            <span className="arc-label">
              {fillTemplate(c.totalDuration, { s: (curve.durationMs / 1000).toFixed(1) })}
            </span>
            <Btn size="sm" variant="signal" icon={<PlusIcon className="h-3.5 w-3.5" />} onClick={onAddWave}>
              {c.addWave}
            </Btn>
          </div>
        }
      />

      {waves.length === 0 ? (
        <Empty title={c.noWaves} hint={c.noWavesHint} action={<Btn size="sm" variant="signal" onClick={onAddWave}>{c.addWave}</Btn>} />
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto">
          {/* 波次標頭：整場時間軸的段落切分 */}
          <div className="flex items-center gap-2">
            <span className="w-20 shrink-0" />
            <div className="relative h-7 flex-1">
              {waves.map((wave, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => onSelectWave(index)}
                  aria-pressed={selectedWaveIndex === index}
                  className={[
                    'absolute inset-y-0 truncate rounded-[8px] border-[3px] px-1 font-mono text-[10px] font-extrabold',
                    selectedWaveIndex === index
                      ? 'border-[var(--cn-grape)] bg-[var(--cn-card-2)] text-[var(--cn-ink)]'
                      : 'border-[var(--cn-line-soft)] bg-[var(--cn-card)] text-[var(--cn-ink-3)] hover:border-[var(--cn-line)]',
                  ].join(' ')}
                  style={{ left: pct(waveStarts[index]), width: pct(Math.max(wave.durationMs, 1)) }}
                >
                  {fillTemplate(c.waveLabel, { n: String(index + 1) })}
                </button>
              ))}
            </div>
            <span className="w-16 shrink-0" />
          </div>

          {rows.map((row) => (
            <div key={row.type} className="flex items-center gap-2">
              <span className="w-20 shrink-0 truncate text-[11px] font-semibold text-[var(--cn-ink-2)]" title={enemyLabel(row.type, enemyNames)}>
                {enemyLabel(row.type, enemyNames)}
              </span>
              <div className="relative h-9 flex-1 overflow-hidden rounded-[8px] border-[3px] border-[var(--cn-line-soft)] bg-[var(--cn-card-2)]">
                {waves.map((_wave, index) => (
                  <span
                    key={index}
                    aria-hidden="true"
                    className="absolute top-0 h-full w-[2px] bg-[var(--cn-line-soft)]"
                    style={{ left: pct(waveStarts[index]) }}
                  />
                ))}
                {row.cells.map((cell) => {
                  const block = shownBlock(cell.waveIndex, cell.block);
                  const selected = selectedWaveIndex === cell.waveIndex && selectedBlockId === cell.block.id;
                  const widthMs = Math.max(block.count, 1) * SPAWN_INTERVAL_MS;
                  return (
                    <div
                      key={`${cell.waveIndex}-${cell.block.id}`}
                      role="button"
                      tabIndex={0}
                      aria-pressed={selected}
                      aria-label={fillTemplate(c.blockAria, {
                        type: enemyLabel(cell.block.type, enemyNames),
                        n: String(block.count),
                        s: (block.startMs / 1000).toFixed(1),
                      })}
                      onPointerDown={(event) => beginDrag(event, 'move', cell.waveIndex, cell.block)}
                      onPointerMove={moveDrag}
                      onPointerUp={endDrag}
                      onPointerCancel={endDrag}
                      onKeyDown={(event) => {
                        if (event.key === 'ArrowLeft') {
                          event.preventDefault();
                          onMoveBlock(cell.waveIndex, cell.block.id, Math.max(0, cell.block.startMs - SPAWN_INTERVAL_MS));
                        } else if (event.key === 'ArrowRight') {
                          event.preventDefault();
                          onMoveBlock(cell.waveIndex, cell.block.id, cell.block.startMs + SPAWN_INTERVAL_MS);
                        }
                      }}
                      className={[
                        'absolute top-1 bottom-1 flex cursor-grab items-center justify-center overflow-hidden rounded-[6px] border-[3px] font-mono text-[10px] font-extrabold',
                        'touch-none select-none',
                        selected
                          ? 'z-20 border-[var(--cn-line)] bg-[var(--cn-sun)] text-[var(--cn-on-sun)] shadow-[0_2px_0_var(--cn-line)]'
                          : selectedWaveIndex === cell.waveIndex
                            ? 'z-10 border-[var(--cn-grape)] bg-[var(--cn-card)] text-[var(--cn-ink)]'
                            : 'border-[var(--cn-line)] bg-[var(--cn-card)] text-[var(--cn-ink-2)] hover:bg-[var(--cn-card-2)]',
                      ].join(' ')}
                      style={{
                        left: pct(waveStarts[cell.waveIndex] + block.startMs),
                        width: `max(18px, ${pct(widthMs)})`,
                      }}
                      title={fillTemplate(c.blockAria, {
                        type: enemyLabel(cell.block.type, enemyNames),
                        n: String(block.count),
                        s: (block.startMs / 1000).toFixed(1),
                      })}
                    >
                      <span className="truncate px-1">{block.count}</span>
                      <span
                        aria-hidden="true"
                        onPointerDown={(event) => beginDrag(event, 'resize', cell.waveIndex, cell.block)}
                        onPointerMove={moveDrag}
                        onPointerUp={endDrag}
                        onPointerCancel={endDrag}
                        className="absolute right-0 top-0 h-full w-1.5 cursor-ew-resize border-l-[2px] border-[var(--cn-line-soft)] bg-[var(--cn-line-soft)]"
                      />
                    </div>
                  );
                })}
              </div>
              <span className="w-16 shrink-0 text-right">
                <Num value={String(row.cells.reduce((sum, cell) => sum + cell.block.count, 0))} size="sm" tone="muted" />
              </span>
            </div>
          ))}

          <p className="arc-label mt-1 text-[var(--cn-ink-3)]">{c.dragHint}</p>
        </div>
      )}

      {/* 累積曲線：HP（珊瑚）與獎勵（薄荷），同一條時間軸 */}
      <div className="rounded-[var(--cn-r-lg)] border-[3px] border-[var(--cn-line-soft)] bg-[var(--cn-card)] p-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <Dot tone="signal" />
            <span className="arc-label">{c.cumulativeHp}</span>
            <Num value={String(curve.totalHp)} size="sm" tone="signal" />
          </span>
          <span className="flex items-center gap-1.5">
            <Dot tone="vital" />
            <span className="arc-label">{c.cumulativeReward}</span>
            <Num value={String(curve.totalReward)} size="sm" tone="vital" />
          </span>
          <span className="ml-auto font-mono text-[10px] text-[var(--cn-ink-3)]">
            0s – {(curve.durationMs / 1000).toFixed(1)}s
          </span>
        </div>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          role="img"
          aria-label={`${c.cumulativeHp} / ${c.cumulativeReward}`}
          className="mt-1 h-20 w-full"
        >
          <line x1="0" y1="99" x2="100" y2="99" stroke="var(--cn-line-soft)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <polyline
            points={curve.points
              .map((point) => `${(point.atMs / Math.max(curve.durationMs, 1)) * 100},${100 - (point.reward / Math.max(curve.totalReward, 1)) * 94}`)
              .join(' ')}
            fill="none"
            stroke="var(--cn-mint)"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
          <polyline
            points={curve.points
              .map((point) => `${(point.atMs / Math.max(curve.durationMs, 1)) * 100},${100 - (point.hp / Math.max(curve.maxHp, 1)) * 94}`)
              .join(' ')}
            fill="none"
            stroke="var(--cn-coral)"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </div>
  );
}
