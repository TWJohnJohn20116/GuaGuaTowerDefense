/**
 * 波次公式化生成測試
 *
 * 鎖住三件事：數量隨波次成長、型別階梯在指定波次切換、Boss 只在每 N 波插入。
 * 另外驗「壞輸入不會產生壞波次」（UI 直接餵使用者輸入）。
 */
import { describe, expect, it } from 'vitest';
import { DEFAULT_WAVE_FORMULA, describeFormula, generateWaves, normalizeFormula } from '@/workshop/content/waveFormula';

describe('generateWaves', () => {
  it('產生指定波數，數量依 countGrowth 成長', () => {
    const waves = generateWaves({ waves: 4, tiers: [{ type: "grunt", fromWave: 1, count: 5 }], countGrowth: 3, bossEvery: 0 });
    expect(waves).toHaveLength(4);
    expect(waves[0].enemies[0].count).toBe(5);
    expect(waves[1].enemies[0].count).toBe(8);
    expect(waves[3].enemies[0].count).toBe(14);
  });

  it('型別階梯在指定波次切換並重新計算數量', () => {
    const waves = generateWaves({
      waves: 6,
      tiers: [
        { type: "grunt", fromWave: 1, count: 4 },
        { type: "tank", fromWave: 4, count: 2 },
      ],
      countGrowth: 1,
      bossEvery: 0,
    });
    expect(waves[2].enemies[0].type).toBe("grunt");
    expect(waves[3].enemies[0].type).toBe("tank");
    expect(waves[3].enemies[0].count).toBe(2);
    expect(waves[5].enemies[0].count).toBe(4);
  });

  it('Boss 只在每 N 波插入', () => {
    const waves = generateWaves({ waves: 6, bossEvery: 3, bossType: "boss", bossCount: 2 });
    expect(waves[2].enemies.some((enemy) => enemy.type === "boss")).toBe(true);
    expect(waves[0].enemies.some((enemy) => enemy.type === "boss")).toBe(false);
    const bossBlock = waves[2].enemies.find((enemy) => enemy.type === "boss");
    expect(bossBlock?.count).toBe(2);
  });

  it('獎勵逐波成長', () => {
    const waves = generateWaves({ waves: 3, rewardBase: 10, rewardGrowth: 5 });
    expect(waves.map((wave) => wave.reward)).toEqual([10, 15, 20]);
  });
});

describe('normalizeFormula', () => {
  it('把離譜輸入夾回合法範圍', () => {
    const formula = normalizeFormula({ waves: 9999, countGrowth: -5, bossEvery: 999, intervalMs: 1, rewardBase: -100 });
    expect(formula.waves).toBe(200);
    expect(formula.countGrowth).toBe(0);
    expect(formula.bossEvery).toBe(50);
    expect(formula.intervalMs).toBe(50);
    expect(formula.rewardBase).toBe(0);
  });

  it('空型別階梯會退回預設', () => {
    const formula = normalizeFormula({ tiers: [{ type: "   ", fromWave: 1, count: 3 }] });
    expect(formula.tiers).toEqual(DEFAULT_WAVE_FORMULA.tiers);
  });
});

describe('describeFormula', () => {
  it('摘要包含波數、成長與出王節奏', () => {
    const text = describeFormula({ waves: 10, countGrowth: 2, bossEvery: 5, bossCount: 1, bossType: "boss" });
    expect(text).toContain("10 波");
    expect(text).toContain("+2");
    expect(text).toContain("每 5 波");
  });
});
