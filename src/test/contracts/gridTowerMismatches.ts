/**
 * 塔佔位一致性檢查（**測試專用**）
 *
 * 舊版檢查「格子登記的 towerId 與塔的 gridPos 是否對得上」。自由制沒有格子陣列，
 * 那組不變式隨之消失；取而代之真正該守的不變式是：**沒有任何兩座塔的佔位圓重疊**，
 * 而且每座塔都有一個合法的半徑與座標。
 *
 * 這個檔案仍然是「檢查器與被檢查的判定吃同一套幾何」，避免測試自己另寫一套近似。
 */
import type { Tower } from '@/types/game';
import { circlesOverlap, isInsideBounds } from '@/data/mapGeometry';
import type { PathConfig } from '@/types/game';

/** 回傳空陣列代表一致；否則每條字串是一個具體的不一致 */
export const findTowerOverlaps = (
  towers: readonly Tower[],
  map?: PathConfig | null,
): string[] => {
  const problems: string[] = [];

  for (const tower of towers) {
    if (!Number.isFinite(tower.pos.x) || !Number.isFinite(tower.pos.y)) {
      problems.push(`塔 ${tower.id} 的座標不是有限數值：(${tower.pos.x}, ${tower.pos.y})`);
    }
    if (!(tower.radius > 0)) {
      problems.push(`塔 ${tower.id} 的佔位半徑必須大於 0，實際是 ${tower.radius}`);
    }
    if (map && !isInsideBounds(map, tower.pos, tower.radius)) {
      problems.push(`塔 ${tower.id} 超出地圖邊界：(${tower.pos.x}, ${tower.pos.y})`);
    }
  }

  for (let i = 0; i < towers.length; i++) {
    for (let j = i + 1; j < towers.length; j++) {
      const a = towers[i];
      const b = towers[j];
      if (circlesOverlap(a.pos, a.radius, b.pos, b.radius)) {
        problems.push(
          `塔 ${a.id} 與 ${b.id} 的佔位圓重疊（(${a.pos.x},${a.pos.y}) r=${a.radius} vs (${b.pos.x},${b.pos.y}) r=${b.radius}）`,
        );
      }
    }
  }

  return problems;
};
