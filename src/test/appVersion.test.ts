import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseChangelog } from '@/components/changelog';
import { APP_VERSION } from '@/services/updateService';
import { version as packageVersion } from '../../package.json';

describe('1.2.0 version line', () => {
  it('keeps app, package, and changelog on 1.2.0 without leftover 1.1.x releases', () => {
    expect(APP_VERSION).toBe('1.2.0');
    expect(packageVersion).toBe('1.2.0');

    const markdown = readFileSync(resolve(__dirname, '../../CHANGELOG.md'), 'utf8');
    const sections = parseChangelog(markdown);
    expect(sections[0]?.version).toBe('1.2.0');
    expect(sections.map((s) => s.version).filter((v) => v.startsWith('1.1.'))).toEqual([]);
    expect(markdown).toMatch(/^## \[1\.2\.0\]/m);
    expect(markdown).not.toMatch(/^## \[1\.1\./m);
  });
});
