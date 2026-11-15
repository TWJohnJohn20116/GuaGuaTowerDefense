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
});
