import { describe, it, expect } from 'vitest';
import { computeFusionCost } from '@/data/fusionRecipes';

describe('fusion cost', () => {
  it('charges a quarter of both source towers, not only the selected one', () => {
    expect(computeFusionCost(180, 220, 1)).toBe(100);
    expect(computeFusionCost(180, 220, 1)).not.toBe(Math.round(180 * 0.25));
    expect(computeFusionCost(150, 200, 1.2)).toBe(Math.round((150 + 200) * 0.25 * 1.2));
  });
});
