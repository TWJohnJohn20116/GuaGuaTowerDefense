import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { resolveFusionCanvasClick } from '@/data/fusionCanvasClick';
import { resolveFusionModeHint } from '@/data/fusionModeHint';

describe('fusion canvas click', () => {
  it('fuses when the second tower is a different tower', () => {
    expect(resolveFusionCanvasClick({
      fusionMode: true,
      fusionSourceId: 'a',
      clickedTowerId: 'b',
    })).toEqual({ kind: 'fuse', sourceId: 'a', targetId: 'b' });
  });

  it('cancels when clicking empty ground during fusion', () => {
    expect(resolveFusionCanvasClick({
      fusionMode: true,
      fusionSourceId: 'a',
      clickedTowerId: null,
    })).toEqual({ kind: 'cancel' });
  });

  it('ignores clicks outside fusion mode, including selecting a tower', () => {
    expect(resolveFusionCanvasClick({
      fusionMode: false,
      fusionSourceId: null,
      clickedTowerId: 'b',
    })).toEqual({ kind: 'none' });
  });

  it('ignores clicking the source tower so fusion stays armed', () => {
    expect(resolveFusionCanvasClick({
      fusionMode: true,
      fusionSourceId: 'a',
      clickedTowerId: 'a',
    })).toEqual({ kind: 'none' });
  });
});

describe('fusion mode hint', () => {
  it('shows need-funds copy when the last attempt could not pay', () => {
    expect(resolveFusionModeHint({
      fundsShort: 120,
      modeHint: '選擇第二座塔進行合體',
      needFunds: '需要資金: ${cost}',
    })).toBe('需要資金: $120');
  });

  it('keeps the pick-partner hint when funds are not the problem', () => {
    expect(resolveFusionModeHint({
      fundsShort: null,
      modeHint: '選擇第二座塔進行合體',
      needFunds: '需要資金: ${cost}',
    })).toBe('選擇第二座塔進行合體');
  });
});

describe('fusion click wiring', () => {
  it('uses the shared click resolver on the 2D canvas and 3D interaction', () => {
    const canvas = readFileSync(
      resolve(__dirname, '../components/scenes/game-scene/GameCanvas.tsx'),
      'utf8',
    );
    const interaction = readFileSync(
      resolve(__dirname, '../components/scenes/game-scene/three/interaction3d.ts'),
      'utf8',
    );
    expect(canvas).toMatch(/resolveFusionCanvasClick/);
    expect(interaction).toMatch(/resolveFusionCanvasClick/);
    expect(interaction).toMatch(/fuseTowers/);
    expect(interaction).toMatch(/cancelFusion/);
  });

  it('shows the fusion banner in 3D and reads the funds-short hint', () => {
    const scene = readFileSync(
      resolve(__dirname, '../components/scenes/GameScene.tsx'),
      'utf8',
    );
    const banner = readFileSync(
      resolve(__dirname, '../components/game/FusionModeBanner.tsx'),
      'utf8',
    );
    const actions = readFileSync(
      resolve(__dirname, '../store/gameStoreActions.ts'),
      'utf8',
    );
    expect(scene).toMatch(/FusionModeBanner/);
    expect(banner).toMatch(/resolveFusionModeHint/);
    expect(banner).toMatch(/fusionFundsShort/);
    expect(actions).toMatch(/fusionFundsShort: fusionCost/);
    expect(actions).toMatch(/fusionFundsShort: null/);
  });
});
