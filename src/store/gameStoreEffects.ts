import type { GameStore } from './gameStoreTypes';
import type { Enemy, DeathShard } from '@/types/game';
import { ENEMY_DATA } from '@/data/gameData';
import { getEnemyVisuals } from './gameStoreUtils';

type GetState = () => GameStore;
type SetState = (partial: Partial<GameStore> | ((state: GameStore) => Partial<GameStore>)) => void;

const generateId = () => Math.random().toString(36).substring(2, 9);

// 死亡動畫時長（碎片飛行 + 落地停留）
const DEATH_DURATION_BOSS = 1100;
const DEATH_DURATION_ELITE = 850;
const DEATH_DURATION_NORMAL = 700;

/**
 * 將 #rrggbb 顏色加上明暗偏移：
 * - `percent > 0` 朝白色內插（變亮）
 * - `percent < 0` 朝黑色內插（變暗）
 *
 * 用來讓每個碎片有不同的明暗差，看起來像「光照打在碎片表面」。
 */
const shadeColor = (hex: string, percent: number): string => {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return hex;

  const lerp = (c: number) => {
    if (percent >= 0) return Math.round(c + (255 - c) * percent);
    return Math.round(c * (1 + percent));
  };
  const toHex = (n: number) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0');
  return `#${toHex(lerp(r))}${toHex(lerp(g))}${toHex(lerp(b))}`;
};

/**
 * 為一個敵人生成碎片陣列。
 * 每片是圓形模型上等分的扇區三角形，朝該扇區方向噴出，並帶
 * 重力、角速度與輕微隨機性，營造「真的被打碎」的物理感。
 */
const buildDeathShards = (
  isBoss: boolean,
  isElite: boolean,
  baseColor: string,
): DeathShard[] => {
  const count = isBoss ? 12 : isElite ? 8 : 6;
  const speedBase = isBoss ? 130 : isElite ? 110 : 90;
  const speedJitter = isBoss ? 60 : 45;
  const upwardBoost = isBoss ? 90 : isElite ? 70 : 60;
  const gravity = isBoss ? 320 : isElite ? 260 : 220;
  const rotMax = isBoss ? Math.PI * 2.4 : Math.PI * 1.8;

  const shards: DeathShard[] = [];
  const segment = (Math.PI * 2) / count;
  for (let i = 0; i < count; i++) {
    const angleStart = i * segment;
    const angleEnd = angleStart + segment;
    const dirAngle = angleStart + segment / 2;

    const speed = speedBase + (Math.random() - 0.3) * speedJitter;
    const vx = Math.cos(dirAngle) * speed;
    // 加上向上初速，模擬「被擊飛」
    const vy = Math.sin(dirAngle) * speed - upwardBoost * (0.5 + Math.random() * 0.6);

    const vRot = (Math.random() - 0.5) * 2 * rotMax;
    const rotation = (Math.random() - 0.5) * 0.6;
    const sizeMul = 0.85 + Math.random() * 0.3;

    // 明暗偏移：-25% ~ +20%，避免兩端極端
    const shade = (Math.random() - 0.55) * 0.45;
    const color = shadeColor(baseColor, shade);
    const strokeColor = shadeColor(baseColor, -0.55);

    shards.push({
      angleStart,
      angleEnd,
      vx,
      vy,
      vRot,
      rotation,
      gravity,
      sizeMul,
      color,
      strokeColor,
    });
  }
  return shards;
};

/**
 * 模組層級緩衝區
 *
 * Game loop 每幀會大量呼叫 addDamageText / addImpactParticles / addDeathAnimation /
 * addShake，原先每次 add 都會 set state，導致一幀內可能觸發 50+ 次 store 通知。
 *
 * 這裡改為 push 到 buffer，updateVisualEffects（每幀調用一次）統一 flush，
 * 將「N 次 set」降為「1 次 set」，大幅降低 store 通知與 React reconciler 工作量。
 */
const damageTextsBuffer: any[] = [];
const particlesBuffer: any[] = [];
const deathAnimsBuffer: any[] = [];
let shakeBuffer = 0;

