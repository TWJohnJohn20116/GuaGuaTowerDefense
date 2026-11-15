import { describe, expect, it } from 'vitest';
import { validateModContent } from '@/components/mod-editor/modValidation';
import type { Mod } from '@/types/game';
import type { CustomScriptData } from '@/types/modScript';

function makeScript(overrides: Partial<CustomScriptData> = {}): CustomScriptData {
  return {
    id: 'script_1',
    modId: 'mod_1',
    name: '測試腳本',
    description: '',
    hooks: ['onWaveStart'],
    permissions: ['log'],
    code: 'function onWaveStart(ctx, api) { api.log("hi"); }',
    ...overrides,
  };
}

function makeMod(scripts: CustomScriptData[]): Mod {
  return {
    metadata: {
      id: 'mod_1',
      name: '測試 Mod',
      version: '1.0.0',
      author: 'tester',
      description: '',
      type: 'full',
      gameVersion: '2.3.0',
      createdAt: '2026-11-15',
      updatedAt: '2026-11-15',
    },
    content: { scripts },
    enabled: false,
    loadOrder: 1,
  };
}

describe('mod script validation', () => {
  it('合法腳本可以通過', () => {
    const result = validateModContent(makeMod([makeScript()]));
    expect(result.valid).toBe(true);
    expect(result.flags.some((flag) => flag.tab === 'scripts')).toBe(false);
  });

  it('沒有程式碼是錯誤', () => {
    const result = validateModContent(makeMod([makeScript({ code: '   ' })]));
    expect(result.valid).toBe(false);
    expect(result.errors.join()).toContain('沒有程式碼');
  });

  it('語法錯誤是錯誤並標記到腳本分頁', () => {
    const result = validateModContent(makeMod([makeScript({ code: 'function onWaveStart( {' })]));
    expect(result.valid).toBe(false);
    expect(result.flags.some((flag) => flag.tab === 'scripts' && flag.level === 'error')).toBe(true);
  });

  it('沒有掛 hook 是警告', () => {
    const result = validateModContent(makeMod([makeScript({ hooks: [] })]));
    expect(result.valid).toBe(true);
    expect(result.warnings.join()).toContain('沒有掛任何事件');
  });

  it('用到未勾選的權限是警告', () => {
    const script = makeScript({
      permissions: ['log'],
      code: 'function onWaveStart(ctx, api) { api.money.add(10); }',
    });
    const result = validateModContent(makeMod([script]));
    expect(result.valid).toBe(true);
    expect(result.warnings.join()).toContain('economy');
  });

  it('腳本 ID 重複是錯誤', () => {
    const result = validateModContent(makeMod([makeScript(), makeScript({ name: '第二支' })]));
    expect(result.valid).toBe(false);
    expect(result.errors.join()).toContain('重複');
  });
});
