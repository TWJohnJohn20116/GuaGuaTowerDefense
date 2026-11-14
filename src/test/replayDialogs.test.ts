import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  getReplayConfirmCopy,
  resolveReplayDialogHotkey,
  resolveReplayRenameDraft,
} from '@/data/replayDialogs';
import { zhTW } from '@/i18n/locales/zh-TW';

describe('replay in-game confirm and rename dialogs', () => {
  it('maps Enter to confirm and Escape to cancel', () => {
    expect(resolveReplayDialogHotkey('Enter')).toBe('confirm');
    expect(resolveReplayDialogHotkey('Escape')).toBe('cancel');
    expect(resolveReplayDialogHotkey(' ')).toBe('ignore');
  });

  it('applies a trimmed new name and ignores empty or unchanged drafts', () => {
    expect(resolveReplayRenameDraft({ draft: '  新名稱  ', original: '舊名稱' })).toBe('apply');
    expect(resolveReplayRenameDraft({ draft: '   ', original: '舊名稱' })).toBe('ignore');
    expect(resolveReplayRenameDraft({ draft: '舊名稱', original: '舊名稱' })).toBe('ignore');
  });

  it('reuses existing Traditional Chinese confirm copy', () => {
    const r = zhTW.replay;
    expect(getReplayConfirmCopy('delete', r).description).toBe(r.confirmDelete);
    expect(getReplayConfirmCopy('clearAll', r).description).toBe(r.confirmClearAll);
    expect(getReplayConfirmCopy('replayThis', r).description).toBe(r.confirmReplayThis);
    expect(getReplayConfirmCopy('deleteNote', r).description).toBe(r.confirmDeleteNote);
    expect(r.enterNewName).toMatch(/名稱/);
  });

  it('drops browser confirm/prompt from browse, playback and notes', () => {
    const browse = readFileSync(resolve(__dirname, '../components/scenes/Replay.tsx'), 'utf8');
    const detail = readFileSync(
      resolve(__dirname, '../components/scenes/replay/ReplayDetail.tsx'),
      'utf8',
    );
    const notes = readFileSync(
      resolve(__dirname, '../components/scenes/replay/ReplayNotesPanel.tsx'),
      'utf8',
    );
    expect(browse).toMatch(/ReplayConfirmDialog/);
    expect(browse).toMatch(/ReplayRenameDialog/);
    expect(browse).not.toMatch(/\bconfirm\(/);
    expect(browse).not.toMatch(/\bprompt\(/);
    expect(detail).not.toMatch(/\bconfirm\(/);
    expect(notes).toMatch(/ReplayConfirmDialog/);
    expect(notes).not.toMatch(/\bconfirm\(/);
  });
});
