/**
 * 塔的自訂 3D 模型編輯器（部件組合）
 *
 * 只編 Custom3DModel.parts：形狀、材質角色、位置、旋轉、縮放、自轉。
 * 預覽直接用 Tower3DPreview（與遊戲內同一支 buildTowerModel），所以看到的就是實際樣子。
 */
import { useEffect, useState } from 'react';
import { useTranslation } from '@/i18n';
import type { Custom3DPart, Custom3DModel } from '@/types/game';
import { Btn, Input, SegHead, Toggle } from '@/components/hl';
import { Tower3DPreview } from '@/components/ui/Model3DPreview';

const MATERIALS: Custom3DPart['material'][] = ['metal', 'trim', 'accent', 'glow', 'gold'];

const DEFAULT_PART: Custom3DPart = {
  id: 'part',
  shape: 'box',
  material: 'metal',
  x: 0,
  y: 0,
  z: 0,
  rx: 0,
  ry: 0,
  rz: 0,
  scale: 1,
};

interface TowerModelEditorProps {
  towerId: string;
  color?: string;
  model?: Custom3DModel;
  onChange: (next: Custom3DModel | undefined) => void;
}

function Num({ label, value, onChange, step = 0.1 }: { label: string; value: number; onChange: (next: number) => void; step?: number }) {
  return (
    <label className="flex flex-col gap-0.5">
      <span className="font-mono text-[9px] text-[var(--cn-ink-3)]">{label}</span>
      <Input
        type="number"
        step={step}
        value={value}
        onChange={(event) => {
          const parsed = Number(event.target.value);
          onChange(Number.isFinite(parsed) ? parsed : 0);
        }}
        className="h-6 w-full px-1 text-right font-mono text-[10.5px]"
      />
    </label>
  );
}

export function TowerModelEditor({ towerId, color, model, onChange }: TowerModelEditorProps) {
  const { t } = useTranslation();
  const s = t.studio.assets.editor;
  const [shapes, setShapes] = useState<string[]>(['box']);

  useEffect(() => {
    let alive = true;
    void import('@/components/scenes/game-scene/three/towerModels3d').then((module) => {
      if (alive) setShapes(Object.keys(module.TOWER_PART_SHAPES));
    });
    return () => {
      alive = false;
    };
  }, []);

  const parts = model?.parts ?? [];

  const write = (next: Custom3DPart[]): void => {
    onChange(next.length > 0 ? { parts: next } : undefined);
  };

  const patchPart = (index: number, patch: Partial<Custom3DPart>): void => {
    write(parts.map((part, i) => (i === index ? { ...part, ...patch } : part)));
  };

  return (
    <div className="flex flex-col gap-2">
      <SegHead
        label={s.model3d}
        right={(
          <span className="flex items-center gap-1">
            <Btn
              size="sm"
              variant="line"
              onClick={() => write([...parts, { ...DEFAULT_PART, id: 'part_' + Date.now() }])}
            >
              {s.addPart}
            </Btn>
            {parts.length > 0 && (
              <Btn size="sm" variant="ghost" onClick={() => onChange(undefined)}>{s.clearModel}</Btn>
            )}
          </span>
        )}
      />

      <Tower3DPreview towerId={towerId} color={color} custom3d={model} height={170} />

      {parts.length === 0 ? (
        <p className="font-mono text-[10px] text-[var(--cn-ink-3)]">{s.noParts}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {parts.map((part, index) => (
            <div key={part.id} className="flex flex-col gap-1 border border-[var(--cn-line-soft)] p-1.5">
              <div className="flex items-center gap-1.5">
                <select
                  value={part.shape}
                  onChange={(event) => patchPart(index, { shape: event.target.value })}
                  className="h-6 min-w-0 flex-1 border border-[var(--cn-line)] bg-[var(--cn-card)] px-1 font-mono text-[10px]"
                >
                  {shapes.map((shape) => (
                    <option key={shape} value={shape}>{shape}</option>
                  ))}
                </select>
                <select
                  value={part.material}
                  onChange={(event) => patchPart(index, { material: event.target.value as Custom3DPart['material'] })}
                  className="h-6 w-24 border border-[var(--cn-line)] bg-[var(--cn-card)] px-1 font-mono text-[10px]"
                >
                  {MATERIALS.map((material) => (
                    <option key={material} value={material}>{material}</option>
                  ))}
                </select>
                <label className="flex items-center gap-1 font-mono text-[9px] text-[var(--cn-ink-3)]">
                  {s.spin}
                  <Toggle on={part.spin === true} onChange={(on) => patchPart(index, { spin: on })} />
                </label>
                <Btn
                  size="sm"
                  variant="ghost"
                  onClick={() => write(parts.filter((_, i) => i !== index))}
                >
                  {s.removePart}
                </Btn>
              </div>
              <div className="grid grid-cols-6 gap-1">
                <Num label="x" value={part.x} onChange={(x) => patchPart(index, { x })} />
                <Num label="y" value={part.y} onChange={(y) => patchPart(index, { y })} />
                <Num label="z" value={part.z} onChange={(z) => patchPart(index, { z })} />
                <Num label="rx" value={part.rx} onChange={(rx) => patchPart(index, { rx })} />
                <Num label="ry" value={part.ry} onChange={(ry) => patchPart(index, { ry })} />
                <Num label="rz" value={part.rz} onChange={(rz) => patchPart(index, { rz })} />
              </div>
              <Num label={s.scale} value={part.scale} onChange={(scale) => patchPart(index, { scale })} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
