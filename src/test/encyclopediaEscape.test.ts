import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
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

  it('wires the helper and goBackScene into Encyclopedia', () => {
    const src = readFileSync(
      resolve(__dirname, '../components/scenes/Encyclopedia.tsx'),
      'utf8',
    );
    expect(src).toMatch(/resolveEncyclopediaEscape/);
    expect(src).toMatch(/goBackScene/);
    expect(src).not.toMatch(/if \(e\.key === 'Escape' && selectedItem\)/);
  });
});
