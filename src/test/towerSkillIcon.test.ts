import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { SKILL_DATA } from '@/data/skillData';
import { ThemeIcon } from '@/components/ui/Icons';

describe('tower panel skill glyph', () => {
  it('maps every tower skill icon to svg instead of the emoji fallback', () => {
    for (const skill of Object.values(SKILL_DATA)) {
      const html = renderToStaticMarkup(
        createElement(ThemeIcon, { icon: skill.icon, className: 'w-6 h-6' }),
      );
      expect(html, skill.id).toMatch(/<svg/);
      expect(html, skill.id).not.toContain(skill.icon);
    }
  });
});
