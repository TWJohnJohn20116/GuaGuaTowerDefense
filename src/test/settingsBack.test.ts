import { describe, expect, it } from 'vitest';
import { isSettingsTypingTarget, resolveSettingsEscape } from '@/data/settingsBack';

describe('settings back from pause', () => {
  it('Escape goes back like the header, and ignores typing or key capture', () => {
    expect(resolveSettingsEscape({ key: 'Escape', inTextField: false, capturingBind: false })).toBe('go_back');
    expect(resolveSettingsEscape({ key: 'Escape', inTextField: true, capturingBind: false })).toBe('ignore');
    expect(resolveSettingsEscape({ key: 'Escape', inTextField: false, capturingBind: true })).toBe('ignore');
    expect(resolveSettingsEscape({ key: 'Enter', inTextField: false, capturingBind: false })).toBe('ignore');
    expect(isSettingsTypingTarget(document.createElement('input'))).toBe(true);
    expect(isSettingsTypingTarget(document.createElement('div'))).toBe(false);
  });
});
