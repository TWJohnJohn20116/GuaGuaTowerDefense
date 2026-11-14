/**
 * 設定 - 控制設定區段（快捷鍵、滑鼠、進階）
 * HARDLINE：鍵位控件＝方框 mono；重設＝danger 標籤按鈕；滑桿走 SettingsSlider。
 */

import type React from 'react';
import { useTranslation } from '@/i18n';
import { useGameStore } from '@/store/gameStore';
import { useSettingsStore } from '@/store/settingsStore';
import { ToggleSwitch } from '@/components/ui/ToggleSwitch';
import { keyCodeToDisplayName } from '../SettingsTabs';
import { SectionGroup, SettingRow } from '@/components/ui';
import { Btn, Key } from '@/components/hl';
import { SettingsChoiceButton } from '../settingsChoice';
import { SettingsSlider } from '../SettingsSlider';
import type { KeyAction } from '@/types/game';
import {
  KeyboardIcon, MouseIcon, SlidersIcon, TargetIcon,
  ClipboardIcon, GlobeIcon, PointerIcon, LightbulbIcon,
  PauseIcon, LightningIcon, WaveIcon, CoinIcon, UpArrowIcon,
} from '@/components/ui/Icons';

export interface KeyBindingItem {
  action: KeyAction;
  label: string;
  icon: React.ReactNode;
}

interface ControlsSectionProps {
  filter?: string;
  editingKey: KeyAction | null;
  onStartEditKey: (action: KeyAction) => void;
}

