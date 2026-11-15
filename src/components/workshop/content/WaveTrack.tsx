/**
 * 內容頁 · 單軌時間軸
 *
 * 為什麼不是多軌：引擎的生成佇列是嚴格序列（每組 delay 從前一組最後一隻之後才算），
 * 多軌視圖會讓「拖一格把後面全部推遲」看起來像 bug。這裡改成誠實的單軌：
 * 一條軌、片段依序排開、片段之間的空隙就是 delay。
 *
 * 三種拖曳語意（與剪輯軟體對齊）：
 *   1. 拖片段身體        → 改時間（同一波後面的組一起後移）
 *   2. 拖過鄰居中線      → 換順序（不產生空隙）
 *   3. 拖片段右緣        → 改數量
 * 空白處點一下＝移動播放頭，拖曳空白處＝水平捲動。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type React from 'react';
import { useTranslation } from '@/i18n';
import { fillTemplate } from '@/i18n/fileMetaExtraLabels';
import { Btn, Chip, Deck, IconBtn, Num, SegHead } from '@/components/hl';
import {
  ClockIcon,
  CopyIcon,
  MinusIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  RefreshIcon,
  RewindIcon,
  TrashIcon,
} from '@/components/ui/Icons';
import { enemyLabel, waveIntervalMs, type TimelineWave } from '@/workshop/content/timeline';
import { buildTrack, type TrackSegment } from '@/workshop/content/waveModel';
import type { PlayheadSnapshot } from '@/workshop/content/waveAnalysis';

/** 片段識別（時間軸與檢視器共用同一種 key） */
export interface SegmentRef {
  waveIndex: number;
  blockId: string;
}

interface WaveTrackProps {
  waves: readonly TimelineWave[];
  enemyNames?: Readonly<Record<string, string>>;
  selected: readonly SegmentRef[];
  playheadMs: number;
  snapshot: PlayheadSnapshot;
  onSelect: (segments: SegmentRef[]) => void;
  onSelectWave: (index: number) => void;
  onShift: (waveIndex: number, blockId: string, deltaMs: number) => void;
  onResize: (waveIndex: number, blockId: string, count: number) => void;
  onReorder: (waveIndex: number, blockId: string, toIndex: number) => void;
  onDeleteSegment: (waveIndex: number, blockId: string) => void;
  onDuplicateSegment: (waveIndex: number, blockId: string) => void;
  onMoveSegmentToWave: (waveIndex: number, blockId: string, toWave: number) => void;
  onWaveAction: (index: number, action: 'insert' | 'duplicate' | 'delete') => void;
  onSeek: (ms: number) => void;
  className?: string;
}

interface DragState {
  mode: 'move' | 'resize';
  waveIndex: number;
  blockId: string;
  startX: number;
  originStartMs: number;
  originCount: number;
  intervalMs: number;
  moved: boolean;
  reorderTo: number | null;
}

interface MenuState {
  x: number;
  y: number;
  waveIndex: number;
  blockId: string | null;
}

/** 刻度的候選間距（毫秒）：挑第一個「畫在畫面上至少 56px 寬」的 */
const TICK_STEPS = [100, 250, 500, 1000, 2000, 5000, 10000, 30000, 60000];
const SNAP_STEPS = [0, 100, 500, 1000];
const ZOOM_MIN = 0.008;
const ZOOM_MAX = 0.8;

const refKey = (ref: SegmentRef) => `${ref.waveIndex}:${ref.blockId}`;

