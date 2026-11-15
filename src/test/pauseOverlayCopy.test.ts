import { describe, expect, it } from 'vitest';
import { zhTW } from '@/i18n/locales/zh-TW';

describe('pause overlay chrome copy', () => {
  it('has Traditional Chinese for the battle tab and resume hint', () => {
    expect(zhTW.game.pauseTabBattle).toMatch(/戰況/);
    expect(zhTW.game.pauseResumeHint).toMatch(/ESC/);
    expect(zhTW.game.pauseResumeHint).toMatch(/P/);
  });
});
