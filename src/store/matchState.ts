/**
 * 一局遊戲的「空狀態」工廠
 *
 * 原本 startGame() 與 resetGame() 各自手寫一份約 40 行的狀態重設清單，
 * 兩份已經開始漂移（resetGame 多了 showTacticalView、startGame 沒重設 autoBattleEnabled、
 * 一邊少欄位一邊多欄位）。這種「兩份真相」的症狀很隱蔽：重玩一局後某個舊特效或舊統計
 * 還留在場上。現在只有這一份，兩條路徑都走它。
 */
import type { GameStore } from './gameStoreTypes';
import { GAME_CONSTANTS } from '@/data/gameData';
import { getMatchSessionReset } from '@/data/matchSessionReset';
import { createInitialPlayerSkillStates } from './gameStorePlayerSkills';

/** 一局戰鬥中、每次開始/結束都必須歸零的欄位 */
type MatchOwnedKey =
  | 'money'
  | 'health'
  | 'score'
  | 'currentWave'
  | 'waveActive'
  | 'allEnemiesSpawned'
  | 'isGameOver'
  | 'isVictory'
  | 'endlessMode'
  | 'endlessWaveConfig'
  | 'enemies'
  | 'towers'
  | 'projectiles'
  | 'previewMap'
  | 'selectedTowerType'
  | 'selectedTower'
  | 'multiSelectedTowerIds'
  | 'placementHistory'
  | 'placementHistoryIndex'
  | 'placementStats'
  | 'upgradeHistory'
  | 'upgradeStats'
  | 'upgradeAnimations'
  | 'sellAnimations'
  | 'playerSkillStates'
  | 'playerSkillAnimations'
  | 'damageTexts'
  | 'impactParticles'
  | 'deathAnimations'
  | 'pendingProtocolChoices'
  | 'activeProtocol'
  | 'protocolHistory'
  | 'protocolNextTowerDiscount'
  | 'autoBattleEnabled'
  | 'autoBattleDecisions'
  | 'autoBattleCurve'
  | 'autoBattleLastDecision'
  | 'autoBattleLastActionAt'
  | 'autoBattleStats'
  | 'scriptTowerMods'
  | 'matchKills'
  | 'matchLeaks'
  | 'scriptWaveDelayMs';

export const createEmptyMatchState = (): Pick<GameStore, MatchOwnedKey> => ({
  previewMap: null,
  money: GAME_CONSTANTS.INITIAL_MONEY,
  health: GAME_CONSTANTS.INITIAL_HEALTH,
  score: 0,
  matchKills: 0,
  matchLeaks: 0,
  scriptTowerMods: {},
  scriptWaveDelayMs: 0,

  currentWave: 0,
  waveActive: false,
  allEnemiesSpawned: false,
  isGameOver: false,
  isVictory: false,
  endlessMode: false,
  endlessWaveConfig: null,

  enemies: [],
  towers: [],
  projectiles: [],

  selectedTowerType: null,
  selectedTower: null,
  multiSelectedTowerIds: [],

  placementHistory: [],
  placementHistoryIndex: -1,
  placementStats: { totalPlaced: 0, totalSold: 0, totalSpent: 0 },

  upgradeHistory: [],
  upgradeStats: { totalUpgrades: 0, totalSpent: 0, maxLevelReached: 1 },
  upgradeAnimations: [],
  sellAnimations: [],

  playerSkillStates: createInitialPlayerSkillStates(),
  playerSkillAnimations: [],

  damageTexts: [],
  impactParticles: [],
  deathAnimations: [],

  pendingProtocolChoices: null,
  activeProtocol: null,
  protocolHistory: [],
  protocolNextTowerDiscount: 0,

  autoBattleEnabled: false,
  autoBattleDecisions: [],
  autoBattleCurve: [],
  autoBattleLastDecision: 0,
  autoBattleLastActionAt: {},
  autoBattleStats: { decisions: 0, executed: 0, placed: 0, upgraded: 0, sold: 0, skipped: 0 },

  ...getMatchSessionReset(),
});
