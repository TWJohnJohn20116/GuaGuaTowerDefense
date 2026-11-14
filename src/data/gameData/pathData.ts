/**
 * 地圖路徑資料 · 主入口（聚合各難度）
 *
 *  ┌──────────────────────────────────────────────┐
 *  │ paths/easyPaths.ts    · 極簡 (1 個)          │
 *  │ paths/mediumPaths.ts  · 中等 (9 個)          │
 *  │ paths/hardPaths.ts    · 困難 (17 個)         │
 *  │ paths/extremePaths.ts · 極難 (9 個)          │
 *  └──────────────────────────────────────────────┘
 *
 * 全部地圖總計：39 個（advanced 叉路系統，含 3 張隱藏/戰役地圖）
 *
 * 描述格式：12-18 個字、單句、聚焦路徑特徵與遊玩感受。
 */

import type { PathConfig } from '@/types/game';
import { easyPaths } from './paths/easyPaths';
import { mediumPaths } from './paths/mediumPaths';
import { extraMediumPaths } from './paths/extraMediumPaths';
import { hardPaths } from './paths/hardPaths';
import { extraHardPaths } from './paths/extraHardPaths';
import { extraHardPaths2 } from './paths/extraHardPaths2';
import { extremePaths } from './paths/extremePaths';
import { extraExtremePaths } from './paths/extraExtremePaths';
import { extraExtremePaths2 } from './paths/extraExtremePaths2';
import { hiddenPaths } from './paths/hiddenPaths';

const allMediumPaths = { ...mediumPaths, ...extraMediumPaths };
const allHardPaths = { ...hardPaths, ...extraHardPaths, ...extraHardPaths2 };
const allExtremePaths = { ...extremePaths, ...extraExtremePaths, ...extraExtremePaths2 };

export const PATHS: Record<string, PathConfig> = {
  ...easyPaths,
  ...allMediumPaths,
  ...allHardPaths,
  ...allExtremePaths,
  ...hiddenPaths,
};

/** 預設地圖（首次進入時使用） */
export const DEFAULT_PATH = 'zigzag';

/** 依 mapId 取得地圖顯示名稱（未知 id 則回傳原 id） */
export function getPathDisplayName(mapId: string): string {
  return PATHS[mapId]?.name ?? mapId;
}

/** 按難度分組導出（供 UI 直接使用） */
export const PATHS_BY_DIFFICULTY = {
  easy: easyPaths,
  medium: allMediumPaths,
  hard: allHardPaths,
  extreme: allExtremePaths,
} as const;
