import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  resolveReplayExportFeedback,
  resolveReplayImportError,
  resolveReplayImportFeedback,
} from '@/data/replayFeedback';

describe('replay import/export feedback', () => {
  it('maps import and export results without using browser alerts', () => {
    expect(resolveReplayImportFeedback('abc')).toEqual({
      tone: 'success',
      messageKey: 'importSuccess',
    });
    expect(resolveReplayImportFeedback(null)).toEqual({
      tone: 'danger',
      messageKey: 'invalidFormat',
    });
    expect(resolveReplayImportError()).toEqual({
      tone: 'danger',
      messageKey: 'importFailed',
    });
    expect(resolveReplayExportFeedback(true)).toEqual({
      tone: 'success',
      messageKey: 'exportSuccess',
    });
    expect(resolveReplayExportFeedback(false)).toEqual({
      tone: 'danger',
      messageKey: 'exportFailed',
    });
  });

  it('wires the in-game notice toast into both replay screens', () => {
    const browse = readFileSync(resolve(__dirname, '../components/scenes/Replay.tsx'), 'utf8');
    const detail = readFileSync(
      resolve(__dirname, '../components/scenes/replay/ReplayDetail.tsx'),
      'utf8',
    );
    expect(browse).toMatch(/resolveReplayImportFeedback/);
    expect(browse).toMatch(/SceneNoticeToast/);
    expect(browse).not.toMatch(/\balert\(/);
    expect(detail).toMatch(/resolveReplayExportFeedback/);
    expect(detail).toMatch(/SceneNoticeToast/);
    expect(detail).not.toMatch(/\balert\(/);
  });
});
