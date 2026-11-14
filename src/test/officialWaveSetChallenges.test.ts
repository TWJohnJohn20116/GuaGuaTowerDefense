/**
 * 官方波次組必須可被找到，並有可追蹤的通關成就
 *
 * 突變挑戰移除後，這裡只保留「波次集 × 成就」的契約：
 * 官方波次組要能被 findPlayableWaveSet 解析，且對應成就要存在、可計算進度。
 */
import { describe, it, expect } from 'vitest';
import { ALL_ACHIEVEMENTS, getInitialStatistics } from '@/data/achievementData';
import { checkCondition } from '@/store/achievementStoreCheck';
import { findPlayableWaveSet } from '@/utils/waveSets';

const WAVE_SPECS = [
  { achievementId: 'wave_shield_assault', waveSetId: 'official_shield_assault' },
  { achievementId: 'wave_ghost_tide', waveSetId: 'official_ghost_tide' },
] as const;

describe('official wave sets', () => {
  it('每個官方波次組都能被找到', () => {
    for (const spec of WAVE_SPECS) {
      expect(findPlayableWaveSet(spec.waveSetId), spec.waveSetId).toBeDefined();
    }
  });

  it('每個官方波次組都有對應成就，且初始狀態未達成但有進度欄位', () => {
    const statistics = getInitialStatistics();
    for (const spec of WAVE_SPECS) {
      const achievement = ALL_ACHIEVEMENTS.find((a) => a.id === spec.achievementId);
      expect(achievement, spec.achievementId).toBeDefined();
      const result = checkCondition(achievement!, statistics, {});
      expect(result.met).toBe(false);
      expect(result.progress.length).toBe(achievement!.conditions.length);
    }
  });
});
