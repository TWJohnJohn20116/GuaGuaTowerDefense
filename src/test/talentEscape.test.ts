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
});
