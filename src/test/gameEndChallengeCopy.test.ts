import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { zhTW } from '@/i18n/locales/zh-TW';

describe('game end challenge panel copy', () => {
  it('already has Traditional Chinese keys for the settlement challenge block', () => {
    expect(zhTW.gameEnd?.dailyChallenge).toBe('每日挑戰');
    expect(zhTW.gameEnd?.claimDailyReward).toBe('領取每日獎勵');
    expect(zhTW.gameEnd?.mutatorTrial).toBe('突變試煉');
    expect(zhTW.gameEnd?.claimMutatorReward).toBe('領取試煉獎勵');
  });

  it('uses those keys instead of hardcoded labels', () => {
    const src = readFileSync(
      resolve(__dirname, '../components/scenes/game-end/GameEndChallengePanel.tsx'),
      'utf8',
    );
    expect(src).toMatch(/const g = t\.gameEnd/);
    expect(src).toMatch(/g\.dailyChallenge/);
    expect(src).toMatch(/g\.claimDailyReward/);
    expect(src).toMatch(/g\.mutatorTrial/);
    expect(src).toMatch(/g\.claimMutatorReward/);
    expect(src).not.toMatch(/領取每日獎勵/);
    expect(src).not.toMatch(/領取試煉獎勵/);
    expect(src).not.toMatch(/查看試煉/);
  });
});
