/**
 * 成就通知組件
 * Achievement Notification Component
 *
 * HARDLINE：固定在右上，1px 線 + 左緣 2px 資料色，無漸層、無發光、無圓角。
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrophyIcon } from '@/components/ui/Icons';
import { useAchievementStore } from '@/store/achievementStore';
import { getAchievement } from '@/data/achievementData';
import { RARITY_CONFIG } from '@/types/achievement';

export default function AchievementNotification() {
  const { notifications, dismissNotification } = useAchievementStore();
  const [visibleNotifications, setVisibleNotifications] = useState<string[]>([]);

  useEffect(() => {
    const undismissed = notifications
      .filter(n => !n.dismissed && n.type === 'unlock')
      .slice(-2);

    const newIds = undismissed.map(n => n.id);
    setVisibleNotifications(newIds);

    undismissed.forEach(notification => {
      setTimeout(() => {
        dismissNotification(notification.id);
      }, 5000);
    });
  }, [notifications, dismissNotification]);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[286px] flex-col gap-1.5">
      <AnimatePresence>
        {notifications
          .filter(n => visibleNotifications.includes(n.id) && n.type === 'unlock')
          .map(notification => {
            const achievement = getAchievement(notification.achievementId);
            if (!achievement) return null;

            const rarityConfig = RARITY_CONFIG[achievement.rarity];

            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.16 }}
                className="pointer-events-auto cursor-pointer arc-panel--flat rounded-sm border-l-2"
                style={{ borderLeftColor: rarityConfig.color }}
                onClick={() => dismissNotification(notification.id)}
              >
                <div className="flex items-start gap-2.5 p-2.5">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border-[3px] border-[var(--cn-line-soft)] text-[15px]"
                    style={{ backgroundColor: rarityConfig.bgColor }}
                  >
                    {achievement.icon}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <TrophyIcon className="h-3 w-3 shrink-0" style={{ color: rarityConfig.color }} />
                      <span className="arc-label" style={{ color: rarityConfig.color }}>
                        成就解鎖！
                      </span>
                      <span className="ml-auto shrink-0 font-mono text-[9px] uppercase tracking-[0.06em] text-[var(--arc-ink-4)]">
                        {rarityConfig.label}
                      </span>
                    </div>
                    <div className="mt-1 truncate text-[12.5px] font-semibold text-[var(--arc-ink)]">
                      {achievement.name}
                    </div>
                    <div className="mt-0.5 truncate text-[10.5px] text-[var(--arc-ink-3)]">
                      {achievement.description}
                    </div>
                  </div>
                </div>

                {/* 自動消失計時：1px 線倒數 */}
                <motion.div
                  className="h-px w-full origin-left"
                  style={{ backgroundColor: rarityConfig.color }}
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: 5, ease: 'linear' }}
                />
              </motion.div>
            );
          })}
      </AnimatePresence>
    </div>
  );
}
