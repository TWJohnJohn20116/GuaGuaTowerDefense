export type TutorialPart = 'part1' | 'part2' | 'part3';

export interface TutorialDismissState {
  skipped: boolean;
  completedParts: TutorialPart[];
}

export const TUTORIAL_DISMISS_STORAGE_KEY = 'guatd-interactive-tutorial-dismiss';

const memoryFallback = new Map<string, string>();

export function emptyTutorialDismissState(): TutorialDismissState {
  return { skipped: false, completedParts: [] };
}

function tryLocalStorage(): Storage | null {
  try {
    if (typeof localStorage === 'undefined' || localStorage == null) return null;
    return localStorage;
  } catch {
    return null;
  }
}

function readStorageRaw(): string | null {
  const ls = tryLocalStorage();
  if (ls) return ls.getItem(TUTORIAL_DISMISS_STORAGE_KEY);
  return memoryFallback.get(TUTORIAL_DISMISS_STORAGE_KEY) ?? null;
}

function writeStorageRaw(value: string): void {
  const ls = tryLocalStorage();
  if (ls) {
    ls.setItem(TUTORIAL_DISMISS_STORAGE_KEY, value);
    return;
  }
  memoryFallback.set(TUTORIAL_DISMISS_STORAGE_KEY, value);
}

function clearStorageRaw(): void {
  const ls = tryLocalStorage();
  if (ls) ls.removeItem(TUTORIAL_DISMISS_STORAGE_KEY);
  memoryFallback.delete(TUTORIAL_DISMISS_STORAGE_KEY);
}

function isTutorialPart(value: unknown): value is TutorialPart {
  return value === 'part1' || value === 'part2' || value === 'part3';
}

export function loadTutorialDismissState(): TutorialDismissState {
  try {
    const raw = readStorageRaw();
    if (!raw) return emptyTutorialDismissState();
    const parsed = JSON.parse(raw) as Partial<TutorialDismissState>;
    const completedParts = Array.isArray(parsed.completedParts)
      ? parsed.completedParts.filter(isTutorialPart)
      : [];
    return {
      skipped: parsed.skipped === true,
      completedParts,
    };
  } catch {
    return emptyTutorialDismissState();
  }
}

export function saveTutorialDismissState(state: TutorialDismissState): void {
  writeStorageRaw(JSON.stringify(state));
}

export function resetTutorialDismissState(): void {
  clearStorageRaw();
}

export function markTutorialSkipped(): TutorialDismissState {
  const current = loadTutorialDismissState();
  const next: TutorialDismissState = { ...current, skipped: true };
  saveTutorialDismissState(next);
  return next;
}

export function markTutorialPartCompleted(part: TutorialPart): TutorialDismissState {
  const current = loadTutorialDismissState();
  const completedParts = current.completedParts.includes(part)
    ? current.completedParts
    : [...current.completedParts, part];
  const next: TutorialDismissState = { ...current, completedParts };
  saveTutorialDismissState(next);
  return next;
}

export function campaignTutorialPartForLevel(
  levelId: string | null | undefined,
): TutorialPart | null {
  if (levelId === 'ch1_tutorial') return 'part1';
  if (levelId === 'ch1_lv1') return 'part2';
  if (levelId === 'ch1_lv2') return 'part3';
  return null;
}

export function shouldStartCampaignTutorial(levelId: string | null | undefined): boolean {
  const part = campaignTutorialPartForLevel(levelId);
  if (!part) return false;
  const state = loadTutorialDismissState();
  if (state.skipped) return false;
  return !state.completedParts.includes(part);
}

export function tutorialPartFromFinishStepId(stepId: string | undefined): TutorialPart | null {
  if (stepId === 'finish_part1') return 'part1';
  if (stepId === 'finish_part2') return 'part2';
  if (stepId === 'finish_part3') return 'part3';
  return null;
}
