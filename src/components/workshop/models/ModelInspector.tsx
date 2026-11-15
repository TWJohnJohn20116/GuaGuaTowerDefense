/**
 * 部件屬性面板
 *
 * 只編輯「目前選取的單一部件」。旋轉以度顯示（內部存弧度），
 * 縮放同時提供單軸（sx/sy/sz）與等比（scale，會一次寫入三軸）。
 */
import type { ReactNode } from 'react';
import { useTranslation } from '@/i18n';
import type { Custom3DPart } from '@/types/game';
import { Btn, Input, SegHead, Toggle } from '@/components/hl';
import { ColorPicker } from '@/components/ui/ColorPicker';

const MATERIALS: Custom3DPart['material'][] = ['metal', 'trim', 'accent', 'glow', 'gold'];
const DEG = 180 / Math.PI;

interface ModelInspectorProps {
  part: Custom3DPart | null;
  /** 模型已有部件時，未選取的提示要改成「去選一個」，而不是「先建一個」 */
  hasParts: boolean;
  shapes: string[];
  parentName: string | null;
  onPatch: (patch: Partial<Custom3DPart>) => void;
  onUnparent: () => void;
  onFocus: () => void;
  /** 場景控制（背景／環境光）：放在捲動區尾端，避免浮在面板上方造成遮擋 */
  footer?: ReactNode;
}

function Num({
  label,
  value,
  step = 0.05,
  onChange,
}: {
  label: string;
  value: number;
  step?: number;
  onChange: (next: number) => void;
}) {
  return (
    <label className="flex flex-col gap-0.5">
      <span className="font-mono text-[9px] text-[var(--cn-ink-3)]">{label}</span>
      <Input
        type="number"
        step={step}
        value={Number.isFinite(value) ? Number(value.toFixed(3)) : 0}
        onChange={(event) => {
          const parsed = Number(event.target.value);
          onChange(Number.isFinite(parsed) ? parsed : 0);
        }}
        className="h-6 w-full px-1 text-right font-mono text-[10.5px]"
      />
    </label>
  );
}