export function WaveTrack({
  waves,
  enemyNames,
  selected,
  playheadMs,
  snapshot,
  onSelect,
  onSelectWave,
  onShift,
  onResize,
  onReorder,
  onDeleteSegment,
  onDuplicateSegment,
  onMoveSegmentToWave,
  onWaveAction,
  onSeek,
  className = '',
}: WaveTrackProps) {
  const { t } = useTranslation();
  const c = t.studio.content.track;

  const track = useMemo(() => buildTrack(waves), [waves]);
  const [pxPerMs, setPxPerMs] = useState(0.05);
  const [snap, setSnap] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [preview, setPreview] = useState<{ ref: SegmentRef; startMs: number; count: number } | null>(null);
  const [menu, setMenu] = useState<MenuState | null>(null);

  const dragRef = useRef<DragState | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const panRef = useRef<{ startX: number; scrollLeft: number; moved: boolean; seekMs: number } | null>(null);
  const playheadRef = useRef(playheadMs);
  playheadRef.current = playheadMs;
  const seekRef = useRef(onSeek);
  seekRef.current = onSeek;

  const totalMs = Math.max(track.totalMs, 1);
  const contentWidth = Math.max(240, totalMs * pxPerMs);
  const x = useCallback((ms: number) => ms * pxPerMs, [pxPerMs]);

  const selectedSet = useMemo(() => new Set(selected.map(refKey)), [selected]);
  const tickStep = TICK_STEPS.find((step) => step * pxPerMs >= 56) ?? 60000;
  const ticks: number[] = [];
  for (let at = 0; at <= totalMs; at += tickStep) ticks.push(at);

  const snapValue = useCallback(
    (value: number) => (snap > 0 ? Math.round(value / snap) * snap : Math.round(value)),
    [snap],
  );

  /* ------------------------------------------------------------ 播放頭 */

  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      const delta = now - last;
      last = now;
      const next = playheadRef.current + delta;
      if (next >= totalMs) {
        seekRef.current(totalMs);
        setPlaying(false);
        return;
      }
      seekRef.current(next);
    }, 33);
    return () => window.clearInterval(timer);
  }, [playing, totalMs]);

  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(null);
    window.addEventListener('pointerdown', close);
    window.addEventListener('keydown', close);
    return () => {
      window.removeEventListener('pointerdown', close);
      window.removeEventListener('keydown', close);
    };
  }, [menu]);

  /* ------------------------------------------------------------ 拖曳 */

  const beginDrag = (event: React.PointerEvent<HTMLElement>, mode: 'move' | 'resize', segment: TrackSegment) => {
    event.stopPropagation();
    event.preventDefault();
    const wave = waves[segment.waveIndex];
    if (!wave) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      mode,
      waveIndex: segment.waveIndex,
      blockId: segment.blockId,
      startX: event.clientX,
      originStartMs: segment.startMs,
      originCount: segment.count,
      intervalMs: waveIntervalMs(wave),
      moved: false,
      reorderTo: null,
    };
    setPreview({ ref: { waveIndex: segment.waveIndex, blockId: segment.blockId }, startMs: segment.startMs, count: segment.count });
    onSelect([{ waveIndex: segment.waveIndex, blockId: segment.blockId }]);
  };

  const moveDrag = (event: React.PointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const deltaPx = event.clientX - drag.startX;
    if (Math.abs(deltaPx) > 2) drag.moved = true;

    if (drag.mode === 'resize') {
      const units = Math.round(deltaPx / Math.max(1, drag.intervalMs * pxPerMs));
      setPreview({
        ref: { waveIndex: drag.waveIndex, blockId: drag.blockId },
        startMs: drag.originStartMs,
        count: Math.max(1, drag.originCount + units),
      });
      return;
    }

    const deltaMs = snapValue(deltaPx / pxPerMs);
    const wanted = Math.max(0, drag.originStartMs + deltaMs);

    // 換順序：看指針落在哪兩個鄰居的中心之間
    const siblings = track.segments.filter((segment) => segment.waveIndex === drag.waveIndex);
    const selfIndex = siblings.findIndex((segment) => segment.blockId === drag.blockId);
    let reorderTo: number | null = null;
    if (selfIndex >= 0) {
      const pointerMs = wanted;
      const others = siblings.filter((_, index) => index !== selfIndex);
      let target = 0;
      for (const other of others) {
        const center = other.startMs + (other.endMs - other.startMs) / 2;
        if (pointerMs > center) target += 1;
      }
      reorderTo = target === selfIndex ? null : target;
    }
    drag.reorderTo = reorderTo;
    setPreview({ ref: { waveIndex: drag.waveIndex, blockId: drag.blockId }, startMs: wanted, count: drag.originCount });
  };

  const endDrag = (event: React.PointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    dragRef.current = null;
    setPreview(null);
    if (!drag) return;
    const deltaPx = event.clientX - drag.startX;

    if (drag.mode === 'resize') {
      const units = Math.round(deltaPx / Math.max(1, drag.intervalMs * pxPerMs));
      const next = Math.max(1, drag.originCount + units);
      if (next !== drag.originCount) onResize(drag.waveIndex, drag.blockId, next);
      return;
    }
    if (!drag.moved) return;
    if (drag.reorderTo !== null) {
      onReorder(drag.waveIndex, drag.blockId, drag.reorderTo);
      return;
    }
    const deltaMs = snapValue(deltaPx / pxPerMs);
    if (deltaMs !== 0) onShift(drag.waveIndex, drag.blockId, deltaMs);
  };

  /* ------------------------------------------------------- 空白處：捲動／定位 */

  const beginPan = (event: React.PointerEvent<HTMLElement>) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const rect = event.currentTarget.getBoundingClientRect();
    panRef.current = {
      startX: event.clientX,
      scrollLeft: scroller.scrollLeft,
      moved: false,
      seekMs: Math.max(0, (event.clientX - rect.left + scroller.scrollLeft) / pxPerMs),
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const movePan = (event: React.PointerEvent<HTMLElement>) => {
    const pan = panRef.current;
    const scroller = scrollerRef.current;
    if (!pan || !scroller) return;
    const deltaPx = event.clientX - pan.startX;
    if (Math.abs(deltaPx) > 4) pan.moved = true;
    if (pan.moved) scroller.scrollLeft = pan.scrollLeft - deltaPx;
  };

  const endPan = (event: React.PointerEvent<HTMLElement>) => {
    const pan = panRef.current;
    panRef.current = null;
    if (!pan) return;
    if (!pan.moved) {
      const scroller = scrollerRef.current;
      const rect = event.currentTarget.getBoundingClientRect();
      const ms = scroller ? (event.clientX - rect.left + scroller.scrollLeft) / pxPerMs : pan.seekMs;
      onSeek(Math.max(0, Math.min(totalMs, snapValue(ms))));
    }
  };

  const zoom = (factor: number) => {
    setPxPerMs((current) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, current * factor)));
  };

  const shownStart = (segment: TrackSegment): number => {
    if (preview && preview.ref.waveIndex === segment.waveIndex && preview.ref.blockId === segment.blockId) {
      return preview.startMs;
    }
    return segment.startMs;
  };

  const shownCount = (segment: TrackSegment): number => {
    if (preview && preview.ref.waveIndex === segment.waveIndex && preview.ref.blockId === segment.blockId) {
      return preview.count;
    }
    return segment.count;
  };

  const shiftedCount = (waveIndex: number, blockId: string): number => {
    const index = track.segments.findIndex((segment) => segment.waveIndex === waveIndex && segment.blockId === blockId);
    if (index < 0) return 0;
    return track.segments.length - index - 1;
  };

  const menuSegment = menu && menu.blockId
    ? track.segments.find((segment) => segment.waveIndex === menu.waveIndex && segment.blockId === menu.blockId) ?? null
    : null;

  return (
    <Deck className={`flex min-h-0 flex-col gap-1.5 p-2.5 ${className}`}>
      <SegHead
        label={c.title}
        right={
          <div className="flex flex-wrap items-center gap-1">
            <span className="arc-label flex items-center gap-1 text-[var(--cn-ink-3)]">
              <ClockIcon className="h-3.5 w-3.5" />
              {fillTemplate(c.totalTime, { s: (totalMs / 1000).toFixed(1) })}
            </span>
            <span className="arc-label ml-1 text-[var(--cn-ink-3)]">{c.snap}</span>
            {SNAP_STEPS.map((step) => (
              <Chip key={step} active={snap === step} onClick={() => setSnap(step)} className="px-1.5 py-0.5 text-[9.5px]">
                {step === 0 ? c.snapOff : step === 100 ? c.snap100 : step === 500 ? c.snap500 : c.snap1000}
              </Chip>
            ))}
            <IconBtn label={c.zoomOut} className="h-7 w-7" onClick={() => zoom(0.8)}>
              <MinusIcon className="h-3.5 w-3.5" />
            </IconBtn>
            <IconBtn label={c.zoomReset} className="h-7 w-7" onClick={() => setPxPerMs(0.05)}>
              <RefreshIcon className="h-3.5 w-3.5" />
            </IconBtn>
            <IconBtn label={c.zoomIn} className="h-7 w-7" onClick={() => zoom(1.25)}>
              <PlusIcon className="h-3.5 w-3.5" />
            </IconBtn>
            <IconBtn label={c.rewind} className="h-7 w-7" onClick={() => onSeek(0)}>
              <RewindIcon className="h-3.5 w-3.5" />
            </IconBtn>
            <IconBtn label={playing ? c.pause : c.play} className="h-7 w-7" onClick={() => setPlaying((value) => !value)}>
              {playing ? <PauseIcon className="h-3.5 w-3.5" /> : <PlayIcon className="h-3.5 w-3.5" />}
            </IconBtn>
          </div>
        }
      />

      {waves.length === 0 ? (
        <div className="flex min-h-[120px] items-center justify-center rounded-[var(--cn-r-md)] border-[3px] border-dashed border-[var(--cn-line-soft)]">
          <div className="text-center">
            <div className="text-[12px] font-extrabold text-[var(--cn-ink-2)]">{c.empty}</div>
            <div className="mt-1 text-[11px] font-semibold text-[var(--cn-ink-3)]">{c.emptyHint}</div>
          </div>
        </div>
      ) : (
        <div ref={scrollerRef} className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden">
          <div className="relative" style={{ width: contentWidth }}>
            {/* 刻度尺 */}
            <div className="relative h-6 border-b-[3px] border-[var(--cn-line-soft)]">
              {ticks.map((at) => (
                <span
                  key={`tick-${at}`}
                  className="absolute top-0 font-mono text-[9px] text-[var(--cn-ink-3)]"
                  style={{ left: x(at) }}
                >
                  {(at / 1000).toFixed(at % 1000 === 0 ? 0 : 1)}s
                </span>
              ))}
              {track.waveStarts.map((start, index) => (
                <button
                  key={`wavehead-${index}`}
                  type="button"
                  onClick={() => onSelectWave(index)}
                  className="absolute top-3 truncate rounded-[4px] bg-[var(--cn-card-2)] px-1 font-mono text-[9px] font-extrabold text-[var(--cn-ink-2)]"
                  style={{ left: x(start), width: Math.max(18, x(waves[index].durationMs)) }}
                  title={waves[index].name || fillTemplate(c.waveDividerFallback, { n: String(index + 1) })}
                >
                  {waves[index].name || index + 1}
                </button>
              ))}
            </div>

            {/* 主軌 */}
            <div
              className="relative h-[68px] select-none"
              onPointerDown={beginPan}
              onPointerMove={movePan}
              onPointerUp={endPan}
              onPointerCancel={endPan}
            >
              {waves.map((wave, index) => (
                <div
                  key={`band-${index}`}
                  className={`absolute inset-y-0 ${index % 2 === 0 ? 'bg-[var(--cn-card-2)]' : 'bg-[var(--cn-card)]'} ${wave.enabled === false ? 'opacity-40' : ''}`}
                  style={{ left: x(track.waveStarts[index]), width: Math.max(2, x(wave.durationMs)) }}
                  aria-hidden="true"
                />
              ))}
              {track.waveStarts.map((start, index) => (
                <span
                  key={`divider-${index}`}
                  className="absolute inset-y-0 w-[2px] bg-[var(--cn-line)]"
                  style={{ left: x(start) }}
                  aria-hidden="true"
                />
              ))}

              {track.segments.map((segment) => {
                const start = shownStart(segment);
                const count = shownCount(segment);
                const widthMs = Math.max(1, count) * waveIntervalMs(waves[segment.waveIndex]);
                const active = selectedSet.has(`${segment.waveIndex}:${segment.blockId}`);
                const absoluteStart = (track.waveStarts[segment.waveIndex] ?? 0) + start;
                return (
                  <div
                    key={`seg-${segment.waveIndex}-${segment.blockId}`}
                    role="button"
                    tabIndex={0}
                    aria-pressed={active}
                    aria-label={`${enemyLabel(segment.type, enemyNames)} × ${count}`}
                    title={`${enemyLabel(segment.type, enemyNames)} × ${count} · ${(start / 1000).toFixed(1)}s`}
                    onPointerDown={(event) => beginDrag(event, 'move', segment)}
                    onPointerMove={moveDrag}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                    onContextMenu={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setMenu({ x: event.clientX, y: event.clientY, waveIndex: segment.waveIndex, blockId: segment.blockId });
                    }}
                    className={[
                      'absolute top-2 flex h-11 cursor-grab touch-none items-center justify-center overflow-hidden rounded-[6px] border-[3px] font-mono text-[10px] font-extrabold',
                      active
                        ? 'z-20 border-[var(--cn-line)] bg-[var(--cn-sun)] text-[var(--cn-on-sun)]'
                        : 'z-10 border-[var(--cn-line)] bg-[var(--cn-card)] text-[var(--cn-ink-2)] hover:bg-[var(--cn-card-2)]',
                    ].join(' ')}
                    style={{ left: x(absoluteStart), width: Math.max(16, x(widthMs)) }}
                  >
                    <span className="truncate px-1">{count}</span>
                    <span
                      aria-hidden="true"
                      onPointerDown={(event) => beginDrag(event, 'resize', segment)}
                      onPointerMove={moveDrag}
                      onPointerUp={endDrag}
                      onPointerCancel={endDrag}
                      className="absolute right-0 top-0 h-full w-1.5 cursor-ew-resize border-l-[2px] border-[var(--cn-line-soft)] bg-[var(--cn-line-soft)]"
                    />
                  </div>
                );
              })}

              {/* 播放頭 */}
              <div className="pointer-events-none absolute inset-y-0 z-30" style={{ left: x(playheadMs) }}>
                <span className="absolute inset-y-0 w-[2px] bg-[var(--cn-signal)]" />
                <span className="absolute -top-1 h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-2 border-[var(--cn-line)] bg-[var(--cn-signal)]" />
              </div>
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-2 font-mono text-[10px] text-[var(--cn-ink-3)]">
              <span className="arc-label">{c.playhead}</span>
              <Num value={(playheadMs / 1000).toFixed(1)} size="sm" unit="s" />
              <span>·</span>
              <span>{fillTemplate(c.nowWave, { n: String(Math.max(1, snapshot.waveIndex + 1)) })}</span>
              <span>·</span>
              <span>{fillTemplate(c.nowEnemies, { n: String(snapshot.onField) })}</span>
              <span>·</span>
              <span>{fillTemplate(c.nowHp, { n: String(snapshot.hp) })}</span>
              <span>·</span>
              <span>{fillTemplate(c.nowMoney, { n: String(snapshot.money) })}</span>
            </div>
          </div>
        </div>
      )}

      <p className="arc-label text-[var(--cn-ink-3)]">
        {preview && dragRef.current
          ? fillTemplate(c.shiftNote, { n: String(shiftedCount(preview.ref.waveIndex, preview.ref.blockId)) })
          : c.hint}
      </p>

      {menu && (
        <div
          className="fixed z-50 min-w-[160px] rounded-[var(--cn-r-md)] border-[3px] border-[var(--cn-line)] bg-[var(--cn-card)] p-1 shadow-[0_6px_0_var(--cn-line)]"
          style={{ left: menu.x, top: menu.y }}
          onPointerDown={(event) => event.stopPropagation()}
        >
          {menuSegment ? (
            <div className="flex flex-col">
              <Btn
                size="sm"
                variant="ghost"
                icon={<CopyIcon className="h-3.5 w-3.5" />}
                onClick={() => {
                  onDuplicateSegment(menu.waveIndex, menuSegment.blockId);
                  setMenu(null);
                }}
              >
                {c.ctxDuplicate}
              </Btn>
              <Btn
                size="sm"
                variant="ghost"
                className="text-[var(--cn-alert-deep)]"
                icon={<TrashIcon className="h-3.5 w-3.5" />}
                onClick={() => {
                  onDeleteSegment(menu.waveIndex, menuSegment.blockId);
                  setMenu(null);
                }}
              >
                {c.ctxDelete}
              </Btn>
              <Btn
                size="sm"
                variant="ghost"
                disabled={menu.waveIndex <= 0}
                onClick={() => {
                  onMoveSegmentToWave(menu.waveIndex, menuSegment.blockId, menu.waveIndex - 1);
                  setMenu(null);
                }}
              >
                {c.ctxMovePrev}
              </Btn>
              <Btn
                size="sm"
                variant="ghost"
                disabled={menu.waveIndex >= waves.length - 1}
                onClick={() => {
                  onMoveSegmentToWave(menu.waveIndex, menuSegment.blockId, menu.waveIndex + 1);
                  setMenu(null);
                }}
              >
                {c.ctxMoveNext}
              </Btn>
            </div>
          ) : (
            <div className="flex flex-col">
              <Btn
                size="sm"
                variant="ghost"
                onClick={() => {
                  onWaveAction(menu.waveIndex, 'insert');
                  setMenu(null);
                }}
              >
                {c.ctxWaveInsert}
              </Btn>
              <Btn
                size="sm"
                variant="ghost"
                icon={<CopyIcon className="h-3.5 w-3.5" />}
                onClick={() => {
                  onWaveAction(menu.waveIndex, 'duplicate');
                  setMenu(null);
                }}
              >
                {c.ctxWaveDuplicate}
              </Btn>
              <Btn
                size="sm"
                variant="ghost"
                className="text-[var(--cn-alert-deep)]"
                icon={<TrashIcon className="h-3.5 w-3.5" />}
                onClick={() => {
                  onWaveAction(menu.waveIndex, 'delete');
                  setMenu(null);
                }}
              >
                {c.ctxWaveDelete}
              </Btn>
            </div>
          )}
        </div>
      )}
    </Deck>
  );
}
