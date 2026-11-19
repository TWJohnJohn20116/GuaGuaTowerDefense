import type { AutoBattleConfig, AutoBattleContext, AutoBattleLookahead, AutoBattleTrigger } from '@/types/autobattle';
import { GAME_CONSTANTS } from '@/data/gameData';
import { isSkillReady } from '@/data/skillData';
import { SKILL_DATA } from '@/data/skillData';
import { PLAYER_SKILLS } from '@/data/playerSkillData';
import type { GameStore } from '@/store/gameStoreTypes';

/** 從 store 快照產生一次決策的唯讀輸入（不含前瞻，前瞻由 plan.ts 補） */
export const buildContext = (
  state: GameStore,
  trigger: AutoBattleTrigger[],
  config: AutoBattleConfig,
  lookahead: AutoBattleLookahead,
): AutoBattleContext => {
  const now = Date.now();
  return {
    time: now,
    wave: state.currentWave,
    money: state.money,
    health: state.health,
    maxHealth: GAME_CONSTANTS.INITIAL_HEALTH,
    enemies: state.enemies.map((e) => ({
      id: e.id,
      type: e.type,
      x: e.x,
      y: e.y,
      health: e.health,
      maxHealth: e.maxHealth || e.health,
      progress: e.progress ?? 0,
    })),
    towers: state.towers.map((t) => ({
      id: t.id,
      type: t.type,
      level: t.level,
      col: t.pos.x,
      row: t.pos.y,
      skillReady: Boolean(t.skill && isSkillReady(t.skill.lastUsedTime, SKILL_DATA[t.skill.skillId]?.cooldown ?? 0) && !t.skill.isActive),
      upgradePath: t.upgradePath ?? null,
    })),
    waveActive: state.waveActive,
    allEnemiesSpawned: state.allEnemiesSpawned,
    firepowerLevel: 0,
    playerSkills: PLAYER_SKILLS.map((s) => ({
      id: s.id,
      ready: now - (state.playerSkillStates[s.id]?.lastUsedTime ?? 0) >= s.cooldown,
    })),
    lookahead,
    config,
    trigger,
  };
};
