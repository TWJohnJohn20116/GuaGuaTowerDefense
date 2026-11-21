import { afterEach, describe, expect, it, vi } from 'vitest';
import { drawEnemyModel } from '@/utils/enemyRenderer';
import { ENEMY_DATA } from '@/data/gameData/enemyData';
import { clearEnemySpriteCache, getEnemySprite, getEnemySpriteCacheSize } from '@/utils/enemySpriteCache';

interface DrawCall {
  method: string;
  args: unknown[];
  fill: string;
  stroke: string;
  alpha: number;
}

function recorder() {
  const calls: DrawCall[] = [];
  const state: Record<string, unknown> = {
    fillStyle: '#123456', strokeStyle: '#654321', globalAlpha: 0.4,
    lineWidth: 1, lineJoin: 'miter', lineCap: 'butt', shadowBlur: 0, shadowColor: 'transparent',
  };
  const stack: Record<string, unknown>[] = [];
  const proxy = new Proxy(state, {
    get(target, prop) {
      if (typeof prop === 'string' && prop in target) return target[prop];
      const method = String(prop);
      return (...args: unknown[]) => {
        for (const arg of args) {
          if (typeof arg === 'number' && !Number.isFinite(arg)) throw new Error('Non-finite Canvas coordinate');
        }
        if (method === 'arc' && typeof args[2] === 'number' && args[2] < 0) throw new Error('Negative radius');
        calls.push({ method, args, fill: String(target.fillStyle), stroke: String(target.strokeStyle), alpha: Number(target.globalAlpha) });
        if (method === 'save') stack.push({ ...target });
        if (method === 'restore') {
          const saved = stack.pop();
          if (!saved) throw new Error('Unbalanced Canvas restore');
          Object.assign(target, saved);
        }
        return undefined;
      };
    },
    set(target, prop, value: unknown) {
      target[String(prop)] = value;
      return true;
    },
  });
  return { ctx: proxy as unknown as CanvasRenderingContext2D, state, stack, calls };
}

const types = Object.keys(ENEMY_DATA);
const COLOR = '#5e88d1';

function signature(type: string | undefined, time = 0): string {
  const r = recorder();
  drawEnemyModel(r.ctx, 60, 60, 18, type, COLOR, time);
  return JSON.stringify(r.calls);
}

describe('敵人俯視貼紙本體', () => {
  afterEach(() => {
    clearEnemySpriteCache();
    vi.restoreAllMocks();
  });

  it.each(types)('%s 支援小圖與Boss尺寸，保留配色及Canvas狀態', (type) => {
    for (const radius of [5, 14, 32]) {
      const r = recorder();
      const before = { ...r.state };
      expect(() => drawEnemyModel(r.ctx, 60, 60, radius, type, COLOR, 0)).not.toThrow();
      expect(r.state).toEqual(before);
      expect(r.stack).toHaveLength(0);
      expect(r.calls.some(call => call.method === 'fill' && call.fill === COLOR)).toBe(true);
      expect(r.calls.some(call => call.method === 'stroke' && call.stroke === '#2e2440')).toBe(true);
    }
  });

  it.each(types)('%s 的本體不隨時間改變，可沿用單張精靈快取', (type) => {
    expect(signature(type, 0)).toBe(signature(type, 987654));
  });

  it('全部內建敵人即使使用相同顏色，也具有不同的幾何繪製', () => {
    expect(new Set(types.map(type => signature(type))).size).toBe(types.length);
  });

  it('破壞敵人使用工程工具輪廓，而非通用後備或爆破敵人', () => {
    expect(signature('saboteur')).not.toBe(signature(undefined));
    expect(signature('saboteur')).not.toBe(signature('bomber'));
    expect(signature('saboteur')).not.toBe(signature('jammer'));
  });

  it.each(types)('%s 直接繪製時尊重外層隱身／相位透明度', (type) => {
    const r = recorder();
    r.state.globalAlpha = 0.25;
    drawEnemyModel(r.ctx, 60, 60, 18, type, COLOR, 0);
    expect(r.calls.filter(call => call.method === 'fill').every(call => call.alpha <= 0.25)).toBe(true);
    expect(r.calls.some(call => call.method === 'fill' && call.fill === COLOR && call.alpha === 0.25)).toBe(true);
    expect(r.state.globalAlpha).toBe(0.25);
  });

  it.each([undefined, 'missing-mod-model', '__proto__', 'constructor'])('未知或原型名稱 %s 安全使用Mod後備造型', (type) => {
    const r = recorder();
    expect(() => drawEnemyModel(r.ctx, 60, 60, 18, type, COLOR, 0)).not.toThrow();
    expect(r.calls.some(call => call.method === 'fill' && call.fill === COLOR)).toBe(true);
    expect(r.stack).toHaveLength(0);
  });

  it.each([0, -2, Number.NaN, Number.POSITIVE_INFINITY])('無效半徑 %s 不向Canvas送出路徑', (radius) => {
    const r = recorder();
    drawEnemyModel(r.ctx, 0, 0, radius, 'normal', COLOR, 0);
    expect(r.calls).toHaveLength(0);
  });

  it('無效中心點不繪製', () => {
    const r = recorder();
    drawEnemyModel(r.ctx, Number.NaN, 0, 14, 'normal', COLOR, 0);
    expect(r.calls).toHaveLength(0);
  });

  it.each(types)('%s 可真正烘焙並重用原有精靈快取', (type) => {
    const r = recorder();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(r.ctx);
    const a = getEnemySprite({ modelType: type, color: COLOR, radius: 14 });
    expect(a).not.toBeNull();
    const count = r.calls.length;
    const b = getEnemySprite({ modelType: type, color: COLOR, radius: 14 });
    expect(b).toBe(a);
    expect(r.calls).toHaveLength(count);
    expect(a?.size).toBe(32);
    expect(getEnemySpriteCacheSize()).toBe(1);
    expect(r.stack).toHaveLength(0);
  });
});
