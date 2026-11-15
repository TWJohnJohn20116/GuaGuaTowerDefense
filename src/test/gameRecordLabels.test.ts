import { describe, expect, it } from 'vitest';
import {
  formatGameRecordDifficulty,
  formatGameRecordMap,
  gameDifficultyLabelsFromGameCopy,
} from '@/data/gameRecordLabels';
import { filterGameHistory } from '@/components/scenes/statistics/statsHistoryFilters';
import { zhTW } from '@/i18n/locales/zh-TW';
import type { GameRecord } from '@/store/statsStore';

const labels = gameDifficultyLabelsFromGameCopy(zhTW.game);

function stub(partial: Partial<GameRecord> & Pick<GameRecord, 'mapId' | 'difficulty'>): GameRecord {
  return {
    id: 'g1',
    date: Date.now(),
    isVictory: true,
    score: 100,
    finalWave: 5,
    finalHealth: 10,
    duration: 1000,
    totalDamageDealt: 0,
    totalEnemiesKilled: 0,
    totalMoneyEarned: 0,
    totalMoneySpent: 0,
    towersPlaced: 0,
    towersUpgraded: 0,
    towersSold: 0,
    towerStats: [],
    waveSnapshots: [],
    economySnapshots: [],
    enemiesKilledByType: {},
    damageByTowerType: {},
    peakMoney: 0,
    peakTowerCount: 0,
    averageDPS: 0,
    perfectWaves: 0,
    damageTaken: 0,
    ...partial,
  };
}

describe('game record map and difficulty labels', () => {
  it('uses the path display name and Traditional Chinese difficulty', () => {
    expect(formatGameRecordMap('straight')).toBe('直線');
    expect(formatGameRecordMap('no-such-map')).toBe('no-such-map');
    expect(formatGameRecordDifficulty('normal', labels)).toBe('普通');
    expect(formatGameRecordDifficulty('nightmare', labels)).toBe('夢魘');
  });

  it('lets history search match the displayed map name', () => {
    const games = [stub({ mapId: 'straight', difficulty: 'hard' })];
    expect(filterGameHistory(games, 'all', 'all', 'all', '直線', labels)).toHaveLength(1);
    expect(filterGameHistory(games, 'all', 'all', 'all', '普通', labels)).toHaveLength(0);
    expect(filterGameHistory(games, 'all', 'all', 'all', '困難', labels)).toHaveLength(1);
  });
});
