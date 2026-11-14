import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { formatUpgradePathTag } from '@/data/upgradePathLabel';

describe('upgrade path picker labels', () => {
  it('fills the path letter into the translated tag', () => {
    expect(formatUpgradePathTag('A', '路線 {path}')).toBe('路線 A');
    expect(formatUpgradePathTag('B', '路線 {path}')).toBe('路線 B');
  });

  it('does not paint Path A/B or emoji text in the tower panel picker', () => {
    const src = readFileSync(resolve(__dirname, '../components/game/FloatingTowerPanel.tsx'), 'utf8');
    expect(src).not.toMatch(/>Path \{pathKey\}</);
    expect(src).toMatch(/formatUpgradePathTag/);
    expect(src).not.toMatch(/>\{branch\.icon\}</);
    expect(src).toMatch(/<ThemeIcon icon=\{branch\.icon\}/);
  });
});
