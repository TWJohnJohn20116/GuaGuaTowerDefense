// AI 自動戰鬥：玩家主動技能釋放決策模組
// 由 gameStoreAutoBattle.ts 在每 500ms 的技能評估視窗中呼叫

import type { GameStore } from './gameStoreTypes';
import { GAME_CONSTANTS, ENEMY_DATA } from '@/data/gameData';
import { PLAYER_SKILLS, PLAYER_SKILL_BY_ID } from '@/data/playerSkillData';
import type { PlayerSkillId, PlayerSkill } from '@/data/playerSkillData';
import { isEnemyPhased } from './gameStoreUtils';
import { hasEnemyAbility } from '@/data/gameData/enemyAbilities';
import { useShopStore } from './shopStore';

type GetState = () => GameStore;

// 將每個策略對應到「決策閾值」
// 數值越低 = AI 越積極釋放對應技能
type StrategyName = 'balanced' | 'economy' | 'aggressive' | 'defensive';

const SKILL_THRESHOLDS: Record<PlayerSkillId, Record<StrategyName, number>> = {
  lightningStorm: {
    aggressive: 4,
    balanced: 6,
    defensive: 8,
    economy: 7,
  },
  frozenTime: {
    aggressive: 5,
    balanced: 7,
    defensive: 5,
    economy: 8,
  },
  cashRain: {
    aggressive: 5,
    balanced: 4,
    defensive: 4,
    economy: 2,
  },
  battleInspire: {
    aggressive: 5,
    balanced: 7,
    defensive: 8,
    economy: 8,
  },
  meteorStorm: {
    aggressive: 5,
    balanced: 6,
    defensive: 7,
    economy: 7,
  },
  chainLightning: {
    aggressive: 4,
    balanced: 6,
    defensive: 7,
    economy: 7,
  },
  holyHeal: {
    aggressive: 8,
    balanced: 6,
    defensive: 4,
    economy: 7,
  },
  aegisBarrier: {
    aggressive: 9,
    balanced: 7,
    defensive: 4,
    economy: 8,
  },
  warpTrap: {
    aggressive: 7,
    balanced: 6,
    defensive: 4,
    economy: 7,
  },
  empPulse: {
    aggressive: 4,
    balanced: 5,
    defensive: 6,
    economy: 7,
  },
};

interface PlayerSkillContext {
  state: GameStore;
  threatLevel: number;
}

interface SkillCandidate {
  skill: PlayerSkill;
  score: number;
  threshold: number;
  reasonParts: string[];
  meta: {
    enemiesNear: number;
    bossNear: boolean;
    minibossNear: boolean;
    spawnerNear: boolean;
    hpRatio: number;
  };
}

interface ScoringContext {
  state: GameStore;
  threatLevel: number;
  strategy: StrategyName;
  enemiesCount: number;
  bossNear: boolean;
  minibossNear: boolean;
  spawnerNear: boolean;
  healerNear: boolean;
  jammerNear: boolean;
  escortNear: boolean;
  swarmCount: number;
  hpRatio: number;
}

interface SkillScoreResult {
  score: number;
  reasonParts: string[];
}

type SkillScorer = (c: ScoringContext) => SkillScoreResult | null;

// 掃描存活敵人，彙整各技能評分共用的局勢資訊
function buildScoringContext(
  state: GameStore,
  threatLevel: number,
  strategy: StrategyName,
): ScoringContext {
  const aliveEnemies = state.enemies.filter((e) => e.health > 0);

  let bossNear = false;
  let minibossNear = false;
  let spawnerNear = false;
  let healerNear = false;
  let jammerNear = false;
  let escortNear = false;
  let swarmCount = 0;

  for (const e of aliveEnemies) {
    if (e.type === 'boss') bossNear = true;
    if (e.type === 'miniboss') minibossNear = true;
    if (e.type === 'spawner') spawnerNear = true;
    if (e.type === 'healer') healerNear = true;
    if (e.type === 'jammer') jammerNear = true;
    if (e.type === 'escort') escortNear = true;
    if (e.type === 'swarm') swarmCount++;
  }

  return {
    state,
    threatLevel,
    strategy,
    enemiesCount: aliveEnemies.length,
    bossNear,
    minibossNear,
    spawnerNear,
    healerNear,
    jammerNear,
    escortNear,
    swarmCount,
    hpRatio: state.health / GAME_CONSTANTS.INITIAL_HEALTH,
  };
}

