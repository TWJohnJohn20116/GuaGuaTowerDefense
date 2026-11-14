export type ReplayFeedbackTone = 'success' | 'danger';

export type ReplayFeedbackMessageKey =
  | 'importSuccess'
  | 'invalidFormat'
  | 'importFailed'
  | 'exportSuccess'
  | 'exportFailed';

export interface ReplayFeedback {
  tone: ReplayFeedbackTone;
  messageKey: ReplayFeedbackMessageKey;
}

export function resolveReplayImportFeedback(newId: string | null): ReplayFeedback {
  return newId
    ? { tone: 'success', messageKey: 'importSuccess' }
    : { tone: 'danger', messageKey: 'invalidFormat' };
}

export function resolveReplayImportError(): ReplayFeedback {
  return { tone: 'danger', messageKey: 'importFailed' };
}

export function resolveReplayExportFeedback(ok: boolean): ReplayFeedback {
  return ok
    ? { tone: 'success', messageKey: 'exportSuccess' }
    : { tone: 'danger', messageKey: 'exportFailed' };
}
