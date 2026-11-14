import { describe, it, expect } from 'vitest';
import { zhTW } from '@/i18n/locales/zh-TW';

/** 圖鑑詳情頁實際會讀、但先前繁中漏填的標題 */
const ENCYCLOPEDIA_DETAIL_LABELS = [
  'detailHealth',
  'detailMoveSpeed',
  'detailKillReward',
  'detailBodySize',
  'detailActionPreview',
  'detailFirstAppearance',
  'detailWaveLabel',
  'detailThreatLevel',
  'detailSpecialAbility',
  'detailRecommendedCounters',
  'detailDifficulty',
  'detailMapSize',
  'detailForks',
  'detailPathSegments',
  'detailSegmentFork',
  'detailSegmentEnd',
  'detailPointsUnit',
  'detailPathComplexity',
  'detailComplexityVeryHigh',
  'detailComplexityHigh',
  'detailComplexityMedium',
  'detailComplexityLow',
  'detailInitialResources',
  'detailInitialHealth',
  'detailInitialMoney',
  'detailValueModifiers',
  'detailEnemyHealthMod',
  'detailEnemySpeedMod',
  'detailKillRewardMod',
  'detailBuildCostMod',
  'detailWaveDelayMod',
  'detailDifficultyTraits',
  'detailEffectAttributes',
  'detailStackable',
  'detailMaxStacks',
  'detailStackUnit',
  'detailEffectCategory',
  'detailDebuff',
  'detailBuff',
  'detailDebuffDesc',
  'detailBuffDesc',
  'detailVisualMark',
  'detailEffectColor',
  'detailSkillParams',
  'detailCooldownTime',
  'detailDurationTime',
  'detailHotkeyLabel',
  'detailUsageTips',
  'detailEffectExplanation',
  'detailCoreEffect',
  'detailVisualTheme',
  'detailThemeColor',
  'detailActiveSkillTag',
  'detailNoDuration',
] as const;

describe('encyclopedia detail labels in zh-TW', () => {
  it('fills enemy, map, difficulty, status and skill page titles', () => {
    const enc = zhTW.encyclopedia as Record<string, unknown> | undefined;
    expect(enc).toBeTruthy();
    for (const key of ENCYCLOPEDIA_DETAIL_LABELS) {
      const value = enc?.[key];
      expect(typeof value, key).toBe('string');
      expect(String(value).length, key).toBeGreaterThan(0);
    }
  });
});
