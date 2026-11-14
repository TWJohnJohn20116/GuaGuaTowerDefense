/**
 * 圖鑑 · 主動技能詳情（HARDLINE 詳情欄）
 */
import type React from 'react';
import { SegHead, StatCell } from '@/components/hl';
import {
  TimerIcon, HourglassIcon, KeyboardIcon, SparklesIcon,
  TargetIcon, ChartIcon, LightbulbIcon, PaletteIcon,
} from '@/components/ui/Icons';
import type { PlayerSkill, PlayerSkillId } from '@/data/playerSkillData';
import { PLAYER_SKILL_BY_ID } from '@/data/playerSkillData';
import { getPlayerSkillIcon } from './EncyclopediaIcons';
import { EncyclopediaSourceLinks } from './EncyclopediaSourceLinks';
import { useTranslation } from '@/i18n';
import { getPlayerSkillName, getPlayerSkillDesc } from '@/i18n/playerSkillLabels';

interface PlayerSkillDetailProps {
  selectedItem: string;
  onOpenFile?: (path: string) => void;
}

const panel = 'border border-[var(--hl-line)] bg-[var(--hl-deck)] p-2.5';

export function PlayerSkillDetail({ selectedItem, onOpenFile }: PlayerSkillDetailProps) {
  const { t } = useTranslation();
  const e = t.encyclopedia;
  const skillId = selectedItem as PlayerSkillId;
  const skill: PlayerSkill | undefined = PLAYER_SKILL_BY_ID[skillId];

  if (!skill) {
    return (
      <div className="flex min-h-[260px] h-full items-center justify-center px-4 text-center">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-[var(--hl-ink-4)]">
          {e.selectSkillHint}
        </span>
      </div>
    );
  }

  const Icon = getPlayerSkillIcon(skill.effectKey);
  const tips = e.skillTips[skillId] ?? [];

  return (
    <div className="flex flex-col gap-4">
      {/* Hero */}
      <div className="flex items-start gap-3 border-b border-[var(--hl-line)] pb-3">
        <span
          className="flex h-14 w-14 shrink-0 items-center justify-center border"
          style={{ borderColor: `${skill.iconColor}66`, backgroundColor: `${skill.iconColor}12` }}
        >
          <Icon className="h-7 w-7" style={{ color: skill.iconColor } as React.CSSProperties} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <h3 className="truncate text-[17px] font-semibold leading-tight tracking-[-0.01em] text-[var(--hl-ink)]">
            {getPlayerSkillName(skill, t)}
          </h3>
          <div>
            <span className="border border-[var(--hl-signal-edge)] px-1.5 py-0.5 font-mono text-[9.5px] uppercase leading-none tracking-[0.08em] text-[var(--hl-signal)]">
              {e.detailActiveSkillTag}
            </span>
          </div>
        </div>
      </div>

      <p className="text-[12px] leading-relaxed text-[var(--hl-ink-2)]">{getPlayerSkillDesc(skill, t)}</p>

      {/* 參數 */}
      <div className="flex flex-col gap-2">
        <SegHead
          label={e.detailSkillParams}
          right={<span className="text-[var(--hl-ink-4)]"><ChartIcon className="h-3 w-3" /></span>}
        />
        <div className="grid grid-cols-3 gap-2">
          <div className={panel}>
            <StatCell
              label={<span className="flex items-center gap-1"><TimerIcon className="h-3 w-3" />{e.detailCooldownTime}</span>}
              value={`${skill.cooldown / 1000}s`}
              tone="reach"
            />
          </div>
          <div className={panel}>
            <StatCell
              label={<span className="flex items-center gap-1"><HourglassIcon className="h-3 w-3" />{e.detailDurationTime}</span>}
              value={skill.duration ? `${skill.duration / 1000}s` : e.detailNoDuration}
              tone="vital"
            />
          </div>
          <div className={panel}>
            <StatCell
              label={<span className="flex items-center gap-1"><KeyboardIcon className="h-3 w-3" />{e.detailHotkeyLabel}</span>}
              value={`[${skill.hotkey}]`}
              tone="signal"
            />
          </div>
        </div>
      </div>

      {/* 使用提示 */}
      {tips.length > 0 && (
        <div className="flex flex-col gap-2">
          <SegHead
            label={e.detailUsageTips}
            right={<span className="text-[var(--hl-caution)]"><LightbulbIcon className="h-3 w-3" /></span>}
          />
          {tips.map((tip, idx) => (
            <div key={idx} className="flex items-start gap-2 border border-[var(--hl-line)] px-2.5 py-2">
              <span className="shrink-0 border border-[var(--hl-line)] px-1 py-0.5 font-mono text-[9.5px] tabular-nums leading-none text-[var(--hl-ink-3)]">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <span className="min-w-0 flex-1 text-[11px] leading-relaxed text-[var(--hl-ink-2)]">{tip}</span>
            </div>
          ))}
        </div>
      )}

      {/* 核心效果 */}
      <div className="flex flex-col gap-2">
        <SegHead
          label={e.detailEffectExplanation}
          right={<span className="text-[var(--hl-alarm)]"><TargetIcon className="h-3 w-3" /></span>}
        />
        <div
          className="flex flex-col gap-2 border px-2.5 py-2"
          style={{ borderColor: `${skill.iconColor}40`, backgroundColor: `${skill.iconColor}0d` }}
        >
          <div className="flex items-center gap-1.5">
            <span
              className="flex h-5 w-5 items-center justify-center border"
              style={{ borderColor: `${skill.iconColor}50`, color: skill.iconColor }}
            >
              <SparklesIcon className="h-3 w-3" />
            </span>
            <span className="hl-label text-[var(--hl-ink-2)]">{e.detailCoreEffect}</span>
          </div>
          <p className="text-[11px] leading-relaxed text-[var(--hl-ink-2)]">{getPlayerSkillDesc(skill, t)}</p>
        </div>
      </div>

      {/* 視覺主題 */}
      <div className="flex flex-col gap-2">
        <SegHead
          label={e.detailVisualTheme}
          right={<span className="text-[var(--hl-ink-3)]"><PaletteIcon className="h-3 w-3" /></span>}
        />
        <div className="flex items-center gap-2 border border-[var(--hl-line)] px-2.5 py-2">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center border"
            style={{ backgroundColor: `${skill.iconColor}30`, borderColor: `${skill.iconColor}60` }}
          >
            <Icon className="h-4 w-4" style={{ color: skill.iconColor } as React.CSSProperties} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="hl-label">{e.detailThemeColor}</span>
            <span
              className="mt-0.5 block border border-[var(--hl-line)] bg-[var(--hl-void-2)] px-1.5 py-0.5 font-mono text-[11px] tabular-nums"
              style={{ color: skill.iconColor }}
            >
              {skill.iconColor}
            </span>
          </span>
        </div>
      </div>

      {onOpenFile && (
        <div className="border-t border-[var(--hl-line)] pt-3">
          <EncyclopediaSourceLinks tab="skills" itemId={selectedItem} onOpenFile={onOpenFile} />
        </div>
      )}
    </div>
  );
}

export default PlayerSkillDetail;
