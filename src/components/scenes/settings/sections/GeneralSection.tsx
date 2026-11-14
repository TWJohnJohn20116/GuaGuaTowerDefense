/**
 * 設定 - 一般設定區段（語言、顯示、3D 品質、遊戲行為）
 *
 * 每個子區段都是 SectionGroup 卡；列的控制項由呼叫端決定（開關／選項群）。
 * 3D 品質段的三個標籤走 i18n（原本是硬編碼中文）。
 */

import type React from 'react';
import { useTranslation, type Language } from '@/i18n';
import { useSettingsStore } from '@/store/settingsStore';
import { ToggleSwitch } from '@/components/ui/ToggleSwitch';
import { LanguageButton } from '../SettingsTabs';
import { SectionGroup, SettingRow } from '@/components/ui';
import { SettingsChoiceButton } from '../settingsChoice';
import {
  GlobeIcon, MonitorIcon, GamepadIcon,
  SparklesIcon, TargetIcon, WaveIcon, ExplosionIcon,
  TimerIcon, LightbulbIcon, ConstructionIcon, PointerIcon,
  UpArrowIcon, GearIcon,
} from '@/components/ui/Icons';

interface GeneralSectionProps {
  /** 用於搜尋過濾的關鍵字（小寫） */
  filter?: string;
}

