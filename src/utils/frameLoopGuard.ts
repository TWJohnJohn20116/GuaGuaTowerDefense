/**
 * 幀迴圈錯誤護欄
 *
 * requestAnimationFrame 迴圈有一個致命特性：只要 callback 內拋出例外，
 * 而下一幀的排程又寫在 callback 尾端，整個迴圈就會「安靜地死亡」——
 * 敵人不再移動、塔不再開火，玩家只看到畫面定格，控制台只有一行沒人看的紅字。
 *
 * 這裡的做法是：把每一幀的實際運算包進 try/catch，並在 finally 裡排下一幀，
 * 保證「單幀異常 = 掉一幀」而不是「單幀異常 = 本局結束」。
 * 同時對重複錯誤做節流，避免每幀 60 次的 console 洪水把真正的第一個錯誤淹掉。
 */

interface FrameLoopGuardOptions {
  /** 上報時用的標籤（例如 'game-loop'） */
  label?: string;
  /** 同一組訊息的最小上報間隔（毫秒）；期間內的錯誤只計數不上報 */
  throttleMs?: number;
  /** 測試或 devtools 用的上報出口，預設 console.error */
  onError?: (error: unknown, info: { label: string; count: number; throttled: number }) => void;
}

interface FrameLoopGuard {
  /** 包住一幀的運算；永不向外拋出 */
  run: (frame: () => void) => void;
  /** 累計異常幀數 */
  readonly errorCount: number;
  /** 累計被節流掉的上報數 */
  readonly throttledCount: number;
  /** 最後一次捕捉到的錯誤 */
  readonly lastError: unknown;
  /** 重置計數（例如換局時） */
  reset: () => void;
}

const DEFAULT_THROTTLE_MS = 2000;

const describe = (error: unknown): string => {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }
  return String(error);
};

export const createFrameLoopGuard = (options: FrameLoopGuardOptions = {}): FrameLoopGuard => {
  const label = options.label ?? 'frame-loop';
  const throttleMs = options.throttleMs ?? DEFAULT_THROTTLE_MS;
  const emit = options.onError ?? ((error, info) => {
    console.error(`[${info.label}] frame error #${info.count}`, error);
  });

  let count = 0;
  let throttled = 0;
  let lastError: unknown = null;
  let lastReportAt = Number.NEGATIVE_INFINITY;

  const run = (frame: () => void): void => {
    try {
      frame();
    } catch (error) {
      count += 1;
      lastError = error;

      // performance.now() 只在瀏覽器有；Node 測試環境沒有就退化為不節流
      const now = typeof performance !== 'undefined' ? performance.now() : 0;
      if (now - lastReportAt >= throttleMs) {
        lastReportAt = now;
        emit(error, { label, count, throttled });
      } else {
        throttled += 1;
      }
    }
  };

  return {
    run,
    get errorCount() {
      return count;
    },
    get throttledCount() {
      return throttled;
    },
    get lastError() {
      return lastError;
    },
    reset() {
      count = 0;
      throttled = 0;
      lastError = null;
      lastReportAt = Number.NEGATIVE_INFINITY;
    },
  };
};

/** 供除錯面板快速取用人類可讀摘要 */
export const summarizeFrameErrors = (guard: FrameLoopGuard): string => {
  if (guard.errorCount === 0) return 'no frame errors';
  return `${guard.errorCount} frame error(s), last: ${describe(guard.lastError)}`;
};
