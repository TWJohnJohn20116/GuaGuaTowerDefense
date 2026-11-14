import { describe, expect, it, vi } from 'vitest';
import { createFrameLoopGuard, summarizeFrameErrors } from '@/utils/frameLoopGuard';

describe('幀迴圈錯誤護欄', () => {
  it('吞掉單幀異常，讓呼叫端繼續排下一幀', () => {
    const onError = vi.fn();
    const guard = createFrameLoopGuard({ onError });

    let frames = 0;
    for (let i = 0; i < 5; i++) {
      // 模擬 requestAnimationFrame 的一幀
      guard.run(() => {
        frames++;
        if (i === 2) throw new ReferenceError('generateId is not defined');
      });
    }

    // 關鍵：五幀全部執行完，而不是在第 3 幀整個迴圈死掉
    expect(frames).toBe(5);
    expect(guard.errorCount).toBe(1);
    expect(guard.lastError).toBeInstanceOf(ReferenceError);
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('正常幀不計數、不上報', () => {
    const onError = vi.fn();
    const guard = createFrameLoopGuard({ onError });
    guard.run(() => {});
    expect(guard.errorCount).toBe(0);
    expect(onError).not.toHaveBeenCalled();
    expect(summarizeFrameErrors(guard)).toBe('no frame errors');
  });

  it('重複異常會節流，避免每幀 60 次的 console 洪水淹掉第一個錯誤', () => {
    const onError = vi.fn();
    const guard = createFrameLoopGuard({ onError, throttleMs: 10_000 });

    for (let i = 0; i < 100; i++) guard.run(() => { throw new Error('boom'); });

    expect(guard.errorCount).toBe(100);
    expect(guard.throttledCount).toBe(99);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(summarizeFrameErrors(guard)).toMatch(/100 frame error/);
  });

  it('reset 會清空計數（換局時使用）', () => {
    const guard = createFrameLoopGuard({ onError: () => {} });
    guard.run(() => { throw new Error('x'); });
    guard.reset();
    expect(guard.errorCount).toBe(0);
    expect(guard.throttledCount).toBe(0);
    expect(guard.lastError).toBeNull();
  });
});
