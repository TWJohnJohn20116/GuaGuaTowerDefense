import { getPathDisplayName } from '@/data/gameData/pathData';
import {
  formatGameRecordDifficulty,
  type GameDifficultyLabels,
} from '@/data/gameRecordLabels';

/** 回放瀏覽搜尋：名稱、地圖中文名、難度中文名、標籤都要對得到畫面上看到的字。 */
export function replayMatchesSearch(
  replay: {
    name: string;
    mapId: string;
    difficulty: string;
    tags?: string[];
  },
  query: string,
  labels: GameDifficultyLabels,
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    replay.name,
    replay.mapId,
    getPathDisplayName(replay.mapId),
    replay.difficulty,
    formatGameRecordDifficulty(replay.difficulty, labels),
    ...(replay.tags || []),
  ].join(' ').toLowerCase();
  return haystack.includes(q);
}
