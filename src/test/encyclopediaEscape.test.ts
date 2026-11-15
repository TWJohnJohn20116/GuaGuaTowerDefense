import { describe, expect, it } from 'vitest';
import {
  isEncyclopediaTypingTarget,
  resolveEncyclopediaEscape,
} from '@/data/encyclopediaEscape';

describe('encyclopedia Escape layers', () => {
  it('closes the detail first, then goes back like the header button', () => {
    expect(
      resolveEncyclopediaEscape({
        key: 'Escape',
        inTextField: false,
        hasDetail: true,
      }),
    ).toBe('close_detail');
    expect(
      resolveEncyclopediaEscape({
        key: 'Escape',
        inTextField: false,
        hasDetail: false,
      }),
    ).toBe('go_back');
  });

  it('ignores other keys and typing in the search field', () => {
    expect(
      resolveEncyclopediaEscape({
        key: 'Enter',
        inTextField: false,
        hasDetail: false,
      }),
    ).toBe('ignore');
    expect(
      resolveEncyclopediaEscape({
        key: 'Escape',
        inTextField: true,
        hasDetail: false,
      }),
    ).toBe('ignore');
    expect(isEncyclopediaTypingTarget(document.createElement('input'))).toBe(true);
    expect(isEncyclopediaTypingTarget(document.createElement('div'))).toBe(false);
  });
});
