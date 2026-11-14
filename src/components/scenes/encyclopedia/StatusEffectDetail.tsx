/**
 * 圖鑑 · 狀態效果詳情（HARDLINE 詳情欄）
 */
import type React from 'react';
import { SegHead, StatCell } from '@/components/hl';
import {
  ChartIcon, RefreshIcon, WarningIcon, SparklesIcon, LightbulbIcon, PaletteIcon,
} from '@/components/ui/Icons';
import { STATUS_EFFECTS } from '@/data/gameData';
import type { StatusEffectType } from '@/types/game';
import { getStatusEffectIcon } from './EncyclopediaIcons';
import { EncyclopediaSourceLinks } from './EncyclopediaSourceLinks';
import { useTranslation } from '@/i18n';

interface StatusEffectDetailProps {
  selectedItem: string;
  allStatusEffects: StatusEffectType[];
  onOpenFile?: (path: string) => void;
}

const panel = 'border border-[var(--hl-line)] bg-[var(--hl-deck)] p-2.5';

export function StatusEffectDetail({ selectedItem, allStatusEffects, onOpenFile }: StatusEffectDetailProps) {
  const { t } = useTranslation();
  const effectType = allStatusEffects.includes(selectedItem as StatusEffectType) ? selectedItem as StatusEffectType : null;

  if (!effectType) {
    return (
      <div className="flex min-h-[260px] h-full items-center justify-center px-4 text-center">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-[var(--hl-ink-4)]">
          {t.encyclopedia.selectEffectHint}
        </span>
      </div>
    );
  }

  const effectData = STATUS_EFFECTS[effectType];
  const effectDesc = (t.encyclopedia.statusDescriptions as Record<string, string>)[effectType] ?? '';
  const EffectIcon = getStatusEffectIcon(effectType);

  return (
    <div className="flex flex-col gap-4">
      {/* Hero */}
      <div className="flex items-start gap-3 border-b border-[var(--hl-line)] pb-3">
        <span
          className="flex h-14 w-14 shrink-0 items-center justify-center border"
          style={{ borderColor: `${effectData.color}66`, backgroundColor: `${effectData.color}12` }}
        >
          <EffectIcon className="h-7 w-7" style={{ color: effectData.color } as React.CSSProperties} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <h3 className="truncate text-[17px] font-semibold leading-tight tracking-[-0.01em] text-[var(--hl-ink)]">
            {effectData.name}
          </h3>
          <div className="flex items-center gap-1.5">
            <span
              className={`border px-1.5 py-0.5 font-mono text-[9.5px] uppercase leading-none tracking-[0.08em] ${
                effectData.isDebuff
                  ? 'border-[var(--hl-alarm)] text-[var(--hl-alarm)]'
                  : 'border-[var(--hl-vital)] text-[var(--hl-vital)]'
              }`}
            >
              {effectData.isDebuff ? t.encyclopedia.detailDebuff : t.encyclopedia.detailBuff}
            </span>
          </div>
        </div>
      </div>

      <p className="text-[12px] leading-relaxed text-[var(--hl-ink-2)]">{effectData.description}</p>

      {/* 效果屬性 */}
      <div className="flex flex-col gap-2">
        <SegHead label={t.encyclopedia.detailEffectAttributes} />
        <div className="grid grid-cols-2 gap-2">
          <div className={panel}>
            <StatCell
              label={<span className="flex items-center gap-1"><RefreshIcon className="h-3 w-3" />{t.encyclopedia.detailStackable}</span>}
              value={effectData.canStack ? t.encyclopedia.yes : t.encyclopedia.no}
              tone={effectData.canStack ? 'vital' : 'alarm'}
            />
          </div>
          <div className={panel}>
            <StatCell
              label={<span className="flex items-center gap-1"><ChartIcon className="h-3 w-3" />{t.encyclopedia.detailMaxStacks}</span>}
              value={effectData.maxStacks}
              unit={t.encyclopedia.detailStackUnit}
              tone="reach"
            />
          </div>
        </div>
      </div>

      {/* 分類說明 */}
      <div className="flex flex-col gap-2">
        <SegHead
          label={t.encyclopedia.detailEffectCategory}
          right={<span className="text-[var(--hl-caution)]"><LightbulbIcon className="h-3 w-3" /></span>}
        />
        <div
          className="flex flex-col gap-2 border px-2.5 py-2"
          style={{ borderColor: `${effectData.color}40`, backgroundColor: `${effectData.color}0d` }}
        >
          <div className="flex items-center gap-1.5">
            <span
              className={`flex h-5 w-5 items-center justify-center border ${
                effectData.isDebuff ? 'border-[var(--hl-alarm)] text-[var(--hl-alarm)]' : 'border-[var(--hl-vital)] text-[var(--hl-vital)]'
              }`}
            >
              {effectData.isDebuff ? <WarningIcon className="h-3 w-3" /> : <SparklesIcon className="h-3 w-3" />}
            </span>
            <span className="hl-label text-[var(--hl-ink-2)]">
              {effectData.isDebuff ? t.encyclopedia.detailDebuff : t.encyclopedia.detailBuff}
            </span>
          </div>
          <p className="text-[11px] leading-relaxed text-[var(--hl-ink-3)]">
            {effectData.isDebuff ? t.encyclopedia.detailDebuffDesc : t.encyclopedia.detailBuffDesc}
          </p>
          {effectDesc && (
            <p className="border-t border-[var(--hl-line)] pt-2 text-[11px] leading-relaxed text-[var(--hl-ink-2)]">
              {effectDesc}
            </p>
          )}
        </div>
      </div>

      {/* 視覺標識 */}
      <div className="flex flex-col gap-2">
        <SegHead
          label={t.encyclopedia.detailVisualMark}
          right={<span className="text-[var(--hl-ink-3)]"><PaletteIcon className="h-3 w-3" /></span>}
        />
        <div className="flex items-center gap-2 border border-[var(--hl-line)] px-2.5 py-2">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center border"
            style={{ backgroundColor: `${effectData.color}30`, borderColor: `${effectData.color}70` }}
          >
            <EffectIcon className="h-4 w-4" style={{ color: effectData.color } as React.CSSProperties} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="hl-label">{t.encyclopedia.detailEffectColor}</span>
            <span
              className="mt-0.5 block border border-[var(--hl-line)] bg-[var(--hl-void-2)] px-1.5 py-0.5 font-mono text-[11px] tabular-nums"
              style={{ color: effectData.color }}
            >
              {effectData.color}
            </span>
          </span>
        </div>
      </div>

      {onOpenFile && (
        <div className="border-t border-[var(--hl-line)] pt-3">
          <EncyclopediaSourceLinks tab="effects" itemId={effectType} onOpenFile={onOpenFile} />
        </div>
      )}
    </div>
  );
}
