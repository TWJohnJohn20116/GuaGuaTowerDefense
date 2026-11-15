/**
 * 地圖工作台工具列
 *
 * 只負責「選擇模式」與「顯示開關」，不持有編輯狀態（狀態由 MapWorkbench 持有）。
 * 視覺沿用 hl 的 Chip / Btn / Toggle 與 --cn-* token，視角切換重用遊戲本體的 ViewModeToggle。
 */
import { Btn, Chip, Toggle } from '@/components/hl';
import { useTranslation } from '@/i18n';
import { ViewModeToggle } from '@/components/scenes/game-scene/three/ViewModeToggle';

export type MapTool = 'waypoint' | 'blocked' | 'tower' | 'erase';

export interface MapToolbarProps {
  tool: MapTool;
  onToolChange: (tool: MapTool) => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  showCoords: boolean;
  onToggleCoords: () => void;
  showArrows: boolean;
  onToggleArrows: () => void;
  view: '2d' | '3d';
  onToggleView: () => void;
  playing: boolean;
  onTogglePlay: () => void;
  onResetPlayback: () => void;
  progress: number;
  speed: number;
  onSpeedChange: (value: number) => void;
  /** 沒有選到關卡時整列停用 */
  disabled: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

const SPEEDS: { value: number; label: string }[] = [
  { value: 1.5, label: '0.5x' },
  { value: 3, label: '1x' },
  { value: 6, label: '2x' },
];

export function MapToolbar({
  tool,
  onToolChange,
  showGrid,
  onToggleGrid,
  showCoords,
  onToggleCoords,
  showArrows,
  onToggleArrows,
  view,
  onToggleView,
  playing,
  onTogglePlay,
  onResetPlayback,
  progress,
  speed,
  onSpeedChange,
  disabled,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: MapToolbarProps) {
  const { t } = useTranslation();
  const s = t.studio.map;
  const undoRedo = (
    <span className="flex items-center gap-1">
      <Btn size="sm" variant="line" onClick={onUndo} disabled={disabled || !canUndo}>{s.undo}</Btn>
      <Btn size="sm" variant="line" onClick={onRedo} disabled={disabled || !canRedo}>{s.redo}</Btn>
    </span>
  );

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-[var(--cn-r-lg)] border-[3px] border-[var(--cn-line)] bg-[var(--cn-card)] p-2 shadow-[0_5px_0_-1px_rgba(46,36,64,0.18)]">
      <div className="flex flex-wrap items-center gap-1.5">
        <Chip active={tool === 'waypoint'} onClick={() => onToolChange('waypoint')}>
          {s.tool.waypoint}
        </Chip>
        <Chip active={tool === 'blocked'} onClick={() => onToolChange('blocked')}>
          {s.tool.blocked}
        </Chip>
        <Chip active={tool === 'tower'} onClick={() => onToolChange('tower')}>
          {s.tool.tower}
        </Chip>
        <Chip active={tool === 'erase'} onClick={() => onToolChange('erase')}>
          {s.tool.erase}
        </Chip>
      </div>

      {undoRedo}

      <span className="mx-1 hidden h-7 w-[3px] rounded-full bg-[var(--cn-line-soft)] sm:block" />

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-1.5">
          <Toggle on={showGrid} onChange={onToggleGrid} label={s.layers.grid} />
          <span className="arc-label">{s.layers.grid}</span>
        </label>
        <label className="flex items-center gap-1.5">
          <Toggle on={showCoords} onChange={onToggleCoords} label={s.layers.coords} />
          <span className="arc-label">{s.layers.coords}</span>
        </label>
        <label className="flex items-center gap-1.5">
          <Toggle on={showArrows} onChange={onToggleArrows} label={s.layers.arrows} />
          <span className="arc-label">{s.layers.arrows}</span>
        </label>
      </div>

      <span className="mx-1 hidden h-7 w-[3px] rounded-full bg-[var(--cn-line-soft)] sm:block" />

      <div className="flex items-center gap-2">
        <Btn size="sm" variant={playing ? 'signal' : 'line'} onClick={onTogglePlay} disabled={disabled}>
          {playing ? s.playback.pause : s.playback.play}
        </Btn>
        <Btn size="sm" variant="ghost" onClick={onResetPlayback} disabled={disabled}>
          {s.playback.reset}
        </Btn>
        <div className="flex items-center gap-1">
          {SPEEDS.map((item) => (
            <Chip
              key={item.value}
              active={speed === item.value}
              onClick={() => onSpeedChange(item.value)}
             
            >
              {item.label}
            </Chip>
          ))}
        </div>
        <span className="flex min-w-[92px] items-center gap-2">
          <span className="h-[10px] w-full overflow-hidden rounded-full border-2 border-[var(--cn-line)] bg-[var(--cn-card-2)]">
            <span
              className="block h-full rounded-full bg-[var(--cn-coral)] transition-[width] duration-100 ease-linear"
              style={{ width: Math.max(2, Math.round(progress * 100)) + '%' }}
            />
          </span>
        </span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <ViewModeToggle mode={view} onToggle={onToggleView} />
      </div>
    </div>
  );
}
