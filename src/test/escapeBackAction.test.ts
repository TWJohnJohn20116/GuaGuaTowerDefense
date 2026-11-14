import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { hasActiveSelection, resolveBackKeyAction } from '@/store/gameHotkeys';

describe('escape / back key', () => {
  it('resumes when the game is already paused', () => {
    expect(resolveBackKeyAction({ isPaused: true, hasSelection: true })).toBe('resume');
    expect(resolveBackKeyAction({ isPaused: true, hasSelection: false })).toBe('resume');
    expect(resolveBackKeyAction({ isPaused: true, hasSelection: true, fusionMode: true })).toBe('resume');
  });

  it('cancels fusion before deselecting, because the source tower is still selected', () => {
    expect(resolveBackKeyAction({ isPaused: false, hasSelection: true, fusionMode: true })).toBe('cancel_fusion');
    expect(resolveBackKeyAction({ isPaused: false, hasSelection: false, fusionMode: true })).toBe('cancel_fusion');
  });

  it('deselects while playing if a tower, type, or multi-select is active', () => {
    expect(resolveBackKeyAction({ isPaused: false, hasSelection: true })).toBe('deselect');
  });

  it('pauses while playing when nothing is selected', () => {
    expect(resolveBackKeyAction({ isPaused: false, hasSelection: false })).toBe('pause');
  });

  it('treats tower, placement type, and multi-select as a selection', () => {
    expect(hasActiveSelection({ selectedTower: { id: 't1' }, selectedTowerType: null, multiSelectedCount: 0 })).toBe(true);
    expect(hasActiveSelection({ selectedTower: null, selectedTowerType: 'basic', multiSelectedCount: 0 })).toBe(true);
    expect(hasActiveSelection({ selectedTower: null, selectedTowerType: null, multiSelectedCount: 2 })).toBe(true);
    expect(hasActiveSelection({ selectedTower: null, selectedTowerType: null, multiSelectedCount: 0 })).toBe(false);
  });

  it('wires fusion cancel into the in-game back key handler', () => {
    const src = readFileSync(
      resolve(__dirname, '../components/scenes/game-scene/useGameSceneEffects.ts'),
      'utf8',
    );
    expect(src).toMatch(/fusionMode/);
    expect(src).toMatch(/cancelFusion/);
    expect(src).toMatch(/cancel_fusion/);
  });
});
