/**
 * 指令落地：把腳本回傳的指令套用到遊戲狀態
 *
 * 所有數值都已由沙箱夾限；這裡再檢查一次「敵人類型存在」，避免腳本亂丟未知 id。
 */
import type { ModScriptCommand } from '@/types/modScript';
import type { StatusEffect, Tower } from '@/types/game';
import { applyScriptTowerMod } from '@/data/scriptTowerMods';
import { PROTOCOL_HEALTH_CAP_BONUS } from '@/data/tacticalProtocolData';
import { useModScriptStore } from '@/store/modScriptStore';
import { MOD_SCRIPT_LIMITS } from './limits';

/** 依格子座標找塔（腳本指令用；座標是 (col,row) 但呼叫端習慣 row,col，這裡統一收 row,col） */
function findTowerAt(towers: readonly Tower[], row: number, col: number): Tower | undefined {
  return towers.find((tower) => tower.gridPos.row === row && tower.gridPos.col === col);
}

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
  const { isKnownEnemyType } = await import('@/store/gameStoreUtils');
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
        if (!isKnownEnemyType(command.enemyType)) {
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
      case 'setScriptState': {
        useModScriptStore.getState().setScriptState(source.scriptId, command.key, command.value);
        applied += 1;
        break;
      }
      case 'addScore': {
        useGameStore.setState((state) => ({ score: Math.max(0, state.score + command.amount) }));
        applied += 1;
        break;
      }
      case 'modifyTower': {
        useGameStore.setState((state) => ({
          scriptTowerMods: applyScriptTowerMod(
            state.scriptTowerMods,
            command.scope,
            command.stat,
            command.multiplier,
          ),
        }));
        applied += 1;
        break;
      }
      case 'upgradeTowerAt': {
        const target = findTowerAt(useGameStore.getState().towers, command.row, command.col);
        if (!target) {
          log('warn', `座標 (${command.col}, ${command.row}) 沒有塔，升級指令已忽略`);
          skipped += 1;
          break;
        }
        // 腳本升級：Lv2 需要路線，未指定時預設 A 路線
        const upgraded = useGameStore.getState().upgradeTower(target, target.upgradePath ?? 'A');
        if (upgraded) applied += 1;
        else skipped += 1;
        break;
      }
      case 'sellTowerAt': {
        const target = findTowerAt(useGameStore.getState().towers, command.row, command.col);
        if (!target) {
          log('warn', `座標 (${command.col}, ${command.row}) 沒有塔，出售指令已忽略`);
          skipped += 1;
          break;
        }
        useGameStore.getState().sellTower(target);
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