export function ModelInspector({ part, hasParts, shapes, parentName, onPatch, onUnparent, onFocus, footer }: ModelInspectorProps) {
  const { t } = useTranslation();
  const s = t.studio.models;

  if (!part) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-2">
        <SegHead label={s.parts} />
        <p className="font-mono text-[10px] leading-relaxed text-[var(--cn-ink-3)]">
          {hasParts ? s.selectPartHint : s.emptyHint}
        </p>
        <p className="font-mono text-[9px] leading-relaxed text-[var(--cn-ink-3)]">{s.hintSelect}</p>
        {footer && <div className="mt-auto shrink-0 border-t border-[var(--cn-line-soft)] pt-2">{footer}</div>}
      </div>
    );
  }

  const sx = part.sx ?? part.scale;
  const sy = part.sy ?? part.scale;
  const sz = part.sz ?? part.scale;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-2">
      <SegHead
        label={s.transform}
        right={<Btn size="sm" variant="ghost" onClick={onFocus}>{s.focus}</Btn>}
      />

      <label className="flex flex-col gap-0.5">
        <span className="font-mono text-[9px] text-[var(--cn-ink-3)]">{s.rename}</span>
        <Input
          value={part.name ?? ''}
          placeholder={part.shape}
          onChange={(event) => onPatch({ name: event.target.value })}
          className="h-6 w-full px-1 text-[10.5px]"
        />
      </label>

      <span className="arc-label">{s.position}</span>
      <div className="grid grid-cols-3 gap-1">
        <Num label="x" value={part.x} onChange={(x) => onPatch({ x })} />
        <Num label="y" value={part.y} onChange={(y) => onPatch({ y })} />
        <Num label="z" value={part.z} onChange={(z) => onPatch({ z })} />
      </div>

      <div className="flex items-center gap-1">
        <span className="arc-label shrink-0">{s.alignAxis}</span>
        <Btn size="sm" variant="ghost" onClick={() => onPatch({ y: 0, z: 0 })}>X</Btn>
        <Btn size="sm" variant="ghost" onClick={() => onPatch({ x: 0, z: 0 })}>Y</Btn>
        <Btn size="sm" variant="ghost" onClick={() => onPatch({ x: 0, y: 0 })}>Z</Btn>
      </div>

      <span className="arc-label">{s.rotation}</span>
      <div className="grid grid-cols-3 gap-1">
        <Num label="rx°" value={part.rx * DEG} step={5} onChange={(deg) => onPatch({ rx: deg / DEG })} />
        <Num label="ry°" value={part.ry * DEG} step={5} onChange={(deg) => onPatch({ ry: deg / DEG })} />
        <Num label="rz°" value={part.rz * DEG} step={5} onChange={(deg) => onPatch({ rz: deg / DEG })} />
      </div>

      <span className="arc-label">{s.scaleAxis}</span>
      <div className="grid grid-cols-3 gap-1">
        <Num label="sx" value={sx} onChange={(value) => onPatch({ sx: value })} />
        <Num label="sy" value={sy} onChange={(value) => onPatch({ sy: value })} />
        <Num label="sz" value={sz} onChange={(value) => onPatch({ sz: value })} />
      </div>
      <Num
        label={s.scaleUniform}
        value={part.scale}
        onChange={(value) => onPatch({ scale: value, sx: value, sy: value, sz: value })}
      />

      <SegHead label={s.appearance} />

      <label className="flex flex-col gap-0.5">
        <span className="font-mono text-[9px] text-[var(--cn-ink-3)]">{s.shape}</span>
        <select
          value={part.shape}
          onChange={(event) => onPatch({ shape: event.target.value })}
          className="h-6 w-full border border-[var(--cn-line)] bg-[var(--cn-card)] px-1 font-mono text-[10px]"
        >
          {shapes.map((shape) => (
            <option key={shape} value={shape}>{shape}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-0.5">
        <span className="font-mono text-[9px] text-[var(--cn-ink-3)]">{s.material}</span>
        <select
          value={part.material}
          onChange={(event) => onPatch({ material: event.target.value as Custom3DPart['material'] })}
          className="h-6 w-full border border-[var(--cn-line)] bg-[var(--cn-card)] px-1 font-mono text-[10px]"
        >
          {MATERIALS.map((material) => (
            <option key={material} value={material}>{material}</option>
          ))}
        </select>
      </label>

      <span className="arc-label">{s.color}</span>
      <div className="flex items-center gap-1">
        <ColorPicker
          color={part.color ?? '#8aa0c0'}
          onChange={(value) => onPatch({ color: value })}
        />
        <Input
          value={part.color ?? ''}
          placeholder={s.colorAuto}
          onChange={(event) => onPatch({ color: event.target.value })}
          className="h-6 min-w-0 flex-1 px-1 font-mono text-[10px]"
        />
        {part.color !== undefined && (
          <Btn size="sm" variant="ghost" onClick={() => onPatch({ color: undefined })}>×</Btn>
        )}
      </div>

      <Num label={s.emissive} value={part.emissive ?? 1} step={0.1} onChange={(value) => onPatch({ emissive: value })} />
      <Num label={s.opacity} value={part.opacity ?? 1} step={0.05} onChange={(value) => onPatch({ opacity: value })} />

      <div className="flex items-center justify-between border-b border-[var(--cn-line-soft)] pb-1">
        <span className="text-[11px] text-[var(--cn-ink-2)]">{s.spin}</span>
        <Toggle on={part.spin === true} onChange={(on) => onPatch({ spin: on })} />
      </div>
      <div className="flex items-center justify-between border-b border-[var(--cn-line-soft)] pb-1">
        <span className="text-[11px] text-[var(--cn-ink-2)]">{s.hidden}</span>
        <Toggle on={part.hidden === true} onChange={(on) => onPatch({ hidden: on })} />
      </div>
      <div className="flex items-center justify-between border-b border-[var(--cn-line-soft)] pb-1">
        <span className="text-[11px] text-[var(--cn-ink-2)]">{s.locked}</span>
        <Toggle on={part.locked === true} onChange={(on) => onPatch({ locked: on })} />
      </div>

      <span className="arc-label">{s.parent}</span>
      <div className="flex items-center gap-1">
        <span className="min-w-0 flex-1 truncate font-mono text-[10px] text-[var(--cn-ink-2)]">
          {parentName ?? s.none}
        </span>
        {parentName && (
          <Btn size="sm" variant="ghost" onClick={onUnparent}>{s.unparent}</Btn>
        )}
      </div>

      {footer && <div className="shrink-0 border-t border-[var(--cn-line-soft)] pt-2">{footer}</div>}
    </div>
  );
}
