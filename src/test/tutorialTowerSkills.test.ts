import { describe, it, expect } from 'vitest';
import { TOWER_GUIDES_META, buildTowerGuides } from '@/components/scenes/tutorial/TutorialPageData';
import { getTowerSkill } from '@/data/skillData';
import { zhTW } from '@/i18n/locales/zh-TW';
import type { Translations } from '@/i18n';
import type { TowerType } from '@/types/game';

describe('tutorial tower skill copy', () => {
  it('matches the real tower skill name, description and cooldown', () => {
    const guides = buildTowerGuides(zhTW as Translations);
    for (const meta of TOWER_GUIDES_META) {
      const skill = getTowerSkill(meta.id as TowerType);
      const guide = guides.find((entry) => entry.id === meta.id);
      expect(guide?.skill.name, meta.id).toBe(skill.name);
      expect(guide?.skill.description, meta.id).toBe(skill.description);
      expect(guide?.skill.cooldown, meta.id).toBe(`${skill.cooldown / 1000}秒`);
    }
  });
});
