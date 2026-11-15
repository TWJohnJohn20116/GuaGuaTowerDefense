import { describe, expect, it } from 'vitest';
import { parseChangelog } from '@/components/changelog';
import { APP_VERSION } from '@/services/updateService';
import { version as packageVersion } from '../../package.json';

describe('1.2.0 version line', () => {
  it('keeps the app and package versions on 1.2.0', () => {
    expect(APP_VERSION).toBe('1.2.0');
    expect(packageVersion).toBe('1.2.0');
  });

  it('parses version sections out of a changelog body', () => {
    const markdown = [
      '# CHANGELOG',
      '',
      '## [1.2.0] - 2026-11-15',
      '- 修正',
      '',
      '## [1.1.0] - 2026-10-01',
      '- 舊版',
      '',
    ].join('\n');

    const sections = parseChangelog(markdown);
    expect(sections[0]?.version).toBe('1.2.0');
    expect(sections.map((section) => section.version)).toEqual(['1.2.0', '1.1.0']);
  });
});
