import { describe, expect, it } from 'vitest';
import { renderDynamicLayer } from '@/components/scenes/game-scene/GameCanvasDynamic';
import { createRenderSnapshot } from '@/data/renderSnapshot';
import { NORDIC_DARK } from '@/components/game/towerModels/nordicShared';
import type { Tower } from '@/types/game';

function stubCtx() {
  const fills: string[] = [];
  const ctx: Record<string, unknown> = {
    fillStyle: '#000',
    strokeStyle: '#000',
    lineWidth: 1,
    globalAlpha: 1,
    font: '',
    textAlign: 'left',
    textBaseline: 'alphabetic',
    shadowBlur: 0,
    shadowColor: '',
    lineCap: 'butt',
    lineJoin: 'miter',
    lineDashOffset: 0,
    canvas: { width: 400, height: 300 },
  };
  const proxy = new Proxy(ctx, {
    get(target, prop) {
      if (typeof prop === 'string' && prop in target) return (target as Record<string, unknown>)[prop];
      if (prop === 'measureText') return () => ({ width: 12 });
      if (prop === 'createRadialGradient' || prop === 'createLinearGradient') {
        return () => ({ addColorStop() {} });
      }
      if (prop === 'fill') {
        return () => {
          fills.push(String(target.fillStyle));
        };
      }
      if (prop === 'fillRect') {
        return () => {
          fills.push(String(target.fillStyle));
        };
      }
      return () => {};
    },
    set(target, prop, value) {
      target[prop as string] = value;
      return true;
    },
  });
  return { ctx: proxy as unknown as CanvasRenderingContext2D, fills };
}

function basicTower(): Tower {
  return {
    id: 't1',
    type: 'basic',
    gridPos: { col: 4, row: 5 },
    x: 4,
    y: 5,
    level: 1,
    upgradePath: null,
    rotation: 0,
    target: null,
    lastFireTime: 0,
    kills: 0,
    totalDamage: 50,
    targetPriority: 'first',
    health: 100,
    maxHealth: 100,
  };
}

const emptyLayer = {
  snapshot: createRenderSnapshot(),
  upgradeAnimations: [],
  sellAnimations: [],
  fusionAnimations: [],
  playerSkillAnimations: [],
  enemies: [],
  projectiles: [],
  damageTexts: [],
  impactParticles: [],
  deathAnimations: [],
  tileSize: 40,
  offsetX: 20,
  offsetY: 20,
  getSkinVisuals: () => null,
  getSkinModelSet: () => undefined,
  showDebugInfo: false,
  showHitboxes: false,
  showHealthBars: false,
};

describe('2D dynamic layer tower drawing', () => {
  it('finishes a frame with a basic tower instead of crashing before drawTowers', () => {
    const { ctx, fills } = stubCtx();
    expect(() =>
      renderDynamicLayer(ctx, 400, 300, {
        ...emptyLayer,
        towers: [basicTower()],
      }),
    ).not.toThrow();
    expect(fills).toContain(NORDIC_DARK);
  });
});
