import { HOME_ENTRY_SCENES, HOME_GRID_CLASS, HOME_RAIL_CLASS } from '@/data/mainMenuHome';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('main menu Home layout', () => {
  it('composes a rail and equal grid instead of bento or particle chrome', () => {
    const src = readFileSync(
      resolve(__dirname, '../components/scenes/MainMenu.tsx'),
      'utf8',
    );
    expect(src).toMatch(/MenuHomeRail/);
    expect(src).toMatch(/MenuHomeGrid/);
    expect(src).not.toMatch(/MenuBento/);
    expect(src).not.toMatch(/MenuStartHub/);
    expect(src).not.toMatch(/particleCount/);
  });

  it('keeps a 320px rail, 3-column cards, and every previous destination', () => {
    expect(HOME_RAIL_CLASS).toMatch(/w-\[320px\]/);
    expect(HOME_GRID_CLASS).toMatch(/grid-cols-3/);
    expect(HOME_ENTRY_SCENES).toEqual([
      'dailyChallenge',
      'mutatorChallenge',
      'shop',
      'talentTree',
      'encyclopedia',
      'skins',
      'achievements',
      'statistics',
      'workshop',
      'replay',
      'memorial',
      'tutorial',
      'changelog',
      'settings',
    ]);
  });
});
