import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { drawTowerModel, type TowerDrawParams } from '@/components/game/TowerModels';
import { TOWER_DATA } from '@/data/gameData/towerData';
import type { TowerType } from '@/types/game';
import * as skinModels from '@/data/skins/skinModelLibrary';

interface DrawCall {
  method: string;
  args: unknown[];
  fill: string;
  stroke: string;
}

/** 記錄真正的繪製呼叫與狀態堆疊，而非檢查原始碼字串。 */
function canvasRecorder() {
  const calls: DrawCall[] = [];
  const state: Record<string, unknown> = {
    fillStyle: '#112233', strokeStyle: '#445566', lineWidth: 7,
    globalAlpha: 0.8, lineJoin: 'miter', lineCap: 'butt',
    shadowBlur: 0, shadowColor: 'transparent',
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
        calls.push({ method, args, fill: String(target.fillStyle), stroke: String(target.strokeStyle) });
        if (method === 'save') stack.push({ ...target });
        if (method === 'restore') {
          const saved = stack.pop();
          if (!saved) throw new Error('Unbalanced Canvas restore');
          Object.assign(target, saved);
        }
        if (method === 'createRadialGradient' || method === 'createLinearGradient') return { addColorStop() {} };
        return undefined;
      };
    },
    set(target, prop, value: unknown) {
      target[String(prop)] = value;
      return true;
    },
  });
  return { ctx: proxy as unknown as CanvasRenderingContext2D, calls, state, stack };
}

function params(ctx: CanvasRenderingContext2D, over: Partial<TowerDrawParams> = {}): TowerDrawParams {
  return {
    ctx, cx: 70, cy: 70, radius: 17.5, rotation: Math.PI / 3,
    color: '#5367d9', highlight: '#d9e0ff', level: 3, recoil: 2, tileSize: 50,
    ...over,
  };
}

function signature(type: string, level = 3): string {
  const r = canvasRecorder();
  drawTowerModel(type, params(r.ctx, { level, recoil: 0 }));
  return JSON.stringify(r.calls);
}

const types = Object.keys(TOWER_DATA) as TowerType[];

describe('原生塔俯視 2D 貼紙造型', () => {
  beforeEach(() => vi.spyOn(Date, 'now').mockReturnValue(2500));
  afterEach(() => vi.restoreAllMocks());

  it.each(types)('%s 的五級模型可在縮圖和戰場尺寸繪製，且恢復 Canvas 狀態', (type) => {
    for (let level = 1; level <= 5; level += 1) {
      for (const radius of [7, 17.5, 25.2]) {
        const r = canvasRecorder();
        const before = { ...r.state };
        expect(() => drawTowerModel(type, params(r.ctx, { level, radius }))).not.toThrow();
        expect(r.stack).toHaveLength(0);
        expect(r.state).toEqual(before);
        expect(r.calls.some((call) => call.method === 'fill' && call.fill === '#5367d9')).toBe(true);
        expect(r.calls.some((call) => call.method === 'stroke' && call.stroke === '#2e2440')).toBe(true);
      }
    }
  });

  it.each(types)('%s 的 Lv1–Lv5 具有不同的實際繪製結構', (type) => {
    const levels = new Set<string>();
    for (let level = 1; level <= 5; level += 1) levels.add(signature(type, level));
    expect(levels.size).toBe(5);
  });

  it.each([
    ['storm', 'lightning'], ['plague', 'flame'],
    ['demolisher', 'cannon'], ['tempest', 'pulse'],
  ])('%s 具有獨立輪廓，不再轉交給 %s 的模型', (fusion, source) => {
    expect(signature(fusion)).not.toBe(signature(source));
  });

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])('半徑 %s 時不向 Canvas 傳入無效座標', (radius) => {
    const r = canvasRecorder();
    drawTowerModel('basic', params(r.ctx, { radius }));
    expect(r.calls).toHaveLength(0);
  });

  it('無效的中心點不啟動繪製', () => {
    const r = canvasRecorder();
    drawTowerModel('basic', params(r.ctx, { cx: Number.NaN }));
    expect(r.calls).toHaveLength(0);
  });

  it('底座先繪製，武器才套用朝向與像素後座力', () => {
    const r = canvasRecorder();
    drawTowerModel('basic', params(r.ctx, { radius: 17.5, recoil: 4 }));
    const firstRotation = r.calls.findIndex((call) => call.method === 'rotate');
    expect(firstRotation).toBeGreaterThan(0);
    expect(r.calls.slice(0, firstRotation).some((call) => call.method === 'fill')).toBe(true);
    expect(r.calls).toEqual(expect.arrayContaining([
      expect.objectContaining({ method: 'rotate', args: [Math.PI / 3] }),
      expect.objectContaining({ method: 'translate', args: [-8, 0] }),
    ]));
  });

  it.each(['money', 'pulse'])('%s 的無方向機構不跟著炮口轉向或後座', (type) => {
    const r = canvasRecorder();
    drawTowerModel(type, params(r.ctx, { recoil: 4 }));
    expect(r.calls.some((call) => call.method === 'rotate' && call.args[0] === Math.PI / 3)).toBe(false);
    expect(r.calls.some((call) => call.method === 'translate' && call.args[0] === -8)).toBe(false);
  });

  it('模型集皮膚維持優先權，並取得原始動畫與配色參數', () => {
    const r = canvasRecorder();
    const p = params(r.ctx);
    const draw = vi.fn((_p: TowerDrawParams) => {});
    const get = vi.spyOn(skinModels, 'getSkinDrawer').mockReturnValue(draw);
    drawTowerModel('storm', p, 'arcane');
    expect(get).toHaveBeenCalledWith('arcane', 3);
    expect(draw).toHaveBeenCalledTimes(1);
    expect(draw).toHaveBeenCalledWith(p);
    expect(r.stack).toHaveLength(0);
  });

  it('未知的 Mod 模型種類仍使用基礎塔後備外觀', () => {
    expect(signature('unknown-mod-model')).toBe(signature('basic'));
  });
});
