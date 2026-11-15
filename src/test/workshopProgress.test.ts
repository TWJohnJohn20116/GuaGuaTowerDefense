import { describe, expect, it } from 'vitest';
import { resolveLevelLocks } from '@/workshop/progress';
import type { WorkshopLevel, WorkshopProject } from '@/types/workshop';

const level = (id: string, requiresLevelId?: string | null): WorkshopLevel => ({
  id,
  name: id,
  waves: [],
  winConditions: {},
  requiresLevelId: requiresLevelId ?? null,
});

const project = (levels: WorkshopLevel[]): WorkshopProject => ({
  id: 'p1',
  name: 'p',
  description: '',
  thumbnail: '',
  version: '1.0.0',
  author: '',
  license: 'all-rights-reserved',
  signature: null,
  ruleSetRef: null,
  assetRefs: [],
  levels,
  createdAt: 0,
  updatedAt: 0,
});

describe('level unlock rules', () => {
  it('沒有前置的關卡一開始就解鎖', () => {
    const locks = resolveLevelLocks(project([level('a')]), []);
    expect(locks.get('a')?.locked).toBe(false);
  });

  it('前置未完成 → 鎖住並回報缺哪一關', () => {
    const locks = resolveLevelLocks(project([level('a'), level('b', 'a')]), []);
    expect(locks.get('b')?.locked).toBe(true);
    expect(locks.get('b')?.missing).toEqual(['a']);
  });

  it('前置完成 → 解鎖', () => {
    const locks = resolveLevelLocks(project([level('a'), level('b', 'a')]), ['a']);
    expect(locks.get('b')?.locked).toBe(false);
  });

  it('多層需求鏈會列出整條缺的關卡', () => {
    const locks = resolveLevelLocks(project([level('a'), level('b', 'a'), level('c', 'b')]), []);
    expect(locks.get('c')?.missing).toEqual(['b', 'a']);
  });

  it('循環需求不會無限遞迴', () => {
    const locks = resolveLevelLocks(project([level('a', 'b'), level('b', 'a')]), []);
    expect(locks.get('a')?.locked).toBe(true);
    expect(locks.get('b')?.locked).toBe(true);
  });

  it('指向不存在的關卡視為鎖住', () => {
    const locks = resolveLevelLocks(project([level('a', 'ghost')]), []);
    expect(locks.get('a')?.locked).toBe(true);
    expect(locks.get('a')?.missing).toEqual(['ghost']);
  });
});
