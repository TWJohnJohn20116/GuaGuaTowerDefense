/**
 * 暫停選單 · 鍵盤快捷鍵提示 */

import type { ReactNode } from 'react';

import { useGameStore } from '@/store/gameStore';
import { keyCodeToDisplayName } from '@/components/scenes/settings/SettingsTabs';
import type { KeyAction } from '@/types/game';
import { SectionGroup, SettingRow } from '@/components/ui';
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
 { action: 'pause', label: t.game.pauseShortcutPauseResume, icon: <PauseIcon className="w-3.5 h-3.5 text-[var(--hl-caution)]"/> },
 { action: 'startWave', label: t.game.pauseShortcutStartWave, icon: <WaveIcon className="w-3.5 h-3.5 text-[var(--hl-reach)]"/> },
 { action: 'cycleSpeed', label: t.game.pauseShortcutCycleSpeed, icon: <LightningIcon className="w-3.5 h-3.5 text-[var(--hl-caution)]"/> },
 { action: 'upgradeTower', label: t.game.pauseShortcutUpgradeTower, icon: <UpArrowIcon className="w-3.5 h-3.5 text-[var(--hl-vital)]"/> },
 { action: 'sellTower', label: t.game.pauseShortcutSellTower, icon: <CoinIcon className="w-3.5 h-3.5 text-[var(--hl-caution)]"/> },
 { action: 'back', label: t.game.pauseShortcutDeselect, icon: <PointerIcon className="w-3.5 h-3.5 text-[var(--hl-ink-2)]"/> },
 ];

 return (
 <SectionGroup
 title={t.game.pauseShortcuts}
 description={t.game.pauseShortcutsDesc}
 icon={<KeyboardIcon className="h-5 w-5"/>}
 accent="amber"
 columns={2}
 action={
 <button
 type="button"
 onClick={() => openSettingsFromPause()}
 className={`${SCENE_TYPOGRAPHY.micro} font-bold text-[var(--hl-caution)] transition-colors hover:text-[var(--hl-caution)]`}
 >
 {t.game.pauseEditBindings}
 </button>
 }
 >
 {shortcutRows.map((row) => (
 <SettingRow
 key={row.action}
 icon={row.icon}
 label={row.label}
 accent="amber"
 control={
 <kbd className={`shrink-0 border border-[var(--hl-line-strong)] bg-[var(--hl-deck-3)] px-2 py-0.5 font-mono ${SCENE_TYPOGRAPHY.micro} font-bold text-[var(--hl-ink)]`}>
 {keyCodeToDisplayName(keyBindings[row.action])}
 </kbd>
 }
 />
 ))}
 </SectionGroup>
 );
}

export default PauseKeyShortcuts;
