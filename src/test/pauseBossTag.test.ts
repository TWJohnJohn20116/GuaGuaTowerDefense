import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { zhTW } from '@/i18n/locales/zh-TW';

describe('pause and HUD boss tags', () => {
  it('uses Traditional Chinese for boss tags instead of English BOSS', () => {
    expect(zhTW.game.waveTagBoss).toBe('首領');
    expect(zhTW.game.waveTagBoss).not.toMatch(/BOSS/i);
    expect(zhTW.game.bossIncoming).toBe('首領來襲');
    expect(zhTW.game.bossIncoming).not.toMatch(/BOSS/i);
    expect(zhTW.game.bossSpawned).toBe('首領已出現');
    expect(zhTW.game.bossSpawned).not.toMatch(/BOSS/i);
  });

  it('reads the boss tag from translation on the pause next-wave preview', () => {
    const src = readFileSync(
      resolve(__dirname, '../components/ui/pause/PausePreviewSection.tsx'),
      'utf8',
    );
    expect(src).toMatch(/t\.game\.waveTagBoss|g\.waveTagBoss/);
    expect(src).not.toMatch(/label=["']BOSS["']/);
  });
});
