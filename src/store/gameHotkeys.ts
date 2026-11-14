/** 對局數字鍵：主動技能 Shift+0~9、塔快捷鍵 1~9 */

import type { KeyBindings } from '@/types/game';

export function digitFromKeyCode(code: string): string | null {
  const match = code.match(/^Digit([0-9])$/);
  return match ? match[1] : null;
}

export function towerHotkeyIndexFromDigit(digit: string): number | null {
  const index = Number.parseInt(digit, 10) - 1;
  if (index < 0) return null;
  return index;
}

export type BackKeyAction = 'resume' | 'pause' | 'deselect' | 'cancel_fusion';

export function hasActiveSelection(input: {
  selectedTower: unknown | null;
  selectedTowerType: unknown | null;
  multiSelectedCount: number;
}): boolean {
  return Boolean(input.selectedTower || input.selectedTowerType || input.multiSelectedCount > 0);
}

/** Esc／返回鍵：暫停中先恢復；合體模式先取消合體；有選取則取消選取，否則暫停。 */
export function resolveBackKeyAction(input: {
  isPaused: boolean;
  hasSelection: boolean;
  fusionMode?: boolean;
}): BackKeyAction {
  if (input.isPaused) return 'resume';
  if (input.fusionMode) return 'cancel_fusion';
  if (input.hasSelection) return 'deselect';
  return 'pause';
}

export type MatchKeyAction =
  | { kind: 'speed'; value: 1 | 2 | 3 }
  | { kind: 'cycle_speed' }
  | { kind: 'pause' }
  | { kind: 'back' }
  | { kind: 'start_wave' }
  | { kind: 'sell' }
  | { kind: 'upgrade' }
  | { kind: 'player_skill'; digit: string }
  | { kind: 'select_tower'; index: number }
  | { kind: 'none' };

/**
 * 一顆鍵只做一件事：預設 1/2/3 是速度，不能同時把前三座塔選起來。
 * Shift+數字留給主動技能，不改速度、不選塔。
 */
export function resolveMatchKeyAction(input: {
  code: string;
  shiftKey: boolean;
  keyBindings: KeyBindings;
}): MatchKeyAction {
  const digit = digitFromKeyCode(input.code);
  if (input.shiftKey && digit) {
    return { kind: 'player_skill', digit };
  }

  const bindings = input.keyBindings;
  if (input.code === bindings.back) return { kind: 'back' };
  if (input.code === bindings.pause) return { kind: 'pause' };
  if (input.code === bindings.speed1) return { kind: 'speed', value: 1 };
  if (input.code === bindings.speed2) return { kind: 'speed', value: 2 };
  if (input.code === bindings.speed3) return { kind: 'speed', value: 3 };
  if (input.code === bindings.cycleSpeed) return { kind: 'cycle_speed' };
  if (input.code === bindings.startWave) return { kind: 'start_wave' };
  if (input.code === bindings.sellTower) return { kind: 'sell' };
  if (input.code === bindings.upgradeTower) return { kind: 'upgrade' };

  if (digit) {
    const index = towerHotkeyIndexFromDigit(digit);
    if (index != null) return { kind: 'select_tower', index };
  }
  return { kind: 'none' };
}

