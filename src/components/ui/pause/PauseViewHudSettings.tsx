/**
 * 暫停選單 · 遊戲畫面 HUD 設定
 */

import type { HudUiScale } from '@/store/settingsStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useTutorialStore } from '@/store/tutorialStore';
import { ToggleSwitch } from '@/components/ui/ToggleSwitch';
import { VolumeSlider } from '@/components/ui/VolumeSlider';
import { SectionGroup, SettingRow } from '@/components/ui';
import { SceneChoiceRow, SceneChoiceButton } from '@/components/ui/SceneChoiceParts';
import { SCENE_TYPOGRAPHY } from '@/components/ui/SceneTypography';
import { MonitorIcon, SlidersIcon } from '@/components/ui/Icons';
import { Num } from '@/components/hl';
import { useTranslation } from '@/i18n';

const UI_SCALE_IDS: HudUiScale[] = ['compact', 'normal', 'large'];

export function PauseViewHudSettings() {
 const { t } = useTranslation();
 const visual = useSettingsStore((s) => s.visual);
 const hudLayout = useSettingsStore((s) => s.hudLayout);
 const setAll = useSettingsStore((s) => s.setAll);
 const setHudLayout = useSettingsStore((s) => s.setHudLayout);
 const tutorialActive = useTutorialStore((s) => s.isActive);

 const scaleLabels: Record<HudUiScale, string> = {
 compact: t.game.pauseUiScaleCompact,
 normal: t.game.pauseUiScaleNormal,
 large: t.game.pauseUiScaleLarge,
 };

 const toggle3DView = () => {
 if (tutorialActive) return;
 setAll({ visual: { ...visual, prefer3DView: !visual.prefer3DView } });
 };

 return (
 <SectionGroup
 title={t.game.pauseViewHud}
 icon={<MonitorIcon className="h-5 w-5"/>}
 accent="purple"
 columns={1}
 >
 <SettingRow
 icon={<MonitorIcon className="h-4 w-4 text-[var(--arc-ink-2)]"/>}
 label={t.game.pause3DView}
 description={tutorialActive ? t.game.pause3DViewTutorial : t.game.pause3DViewDesc}
 accent="purple"
 control={
 <ToggleSwitch
 enabled={visual.prefer3DView}
 onToggle={toggle3DView}
 size="sm"
 activeColor="purple"
 />
 }
 />

 <SettingRow
 icon={<SlidersIcon className="h-4 w-4 text-[var(--arc-reach)]"/>}
 label={t.game.pauseHudScale}
 accent="cyan"
 expanded
 control={<span className={`${SCENE_TYPOGRAPHY.micro} font-bold text-[var(--arc-ink-4)]`}>{t.game.pauseHudScaleNote}</span>}
 footer={
 <SceneChoiceRow className="grid grid-cols-3 gap-2">
 {UI_SCALE_IDS.map((id) => (
 <SceneChoiceButton
 key={id}
 active={hudLayout.uiScale === id}
 accent="purple"
 onClick={() => setHudLayout('uiScale', id)}
 className="py-2 text-xs normal-case tracking-normal"
 >
 {scaleLabels[id]}
 </SceneChoiceButton>
 ))}
 </SceneChoiceRow>
 }
 />

 <SettingRow
 icon={<SlidersIcon className="h-4 w-4 text-[var(--arc-reach)]"/>}
 label={t.game.pauseHudOpacity}
 accent="cyan"
 expanded
 control={<Num value={Math.round(hudLayout.opacity * 100)} unit="%" tone="muted" size="sm" className={`${SCENE_TYPOGRAPHY.micro} tabular-nums`} />}
 footer={
 <VolumeSlider
 value={hudLayout.opacity}
 onChange={(v) => setHudLayout('opacity', v)}
 icon={<SlidersIcon className="h-4 w-4 text-[var(--arc-reach)]"/>}
 label={t.game.pauseHudOpacity}
 />
 }
 />
 </SectionGroup>
 );
}

export default PauseViewHudSettings;
