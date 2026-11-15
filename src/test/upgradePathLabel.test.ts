import { describe, expect, it } from 'vitest';
import { formatUpgradePathTag } from '@/data/upgradePathLabel';

describe('upgrade path picker labels', () => {
  it('fills the path letter into the translated tag', () => {
    expect(formatUpgradePathTag('A', '路線 {path}')).toBe('路線 A');
    expect(formatUpgradePathTag('B', '路線 {path}')).toBe('路線 B');
  });
});