export const createEffectActions = (get: GetState, set: SetState) => ({
  addDamageText: (x: number, y: number, value: number, isCrit = false, color = '#ffffff') => {
    damageTextsBuffer.push({
      id: generateId(),
      x: x + (Math.random() - 0.5) * 0.4,
      y: y - 0.2,
      value: Math.floor(value),
      color: isCrit ? '#ff3333' : color,
      isCrit,
      startTime: Date.now(),
      duration: 800,
    });
  },

  // 狀態文字（如「免疫」「傳送」）：以 prefix 呈現純文字，不顯示數值
  addStatusText: (x: number, y: number, text: string, color = '#93c5fd') => {
    damageTextsBuffer.push({
      id: generateId(),
      x: x + (Math.random() - 0.5) * 0.3,
      y: y - 0.3,
      value: '',
      prefix: text,
      color,
      startTime: Date.now(),
      duration: 700,
    });
  },

  addMoneyText: (x: number, y: number, amount: number, isGain = true) => {
    if (amount === 0) return;
    const abs = Math.floor(Math.abs(amount));
    damageTextsBuffer.push({
      id: generateId(),
      x: x + (Math.random() - 0.5) * 0.3,
      y: y - 0.4,
      value: abs,
      color: isGain ? '#fbbf24' : '#f87171',
      prefix: isGain ? '+$' : '-$',
      isMoney: true,
      startTime: Date.now(),
      duration: 1100,
    });
  },

  addImpactParticles: (x: number, y: number, color: string, count = 6) => {
    const now = Date.now();
    for (let i = 0; i < count; i++) {
      particlesBuffer.push({
        id: generateId(),
        x,
        y,
        color,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        size: 2 + Math.random() * 3,
        alpha: 1,
        startTime: now,
        duration: 400 + Math.random() * 300,
      });
    }
  },

  addDeathAnimation: (enemy: Enemy) => {
    const enemyData = ENEMY_DATA[enemy.type];
    const visuals = getEnemyVisuals(enemy.type);
    const isBoss = enemy.type === 'boss' || enemy.type === 'miniboss';
    const isElite = enemy.type === 'elite' || enemy.type === 'berserker' || enemy.type === 'mage';
    const duration = isBoss ? DEATH_DURATION_BOSS : isElite ? DEATH_DURATION_ELITE : DEATH_DURATION_NORMAL;
    const baseColor = enemyData?.color || '#ef4444';

    deathAnimsBuffer.push({
      id: generateId(),
      x: enemy.x,
      y: enemy.y,
      enemyType: enemy.type,
      modelType: visuals.modelType,
      color: baseColor,
      size: enemy.size,
      glowColor: visuals.glowColor,
      glowIntensity: visuals.glowIntensity,
      isBoss,
      isElite,
      startTime: Date.now(),
      duration,
      shards: buildDeathShards(isBoss, isElite, baseColor),
      splashSeed: Math.random(),
    });
  },

  addShake: (intensity: number) => {
    shakeBuffer += intensity;
  },

  updateVisualEffects: (deltaTime: number) => {
    const { damageTexts, impactParticles, deathAnimations, shakeIntensity } = get();
    const now = Date.now();

    // 1. 計算下一幀震動強度（含累積的 shakeBuffer）
    let nextShake = shakeIntensity + shakeBuffer;
    shakeBuffer = 0;
    if (nextShake > 10) nextShake = 10;
    if (nextShake > 0.1) {
      nextShake = nextShake * Math.pow(0.9, deltaTime / 16);
    } else {
      nextShake = 0;
    }

    // 2. 傷害文字：filter + 漂浮 + 合併 buffer
    const hasNewTexts = damageTextsBuffer.length > 0;
    const updatedTexts: any[] = [];
    for (let i = 0; i < damageTexts.length; i++) {
      const t = damageTexts[i];
      if (now - t.startTime < t.duration) {
        updatedTexts.push({ ...t, y: t.y - 0.001 * deltaTime });
      }
    }
    if (hasNewTexts) {
      for (let i = 0; i < damageTextsBuffer.length; i++) {
        updatedTexts.push(damageTextsBuffer[i]);
      }
      damageTextsBuffer.length = 0;
    }

    // 3. 粒子：filter + 物理 + 合併 buffer
    const hasNewParticles = particlesBuffer.length > 0;
    const updatedParticles: any[] = [];
    for (let i = 0; i < impactParticles.length; i++) {
      const p = impactParticles[i];
      const pNow = now - p.startTime;
      if (pNow < p.duration) {
        const progress = pNow / p.duration;
        updatedParticles.push({
          ...p,
          x: p.x + p.vx * (deltaTime / 16),
          y: p.y + p.vy * (deltaTime / 16),
          alpha: 1 - progress,
        });
      }
    }
    if (hasNewParticles) {
      for (let i = 0; i < particlesBuffer.length; i++) {
        updatedParticles.push(particlesBuffer[i]);
      }
      particlesBuffer.length = 0;
    }

    // 4. 死亡動畫：filter + 合併 buffer
    const hasNewDeaths = deathAnimsBuffer.length > 0;
    const updatedDeathAnims: any[] = [];
    for (let i = 0; i < deathAnimations.length; i++) {
      const d = deathAnimations[i];
      if (now - d.startTime < d.duration) updatedDeathAnims.push(d);
    }
    if (hasNewDeaths) {
      for (let i = 0; i < deathAnimsBuffer.length; i++) {
        updatedDeathAnims.push(deathAnimsBuffer[i]);
      }
      deathAnimsBuffer.length = 0;
    }

    set({
      damageTexts: updatedTexts,
      impactParticles: updatedParticles,
      deathAnimations: updatedDeathAnims,
      shakeIntensity: nextShake,
    });
  },
});
