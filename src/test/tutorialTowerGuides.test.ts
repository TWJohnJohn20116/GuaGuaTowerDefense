import { describe, it, expect } from 'vitest';
import { TOWER_GUIDES_META, buildTowerGuides } from '@/components/scenes/tutorial/TutorialPageData';
import { zhTW } from '@/i18n/locales/zh-TW';
import type { Translations } from '@/i18n';

const MISSING_CORE_TOWERS = ['shotgun', 'ballista', 'wind', 'pulse'] as const;

describe('tutorial tower guides roster', () => {
  it('covers shotgun, ballista, wind and pulse that already exist in battle', () => {
    const ids = TOWER_GUIDES_META.map((entry) => entry.id);
    for (const id of MISSING_CORE_TOWERS) {
      expect(ids).toContain(id);
    }
  });

  it('has Traditional Chinese timing and tips for those towers', () => {
    const guides = buildTowerGuides(zhTW as Translations);
    for (const id of MISSING_CORE_TOWERS) {
      const guide = guides.find((entry) => entry.id === id);
      expect(guide?.timing).toBeTruthy();
      expect(guide?.tips.length).toBeGreaterThan(0);
      expect(guide?.skill.name).toBeTruthy();
    }
  });
});
