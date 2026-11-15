/**
 * 腳本對塔的增益（action.modifyTower）純函式測試
 *
 * 這裡驗的是「合成與夾限規則」，不是渲染：
 *  - '*' 與塔種自身相乘
 *  - 重複套用會累乘（每波強化）
 *  - 倍率永遠夾在 0.1~5
 */
import { describe, expect, it } from 'vitest';
import {
  ALL_TOWER_SCOPE,
  applyScriptTowerMod,
  clampTowerMod,
  isEmptyTowerModMap,
  NEUTRAL_TOWER_MOD,
  resolveScriptTowerMod,
  SCRIPT_TOWER_MOD_MAX,
  SCRIPT_TOWER_MOD_MIN,
} from '@/data/scriptTowerMods';

describe('resolveScriptTowerMod', () => {
  it('空 map 回中性倍率', () => {
    expect(resolveScriptTowerMod(undefined, 'basic')).toEqual(NEUTRAL_TOWER_MOD);
    expect(resolveScriptTowerMod({}, 'basic')).toEqual(NEUTRAL_TOWER_MOD);
  });

  it('只設全域時套用到任何塔種', () => {
    const map = applyScriptTowerMod(undefined, ALL_TOWER_SCOPE, 'damage', 2);
    expect(resolveScriptTowerMod(map, 'sniper').damage).toBeCloseTo(2);
    expect(resolveScriptTowerMod(map, 'sniper').range).toBeCloseTo(1);
  });

  it('全域與塔種自身相乘', () => {
    let map = applyScriptTowerMod(undefined, ALL_TOWER_SCOPE, 'damage', 2);
    map = applyScriptTowerMod(map, 'sniper', 'damage', 1.5);
    expect(resolveScriptTowerMod(map, 'sniper').damage).toBeCloseTo(3);
    expect(resolveScriptTowerMod(map, 'cannon').damage).toBeCloseTo(2);
  });

  it('不同屬性互不影響', () => {
    let map = applyScriptTowerMod(undefined, 'basic', 'range', 1.5);
    map = applyScriptTowerMod(map, 'basic', 'fireRate', 0.5);
    const mod = resolveScriptTowerMod(map, 'basic');
    expect(mod.range).toBeCloseTo(1.5);
    expect(mod.fireRate).toBeCloseTo(0.5);
    expect(mod.damage).toBeCloseTo(1);
  });
});

describe('applyScriptTowerMod', () => {
  it('重複套用會累乘', () => {
    let map = applyScriptTowerMod(undefined, 'basic', 'damage', 2);
    map = applyScriptTowerMod(map, 'basic', 'damage', 2);
    expect(resolveScriptTowerMod(map, 'basic').damage).toBeCloseTo(4);
  });

  it('倍率夾在 0.1~5', () => {
    const huge = applyScriptTowerMod(undefined, 'basic', 'damage', 100);
    expect(resolveScriptTowerMod(huge, 'basic').damage).toBeCloseTo(SCRIPT_TOWER_MOD_MAX);
    const tiny = applyScriptTowerMod(undefined, 'basic', 'damage', 0.0001);
    expect(resolveScriptTowerMod(tiny, 'basic').damage).toBeCloseTo(SCRIPT_TOWER_MOD_MIN);
  });

  it('空白 scope 視為全域；不修改傳入的 map', () => {
    const source = {};
    const next = applyScriptTowerMod(source, '   ', 'damage', 2);
    expect(Object.keys(next)).toEqual([ALL_TOWER_SCOPE]);
    expect(source).toEqual({});
  });
});

describe('clampTowerMod / isEmptyTowerModMap', () => {
  it('非有限數回 1', () => {
    expect(clampTowerMod(Number.NaN)).toBe(1);
    expect(clampTowerMod(Number.POSITIVE_INFINITY)).toBe(1);
  });

  it('空 map 判定', () => {
    expect(isEmptyTowerModMap(undefined)).toBe(true);
    expect(isEmptyTowerModMap({})).toBe(true);
    expect(isEmptyTowerModMap({ basic: { damage: 2 } })).toBe(false);
  });
});
