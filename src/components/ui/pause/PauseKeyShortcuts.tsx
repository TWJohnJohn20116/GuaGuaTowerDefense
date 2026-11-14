/**
 * 暫停選單 · 鍵盤快捷鍵提示 */

import type { ReactNode } from 'react';

import { useGameStore } from '@/store/gameStore';
import { keyCodeToDisplayName } from '@/components/scenes/settings/SettingsTabs';
import type { KeyAction } from '@/types/game';
import { SectionGroup, SettingRow } from '@/components/ui';
import { Btn } from '@/components/hl';
import { SCENE_TYPOGRAPHY } from '@/components/ui/SceneTypography';
import { KeyboardIcon, PauseIcon, WaveIcon, LightningIcon, CoinIcon, UpArrowIcon, PointerIcon } from '@/components/ui/Icons';
import { useTranslation } from '@/i18n';

export function PauseKeyShortcuts() {
 const { t } = useTranslation();
 const keyBindings = useGameStore((s) => s.keyBindings);
 const openSettingsFromPause = useGameStore((s) => s.openSettingsFromPause);

 const shortcutRows: {
 action: KeyAction;
 label: string;
 icon: ReactNode;
 }[] = [
 { action: 'pause', label: t.game.pauseShortcutPauseResume, icon: <PauseIcon className="w-3.5 h-3.5 text-[var(--arc-caution)]"/> },
 { action: 'startWave', label: t.game.pauseShortcutStartWave, icon: <WaveIcon className="w-3.5 h-3.5 text-[var(--arc-reach)]"/> },
 { action: 'cycleSpeed', label: t.game.pauseShortcutCycleSpeed, icon: <LightningIcon className="w-3.5 h-3.5 text-[var(--arc-caution)]"/> },
 { action: 'upgradeTower', label: t.game.pauseShortcutUpgradeTower, icon: <UpArrowIcon className="w-3.5 h-3.5 text-[var(--arc-vital)]"/> },
 { action: 'sellTower', label: t.game.pauseShortcutSellTower, icon: <CoinIcon className="w-3.5 h-3.5 text-[var(--arc-caution)]"/> },
 { action: 'back', label: t.game.pauseShortcutDeselect, icon: <PointerIcon className="w-3.5 h-3.5 text-[var(--arc-ink-2)]"/> },
 ];

 return (
 <SectionGroup
 title={t.game.pauseShortcuts}
 description={t.game.pauseShortcutsDesc}
 icon={<KeyboardIcon className="h-5 w-5"/>}
 accent="amber"
 columns={2}
 action={
 <Btn
 variant="ghost"
 size="sm"
 onClick={() => openSettingsFromPause()}
 className={`${SCENE_TYPOGRAPHY.micro} font-bold text-[var(--arc-caution)] transition-colors hover:text-[var(--arc-caution)]`}
 >
 {t.game.pauseEditBindings}
 </Btn>
 }
 >
 {shortcutRows.map((row) => (
 <SettingRow
 key={row.action}
 icon={row.icon}
 label={row.label}
 accent="amber"
 control={
 <kbd className={`shrink-0 arc-panel--sunken px-2 py-0.5 font-mono ${SCENE_TYPOGRAPHY.micro} font-bold text-[var(--arc-ink)]`}>
 {keyCodeToDisplayName(keyBindings[row.action])}
 </kbd>
 }
 />
 ))}
 </SectionGroup>
 );
}

export default PauseKeyShortcuts;
