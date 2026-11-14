/**
 * 主動技能教學 — HARDLINE 規格文件版
 * 技能＝一條規格：名稱 + <Key> 熱鍵 + 數值格 + 使用條件。
 */

import {
  LightningIcon, SnowflakeIcon, CoinIcon, SwordsIcon, MeteorIcon, ChainLightningIcon, HealIcon, AegisIcon, WarpIcon, EmpIcon,
  TimerIcon, HourglassIcon, KeyboardIcon,
  LightbulbIcon, ShopIcon, RobotIcon, TargetIcon,
} from '@/components/ui/Icons';
import { Key } from '@/components/hl';
import { SpecCell, SpecGrid, SpecNote, SpecRow, SpecSection } from './TutorialPageComponents';
import { PLAYER_SKILLS } from '@/data/playerSkillData';
import type { PlayerSkill } from '@/data/playerSkillData';
import { PLAYER_SKILL_SHOP_PRICES } from '@/store/shopStore';
import { useTranslation } from '@/i18n';
import { getPlayerSkillName, getPlayerSkillDesc } from '@/i18n/playerSkillLabels';

const ICON_MAP: Record<PlayerSkill['effectKey'], React.FC<{ className?: string; style?: React.CSSProperties }>> = {
  lightning: LightningIcon,
  freeze: SnowflakeIcon,
  cash: CoinIcon,
  inspire: SwordsIcon,
  meteor: MeteorIcon,
  chain: ChainLightningIcon,
  heal: HealIcon,
  aegis: AegisIcon,
  warp: WarpIcon,
  emp: EmpIcon,
};

export function TutorialPlayerSkills() {
  const { t } = useTranslation();
  const p = t.tutorial.playerSkillsPage;
  const guides = t.tutorial.skillGuides;

  return (
    <div className="space-y-5">
      <SpecSection label={p.title}>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[var(--hl-line)] bg-[var(--hl-void-2)]">
            <LightningIcon className="h-4 w-4 text-[var(--hl-signal)]" />
          </div>
          <p className="text-[12.5px] leading-relaxed text-[var(--hl-ink-2)]">{p.intro}</p>
        </div>
      </SpecSection>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {PLAYER_SKILLS.map((skill) => {
          const Icon = ICON_MAP[skill.effectKey];
          const price = PLAYER_SKILL_SHOP_PRICES[skill.id];
          const guide = guides[skill.id];

          return (
            <div key={skill.id} className="border border-[var(--hl-line)] bg-[var(--hl-deck)] p-3">
              <div className="flex items-start gap-2.5">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center border"
                  style={{ backgroundColor: skill.iconColor + '1a', borderColor: skill.iconColor + '40' }}
                >
                  <Icon className="h-4 w-4" style={{ color: skill.iconColor } as React.CSSProperties} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[13px] font-semibold text-[var(--hl-ink)]">{getPlayerSkillName(skill, t)}</span>
                    <span className="flex items-center gap-1">
                      <span className="hl-label">shift</span>
                      <Key>{skill.hotkey}</Key>
                    </span>
                  </div>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-[var(--hl-ink-2)]">{getPlayerSkillDesc(skill, t)}</p>
                </div>
              </div>

              <div className="mt-2.5">
                <SpecGrid cols={3}>
                  <SpecCell
                    label={<span className="flex items-center gap-1"><TimerIcon className="h-2.5 w-2.5" />{p.statCooldown}</span>}
                    value={`${skill.cooldown / 1000}s`}
                    tone="reach"
                  />
                  <SpecCell
                    label={<span className="flex items-center gap-1"><HourglassIcon className="h-2.5 w-2.5" />{p.statDuration}</span>}
                    value={skill.duration ? `${skill.duration / 1000}s` : p.statInstant}
                    tone="vital"
                  />
                  <SpecCell
                    label={<span className="flex items-center gap-1"><CoinIcon className="h-2.5 w-2.5" />{p.statShop}</span>}
                    value={price}
                    tone="caution"
                  />
                </SpecGrid>
              </div>

              {guide && (
                <div className="mt-2.5 space-y-1.5">
                  <SpecNote label={<span className="flex items-center gap-1"><TargetIcon className="h-2.5 w-2.5" />{p.whenToUse}</span>} tone="reach">
                    {guide.whenToUse}
                  </SpecNote>
                  <SpecNote label={<span className="flex items-center gap-1"><LightbulbIcon className="h-2.5 w-2.5" />{p.combo}</span>} tone="vital">
                    {guide.combo}
                  </SpecNote>
                  <SpecNote label={<span className="flex items-center gap-1">! {p.warning}</span>} tone="alarm">
                    {guide.warning}
                  </SpecNote>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SpecSection label={<span className="flex items-center gap-1.5"><ShopIcon className="h-3 w-3" />{p.shopFlowTitle}</span>}>
          <div className="border-t border-[var(--hl-line)]">
            {p.shopFlowSteps.map((step, i) => (
              <SpecRow key={i} index={i + 1} title={step} />
            ))}
          </div>
          <p className="mt-2 hl-label">{p.shopFlowNote}</p>
        </SpecSection>

        <SpecSection label={<span className="flex items-center gap-1.5"><RobotIcon className="h-3 w-3" />{p.aiAutoTitle}</span>}>
          <div className="border-t border-[var(--hl-line)]">
            {p.aiAutoItems.map((item, i) => (
              <div key={i} className="flex items-start gap-2 border-b border-[var(--hl-line)] py-2 last:border-b-0">
                <span className="w-[26px] shrink-0 font-mono text-[10px] tabular-nums text-[var(--hl-ink-4)]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-[11.5px] leading-relaxed text-[var(--hl-ink-2)]">
                  {item.includes(p.aiAutoPurchased) ? (
                    <>
                      {item.split(p.aiAutoPurchased)[0]}
                      <span className="text-[var(--hl-caution)]">{p.aiAutoPurchased}</span>
                      {item.split(p.aiAutoPurchased)[1]}
                    </>
                  ) : item}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-2 hl-label">{p.aiAutoNote}</p>
        </SpecSection>
      </div>

      <SpecSection label={<span className="flex items-center gap-1.5"><KeyboardIcon className="h-3 w-3" />{p.hotkeysTitle}</span>}>
        <div className="flex flex-wrap gap-1.5">
          {PLAYER_SKILLS.map((s) => {
            const Icon = ICON_MAP[s.effectKey];
            return (
              <div
                key={s.id}
                className="flex items-center gap-2 border border-[var(--hl-line)] px-2 py-1.5"
              >
                <Icon className="h-3.5 w-3.5" style={{ color: s.iconColor } as React.CSSProperties} />
                <span className="text-[11.5px] text-[var(--hl-ink-2)]">{getPlayerSkillName(s, t)}</span>
                <Key>⇧{s.hotkey}</Key>
              </div>
            );
          })}
        </div>
      </SpecSection>
    </div>
  );
}
