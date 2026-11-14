/**
 * 戰役通關獎勵：金幣／天賦點走現有結算，解鎖塔必須是可購買的真實塔型
 */

import { describe, it, expect } from 'vitest';
import { CAMPAIGN_CHAPTERS } from '@/data/campaignData';
import {
  PURCHASABLE_TOWER_TYPES,
  sanitizeUnlockTowers,
  talentPointsFromStars,
  resolveCampaignVictoryGrant,
} from '@/utils/campaignRewards';

describe('sanitizeUnlockTowers', () => {
  it('keeps purchasable towers and drops unknown, fusion, and basic', () => {
    expect(
      sanitizeUnlockTowers(['sniper', 'magic', 'basic', 'storm', 'machine', 'sniper']),
    ).toEqual(['sniper', 'machine']);
  });

  it('returns empty array for missing or empty input', () => {
    expect(sanitizeUnlockTowers(undefined)).toEqual([]);
    expect(sanitizeUnlockTowers([])).toEqual([]);
  });
});

describe('talentPointsFromStars', () => {
  it('grants 2 points at 3 stars and 1 otherwise', () => {
    expect(talentPointsFromStars(3)).toBe(2);
    expect(talentPointsFromStars(2)).toBe(1);
    expect(talentPointsFromStars(1)).toBe(1);
    expect(talentPointsFromStars(0)).toBe(1);
  });
});

describe('resolveCampaignVictoryGrant', () => {
  it('uses formula coins and star talent, not the inflated level.rewards numbers', () => {
    const grant = resolveCampaignVictoryGrant({
      formulaCoins: 180,
      stars: 3,
      unlockTower: ['sniper', 'magic'],
    });
    expect(grant.coins).toBe(180);
    expect(grant.talentPoints).toBe(2);
    expect(grant.unlockedTowers).toEqual(['sniper']);
  });
});

describe('campaign unlockTower data', () => {
  it('only lists purchasable tower types', () => {
    const allowed = new Set<string>(PURCHASABLE_TOWER_TYPES);
    const invalid: string[] = [];
    for (const chapter of CAMPAIGN_CHAPTERS) {
      for (const level of chapter.levels) {
        for (const id of level.rewards.unlockTower ?? []) {
          if (!allowed.has(id)) {
            invalid.push(`${level.id}:${id}`);
          }
        }
      }
    }
    expect(invalid).toEqual([]);
  });
});
