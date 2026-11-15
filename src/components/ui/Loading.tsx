import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/i18n';
import { useSettingsStore } from '@/store/settingsStore';
import { LOADING_TIP_CLASS, nextLoadingTipIndex, visibleLoadingTip } from '@/data/loadingTips';
import { version as APP_VERSION } from '../../../package.json';

interface LoadingProps {
  message?: string;
  progress?: number;
}

/**
 * 載入畫面
 *
 * 舊版是「system / load」標籤 + 24 格掃動刻度 + 3px 粗邊框軌道，沒有品牌識別；
 * 而且它用 var(--arc-void) 當底色 —— candy 主題把 --arc-void 映射到奶油色，
 * 於是白色提示文字一直是隱形的（2.67:1 都不到）。
 *
 * 新版：明確深色底（不依賴主題變數，因為載入畫面必須在任何主題下都一致），
 * 品牌大字 + 細進度軌 + 百分比，提示移進中央區塊，背景三圈極淡同心圓。
 * 刻度條整個移除：24 個同時動畫的元素只製造噪音。
 */
export default function Loading({ message, progress }: LoadingProps) {
  const { t } = useTranslation();
  const tips = t.game.loadingTips;
  const showTips = useSettingsStore((s) => s.gameplay.showTips);
  const [tipIndex, setTipIndex] = useState(0);
  const displayMessage = message ?? t.common.loading;
  const tipText = visibleLoadingTip(tips, showTips ? tipIndex : 0, showTips);
  const pct = Math.max(0, Math.min(100, progress ?? 0));

  useEffect(() => {
    if (!showTips || tips.length === 0) return;
    const interval = setInterval(() => {
      setTipIndex((prev) => nextLoadingTipIndex(prev, tips.length));
    }, 3000);
    return () => clearInterval(interval);
  }, [showTips, tips.length]);

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-[#0b0e14] px-6 font-sans">
      {/* 背景同心圓：純裝飾，撐住畫面重心 */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="h-[520px] w-[520px] rounded-full border border-white/[0.06]" />
        <span className="absolute h-[360px] w-[360px] rounded-full border border-white/[0.05]" />
        <span className="absolute h-[200px] w-[200px] rounded-full border border-white/[0.04]" />
      </div>

      <div className="relative flex w-[360px] max-w-full flex-col items-center gap-7">
        {/* 品牌 */}
        <div className="flex flex-col items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#7d8798]">
            guagua tower defense
          </span>
          <h1 className="text-[40px] font-black leading-none tracking-[-0.04em] text-[#e6edf3]">
            {t.mainMenu.title}
          </h1>
        </div>

        {/* 進度 */}
        <div className="flex w-full flex-col gap-2">
          <div className="relative h-[3px] w-full overflow-hidden rounded-full bg-[#171c26]">
            {progress !== undefined ? (
              <motion.span
                className="absolute inset-y-0 left-0 rounded-full bg-[#ffb627]"
                initial={{ width: 0 }}
                animate={{ width: pct + '%' }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            ) : (
              <motion.span
                className="absolute inset-y-0 w-1/4 rounded-full bg-[#ffb627]"
                animate={{ left: ['-25%', '100%'] }}
                transition={{ duration: 1.3, repeat: Infinity, ease: 'linear' }}
              />
            )}
          </div>
          <div className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.14em]">
            <span className="text-[#8b95a5]">{displayMessage}</span>
            <span className="tabular-nums text-[#ffb627]">
              {progress !== undefined ? Math.round(pct) + '%' : '···'}
            </span>
          </div>
        </div>

        {/* 循環提示 */}
        <div className={`flex min-h-10 items-center justify-center text-center ${LOADING_TIP_CLASS}`}>
          <AnimatePresence mode="wait">
            {tipText ? (
              <motion.p
                key={tipIndex}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="max-w-[34ch] text-[11px] leading-relaxed"
              >
                {tipText}
              </motion.p>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      {/* 角落版本 */}
      <span className="absolute bottom-4 right-5 font-mono text-[9px] uppercase tracking-[0.14em] text-[#7d8798]">
        {'v' + APP_VERSION}
      </span>
    </div>
  );
}