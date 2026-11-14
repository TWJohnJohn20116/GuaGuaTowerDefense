import { describe, expect, it } from 'vitest';
import {
  DEV_TAB_SEARCH_ENTRIES,
  pickDevTabForQuery,
  sectionMatches,
  tabHasMatch,
} from '@/data/devSearch';

describe('dev panel search', () => {
  it('matches unlock keywords on the tools tab', () => {
    expect(sectionMatches('持久化資料', ['unlock', '解鎖', '塔'], '解鎖')).toBe(true);
    expect(tabHasMatch('tools', '解鎖', DEV_TAB_SEARCH_ENTRIES)).toBe(true);
    expect(tabHasMatch('state', '解鎖', DEV_TAB_SEARCH_ENTRIES)).toBe(false);
  });

  it('stays on the current tab when that tab already has a hit', () => {
    expect(pickDevTabForQuery('金錢', 'state', DEV_TAB_SEARCH_ENTRIES)).toBe('state');
  });

  it('jumps to the first tab that actually has a hit', () => {
    expect(pickDevTabForQuery('解鎖', 'state', DEV_TAB_SEARCH_ENTRIES)).toBe('tools');
    expect(pickDevTabForQuery('生成', 'state', DEV_TAB_SEARCH_ENTRIES)).toBe('combat');
  });

  it('keeps the current tab when nothing matches', () => {
    expect(pickDevTabForQuery('zzzz-no-such-block', 'visual', DEV_TAB_SEARCH_ENTRIES)).toBe('visual');
  });

  it('does not crash when a section title is missing', () => {
    expect(() => sectionMatches(undefined as unknown as string, ['unlock', '解鎖'], '解鎖')).not.toThrow();
    expect(sectionMatches(undefined as unknown as string, ['unlock', '解鎖'], '解鎖')).toBe(true);
    expect(sectionMatches(undefined as unknown as string, ['preset'], '解鎖')).toBe(false);
  });
});