export function ControlsSection({ filter = '', editingKey, onStartEditKey }: ControlsSectionProps) {
  const { t } = useTranslation();
  const keyBindings = useGameStore((s) => s.keyBindings);
  const resetKeyBindings = useGameStore((s) => s.resetKeyBindings);

  const gameplay = useSettingsStore((s) => s.gameplay);
  const toggleGameplay = useSettingsStore((s) => s.toggleGameplay);
  const controls = useSettingsStore((s) => s.controls);
  const toggleControls = useSettingsStore((s) => s.toggleControls);
  const setControlValue = useSettingsStore((s) => s.setControlValue);

  const match = (text: string) => !filter || text.toLowerCase().includes(filter);
  const glyph = 'h-3.5 w-3.5';
  const mono = 'font-mono text-[10.5px] font-semibold';

  const keyBindingItems: KeyBindingItem[] = [
    { action: 'pause', label: t.settings.actions.pause, icon: <PauseIcon className={glyph} /> },
    { action: 'back', label: t.settings.actions.back, icon: <PointerIcon className={glyph} /> },
    { action: 'speed1', label: t.settings.actions.speed1, icon: <span className={mono}>1x</span> },
    { action: 'speed2', label: t.settings.actions.speed2, icon: <span className={mono}>2x</span> },
    { action: 'speed3', label: t.settings.actions.speed3, icon: <span className={mono}>3x</span> },
    { action: 'cycleSpeed', label: t.settings.actions.cycleSpeed, icon: <LightningIcon className={glyph} /> },
    { action: 'startWave', label: t.settings.actions.startWave, icon: <WaveIcon className={glyph} /> },
    { action: 'sellTower', label: t.settings.actions.sellTower, icon: <CoinIcon className={glyph} /> },
    { action: 'upgradeTower', label: t.settings.actions.upgradeTower, icon: <UpArrowIcon className={glyph} /> },
  ];

  const mouseRows = [
    { key: 'quickPlace', label: t.settings.quickPlace, desc: t.settings.quickPlaceDesc, icon: <TargetIcon className={glyph} />, value: gameplay.quickPlaceDefault, onToggle: () => toggleGameplay('quickPlaceDefault') },
    { key: 'confirmSell', label: t.settings.confirmSell, desc: t.settings.confirmSellDesc, icon: <ClipboardIcon className={glyph} />, value: gameplay.confirmSell, onToggle: () => toggleGameplay('confirmSell') },
    { key: 'edgePanning', label: t.settings.edgePanning, icon: <GlobeIcon className={glyph} />, value: controls.edgePanning, onToggle: () => toggleControls('edgePanning') },
  ];

  const filteredKeys = keyBindingItems.filter((k) => match(k.label));
  const filteredMouse = mouseRows.filter((r) => match(r.label) || match(r.desc ?? ''));
  const showAdvanced = match(t.settings.advancedControls) || match(t.settings.mouseSensitivity) || match(t.settings.zoomSpeed);

  return (
    <div className="flex flex-col gap-7">
      {filteredKeys.length > 0 && (
        <SectionGroup
          title={t.settings.keybindings}
          description={t.settings.keybindingsDesc}
          icon={<KeyboardIcon className="h-3.5 w-3.5" />}
          badge={t.settings.controls}
          count={filteredKeys.length}
          action={
            <Btn variant="danger" size="sm" onClick={resetKeyBindings}>
              {t.settings.resetDefaults}
            </Btn>
          }
          columns={3}
        >
          {filteredKeys.map(({ action, label, icon }) => {
            const isEditing = editingKey === action;
            return (
              <SettingRow
                key={action}
                icon={icon}
                label={label}
                control={
                  <SettingsChoiceButton
                    active={isEditing}
                    onClick={() => onStartEditKey(action)}
                    className="min-w-[74px] flex-none justify-center tabular-nums"
                    title={t.settings.clickToEdit}
                  >
                    {isEditing ? '···' : keyCodeToDisplayName(keyBindings[action])}
                  </SettingsChoiceButton>
                }
              />
            );
          })}
          <div className="col-span-full flex items-center gap-2 border-t border-[var(--hl-line)] px-4 py-2.5">
            <LightbulbIcon className="h-3.5 w-3.5 shrink-0 text-[var(--hl-ink-3)]" />
            <span className="font-mono text-[10px] text-[var(--hl-ink-3)]">{t.settings.clickToEdit}</span>
            <span className="ml-auto flex items-center gap-1.5">
              <Key>esc</Key>
            </span>
          </div>
        </SectionGroup>
      )}

      {filteredMouse.length > 0 && (
        <SectionGroup
          title={t.settings.mouse}
          description={t.settings.mouseDesc}
          icon={<MouseIcon className="h-3.5 w-3.5" />}
          badge={t.settings.controls}
          count={filteredMouse.length}
        >
          {filteredMouse.map((row) => (
            <SettingRow
              key={row.key}
              icon={row.icon}
              label={row.label}
              description={row.desc}
              control={<ToggleSwitch enabled={row.value} onToggle={row.onToggle} />}
            />
          ))}
        </SectionGroup>
      )}

      {showAdvanced && (
        <SectionGroup
          title={t.settings.advancedControls}
          description={t.settings.advancedControlsDesc}
          icon={<SlidersIcon className="h-3.5 w-3.5" />}
          badge={t.settings.controls}
          columns={1}
        >
          <SettingRow
            icon={<MouseIcon className={glyph} />}
            label={t.settings.mouseSensitivity}
            control={
              <span className="border border-[var(--hl-line)] bg-[var(--hl-void-2)] px-1.5 py-0.5 font-mono text-[10.5px] tabular-nums text-[var(--hl-ink-2)]">
                {Math.round(controls.mouseSensitivity * 100)}%
              </span>
            }
            expanded
            footer={
              <SettingsSlider
                value={controls.mouseSensitivity}
                onChange={(v) => setControlValue('mouseSensitivity', v)}
                disabled={false}
                icon={<MouseIcon className={glyph} />}
                label={t.settings.mouseSensitivity}
              />
            }
          />
          <SettingRow
            icon={<TargetIcon className={glyph} />}
            label={t.settings.zoomSpeed}
            control={
              <span className="border border-[var(--hl-line)] bg-[var(--hl-void-2)] px-1.5 py-0.5 font-mono text-[10.5px] tabular-nums text-[var(--hl-ink-2)]">
                {Math.round(controls.zoomSpeed * 100)}%
              </span>
            }
            expanded
            footer={
              <SettingsSlider
                value={controls.zoomSpeed}
                onChange={(v) => setControlValue('zoomSpeed', v)}
                disabled={false}
                icon={<TargetIcon className={glyph} />}
                label={t.settings.zoomSpeed}
              />
            }
          />
        </SectionGroup>
      )}
    </div>
  );
}

export default ControlsSection;
