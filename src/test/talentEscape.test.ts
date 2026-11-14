import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { isTalentTypingTarget, resolveTalentEscape } from '@/data/talentEscape';

describe('talent tree Escape layers', () => {
  it('closes the selected node first, then goes back like the header button', () => {
    expect(
      resolveTalentEscape({
        key: 'Escape',
        inTextField: false,
        hasResetModal: false,
        hasDetail: true,
      }),
    ).toBe('close_detail');
    expect(
      resolveTalentEscape({
        key: 'Escape',
        inTextField: false,
        hasResetModal: false,
        hasDetail: false,
      }),
    ).toBe('go_back');
  });

  it('leaves the reset modal alone and ignores typing', () => {
    expect(
      resolveTalentEscape({
        key: 'Escape',
        inTextField: false,
        hasResetModal: true,
        hasDetail: false,
      }),
    ).toBe('ignore');
    expect(
      resolveTalentEscape({
        key: 'Escape',
        inTextField: true,
        hasDetail: false,
        hasResetModal: false,
      }),
    ).toBe('ignore');
    expect(isTalentTypingTarget(document.createElement('input'))).toBe(true);
  });

  it('wires the helper and main-menu back into TalentTree', () => {
    const src = readFileSync(
      resolve(__dirname, '../components/scenes/TalentTree.tsx'),
      'utf8',
    );
    expect(src).toMatch(/resolveTalentEscape/);
    expect(src).toMatch(/setScene\('mainMenu'\)/);
    expect(src).not.toMatch(/if \(e\.key === 'Escape'\) \{\s*if \(showResetModal\) return;/);
  });
});
