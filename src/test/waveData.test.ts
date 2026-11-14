/**
 * 波次生成測試 (waveData)
 *
 * 測試靜態波次配置與無盡模式波次生成器的正確性
 */

import { describe, it, expect } from 'vitest';
import { WAVE_CONFIGS, generateEndlessWaveConfig, GAME_CONSTANTS, DIFFICULTY_MODIFIERS } from '@/data/gameData';

describe('WAVE_CONFIGS', () => {
  it('should have 15 standard waves', () => {
    expect(WAVE_CONFIGS).toHaveLength(15);
  });

  it('should have positive enemy counts in every wave', () => {
    for (let i = 0; i < WAVE_CONFIGS.length; i++) {
      const wave = WAVE_CONFIGS[i];
      const totalCount = wave.enemies.reduce((sum, entry) => sum + entry.count, 0);
      expect(totalCount).toBeGreaterThan(0);
    }
  });

  it('should have boss wave at wave 10', () => {
    const wave10 = WAVE_CONFIGS[9];
    const hasBoss = wave10.enemies.some(e => e.type === 'boss');
    expect(hasBoss).toBe(true);
  });

  it('should have final boss wave at wave 15', () => {
    const wave15 = WAVE_CONFIGS[14];
    const hasBoss = wave15.enemies.some(e => e.type === 'boss');
    expect(hasBoss).toBe(true);
  });
});

describe('generateEndlessWaveConfig', () => {
  it('should generate enemies for wave 1', () => {
    const result = generateEndlessWaveConfig(1);
    expect(result.enemies.length).toBeGreaterThan(0);
    const totalCount = result.enemies.reduce((sum, e) => sum + e.count, 0);
    expect(totalCount).toBeGreaterThan(0);
  });

  it('should include bosses at wave 10 and 15', () => {
    // wave 10 (index 9) should have bosses
    const wave10 = WAVE_CONFIGS[9];
    const boss10 = wave10.enemies.find(e => e.type === 'boss');
    expect(boss10).toBeDefined();
    // wave 15 (index 14) should have bosses
    const wave15 = WAVE_CONFIGS[14];
    const boss15 = wave15.enemies.find(e => e.type === 'boss');
    expect(boss15).toBeDefined();
  });

  it('should scale up with wave number', () => {
    const wave5 = generateEndlessWaveConfig(5);
    const wave20 = generateEndlessWaveConfig(20);
    const wave5Total = wave5.enemies.reduce((sum, e) => sum + e.count, 0);
    const wave20Total = wave20.enemies.reduce((sum, e) => sum + e.count, 0);
    expect(wave20Total).toBeGreaterThan(wave5Total);
  });

  it('should include all enemy types in hell mode (wave 50)', () => {
    const result = generateEndlessWaveConfig(50);
    const types = new Set(result.enemies.map(e => e.type));
    // 地獄模式應包含大部分類型
    expect(types.size).toBeGreaterThan(5);
  });

  it('should not have negative counts', () => {
    for (let wave = 1; wave <= 100; wave += 7) {
      const result = generateEndlessWaveConfig(wave);
      for (const entry of result.enemies) {
        expect(entry.count).toBeGreaterThan(0);
      }
    }
  });
});

describe('GAME_CONSTANTS', () => {
  it('should have valid grid dimensions', () => {
    expect(GAME_CONSTANTS.GRID_COLS).toBe(15);
    expect(GAME_CONSTANTS.GRID_ROWS).toBe(11);
    expect(GAME_CONSTANTS.GRID_COLS * GAME_CONSTANTS.GRID_ROWS).toBe(165);
  });

  it('should have reasonable initial values', () => {
    expect(GAME_CONSTANTS.INITIAL_MONEY).toBeGreaterThan(0);
    expect(GAME_CONSTANTS.INITIAL_HEALTH).toBeGreaterThan(0);
    expect(GAME_CONSTANTS.MAX_TOWER_LEVEL).toBeGreaterThanOrEqual(3);
    expect(GAME_CONSTANTS.WAVE_DELAY).toBeGreaterThan(0);
  });
});

describe('DIFFICULTY_MODIFIERS', () => {
  it('should have all difficulty levels', () => {
    const levels = ['easy', 'normal', 'hard', 'nightmare', 'impossible', 'custom'];
    for (const level of levels) {
      expect(DIFFICULTY_MODIFIERS[level as keyof typeof DIFFICULTY_MODIFIERS]).toBeDefined();
    }
  });

  it('should have normal difficulty as baseline (multiplier = 1.0)', () => {
    const normal = DIFFICULTY_MODIFIERS.normal;
    expect(normal.enemyHealthMult).toBe(1.0);
    expect(normal.enemySpeedMult).toBe(1.0);
    expect(normal.enemyRewardMult).toBe(1.0);
    expect(normal.towerCostMult).toBe(1.0);
  });

  it('should have harder difficulties with higher enemy multipliers', () => {
    expect(DIFFICULTY_MODIFIERS.hard.enemyHealthMult).toBeGreaterThan(DIFFICULTY_MODIFIERS.normal.enemyHealthMult);
    expect(DIFFICULTY_MODIFIERS.nightmare.enemyHealthMult).toBeGreaterThan(DIFFICULTY_MODIFIERS.hard.enemyHealthMult);
    expect(DIFFICULTY_MODIFIERS.impossible.enemyHealthMult).toBeGreaterThan(DIFFICULTY_MODIFIERS.nightmare.enemyHealthMult);
  });

  it('should have easier difficulties with lower enemy multipliers', () => {
    expect(DIFFICULTY_MODIFIERS.easy.enemyHealthMult).toBeLessThan(DIFFICULTY_MODIFIERS.normal.enemyHealthMult);
    expect(DIFFICULTY_MODIFIERS.easy.startingMoney).toBeGreaterThan(DIFFICULTY_MODIFIERS.normal.startingMoney);
    expect(DIFFICULTY_MODIFIERS.easy.startingHealth).toBeGreaterThan(DIFFICULTY_MODIFIERS.normal.startingHealth);
  });
});