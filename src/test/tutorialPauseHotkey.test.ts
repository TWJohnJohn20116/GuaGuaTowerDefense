import { describe, expect, it } from 'vitest';
import { DEFAULT_KEY_BINDINGS } from '@/store/gameStoreUtils';
import { INTERACTIVE_TUTORIAL_STEPS } from '@/store/tutorialStore';
import { resolveTutorialHotkeyGate } from '@/data/tutorialPauseHotkey';

describe('campaign tutorial pause hotkey', () => {
  it('lets the pause binding through only on pause_game steps', () => {
    expect(resolveTutorialHotkeyGate({
      stepAction: 'pause_game',
      keyCode: DEFAULT_KEY_BINDINGS.pause,
      pauseKeyCode: DEFAULT_KEY_BINDINGS.pause,
    })).toBe('pause_and_advance');

    expect(resolveTutorialHotkeyGate({
      stepAction: 'pause_game',
      keyCode: DEFAULT_KEY_BINDINGS.cycleSpeed,
      pauseKeyCode: DEFAULT_KEY_BINDINGS.pause,
    })).toBe('block');

    expect(resolveTutorialHotkeyGate({
      stepAction: 'place_tower',
      keyCode: DEFAULT_KEY_BINDINGS.pause,
      pauseKeyCode: DEFAULT_KEY_BINDINGS.pause,
    })).toBe('block');
  });

  it('does not tell players to pause with Space', () => {
    const pauseSteps = INTERACTIVE_TUTORIAL_STEPS.filter((step) => step.action === 'pause_game');
    expect(pauseSteps.length).toBeGreaterThan(0);
    for (const step of pauseSteps) {
      expect(step.content).not.toMatch(/空白鍵|Space/i);
      expect(step.content).toMatch(/P/);
    }
  });

  it('does not keep English button aliases in campaign tutorial copy', () => {
    const joined = INTERACTIVE_TUTORIAL_STEPS.map((step) => step.content).join('\n');
    expect(joined).not.toMatch(/\(Strongest\)|\(Sniper\)|\(Frost\)/);
  });
});
