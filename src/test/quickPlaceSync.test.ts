import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { shouldApplyQuickPlaceDefaultSync } from '@/data/quickPlaceSync';

describe('quick place default vs live Q toggle', () => {
  it('does not apply the default on first scene enter', () => {
    expect(shouldApplyQuickPlaceDefaultSync({
      previousDefault: null,
      nextDefault: true,
    })).toBe(false);
  });

  it('applies only when the persisted default actually changes', () => {
    expect(shouldApplyQuickPlaceDefaultSync({
      previousDefault: false,
      nextDefault: true,
    })).toBe(true);
    expect(shouldApplyQuickPlaceDefaultSync({
      previousDefault: true,
      nextDefault: true,
    })).toBe(false);
  });

  it('starts a match from the setting and does not stomp on GameScene mount', () => {
    const start = readFileSync(
      resolve(__dirname, '../store/gameStore.ts'),
      'utf8',
    );
    const effects = readFileSync(
      resolve(__dirname, '../components/scenes/game-scene/useGameSceneEffects.ts'),
      'utf8',
    );
    const settings = readFileSync(
      resolve(__dirname, '../components/scenes/Settings.tsx'),
      'utf8',
    );
    expect(start).toMatch(/quickPlaceMode:[\s\S]*quickPlaceDefault/);
    expect(effects).toMatch(/shouldApplyQuickPlaceDefaultSync/);
    expect(settings).toMatch(/shouldApplyQuickPlaceDefaultSync/);
  });
});
