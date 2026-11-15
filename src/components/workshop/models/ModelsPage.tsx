/**
 * 3D 模型頁（創意工坊第 8 頁）
 *
 * 版面：上工具列 / 左（塔清單 + 部件樹）/ 中（3D 視窗）/ 右（部件屬性）。
 * 資料流：資產的 data.custom3d 是唯一真相；每次提交都經 createModelHistory 記錄再寫回 store，
 * 因此復原／重做與存檔內容永遠一致。
 *
 * 快捷鍵（不影響輸入框）：1/2/3 切工具、X/Y/Z 鎖軸、F 聚焦、Del 刪除、
 * Ctrl+Z 復原、Ctrl+Y 或 Ctrl+Shift+Z 重做、Ctrl+D 複製、Esc 取消選取。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from '@/i18n';
import { useWorkshopStore } from '@/store/workshopStore';
import type { WorkshopTowerAsset } from '@/types/workshop';
import type { Custom3DModel, Custom3DPart } from '@/types/game';
import { Btn, Empty, SegHead } from '@/components/hl';
import {
  addPart,
  createModelHistory,
  duplicatePart,
  mirrorPart,
  modelStats,
  normalizeModel,
  parseModel,
  removePart,
  reparent,
  serializeModel,
  updatePart,
} from '@/workshop/model/doc';
import { TOWER_MODEL_TEMPLATES } from '@/workshop/model/templates';
import type { GizmoAxis, GizmoTool, ViewPreset } from '@/workshop/model/gizmo';
import { ModelToolbar, type ModelTemplateId } from './ModelToolbar';
import { ModelTree } from './ModelTree';
import { ModelInspector } from './ModelInspector';
import { ModelViewport, type ShadingMode } from './ModelViewport';

const EMPTY_MODEL: Custom3DModel = { parts: [] };
const DEFAULT_SHAPE = 'base';

const isTypingTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
};

export function ModelsPage() {
  const { t } = useTranslation();
  const s = t.studio.models;
  const assets = useWorkshopStore((state) => state.assets);
  const upsertAsset = useWorkshopStore((state) => state.upsertAsset);

  const towers = useMemo(
    () => assets.filter((asset): asset is WorkshopTowerAsset => asset.kind === 'tower'),
    [assets],
  );

  const [assetId, setAssetId] = useState<string | null>(towers[0]?.id ?? null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [tool, setTool] = useState<GizmoTool>('translate');
  const [axisLock, setAxisLock] = useState<GizmoAxis | null>(null);
  const [shading, setShading] = useState<ShadingMode>('solid');
  const [ortho, setOrtho] = useState(false);
  const [snap, setSnap] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showBounds, setShowBounds] = useState(true);
  const [background, setBackground] = useState('#10141c');
  const [ambient, setAmbient] = useState(1);
  const [viewPreset, setViewPreset] = useState<{ id: ViewPreset; nonce: number }>({ id: 'iso', nonce: 0 });
  const [focusNonce, setFocusNonce] = useState(0);
  const [shapes, setShapes] = useState<string[]>([DEFAULT_SHAPE]);
  const [notice, setNotice] = useState<string | null>(null);
  const [, setHistoryVersion] = useState(0);

  const activeAsset = towers.find((asset) => asset.id === assetId) ?? null;
  const model: Custom3DModel = activeAsset?.data.custom3d ?? EMPTY_MODEL;

  const historyRef = useRef(createModelHistory(EMPTY_MODEL));

  // 部件幾何清單（延遲載入，避免把 three 拉進主 chunk）
  useEffect(() => {
    let alive = true;
    void import('@/components/scenes/game-scene/three/towerModels3d').then((module) => {
      if (alive) setShapes(Object.keys(module.TOWER_PART_SHAPES));
    });
    return () => {
      alive = false;
    };
  }, []);

  // 還沒有選到塔時自動選第一座（store 可能是非同步 rehydrate）
  useEffect(() => {
    if (!assetId && towers.length > 0) setAssetId(towers[0].id);
  }, [assetId, towers]);

  // 換塔 → 重設歷史。deps 只放 assetId：model 每次編輯都會變，列進來會把歷史清空。
  useEffect(() => {
    historyRef.current.reset(model);
    setSelectedIds([]);
    setHistoryVersion((value) => value + 1);
  }, [assetId]);

  /** 只寫 store（不碰歷史）：復原／重做走這條，否則 push 會把 redo 清空 */
  const persist = useCallback(
    (next: Custom3DModel): void => {
      if (!activeAsset) return;
      const normalized = normalizeModel(next);
      upsertAsset({
        ...activeAsset,
        data: { ...activeAsset.data, custom3d: normalized.parts.length > 0 ? normalized : undefined },
        updatedAt: Date.now(),
      });
      setHistoryVersion((value) => value + 1);
    },
    [activeAsset, upsertAsset],
  );

  /** 一般編輯：先記錄歷史再寫 store */
  const apply = useCallback(
    (next: Custom3DModel): void => {
      const normalized = normalizeModel(next);
      historyRef.current.push(normalized);
      persist(normalized);
    },
    [persist],
  );

  const selectedPart: Custom3DPart | null =
    selectedIds.length === 1 ? model.parts.find((part) => part.id === selectedIds[0]) ?? null : null;

  const parentName = useMemo(() => {
    if (!selectedPart?.parentId) return null;
    const parent = model.parts.find((part) => part.id === selectedPart.parentId);
    return parent ? parent.name ?? parent.shape : null;
  }, [model.parts, selectedPart]);

  const stats = useMemo(() => modelStats(model), [model]);
  const [overflow, setOverflow] = useState(false);

  const patchSelected = (patch: Partial<Custom3DPart>): void => {
    if (!selectedPart) return;
    apply(updatePart(model, selectedPart.id, patch));
  };

  const addNewPart = (parentId: string | null): void => {
    const shape = shapes.includes('base') ? 'base' : shapes[0];
    const next = addPart(model, {
      shape,
      material: 'metal',
      x: 0,
      y: 0,
      z: 0,
      rx: 0,
      ry: 0,
      rz: 0,
      scale: 1,
      name: shape,
    }, parentId);
    apply(next);
    const created = next.parts[next.parts.length - 1];
    if (created) setSelectedIds([created.id]);
  };

  const undo = (): void => {
    if (!historyRef.current.canUndo()) return;
    persist(historyRef.current.undo());
  };

  const redo = (): void => {
    if (!historyRef.current.canRedo()) return;
    persist(historyRef.current.redo());
  };

  const removeSelected = (): void => {
    if (selectedIds.length === 0) return;
    let next = model;
    for (const id of selectedIds) next = removePart(next, id);
    apply(next);
    setSelectedIds([]);
  };

  const duplicateSelected = (): void => {
    if (!selectedPart) return;
    apply(duplicatePart(model, selectedPart.id));
  };

  const mirrorSelected = (axis: 'x' | 'z'): void => {
    if (!selectedPart) return;
    apply(mirrorPart(model, selectedPart.id, axis));
  };

  const reparentPart = (childId: string, parentId: string | null): void => {
    const result = reparent(model, childId, parentId);
    if (result.ok) apply(result.model);
    else setNotice(result.reason);
  };

  const useTemplate = (id: ModelTemplateId): void => {
    const template = TOWER_MODEL_TEMPLATES.find((item) => item.id === id);
    if (!template) return;
    const built = template.build();
    apply(normalizeModel(built));
    setSelectedIds([]);
    setFocusNonce((value) => value + 1);
  };

  const exportModel = (): void => {
    const blob = new Blob([serializeModel(model)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = (activeAsset?.name ?? 'model') + '.ggtower-model.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importModel = (file: File): void => {
    void file.text().then((text) => {
      const parsed = parseModel(text);
      if (parsed.ok) {
        apply(parsed.model);
        setNotice(s.imported);
        setFocusNonce((value) => value + 1);
      } else {
        setNotice(s.importFailed.replace('{reason}', parsed.reason));
      }
    });
  };

  // ===== 快捷鍵 =====
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (isTypingTarget(event.target)) return;
      const ctrl = event.ctrlKey || event.metaKey;
      if (ctrl && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
        return;
      }
      if (ctrl && event.key.toLowerCase() === 'y') {
        event.preventDefault();
        redo();
        return;
      }
      if (ctrl && event.key.toLowerCase() === 'd') {
        event.preventDefault();
        duplicateSelected();
        return;
      }
      if (event.key === '1') setTool('translate');
      else if (event.key === '2') setTool('rotate');
      else if (event.key === '3') setTool('scale');
      else if (event.key === 'x') setAxisLock((prev) => (prev === 'x' ? null : 'x'));
      else if (event.key === 'y') setAxisLock((prev) => (prev === 'y' ? null : 'y'));
      else if (event.key === 'z') setAxisLock((prev) => (prev === 'z' ? null : 'z'));
      else if (event.key === 'f' || event.key === 'F') setFocusNonce((value) => value + 1);
      else if (event.key === 'Delete' || event.key === 'Backspace') removeSelected();
      else if (event.key === 'Escape') setSelectedIds([]);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  if (towers.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <Empty title={s.noTowers} hint={s.noTowersHint} />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-1.5 p-2">
      <ModelToolbar
        tool={tool}
        onTool={setTool}
        view={viewPreset.id}
        onView={(id) => setViewPreset((prev) => ({ id, nonce: prev.nonce + 1 }))}
        ortho={ortho}
        onOrtho={setOrtho}
        snap={snap}
        onSnap={setSnap}
        showGrid={showGrid}
        onShowGrid={setShowGrid}
        showBounds={showBounds}
        onShowBounds={setShowBounds}
        shading={shading}
        onShading={setShading}
        canUndo={historyRef.current.canUndo()}
        canRedo={historyRef.current.canRedo()}
        onUndo={undo}
        onRedo={redo}
        onDuplicate={duplicateSelected}
        onMirror={mirrorSelected}
        onRemove={removeSelected}
        onTemplate={useTemplate}
        onImport={importModel}
        onExport={exportModel}
        stats={stats}
        outOfBounds={overflow}
        disabled={selectedIds.length === 0}
      />

      <div className="flex min-h-0 flex-1 gap-1.5">
        <div className="flex w-[228px] shrink-0 flex-col gap-1 border border-[var(--cn-line-soft)] p-1.5">
          <SegHead label={s.towerList} />
          <div className="max-h-32 shrink-0 overflow-y-auto">
            {towers.map((tower) => (
              <button
                key={tower.id}
                type="button"
                onClick={() => setAssetId(tower.id)}
                className={[
                  'flex w-full items-center gap-1 border px-1 py-[3px] text-left text-[10.5px]',
                  tower.id === assetId
                    ? 'border-[var(--cn-signal)] bg-[var(--cn-signal-soft)] text-[var(--cn-ink)]'
                    : 'border-transparent text-[var(--cn-ink-2)] hover:border-[var(--cn-line-soft)]',
                ].join(' ')}
              >
                <span className="h-2 w-2 shrink-0 border border-[var(--cn-line)]" style={{ background: tower.data.color }} />
                <span className="min-w-0 flex-1 truncate">{tower.name}</span>
                <span className="shrink-0 font-mono text-[9px] text-[var(--cn-ink-3)]">{tower.data.baseType}</span>
              </button>
            ))}
          </div>

          <SegHead
            label={s.parts}
            right={(
              <Btn size="sm" variant="line" onClick={() => addNewPart(null)}>{s.addPart}</Btn>
            )}
          />
          <ModelTree
            model={model}
            selectedIds={selectedIds}
            onSelect={(ids, additive) => {
              setSelectedIds((prev) => (additive ? Array.from(new Set([...prev, ...ids])) : ids));
            }}
            onReparent={reparentPart}
            onAddPart={addNewPart}
            onDuplicate={(id) => apply(duplicatePart(model, id))}
            onRemove={(id) => {
              apply(removePart(model, id));
              setSelectedIds((prev) => prev.filter((value) => value !== id));
            }}
            onMirror={(id, axis) => apply(mirrorPart(model, id, axis))}
            onToggleHidden={(id) => {
              const part = model.parts.find((item) => item.id === id);
              if (part) apply(updatePart(model, id, { hidden: part.hidden !== true }));
            }}
            onToggleLocked={(id) => {
              const part = model.parts.find((item) => item.id === id);
              if (part) apply(updatePart(model, id, { locked: part.locked !== true }));
            }}
            onRename={(id, name) => apply(updatePart(model, id, { name }))}
          />
        </div>

        <div className="relative min-h-0 flex-1 border border-[var(--cn-line-soft)]">
          <ModelViewport
            model={model}
            towerColor={activeAsset?.data.color}
            selectedIds={selectedIds}
            tool={tool}
            axisLock={axisLock}
            shading={shading}
            ortho={ortho}
            showGrid={showGrid}
            showBounds={showBounds}
            snap={snap}
            background={background}
            ambient={ambient}
            viewPreset={viewPreset}
            focusNonce={focusNonce}
            onSelect={(ids) => setSelectedIds(ids)}
            onTransform={(id, patch, phase) => {
              if (phase === 'commit') apply(updatePart(model, id, patch));
            }}
            onOverflow={setOverflow}
          />
          <div className="pointer-events-none absolute bottom-1 left-1 right-1 flex items-center justify-between gap-2 font-mono text-[9px] text-white/45">
            <span className="truncate">{s.hintSelect}</span>
            <span className="truncate">{s.hintKeys}</span>
          </div>
        </div>

        <div className="flex min-h-0 w-[252px] shrink-0 flex-col border border-[var(--cn-line-soft)]">
          <ModelInspector
            part={selectedPart}
            hasParts={model.parts.length > 0}
            shapes={shapes}
            parentName={parentName}
            onPatch={patchSelected}
            onUnparent={() => selectedPart && reparentPart(selectedPart.id, null)}
            onFocus={() => setFocusNonce((value) => value + 1)}
            footer={(
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  <span className="arc-label w-12 shrink-0">{s.background}</span>
                  <input
                    type="color"
                    value={background}
                    onChange={(event) => setBackground(event.target.value)}
                    className="h-5 w-8 border border-[var(--cn-line)] bg-transparent"
                  />
                  <span className="arc-label ml-2 shrink-0">{s.ambient}</span>
                  <input
                    type="range"
                    min={0.2}
                    max={2.2}
                    step={0.1}
                    value={ambient}
                    onChange={(event) => setAmbient(Number(event.target.value))}
                    className="min-w-0 flex-1"
                  />
                </div>
                {notice && <span className="font-mono text-[9px] text-[var(--cn-ink-3)]">{notice}</span>}
              </div>
            )}
          />
        </div>
      </div>
    </div>
  );
}
