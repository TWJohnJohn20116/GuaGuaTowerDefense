import { describe, expect, it } from 'vitest';
import { matchApiEntries, tokenizeScript, wordAtCursor } from '@/components/mod-editor/scriptHighlight';

const join = (code: string) => tokenizeScript(code).map((token) => token.text).join('');

describe('script highlight', () => {
  it('切完 token 串接後等於原文（不能吃掉字元）', () => {
    const code = "// 註解\nfunction onTick(ctx, api) {\n  api.log('hi' + 42);\n}";
    expect(join(code)).toBe(code);
  });

  it('註解／字串／數字／關鍵字／api 都分得出來', () => {
    const tokens = tokenizeScript("// x\nconst a = api.money.add(5); api.log('s');");
    const kinds = tokens.filter((token) => token.kind !== 'plain').map((token) => token.kind);
    expect(kinds).toContain('comment');
    expect(kinds).toContain('keyword');
    expect(kinds).toContain('api');
    expect(kinds).toContain('number');
    expect(kinds).toContain('string');
  });

  it('api 後面的成員也標成 api 色', () => {
    const tokens = tokenizeScript('api.money.add(1)');
    const apiTokens = tokens.filter((token) => token.kind === 'api').map((token) => token.text);
    expect(apiTokens).toEqual(['api', 'money', 'add']);
  });

  it('wordAtCursor 取到游標所在的單字', () => {
    const code = 'api.mon';
    const result = wordAtCursor(code, code.length);
    expect(result.word).toBe('api.mon');
    expect(result.start).toBe(0);
  });

  it('自動完成可依前綴過濾', () => {
    expect(matchApiEntries('money').map((entry) => entry.label)).toEqual(['api.money.add']);
    expect(matchApiEntries('').length).toBeGreaterThan(5);
    expect(matchApiEntries('zzz')).toEqual([]);
  });
});
