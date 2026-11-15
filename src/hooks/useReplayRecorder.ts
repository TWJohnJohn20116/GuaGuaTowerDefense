// useReplayRecorder
// 監聽 gameStore 變化,在遊戲進行中以固定間隔記錄快照
// 在遊戲結束時(isVictory/isGameOver)自動儲存回放
//
// 快照間隔 333ms（每秒 3 張）：搭配播放端的相鄰快照插值，
// 回放可達顯示器幀率的流暢度；儲存體積由 replayStore 的大小保險控制。
import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useReplayStore } from '@/store/replayStore';
import { useStatsStore } from '@/store/statsStore';

// 快照間隔 (ms)
const SNAPSHOT_INTERVAL = 333;
// 每快照實體數上限（控制單一快照體積）
const MAX_TOWERS_PER_SNAPSHOT = 60;
const MAX_ENEMIES_PER_SNAPSHOT = 40;
const MAX_PROJECTILES_PER_SNAPSHOT = 24;

export function useReplayRecorder() {
  const isPlaying = useGameStore((s) => s.isPlaying);
  const isPaused = useGameStore((s) => s.isPaused);
  const isVictory = useGameStore((s) => s.isVictory);
  const isGameOver = useGameStore((s) => s.isGameOver);
  
  const wasPlayingRef = useRef(false);
  const wasFinishedRef = useRef(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    // 臨時局（工坊試玩）不錄回放：整局內容在離開時丟棄
    if (useGameStore.getState().isPlaytest) return;
    const replayStore = useReplayStore.getState();
    
    // 開始遊戲時:啟動錄製
    if (isPlaying && !wasPlayingRef.current && !isVictory && !isGameOver) {
      const gameState = useGameStore.getState();
      replayStore.startRecording({
        mapId: gameState.selectedPath,
        difficulty: gameState.gameDifficulty,
        endlessMode: gameState.endlessMode,
        maxWaves: gameState.maxWaves,
        startPathName: gameState.lastStartArgs?.pathName,
        customWaveSetId: gameState.lastStartArgs?.customWaveSetId ?? gameState.customWaveSetId,
        customModifiers: gameState.lastStartArgs?.customModifiers,
      });
      wasPlayingRef.current = true;
      wasFinishedRef.current = false;
    }
    
    // 遊戲結束時:自動儲存
    if (wasPlayingRef.current && (isVictory || isGameOver) && !wasFinishedRef.current) {
      const gameState = useGameStore.getState();
      replayStore.stopRecording({
        isVictory,
        finalWave: gameState.currentWave,
        finalScore: gameState.score,
      });
      wasFinishedRef.current = true;
      wasPlayingRef.current = false;
    }
    
    // 重置時清除
    if (!isPlaying && wasPlayingRef.current && !wasFinishedRef.current) {
      replayStore.cancelRecording();
      wasPlayingRef.current = false;
    }
  }, [isPlaying, isVictory, isGameOver]);

  // 以 SNAPSHOT_INTERVAL 紀錄快照(遊戲進行中且未暫停)
  useEffect(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (isPlaying && !isPaused && !isVictory && !isGameOver) {
      intervalRef.current = window.setInterval(() => {
        const gs = useGameStore.getState();
        const stats = useStatsStore.getState().currentGame;
        // 簡化資料:塔/敵/彈 - 全用網格座標(col/row)
        const towers = gs.towers.slice(0, MAX_TOWERS_PER_SNAPSHOT).map((t) => ({
          id: t.id,
          type: String(t.type),
          x: t.gridPos.col + 0.5,         // 塔中心位於格子中央
          y: t.gridPos.row + 0.5,
          level: t.level,
          rotation: Math.round(t.rotation * 100) / 100,
        }));
        const enemies = gs.enemies.slice(0, MAX_ENEMIES_PER_SNAPSHOT).map((e) => ({
          id: e.id,
          type: String(e.type),
          x: Math.round(e.x * 100) / 100,  // 網格座標(精度2小數)
          y: Math.round(e.y * 100) / 100,
          hp: Math.round(Math.max(0, Math.min(1, e.health / e.maxHealth)) * 100) / 100,
          size: e.size,
        }));
        const projectiles = gs.projectiles.slice(0, MAX_PROJECTILES_PER_SNAPSHOT).map((p) => ({
          x: Math.round(p.x * 100) / 100,
          y: Math.round(p.y * 100) / 100,
          color: p.color,
          size: p.size,
        }));
        useReplayStore.getState().recordSnapshot({
          money: gs.money,
          health: gs.health,
          score: gs.score,
          currentWave: gs.currentWave,
          waveActive: gs.waveActive,
          enemyCount: gs.enemies.length,
          towerCount: gs.towers.length,
          projectileCount: gs.projectiles.length,
          totalDamage: stats?.totalDamageDealt ?? 0,
          totalKills: stats?.totalEnemiesKilled ?? 0,
          towers,
          enemies,
          projectiles,
        });
      }, SNAPSHOT_INTERVAL);
    }
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, isPaused, isVictory, isGameOver]);
}
