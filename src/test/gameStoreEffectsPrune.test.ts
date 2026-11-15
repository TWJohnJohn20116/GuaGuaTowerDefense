/**
 * 塔位特效清理測試
 *
 * 背景：升級 / 出售 / 融合動畫的過期清理原本散在 2D 與 3D 繪製層，
 * 3D 甚至完全不清 fusionAnimations（切到 3D 後只增不減）。現在唯一擁有者是
 * store 的 `updateVisualEffects`，這支測試釘住「誰負責清、什麼時候清、什麼時候不清」。
 */

import { describe, it, expect, afterEach } from 'vitest';
import { useGameStore } from '@/store/gameStore';

const clearAnimations = () => {
  useGameStore.setState({ upgradeAnimations: [], sellAnimations: [], fusionAnimations: [] });
};

describe('updateVisualEffects 的塔位特效清理', () => {
  afterEach(clearAnimations);

  it('移除過期的升級 / 出售 / 融合動畫，保留存活項目', () => {
    const now = Date.now();
    useGameStore.setState({
      upgradeAnimations: [
        { id: 'u-old', towerId: 't1', pos: { x: 1, y: 1 }, newLevel: 2, towerColor: '#fff', startTime: now - 2000 },
        { id: 'u-new', towerId: 't1', pos: { x: 1, y: 1 }, newLevel: 3, towerColor: '#fff', startTime: now },
      ],
      sellAnimations: [
        { id: 's-old', pos: { x: 2, y: 2 }, towerColor: '#fff', startTime: now - 1000 },
        { id: 's-new', pos: { x: 2, y: 2 }, towerColor: '#fff', startTime: now },
      ],
      fusionAnimations: [
        { id: 'f-old', pos: { x: 3, y: 3 }, resultType: 'basic', startTime: now - 2000, colorA: '#fff', colorB: '#000' },
        { id: 'f-new', pos: { x: 3, y: 3 }, resultType: 'basic', startTime: now, colorA: '#fff', colorB: '#000' },
      ],
    });

    useGameStore.getState().updateVisualEffects(16);

    const state = useGameStore.getState();
    expect(state.upgradeAnimations.map((a) => a.id)).toEqual(['u-new']);
    expect(state.sellAnimations.map((a) => a.id)).toEqual(['s-new']);
    expect(state.fusionAnimations.map((a) => a.id)).toEqual(['f-new']);
  });

  it('全部存活時不動陣列參照（等於不寫 store）', () => {
    const now = Date.now();
    useGameStore.setState({
      upgradeAnimations: [
        { id: 'u1', towerId: 't1', pos: { x: 1, y: 1 }, newLevel: 2, towerColor: '#fff', startTime: now },
      ],
      sellAnimations: [],
      fusionAnimations: [],
    });
    const before = useGameStore.getState().upgradeAnimations;

    useGameStore.getState().updateVisualEffects(16);

    expect(useGameStore.getState().upgradeAnimations).toBe(before);
  });

  it('邊界：剛好滿時長的動畫視為結束', () => {
    const now = Date.now();
    useGameStore.setState({
      upgradeAnimations: [
        { id: 'exact', towerId: 't1', pos: { x: 1, y: 1 }, newLevel: 2, towerColor: '#fff', startTime: now - 1500 },
      ],
      sellAnimations: [],
      fusionAnimations: [],
    });

    useGameStore.getState().updateVisualEffects(16);

    expect(useGameStore.getState().upgradeAnimations).toHaveLength(0);
  });
});
