import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { zhTW } from '@/i18n/locales/zh-TW';

describe('pause overlay chrome copy', () => {
  it('has Traditional Chinese for the battle tab and resume hint', () => {
    expect(zhTW.game.pauseTabBattle).toMatch(/戰況/);
    expect(zhTW.game.pauseResumeHint).toMatch(/ESC/);
    expect(zhTW.game.pauseResumeHint).toMatch(/P/);
  });

  it('reads both strings from translation in PauseOverlay', () => {
    const src = readFileSync(
      resolve(__dirname, '../components/ui/PauseOverlay.tsx'),
      'utf8',
    );
    expect(src).toMatch(/t\.game\.pauseTabBattle/);
    expect(src).toMatch(/t\.game\.pauseResumeHint/);
    expect(src).not.toMatch(/label: '戰況'/);
    expect(src).not.toMatch(/subtitle="按 ESC 或 P 繼續遊戲"/);
  });
});
