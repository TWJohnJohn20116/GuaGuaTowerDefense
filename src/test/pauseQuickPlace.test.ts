import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('pause settings quick place', () => {
  it('exposes the same persist toggle as the settings controls tab', () => {
    const src = readFileSync(
      resolve(__dirname, '../components/ui/pause/PauseSettingsPanel.tsx'),
      'utf8',
    );
    expect(src).toMatch(/quickPlaceDefault/);
    expect(src).toMatch(/toggleGameplay\('quickPlaceDefault'\)/);
    expect(src).toMatch(/s\.quickPlace/);
  });
});
