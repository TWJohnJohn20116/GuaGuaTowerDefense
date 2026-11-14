import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { fusionBurstText } from '@/data/fusionBurstLabel';
import { zhTW } from '@/i18n/locales/zh-TW';

describe('fusion burst copy', () => {
  it('uses Traditional Chinese without the English FUSION stamp', () => {
    expect(fusionBurstText(zhTW.towers.fusion.burst)).toBe('融合');
    expect(fusionBurstText('')).toBe('融合');
    expect(fusionBurstText(zhTW.towers.fusion.burst)).not.toMatch(/FUSION|⚛/i);
  });

  it('does not paint English FUSION or emoji on the canvas burst', () => {
    const src = readFileSync(
      resolve(__dirname, '../components/scenes/game-scene/GameCanvasFusionFx.ts'),
      'utf8',
    );
    expect(src).toMatch(/fusionBurstText/);
    expect(src).not.toMatch(/⚛ FUSION/);
  });

  it('uses the translated cancel label on the fusion mode banner', () => {
    const src = readFileSync(
      resolve(__dirname, '../components/game/FusionModeBanner.tsx'),
      'utf8',
    );
    expect(src).toMatch(/t\.towers\.fusion\.cancel/);
    expect(src).not.toMatch(/>\s*取消\s*</);
  });
});
