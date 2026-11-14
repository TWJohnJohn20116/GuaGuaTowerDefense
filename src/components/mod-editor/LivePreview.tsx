import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { CustomTowerData, CustomEnemyData, CustomMapData, CustomWaveData } from '@/types/game';
import {
  getThemeBg,
  getThemeText,
  drawTower,
  drawEnemy,
  drawProjectile,
} from '@/components/mod-editor/livePreviewDraw';
import { EyeIcon, PlayIcon, PauseIcon, RefreshIcon, CoinIcon } from '@/components/ui/Icons';
import { GAME_CONSTANTS } from '@/data/gameData';
import { fillTemplate } from '@/i18n/fileMetaExtraLabels';
import { useTranslation } from '@/i18n';
import { playBuild, playSfx, playEnemyHit, playEnemyDeath } from '@/services/audioService';
import {
  LIVE_PREVIEW_MAP_VIEWPORT,
  drawLivePreviewMap,
  buildPathScreenPoints,
  interpolateAlongPath,
  pickPreviewMap,
} from '@/components/mod-editor/livePreviewPathUtils';
import {
  getTowerCanvasPos,
  findNearestTargetInRange,
  getTowerCooldownTicks,
  drawTowerRangeRing,
  type BattleTarget,
} from '@/components/mod-editor/livePreviewCombat';
import {
  triggerTowerDeployFx,
  decayTowerDeployFx,
  getTowerFxScale,
  drawTowerDeployRing,
} from '@/components/mod-editor/livePreviewTowerFx';
import {
  type BattleInstance,
  type SpawnScheduleEntry,
  buildWaveSpawnSchedule,
  buildStaticInstances,
  getValidWaveSets,
  getNextWaveIndex,
  INTER_WAVE_DELAY_TICKS,
} from '@/components/mod-editor/livePreviewWaveSpawn';

interface LivePreviewProps {
  towers: CustomTowerData[];
  enemies: CustomEnemyData[];
  maps?: CustomMapData[];
  waves?: CustomWaveData[];
  selectedTowerIndex: number | null;
  selectedEnemyIndex: number | null;
  onSelectTower: (index: number | null) => void;
  onSelectEnemy: (index: number | null) => void;
}

