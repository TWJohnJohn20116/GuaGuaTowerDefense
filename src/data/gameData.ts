/**
 * 遊戲數據總匯出檔案
 * 從 gameData/ 子目錄統一匯出，保持對外介面不變
 */

export { ENEMY_DATA, STATUS_EFFECTS } from './gameData/enemyData';
export { TOWER_DATA } from './gameData/towerData';
export { PATHS, DEFAULT_PATH } from './gameData/pathData';
export { WAVE_CONFIGS, generateEndlessWaveConfig, GAME_CONSTANTS, DIFFICULTY_MODIFIERS } from './gameData/waveData';
