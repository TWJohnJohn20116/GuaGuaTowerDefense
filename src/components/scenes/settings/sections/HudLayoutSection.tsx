/**
 * 設定 - HUD 佈局區段（HARDLINE）
 *
 * 每個小節一張 Deck：區段頭 mono 標籤、設定列統一行高、選項控件一律方角。
 * 預覽卡（HudPreviewCard）保留即時可視化，但外框改成硬線。
 */

import { useSettingsStore } from '@/store/settingsStore';
import { SectionGroup, SettingRow } from '@/components/ui';
import { ToggleSwitch } from '@/components/ui/ToggleSwitch';
import { Btn } from '@/components/hl';
import { SettingsSlider } from '../SettingsSlider';
import {
  MonitorIcon, ChartIcon, TowerIcon, GamepadIcon,
  RefreshIcon, SlidersIcon, EyeIcon,
  PaletteIcon, BoxIcon, MagicIcon, WaveIcon,
} from '@/components/ui/Icons';
import { HudPreviewCard } from './hud/HudPreview';
import {
  HorizontalChoice, SideChoice, ScaleChoice,
  CornerChoice, BlurChoice, AccentChoice,
  ColumnsChoice, ButtonSizeChoice, DisplayModeChoice, SpacingChoice,
  PositionGridChoice, WaveBannerSizeChoice,
} from './hud/hudChoiceButtons';
import { useTranslation } from '@/i18n';

interface HudLayoutSectionProps {
  filter?: string;
}