// 雷霆風暴：80 傷 + 1 秒眩暈，全體
function scoreLightningStorm(c: ScoringContext): SkillScoreResult | null {
  if (c.enemiesCount === 0) return null;
  const reasonParts: string[] = [];
  let score = Math.min(c.enemiesCount, 10) * 0.6;
  reasonParts.push(`敵 ${c.enemiesCount}`);
  if (c.bossNear) {
    score += 5;
    reasonParts.push('首領');
  }
  if (c.minibossNear) {
    score += 3;
    reasonParts.push('次首領');
  }
  if (c.spawnerNear) {
    score += 3;
    reasonParts.push('生產者');
  }
  if (c.swarmCount >= 5) {
    score += 2;
    reasonParts.push(`蜂群 ${c.swarmCount}`);
  }
  score += c.threatLevel * 4;
  return { score, reasonParts };
}

// 時間凍結：所有敵人凍結 5 秒
function scoreFrozenTime(c: ScoringContext): SkillScoreResult | null {
  if (c.enemiesCount === 0) return null;
  const reasonParts: string[] = [];
  let score = c.threatLevel * 8;
  reasonParts.push(`威脅 ${(c.threatLevel * 100).toFixed(0)}%`);
  if (c.hpRatio < 0.4) {
    score += 6;
    reasonParts.push(`HP ${(c.hpRatio * 100).toFixed(0)}%`);
  } else if (c.hpRatio < 0.6) {
    score += 2;
  }
  if (c.bossNear || c.minibossNear) {
    score += 2;
    reasonParts.push('首領在場');
  }
  score += Math.min(c.enemiesCount * 0.3, 3);
  return { score, reasonParts };
}

// 金幣雨：+300 金幣
function scoreCashRain(c: ScoringContext): SkillScoreResult | null {
  const reasonParts: string[] = [];
  let score = 0;
  const money = c.state.money;
  if (money < 100) {
    score += 6;
    reasonParts.push(`資金 $${money} 緊缺`);
  } else if (money < 200) {
    score += 3;
    reasonParts.push(`資金 $${money} 偏低`);
  } else if (money < 400 && c.strategy === 'economy') {
    score += 2;
    reasonParts.push('經濟策略加成');
  }
  if (c.state.waveActive && c.enemiesCount > 0) {
    score += 1;
  }
  // 若資金足以解鎖採購某些塔（範例 100），加分
  if (money < 100 && money + 300 >= 100) {
    score += 1;
    reasonParts.push('可解鎖建造');
  }
  return { score, reasonParts };
}

// 狂戰激勵：所有塔攻速 2x 持續 10 秒
function scoreBattleInspire(c: ScoringContext): SkillScoreResult | null {
  if (c.state.towers.length < 4) return null;
  const reasonParts: string[] = [];
  let score = c.threatLevel * 6;
  reasonParts.push(`威脅 ${(c.threatLevel * 100).toFixed(0)}%`);
  score += Math.min(c.enemiesCount * 0.4, 4);
  if (c.enemiesCount >= 6) reasonParts.push(`敵 ${c.enemiesCount}`);
  if (c.bossNear) {
    score += 5;
    reasonParts.push('首領');
  }
  if (c.minibossNear) {
    score += 3;
    reasonParts.push('次首領');
  }
  // 治療敵人需要快速擊破
  if (c.healerNear) {
    score += 2;
    reasonParts.push('治療者');
  }
  if (c.jammerNear) {
    score += 2.5;
    reasonParts.push('干擾者');
  }
  if (c.escortNear) {
    score += 2.2;
    reasonParts.push('護航者');
  }
  // 塔數越多激勵越值
  score += Math.min((c.state.towers.length - 4) * 0.3, 3);
  return { score, reasonParts };
}

// 隕石風暴：範圍爆發 + 灼燒，適合密集敵群與高血量單位
function scoreMeteorStorm(c: ScoringContext): SkillScoreResult | null {
  if (c.enemiesCount === 0) return null;
  const reasonParts: string[] = [];
  let score = Math.min(c.enemiesCount, 12) * 0.55;
  reasonParts.push(`敵 ${c.enemiesCount}`);
  if (c.enemiesCount >= 6) {
    score += 2;
    reasonParts.push('密集');
  }
  if (c.bossNear) {
    score += 4;
    reasonParts.push('首領');
  }
  if (c.minibossNear) {
    score += 2.5;
    reasonParts.push('次首領');
  }
  if (c.spawnerNear) {
    score += 2;
    reasonParts.push('生產者');
  }
  if (c.swarmCount >= 5) {
    score += 2.5;
    reasonParts.push(`蜂群 ${c.swarmCount}`);
  }
  score += c.threatLevel * 3.5;
  return { score, reasonParts };
}

