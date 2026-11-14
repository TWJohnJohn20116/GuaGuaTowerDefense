import { describe, expect, it } from 'vitest';
import {
  isDailyChallengeTypingTarget,
  nextDailyChallengeTab,
  resolveDailyChallengeHotkey,
} from '@/data/dailyChallengeKeyboardNav';
import { zhTW } from '@/i18n/locales/zh-TW';

describe('daily challenge keyboard', () => {
  it('switches today and history tabs and wraps', () => {
    expect(nextDailyChallengeTab('today', 1)).toBe('history');
    expect(nextDailyChallengeTab('history', 1)).toBe('today');
    expect(nextDailyChallengeTab('today', -1)).toBe('history');
  });

  it('Enter starts an unfinished challenge and claims a finished unclaimed one', () => {
    expect(resolveDailyChallengeHotkey({
      key: 'Enter', inTextField: false, tab: 'today', hasChallenge: true, completed: false, claimed: false,
    })).toBe('start');
    expect(resolveDailyChallengeHotkey({
      key: 'Enter', inTextField: false, tab: 'today', hasChallenge: true, completed: true, claimed: false,
    })).toBe('claim');
    expect(resolveDailyChallengeHotkey({
      key: 'Enter', inTextField: false, tab: 'today', hasChallenge: true, completed: true, claimed: true,
    })).toBe('ignore');
    expect(resolveDailyChallengeHotkey({
      key: 'Enter', inTextField: false, tab: 'history', hasChallenge: true, completed: false, claimed: false,
    })).toBe('ignore');
  });

  it('treats arrows as tab switch and ignores typing', () => {
    expect(resolveDailyChallengeHotkey({
      key: 'ArrowLeft', inTextField: false, tab: 'today', hasChallenge: true, completed: false, claimed: false,
    })).toBe('prev');
    expect(resolveDailyChallengeHotkey({
      key: 'ArrowRight', inTextField: false, tab: 'today', hasChallenge: true, completed: false, claimed: false,
    })).toBe('next');
    expect(resolveDailyChallengeHotkey({
      key: 'Enter', inTextField: true, tab: 'today', hasChallenge: true, completed: false, claimed: false,
    })).toBe('ignore');
    expect(isDailyChallengeTypingTarget(document.createElement('input'))).toBe(true);
  });

  it('ignores keys it does not own instead of swallowing them', () => {
    // 未定義的按鍵必須回 ignore，否則會吃掉其他快捷鍵（速度、暫停、返回）
    for (const key of ['Escape', ' ', 'p', 'Digit1', 'Tab']) {
      expect(
        resolveDailyChallengeHotkey({
          key, inTextField: false, tab: 'today', hasChallenge: true, completed: false, claimed: false,
        }),
      ).toBe('ignore');
    }
  });

  it('已有每日挑戰的文案鍵（分頁提示與領取）', () => {
    expect(zhTW.dailyChallenge.todayHint.length).toBeGreaterThan(0);
    expect(zhTW.dailyChallenge.historyHint.length).toBeGreaterThan(0);
  });
});
