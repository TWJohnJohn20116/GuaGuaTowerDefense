/**
 * 電磁脈衝與剩餘合體配方要有對應的突變挑戰與每日模板
 */

import { describe, it, expect } from 'vitest';
import { MUTATOR_CHALLENGES } from '@/data/mutatorChallengeData';
import { DAILY_CHALLENGE_TEMPLATES } from '@/data/dailyChallengeData';
import { PATHS } from '@/data/gameData';

const NEW_MUTATOR_IDS = ['mc_emp_bulwark', 'mc_tempest_lane'] as const;
const NEW_DAILY_IDS = ['dc_storm_pair', 'dc_tempest_pair', 'dc_demo_pair'] as const;

describe('emp and fusion content pack', () => {
  it('adds shield-wall and tempest mutators on real maps', () => {
    const ids = MUTATOR_CHALLENGES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);

    const bulwark = MUTATOR_CHALLENGES.find((c) => c.id === 'mc_emp_bulwark');
    expect(bulwark).toBeDefined();
    expect(PATHS[bulwark!.mapId]).toBeDefined();
    expect(bulwark!.rules.enemyAffix?.shieldAdd ?? 0).toBeGreaterThanOrEqual(100);

    const tempest = MUTATOR_CHALLENGES.find((c) => c.id === 'mc_tempest_lane');
    expect(tempest).toBeDefined();
    expect(tempest!.mapId).toBe('switchback');
    expect(PATHS[tempest!.mapId]).toBeDefined();
    const banned = tempest!.rules.bannedTowerTypes ?? [];
    expect(banned).not.toContain('wind');
    expect(banned).not.toContain('pulse');

    for (const id of NEW_MUTATOR_IDS) {
      expect(MUTATOR_CHALLENGES.find((c) => c.id === id)?.tags.length).toBeGreaterThan(0);
    }
  });

  it('adds the three remaining fusion-pair daily templates', () => {
    const ids = DAILY_CHALLENGE_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of NEW_DAILY_IDS) {
      const template = DAILY_CHALLENGE_TEMPLATES.find((t) => t.id === id);
      expect(template, id).toBeDefined();
      expect(template!.conditions.length).toBeGreaterThanOrEqual(2);
      expect(template!.conditions.some((c) => c.type === 'win_game')).toBe(true);
    }
  });
});
