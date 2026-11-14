/**
 * Mod 管理器 · 右欄詳情 — HARDLINE
 *
 * 上：1px 外框預覽（深底，不加陰影）；中：mono 欄位列；下：動作直向堆疊。
 */
import type React from 'react';
import { useState } from 'react';
import { useTranslation } from '@/i18n';
import { useModStore } from '@/store/modStore';
import type { Mod } from '@/types/game';
import { Btn, Deck, Dot, Empty, Field, Num, SegHead } from '@/components/hl';
import {
  TowerIcon, AlienIcon, MapIcon, WaterWaveIcon,
  CheckIcon, DownloadIcon, TrashIcon, PlusIcon, ThemeIcon,
} from '@/components/ui/Icons';
import { MOD_TYPE_CONFIG } from './ModCard';
import { renderModIcon } from '@/components/ui/ModIcon';
import { ModBalanceScoreBadge } from '@/components/mod-editor/ModBalanceScoreBadge';
import { ModBalanceAdvisor } from '@/components/mod-editor/ModBalanceAdvisor';

interface ModManagerDetailPanelProps {
  mod: Mod | null;
  onEdit?: () => void;
}

export function ModManagerDetailPanel({ mod, onEdit }: ModManagerDetailPanelProps) {
  const { t } = useTranslation();
  const d = t.modManager.detail;

  const uninstallMod = useModStore((s) => s.uninstallMod);
  const exportMod = useModStore((s) => s.exportMod);
  const enableMod = useModStore((s) => s.enableMod);
  const disableMod = useModStore((s) => s.disableMod);
  const setEditingMod = useModStore((s) => s.setEditingMod);

  const [showExport, setShowExport] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!mod) {
    return (
      <Empty
        title={<>{d.selectHintLine1}</>}
        hint={<>{d.selectHintLine2}</>}
        className="h-full"
      />
    );
  }

  const cfg = MOD_TYPE_CONFIG[mod.metadata.type];

  const handleToggle = () => {
    if (mod.enabled) disableMod(mod.metadata.id);
    else enableMod(mod.metadata.id);
  };

  const handleExport = () => {
    const json = exportMod(mod.metadata.id);
    navigator.clipboard.writeText(json);
    setShowExport(true);
    window.setTimeout(() => setShowExport(false), 2000);
  };

  const handleEdit = () => {
    setEditingMod(mod);
    onEdit?.();
  };

  const handleDelete = () => {
    uninstallMod(mod.metadata.id);
    setConfirmDelete(false);
  };

  const contentRows: Array<{ key: string; label: React.ReactNode; value: number; icon: React.ReactNode; tone: 'reach' | 'alarm' | 'vital' | 'ink' }> = [
    { key: 'towers', label: d.towers, value: mod.content.towers?.length || 0, icon: <TowerIcon className="h-3 w-3" />, tone: 'reach' },
    { key: 'enemies', label: d.enemies, value: mod.content.enemies?.length || 0, icon: <AlienIcon className="h-3 w-3" />, tone: 'alarm' },
    { key: 'maps', label: d.maps, value: mod.content.maps?.length || 0, icon: <MapIcon className="h-3 w-3" />, tone: 'vital' },
    { key: 'waves', label: d.waves, value: mod.content.waves?.length || 0, icon: <WaterWaveIcon className="h-3 w-3" />, tone: 'ink' },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      {/* 預覽框：外框 1px，內部深底，不加陰影 */}
      <Deck tone="sunken" className="relative flex h-[132px] shrink-0 items-center justify-center overflow-hidden">
        {renderModIcon(
          mod.metadata.icon,
          <ThemeIcon icon={cfg.icon} className="h-12 w-12" />,
          'h-12 w-12 text-[var(--arc-ink-2)]',
          { rounded: '', translateFactor: 0.3, scaleFactor: 0.6 },
        )}
        <span className="absolute left-2 top-2 flex items-center gap-1.5 border-[3px] border-[var(--cn-line-soft)] bg-[var(--arc-void)] px-1.5 py-0.5">
          <Dot tone={mod.enabled ? 'vital' : 'ink'} />
          <span className={`font-mono text-[9px] uppercase tracking-[0.1em] ${mod.enabled ? 'text-[var(--arc-vital)]' : 'text-[var(--arc-ink-3)]'}`}>
            {mod.enabled ? d.enabled : d.disabled}
          </span>
        </span>
        <span className="absolute right-2 top-2 border-[3px] border-[var(--cn-line-soft)] bg-[var(--arc-void)] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--arc-ink-3)]">
          {t.workshop.modManagerExt[cfg.labelKey]}
        </span>
      </Deck>

      {/* 識別 */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="arc-title min-w-0 text-[15px] font-semibold leading-tight text-[var(--arc-ink)]">
            {mod.metadata.name}
          </h3>
          <ModBalanceScoreBadge mod={mod} size="md" />
        </div>
        <p className="arc-micro">{mod.metadata.description}</p>
        <div className="flex items-center gap-1.5 font-mono text-[10px] tabular-nums arc-num text-[var(--arc-ink-4)]">
          <span>v{mod.metadata.version}</span>
          <span className="text-[var(--arc-line-hot)]">·</span>
          <span className="truncate">{mod.metadata.author}</span>
        </div>
      </div>

      {/* 內容統計 */}
      <div>
        <SegHead label={d.contentStats} className="mb-1" />
        {contentRows.map((row) => (
          <Field
            key={row.key}
            label={
              <span className="flex items-center gap-1.5">
                <span className="text-[var(--arc-ink-4)]">{row.icon}</span>
                {row.label}
              </span>
            }
          >
            <Num value={String(row.value).padStart(2, '0')} tone={row.tone} size="sm" />
          </Field>
        ))}
      </div>

      {mod.metadata.tags && mod.metadata.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {mod.metadata.tags.map((tag) => (
            <span
              key={tag}
              className="border-[3px] border-[var(--cn-line-soft)] px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.06em] text-[var(--arc-ink-3)]"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <ModBalanceAdvisor
        towers={mod.content.towers ?? []}
        enemies={mod.content.enemies ?? []}
        waves={mod.content.waves ?? []}
      />

      {/* 動作 */}
      <div className="mt-auto flex flex-col gap-1.5 pt-2">
        <Btn
          block
          variant={mod.enabled ? 'line' : 'signal'}
          onClick={handleToggle}
          icon={mod.enabled ? <CheckIcon className="h-3.5 w-3.5" /> : undefined}
        >
          {mod.enabled ? d.disable : d.enable}
        </Btn>
        {onEdit && (
          <Btn block variant="line" onClick={handleEdit} icon={<PlusIcon className="h-3.5 w-3.5" />}>
            {d.edit}
          </Btn>
        )}
        <Btn
          block
          variant="line"
          onClick={handleExport}
          icon={showExport ? <CheckIcon className="h-3.5 w-3.5 text-[var(--arc-vital)]" /> : <DownloadIcon className="h-3.5 w-3.5" />}
        >
          {showExport ? d.copiedJson : d.exportJson}
        </Btn>
        {confirmDelete ? (
          <div className="flex flex-col gap-1.5">
            <Btn block variant="danger" onClick={handleDelete} icon={<TrashIcon className="h-3.5 w-3.5" />}>
              {d.confirmRemove}
            </Btn>
            <Btn size="sm" variant="ghost" block onClick={() => setConfirmDelete(false)}>
              {d.cancel}
            </Btn>
          </div>
        ) : (
          <Btn block variant="danger" onClick={() => setConfirmDelete(true)} icon={<TrashIcon className="h-3.5 w-3.5" />}>
            {d.remove}
          </Btn>
        )}
      </div>
    </div>
  );
}

export default ModManagerDetailPanel;
