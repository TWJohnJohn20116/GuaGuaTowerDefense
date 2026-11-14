import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
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

  it('does not render the skill emoji as a raw text node in the tower panel', () => {
    const src = readFileSync(resolve(__dirname, '../components/game/FloatingTowerPanel.tsx'), 'utf8');
    expect(src).not.toMatch(/>\{skillData\.icon\}</);
    expect(src).toMatch(/<ThemeIcon icon=\{skillData\.icon\}/);
  });
});
