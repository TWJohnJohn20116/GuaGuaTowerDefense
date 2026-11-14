import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { GAME_SPEED_PRESETS, nextGameSpeed } from '@/data/gameSpeedPresets';

describe('game speed presets', () => {
  it('keeps HUD, pause, and Space on the same preset list', () => {
    expect([...GAME_SPEED_PRESETS]).toEqual([0.5, 1, 2, 3, 5]);
  });

  it('cycles Space through those presets, wrapping at the end', () => {
    expect(nextGameSpeed(0.5)).toBe(1);
    expect(nextGameSpeed(1)).toBe(2);
    expect(nextGameSpeed(5)).toBe(0.5);
  });

  it('snaps leftover speeds such as tutorial 10x onto the shared cycle', () => {
    expect(nextGameSpeed(10)).toBe(0.5);
    expect(nextGameSpeed(1.5)).toBe(2);
    expect(nextGameSpeed(0.75)).toBe(1);
  });

  it('uses the shared presets in the HUD, pause menu, and hotkey cycle', () => {
    const hud = readFileSync(resolve(__dirname, '../components/game/sidebar/BottomControls.tsx'), 'utf8');
    const pause = readFileSync(resolve(__dirname, '../components/ui/pause/PauseSettingsPanel.tsx'), 'utf8');
    const hotkeys = readFileSync(resolve(__dirname, '../components/scenes/game-scene/useGameSceneEffects.ts'), 'utf8');
    expect(hud).toMatch(/GAME_SPEED_PRESETS/);
    expect(hud).not.toMatch(/commonSpeeds = \[1, 2, 3, 5\]/);
    expect(pause).toMatch(/GAME_SPEED_PRESETS/);
    expect(pause).not.toMatch(/speedOptions = \[0\.5, 1, 2, 3, 5\]/);
    expect(hotkeys).toMatch(/nextGameSpeed/);
    expect(hotkeys).not.toMatch(/speedCycle = \[0\.5, 0\.75, 1, 1\.5, 2, 3, 4, 5, 10\]/);
  });
});
