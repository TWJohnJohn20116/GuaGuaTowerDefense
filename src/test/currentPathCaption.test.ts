import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { formatCurrentPathCaption } from '@/data/upgradePathLabel';
import { zhTW } from '@/i18n/locales/zh-TW';

describe('current upgrade path caption', () => {
  it('returns null until a path is chosen', () => {
    expect(formatCurrentPathCaption(null, '當前路線', '路線 {path}', '速射')).toBeNull();
    expect(formatCurrentPathCaption(undefined, '當前路線', '路線 {path}')).toBeNull();
  });

  it('shows the translated current-path label with route tag and branch name', () => {
    expect(formatCurrentPathCaption('A', '當前路線', '路線 {path}', '速射')).toBe(
      '當前路線 · 路線 A · 速射',
    );
    expect(formatCurrentPathCaption('B', '當前路線', '路線 {path}')).toBe('當前路線 · 路線 B');
    expect(zhTW.towers?.currentPath).toBe('當前路線');
  });

  it('renders the caption on the selected-tower panel after a path is chosen', () => {
    const src = readFileSync(
      resolve(__dirname, '../components/game/FloatingTowerPanel.tsx'),
      'utf8',
    );
    expect(src).toMatch(/formatCurrentPathCaption/);
    expect(src).toMatch(/t\.towers\.currentPath/);
  });
});
