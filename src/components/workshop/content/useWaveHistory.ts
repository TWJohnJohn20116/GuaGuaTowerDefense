/**
 * 波次編輯的撤銷／重做
 *
 * 為什麼不進 store：`workshopStore` 的契約是「專案資料」，加歷史堆疊會讓每次
 * 專案寫入都多一份快照，而且撤銷的粒度應該由編輯器決定（一次拖曳＝一步）。
 * 所以歷史留在這個 hook 裡，唯一寫入點仍然是傳進來的 `apply`。
 *
 * 換關卡（signature 改變）時歷史清空——跨關卡撤銷會把 A 關的波次寫進 B 關。
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { WaveConfig } from '@/types/game';

/** 歷史上限：50 步夠用，再多只是吃記憶體 */
const HISTORY_LIMIT = 50;

interface UseWaveHistoryOptions {
  /** 目前關卡的波次（每次 render 傳進來，hook 內部用 ref 跟上） */
  waves: WaveConfig[];
  /** 唯一的寫入點：把新的波次寫回 store */
  apply: (next: WaveConfig[]) => void;
  /** 換關卡時改變這個字串，歷史會清空 */
  signature: string;
  /** 是否掛上 Ctrl+Z／Ctrl+Shift+Z／Ctrl+Y（預設開） */
  keyboard?: boolean;
}

export interface WaveHistory {
  /** 寫入新波次並記一步歷史 */
  commit: (next: WaveConfig[]) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  /** 已記錄的步數（給狀態列顯示） */
  depth: number;
}

export function useWaveHistory({ waves, apply, signature, keyboard = true }: UseWaveHistoryOptions): WaveHistory {
  const wavesRef = useRef(waves);
  wavesRef.current = waves;
  const applyRef = useRef(apply);
  applyRef.current = apply;

  const pastRef = useRef<WaveConfig[][]>([]);
  const futureRef = useRef<WaveConfig[][]>([]);
  const [, forceTick] = useState(0);

  // 換關卡＝換一份文件，歷史不能延續
  useEffect(() => {
    pastRef.current = [];
    futureRef.current = [];
    forceTick((tick) => tick + 1);
  }, [signature]);

  const commit = useCallback((next: WaveConfig[]) => {
    pastRef.current.push(wavesRef.current);
    if (pastRef.current.length > HISTORY_LIMIT) pastRef.current.shift();
    futureRef.current = [];
    applyRef.current(next);
    forceTick((tick) => tick + 1);
  }, []);

  const undo = useCallback(() => {
    const previous = pastRef.current.pop();
    if (!previous) return;
    futureRef.current.push(wavesRef.current);
    applyRef.current(previous);
    forceTick((tick) => tick + 1);
  }, []);

  const redo = useCallback(() => {
    const next = futureRef.current.pop();
    if (!next) return;
    pastRef.current.push(wavesRef.current);
    applyRef.current(next);
    forceTick((tick) => tick + 1);
  }, []);

  useEffect(() => {
    if (!keyboard) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;
      const target = event.target instanceof HTMLElement ? event.target : null;
      const tag = target?.tagName.toLowerCase();
      // 輸入框裡的 Ctrl+Z 是「復原打字」，不能搶
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || target?.isContentEditable) return;
      const key = event.key.toLowerCase();
      if (key === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
        return;
      }
      if ((key === 'z' && event.shiftKey) || key === 'y') {
        event.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [keyboard, undo, redo]);

  return {
    commit,
    undo,
    redo,
    canUndo: pastRef.current.length > 0,
    canRedo: futureRef.current.length > 0,
    depth: pastRef.current.length,
  };
}
