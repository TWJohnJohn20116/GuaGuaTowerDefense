import { describe, expect, it } from 'vitest';
import { drawField } from '@/components/game/PathRenderer';
import { getBoardColors } from '@/utils/themeBoard';
import type { PathConfig } from '@/types/game';

const MAP: PathConfig = {
  name: 'test',
  description: '',
  difficulty: 'normal',
  waypoints: [{ col: 0, row: 1 }, { col: 4, row: 1 }],
};

/** 記錄所有 stroke 的顏色：自由制沒有格子可數，改看「路徑帶有沒有被描出來」 */
function recordStrokes() {
  const strokes: string[] = [];
  const ctx = {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    lineJoin: '',
    lineCap: '',
    globalAlpha: 1,
    beginPath() {},
    moveTo() {},
    lineTo() {},
    arc() {},
    closePath() {},
    fill() {},
    fillRect() {},
    stroke() {
      strokes.push(String(this.strokeStyle));
    },
    setLineDash() {},
  };
  return { ctx: ctx as unknown as CanvasRenderingContext2D, strokes };
}

describe('show enemy path setting', () => {
  const board = getBoardColors();

  it('paints the path band when the setting is on', () => {
    const { ctx, strokes } = recordStrokes();
    drawField(ctx, MAP, 20, 0, 0, { showPath: true, showTerrain: false, showEndpoints: false });
    expect(strokes).toContain(board.path);
  });

  it('skips the path band when the setting is off', () => {
    const { ctx, strokes } = recordStrokes();
    drawField(ctx, MAP, 20, 0, 0, { showPath: false, showTerrain: false, showEndpoints: false });
    expect(strokes).not.toContain(board.path);
  });
});
