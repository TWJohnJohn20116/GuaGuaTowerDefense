import { describe, expect, it } from 'vitest';
import {
  DEFAULT_WIN_CONDITIONS,
  evaluateWinConditions,
  mergeWinConditions,
  normalizeWinConditions,
  parseWinConditions,
  serializeWinConditions,
} from '@/workshop/model/winsConditions';
import type { WorkshopMatchSnapshot } from '@/types/workshop';

function makeSnapshot(patch: Partial<WorkshopMatchSnapshot> = {}): WorkshopMatchSnapshot {
  return { wavesSurvived: 0, secondsElapsed: 0, baseHealth: 20, leaks: 0, bossKilled: false, ...patch };
}

describe('勝負條件序列化', () => {
  it('固定欄位順序，undefined 不輸出', () => {
    expect(serializeWinConditions({ surviveWaves: 3 })).toBe('{"surviveWaves":3}');
    expect(serializeWinConditions({ baseHealth: 10, surviveWaves: 5 })).toBe('{"surviveWaves":5,"baseHealth":10}');
  });

  it('計分規則放在最後，權重超界會被夾住', () => {
    const json = serializeWinConditions({
      surviveWaves: 5,
      bossKillRequired: true,
      scoreRules: [{ id: 'kills', label: 'Kills', weight: 500 }],
    });
    expect(json).toBe('{"surviveWaves":5,"bossKillRequired":true,"scoreRules":[{"id":"kills","label":"Kills","weight":100}]}');
  });

  it('序列化 → 解析可以還原同一份條件', () => {
    const source = {
      surviveWaves: 8,
      surviveSeconds: 120,
      baseHealth: 15,
      initialMoney: 200,
      waveIntervalSeconds: 6,
      bossKillRequired: true,
      maxLeaks: 3,
      timeLimitSeconds: 300,
      scoreRules: [{ id: 'kills', label: 'Kills', weight: 2 }],
    };
    const restored = parseWinConditions(serializeWinConditions(source));
    expect(restored).toEqual(normalizeWinConditions(source));
  });

  it('壞輸入回 null，不丟例外', () => {
    expect(parseWinConditions('')).toBeNull();
    expect(parseWinConditions('not json')).toBeNull();
    expect(parseWinConditions('[]')).toBeNull();
    expect(parseWinConditions('null')).toBeNull();
  });

  it('型別錯的欄位被丟掉，不會變成 NaN', () => {
    expect(parseWinConditions('{"surviveWaves":"7"}')).toEqual({});
    expect(parseWinConditions('{"scoreRules":"nope"}')).toEqual({});
  });

  it('正規化會夾住範圍並去重計分欄位', () => {
    const normalized = normalizeWinConditions({
      surviveWaves: 999999,
      baseHealth: 0,
      scoreRules: [
        { id: 'a', label: 'A', weight: -500 },
        { id: 'a', label: 'A again', weight: 3 },
      ],
    });
    expect(normalized.surviveWaves).toBe(9999);
    expect(normalized.baseHealth).toBe(1);
    expect(normalized.scoreRules).toEqual([{ id: 'a', label: 'A', weight: -100 }]);
  });
});

describe('關卡覆寫規則合併', () => {
  it('關卡只寫存活波數，其餘欄位繼承專案層', () => {
    const merged = mergeWinConditions(
      { surviveWaves: 10, baseHealth: 20, initialMoney: 150 },
      { surviveWaves: 4 },
    );
    expect(merged.surviveWaves).toBe(4);
    expect(merged.baseHealth).toBe(20);
    expect(merged.initialMoney).toBe(150);
  });

  it('關卡沒寫計分規則時保留專案層的', () => {
    const merged = mergeWinConditions(
      { scoreRules: [{ id: 'kills', label: 'Kills', weight: 1 }] },
      { surviveSeconds: 60 },
    );
    expect(merged.scoreRules).toEqual([{ id: 'kills', label: 'Kills', weight: 1 }]);
  });

  it('關卡寫了計分規則就整份取代', () => {
    const merged = mergeWinConditions(
      { scoreRules: [{ id: 'kills', label: 'Kills', weight: 1 }] },
      { scoreRules: [{ id: 'speed', label: 'Speed', weight: 3 }] },
    );
    expect(merged.scoreRules).toEqual([{ id: 'speed', label: 'Speed', weight: 3 }]);
  });

  it('預設條件是守住 10 波、20 血、150 金', () => {
    expect(DEFAULT_WIN_CONDITIONS.surviveWaves).toBe(10);
    expect(DEFAULT_WIN_CONDITIONS.baseHealth).toBe(20);
    expect(DEFAULT_WIN_CONDITIONS.initialMoney).toBe(150);
  });
});

describe('勝負判定', () => {
  it('沒設任何條件時維持 ongoing（不是第一幀就贏）', () => {
    expect(evaluateWinConditions({}, makeSnapshot())).toBe('ongoing');
  });

  it('守住指定波數即勝利', () => {
    const condition = { surviveWaves: 5 };
    expect(evaluateWinConditions(condition, makeSnapshot({ wavesSurvived: 4 }))).toBe('ongoing');
    expect(evaluateWinConditions(condition, makeSnapshot({ wavesSurvived: 5 }))).toBe('victory');
  });

  it('基地歸零判敗', () => {
    expect(evaluateWinConditions({ surviveWaves: 5, baseHealth: 20 }, makeSnapshot({ baseHealth: 0, wavesSurvived: 5 }))).toBe('defeat');
  });

  it('漏怪超過上限判敗', () => {
    const condition = { surviveWaves: 3, maxLeaks: 2 };
    expect(evaluateWinConditions(condition, makeSnapshot({ leaks: 2, wavesSurvived: 3 }))).toBe('victory');
    expect(evaluateWinConditions(condition, makeSnapshot({ leaks: 3, wavesSurvived: 3 }))).toBe('defeat');
  });

  it('超時判敗（即使波數已達標）', () => {
    const condition = { surviveWaves: 1, timeLimitSeconds: 30 };
    expect(evaluateWinConditions(condition, makeSnapshot({ wavesSurvived: 1, secondsElapsed: 30 }))).toBe('victory');
    expect(evaluateWinConditions(condition, makeSnapshot({ wavesSurvived: 1, secondsElapsed: 31 }))).toBe('defeat');
  });

  it('要求 Boss 擊殺時，沒殺 Boss 不算贏', () => {
    const condition = { surviveWaves: 1, bossKillRequired: true };
    expect(evaluateWinConditions(condition, makeSnapshot({ wavesSurvived: 1 }))).toBe('ongoing');
    expect(evaluateWinConditions(condition, makeSnapshot({ wavesSurvived: 1, bossKilled: true }))).toBe('victory');
  });
});