// 閃電鏈：聚集敵群可串接更多彈跳，首擊滿額傷害適合高血量單位
function scoreChainLightning(c: ScoringContext): SkillScoreResult | null {
  if (c.enemiesCount === 0) return null;
  const reasonParts: string[] = [];
  let score = Math.min(c.enemiesCount, 10) * 0.5;
  reasonParts.push(`敵 ${c.enemiesCount}`);
  if (c.enemiesCount >= 5) {
    score += 2.5;
    reasonParts.push('密集可連鎖');
  }
  if (c.bossNear) {
    score += 4;
    reasonParts.push('首領');
  }
  if (c.minibossNear) {
    score += 2.5;
    reasonParts.push('次首領');
  }
  if (c.spawnerNear) {
    score += 2;
    reasonParts.push('生產者');
  }
  if (c.swarmCount >= 5) {
    score += 2;
    reasonParts.push(`蜂群 ${c.swarmCount}`);
  }
  score += c.threatLevel * 3;
  return { score, reasonParts };
}

// 聖光治療：基地生命越低越值得釋放，並在高威脅時優先保命
function scoreHolyHeal(c: ScoringContext): SkillScoreResult | null {
  // 接近滿血時無需治療
  if (c.hpRatio >= 0.95) return null;
  const reasonParts: string[] = [];
  let score = (1 - c.hpRatio) * 14;
  reasonParts.push(`HP ${(c.hpRatio * 100).toFixed(0)}%`);
  if (c.hpRatio < 0.3) {
    score += 6;
    reasonParts.push('生命危急');
  } else if (c.hpRatio < 0.5) {
    score += 3;
    reasonParts.push('生命偏低');
  }
  if (c.threatLevel > 0.5) {
    score += 1.5;
    reasonParts.push(`威脅 ${(c.threatLevel * 100).toFixed(0)}%`);
  }
  return { score, reasonParts };
}

// 聖盾結界：終點壓力越大越值得展開（漏怪前免疫保命），低血量時優先級飆升
function scoreAegisBarrier(c: ScoringContext): SkillScoreResult | null {
  if (c.enemiesCount === 0) return null;
  // 統計逼近基地的敵人（路徑進度 > 72%）
  let nearEnd = 0;
  for (const e of c.state.enemies) {
    if (e.health > 0 && e.progress > 0.72) nearEnd++;
  }
  if (nearEnd === 0 && c.hpRatio > 0.5) return null;
  const reasonParts: string[] = [];
  let score = nearEnd * 2.2;
  if (nearEnd > 0) reasonParts.push(`逼近基地 ${nearEnd}`);
  if (c.hpRatio < 0.3) {
    score += 7;
    reasonParts.push('生命危急');
  } else if (c.hpRatio < 0.5) {
    score += 4;
    reasonParts.push('生命偏低');
  }
  if (c.bossNear && nearEnd > 0) {
    score += 3;
    reasonParts.push('首領逼近');
  }
  score += c.threatLevel * 3;
  if (c.threatLevel > 0.5) reasonParts.push(`威脅 ${(c.threatLevel * 100).toFixed(0)}%`);
  return { score, reasonParts };
}

// 傳送陷阱：敵人逼近終點時把威脅單位送回路徑後段，為塔陣爭取二次輸出窗口
function scoreWarpTrap(c: ScoringContext): SkillScoreResult | null {
  if (c.enemiesCount === 0) return null;
  // 統計逼近基地、且可被傳送的敵人（路徑進度 > 0.6，與聖盾結界同款啟發式）
  // 排除飛行敵人（直線飛行不走路徑，傳送無效）
  let nearEnd = 0;
  const now = Date.now();
  for (const e of c.state.enemies) {
    if (e.health <= 0 || e.isDisplaced || e.progress <= 0.6) continue;
    if (hasEnemyAbility(ENEMY_DATA[e.type], 'flying')) continue;
    if (isEnemyPhased(e, now)) continue;
    nearEnd++;
  }
  if (nearEnd === 0) return null;
  const reasonParts: string[] = [];
  let score = Math.min(nearEnd, 8) * 1.6;
  reasonParts.push(`逼近基地 ${nearEnd}`);
  if (c.bossNear) {
    score += 2.5;
    reasonParts.push('首領');
  }
  if (c.minibossNear) {
    score += 1.5;
    reasonParts.push('次首領');
  }
  if (c.hpRatio < 0.4) {
    score += 3;
    reasonParts.push('生命偏低');
  }
  score += c.threatLevel * 4;
  if (c.threatLevel > 0.5) reasonParts.push(`威脅 ${(c.threatLevel * 100).toFixed(0)}%`);
  return { score, reasonParts };
}

