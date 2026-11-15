/**
 * 地圖工作台 · 左側工具軌
 *
 * 天際線式版面：工具與圖層收進左側直欄，畫布拿到完整的橫向空間。
 * 舊版把工具 Chip、圖層 Toggle、播放控制、2D/3D 全塞在頂部一條，
 * 畫布被壓成一個小視窗。
 */
import { Chip, Toggle } from '@/components/hl';
import { useTranslation } from '@/i18n';
import { PinIcon, ConstructionIcon, TowerIcon, TrashIcon } from '@/components/ui/Icons';

export type MapTool = 'waypoint' | 'blocked' | 'tower' | 'erase';

export interface MapToolRailProps {
  tool: MapTool;
  onToolChange: (tool: MapTool) => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  showCoords: boolean;
  onToggleCoords: () => void;
  showArrows: boolean;
  onToggleArrows: () => void;
  disabled: boolean;
}

const TOOL_ICONS: Record<MapTool, React.ReactNode> = {
  waypoint: <PinIcon className="h-4 w-4" />,
  blocked: <ConstructionIcon className="h-4 w-4" />,
  tower: <TowerIcon className="h-4 w-4" />,
  erase: <TrashIcon className="h-4 w-4" />,
};

export function MapToolRail({
  tool,
  onToolChange,
  showGrid,
  onToggleGrid,
  showCoords,
  onToggleCoords,
  showArrows,
  onToggleArrows,
  disabled,
}: MapToolRailProps) {
  const { t } = useTranslation();
  const s = t.studio.map;

  const tools: { id: MapTool; label: string }[] = [
    { id: 'waypoint', label: s.tool.waypoint },
    { id: 'blocked', label: s.tool.blocked },
    { id: 'tower', label: s.tool.tower },
    { id: 'erase', label: s.tool.erase },
  ];

  const layers: { label: string; on: boolean; toggle: () => void }[] = [
    { label: s.layers.grid, on: showGrid, toggle: onToggleGrid },
    { label: s.layers.coords, on: showCoords, toggle: onToggleCoords },
    { label: s.layers.arrows, on: showArrows, toggle: onToggleArrows },
  ];

  return (
    <aside className="flex w-[76px] shrink-0 flex-col gap-2 border-r-[3px] border-[var(--cn-line-soft)] bg-[var(--cn-card)] px-1.5 py-2">
      <span className="px-1 font-mono text-[8.5px] uppercase tracking-[0.16em] text-[var(--cn-ink-4)]">
        tool
      </span>
      {tools.map((item) => {
        const active = tool === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onToolChange(item.id)}
            disabled={disabled}
            aria-pressed={active}
            title={item.label}
            className={[
              'flex flex-col items-center gap-1 rounded-[10px] border-[2px] py-2 transition-colors disabled:opacity-40',
              active
                ? 'border-[var(--cn-line)] bg-[var(--cn-sun-soft)] text-[var(--cn-ink)] shadow-[0_2px_0_var(--cn-sun-deep)]'
                : 'border-transparent text-[var(--cn-ink-3)] hover:bg-[var(--cn-card-2)] hover:text-[var(--cn-ink)]',
            ].join(' ')}
          >
            {TOOL_ICONS[item.id]}
            <span className="text-[9.5px] font-bold leading-none">{item.label}</span>
          </button>
        );
      })}

      <span className="mt-1 h-px w-full bg-[var(--cn-line-soft)]" />
      <span className="px-1 font-mono text-[8.5px] uppercase tracking-[0.16em] text-[var(--cn-ink-4)]">
        layers
      </span>
      {layers.map((layer) => (
        <label
          key={layer.label}
          className="flex flex-col items-center gap-1 rounded-[8px] py-1.5 text-[var(--cn-ink-3)] hover:bg-[var(--cn-card-2)]"
        >
          <Toggle on={layer.on} onChange={layer.toggle} label={layer.label} />
          <span className="text-[9px] font-bold leading-none">{layer.label}</span>
        </label>
      ))}
    </aside>
  );
}