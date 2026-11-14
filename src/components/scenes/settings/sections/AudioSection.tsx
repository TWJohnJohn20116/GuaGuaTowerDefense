/**
 * 設定 - 音效設定區段（音量、音效類型）
 * HARDLINE：滑桿走 SettingsSlider（方角軌道、訊號色填充與方形 thumb）。
 */

import { useTranslation } from '@/i18n';
import { useGameStore } from '@/store/gameStore';
import { useSettingsStore } from '@/store/settingsStore';
import { ToggleSwitch } from '@/components/ui/ToggleSwitch';
import { SectionGroup, SettingRow } from '@/components/ui';
import {
  SpeakerIcon, SlidersIcon, BellIcon, MusicNotesIcon,
  MusicNoteIcon, ExplosionIcon, ConstructionIcon, SkullIcon, DownloadIcon,
} from '@/components/ui/Icons';
import { AudioDownloadPanel } from '@/components/scenes/settings/AudioDownloadPanel';
import { MenuMusicAlbumPanel } from '@/components/scenes/settings/MenuMusicAlbumPanel';
import { SettingsSlider } from '../SettingsSlider';

interface AudioSectionProps {
  filter?: string;
}

export function AudioSection({ filter = '' }: AudioSectionProps) {
  const { t } = useTranslation();
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const musicEnabled = useGameStore((s) => s.musicEnabled);
  const soundVolume = useGameStore((s) => s.soundVolume);
  const musicVolume = useGameStore((s) => s.musicVolume);
  const toggleSound = useGameStore((s) => s.toggleSound);
  const toggleMusic = useGameStore((s) => s.toggleMusic);
  const setSoundVolume = useGameStore((s) => s.setSoundVolume);
  const setMusicVolume = useGameStore((s) => s.setMusicVolume);

  const audio = useSettingsStore((s) => s.audio);
  const toggleAudio = useSettingsStore((s) => s.toggleAudio);

  const match = (text: string) => !filter || text.toLowerCase().includes(filter);
  const glyph = 'h-3.5 w-3.5';

  const sfxRows = [
    { key: 'sfxAttack' as const, label: t.settings.sfxAttack, icon: <ExplosionIcon className={glyph} />, value: audio.sfxAttack },
    { key: 'sfxBuild' as const, label: t.settings.sfxBuild, icon: <ConstructionIcon className={glyph} />, value: audio.sfxBuild },
    { key: 'sfxDeath' as const, label: t.settings.sfxDeath, icon: <SkullIcon className={glyph} />, value: audio.sfxDeath },
    { key: 'sfxUI' as const, label: t.settings.sfxUI, icon: <BellIcon className={glyph} />, value: audio.sfxUI },
  ];

  const matchFilter = (keywordsCsv: string) => {
    if (!filter) return true;
    const q = filter.toLowerCase();
    return keywordsCsv.split(',').some((k) => q.includes(k.trim().toLowerCase()));
  };

  const filteredSfx = sfxRows.filter((r) => match(r.label));
  const showMaster = match(t.settings.masterAudio) || match(t.settings.sound) || match(t.settings.music);
  const showDownload = matchFilter(t.settings.audioSection.searchDownload);
  const showMenuAlbums = matchFilter(t.settings.audioSection.searchMenuMusic);

  return (
    <div className="flex flex-col gap-7">
      {showMaster && (
        <SectionGroup
          title={t.settings.masterAudio}
          description={t.settings.masterAudioDesc}
          icon={<SpeakerIcon className="h-3.5 w-3.5" />}
          badge={t.settings.audio}
          columns={1}
        >
          <SettingRow
            icon={<BellIcon className={glyph} />}
            label={t.settings.sound}
            control={<ToggleSwitch enabled={soundEnabled} onToggle={toggleSound} />}
            expanded
            footer={
              <SettingsSlider
                value={soundVolume}
                onChange={setSoundVolume}
                disabled={!soundEnabled}
                icon={<MusicNoteIcon className={glyph} />}
                label={t.settings.soundVolume}
              />
            }
          />
          <SettingRow
            icon={<MusicNotesIcon className={glyph} />}
            label={t.settings.music}
            control={<ToggleSwitch enabled={musicEnabled} onToggle={toggleMusic} />}
            expanded
            footer={
              <SettingsSlider
                value={musicVolume}
                onChange={setMusicVolume}
                disabled={!musicEnabled}
                icon={<MusicNotesIcon className={glyph} />}
                label={t.settings.musicVolume}
              />
            }
          />
          <p className="border-t border-[var(--hl-line)] px-4 py-3 text-[10.5px] leading-relaxed text-[var(--hl-ink-3)]">
            {t.settings.audioApiHint}
          </p>
        </SectionGroup>
      )}

      {showMenuAlbums && <MenuMusicAlbumPanel />}

      {showDownload && (
        <SectionGroup
          title={t.settings.audioDownload.title}
          description={t.settings.audioDownload.description}
          icon={<DownloadIcon className="h-3.5 w-3.5" />}
          badge={t.settings.audio}
          columns={1}
        >
          <AudioDownloadPanel />
        </SectionGroup>
      )}

      {filteredSfx.length > 0 && (
        <SectionGroup
          title={t.settings.soundTypes}
          description={t.settings.soundTypesDesc}
          icon={<SlidersIcon className="h-3.5 w-3.5" />}
          badge={t.settings.audio}
          count={filteredSfx.length}
          columns={2}
        >
          {filteredSfx.map((row) => (
            <SettingRow
              key={row.key}
              icon={row.icon}
              label={row.label}
              control={<ToggleSwitch enabled={row.value} onToggle={() => toggleAudio(row.key)} size="sm" />}
            />
          ))}
        </SectionGroup>
      )}
    </div>
  );
}

export default AudioSection;
