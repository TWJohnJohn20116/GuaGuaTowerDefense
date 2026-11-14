/**
 * Mod 平衡分析核心邏輯（供 Advisor / ScoreBadge 共用）
 */
import type { CustomTowerData, CustomEnemyData, CustomWaveData } from '@/types/game';
import { ENEMY_DATA } from '@/data/gameData';
import { calculateDPS } from './BalanceChecker';
import { fillTemplate } from '@/i18n/fileMetaExtraLabels';
import type { Translations } from '@/i18n';
import type { BalanceSuggestionCategory, BalanceSuggestionItem } from './modBalanceSuggestionUtils';

type BalMsg = Translations['modEditorExt'];

function pushSuggestion(
  list: BalanceSuggestionItem[],
  category: BalanceSuggestionCategory,
  text: string,
): void {
  list.push({ category, text });
}

export const ABILITY_THREAT: Record<string, number> = {
  stealth: 1.25,
  phase: 1.4,
  shield: 1.2,
  armored: 1.15,
  berserk: 1.1,
  healing: 1.3,
  spawning: 1.35,
  explode: 1.1,
  teleport: 1.2,
  flying: 1.15,
  jam: 1.25,
  escort: 1.28,
};

export function enemyThreatScore(enemy: CustomEnemyData): number {
  const mult = enemy.ability ? (ABILITY_THREAT[enemy.ability] ?? 1.05) : 1;
  return enemy.health * mult;
}

export function resolveEnemyThreat(type: string, enemies: CustomEnemyData[]): number {
  const custom = enemies.find((e) => e.id === type);
  if (custom) return enemyThreatScore(custom);

  const data = ENEMY_DATA[type as keyof typeof ENEMY_DATA];
  if (data) {
    const mult = data.ability ? (ABILITY_THREAT[data.ability] ?? 1.05) : 1;
    return data.health * mult;
  }
  return 50;
}

export interface WaveThreatPoint {
  setId: string;
  setName: string;
  waveIndex: number;
  label: string;
  threat: number;
  hasBoss: boolean;
}

export function computeWaveThreats(
  waves: CustomWaveData[],
  enemies: CustomEnemyData[],
): WaveThreatPoint[] {
  const points: WaveThreatPoint[] = [];

  waves.forEach((ws) => {
    ws.waves.forEach((wave, waveIdx) => {
      let threat = 0;
      let hasBoss = false;
      wave.enemies.forEach((eg) => {
        const hp = resolveEnemyThreat(eg.type, enemies);
        threat += hp * eg.count;
        if (eg.type === 'boss' || eg.type === 'miniboss') hasBoss = true;
      });
      points.push({
        setId: ws.id,
        setName: ws.name,
        waveIndex: waveIdx,
        label: waves.length > 1 ? `${ws.name.slice(0, 4)} W${waveIdx + 1}` : `W${waveIdx + 1}`,
        threat,
        hasBoss,
      });
    });
  });

  return points;
}

export function analyzeModBalance(
  towers: CustomTowerData[],
  enemies: CustomEnemyData[],
  waves: CustomWaveData[],
  m: BalMsg,
) {
  const totalDps = towers.reduce((s, t) => s + calculateDPS(t), 0);
  const avgCost = towers.length
    ? towers.reduce((s, t) => s + t.cost, 0) / towers.length
    : 100;

  const waveThreats = computeWaveThreats(waves, enemies);
  const waveHp = waveThreats.reduce((s, p) => s + p.threat, 0);

  const enemyListHp = enemies.reduce((s, e) => s + enemyThreatScore(e), 0);
  const totalThreat = Math.max(waveHp, enemyListHp);

  const dpsPer100Gold = totalDps / Math.max(avgCost, 1) * 100;
  const killSeconds = totalThreat > 0 && totalDps > 0 ? totalThreat / totalDps : null;

  let score = 50;
  const categorizedSuggestions: BalanceSuggestionItem[] = [];

  if (towers.length === 0 && totalThreat > 0) {
    score = 15;
    pushSuggestion(categorizedSuggestions, 'difficulty', m.balSuggestNoTowers);
  } else if (totalThreat === 0 && towers.length > 0) {
    score = 70;
    pushSuggestion(categorizedSuggestions, 'general', m.balSuggestTowersReady);
  } else if (killSeconds !== null) {
    if (killSeconds < 10) {
      score = 82;
      pushSuggestion(categorizedSuggestions, 'difficulty', m.balSuggestTooEasy);
    } else if (killSeconds < 25) {
      score = 70;
      pushSuggestion(categorizedSuggestions, 'difficulty', m.balSuggestBalanced);
    } else if (killSeconds < 50) {
      score = 45;
      pushSuggestion(categorizedSuggestions, 'difficulty', m.balSuggestTooHard);
    } else {
      score = 22;
      pushSuggestion(categorizedSuggestions, 'difficulty', m.balSuggestVeryHard);
    }
  }

  if (waveThreats.length >= 3) {
    const peak = Math.max(...waveThreats.map((p) => p.threat));
    const avg = waveHp / waveThreats.length;
    if (peak > avg * 2.0) {
      const peakPt = waveThreats.find((p) => p.threat === peak);
      pushSuggestion(
        categorizedSuggestions,
        'waves',
        fillTemplate(m.balSuggestPeakWave, {
          label: peakPt?.label ?? 'W?',
          peak: peak.toFixed(0),
        }),
      );
    }
  }

  if (dpsPer100Gold > 0.42) {
    pushSuggestion(categorizedSuggestions, 'economy', m.balSuggestHighEff);
  } else if (dpsPer100Gold < 0.15 && towers.length > 0) {
    pushSuggestion(categorizedSuggestions, 'economy', m.balSuggestLowEff);
  }

  const bossWaves = waves.flatMap((ws) => ws.waves).filter((w) =>
    w.enemies.some((e) => e.type === 'boss' || e.type === 'miniboss'),
  ).length;
  if (bossWaves > 2) {
    pushSuggestion(
      categorizedSuggestions,
      'waves',
      fillTemplate(m.balSuggestManyBoss, { count: String(bossWaves) }),
    );
  }

  if (enemies.some((e) => e.ability === 'phase') && !towers.some((t) => t.splash || t.poisonEffect)) {
    pushSuggestion(categorizedSuggestions, 'counters', m.balSuggestPhaseNoAoe);
  }

  score = Math.max(0, Math.min(100, score));

  const waveCount = waves.reduce((s, ws) => s + ws.waves.length, 0);
  const suggestions = [...new Set(categorizedSuggestions.map((i) => i.text))];

  return {
    score,
    totalDps,
    totalThreat,
    killSeconds,
    waveThreats,
    dpsPer100Gold,
    towerCount: towers.length,
    enemyCount: enemies.length,
    waveCount,
    bossWaves,
    categorizedSuggestions,
    suggestions,
  };
}
