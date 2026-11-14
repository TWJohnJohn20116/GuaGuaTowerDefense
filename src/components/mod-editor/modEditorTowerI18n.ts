/**
 * Mod 編輯器 · 塔模型 i18n 建構
 */
import type { Translations } from '@/i18n';

type M = Translations['modEditorExt'];

const TOWER_MODEL_IDS = [
  'basic', 'sniper', 'cannon', 'machine', 'shotgun', 'frost', 'poison',
  'laser', 'lightning', 'flame', 'wind', 'money', 'pulse', 'ballista',
] as const;

function towerModelKey(id: string) {
  return `tm${id.charAt(0).toUpperCase()}${id.slice(1)}` as keyof M;
}

export function getTowerModelTypes(m: M) {
  return TOWER_MODEL_IDS.map((id) => ({
    id,
    name: String(m[towerModelKey(id)]),
  }));
}
