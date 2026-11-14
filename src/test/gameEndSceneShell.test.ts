import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('game end SceneShell return', () => {
  it('GameOver returns a danger SceneShell after the Enter hotkey effect', () => {
    const src = readFileSync(resolve(__dirname, '../components/scenes/GameOver.tsx'), 'utf8');
    expect(src).toMatch(/\}, \[resetGame, startGame, setScene\]\);\s*return \(/);
    expect(src).toMatch(/<SceneShell accent="danger"/);
  });

  it('Victory returns a success SceneShell after the Enter hotkey effect', () => {
    const src = readFileSync(resolve(__dirname, '../components/scenes/Victory.tsx'), 'utf8');
    expect(src).toMatch(
      /\}, \[canContinueCampaign, nextLevelId, nextLevelData, gameDifficulty, resetGame, startGame, setScene\]\);\s*return \(/,
    );
    expect(src).toMatch(/<SceneShell accent="success"/);
  });
});
