import { describe, expect, it } from 'vitest';
import { formatStepProgress } from '@/data/tutorialOverlayCopy';
import { zhTW } from '@/i18n/locales/zh-TW';

describe('campaign tutorial overlay copy', () => {
  it('fills step numbers into the Traditional Chinese template', () => {
    expect(formatStepProgress('步驟 {current} / {total}', 3, 12)).toBe('步驟 3 / 12');
    expect(zhTW.tutorial.overlayStep).toMatch(/步驟 \{current\} \/ \{total\}/);
    expect(zhTW.tutorial.overlayStep).not.toMatch(/STEP/i);
  });
});
