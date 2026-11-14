import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { resolveGameEndClaimView } from '@/data/gameEndClaimView';

describe('game end challenge claim view', () => {
  it('keeps the claim button until live store says claimed, then shows claimed', () => {
    expect(resolveGameEndClaimView({ snapshotClaimable: true, liveClaimed: false })).toBe('claim');
    expect(resolveGameEndClaimView({ snapshotClaimable: true, liveClaimed: true })).toBe('claimed');
  });

  it('still offers the browse link when the snapshot was never claimable', () => {
    expect(resolveGameEndClaimView({ snapshotClaimable: false, liveClaimed: false })).toBe('open');
    expect(resolveGameEndClaimView({ snapshotClaimable: false, liveClaimed: true })).toBe('open');
  });

  it('wires live claimed state into the game-end challenge panel', () => {
    const src = readFileSync(
      resolve(__dirname, '../components/scenes/game-end/GameEndChallengePanel.tsx'),
      'utf8',
    );
    expect(src).toMatch(/resolveGameEndClaimView/);
    expect(src).toMatch(/todayChallenge\?\.claimed/);
    expect(src).not.toMatch(/\{daily\.claimable \?/);
    expect(src).not.toMatch(/\{mutator\.claimable \?/);
  });
});
