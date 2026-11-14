import { describe, expect, it } from 'vitest';
import { isDialogueAdvanceKey, nextDialogueAdvance } from '@/data/dialogueAdvance';
import { zhTW } from '@/i18n/locales/zh-TW';

describe('campaign dialogue advance', () => {
  it('treats Enter and Space as continue keys', () => {
    expect(isDialogueAdvanceKey('Enter')).toBe(true);
    expect(isDialogueAdvanceKey(' ')).toBe(true);
  });

  it('does not treat Escape or letter keys as continue', () => {
    expect(isDialogueAdvanceKey('Escape')).toBe(false);
    expect(isDialogueAdvanceKey('p')).toBe(false);
  });

  it('reveals remaining text while typing, then steps or finishes', () => {
    expect(nextDialogueAdvance(true, 0, 3)).toBe('reveal');
    expect(nextDialogueAdvance(false, 0, 3)).toBe('next');
    expect(nextDialogueAdvance(false, 2, 3)).toBe('complete');
  });

  it('uses Traditional Chinese for the continue hint', () => {
    expect(zhTW.tutorial.clickToContinue).toMatch(/點擊|Enter/);
    expect(zhTW.tutorial.clickToContinue).not.toMatch(/Click to continue/i);
  });
});