function scoreEmpPulse(c: ScoringContext): SkillScoreResult | null {
  if (c.enemiesCount === 0) return null;
  let shielded = 0;
  for (const e of c.state.enemies) {
    if (e.health <= 0) continue;
    if ((e.shield ?? 0) > 0) shielded += 1;
  }
  if (shielded === 0 && c.enemiesCount < 4) return null;
  const reasonParts: string[] = [];
  let score = Math.min(shielded, 8) * 2.2 + Math.min(c.enemiesCount, 10) * 0.4;
  if (shielded > 0) reasonParts.push(`護盾 ${shielded}`);
  else reasonParts.push(`群聚 ${c.enemiesCount}`);
  if (c.bossNear) {
    score += 1.5;
    reasonParts.push('首領');
  }
  score += c.threatLevel * 2;
  return { score, reasonParts };
}

const SKILL_SCORERS: Record<PlayerSkillId, SkillScorer> = {
  lightningStorm: scoreLightningStorm,
  frozenTime: scoreFrozenTime,
  cashRain: scoreCashRain,
  battleInspire: scoreBattleInspire,
  meteorStorm: scoreMeteorStorm,
  chainLightning: scoreChainLightning,
  holyHeal: scoreHolyHeal,
  aegisBarrier: scoreAegisBarrier,
  warpTrap: scoreWarpTrap,
  empPulse: scoreEmpPulse,
};

// 對指定技能評分，回傳 SkillCandidate 或 null（若條件不符合 / 未冷卻）
function scoreSkill(skillId: PlayerSkillId, ctx: PlayerSkillContext): SkillCandidate | null {
  const { state, threatLevel } = ctx;
  if (!state.isPlayerSkillReady(skillId)) return null;

  const skill = PLAYER_SKILL_BY_ID[skillId];
  if (!skill) return null;

  const strategy = state.autoBattleStrategy as StrategyName;
  const threshold = SKILL_THRESHOLDS[skillId][strategy] ?? SKILL_THRESHOLDS[skillId].balanced;

  const scoring = buildScoringContext(state, threatLevel, strategy);
  const result = SKILL_SCORERS[skillId](scoring);
  if (!result) return null;

  return {
    skill,
    score: result.score,
    threshold,
    reasonParts: result.reasonParts,
    meta: {
      enemiesNear: scoring.enemiesCount,
      bossNear: scoring.bossNear,
      minibossNear: scoring.minibossNear,
      spawnerNear: scoring.spawnerNear,
      hpRatio: scoring.hpRatio,
    },
  };
}

// 主入口：嘗試讓 AI 釋放最佳的玩家主動技能（每次最多 1 個）
// 回傳 true 表示成功釋放某個技能
export function tryActivatePlayerSkill(
  get: GetState,
  threatLevel: number,
): boolean {
  const state = get();

  if (!state.autoBattleEnabled) return false;
  if (!state.autoBattleConfig.useSkills) return false;
  if (!state.isPlaying || state.isPaused || state.isGameOver || state.isVictory) return false;

  // 取得已解鎖的玩家技能（未購買的不會被 AI 使用）
  const unlocked = useShopStore.getState().unlockedPlayerSkills;
  if (unlocked.length === 0) return false;

  const ctx: PlayerSkillContext = { state, threatLevel };

  const candidates: SkillCandidate[] = [];
  for (const sk of PLAYER_SKILLS) {
    if (!unlocked.includes(sk.id)) continue;
    const result = scoreSkill(sk.id, ctx);
    if (result && result.score >= result.threshold) {
      candidates.push(result);
    }
  }

  if (candidates.length === 0) return false;

  // 取分數最高者
  candidates.sort((a, b) => b.score - a.score);
  const top = candidates[0];

  // 嘗試釋放
  const ok = state.activatePlayerSkill(top.skill.id);
  if (!ok) return false;

  const strategyName: Record<StrategyName, string> = {
    balanced: '平衡',
    economy: '經濟',
    aggressive: '積極',
    defensive: '防守',
  };

  const sName = strategyName[(state.autoBattleStrategy as StrategyName) ?? 'balanced'];

  const thinkingSteps: string[] = [
    `[ 策略 ] ${sName} - 玩家主動技能評估`,
    `[ 局勢 ] 威脅 ${(threatLevel * 100).toFixed(0)}% | 敵人 ${top.meta.enemiesNear} | HP ${(top.meta.hpRatio * 100).toFixed(0)}%`,
    `[ 候選 ] 共 ${candidates.length} 個技能達門檻`,
    `[ 選擇 ] ${top.skill.nameZh} | 分 ${top.score.toFixed(1)} / 閾 ${top.threshold.toFixed(1)}`,
    `[ 理由 ] ${top.reasonParts.join(' · ')}`,
    `[ 執行 ] ✓ 釋放 ${top.skill.nameZh} (CD ${top.skill.cooldown / 1000}s)`,
  ];

  state.addAutoBattleLog(
    'skill',
    `主動技能 - ${top.skill.nameZh}`,
    `${top.reasonParts.join(' · ')} | 分 ${top.score.toFixed(1)}`,
    thinkingSteps,
  );

  return true;
}