export function GeneralSection({ filter = '' }: GeneralSectionProps) {
  const { t, language, setLanguage, languages } = useTranslation();
  const visual = useSettingsStore((s) => s.visual);
  const gameplay = useSettingsStore((s) => s.gameplay);
  const toggleVisual = useSettingsStore((s) => s.toggleVisual);
  const toggleGameplay = useSettingsStore((s) => s.toggleGameplay);
  const setVisualValue = useSettingsStore((s) => s.setVisualValue);

  const match = (text: string) => !filter || text.toLowerCase().includes(filter);

  type VisualKey = 'animationsEnabled' | 'showTowerRange' | 'screenShake' | 'showDamageNumbers' | 'showHealthBars';
  type GameplayKey = 'autoStartWave' | 'showTips' | 'buildWhilePaused' | 'showEnemyPath' | 'autoUpgradeTowers' | 'showDevButton';

  const glyph = 'h-3.5 w-3.5';

  const displayRows: { key: VisualKey; label: string; desc?: string; icon: React.ReactNode; value: boolean }[] = [
    { key: 'animationsEnabled', label: t.settings.animations, desc: t.settings.animationsDesc, icon: <SparklesIcon className={glyph} />, value: visual.animationsEnabled },
    { key: 'showTowerRange', label: t.settings.showRange, desc: t.settings.showRangeDesc, icon: <TargetIcon className={glyph} />, value: visual.showTowerRange },
    { key: 'screenShake', label: t.settings.screenShake, icon: <WaveIcon className={glyph} />, value: visual.screenShake },
    { key: 'showDamageNumbers', label: t.settings.showDamageNumbers, icon: <ExplosionIcon className={glyph} />, value: visual.showDamageNumbers },
    { key: 'showHealthBars', label: t.settings.showHealthBars, icon: <TargetIcon className={glyph} />, value: visual.showHealthBars },
  ];

  const gameplayRows: { key: GameplayKey; label: string; desc?: string; icon: React.ReactNode; value: boolean }[] = [
    { key: 'autoStartWave', label: t.settings.autoWave, desc: t.settings.autoWaveDesc, icon: <TimerIcon className={glyph} />, value: gameplay.autoStartWave },
    { key: 'showTips', label: t.settings.showTips, desc: t.settings.showTipsDesc, icon: <LightbulbIcon className={glyph} />, value: gameplay.showTips },
    { key: 'buildWhilePaused', label: t.settings.buildWhilePaused, icon: <ConstructionIcon className={glyph} />, value: gameplay.buildWhilePaused },
    { key: 'showEnemyPath', label: t.settings.showEnemyPath, icon: <PointerIcon className={glyph} />, value: gameplay.showEnemyPath },
    { key: 'autoUpgradeTowers', label: t.settings.autoUpgradeTowers, icon: <UpArrowIcon className={glyph} />, value: gameplay.autoUpgradeTowers },
    { key: 'showDevButton', label: t.settings.devButton, icon: <GearIcon className={glyph} />, value: gameplay.showDevButton },
  ];

  const filteredDisplay = displayRows.filter((r) => match(r.label) || match(r.desc ?? ''));
  const filteredGameplay = gameplayRows.filter((r) => match(r.label) || match(r.desc ?? ''));
  const showLanguage = match(t.settings.language) || match(t.settings.languageDesc);

  const shadowQualities = ['off', 'low', 'medium', 'high'] as const;
  const particleDensities = ['low', 'medium', 'high'] as const;
  const r3d = t.settings.rendering3d;
  const qualityLabel = (q: 'off' | 'low' | 'medium' | 'high') =>
    q === 'off' ? r3d.off : q === 'low' ? r3d.low : q === 'medium' ? r3d.medium : r3d.high;
  const showRendering =
    match(r3d.title) || match(r3d.bloom) || match(r3d.shadow) || match(r3d.particle);

  return (
    <div className="flex flex-col gap-7">
      {showLanguage && (
        <SectionGroup
          title={t.settings.language}
          description={t.settings.languageDesc}
          icon={<GlobeIcon className="h-3.5 w-3.5" />}
          badge={t.settings.general}
          columns={1}
        >
          <div className="grid grid-cols-2 gap-1.5 p-3 sm:grid-cols-3 lg:grid-cols-5">
            {(Object.entries(languages) as [Language, string][]).map(([code, name]) => (
              <LanguageButton
                key={code}
                name={name}
                selected={language === code}
                onClick={() => setLanguage(code)}
              />
            ))}
          </div>
        </SectionGroup>
      )}

      {filteredDisplay.length > 0 && (
        <SectionGroup
          title={t.settings.display}
          description={t.settings.displayDesc}
          icon={<MonitorIcon className="h-3.5 w-3.5" />}
          badge={t.settings.general}
          count={filteredDisplay.length}
        >
          {filteredDisplay.map((row) => (
            <SettingRow
              key={row.key}
              icon={row.icon}
              label={row.label}
              description={row.desc}
              control={<ToggleSwitch enabled={row.value} onToggle={() => toggleVisual(row.key)} />}
            />
          ))}
        </SectionGroup>
      )}

      {/* ===== 3D 渲染品質 ===== */}
      {showRendering && (
        <SectionGroup
          title={r3d.title}
          description={r3d.desc}
          icon={<SparklesIcon className="h-3.5 w-3.5" />}
          badge={t.settings.general}
          count={3}
          columns={1}
        >
          <SettingRow
            icon={<SparklesIcon className="h-3.5 w-3.5" />}
            label={r3d.bloom}
            description={r3d.bloomDesc}
            control={<ToggleSwitch enabled={visual.bloomEnabled} onToggle={() => toggleVisual('bloomEnabled')} />}
          />
          <SettingRow
            icon={<WaveIcon className="h-3.5 w-3.5" />}
            label={r3d.shadow}
            description={r3d.shadowDesc}
            control={
              <div className="flex gap-1">
                {shadowQualities.map((q) => (
                  <SettingsChoiceButton
                    key={q}
                    active={visual.shadowQuality === q}
                    onClick={() => setVisualValue('shadowQuality', q)}
                    className="flex-none px-2.5"
                  >
                    {qualityLabel(q)}
                  </SettingsChoiceButton>
                ))}
              </div>
            }
          />
          <SettingRow
            icon={<ExplosionIcon className="h-3.5 w-3.5" />}
            label={r3d.particle}
            description={r3d.particleDesc}
            control={
              <div className="flex gap-1">
                {particleDensities.map((d) => (
                  <SettingsChoiceButton
                    key={d}
                    active={visual.particleDensity === d}
                    onClick={() => setVisualValue('particleDensity', d)}
                    className="flex-none px-2.5"
                  >
                    {qualityLabel(d)}
                  </SettingsChoiceButton>
                ))}
              </div>
            }
          />
        </SectionGroup>
      )}

      {filteredGameplay.length > 0 && (
        <SectionGroup
          title={t.settings.gameplay}
          description={t.settings.gameplayDesc}
          icon={<GamepadIcon className="h-3.5 w-3.5" />}
          badge={t.settings.general}
          count={filteredGameplay.length}
        >
          {filteredGameplay.map((row) => (
            <SettingRow
              key={row.key}
              icon={row.icon}
              label={row.label}
              description={row.desc}
              control={<ToggleSwitch enabled={row.value} onToggle={() => toggleGameplay(row.key)} />}
            />
          ))}
        </SectionGroup>
      )}
    </div>
  );
}

export default GeneralSection;