export const LivePreview = ({
  towers,
  enemies,
  maps = [],
  waves = [],
  selectedTowerIndex,
  selectedEnemyIndex,
  onSelectTower,
  onSelectEnemy,
}: LivePreviewProps) => {
  const { t } = useTranslation();
  const m = t.modEditorExt;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [animFrame, setAnimFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [instances, setInstances] = useState<BattleInstance[]>([]);
  const [instanceHp, setInstanceHp] = useState<Record<number, number>>({});
  const [hitFlash, setHitFlash] = useState<Record<number, number>>({});
  const [killFlash, setKillFlash] = useState<Record<number, number>>({});
  const [respawnTimers, setRespawnTimers] = useState<Record<number, number>>({});
  const [instancePathProgress, setInstancePathProgress] = useState<Record<number, number>>({});
  const [towerLocks, setTowerLocks] = useState<Record<number, number>>({});
  const [mapIndex, setMapIndex] = useState(0);
  const [schedule, setSchedule] = useState<SpawnScheduleEntry[]>([]);
  const nextInstanceId = useRef(1000);
  const spawnTickRef = useRef(0);
  const scheduleIndexRef = useRef(0);
  const towerCooldownsRef = useRef<Record<number, number>>({});
  const instanceHpRef = useRef(instanceHp);
  const respawnTimersRef = useRef(respawnTimers);
  instanceHpRef.current = instanceHp;
  respawnTimersRef.current = respawnTimers;

  const validMaps = useMemo(
    () => maps.filter((map) => map.waypoints.length >= 2),
    [maps],
  );
  const activeMap = validMaps[mapIndex] ?? pickPreviewMap(maps);
  const pathPoints = useMemo(
    () => (activeMap ? buildPathScreenPoints(activeMap) : []),
    [activeMap],
  );
  const pathMode = pathPoints.length >= 2;
  const validWaveSets = useMemo(() => getValidWaveSets(waves), [waves]);
  const [waveSetIndex, setWaveSetIndex] = useState(0);
  const [currentWaveIndex, setCurrentWaveIndex] = useState(0);
  const [autoCycleWaves, setAutoCycleWaves] = useState(true);
  const waveSet = validWaveSets[waveSetIndex] ?? null;
  const waveMode = Boolean(waveSet && enemies.length > 0);
  const interWaveDelayRef = useRef(0);
  const currentWaveIndexRef = useRef(0);
  const autoCycleWavesRef = useRef(true);
  const waveRewardGrantedRef = useRef(false);
  const [earnedRewards, setEarnedRewards] = useState(0);
  const [lastWaveReward, setLastWaveReward] = useState(0);
  const [interWaveUi, setInterWaveUi] = useState(0);
  const [deployedTowers, setDeployedTowers] = useState<Set<number>>(new Set());
  const [moneyWarning, setMoneyWarning] = useState('');
  const [towerDeployFx, setTowerDeployFx] = useState<Record<number, { mode: 'deploy' | 'undeploy'; frames: number }>>({});
  const [towerMuzzleFx, setTowerMuzzleFx] = useState<Record<number, number>>({});
  const deployedCost = useMemo(
    () => towers.reduce((sum, tower, i) => sum + (deployedTowers.has(i) ? (tower.cost ?? 0) : 0), 0),
    [towers, deployedTowers],
  );
  const simBalance = GAME_CONSTANTS.INITIAL_MONEY + earnedRewards - deployedCost;
  currentWaveIndexRef.current = currentWaveIndex;
  autoCycleWavesRef.current = autoCycleWaves;

  const [projectiles, setProjectiles] = useState<{
    towerIndex: number;
    targetId: number;
    progress: number;
    targetX: number;
    targetY: number;
  }[]>([]);

  const initBattle = useCallback(() => {
    setInstanceHp({});
    setHitFlash({});
    setKillFlash({});
    setRespawnTimers({});
    setInstancePathProgress({});
    setTowerLocks({});
    setProjectiles([]);
    spawnTickRef.current = 0;
    scheduleIndexRef.current = 0;
    towerCooldownsRef.current = {};
    waveRewardGrantedRef.current = false;
    setEarnedRewards(0);
    setLastWaveReward(0);
    setInterWaveUi(0);
    setDeployedTowers(new Set());
    setMoneyWarning('');
    setTowerDeployFx({});
    setTowerMuzzleFx({});

    if (waveMode && waveSet) {
      setInstances([]);
      setSchedule(buildWaveSpawnSchedule(waveSet, currentWaveIndex, enemies));
      nextInstanceId.current = 1000;
      interWaveDelayRef.current = 0;
    } else {
      setInstances(buildStaticInstances(enemies));
      setSchedule([]);
      nextInstanceId.current = enemies.length;
    }
  }, [enemies, waveMode, waveSet, currentWaveIndex]);

  useEffect(() => {
    initBattle();
  }, [enemies, activeMap?.id, waveSet?.id, currentWaveIndex, waveSetIndex, initBattle]);

  useEffect(() => {
    if (waveSetIndex >= validWaveSets.length) setWaveSetIndex(0);
  }, [validWaveSets.length, waveSetIndex]);

  useEffect(() => {
    if (waveSet && currentWaveIndex >= waveSet.waves.length) {
      setCurrentWaveIndex(0);
    }
  }, [waveSet, currentWaveIndex]);

  useEffect(() => {
    if (mapIndex >= validMaps.length) setMapIndex(0);
  }, [validMaps.length, mapIndex]);

  const resolveInstancePos = useCallback((inst: BattleInstance): { x: number; y: number } | null => {
    const enemy = enemies[inst.templateIndex];
    if (!enemy) return null;
    const hp = instanceHp[inst.id] ?? enemy.health;
    if (hp <= 0 && !killFlash[inst.id]) return null;

    if (pathMode) {
      const progress = instancePathProgress[inst.id] ?? 0;
      return interpolateAlongPath(pathPoints, progress);
    }
    const cols = Math.ceil(Math.sqrt(Math.max(instances.length, 1))) || 2;
    const slot = instances.findIndex((i) => i.id === inst.id);
    return {
      x: 280 + (slot % cols) * 80,
      y: 80 + Math.floor(slot / cols) * 80,
    };
  }, [enemies, instanceHp, killFlash, pathMode, instancePathProgress, pathPoints, instances]);

  const getAliveTargets = useCallback((): BattleTarget[] => {
    const targets: BattleTarget[] = [];
    instances.forEach((inst) => {
      const enemy = enemies[inst.templateIndex];
      if (!enemy) return;
      const hp = instanceHpRef.current[inst.id] ?? enemy.health;
      if (hp <= 0 || (respawnTimersRef.current[inst.id] ?? 0) > 0) return;
      const pos = resolveInstancePos(inst);
      if (pos) targets.push({ instanceId: inst.id, x: pos.x, y: pos.y });
    });
    return targets;
  }, [instances, enemies, resolveInstancePos]);

  // 動畫循環
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimFrame((f) => f + 1);
      setTowerDeployFx((fx) => decayTowerDeployFx(fx));
      setTowerMuzzleFx((fx) => {
        const next: Record<number, number> = {};
        let changed = false;
        Object.entries(fx).forEach(([k, v]) => {
          if (v > 1) { next[Number(k)] = v - 1; changed = true; }
        });
        return changed ? next : fx;
      });
      spawnTickRef.current += 1;

      if (isPlaying && waveMode && waveSet && scheduleIndexRef.current >= schedule.length) {
        const hasAlive = instances.some((inst) => {
          const hp = instanceHpRef.current[inst.id] ?? enemies[inst.templateIndex]?.health ?? 0;
          return hp > 0 && !(respawnTimersRef.current[inst.id] ?? 0);
        });
        if (!hasAlive) {
          if (!waveRewardGrantedRef.current) {
            waveRewardGrantedRef.current = true;
            const reward = waveSet.waves[currentWaveIndexRef.current]?.reward ?? 0;
            if (reward > 0) {
              setEarnedRewards((r) => r + reward);
              setLastWaveReward(reward);
            }
          }
          const nextIdx = getNextWaveIndex(
            currentWaveIndexRef.current,
            waveSet.waves.length,
            autoCycleWavesRef.current,
          );
          if (nextIdx != null && nextIdx !== currentWaveIndexRef.current) {
            interWaveDelayRef.current += 1;
            setInterWaveUi(interWaveDelayRef.current);
            if (interWaveDelayRef.current >= INTER_WAVE_DELAY_TICKS) {
              interWaveDelayRef.current = 0;
              setInterWaveUi(0);
              waveRewardGrantedRef.current = false;
              setCurrentWaveIndex(nextIdx);
            }
          } else {
            setInterWaveUi(0);
          }
        } else {
          interWaveDelayRef.current = 0;
          setInterWaveUi(0);
        }
      }

      if (isPlaying && waveMode && scheduleIndexRef.current < schedule.length) {
        const entry = schedule[scheduleIndexRef.current];
        if (spawnTickRef.current >= entry.atTick) {
          const id = nextInstanceId.current++;
          setInstances((prev) => [...prev, { id, templateIndex: entry.templateIndex }]);
          setInstancePathProgress((p) => ({ ...p, [id]: 0 }));
          scheduleIndexRef.current += 1;
        }
      }

      if (isPlaying && pathMode) {
        setInstancePathProgress((prog) => {
          const next = { ...prog };
          let changed = false;
          instances.forEach((inst) => {
            const enemy = enemies[inst.templateIndex];
            if (!enemy) return;
            const hp = instanceHpRef.current[inst.id] ?? enemy.health;
            if (hp <= 0 || (respawnTimersRef.current[inst.id] ?? 0) > 0) return;
            const cur = next[inst.id] ?? 0;
            const step = (enemy.speed / 100) * 0.0035;
            next[inst.id] = cur + step >= 1 ? 0 : cur + step;
            changed = true;
          });
          return changed ? next : prog;
        });
      }

      if (isPlaying && towers.length > 0 && instances.length > 0) {
        const aliveTargets = getAliveTargets();
        const locks: Record<number, number> = {};

        towers.forEach((tower, towerIndex) => {
          if (!deployedTowers.has(towerIndex)) return;
          const cd = towerCooldownsRef.current[towerIndex] ?? 0;
          if (cd > 0) {
            towerCooldownsRef.current[towerIndex] = cd - 1;
            return;
          }
          const targetId = findNearestTargetInRange(towerIndex, tower, aliveTargets);
          if (targetId == null) return;

          locks[towerIndex] = targetId;
          const target = aliveTargets.find((t) => t.instanceId === targetId);
          if (!target) return;

          towerCooldownsRef.current[towerIndex] = getTowerCooldownTicks(tower);
          setTowerMuzzleFx((fx) => ({ ...fx, [towerIndex]: 6 }));
          playSfx('basic_shoot', { category: 'attack', volume: 0.65 });
          setProjectiles((prev) => [
            ...prev,
            {
              towerIndex,
              targetId,
              progress: 0,
              targetX: target.x,
              targetY: target.y,
            },
          ]);
        });
        setTowerLocks(locks);
      }

      setProjectiles((prev) => {
        const next: typeof prev = [];
        prev.forEach((p) => {
          const np = { ...p, progress: p.progress + 0.05 };
          if (np.progress >= 1) {
            if (isPlaying) {
              const inst = instances.find((i) => i.id === p.targetId);
              const enemy = inst ? enemies[inst.templateIndex] : null;
              const dmg = towers[p.towerIndex]?.damage ?? 10;
              const prevHp = instanceHpRef.current[p.targetId] ?? enemy?.health ?? 100;
              const nextHp = Math.max(0, prevHp - dmg);
              setInstanceHp((hp) => ({ ...hp, [p.targetId]: nextHp }));
              if (nextHp > 0) {
                setHitFlash((f) => ({ ...f, [p.targetId]: 8 }));
                playEnemyHit();
              } else if (prevHp > 0) {
                setKillFlash((f) => ({ ...f, [p.targetId]: 20 }));
                playEnemyDeath();
                if (!waveMode) {
                  setRespawnTimers((r) => ({ ...r, [p.targetId]: 50 }));
                }
              }
            }
          } else {
            next.push(np);
          }
        });
        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [
    towers.length, enemies.length, isPlaying, enemies, towers, pathMode,
    pathPoints, instances, waveMode, schedule, getAliveTargets, waveSet, currentWaveIndex, deployedTowers,
  ]);
  
  // 繪製
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 清除
    const bgColor = getThemeBg();
    const textColor = getThemeText();
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 繪製網格
    ctx.strokeStyle = textColor + '10';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    // 分隔線
    ctx.strokeStyle = textColor + '30';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 5]);
    ctx.beginPath();
    ctx.moveTo(220, 0);
    ctx.lineTo(220, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // 區域標籤
    ctx.font = '12px sans-serif';
    ctx.fillStyle = textColor + '60';
    ctx.textAlign = 'center';
    ctx.fillText(m.lpColTower, 110, 20);
    if (pathMode && activeMap) {
      drawLivePreviewMap(ctx, activeMap, LIVE_PREVIEW_MAP_VIEWPORT);
      ctx.fillText(activeMap.name.slice(0, 10), 350, 20);
    } else {
      ctx.fillText(m.lpColEnemy, 350, 20);
    }

    const fxLabels = {
      splash: m.lpFxSplash,
      slow: m.lpFxSlow,
      poison: m.lpFxPoison,
      chain: m.lpFxChain,
    };
    
    // 繪製塔（射程圈 + 模型）
    towers.forEach((tower, index) => {
      const { x, y } = getTowerCanvasPos(index);
      const isDeployed = deployedTowers.has(index);
      const isSelected = selectedTowerIndex === index;
      const hasLock = isDeployed && towerLocks[index] != null;

      const fx = towerDeployFx[index];
      const baseSize = isDeployed ? 25 : 22;
      const drawSize = fx ? baseSize * getTowerFxScale(fx.frames) : baseSize;

      if (fx) {
        drawTowerDeployRing(ctx, x, y, fx.frames, fx.mode);
      }
      const muzzle = towerMuzzleFx[index];
      if (muzzle && muzzle > 0 && isDeployed) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y - 8, 6 + muzzle * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${muzzle / 12})`;
        ctx.fill();
        ctx.restore();
      }

      if (isDeployed) {
        if (isPlaying) {
          drawTowerRangeRing(ctx, tower, x, y, { active: true, locked: hasLock });
        } else if (isSelected) {
          drawTowerRangeRing(ctx, tower, x, y, { active: true });
        }
        drawTower(ctx, tower, x, y, drawSize, isSelected, isSelected, animFrame * 0.05, fxLabels);
      } else {
        ctx.globalAlpha = 0.45;
        drawTower(ctx, tower, x, y, drawSize, false, false, animFrame * 0.05, fxLabels);
        ctx.globalAlpha = 1;
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = textColor + '40';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, 28, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.font = 'bold 8px sans-serif';
        ctx.fillStyle = '#fbbf24';
        ctx.textAlign = 'center';
        ctx.fillText(`$${tower.cost ?? 0}`, x, y - 34);
      }

      ctx.font = '10px sans-serif';
      ctx.fillStyle = isDeployed ? textColor : textColor + '80';
      ctx.textAlign = 'center';
      ctx.fillText(tower.name.slice(0, 6), x, y + 45);
    });

    // 繪製敵人實例
    instances.forEach((inst) => {
      const enemy = enemies[inst.templateIndex];
      if (!enemy) return;
      const hp = instanceHp[inst.id] ?? enemy.health;
      const isDead = hp <= 0;
      const waitingRespawn = isDead && (respawnTimers[inst.id] ?? 0) > 0 && !killFlash[inst.id];
      if (waitingRespawn) return;
      if (waveMode && isDead && !killFlash[inst.id]) return;

      const pos = resolveInstancePos(inst);
      if (!pos) return;
      const { x, y } = pos;
      const isSelected = selectedEnemyIndex === inst.templateIndex;
      const maxHp = enemy.health;
      const ratio = maxHp > 0 ? hp / maxHp : 0;
      const size = enemy.size * 1.2;

      if (hp > 0) {
        drawEnemy(ctx, enemy, x, y, isSelected, animFrame, true, m.lpAbilityTag);
      } else {
        ctx.globalAlpha = 0.35;
        drawEnemy(ctx, enemy, x, y, false, animFrame, true, m.lpAbilityTag);
        ctx.globalAlpha = 1;
      }

      const barW = 40;
      const barY = y - size - 14;
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(x - barW / 2, barY, barW, 5);
      ctx.fillStyle = ratio > 0.35 ? '#ef4444' : '#f59e0b';
      ctx.fillRect(x - barW / 2, barY, barW * ratio, 5);

      if (hitFlash[inst.id]) {
        ctx.beginPath();
        ctx.arc(x, y, size + 6, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,255,255,${hitFlash[inst.id] / 8})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      if (killFlash[inst.id]) {
        const kf = killFlash[inst.id];
        for (let i = 0; i < 8; i++) {
          const angle = (animFrame * 0.15 + i) * (Math.PI / 4);
          const r = (20 - kf) * 2.5;
          ctx.fillStyle = `rgba(251,191,36,${kf / 20})`;
          ctx.beginPath();
          ctx.arc(x + Math.cos(angle) * r, y + Math.sin(angle) * r, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.font = 'bold 9px sans-serif';
        ctx.fillStyle = `rgba(239,68,68,${kf / 20})`;
        ctx.textAlign = 'center';
        ctx.fillText(m.lpKillTag, x, y - size - 22);
      }
      
      // 名稱
      ctx.font = '10px sans-serif';
      ctx.fillStyle = textColor;
      ctx.textAlign = 'center';
      ctx.fillText(enemy.name.slice(0, 6), x, y + 40);
    });
    
    // 繪製投射物
    projectiles.forEach((proj) => {
      const tower = towers[proj.towerIndex];
      if (!tower) return;
      const { x: startX, y: startY } = getTowerCanvasPos(proj.towerIndex);
      drawProjectile(ctx, tower, startX, startY, proj.targetX, proj.targetY, proj.progress);
    });

    if (waveMode && instances.length === 0 && scheduleIndexRef.current < schedule.length) {
      ctx.font = '11px sans-serif';
      ctx.fillStyle = '#ffffff50';
      ctx.textAlign = 'center';
      ctx.fillText(m.lpWaitWaveSpawn, 350, canvas.height / 2);
    }

    // 空狀態提示
    if (towers.length === 0 && enemies.length === 0) {
      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#ffffff60';
      ctx.textAlign = 'center';
      ctx.fillText(m.lpEmptyHint, canvas.width / 2, canvas.height / 2);
    }
    
  }, [
    towers, enemies, instances, selectedTowerIndex, selectedEnemyIndex, animFrame,
    projectiles, instanceHp, hitFlash, killFlash, respawnTimers, instancePathProgress,
    pathMode, pathPoints, activeMap, towerLocks, isPlaying, waveMode, schedule,
    resolveInstancePos, deployedTowers, towerDeployFx, towerMuzzleFx, m,
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setHitFlash((f) => {
        const next: Record<number, number> = {};
        let changed = false;
        Object.entries(f).forEach(([k, v]) => {
          if (v > 1) { next[Number(k)] = v - 1; changed = true; }
        });
        return changed ? next : f;
      });
      setKillFlash((f) => {
        const next: Record<number, number> = {};
        const removeIds: number[] = [];
        let changed = false;
        Object.entries(f).forEach(([k, v]) => {
          const idx = Number(k);
          if (v > 1) {
            next[idx] = v - 1;
            changed = true;
          } else if (v === 1) {
            if (waveMode) removeIds.push(idx);
            changed = true;
          }
        });
        if (removeIds.length > 0) {
          setInstances((prev) => prev.filter((i) => !removeIds.includes(i.id)));
        }
        return changed ? next : f;
      });
      setRespawnTimers((r) => {
        const next: Record<number, number> = {};
        let changed = false;
        Object.entries(r).forEach(([k, v]) => {
          const idx = Number(k);
          if (v > 1) {
            next[idx] = v - 1;
            changed = true;
          } else if (v === 1) {
            setInstanceHp((hp) => {
              const n = { ...hp };
              delete n[idx];
              return n;
            });
            setInstancePathProgress((p) => ({ ...p, [idx]: 0 }));
            changed = true;
          }
        });
        return changed ? next : r;
      });
    }, 50);
    return () => clearInterval(timer);
  }, [waveMode]);
  
  // 點擊處理
  const undeployTowerAt = useCallback((index: number) => {
    if (!deployedTowers.has(index)) return false;
    setDeployedTowers((prev) => {
      const next = new Set(prev);
      next.delete(index);
      return next;
    });
    setTowerLocks((locks) => {
      const next = { ...locks };
      delete next[index];
      return next;
    });
    setTowerDeployFx((prev) => triggerTowerDeployFx(prev, index, 'undeploy'));
    playSfx('coin_collect', { category: 'build', volume: 0.5 });
    setMoneyWarning('');
    onSelectTower(null);
    onSelectEnemy(null);
    return true;
  }, [deployedTowers, onSelectTower, onSelectEnemy, playSfx]);

  const hitTestTower = (x: number, y: number) => {
    for (let i = 0; i < towers.length; i++) {
      const { x: tx, y: ty } = getTowerCanvasPos(i);
      if (Math.hypot(x - tx, y - ty) < 30) return i;
    }
    return null;
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const towerHit = hitTestTower(x, y);
    if (towerHit != null) {
      const i = towerHit;
      if (deployedTowers.has(i)) {
        if (e.shiftKey) {
          undeployTowerAt(i);
          return;
        }
        onSelectTower(selectedTowerIndex === i ? null : i);
        onSelectEnemy(null);
        return;
      }
      const cost = towers[i]?.cost ?? 0;
      if (simBalance < cost) {
        setMoneyWarning(fillTemplate(m.lpDeployInsufficient, {
          cost: String(cost),
          balance: String(simBalance),
        }));
        return;
      }
      setDeployedTowers((prev) => new Set([...prev, i]));
      setTowerDeployFx((prev) => triggerTowerDeployFx(prev, i, 'deploy'));
      playBuild();
      setMoneyWarning('');
      onSelectTower(i);
      onSelectEnemy(null);
      return;
    }
    
    // 檢查敵人
    for (const inst of instances) {
      const enemy = enemies[inst.templateIndex];
      if (!enemy) continue;
      const pos = resolveInstancePos(inst);
      if (!pos) continue;
      if (Math.hypot(x - pos.x, y - pos.y) < enemy.size * 1.5) {
        onSelectEnemy(selectedEnemyIndex === inst.templateIndex ? null : inst.templateIndex);
        onSelectTower(null);
        return;
      }
    }
    
    // 點擊空白區域取消選擇
    onSelectTower(null);
    onSelectEnemy(null);
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const towerHit = hitTestTower(x, y);
    if (towerHit != null) undeployTowerAt(towerHit);
  };
  
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-1.5">
          <EyeIcon className="h-3 w-3 text-[var(--arc-ink-3)]" />
          <span className="arc-label">{m.livePreview}</span>
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="flex items-center gap-1 border border-[rgba(255,182,39,0.38)] bg-[rgba(255,182,39,0.12)] px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.08em] text-[var(--arc-caution)]/90">
            <CoinIcon className="h-3 w-3" />
            {fillTemplate(m.lpBalance, { balance: String(simBalance) })}
          </span>
          {towers.length > 0 && (
            <span className=" arc-panel px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.08em] text-[var(--arc-ink-3)]">
              {fillTemplate(m.lpDeployedBadge, {
                deployed: String(deployedTowers.size),
                total: String(towers.length),
              })}
            </span>
          )}
          {moneyWarning && (
            <span className=" border border-[rgba(255,61,113,0.38)] bg-[rgba(255,61,113,0.12)] px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.08em] text-[var(--arc-alert)]">
              {moneyWarning}
            </span>
          )}
          {validWaveSets.length > 0 && (
            <>
              {validWaveSets.length > 1 && (
                <select
                  value={waveSetIndex}
                  onChange={(e) => {
                    setWaveSetIndex(Number(e.target.value));
                    setCurrentWaveIndex(0);
                  }}
                  className=" border-[3px] border-[var(--cn-line-soft)] bg-[var(--arc-void-2)] px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.08em] text-[var(--arc-ink-2)]"
                >
                  {validWaveSets.map((ws, i) => (
                    <option key={ws.id} value={i}>{ws.name}</option>
                  ))}
                </select>
              )}
              {waveSet && waveSet.waves.length > 1 && (
                <select
                  value={currentWaveIndex}
                  onChange={(e) => setCurrentWaveIndex(Number(e.target.value))}
                  className=" border border-[rgba(255,182,39,0.38)] bg-[rgba(255,182,39,0.12)] px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.08em] text-[var(--arc-caution)]/90"
                >
                  {waveSet.waves.map((_, i) => (
                    <option key={i} value={i}>
                      {fillTemplate(m.lpWaveProgress, { current: String(i + 1), total: String(waveSet.waves.length) })}
                    </option>
                  ))}
                </select>
              )}
              <button
                type="button"
                onClick={() => setAutoCycleWaves((v) => !v)}
                className={` border px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.08em] ${
                  autoCycleWaves
                    ? 'border-[rgba(255,182,39,0.38)] bg-[rgba(255,182,39,0.12)] text-[var(--arc-caution)]'
                    : 'border-[var(--cn-line-soft)] bg-[var(--arc-deck-2)] text-[var(--arc-ink-3)]'
                }`}
              >
                {autoCycleWaves ? m.lpToggleCycle : m.lpToggleSingle}
              </button>
            </>
          )}
          {validMaps.length > 1 && (
            <select
              value={mapIndex}
              onChange={(e) => setMapIndex(Number(e.target.value))}
              className=" border-[3px] border-[var(--cn-line-soft)] bg-[var(--arc-void-2)] px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.08em] text-[var(--arc-ink-2)]"
            >
              {validMaps.map((map, i) => (
                <option key={map.id} value={i}>{map.name}</option>
              ))}
            </select>
          )}
          <button
            type="button"
            onClick={initBattle}
            className="flex items-center gap-1 arc-panel px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.08em] text-[var(--arc-ink-3)] hover:text-[var(--arc-ink-2)]"
            title={m.lpResetTitle}
          >
            <RefreshIcon className="h-3 w-3" />
            {m.lpReset}
          </button>
          <button
            type="button"
            onClick={() => setIsPlaying((v) => !v)}
            className={`flex items-center gap-1 border px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.08em] ${
              isPlaying ? 'border-[rgba(111,140,255,0.38)] bg-[rgba(111,140,255,0.12)] text-[var(--arc-reach)]' : 'border-[var(--cn-line-soft)] bg-[var(--arc-deck-2)] text-[var(--arc-ink-3)]'
            }`}
          >
            {isPlaying ? <PauseIcon className="h-3 w-3" /> : <PlayIcon className="h-3 w-3" />}
            {isPlaying ? m.lpSimulating : m.lpPlayBtn}
          </button>
        </div>
      </div>
      {waveMode ? (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[9.5px] uppercase tracking-[0.08em] text-[var(--arc-caution)]/80">
          <span>
            {fillTemplate(m.lpWaveProgress, {
              current: String(currentWaveIndex + 1),
              total: String(waveSet?.waves.length ?? 0),
            })}
          </span>
          <span className="flex items-center gap-1 text-[var(--arc-caution)]/90">
            <CoinIcon className="h-3 w-3" />
            {fillTemplate(m.lpWaveRewardLine, { reward: String(waveSet?.waves[currentWaveIndex]?.reward ?? 0) })}
          </span>
          <span className="text-[var(--arc-ink-3)]">{fillTemplate(m.lpEarnedTotal, { total: String(earnedRewards) })}</span>
          {lastWaveReward > 0 && interWaveUi > 0 && (
            <span className="text-[var(--arc-reach)]/80">
              {fillTemplate(m.lpNextWaveIn, {
                seconds: String(Math.max(1, Math.ceil(((INTER_WAVE_DELAY_TICKS - interWaveUi) * 50) / 1000))),
              })}
            </span>
          )}
          {autoCycleWaves && <span>· {m.lpAutoCycle}</span>}
        </div>
      ) : pathMode ? (
        <p className="font-mono text-[9.5px] uppercase tracking-[0.08em] text-[var(--arc-reach)]/70">
          {m.lpPathModeHint}
        </p>
      ) : (
        <p className="font-mono text-[9.5px] uppercase tracking-[0.08em] text-[var(--arc-ink-4)]">
          {m.lpDeployHint}
          <span className="text-[var(--arc-ink-4)]"> · </span>
          {m.lpUndeployHint}
          <span className="text-[var(--arc-ink-4)]"> · </span>
          {m.lpCombatHint}
        </p>
      )}
      <motion.canvas
        ref={canvasRef}
        width={480}
        height={300}
        className="w-full cursor-pointer border-[3px] border-[var(--cn-line-soft)] bg-[var(--arc-void-2)]"
        style={{ imageRendering: 'pixelated' }}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      />
    </div>
  );
};