export function HudLayoutSection({ filter = '' }: HudLayoutSectionProps) {
  const { t } = useTranslation();
  const hudLayout = useSettingsStore((s) => s.hudLayout);
  const setHudLayout = useSettingsStore((s) => s.setHudLayout);
  const resetHudLayout = useSettingsStore((s) => s.resetHudLayout);

  const match = (text: string) => !filter || text.toLowerCase().includes(filter);
  const glyph = 'h-3.5 w-3.5';

  const labels = t.settings.hud;
  const alignLabels = {
    left: labels.choiceAlignLeft,
    center: labels.choiceAlignCenter,
    right: labels.choiceAlignRight,
  };

  const visible = {
    layout:
      match(labels.layout) || match(labels.statsBar) ||
      match(labels.towerPanel) || match(labels.bottomControls),
    visibility:
      match(labels.visibility) || match(labels.showStatsBar) ||
      match(labels.showTowerPanel) || match(labels.showBottomControls),
    style:
      match(labels.style) || match(labels.cornerStyle) ||
      match(labels.blur) || match(labels.accent),
    towerList:
      match(labels.towerList) || match(labels.columns) || match(labels.buttonSize) ||
      match(labels.displayMode) || match(labels.spacing) || match(labels.showCategories) ||
      match(labels.showSkillBar) || match(labels.showToolbar),
    appearance:
      match(labels.appearance) || match(labels.uiScale) || match(labels.opacity),
    waveBanner:
      match(labels.waveBanner) || match(labels.waveBannerPos) ||
      match(labels.waveBannerSize) || match(labels.showWaveBanner),
  };

  return (
    <div className="flex flex-col gap-7">
      {visible.layout && (
        <SectionGroup
          title={labels.layout}
          description={labels.layoutDesc}
          icon={<MonitorIcon className={glyph} />}
          badge={labels.badge}
          action={
            <Btn variant="danger" size="sm" onClick={resetHudLayout} icon={<RefreshIcon className="h-3.5 w-3.5" />}>
              {labels.reset}
            </Btn>
          }
          columns={1}
        >
          <div className="border-b border-[var(--cn-line-soft)] p-3">
            <HudPreviewCard layout={hudLayout} />
          </div>

          <SettingRow
            icon={<ChartIcon className={glyph} />}
            label={labels.statsBar}
            description={labels.statsBarDesc}
            control={null}
            expanded
            footer={
              <HorizontalChoice
                value={hudLayout.statsBar}
                options={['left', 'center', 'right']}
                labels={alignLabels}
                onChange={(v) => setHudLayout('statsBar', v)}
              />
            }
          />

          <SettingRow
            icon={<TowerIcon className={glyph} />}
            label={labels.towerPanel}
            description={labels.towerPanelDesc}
            control={null}
            expanded
            footer={
              <SideChoice
                value={hudLayout.towerPanel}
                onChange={(v) => setHudLayout('towerPanel', v)}
              />
            }
          />

          <SettingRow
            icon={<GamepadIcon className={glyph} />}
            label={labels.bottomControls}
            description={labels.bottomControlsDesc}
            control={null}
            expanded
            footer={
              <HorizontalChoice
                value={hudLayout.bottomControls}
                options={['left', 'center', 'right']}
                labels={alignLabels}
                onChange={(v) => setHudLayout('bottomControls', v)}
              />
            }
          />
        </SectionGroup>
      )}

      {visible.visibility && (
        <SectionGroup
          title={labels.visibility}
          description={labels.visibilityDesc}
          icon={<EyeIcon className={glyph} />}
          badge={labels.badge}
          columns={1}
        >
          <SettingRow
            icon={<ChartIcon className={glyph} />}
            label={labels.showStatsBar}
            control={
              <ToggleSwitch
                enabled={hudLayout.showStatsBar}
                onToggle={() => setHudLayout('showStatsBar', !hudLayout.showStatsBar)}
              />
            }
          />
          <SettingRow
            icon={<TowerIcon className={glyph} />}
            label={labels.showTowerPanel}
            control={
              <ToggleSwitch
                enabled={hudLayout.showTowerPanel}
                onToggle={() => setHudLayout('showTowerPanel', !hudLayout.showTowerPanel)}
              />
            }
          />
          <SettingRow
            icon={<GamepadIcon className={glyph} />}
            label={labels.showBottomControls}
            control={
              <ToggleSwitch
                enabled={hudLayout.showBottomControls}
                onToggle={() => setHudLayout('showBottomControls', !hudLayout.showBottomControls)}
              />
            }
          />
        </SectionGroup>
      )}

      {visible.style && (
        <SectionGroup
          title={labels.style}
          description={labels.styleDesc}
          icon={<PaletteIcon className={glyph} />}
          badge={labels.badge}
          columns={1}
        >
          <SettingRow
            icon={<BoxIcon className={glyph} />}
            label={labels.cornerStyle}
            description={labels.cornerStyleDesc}
            control={null}
            expanded
            footer={
              <CornerChoice
                value={hudLayout.cornerStyle}
                onChange={(v) => setHudLayout('cornerStyle', v)}
              />
            }
          />
          <SettingRow
            icon={<SlidersIcon className={glyph} />}
            label={labels.blur}
            description={labels.blurDesc}
            control={null}
            expanded
            footer={
              <BlurChoice
                value={hudLayout.blurIntensity}
                onChange={(v) => setHudLayout('blurIntensity', v)}
              />
            }
          />
          <SettingRow
            icon={<PaletteIcon className={glyph} />}
            label={labels.accent}
            description={labels.accentDesc}
            control={null}
            expanded
            footer={
              <AccentChoice
                value={hudLayout.accentColor}
                onChange={(v) => setHudLayout('accentColor', v)}
              />
            }
          />
        </SectionGroup>
      )}

      {visible.towerList && (
        <SectionGroup
          title={labels.towerList}
          description={labels.towerListDesc}
          icon={<TowerIcon className={glyph} />}
          badge={labels.badge}
          columns={1}
        >
          <SettingRow
            icon={<BoxIcon className={glyph} />}
            label={labels.columns}
            description={labels.columnsDesc}
            control={null}
            expanded
            footer={
              <ColumnsChoice
                value={hudLayout.towerListColumns}
                onChange={(v) => setHudLayout('towerListColumns', v)}
              />
            }
          />
          <SettingRow
            icon={<TowerIcon className={glyph} />}
            label={labels.buttonSize}
            description={labels.buttonSizeDesc}
            control={null}
            expanded
            footer={
              <ButtonSizeChoice
                value={hudLayout.towerButtonSize}
                onChange={(v) => setHudLayout('towerButtonSize', v)}
              />
            }
          />
          <SettingRow
            icon={<ChartIcon className={glyph} />}
            label={labels.displayMode}
            description={labels.displayModeDesc}
            control={null}
            expanded
            footer={
              <DisplayModeChoice
                value={hudLayout.towerDisplayMode}
                onChange={(v) => setHudLayout('towerDisplayMode', v)}
              />
            }
          />
          <SettingRow
            icon={<SlidersIcon className={glyph} />}
            label={labels.spacing}
            description={labels.spacingDesc}
            control={null}
            expanded
            footer={
              <SpacingChoice
                value={hudLayout.towerListSpacing}
                onChange={(v) => setHudLayout('towerListSpacing', v)}
              />
            }
          />
          <SettingRow
            icon={<TowerIcon className={glyph} />}
            label={labels.showCategories}
            description={labels.showCategoriesDesc}
            control={
              <ToggleSwitch
                enabled={hudLayout.showTowerCategories}
                onToggle={() => setHudLayout('showTowerCategories', !hudLayout.showTowerCategories)}
              />
            }
          />
          <SettingRow
            icon={<MagicIcon className={glyph} />}
            label={labels.showSkillBar}
            description={labels.showSkillBarDesc}
            control={
              <ToggleSwitch
                enabled={hudLayout.showTowerSkillBar}
                onToggle={() => setHudLayout('showTowerSkillBar', !hudLayout.showTowerSkillBar)}
              />
            }
          />
          <SettingRow
            icon={<GamepadIcon className={glyph} />}
            label={labels.showToolbar}
            description={labels.showToolbarDesc}
            control={
              <ToggleSwitch
                enabled={hudLayout.showTowerToolbar}
                onToggle={() => setHudLayout('showTowerToolbar', !hudLayout.showTowerToolbar)}
              />
            }
          />
        </SectionGroup>
      )}

      {visible.waveBanner && (
        <SectionGroup
          title={labels.waveBanner}
          description={labels.waveBannerDesc}
          icon={<WaveIcon className={glyph} />}
          badge={labels.badge}
          columns={1}
        >
          <SettingRow
            icon={<WaveIcon className={glyph} />}
            label={labels.showWaveBanner}
            description={labels.showWaveBannerDesc}
            control={
              <ToggleSwitch
                enabled={hudLayout.showWaveBanner}
                onToggle={() => setHudLayout('showWaveBanner', !hudLayout.showWaveBanner)}
              />
            }
          />
          <SettingRow
            icon={<MonitorIcon className={glyph} />}
            label={labels.waveBannerPos}
            description={labels.waveBannerPosDesc}
            control={null}
            expanded
            footer={
              <PositionGridChoice
                vertical={hudLayout.waveBannerVertical}
                horizontal={hudLayout.waveBannerHorizontal}
                onChange={(v, h) => {
                  setHudLayout('waveBannerVertical', v);
                  setHudLayout('waveBannerHorizontal', h);
                }}
              />
            }
          />
          <SettingRow
            icon={<SlidersIcon className={glyph} />}
            label={labels.waveBannerSize}
            description={labels.waveBannerSizeDesc}
            control={null}
            expanded
            footer={
              <WaveBannerSizeChoice
                value={hudLayout.waveBannerSize}
                onChange={(v) => setHudLayout('waveBannerSize', v)}
              />
            }
          />
        </SectionGroup>
      )}

      {visible.appearance && (
        <SectionGroup
          title={labels.appearance}
          description={labels.appearanceDesc}
          icon={<SlidersIcon className={glyph} />}
          badge={labels.badge}
          columns={1}
        >
          <SettingRow
            icon={<SlidersIcon className={glyph} />}
            label={labels.uiScale}
            description={labels.uiScaleDesc}
            control={null}
            expanded
            footer={
              <ScaleChoice
                value={hudLayout.uiScale}
                onChange={(v) => setHudLayout('uiScale', v)}
              />
            }
          />
          <SettingRow
            icon={<EyeIcon className={glyph} />}
            label={labels.opacity}
            description={labels.opacityDesc}
            control={
              <span className="border-[3px] border-[var(--cn-line-soft)] bg-[var(--arc-void-2)] px-1.5 py-0.5 font-mono text-[10.5px] tabular-nums text-[var(--arc-ink-2)]">
                {Math.round(hudLayout.opacity * 100)}%
              </span>
            }
            expanded
            footer={
              <SettingsSlider
                value={(hudLayout.opacity - 0.4) / 0.6}
                onChange={(v) => setHudLayout('opacity', Math.max(0.4, Math.min(1, 0.4 + v * 0.6)))}
                disabled={false}
                icon={<EyeIcon className={glyph} />}
                label={labels.opacity}
                display={`${Math.round(hudLayout.opacity * 100)}%`}
              />
            }
          />
        </SectionGroup>
      )}
    </div>
  );
}

export default HudLayoutSection;
