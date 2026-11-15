import { describe, expect, it } from 'vitest';
import { fusionBurstText } from '@/data/fusionBurstLabel';
import { zhTW } from '@/i18n/locales/zh-TW';

describe('fusion burst copy', () => {
  it('uses Traditional Chinese without the English FUSION stamp', () => {
    expect(fusionBurstText(zhTW.towers.fusion.burst)).toBe('融合');
    expect(fusionBurstText('')).toBe('融合');
    expect(fusionBurstText(zhTW.towers.fusion.burst)).not.toMatch(/FUSION|⚛/i);
  });
});
