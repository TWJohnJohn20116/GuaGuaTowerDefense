import { describe, expect, it } from 'vitest';
import { getEnemyData, inferEnemyBaseType, isKnownEnemyType } from '@/store/gameStoreUtils';
import { ENEMY_DATA } from '@/data/gameData';

describe('mod enemy resolution', () => {
  it('內建敵人直接回內建資料（同一個物件）', () => {
    expect(getEnemyData('tank')).toBe(ENEMY_DATA.tank);
  });

  it('未知 id 退回 normal，避免 undefined 讓戰鬥爆掉', () => {
    expect(getEnemyData('__not_a_real_enemy__')).toBe(ENEMY_DATA.normal);
    expect(isKnownEnemyType('__not_a_real_enemy__')).toBe(false);
    expect(isKnownEnemyType('tank')).toBe(true);
  });

  it('ability 會映回對應的內建基底 type', () => {
    expect(inferEnemyBaseType({ ...ENEMY_DATA.normal, ability: 'flying' })).toBe('flyer');
    expect(inferEnemyBaseType({ ...ENEMY_DATA.normal, ability: 'healing' })).toBe('healer');
    expect(inferEnemyBaseType({ ...ENEMY_DATA.normal, ability: 'shield' })).toBe('shield');
    expect(inferEnemyBaseType({ ...ENEMY_DATA.normal })).toBe('normal');
  });
});
