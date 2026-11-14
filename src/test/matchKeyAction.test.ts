import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { DEFAULT_KEY_BINDINGS } from '@/store/gameStoreUtils';
import { resolveMatchKeyAction } from '@/store/gameHotkeys';

describe('match key action: speed vs tower vs skill', () => {
  it('does not select a tower when 1/2/3 are bound to speed', () => {
    expect(resolveMatchKeyAction({
      code: 'Digit1',
      shiftKey: false,
      keyBindings: DEFAULT_KEY_BINDINGS,
    })).toEqual({ kind: 'speed', value: 1 });
    expect(resolveMatchKeyAction({
      code: 'Digit2',
      shiftKey: false,
      keyBindings: DEFAULT_KEY_BINDINGS,
    })).toEqual({ kind: 'speed', value: 2 });
    expect(resolveMatchKeyAction({
      code: 'Digit3',
      shiftKey: false,
      keyBindings: DEFAULT_KEY_BINDINGS,
    })).toEqual({ kind: 'speed', value: 3 });
  });

  it('lets Shift+digit fire a skill without also changing speed', () => {
    expect(resolveMatchKeyAction({
      code: 'Digit1',
      shiftKey: true,
      keyBindings: DEFAULT_KEY_BINDINGS,
    })).toEqual({ kind: 'player_skill', digit: '1' });
  });

  it('still selects towers on digits that are not a bound action', () => {
    expect(resolveMatchKeyAction({
      code: 'Digit4',
      shiftKey: false,
      keyBindings: DEFAULT_KEY_BINDINGS,
    })).toEqual({ kind: 'select_tower', index: 3 });
  });

  it('selects tower 1 after speed is rebound off the digit row', () => {
    expect(resolveMatchKeyAction({
      code: 'Digit1',
      shiftKey: false,
      keyBindings: { ...DEFAULT_KEY_BINDINGS, speed1: 'F1' },
    })).toEqual({ kind: 'select_tower', index: 0 });
  });

  it('wires the match-key resolver into the scene hotkey handler', () => {
    const src = readFileSync(
      resolve(__dirname, '../components/scenes/game-scene/useGameSceneEffects.ts'),
      'utf8',
    );
    expect(src).toMatch(/resolveMatchKeyAction/);
  });
});
