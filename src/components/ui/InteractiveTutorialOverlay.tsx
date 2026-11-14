import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTutorialStore, INTERACTIVE_TUTORIAL_STEPS } from '@/store/tutorialStore';
import { LightbulbIcon, SkipForwardIcon, ChevronRightIcon } from '@/components/ui/Icons';
import { useTranslation } from '@/i18n';
import { formatStepProgress } from '@/data/tutorialOverlayCopy';
import { Btn, Deck } from '@/components/hl';

export const InteractiveTutorialOverlay: React.FC = () => {
  const { t } = useTranslation();
  const { isActive, currentStepIndex, nextStep, skipTutorial } = useTutorialStore();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const step = INTERACTIVE_TUTORIAL_STEPS[currentStepIndex];

  useEffect(() => {
    if (!isActive || !step?.targetId) {
      setTargetRect(null);
      return;
    }

    const updateRect = () => {
      let el = document.getElementById(step.targetId!);
      
      // Fallback: 如果處於升級步驟，但面板沒有打開（找不到按鈕），則高亮地圖網格引導玩家重新點選防禦塔
      if (!el && step.action === 'upgrade_tower') {
        el = document.getElementById('tutorial-target-grid');
      }

      if (el) {
        setTargetRect(el.getBoundingClientRect());
      } else {
        setTargetRect(null);
      }
    };

    updateRect();
    window.addEventListener('resize', updateRect);
    
    // Poll for rect updates in case of animations
    const interval = setInterval(updateRect, 100);
    return () => {
      window.removeEventListener('resize', updateRect);
      clearInterval(interval);
    };
  }, [isActive, step]);

  if (!isActive || !step) return null;

  // Determine tooltip position based on step.position and targetRect
  let tooltipStyle: React.CSSProperties = {};
  if (targetRect && step.position !== 'center') {
    // 增加 margin 以避免太靠近按鈕，並考慮視窗邊界
    const margin = 24;

    // 為了徹底解決邊界溢出問題，我們不再依賴 `transform` 進行中心點位移，
    // 而是直接計算 Tooltip 的絕對座標 (left, top)，這樣邊界約束會 100% 精準。
    // 假設 Tooltip 寬度最大為 320px (根據 max-w-xs)
    const tooltipWidth = 320;
    const tooltipHeight = 180; // 預估高度

    let finalTop = 0;
    let finalLeft = 0;

    if (step.position === 'left') {
      finalTop = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
      finalLeft = targetRect.left - margin - tooltipWidth;
      // 碰撞檢測：如果左邊超出視窗，改為顯示在右邊
      if (finalLeft < 10) {
        finalLeft = targetRect.right + margin;
      }
    } else if (step.position === 'right') {
      finalTop = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
      finalLeft = targetRect.right + margin;
      // 碰撞檢測：如果右邊超出視窗，改為顯示在左邊
      if (finalLeft + tooltipWidth > window.innerWidth - 10) {
        finalLeft = targetRect.left - margin - tooltipWidth;
      }
    } else if (step.position === 'top') {
      finalTop = targetRect.top - margin - tooltipHeight;
      finalLeft = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
      // 碰撞檢測：如果上面超出視窗，改為顯示在下面
      if (finalTop < 10) {
        finalTop = targetRect.bottom + margin;
      }
    } else if (step.position === 'bottom') {
      finalTop = targetRect.bottom + margin;
      finalLeft = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
      // 碰撞檢測：如果下面超出視窗，改為顯示在上面
      if (finalTop + tooltipHeight > window.innerHeight - 10) {
        finalTop = targetRect.top - margin - tooltipHeight;
      }
    }

    // 絕對邊界約束 (Clamp) - 確保任何情況下都不會超出視窗
    if (finalLeft < 10) finalLeft = 10;
    if (finalLeft + tooltipWidth > window.innerWidth - 10) {
      finalLeft = window.innerWidth - tooltipWidth - 10;
    }
    
    // 如果是頂部狀態列，確保卡片不會太靠上
    if (step.targetId === 'tutorial-target-top-stats' && finalTop < targetRect.bottom + margin) {
      finalTop = targetRect.bottom + margin;
    } else if (finalTop < 10) {
      finalTop = 10;
    }
    
    // 考慮到底部可能會有操作列，保留更多空間
    if (finalTop + tooltipHeight > window.innerHeight - 20) {
      finalTop = window.innerHeight - tooltipHeight - 20;
    }

    tooltipStyle = {
      top: finalTop,
      left: finalLeft,
    };
  } else {
    // 預設沒有 targetId 的情況下，如果位置設定為 top 或 bottom，也可以讓它不擋住中間
    if (step.position === 'top') {
      tooltipStyle = {
        top: '15%',
        left: '50%',
        transform: 'translateX(-50%)',
      };
    } else if (step.position === 'bottom') {
      tooltipStyle = {
        bottom: '15%',
        left: '50%',
        transform: 'translateX(-50%)',
      };
    } else {
      tooltipStyle = {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      <div className="pointer-events-auto absolute right-3 top-3 z-50">
        <button
          type="button"
          onClick={skipTutorial}
          className="flex items-center gap-2 border border-[var(--hl-line-strong)] bg-[var(--hl-deck)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--hl-ink-3)] transition-colors hover:border-[var(--hl-line-hot)] hover:text-[var(--hl-ink)]"
        >
          <SkipForwardIcon className="h-3 w-3" />
          {t.tutorial.skipInteractive}
        </button>
      </div>

      {/* Background Mask */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${
          step.transparentMask ? 'bg-[rgba(6,7,10,0.15)]' : 'bg-[rgba(6,7,10,0.6)]'
        } ${targetRect ? 'pointer-events-auto' : 'pointer-events-none'}`}
        style={targetRect ? {
          clipPath: `polygon(
            0% 0%, 0% 100%, 100% 100%, 100% 0%, 0% 0%,
            ${targetRect.left - 8}px 0%,
            ${targetRect.left - 8}px ${targetRect.top - 8}px,
            ${targetRect.right + 8}px ${targetRect.top - 8}px,
            ${targetRect.right + 8}px ${targetRect.bottom + 8}px,
            ${targetRect.left - 8}px ${targetRect.bottom + 8}px,
            ${targetRect.left - 8}px 0%
          )`
        } : {}}
      />

      {/* 目標框：1px 訊號線 + 訊號膜 */}
      {targetRect && (
        <motion.div
          className="pointer-events-none absolute border border-[var(--hl-signal)]"
          initial={false}
          animate={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
          }}
          transition={{ duration: 0.16 }}
        >
          <div className="absolute inset-0 animate-pulse bg-[var(--hl-signal-veil)]" />
        </motion.div>
      )}

      {/* Tooltip Dialog */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          className="pointer-events-auto absolute"
          style={tooltipStyle}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.16 }}
        >
          <Deck notch className="flex w-[320px] flex-col gap-2.5 p-3">
            <div className="flex items-start gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center border border-[var(--hl-line-strong)] text-[var(--hl-signal)]">
                <LightbulbIcon className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0">
                <div className="hl-label">tutorial</div>
                <h3 className="mt-1 text-[17px] font-semibold leading-tight text-[var(--hl-ink)]">
                  {step.title}
                </h3>
              </div>
            </div>

            <p className="text-[12.5px] leading-relaxed text-[var(--hl-ink-2)]">
              {step.content}
            </p>

            <div className="flex items-center justify-between gap-2 border-t border-[var(--hl-line)] pt-2">
              <span className="font-mono text-[10px] tabular-nums tracking-[0.06em] text-[var(--hl-ink-4)]">
                {formatStepProgress(t.tutorial.overlayStep, currentStepIndex + 1, INTERACTIVE_TUTORIAL_STEPS.length)}
              </span>

              {step.action === 'next' && (
                <Btn
                  variant="signal"
                  size="sm"
                  icon={<ChevronRightIcon className="h-3.5 w-3.5" />}
                  onClick={nextStep}
                >
                  {t.game.continue}
                </Btn>
              )}
            </div>
          </Deck>
        </motion.div>
      </AnimatePresence>
      
      {/* Invisible overlay over non-target areas to prevent clicks if we want to force the action.
          Actually, since pointer-events-none is on the root, we only have pointer-events-auto on the tooltip.
          We need to allow clicks on the target. We can just rely on the target's own click handler which will call checkAction.
      */}
    </div>
  );
};
