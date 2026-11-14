/**
 * 繁中教學／商店文案必須提到 EMP 的 ⇧+0，不能只寫 ⇧+1~9
 */

import { describe, it, expect } from 'vitest';
import { zhTW } from '@/i18n/locales/zh-TW';
import { PLAYER_SKILL_BY_ID } from '@/data/playerSkillData';

describe('player skill hotkey copy', () => {
  it('keeps EMP on hotkey 0', () => {
    expect(PLAYER_SKILL_BY_ID.empPulse.hotkey).toBe('0');
  });

  it('mentions Shift+0 in Traditional Chinese shop and tutorial text', () => {
    expect(zhTW.shop?.toolbar?.skillsHint).toMatch(/0/);
    const blob = JSON.stringify(zhTW);
    expect(blob).toContain('⇧+0');
  });
});
