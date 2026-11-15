import {
  HOME_ENTRY_GROUPS,
  HOME_FOCUS_ORDER,
  HOME_GROUP_COLS_CLASS,
  HOME_GROUP_SPAN_CLASS,
  HOME_QUICK_SCENES,
  HOME_SHELL_CLASS,
} from '@/data/mainMenuHome';
import { describe, expect, it } from 'vitest';

describe('main menu Home layout', () => {
  it('keeps one 12-column paste-up shell that collapses to a single column', () => {
    expect(HOME_SHELL_CLASS).toMatch(/lg:grid-cols-12/);
    expect(HOME_SHELL_CLASS).toMatch(/grid-cols-1/);
    // 窄螢幕必須單欄：390px 下 12 欄會把每塊磚壓成碎片
    expect(HOME_SHELL_CLASS).not.toMatch(/lg:grid-cols-12[^ ]*\s+grid-cols-2/);
  });

  it('keeps every previous destination exactly once', () => {
    const groupScenes = HOME_ENTRY_GROUPS.flatMap((group) => group.scenes);
    const all = [...HOME_QUICK_SCENES, ...groupScenes];
    expect(all).toHaveLength(11);
    expect([...all].sort()).toEqual(
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
    // 快捷磚與群組帶不得指向同一個場景：同一目的地放兩塊磚等於叫玩家猜差別
    expect(new Set(all).size).toBe(11);
  });

  it('splits the three groups across exactly one 12-column row', () => {
    const total = HOME_ENTRY_GROUPS.reduce((sum, group) => sum + group.span, 0);
    expect(total).toBe(12);
    expect(HOME_ENTRY_GROUPS.map((group) => group.id)).toEqual(['battle', 'collection', 'system']);
  });

  it('maps every group span to static class names', () => {
    for (const group of HOME_ENTRY_GROUPS) {
      expect(HOME_GROUP_SPAN_CLASS[group.span]).toBe('lg:col-span-' + group.span);
      expect(HOME_GROUP_COLS_CLASS[group.span]).toMatch(/grid-cols-2/);
    }
  });

  it('keeps the keyboard order covering start plus every destination once', () => {
    expect(HOME_FOCUS_ORDER[0]).toBe('start');
    expect(HOME_FOCUS_ORDER).toHaveLength(12);
    expect(new Set(HOME_FOCUS_ORDER).size).toBe(12);
  });
});