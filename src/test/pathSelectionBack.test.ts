import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  isPathSelectionTypingTarget,
  resolvePathSelectionEscape,
} from '@/data/pathSelectionBack';

describe('path selection back and Escape', () => {
  it('Escape goes back like the header, and ignores typing', () => {
    expect(resolvePathSelectionEscape({ key: 'Escape', inTextField: false })).toBe('go_back');
    expect(resolvePathSelectionEscape({ key: 'Escape', inTextField: true })).toBe('ignore');
    expect(resolvePathSelectionEscape({ key: 'Enter', inTextField: false })).toBe('ignore');
    expect(isPathSelectionTypingTarget(document.createElement('input'))).toBe(true);
    expect(isPathSelectionTypingTarget(document.createElement('div'))).toBe(false);
  });

  it('header back pops scene history instead of always dumping to the main menu', () => {
    const src = readFileSync(
      resolve(__dirname, '../components/scenes/PathSelection.tsx'),
      'utf8',
    );
    expect(src).toMatch(/resolvePathSelectionEscape/);
    expect(src).toMatch(/clearPathHandoff/);
    expect(src).toMatch(/goBackScene/);
    expect(src).not.toMatch(/setScene\('mainMenu'\)/);
  });
});
