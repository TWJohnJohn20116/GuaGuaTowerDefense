import {
  HOME_ENTRY_SCENES,
  HOME_ENTRY_SPAN,
  HOME_GRID_CLASS,
  HOME_RAIL_CLASS,
  HOME_SPAN_CLASS,
  homeEntrySize,
} from '@/data/mainMenuHome';
import { describe, expect, it } from 'vitest';

describe('main menu Home layout', () => {
  it('keeps the 392px rail and a 12-column bento grid', () => {
    expect(HOME_RAIL_CLASS).toMatch(/lg:w-\[392px\]/);
    expect(HOME_GRID_CLASS).toMatch(/lg:grid-cols-12/);
    // 窄螢幕退回兩欄，避免 12 欄在手機寬度被壓成碎片
    expect(HOME_GRID_CLASS).toMatch(/grid-cols-2/);
  });

  it('keeps every previous destination', () => {
    expect(HOME_ENTRY_SCENES).toHaveLength(11);
    expect([...HOME_ENTRY_SCENES].sort()).toEqual(
      [
        'shop',
        'talentTree',
        'encyclopedia',
        'skins',
        'achievements',
        'statistics',
        'workshop',
        'replay',
        'tutorial',
        'changelog',
        'settings',
      ].sort(),
    );
  });

  it('fills exactly three 12-column rows so the wall never has a ragged tail', () => {
    const total = HOME_ENTRY_SCENES.reduce((sum, scene) => sum + HOME_ENTRY_SPAN[scene], 0);
    expect(total).toBe(36);
  });

  it('maps every entry to a static span class and a size tier', () => {
    for (const scene of HOME_ENTRY_SCENES) {
      const span = HOME_ENTRY_SPAN[scene];
      expect(HOME_SPAN_CLASS[span]).toBe(`lg:col-span-${span}`);
      expect(homeEntrySize(scene)).toBe(span >= 4 ? 'tile' : 'compact');
    }
  });
});
