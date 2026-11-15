import { describe, expect, it } from 'vitest';
import { resolveStatsClearHotkey } from '@/data/statsClearConfirm';
import { zhTW } from '@/i18n/locales/zh-TW';

describe('stats clear history confirm', () => {
  it('maps Enter to confirm and Escape to cancel', () => {
    expect(resolveStatsClearHotkey('Enter')).toBe('confirm');
    expect(resolveStatsClearHotkey('Escape')).toBe('cancel');
    expect(resolveStatsClearHotkey('Space')).toBe('ignore');
  });

  it('has Traditional Chinese copy for the in-game clear dialog', () => {
    expect(zhTW.statistics?.clearDialog?.title).toMatch(/清空/);
    expect(zhTW.statistics?.clearDialog?.description).toMatch(/無法復原|無法恢復/);
    expect(zhTW.statistics?.clearDialog?.confirm).toMatch(/清空/);
  });
});
