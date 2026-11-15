import { describe, expect, it } from 'vitest';
import { drawGrid } from '@/components/game/PathRenderer';
import { getBoardColors } from '@/utils/themeBoard';
import type { Tile } from '@/types/game';

function pathTile(row: number, col: number): Tile {
  return { type: 'path', row, col, towerId: null };
}

function emptyTile(row: number, col: number): Tile {
  return { type: 'empty', row, col, towerId: null };
}

function recordFills() {
  const fills: string[] = [];
  const ctx = {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    beginPath() {},
    roundRect() {},
    fill() {
      fills.push(String(this.fillStyle));
    },
    stroke() {},
    fillRect() {
      fills.push(String(this.fillStyle));
    },
    moveTo() {},
    lineTo() {},
    arc() {},
    closePath() {},
  };
  return { ctx: ctx as unknown as CanvasRenderingContext2D, fills };
}

describe('show enemy path setting', () => {
  const grid: Tile[][] = [
    [emptyTile(0, 0), pathTile(0, 1)],
  ];

  // 場地色跟著主題走，所以斷言比對「目前主題的場地色」而不是寫死色碼
  const board = getBoardColors();

  it('paints the path surface when the setting is on', () => {
    const { ctx, fills } = recordFills();
    drawGrid(ctx, grid, 20, 0, 0, true);
    expect(fills).toContain(board.path);
  });

  it('skips the path surface when the setting is off', () => {
    const { ctx, fills } = recordFills();
    drawGrid(ctx, grid, 20, 0, 0, false);
    expect(fills).not.toContain(board.path);
    expect(fills).toContain(board.tile);
  });
});
