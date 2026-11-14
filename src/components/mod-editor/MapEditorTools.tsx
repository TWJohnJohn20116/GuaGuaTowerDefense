/**
 * Mod 地圖編輯器 · 工具列與驗證列 — HARDLINE
 *
 * 工具列是一整條 h-11 帶狀：工具組｜1px 垂直線｜右側動作。
 * 驗證列用 Dot + mono 標籤，四格之間只有 1px 線。
 */
import type React from 'react';
import {
  TrashIcon, DiceIcon, PencilIcon, PlayIcon, PinIcon, BoxIcon,
} from '@/components/ui/Icons';
import { useTranslation } from '@/i18n';
import { fillTemplate } from '@/i18n/fileMetaExtraLabels';
import { Btn, Dot, Rule } from '@/components/hl';

export type EditorTool = 'path' | 'start' | 'end' | 'eraser';

const TOOL_ICON: Record<EditorTool, React.ReactNode> = {
  path: <PencilIcon className="h-3.5 w-3.5" />,
  start: <PlayIcon className="h-3.5 w-3.5" />,
  end: <PinIcon className="h-3.5 w-3.5" />,
  eraser: <BoxIcon className="h-3.5 w-3.5" />,
};

/** 舊介面用 tailwind 名稱傳色，這裡接回四個資料色。 */
const TOOL_TINT: Record<string, string> = {
  blue: 'text-[var(--arc-reach)]',
  green: 'text-[var(--arc-vital)]',
  red: 'text-[var(--arc-alert)]',
  orange: 'text-[var(--arc-caution)]',
};

export const ToolButton = ({
  tool,
  currentTool,
  onClick,
  icon,
  label,
  color,
}: {
  tool: EditorTool;
  currentTool: EditorTool;
  onClick: () => void;
  icon: string;
  label: string;
  color: string;
}) => {
  const isActive = currentTool === tool;
  // emoji 只留給舊呼叫端，畫面上一律用 SVG。
  void icon;

  return (
    <Btn
      size="sm"
      variant="line"
      onClick={onClick}
      aria-pressed={isActive}
      className={
        isActive
          ? 'border-[var(--arc-gold)] bg-[var(--arc-gold-veil)] text-[var(--arc-gold)]'
          : undefined
      }
      icon={<span className={isActive ? '' : TOOL_TINT[color] ?? 'text-[var(--arc-ink-2)]'}>{TOOL_ICON[tool]}</span>}
    >
      {label}
    </Btn>
  );
};

export const MapEditorToolbar = ({
  currentTool,
  onToolChange,
  onClear,
  onAutoGenerate,
  canAutoGenerate,
}: {
  currentTool: EditorTool;
  onToolChange: (tool: EditorTool) => void;
  onClear: () => void;
  onAutoGenerate: () => void;
  canAutoGenerate: boolean;
}) => {
  const { t } = useTranslation();
  const me = t.mapEditor;
  return (
    <div className="flex h-11 shrink-0 items-center gap-1.5 border-b border-[var(--cn-line-soft)] bg-[var(--arc-void)] px-3">
      <div className="flex items-center gap-1.5">
        <ToolButton tool="path" currentTool={currentTool} onClick={() => onToolChange('path')} icon="🛤️" label={me.toolPath} color="blue" />
        <ToolButton tool="start" currentTool={currentTool} onClick={() => onToolChange('start')} icon="🟢" label={me.setStart} color="green" />
        <ToolButton tool="end" currentTool={currentTool} onClick={() => onToolChange('end')} icon="🔴" label={me.setEnd} color="red" />
        <ToolButton tool="eraser" currentTool={currentTool} onClick={() => onToolChange('eraser')} icon="🧹" label={me.toolEraser} color="orange" />
      </div>

      <Rule vertical className="mx-1.5 h-5" />

      <div className="ml-auto flex items-center gap-1.5">
        <Btn
          size="sm"
          variant="danger"
          onClick={onClear}
          icon={<TrashIcon className="h-3.5 w-3.5" />}
        >
          {me.clearPath}
        </Btn>

        <Btn
          size="sm"
          variant="line"
          onClick={onAutoGenerate}
          disabled={!canAutoGenerate}
          icon={<DiceIcon className="h-3.5 w-3.5" />}
        >
          {me.autoGenerate}
        </Btn>
      </div>
    </div>
  );
};

/** 單一驗證格：Dot 標記 + mono 文字，不用色塊背景。 */
function ValCell({
  ok,
  label,
  tone = 'vital',
}: {
  ok: boolean;
  label: React.ReactNode;
  tone?: 'vital' | 'alarm';
}) {
  const active = ok ? (tone === 'vital' ? 'text-[var(--arc-vital)]' : 'text-[var(--arc-alert)]') : 'text-[var(--arc-ink-3)]';
  return (
    <div className="flex items-center gap-2 bg-[var(--arc-deck)] px-3 py-2">
      <Dot tone={ok ? tone : 'ink'} />
      <span className={`font-mono text-[10px] tracking-[0.06em] ${active}`}>{label}</span>
    </div>
  );
}

export const MapValidation = ({
  hasStart,
  hasEnd,
  pathLength,
  isValid,
}: {
  hasStart: boolean;
  hasEnd: boolean;
  pathLength: number;
  isValid: boolean;
}) => {
  const { t } = useTranslation();
  const m = t.modEditorExt;
  return (
    <div className="grid grid-cols-4 gap-px border-[3px] border-[var(--cn-line-soft)] bg-[var(--arc-line)]">
      <ValCell ok={hasStart} label={m.mapValStart} />
      <ValCell ok={hasEnd} label={m.mapValEnd} />
      <ValCell ok={pathLength >= 10} label={fillTemplate(m.mapValPathLen, { len: String(pathLength) })} />
      <ValCell
        ok={isValid}
        tone={isValid ? 'vital' : 'alarm'}
        label={isValid ? m.mapValValid : m.mapValInvalid}
      />
    </div>
  );
};
