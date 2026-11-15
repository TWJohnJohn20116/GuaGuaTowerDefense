import { describe, expect, it } from 'vitest';
import { visibleLoadingTip } from '@/data/loadingTips';

describe('showTips setting on the loading screen', () => {
  it('hides loading tips when the gameplay setting is off', () => {
    expect(visibleLoadingTip(['先造經濟塔'], 0, true)).toBe('先造經濟塔');
    expect(visibleLoadingTip(['先造經濟塔'], 0, false)).toBe('');
    expect(visibleLoadingTip([], 0, true)).toBe('');
  });
});
