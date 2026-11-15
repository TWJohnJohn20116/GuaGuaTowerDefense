import { describe, expect, it } from 'vitest';
import { canonicalizeMod } from '@/mod-script/signing';
import type { Mod } from '@/types/game';

function makeMod(reorder: boolean): Mod {
  const base = {
    metadata: { id: 'mod_1', name: '測試', version: '1.0.0', author: 'x' },
    content: { scripts: [{ id: 's1', code: 'function onTick() {}' }] },
  } as unknown as Mod;
  if (!reorder) return base;
  // 同內容、不同鍵插入順序
  const reordered = {
    content: base.content,
    metadata: base.metadata,
  } as unknown as Mod;
  return reordered;
}

describe('mod signing canonicalize', () => {
  it('鍵順序不影響正規化結果', () => {
    expect(canonicalizeMod(makeMod(false))).toBe(canonicalizeMod(makeMod(true)));
  });

  it('ignores the signature field', () => {
    const mod = makeMod(false);
    const withSignature = { ...mod, signature: { alg: 'ECDSA-P256-SHA256', publicKeySpkiB64: 'a', valueB64: 'b' } } as Mod;
    expect(canonicalizeMod(withSignature)).toBe(canonicalizeMod(mod));
  });

  it('內容改了正規化字串就會變', () => {
    const mod = makeMod(false);
    const changed = JSON.parse(JSON.stringify(mod)) as Mod;
    changed.metadata.version = '2.0.0';
    expect(canonicalizeMod(changed)).not.toBe(canonicalizeMod(mod));
  });
});
