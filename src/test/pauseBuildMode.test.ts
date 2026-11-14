import { describe, expect, it } from 'vitest';
import { shouldShowFullPauseOverlay, shouldShowPauseBuildHud } from '@/store/pauseBuildMode';

describe('pause while building', () => {
  it('shows the full pause menu when the setting is off', () => {
    expect(shouldShowFullPauseOverlay({
      isPaused: true,
      buildWhilePaused: false,
      pauseMenuOpen: false,
      isGameOver: false,
    })).toBe(true);
    expect(shouldShowPauseBuildHud({
      isPaused: true,
      buildWhilePaused: false,
      pauseMenuOpen: false,
      isGameOver: false,
    })).toBe(false);
  });

  it('keeps the field open when the setting is on', () => {
    expect(shouldShowFullPauseOverlay({
      isPaused: true,
      buildWhilePaused: true,
      pauseMenuOpen: false,
      isGameOver: false,
    })).toBe(false);
    expect(shouldShowPauseBuildHud({
      isPaused: true,
      buildWhilePaused: true,
      pauseMenuOpen: false,
      isGameOver: false,
    })).toBe(true);
  });

  it('still opens the pause menu on demand while building', () => {
    expect(shouldShowFullPauseOverlay({
      isPaused: true,
      buildWhilePaused: true,
      pauseMenuOpen: true,
      isGameOver: false,
    })).toBe(true);
    expect(shouldShowPauseBuildHud({
      isPaused: true,
      buildWhilePaused: true,
      pauseMenuOpen: true,
      isGameOver: false,
    })).toBe(false);
  });

  it('hides both overlays when the match is over or running', () => {
    expect(shouldShowFullPauseOverlay({
      isPaused: true,
      buildWhilePaused: true,
      pauseMenuOpen: false,
      isGameOver: true,
    })).toBe(false);
    expect(shouldShowPauseBuildHud({
      isPaused: true,
      buildWhilePaused: true,
      pauseMenuOpen: false,
      isGameOver: true,
    })).toBe(false);
    expect(shouldShowFullPauseOverlay({
      isPaused: false,
      buildWhilePaused: true,
      pauseMenuOpen: false,
      isGameOver: false,
    })).toBe(false);
    expect(shouldShowPauseBuildHud({
      isPaused: false,
      buildWhilePaused: true,
      pauseMenuOpen: false,
      isGameOver: false,
    })).toBe(false);
  });
});
