import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('game end page nordic chrome', () => {
  it('Victory and GameOver drop particle fields and glass panels', () => {
    const victory = readFileSync(
      resolve(__dirname, '../components/scenes/Victory.tsx'),
      'utf8',
    );
    const gameOver = readFileSync(
      resolve(__dirname, '../components/scenes/GameOver.tsx'),
      'utf8',
    );
    expect(victory).not.toMatch(/backdrop-blur/);
    expect(victory).not.toMatch(/rounded-\[2rem\]/);
    expect(victory).not.toMatch(/Array\(22\)/);
    expect(victory).toMatch(/SCENE_GLASS/);
    expect(gameOver).not.toMatch(/backdrop-blur/);
    expect(gameOver).not.toMatch(/rounded-\[2rem\]/);
    expect(gameOver).not.toMatch(/Array\(18\)/);
    expect(gameOver).toMatch(/SCENE_GLASS/);
  });
});
