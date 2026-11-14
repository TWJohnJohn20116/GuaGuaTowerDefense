import { beforeEach, describe, expect, it, vi } from 'vitest';

const addMoney = vi.fn();
const setGameSpeed = vi.fn();

vi.mock('@/store/gameStore', () => ({
  useGameStore: {
    getState: () => ({ addMoney, setGameSpeed }),
  },
}));

import {
  markTutorialPartCompleted,
  markTutorialSkipped,
  resetTutorialDismissState,
  shouldStartCampaignTutorial,
} from '@/store/tutorialDismiss';
import { INTERACTIVE_TUTORIAL_STEPS, useTutorialStore } from '@/store/tutorialStore';

describe('campaign interactive tutorial skip', () => {
  beforeEach(() => {
    resetTutorialDismissState();
    addMoney.mockClear();
    setGameSpeed.mockClear();
    useTutorialStore.setState({ isActive: false, currentStepIndex: 0 });
  });

  it('starts teaching maps until the player skips or finishes that part', () => {
    expect(shouldStartCampaignTutorial('ch1_tutorial')).toBe(true);
    expect(shouldStartCampaignTutorial('ch1_lv1')).toBe(true);
    expect(shouldStartCampaignTutorial('ch1_lv2')).toBe(true);
    expect(shouldStartCampaignTutorial('ch1_lv3')).toBe(false);
  });

  it('does not restart any teaching map after skip', () => {
    markTutorialSkipped();
    expect(shouldStartCampaignTutorial('ch1_tutorial')).toBe(false);
    expect(shouldStartCampaignTutorial('ch1_lv1')).toBe(false);
    expect(shouldStartCampaignTutorial('ch1_lv2')).toBe(false);
  });

  it('keeps later parts after finishing part 1', () => {
    markTutorialPartCompleted('part1');
    expect(shouldStartCampaignTutorial('ch1_tutorial')).toBe(false);
    expect(shouldStartCampaignTutorial('ch1_lv1')).toBe(true);
  });

  it('ends the overlay without the completion gold', async () => {
    useTutorialStore.getState().startTutorial('part1');
    expect(useTutorialStore.getState().isActive).toBe(true);

    useTutorialStore.getState().skipTutorial();
    await Promise.resolve();
    await Promise.resolve();

    expect(useTutorialStore.getState().isActive).toBe(false);
    expect(shouldStartCampaignTutorial('ch1_tutorial')).toBe(false);
    expect(addMoney).not.toHaveBeenCalled();
  });

  it('marks part 1 complete when the finish step is confirmed', () => {
    const index = INTERACTIVE_TUTORIAL_STEPS.findIndex((step) => step.id === 'finish_part1');
    useTutorialStore.setState({ isActive: true, currentStepIndex: index });
    useTutorialStore.getState().nextStep();
    expect(shouldStartCampaignTutorial('ch1_tutorial')).toBe(false);
    expect(shouldStartCampaignTutorial('ch1_lv1')).toBe(true);
  });

  it('does not auto-start a skipped teaching map', () => {
    markTutorialSkipped();
    useTutorialStore.getState().startCampaignTutorialIfNeeded('ch1_tutorial');
    expect(useTutorialStore.getState().isActive).toBe(false);
  });
});
