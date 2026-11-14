import { describe, it, expect } from 'vitest';
import { applySkillCooldownReduction } from '@/data/skillData';

describe('tactical repair cooldown reduction', () => {
  it('halves remaining cooldown instead of the unix timestamp', () => {
    const now = 1_700_000_000_000;
    const cooldown = 30_000;
    const lastUsed = now - 10_000;
    const next = applySkillCooldownReduction(lastUsed, now, cooldown, 0.5);
    expect(cooldown - (now - next)).toBe(10_000);
    expect(next).toBeGreaterThan(lastUsed - 20_000);
  });

  it('leaves ready or unused skills unchanged', () => {
    const now = 1_700_000_000_000;
    expect(applySkillCooldownReduction(0, now, 15_000, 0.5)).toBe(0);
    expect(applySkillCooldownReduction(now - 20_000, now, 15_000, 0.5)).toBe(now - 20_000);
  });
});
