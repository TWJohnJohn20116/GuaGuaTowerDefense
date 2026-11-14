/**
 * 暫停選單 · 設定面板
 * 直接嵌入設定頁的區塊（音量、畫面、遊戲性、進階、鍵盤）
 */

import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useSettingsStore } from '@/store/settingsStore';
import { ToggleSwitch } from '@/components/ui/ToggleSwitch';
import { VolumeSlider } from '@/components/ui/VolumeSlider';
import { SectionGroup, SettingRow } from '@/components/ui';
import { SceneChoiceRow, SceneChoiceButton } from '@/components/ui/SceneChoiceParts';
import { useTranslation } from '@/i18n';
import {
 LightningIcon, SpeakerIcon, MonitorIcon, GamepadIcon,
 BellIcon, MusicNotesIcon, MusicNoteIcon, ExplosionIcon,
 ConstructionIcon, SkullIcon, GearIcon, OpenBookIcon, TargetIcon,
} from '@/components/ui/Icons';
import { PauseViewHudSettings } from './PauseViewHudSettings';
import { PauseKeyShortcuts } from './PauseKeyShortcuts';
import { GAME_SPEED_PRESETS } from '@/data/gameSpeedPresets';

export function PauseSettingsPanel() {
 const { t } = useTranslation();
 const g = t.game;
 const s = t.settings;
 const gameSpeed = useGameStore((st) => st.gameSpeed);
 const setGameSpeed = useGameStore((st) => st.setGameSpeed);
 const soundEnabled = useGameStore((st) => st.soundEnabled);
 const musicEnabled = useGameStore((st) => st.musicEnabled);
 const soundVolume = useGameStore((st) => st.soundVolume);
 const musicVolume = useGameStore((st) => st.musicVolume);
 const toggleSound = useGameStore((st) => st.toggleSound);
 const toggleMusic = useGameStore((st) => st.toggleMusic);
 const setSoundVolume = useGameStore((st) => st.setSoundVolume);
 const setMusicVolume = useGameStore((st) => st.setMusicVolume);
 const openSettingsFromPause = useGameStore((st) => st.openSettingsFromPause);

 const visual = useSettingsStore((st) => st.visual);
 const gameplay = useSettingsStore((st) => st.gameplay);
 const audio = useSettingsStore((st) => st.audio);
 const toggleVisual = useSettingsStore((st) => st.toggleVisual);
 const toggleGameplay = useSettingsStore((st) => st.toggleGameplay);
 const toggleAudio = useSettingsStore((st) => st.toggleAudio);

 const sfxRows = [
 { key: 'sfxAttack' as const, label: s.sfxAttack, value: audio.sfxAttack, icon: <ExplosionIcon className="w-4 h-4 text-[var(--hl-caution)]"/> },
 { key: 'sfxBuild' as const, label: s.sfxBuild, value: audio.sfxBuild, icon: <ConstructionIcon className="w-4 h-4 text-[var(--hl-reach)]"/> },
 { key: 'sfxDeath' as const, label: s.sfxDeath, value: audio.sfxDeath, icon: <SkullIcon className="w-4 h-4 text-[var(--hl-ink-2)]"/> },
 { key: 'sfxUI' as const, label: s.sfxUI, value: audio.sfxUI, icon: <BellIcon className="w-4 h-4 text-[var(--hl-caution)]"/> },
 ];

 return (
 <motion.div
 key="settings"
 initial={{ opacity: 0, y: 5 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -5 }}
 transition={{ duration: 0.18 }}
 className="space-y-4"
 >
 <SectionGroup
 title={g.pauseGameSpeed}
 icon={<LightningIcon className="h-5 w-5"/>}
 accent="amber"
 columns={1}
 >
 <SettingRow
 icon={<LightningIcon className="h-4 w-4 text-[var(--hl-caution)]"/>}
 label={g.pauseCurrentSpeed}
 description={`${gameSpeed}x`}
 accent="amber"
 control={
 <span className="border border-[var(--hl-line)] bg-[rgba(6,7,10,0.55)] px-2 py-0.5 font-mono text-xs font-bold tabular-nums text-[var(--hl-ink)]">
 {gameSpeed}x
 </span>
 }
 footer={
 <SceneChoiceRow className="grid grid-cols-5 gap-2">
 {GAME_SPEED_PRESETS.map((speed) => (
 <SceneChoiceButton
 key={speed}
 active={gameSpeed === speed}
 accent={speed > 1 ? 'amber' : 'blue'}
 onClick={() => setGameSpeed(speed)}
 className="py-2 font-mono text-sm normal-case tracking-normal"
 >
 {speed}x
 </SceneChoiceButton>
 ))}
 </SceneChoiceRow>
 }
 expanded
 />
 </SectionGroup>

 <SectionGroup
 title={g.pauseSfxAndMusic}
 icon={<SpeakerIcon className="h-5 w-5"/>}
 accent="blue"
 columns={1}
 >
 <SettingRow
 icon={<MusicNoteIcon className="h-4 w-4 text-[var(--hl-reach)]"/>}
 label={s.sound}
 accent="blue"
 control={<ToggleSwitch enabled={soundEnabled} onToggle={toggleSound} size="md"/>}
 footer={
 <VolumeSlider
 value={soundVolume}
 onChange={setSoundVolume}
 disabled={!soundEnabled}
 icon={<MusicNoteIcon className="h-4 w-4 text-[var(--hl-reach)]"/>}
 label={s.soundVolume}
 />
 }
 expanded
 />
 <SettingRow
 icon={<MusicNotesIcon className="h-4 w-4 text-[var(--hl-ink-2)]"/>}
 label={s.music}
 accent="purple"
 control={<ToggleSwitch enabled={musicEnabled} onToggle={toggleMusic} size="md"activeColor="purple"/>}
 footer={
 <VolumeSlider
 value={musicVolume}
 onChange={setMusicVolume}
 disabled={!musicEnabled}
 icon={<MusicNotesIcon className="h-4 w-4 text-[var(--hl-ink-2)]"/>}
 label={s.musicVolume}
 />
 }
 expanded
 />
 </SectionGroup>

 <SectionGroup
 title={g.pauseSfxCategories}
 icon={<SpeakerIcon className="h-5 w-5"/>}
 accent="rose"
 columns={2}
 >
 {sfxRows.map((row) => (
 <SettingRow
 key={row.key}
 icon={row.icon}
 label={row.label}
 accent="rose"
 control={
 <ToggleSwitch
 enabled={row.value}
 onToggle={() => toggleAudio(row.key)}
 size="sm"
 />
 }
 />
 ))}
 </SectionGroup>

 <PauseViewHudSettings />
 <PauseKeyShortcuts />

 <SectionGroup
 title={g.pauseDisplaySection}
 icon={<MonitorIcon className="h-5 w-5"/>}
 accent="cyan"
 columns={1}
 >
 <SettingRow icon={<MonitorIcon className="h-4 w-4 text-[var(--hl-reach)]"/>} label={s.showRange} accent="cyan"control={<ToggleSwitch enabled={visual.showTowerRange} onToggle={() => toggleVisual('showTowerRange')} size="sm"activeColor="cyan"/>} />
 <SettingRow icon={<MonitorIcon className="h-4 w-4 text-[var(--hl-reach)]"/>} label={s.showDamageNumbers} accent="cyan"control={<ToggleSwitch enabled={visual.showDamageNumbers} onToggle={() => toggleVisual('showDamageNumbers')} size="sm"activeColor="cyan"/>} />
 <SettingRow icon={<MonitorIcon className="h-4 w-4 text-[var(--hl-reach)]"/>} label={s.showHealthBars} accent="cyan"control={<ToggleSwitch enabled={visual.showHealthBars} onToggle={() => toggleVisual('showHealthBars')} size="sm"activeColor="cyan"/>} />
 <SettingRow icon={<MonitorIcon className="h-4 w-4 text-[var(--hl-reach)]"/>} label={s.screenShake} accent="cyan"control={<ToggleSwitch enabled={visual.screenShake} onToggle={() => toggleVisual('screenShake')} size="sm"activeColor="cyan"/>} />
 <SettingRow icon={<MonitorIcon className="h-4 w-4 text-[var(--hl-reach)]"/>} label={s.animations} accent="cyan"control={<ToggleSwitch enabled={visual.animationsEnabled} onToggle={() => toggleVisual('animationsEnabled')} size="sm"activeColor="cyan"/>} />
 </SectionGroup>

 <SectionGroup
 title={g.pauseControlsSection}
 icon={<GamepadIcon className="h-5 w-5"/>}
 accent="indigo"
 columns={1}
 >
 <SettingRow icon={<GamepadIcon className="h-4 w-4 text-[var(--hl-reach)]"/>} label={s.buildWhilePaused} description={g.pauseBuildWhilePausedDesc} accent="indigo"control={<ToggleSwitch enabled={gameplay.buildWhilePaused} onToggle={() => toggleGameplay('buildWhilePaused')} size="sm"activeColor="blue"/>} />
 <SettingRow icon={<GamepadIcon className="h-4 w-4 text-[var(--hl-reach)]"/>} label={s.showEnemyPath} accent="indigo"control={<ToggleSwitch enabled={gameplay.showEnemyPath} onToggle={() => toggleGameplay('showEnemyPath')} size="sm"activeColor="blue"/>} />
 <SettingRow icon={<GamepadIcon className="h-4 w-4 text-[var(--hl-reach)]"/>} label={s.autoWave} description={s.autoWaveDesc} accent="indigo"control={<ToggleSwitch enabled={gameplay.autoStartWave} onToggle={() => toggleGameplay('autoStartWave')} size="sm"activeColor="blue"/>} />
 <SettingRow icon={<GamepadIcon className="h-4 w-4 text-[var(--hl-reach)]"/>} label={s.confirmSell} description={s.confirmSellDesc} accent="indigo"control={<ToggleSwitch enabled={gameplay.confirmSell} onToggle={() => toggleGameplay('confirmSell')} size="sm"activeColor="blue"/>} />
 <SettingRow icon={<TargetIcon className="h-4 w-4 text-[var(--hl-vital)]"/>} label={s.quickPlace} description={s.quickPlaceDesc} accent="indigo"control={<ToggleSwitch enabled={gameplay.quickPlaceDefault} onToggle={() => toggleGameplay('quickPlaceDefault')} size="sm"activeColor="blue"/>} />
 </SectionGroup>

 <button
 type="button"
 onClick={() => openSettingsFromPause()}
 className={`flex w-full items-center justify-center gap-2 border border-[var(--hl-line)] bg-[var(--hl-deck-2)] py-3 text-sm font-bold text-[var(--hl-ink-2)] transition-colors hover:bg-[var(--hl-deck-3)] hover:text-[var(--hl-ink)]`}
 >
 <OpenBookIcon className="h-4 w-4"/>
 {g.pauseOpenFullSettings}
 <GearIcon className="h-4 w-4 text-[var(--hl-ink-4)]"/>
 </button>
 </motion.div>
 );
}

export default PauseSettingsPanel;
