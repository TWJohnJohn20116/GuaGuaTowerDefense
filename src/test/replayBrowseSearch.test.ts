import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { gameDifficultyLabelsFromGameCopy } from '@/data/gameRecordLabels';
import { replayMatchesSearch } from '@/data/replayBrowseSearch';
import { zhTW } from '@/i18n/locales/zh-TW';

const labels = gameDifficultyLabelsFromGameCopy(zhTW.game);

const sample = {
  name: '第 8 波防守',
  mapId: 'straight',
  difficulty: 'normal',
  tags: ['練習'],
};

describe('replay browse search', () => {
  it('matches the displayed Chinese difficulty and map name, not only the raw keys', () => {
    expect(replayMatchesSearch(sample, '普通', labels)).toBe(true);
    expect(replayMatchesSearch(sample, '困難', labels)).toBe(false);
    expect(replayMatchesSearch(sample, '直線', labels)).toBe(true);
    expect(replayMatchesSearch({ ...sample, difficulty: 'hard' }, '困難', labels)).toBe(true);
  });

  it('still matches English difficulty keys, names, and tags', () => {
    expect(replayMatchesSearch(sample, 'normal', labels)).toBe(true);
    expect(replayMatchesSearch(sample, 'straight', labels)).toBe(true);
    expect(replayMatchesSearch(sample, '防守', labels)).toBe(true);
    expect(replayMatchesSearch(sample, '練習', labels)).toBe(true);
    expect(replayMatchesSearch(sample, '', labels)).toBe(true);
  });

  it('wires the helper into the replay browse scene', () => {
    const src = readFileSync(
      resolve(__dirname, '../components/scenes/Replay.tsx'),
      'utf8',
    );
    expect(src).toMatch(/replayMatchesSearch/);
    expect(src).toMatch(/gameDifficultyLabelsFromGameCopy/);
  });
});
