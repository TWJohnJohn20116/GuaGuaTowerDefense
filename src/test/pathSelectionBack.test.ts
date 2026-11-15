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
});
