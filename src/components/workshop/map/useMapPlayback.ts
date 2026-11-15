/**
 * 波次路線動畫（純視覺的迷你模擬）
 *
 * 為什麼不直接呼叫 gameStoreAutoBattle：
 * 那支是 store 的 action slice，會真的寫入世界狀態（金錢、擊殺、波次、統計）。
 * 工坊的「波次路線動畫」只需要「敵人此刻在哪一格」，所以這裡用與執行期相同的
 * L 型路徑展開（editModel.expandPathCells）重算位置——不動 store、不開局、可無限重播。
 *
 * 座標語彙與 2D 繪製層一致：x/y 是「小數格座標」，(0.5,0.5) 是第 (0,0) 格的中心。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createFrameLoopGuard } from '@/utils/frameLoopGuard';
import { draftSignature, expandPathCells, type MapDraft } from '@/workshop/map/editModel';

export interface RunnerPoint {
  x: number;
  y: number;
}

export interface MapPlayback {
  playing: boolean;
  /** 領頭敵人排第一；後面依 squad 間距排開 */
  runners: RunnerPoint[];
  /** 領頭敵人的行程比例 0..1 */
  progress: number;
  speed: number;
  squad: number;
  cellCount: number;
  setSpeed: (value: number) => void;
  setSquad: (value: number) => void;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  reset: () => void;
}

/** 一隊敵人之間的間隔（格） */
const SQUAD_GAP = 2.5;
/** 狀態回寫節流：rAF 是 60fps，但 UI 只要 30fps 就夠，少一半 re-render */
const STATE_INTERVAL_MS = 33;

const cellCenter = (col: number, row: number): RunnerPoint => ({ x: col + 0.5, y: row + 0.5 });

/** 把「小數格索引」換成格座標（相鄰格之間線性內插） */
const positionAt = (
  cells: { col: number; row: number }[],
  index: number,
): RunnerPoint => {
  if (cells.length === 0) return { x: 0, y: 0 };
  if (cells.length === 1) return cellCenter(cells[0].col, cells[0].row);

  const clamped = ((index % cells.length) + cells.length) % cells.length;
  const base = Math.floor(clamped);
  const frac = clamped - base;
  const a = cells[base % cells.length];
  const b = cells[(base + 1) % cells.length];
  const pa = cellCenter(a.col, a.row);
  const pb = cellCenter(b.col, b.row);
  return { x: pa.x + (pb.x - pa.x) * frac, y: pa.y + (pb.y - pa.y) * frac };
};

export function useMapPlayback(draft: MapDraft): MapPlayback {
  const signature = draftSignature(draft);
  const cells = useMemo(
    () => expandPathCells(draft.waypoints),
    // signature 已涵蓋 waypoints / blocked / towers 的內容，逐欄列舉會讓 deps 跟著草稿物件換參考而亂跳
    // （draft 是上層每次編輯都重建的新物件，列 draft 等於每按一鍵就重算路徑）
    [signature],
  );

  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(3);
  const [squad, setSquad] = useState(3);
  const [runners, setRunners] = useState<RunnerPoint[]>([]);
  const [progress, setProgress] = useState(0);

  // 領頭敵人的行程索引（單位：格），用 ref 保存是因為它每幀都變，不需要觸發 re-render
  const headRef = useRef(0);
  const lastTickRef = useRef(0);
  const lastPublishRef = useRef(0);
  const speedRef = useRef(speed);
  const squadRef = useRef(squad);
  const cellsRef = useRef(cells);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    squadRef.current = squad;
  }, [squad]);

  useEffect(() => {
    cellsRef.current = cells;
    headRef.current = 0;
    setRunners(cells.length > 0 ? [positionAt(cells, 0)] : []);
    setProgress(0);
  }, [cells]);

  const publish = useCallback((head: number, cellCount: number) => {
    const list = cellsRef.current;
    if (list.length === 0) return;
    const total = Math.max(cellCount + SQUAD_GAP * squadRef.current, 1);
    const wrapped = ((head % total) + total) % total;
    const count = Math.max(1, Math.round(squadRef.current));
    const next: RunnerPoint[] = [];
    for (let i = 0; i < count; i++) {
      const at = wrapped - i * SQUAD_GAP;
      // 還在起點之前（負值）代表這一隻還沒入場，畫在起點外側會很難看，直接不畫
      if (at < 0) continue;
      next.push(positionAt(list, at));
    }
    setRunners(next);
    setProgress(Math.min(1, wrapped / Math.max(cellCount, 1)));
  }, []);

  useEffect(() => {
    if (!playing) return;
    if (cells.length === 0) return;

    const guard = createFrameLoopGuard({ label: 'workshop-map-playback' });
    let frame = 0;
    lastTickRef.current = performance.now();
    lastPublishRef.current = 0;

    const step = (): void => {
      const now = performance.now();
      const dt = Math.min(now - lastTickRef.current, 120) / 1000;
      lastTickRef.current = now;

      headRef.current += dt * speedRef.current;

      // 節流回寫：每幀 setState 會讓整個工作台 re-render 60 次，工坊不需要那個精度
      if (now - lastPublishRef.current >= STATE_INTERVAL_MS) {
        lastPublishRef.current = now;
        publish(headRef.current, cellsRef.current.length);
      }

      frame = requestAnimationFrame(loop);
    };

    // 單幀異常只掉一幀：guard 接住並節流上報，不會讓動畫安靜停住（AGENTS §4.5）
    const loop = (): void => {
      guard.run(step);
    };

    frame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [playing, cells.length, publish]);

  const play = useCallback(() => {
    if (cellsRef.current.length === 0) return;
    setPlaying(true);
  }, []);

  const pause = useCallback(() => {
    setPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    setPlaying((prev) => {
      if (!prev && cellsRef.current.length === 0) return false;
      return !prev;
    });
  }, []);

  const reset = useCallback(() => {
    headRef.current = 0;
    setProgress(0);
    setRunners(cellsRef.current.length > 0 ? [positionAt(cellsRef.current, 0)] : []);
  }, []);

  return {
    playing,
    runners,
    progress,
    speed,
    squad,
    cellCount: cells.length,
    setSpeed,
    setSquad,
    play,
    pause,
    toggle,
    reset,
  };
}
