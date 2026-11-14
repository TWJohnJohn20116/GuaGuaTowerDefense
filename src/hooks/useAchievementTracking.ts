/**
 * 成就追蹤 Hook
 * Achievement Tracking Hook
 * 
 * 這個 Hook 用於在遊戲組件中追蹤成就進度
 */

import { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useAchievementStore } from '@/store/achievementStore';
import { GAME_CONSTANTS } from '@/data/gameData';
import type { PlaystyleGameEndContext } from '@/types/playstyleIsm';

/**
 * 追蹤遊戲事件並更新成就進度
 */
export function useAchievementTracking() {
  const {
    isPlaying,
    isGameOver,
    isVictory,
    currentWave,
    score,
    health,
    selectedPath,
    gameDifficulty,
    enemies,
    towers,
    endlessMode,
    waveActive,
    money,
    maxWaves,
    gameSpeed,
    campaignLevelId,
    customWaveSetId,
  } = useGameStore();

  const {
    onGameStart,
    onGameEnd,
    onWaveComplete,
    checkAchievements,
  } = useAchievementStore();

  // 追蹤上一個狀態
  const prevState = useRef({
    isPlaying: false,
    isGameOver: false,
    isVictory: false,
    currentWave: 0,
    enemyCount: 0,
    towerCount: 0,
    waveActive: false,
    health: 100,
  });

  // 波次開始時的生命值
  const waveStartHealth = useRef(100);

  // 遊戲開始
  useEffect(() => {
    if (isPlaying && !prevState.current.isPlaying) {
      onGameStart(money);
      waveStartHealth.current = health;
    }
    prevState.current.isPlaying = isPlaying;
  }, [isPlaying, onGameStart, health, money]);

  // 遊戲結束
  useEffect(() => {
    if ((isGameOver || isVictory) && !prevState.current.isGameOver && !prevState.current.isVictory) {
      const towersPlaced = towers.length;
      const towersUpgraded = towers.filter(t => t.level > 1).length;
      const maxLevel = GAME_CONSTANTS.MAX_TOWER_LEVEL;
      const maxLevelTowerCount = towers.filter((t) => t.level >= maxLevel).length;
      const soloMaxLevelRestLv1 =
        towers.length >= 2 &&
        maxLevelTowerCount === 1 &&
        towers.every((t) => t.level >= maxLevel || t.level === 1);
      const playstyleContext: PlaystyleGameEndContext = {
        maxWaves,
        gameSpeed,
        finalMoney: money,
        allTowersMaxLevel: towersPlaced > 0 && towers.every(t => t.level >= maxLevel),
        allTowersLevel1: towersPlaced === 0 || towers.every(t => t.level <= 1),
        maxTowerLevel: towers.reduce((m, t) => Math.max(m, t.level), 1),
        maxLevelTowerCount,
        soloMaxLevelRestLv1,
      };

      onGameEnd(
        isVictory,
        score,
        currentWave,
        health,
        selectedPath,
        gameDifficulty,
        towersPlaced,
        towersUpgraded,
        endlessMode,
        playstyleContext,
        campaignLevelId,
        customWaveSetId,
      );
    }
    prevState.current.isGameOver = isGameOver;
    prevState.current.isVictory = isVictory;
  }, [isGameOver, isVictory, score, currentWave, health, selectedPath, gameDifficulty, towers, endlessMode, onGameEnd, maxWaves, gameSpeed, money, campaignLevelId, customWaveSetId]);

  // 波次完成追蹤
  useEffect(() => {
    // 波次從活躍變為非活躍，且敵人數為 0
    if (prevState.current.waveActive && !waveActive && enemies.length === 0 && isPlaying) {
      const damageTaken = waveStartHealth.current - health;
      onWaveComplete(currentWave, Math.max(0, damageTaken));
      waveStartHealth.current = health;
    }
    prevState.current.waveActive = waveActive;
    prevState.current.health = health;
  }, [waveActive, enemies.length, currentWave, health, isPlaying, onWaveComplete]);

  // 波次開始時記錄生命值
  useEffect(() => {
    if (waveActive && !prevState.current.waveActive) {
      waveStartHealth.current = health;
    }
  }, [waveActive, health]);

  return { checkAchievements };
}
