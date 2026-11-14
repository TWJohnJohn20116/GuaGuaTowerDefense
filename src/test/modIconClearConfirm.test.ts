import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  getModIconClearCopy,
  resolveModIconClearHotkey,
} from '@/data/modIconEditorDialogs';
import { zhTW } from '@/i18n/locales/zh-TW';

describe('mod icon editor clear canvas confirm', () => {
  it('maps Enter to confirm and Escape to cancel', () => {
    expect(resolveModIconClearHotkey('Enter')).toBe('confirm');
    expect(resolveModIconClearHotkey('Escape')).toBe('cancel');
    expect(resolveModIconClearHotkey('Space')).toBe('ignore');
  });

  it('reuses the existing clear-canvas title and confirm question', () => {
    const copy = getModIconClearCopy(zhTW.modEditorExt);
    expect(copy.title).toBe(zhTW.modEditorExt.clearCanvas);
    expect(copy.description).toBe(zhTW.modEditorExt.confirmClearCanvas);
    expect(copy.confirm).toBe(zhTW.modEditorExt.clearCanvas);
  });

  it('replaces window.confirm with the in-app dialog', () => {
    const editor = readFileSync(
      resolve(__dirname, '../components/mod-editor/ModIconEditor.tsx'),
      'utf8',
    );
    expect(editor).toMatch(/ModIconClearConfirmDialog/);
    expect(editor).not.toMatch(/window\.confirm/);
  });
});
