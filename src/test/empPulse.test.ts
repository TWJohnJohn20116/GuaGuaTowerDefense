/**
 * 第十個主動技能：電磁脈衝必須可購買，並能擊破護盾
 */

import { describe, it, expect } from 'vitest';
import { PLAYER_SKILLS, PLAYER_SKILL_BY_ID, EMP_PULSE_DAMAGE } from '@/data/playerSkillData';
import { PLAYER_SKILL_SHOP_PRICES } from '@/store/shopStore';
import { applyEmpPulse } from '@/utils/empPulse';

describe('empPulse skill', () => {
  it('registers as the tenth player skill with hotkey 0', () => {
    expect(PLAYER_SKILLS).toHaveLength(10);
    const skill = PLAYER_SKILL_BY_ID.empPulse;
    expect(skill).toBeDefined();
    expect(skill.id).toBe('empPulse');
    expect(skill.hotkey).toBe('0');
    expect(skill.effectKey).toBe('emp');
    expect(PLAYER_SKILL_SHOP_PRICES.empPulse).toBeGreaterThan(0);
  });

  it('strips shields then deals pulse damage to health', () => {
    const result = applyEmpPulse(
      [
        { health: 100, shield: 80 },
        { health: 50, shield: 0 },
        { health: 0, shield: 40 },
      ],
      EMP_PULSE_DAMAGE,
    );
    expect(result.stripped).toBe(1);
    expect(result.enemies[0]).toEqual({ health: 100 - EMP_PULSE_DAMAGE, shield: 0 });
    expect(result.enemies[1]).toEqual({ health: 50 - EMP_PULSE_DAMAGE, shield: 0 });
    expect(result.enemies[2]).toEqual({ health: 0, shield: 40 });
  });
});
