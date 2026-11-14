// 多選塔批次操作面板 - Shift+點擊進入多選後顯示
// 使用 createPortal 渲染到 document.body，避免被 GameCanvas 父層 z-0 stacking context 限制
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useTranslation } from '@/i18n';
import {
  UpArrowIcon, MoneyBagIcon, CrossIcon, TrashIcon, CheckIcon,
} from '@/components/ui/Icons';
import { useGetTowerData } from './hooks';
import { canBatchUpgradeTower, getTowerUpgradeCost } from '@/data/towerUpgradeCost';
import { requestBatchSell, summarizeBatchSell } from '@/store/sellConfirm';
import { resolveBatchUpgradeHint } from '@/data/batchUpgradeHint';
import { Deck } from '@/components/hl';

export function MultiSelectPanel() {
  const { t } = useTranslation();
  const multiSelectedTowerIds = useGameStore((s) => s.multiSelectedTowerIds);
  const towers = useGameStore((s) => s.towers);
  const money = useGameStore((s) => s.money);
  const clearMultiSelect = useGameStore((s) => s.clearMultiSelect);
  const batchUpgradeSelected = useGameStore((s) => s.batchUpgradeSelected);
  const batchSellSelected = useGameStore((s) => s.batchSellSelected);
  const confirmSell = useSettingsStore((s) => s.gameplay.confirmSell);
  const sellingDisabled = Boolean(useGameStore((s) => s.mutatorRules?.sellingDisabled));
  const getTowerData = useGetTowerData();

  if (multiSelectedTowerIds.length === 0) return null;

  const selectedTowers = towers.filter((t) => multiSelectedTowerIds.includes(t.id));
  const batchTowers = selectedTowers.map((tower) => {
    const data = getTowerData(tower.type);
    return {
      id: tower.id,
      name: tower.customName || data?.name || tower.type,
      cost: data?.cost ?? 0,
      locked: tower.locked,
    };
  });
  const batchSummary = summarizeBatchSell(batchTowers, t.game.multiSelectTowers);
  const canSellBatch = !sellingDisabled && batchSummary.towerIds.length > 0;

  let totalUpgradeCost = 0;
  let upgradableCount = 0;
  selectedTowers.forEach((tower) => {
    const data = getTowerData(tower.type);
    if (!data) return;
    if (canBatchUpgradeTower(tower)) {
      totalUpgradeCost += getTowerUpgradeCost(data.cost, tower.level);
      upgradableCount++;
    }
  });

  const canUpgradeAll = money >= totalUpgradeCost && upgradableCount > 0;
  const upgradeHint = resolveBatchUpgradeHint({
    upgradableCount,
    totalCost: totalUpgradeCost,
    money,
  });

  const typeCount: Record<string, number> = {};
  selectedTowers.forEach((tower) => {
    typeCount[tower.type] = (typeCount[tower.type] || 0) + 1;
  });

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.16 }}
        className="fixed bottom-[60px] left-1/2 z-[100] -translate-x-1/2"
      >
        <Deck notch className="flex items-stretch overflow-hidden">
          {/* 左側：選擇統計 */}
          <div className="min-w-[168px] border-r border-[var(--hl-line)] px-3 py-2.5">
            <div className="flex items-center gap-1.5">
              <CheckIcon className="h-3 w-3 text-[var(--hl-signal)]" />
              <span className="hl-label">{t.game.multiSelectSelected}</span>
            </div>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="font-mono text-[18px] font-semibold tabular-nums leading-none text-[var(--hl-ink)]">
                {selectedTowers.length}
              </span>
              <span className="font-mono text-[10px] text-[var(--hl-ink-3)]">{t.game.multiSelectTowers}</span>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-1">
              {Object.entries(typeCount).slice(0, 4).map(([type, count]) => {
                return (
                  <span
                    key={type}
                    className="border border-[var(--hl-line)] px-1.5 py-0.5 font-mono text-[9px] tabular-nums text-[var(--hl-ink-2)]"
                    title={type}
                  >
                    {type} ×{count}
                  </span>
                );
              })}
              {Object.keys(typeCount).length > 4 && (
                <span className="font-mono text-[9px] text-[var(--hl-ink-4)]">
                  +{Object.keys(typeCount).length - 4}
                </span>
              )}
            </div>
          </div>

          {/* 批次升級 */}
          <button
            type="button"
            onClick={() => {
              if (upgradeHint !== 'ready') return;
              batchUpgradeSelected();
            }}
            disabled={!canUpgradeAll}
            className={`flex min-w-[112px] flex-col items-start justify-center gap-1 border-r border-[var(--hl-line)] px-3 py-2.5 text-left transition-colors ${
              canUpgradeAll
                ? 'text-[var(--hl-signal)] hover:bg-[var(--hl-signal-veil)]'
                : 'cursor-not-allowed text-[var(--hl-ink-4)]'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <UpArrowIcon className="h-3 w-3" />
              <span className="hl-label">{t.game.multiSelectUpgrade}</span>
            </span>
            <span className="font-mono text-[15px] font-semibold tabular-nums leading-none">
              {upgradeHint === 'none' ? t.game.multiSelectNotEnough : `$${totalUpgradeCost}`}
            </span>
          </button>

          {/* 批次出售 */}
          <button
            type="button"
            onClick={() => {
              const intent = requestBatchSell({
                towers: batchTowers,
                confirmSell,
                sellingDisabled,
                unitLabel: t.game.multiSelectTowers,
              });
              if (intent !== 'sell_now') return;
              batchSellSelected();
            }}
            disabled={!canSellBatch}
            className={`flex min-w-[104px] flex-col items-start justify-center gap-1 border-r border-[var(--hl-line)] px-3 py-2.5 text-left transition-colors ${
              canSellBatch
                ? 'text-[var(--hl-alarm)] hover:bg-[rgba(255,75,62,0.1)]'
                : 'cursor-not-allowed text-[var(--hl-ink-4)]'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <TrashIcon className="h-3 w-3" />
              <span className="hl-label">{t.game.multiSelectSell}</span>
            </span>
            <span className="flex items-baseline gap-1 font-mono text-[15px] font-semibold tabular-nums leading-none">
              <MoneyBagIcon className="h-3 w-3 self-center" />
              +${batchSummary.refund}
            </span>
          </button>

          {/* 取消 */}
          <button
            type="button"
            onClick={clearMultiSelect}
            className="flex w-10 items-center justify-center text-[var(--hl-ink-3)] transition-colors hover:bg-[var(--hl-deck-2)] hover:text-[var(--hl-ink)]"
            title={t.common.cancel}
          >
            <CrossIcon className="h-4 w-4" />
          </button>
        </Deck>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
