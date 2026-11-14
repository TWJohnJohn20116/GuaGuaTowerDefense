/**
 * 敵人本體精靈快取
 *
 * `drawEnemyModel` 的 renderer 全部不使用 `time` 參數（時間只用在本體之外的
 * spawn 縮放、隱身透明度、狀態環），所以同一個 modelType + 顏色 + 半徑的像素永遠一樣。
 * 這裡驗證：同樣的組合只烘焙一次、不同組合各自快取、沒有 2D context 時安全退回。
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  clearEnemySpriteCache,
  getEnemySprite,
  getEnemySpriteCacheSize,
} from '@/utils/enemySpriteCache';

/** 可接受任何屬性設定與方法呼叫的假 2D context */
const makeFakeCtx = () => {
  const calls: string[] = [];
  const ctx = new Proxy(
    {},
    {
      get: (_target, prop) => {
        const name = String(prop);
        return (..._args: unknown[]) => {
          calls.push(name);
        };
      },
      set: () => true,
    },
  );
  return { ctx: ctx as unknown as CanvasRenderingContext2D, calls };
};

describe('敵人精靈快取', () => {
  afterEach(() => {
    clearEnemySpriteCache();
    vi.restoreAllMocks();
  });

  it('同一組 modelType/顏色/半徑只烘焙一次（回傳同一個物件）', () => {
    const { ctx } = makeFakeCtx();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx);

    const a = getEnemySprite({ modelType: 'normal', color: '#ff0000', radius: 12 });
    const b = getEnemySprite({ modelType: 'normal', color: '#ff0000', radius: 12 });

    expect(a).not.toBeNull();
    expect(b).toBe(a);
    expect(getEnemySpriteCacheSize()).toBe(1);
  });

  it('半徑會被四捨五入成級距（12.4 與 12.2 共用同一張精靈）', () => {
    const { ctx } = makeFakeCtx();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx);

    const a = getEnemySprite({ modelType: 'tank', color: '#00ff00', radius: 12.4 });
    const b = getEnemySprite({ modelType: 'tank', color: '#00ff00', radius: 12.2 });

    expect(b).toBe(a);
    expect(getEnemySpriteCacheSize()).toBe(1);
  });

  it('顏色 / 種類 / 光暈不同就是不同精靈', () => {
    const { ctx } = makeFakeCtx();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx);

    getEnemySprite({ modelType: 'normal', color: '#ff0000', radius: 10 });
    getEnemySprite({ modelType: 'normal', color: '#00ff00', radius: 10 });
    getEnemySprite({ modelType: 'tank', color: '#ff0000', radius: 10 });
    getEnemySprite({ modelType: 'normal', color: '#ff0000', radius: 10, glowColor: '#ffffff', glowIntensity: 1 });

    expect(getEnemySpriteCacheSize()).toBe(4);
  });

  it('有光暈時圖片要留白（畫布比本體大），否則光暈會被裁掉', () => {
    const { ctx } = makeFakeCtx();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx);

    const plain = getEnemySprite({ modelType: 'normal', color: '#ff0000', radius: 10 });
    const glow = getEnemySprite({
      modelType: 'normal', color: '#ff0000', radius: 10, glowColor: '#ffffff', glowIntensity: 2,
    });

    expect(glow!.size).toBeGreaterThan(plain!.size);
  });

  it('沒有 2D context 時回傳 null（呼叫端退回直接繪製，不應拋錯）', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);

    expect(() => getEnemySprite({ modelType: 'normal', color: '#ff0000', radius: 10 })).not.toThrow();
    expect(getEnemySprite({ modelType: 'normal', color: '#ff0000', radius: 10 })).toBeNull();
  });

  it('clearEnemySpriteCache 會清空快取（畫布尺寸改變後重新烘焙）', () => {
    const { ctx } = makeFakeCtx();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx);

    getEnemySprite({ modelType: 'normal', color: '#ff0000', radius: 10 });
    expect(getEnemySpriteCacheSize()).toBe(1);

    clearEnemySpriteCache();
    expect(getEnemySpriteCacheSize()).toBe(0);
  });
});
