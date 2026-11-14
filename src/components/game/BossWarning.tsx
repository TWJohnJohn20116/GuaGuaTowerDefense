// Boss 警告遮層 - 偵測 boss 敵人出現時顯示警告（HARDLINE Modal）
// 使用 createPortal 渲染到 document.body，避免被 GameCanvas 父層 z-0 stacking context 限制
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/i18n';
import { SkullIcon, WarningIcon } from '@/components/ui/Icons';
import { Deck } from '@/components/hl';

const BOSS_TYPES = ['boss', 'miniboss'];

export function BossWarning() {
  const { t } = useTranslation();

  const [showWarning, setShowWarning] = useState<{ type: string; key: number } | null>(null);

  // 性能優化：不訂閱整個 enemies 陣列（每幀變動會觸發 useEffect re-run），
  // 改以 store.subscribe + ref 比對「上一次的 boss id 集合」，僅在「新 boss 出現」時觸發 React 狀態更新。
  useEffect(() => {
    const seenBossIds = new Set<string>();
    let timer: ReturnType<typeof setTimeout> | null = null;

    const checkForNewBosses = () => {
      if (useGameStore.getState().isPaused) return;
      const enemies = useGameStore.getState().enemies;
      for (let i = 0; i < enemies.length; i++) {
        const e = enemies[i];
        if (BOSS_TYPES.includes(e.type) && !seenBossIds.has(e.id)) {
          seenBossIds.add(e.id);
          setShowWarning({ type: e.type, key: Date.now() });
          if (timer) clearTimeout(timer);
          timer = setTimeout(() => setShowWarning(null), 3500);
          break;
        }
      }
    };

    let prevEnemies = useGameStore.getState().enemies;
    const unsubscribe = useGameStore.subscribe((state) => {
      if (state.enemies !== prevEnemies) {
        prevEnemies = state.enemies;
        checkForNewBosses();
      }
    });

    return () => {
      unsubscribe();
      if (timer) clearTimeout(timer);
    };
  }, []);

  return createPortal(
    <AnimatePresence>
      {showWarning && (
        <motion.div
          key={showWarning.key}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center bg-[rgba(6,7,10,0.82)] p-4"
        >
          {/* 上下 1px 警報線，不用閃爍紅框 */}
          <span className="absolute inset-x-0 top-0 h-px bg-[rgba(255,75,62,0.6)]" />
          <span className="absolute inset-x-0 bottom-0 h-px bg-[rgba(255,75,62,0.6)]" />

          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="w-full max-w-[420px]"
          >
            <Deck notch className="border-[rgba(255,75,62,0.45)]">
              <header className="flex items-center gap-3 border-b border-[var(--hl-line)] px-4 py-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-[rgba(255,75,62,0.45)] text-[var(--hl-alarm)]">
                  <SkullIcon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <div className="hl-label text-[var(--hl-alarm)]">threat / boss</div>
                  <h2 className="mt-1 truncate text-[17px] font-semibold leading-tight text-[var(--hl-ink)]">
                    {showWarning.type === 'miniboss' ? t.game.eliteEnemy : t.game.bossIncoming}
                  </h2>
                </div>
              </header>
              <div className="flex items-center gap-2 px-4 py-3">
                <WarningIcon className="h-3.5 w-3.5 shrink-0 text-[var(--hl-caution)]" />
                <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-[var(--hl-caution)]">
                  {t.game.bossSpawned}
                </span>
              </div>
            </Deck>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
