/**
 * MapEditorPanel 快速地圖工具
 */
import { GAME_CONSTANTS } from '@/data/gameData';
import type { CustomMapData } from '@/types/game';
import {
  mirrorWaypointsHorizontal,
  mirrorWaypointsVertical,
  mirrorCellsHorizontal,
  mirrorCellsVertical,
  appendOffsetPath,
  appendOffsetBlocked,
} from './mapEditorAdvancedTools';

const { GRID_COLS, GRID_ROWS } = GAME_CONSTANTS;

export type MapQuickTool = 'mirrorH' | 'mirrorV' | 'dupPath' | 'clearBlocked';

export function applyMapQuickTool(map: CustomMapData, tool: MapQuickTool): CustomMapData {
  switch (tool) {
    case 'mirrorH':
      return {
        ...map,
        waypoints: mirrorWaypointsHorizontal(map.waypoints, GRID_COLS),
        blockedCells: mirrorCellsHorizontal(map.blockedCells ?? [], GRID_COLS),
      };
    case 'mirrorV':
      return {
        ...map,
        waypoints: mirrorWaypointsVertical(map.waypoints, GRID_ROWS),
        blockedCells: mirrorCellsVertical(map.blockedCells ?? [], GRID_ROWS),
      };
    case 'dupPath':
      return {
        ...map,
        waypoints: appendOffsetPath(map.waypoints, 0, 1, GRID_COLS, GRID_ROWS),
        blockedCells: appendOffsetBlocked(map.blockedCells ?? [], 0, 1, GRID_COLS, GRID_ROWS),
      };
    case 'clearBlocked':
      return { ...map, blockedCells: [] };
    default:
      return map;
  }
}

export const MAP_QUICK_TOOL_IDS: MapQuickTool[] = ['mirrorH', 'mirrorV', 'dupPath', 'clearBlocked'];
