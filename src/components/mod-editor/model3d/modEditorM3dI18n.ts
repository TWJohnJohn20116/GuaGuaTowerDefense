/**
 * Mod 編輯器 · 3D 部件庫 i18n 標籤
 */
import type { Translations } from '@/i18n';
import { M3D_CAT_KEYS, M3D_TPL_KEYS, M3D_MAT_KEYS } from '@/components/mod-editor/model3d/m3dI18nKeys';
import { SHAPE_CATEGORIES, MODEL_TEMPLATES, SHAPE_NAME } from './shapeLibrary';

type M = Translations['modEditorExt'];

const MAT_IDS = ['metal', 'trim', 'accent', 'glow', 'gold'] as const;

function shapeI18nKey(id: string): keyof M {
  return `m3dShape${id.charAt(0).toUpperCase()}${id.slice(1)}` as keyof M;
}

export function resolveShapeName(m: M, id: string): string {
  const key = shapeI18nKey(id);
  const v = m[key];
  return v ? String(v) : (SHAPE_NAME[id] ?? id);
}

export function getMaterialRoles(m: M) {
  return MAT_IDS.map((id, i) => ({
    id,
    name: String(m[M3D_MAT_KEYS[i]]),
    chip: ['#3a4252', '#1c212e', '#4f8fe8', '#7dd3fc', '#f59e0b'][i],
  }));
}

export function getShapeCategories(m: M) {
  return SHAPE_CATEGORIES.map((cat, ci) => ({
    name: String(m[M3D_CAT_KEYS[ci]]),
    shapes: cat.shapes.map((s) => ({
      id: s.id,
      name: resolveShapeName(m, s.id),
    })),
  }));
}

export function getModelTemplates(m: M) {
  return MODEL_TEMPLATES.map((tpl, i) => ({
    name: String(m[M3D_TPL_KEYS[i]]),
    build: tpl.build,
  }));
}
