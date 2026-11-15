/**
 * 模型編輯器工具列
 *
 * 兩列密集排列：工具／視角／顯示開關／著色在上，編輯動作／模板／匯出入／統計在下。
 * 所有按鈕都帶 kbd 提示（1/2/3 切工具），與 ModelsPage 的快捷鍵實作對應。
 */
import { useTranslation } from '@/i18n';
import { Btn, Chip } from '@/components/hl';
import type { GizmoTool, ViewPreset } from '@/workshop/model/gizmo';
import type { ShadingMode } from './ModelViewport';

export interface ModelStats {
  partCount: number;
  visibleCount: number;
  drawCalls: number;
  spinCount: number;
}

export const MODEL_TEMPLATE_IDS = ['basic', 'sniper', 'cannon', 'crystal'] as const;
export type ModelTemplateId = (typeof MODEL_TEMPLATE_IDS)[number];

interface ModelToolbarProps {
  tool: GizmoTool;
  onTool: (tool: GizmoTool) => void;
  view: ViewPreset;
  onView: (view: ViewPreset) => void;
  ortho: boolean;
  onOrtho: (value: boolean) => void;
  snap: boolean;
  onSnap: (value: boolean) => void;
  showGrid: boolean;
  onShowGrid: (value: boolean) => void;
  showBounds: boolean;
  onShowBounds: (value: boolean) => void;
  shading: ShadingMode;
  onShading: (value: ShadingMode) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onDuplicate: () => void;
  onMirror: (axis: 'x' | 'z') => void;
  onRemove: () => void;
  onTemplate: (id: ModelTemplateId) => void;
  onImport: (file: File) => void;
  onExport: () => void;
  stats: ModelStats;
  outOfBounds: boolean;
  disabled: boolean;
}

export function ModelToolbar(props: ModelToolbarProps) {
  const { t } = useTranslation();
  const s = t.studio.models;

  const tools: { id: GizmoTool; label: string; kbd: string }[] = [
    { id: 'translate', label: s.toolMove, kbd: '1' },
    { id: 'rotate', label: s.toolRotate, kbd: '2' },
    { id: 'scale', label: s.toolScale, kbd: '3' },
  ];
  const views: { id: ViewPreset; label: string }[] = [
    { id: 'front', label: s.viewFront },
    { id: 'back', label: s.viewBack },
    { id: 'left', label: s.viewLeft },
    { id: 'right', label: s.viewRight },
    { id: 'top', label: s.viewTop },
    { id: 'iso', label: s.viewIso },
  ];
  const shadings: { id: ShadingMode; label: string }[] = [
    { id: 'solid', label: s.solid },
    { id: 'wireframe', label: s.wireframe },
    { id: 'normals', label: s.normals },
  ];

  return (
    <div className="flex flex-col gap-1 border-b border-[var(--cn-line-soft)] pb-1">
      <div className="flex flex-wrap items-center gap-1">
        <span className="arc-label mr-0.5">{s.tool}</span>
        {tools.map((item) => (
          <Chip key={item.id} active={props.tool === item.id} onClick={() => props.onTool(item.id)}>
            {item.label}
            <span className="ml-1 font-mono text-[9px] opacity-60">{item.kbd}</span>
          </Chip>
        ))}

        <span className="mx-1 h-4 w-px bg-[var(--cn-line-soft)]" />
        <span className="arc-label mr-0.5">{s.view}</span>
        {views.map((item) => (
          <Chip key={item.id} active={props.view === item.id} onClick={() => props.onView(item.id)}>
            {item.label}
          </Chip>
        ))}

        <span className="mx-1 h-4 w-px bg-[var(--cn-line-soft)]" />
        <Chip active={!props.ortho} onClick={() => props.onOrtho(false)}>{s.perspective}</Chip>
        <Chip active={props.ortho} onClick={() => props.onOrtho(true)}>{s.ortho}</Chip>
        <Chip active={props.snap} onClick={() => props.onSnap(!props.snap)}>{s.snap}</Chip>
        <Chip active={props.showGrid} onClick={() => props.onShowGrid(!props.showGrid)}>{s.grid}</Chip>
        <Chip active={props.showBounds} onClick={() => props.onShowBounds(!props.showBounds)}>{s.bounds}</Chip>

        <span className="mx-1 h-4 w-px bg-[var(--cn-line-soft)]" />
        <span className="arc-label mr-0.5">{s.shading}</span>
        {shadings.map((item) => (
          <Chip key={item.id} active={props.shading === item.id} onClick={() => props.onShading(item.id)}>
            {item.label}
          </Chip>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-1">
        <Btn size="sm" variant="line" disabled={!props.canUndo} onClick={props.onUndo}>{s.undo}</Btn>
        <Btn size="sm" variant="line" disabled={!props.canRedo} onClick={props.onRedo}>{s.redo}</Btn>
        <span className="mx-1 h-4 w-px bg-[var(--cn-line-soft)]" />
        <Btn size="sm" variant="line" disabled={props.disabled} onClick={props.onDuplicate}>{s.duplicate}</Btn>
        <Btn size="sm" variant="line" disabled={props.disabled} onClick={() => props.onMirror('x')}>{s.mirrorX}</Btn>
        <Btn size="sm" variant="line" disabled={props.disabled} onClick={() => props.onMirror('z')}>{s.mirrorZ}</Btn>
        <Btn size="sm" variant="ghost" disabled={props.disabled} onClick={props.onRemove}>{s.removePart}</Btn>

        <span className="mx-1 h-4 w-px bg-[var(--cn-line-soft)]" />
        <span className="arc-label mr-0.5">{s.templates}</span>
        {MODEL_TEMPLATE_IDS.map((id) => (
          <Btn key={id} size="sm" variant="line" onClick={() => props.onTemplate(id)}>
            {id === 'basic' ? s.templateBasic : id === 'sniper' ? s.templateSniper : id === 'cannon' ? s.templateCannon : s.templateCrystal}
          </Btn>
        ))}

        <span className="mx-1 h-4 w-px bg-[var(--cn-line-soft)]" />
        <label className="cursor-pointer">
          <span className="arc-btn inline-flex h-6 items-center border-2 border-[var(--cn-line)] bg-[var(--cn-card)] px-2 font-mono text-[10px] text-[var(--cn-ink)]">
            {s.importJson}
          </span>
          <input
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) props.onImport(file);
              event.target.value = '';
            }}
          />
        </label>
        <Btn size="sm" variant="line" onClick={props.onExport}>{s.exportJson}</Btn>

        <span className="ml-auto flex items-center gap-2 font-mono text-[9.5px] text-[var(--cn-ink-3)]">
          <span>{s.partCount.replace('{count}', String(props.stats.partCount))}</span>
          <span>{s.drawCalls.replace('{count}', String(props.stats.drawCalls))}</span>
          {props.stats.spinCount > 0 && <span>{s.spinCount.replace('{count}', String(props.stats.spinCount))}</span>}
          {props.outOfBounds && <span className="text-[var(--cn-signal-text)]">{s.outOfBounds}</span>}
        </span>
      </div>
    </div>
  );
}
