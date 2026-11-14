import { describe, expect, it } from 'vitest';
import {
  nextMutatorSelection,
  resolveMutatorHotkey,
} from '@/data/mutatorKeyboardNav';
import { zhTW } from '@/i18n/locales/zh-TW';

const ids = ['mc_a', 'mc_b', 'mc_c'];

describe('mutator challenge keyboard navigation', () => {
  it('moves to the next and previous challenge and wraps', () => {
    expect(nextMutatorSelection(ids, 'mc_a', 1)).toBe('mc_b');
    expect(nextMutatorSelection(ids, 'mc_c', 1)).toBe('mc_a');
    expect(nextMutatorSelection(ids, 'mc_a', -1)).toBe('mc_c');
  });

  it('falls back to the first challenge when nothing is selected', () => {
    expect(nextMutatorSelection(ids, null, 1)).toBe('mc_a');
    expect(nextMutatorSelection([], 'mc_a', 1)).toBeNull();
  });

  it('treats arrows as browse and Enter as start, and ignores typing', () => {
    expect(resolveMutatorHotkey({ key: 'ArrowLeft', inTextField: false })).toBe('prev');
    expect(resolveMutatorHotkey({ key: 'ArrowRight', inTextField: false })).toBe('next');
    expect(resolveMutatorHotkey({ key: 'Enter', inTextField: false })).toBe('start');
    expect(resolveMutatorHotkey({ key: 'Enter', inTextField: true })).toBe('ignore');
    expect(resolveMutatorHotkey({ key: 'Escape', inTextField: false })).toBe('ignore');
  });

  it('keeps the toolbar copy that the hotkeys are described with', () => {
    expect(zhTW.mutatorChallenge.toolbar.switchChallenge).toMatch(/切換/);
    expect(zhTW.mutatorChallenge.toolbar.startChallenge).toMatch(/開始/);
  });
});
