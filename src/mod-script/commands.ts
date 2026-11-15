/**
 * 指令落地：把腳本回傳的指令套用到遊戲狀態
 *
 * 所有數值都已由沙箱夾限；這裡再檢查一次「敵人類型存在」，避免腳本亂丟未知 id。
 */
import type { ModScriptCommand } from '@/types/modScript';
import type { StatusEffect } from '@/types/game';
import { PROTOCOL_HEALTH_CAP_BONUS } from '@/data/tacticalProtocolData';
import { useModScriptStore } from '@/store/modScriptStore';
import { MOD_SCRIPT_LIMITS } from './limits';

interface ApplyCommandResult {
  applied: number;
  skipped: number;
}

export async function applyModScriptCommands(
  commands: ModScriptCommand[],
  source: { scriptId: string; scriptName: string },
): Promise<ApplyCommandResult> {
  if (commands.length === 0) return { applied: 0, skipped: 0 };

  const { useGameStore } = await import('@/store/gameStore');
  const { ENEMY_DATA } = await import('@/data/gameData');
  const scriptStore = useModScriptStore.getState();

  let applied = 0;
  let skipped = 0;

  const log = (level: 'debug' | 'info' | 'warn', message: string): void => {
    scriptStore.pushLog({
      at: Date.now(),
      level,
      message,
      scriptId: source.scriptId,
      scriptName: source.scriptName,
    });
  };

  for (const command of commands) {
    switch (command.kind) {
      case 'log': {
        log(command.level, command.message);
        applied += 1;
        break;
      }
      case 'addMoney': {
        useGameStore.setState((state) => ({ money: state.money + command.amount }));
        useGameStore.getState().addMoneyText(7, 4, Math.abs(command.amount), command.amount >= 0);
        applied += 1;
        break;
      }
      case 'healBase': {
        const state = useGameStore.getState();
        const cap = state.difficultyModifiers.startingHealth + PROTOCOL_HEALTH_CAP_BONUS;
        useGameStore.setState((prev) => ({
          health: Math.min(Math.max(cap, prev.health), prev.health + command.amount),
        }));
        applied += 1;
        break;
      }
      case 'damageBase': {
        useGameStore.getState().takeDamage(command.amount);
        applied += 1;
        break;
      }
      case 'spawnEnemy': {
        const known = Object.prototype.hasOwnProperty.call(ENEMY_DATA, command.enemyType);
        if (!known) {
          log('warn', `腳本想生成未知敵人「${command.enemyType}」，已忽略`);
          skipped += 1;
          break;
        }
        for (let i = 0; i < command.count; i += 1) {
          setTimeout(() => {
            useGameStore.getState().spawnEnemy(command.enemyType);
          }, i * command.intervalMs);
        }
        applied += 1;
        break;
      }
      case 'applyStatus': {
        const effect: StatusEffect = {
          type: command.effect,
          duration: command.durationMs,
          startTime: Date.now(),
          value: command.value,
          source: 'mod-script',
        };
        let touched = 0;
        useGameStore.setState((state) => ({
          enemies: state.enemies.map((enemy) => {
            if (command.enemyType && enemy.type !== command.enemyType) return enemy;
            if (touched >= MOD_SCRIPT_LIMITS.maxStatusTargets) return enemy;
            touched += 1;
            return { ...enemy, effects: [...enemy.effects, effect] };
          }),
        }));
        applied += 1;
        break;
      }
      default: {
        skipped += 1;
        break;
      }
    }
  }

  if (skipped > 0) {
    log('warn', `有 ${skipped} 條指令被忽略`);
  }
  return { applied, skipped };
}
