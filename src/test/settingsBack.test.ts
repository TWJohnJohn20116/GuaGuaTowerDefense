import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
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

  it('pops scene history instead of always dumping to the main menu', () => {
    const src = readFileSync(
      resolve(__dirname, '../components/scenes/Settings.tsx'),
      'utf8',
    );
    expect(src).toMatch(/goBackScene/);
    expect(src).toMatch(/resolveSettingsEscape/);
    expect(src).not.toMatch(/backTo="mainMenu"/);
  });
});
