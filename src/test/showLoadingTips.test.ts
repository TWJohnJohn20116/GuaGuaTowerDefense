import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { visibleLoadingTip } from '@/data/loadingTips';

describe('showTips setting on the loading screen', () => {
  it('hides loading tips when the gameplay setting is off', () => {
    expect(visibleLoadingTip(['先造經濟塔'], 0, true)).toBe('先造經濟塔');
    expect(visibleLoadingTip(['先造經濟塔'], 0, false)).toBe('');
    expect(visibleLoadingTip([], 0, true)).toBe('');
  });

  it('reads gameplay.showTips on the loading screen', () => {
    const src = readFileSync(resolve(__dirname, '../components/ui/Loading.tsx'), 'utf8');
    expect(src).toMatch(/visibleLoadingTip/);
    expect(src).toMatch(/gameplay\.showTips/);
  });
});
