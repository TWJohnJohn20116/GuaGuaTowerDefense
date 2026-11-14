import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { resolveFailureAnalysisKeys } from '@/data/gameOverAnalysis';

describe('game over failure analysis', () => {
  it('flags few towers and missing control, not just the old frost/poison/lightning trio', () => {
    expect(resolveFailureAnalysisKeys({
      towerCount: 3, upgradeCount: 5, towerTypes: ['basic', 'sniper'],
    })).toEqual(['fewTowers', 'noSpecial']);
    expect(resolveFailureAnalysisKeys({
      towerCount: 6, upgradeCount: 1, towerTypes: ['basic'],
    })).toEqual(['lowUpgrades', 'noSpecial']);
    expect(resolveFailureAnalysisKeys({
      towerCount: 6, upgradeCount: 5, towerTypes: ['basic', 'laser'],
    })).toEqual(['noSpecial']);
  });

  it('treats wind knockback as control and skips the tip when a control tower exists', () => {
    expect(resolveFailureAnalysisKeys({
      towerCount: 6, upgradeCount: 5, towerTypes: ['basic', 'wind'],
    })).toEqual([]);
    expect(resolveFailureAnalysisKeys({
      towerCount: 6, upgradeCount: 5, towerTypes: ['frost'],
    })).toEqual([]);
    expect(resolveFailureAnalysisKeys({
      towerCount: 0, upgradeCount: 0, towerTypes: [],
    })).toEqual(['fewTowers', 'lowUpgrades']);
  });

  it('wires the helper into GameOver and drops the hardcoded trio', () => {
    const src = readFileSync(
      resolve(__dirname, '../components/scenes/GameOver.tsx'),
      'utf8',
    );
    expect(src).toMatch(/resolveFailureAnalysisKeys/);
    expect(src).not.toMatch(/\['frost', 'poison', 'lightning'\]/);
  });
});
