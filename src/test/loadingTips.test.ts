import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { LOADING_TIP_CLASS, loadingTipAt, nextLoadingTipIndex } from '@/data/loadingTips';

describe('loading tips', () => {
  it('cycles through tips and stays safe when the list is empty', () => {
    expect(nextLoadingTipIndex(0, 3)).toBe(1);
    expect(nextLoadingTipIndex(2, 3)).toBe(0);
    expect(nextLoadingTipIndex(0, 0)).toBe(0);
    expect(loadingTipAt(['甲', '乙'], 2)).toBe('甲');
    expect(loadingTipAt(['甲', '乙'], 3)).toBe('乙');
    expect(loadingTipAt([], 0)).toBe('');
  });

  it('keeps loading tip text brighter than 40% white', () => {
    expect(LOADING_TIP_CLASS).toMatch(/text-white\/(7|8|9)\d/);
    expect(LOADING_TIP_CLASS).not.toMatch(/text-white\/40/);
  });

  it('uses the shared tip helpers in the loading screen', () => {
    const src = readFileSync(resolve(__dirname, '../components/ui/Loading.tsx'), 'utf8');
    expect(src).toMatch(/LOADING_TIP_CLASS/);
    expect(src).toMatch(/nextLoadingTipIndex/);
    expect(src).toMatch(/visibleLoadingTip/);
    expect(src).not.toMatch(/text-white\/40 z-10/);
  });
});
