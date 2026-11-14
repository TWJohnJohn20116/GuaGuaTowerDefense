import { describe, expect, it } from 'vitest';
import { GAME_CONSTANTS } from '@/data/gameData';
import { getMatchSessionReset } from '@/data/matchSessionReset';
import { createEmptyMatchState } from '@/store/matchState';
import { useGameStore } from '@/store/gameStore';

describe('match session reset', () => {
  it('clears in-match overlays that must not leak into the next run', () => {
    expect(getMatchSessionReset()).toEqual({
      fusionMode: false,
      fusionSourceId: null,
      fusionFundsShort: null,
      fusionAnimations: [],
      hoveredTile: null,
      showTacticalView: false,
      shakeIntensity: 0,
    });
  });

  it('局內狀態工廠已包含 session reset（startGame 與 resetGame 都吃同一份）', () => {
    expect(createEmptyMatchState()).toMatchObject(getMatchSessionReset());
  });

  it('resetGame 真的把局內殘留（融合、hover、戰術視圖、震動）清乾淨', () => {
    useGameStore.setState({
      fusionMode: true,
      fusionSourceId: 'tower-1',
      fusionFundsShort: 120,
      hoveredTile: { col: 3, row: 4 },
      showTacticalView: true,
      shakeIntensity: 9,
      money: 999,
      currentWave: 7,
      towers: [{ id: 't1' } as never],
    });

    useGameStore.getState().resetGame();

    const state = useGameStore.getState();
    expect(state.fusionMode).toBe(false);
    expect(state.fusionSourceId).toBeNull();
    expect(state.fusionFundsShort).toBeNull();
    expect(state.hoveredTile).toBeNull();
    expect(state.showTacticalView).toBe(false);
    expect(state.shakeIntensity).toBe(0);
    expect(state.money).toBe(GAME_CONSTANTS.INITIAL_MONEY);
    expect(state.currentWave).toBe(0);
    expect(state.towers).toEqual([]);
    expect(state.scene).toBe('mainMenu');
  });
});
