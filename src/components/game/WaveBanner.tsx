/**
 * WaveBanner.tsx - 波次開始大標題動畫
 *
 * 偵測 waveActive 由 false 變為 true 時，於畫面顯示「Wave N」大標題，2 秒後自動消失。
 * 使用 createPortal 避免被 Sidebar / GameCanvas 的 stacking context 限制。
 *
 * 位置與尺寸可由「設定 → HUD → 波次橫幅」自訂。
 * HARDLINE：方角、1px 線、實色底，數值等寬，不用漸層與光暈。
 */

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useSettingsStore } from '@/store/settingsStore';
import type {
  HudVerticalPosition,
  HudHorizontalPosition,
  WaveBannerSize,
} from '@/store/settingsStore';
import { useTranslation } from '@/i18n';
import { WaveIcon } from '@/components/ui/Icons';

const BANNER_DURATION = 2000;

const VERTICAL_CLASS: Record<HudVerticalPosition, string> = {
  top: 'top-[18%]',
  middle: 'top-1/2 -translate-y-1/2',
  bottom: 'bottom-[22%]',
};

const HORIZONTAL_CLASS: Record<HudHorizontalPosition, string> = {
  left: 'left-8',
  center: 'left-1/2 -translate-x-1/2',
  right: 'right-8',
};

interface SizeSpec {
  padding: string;
  iconSize: string;
  labelSize: string;
  numberSize: string;
}

const SIZE_SPEC: Record<WaveBannerSize, SizeSpec> = {
  compact: {
    padding: 'px-5 py-2.5',
    iconSize: 'w-6 h-6',
    labelSize: 'text-[9px]',
    numberSize: 'text-[28px]',
  },
  normal: {
    padding: 'px-6 py-3.5',
    iconSize: 'w-8 h-8',
    labelSize: 'text-[10px]',
    numberSize: 'text-[40px]',
  },
  large: {
    padding: 'px-8 py-5',
    iconSize: 'w-10 h-10',
    labelSize: 'text-[11px]',
    numberSize: 'text-[56px]',
  },
};

export function WaveBanner() {
  const { t } = useTranslation();
  const waveActive = useGameStore((s) => s.waveActive);
  const currentWave = useGameStore((s) => s.currentWave);
  const endlessMode = useGameStore((s) => s.endlessMode);
  const maxWaves = useGameStore((s) => s.maxWaves);
  const hudLayout = useSettingsStore((s) => s.hudLayout);
  const prevWaveActiveRef = useRef(false);
  const [banner, setBanner] = useState<{ wave: number; key: number } | null>(null);

  useEffect(() => {
    if (!prevWaveActiveRef.current && waveActive && currentWave > 0) {
      setBanner({ wave: currentWave, key: Date.now() });
      const timer = setTimeout(() => setBanner(null), BANNER_DURATION);
      prevWaveActiveRef.current = true;
      return () => clearTimeout(timer);
    }
    prevWaveActiveRef.current = waveActive;
  }, [waveActive, currentWave]);

  if (!hudLayout.showWaveBanner) return null;

  const positionClass = `${VERTICAL_CLASS[hudLayout.waveBannerVertical]} ${HORIZONTAL_CLASS[hudLayout.waveBannerHorizontal]}`;
  const spec = SIZE_SPEC[hudLayout.waveBannerSize];

  return createPortal(
    <AnimatePresence>
      {banner && (
        <motion.div
          key={banner.key}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className={`fixed ${positionClass} pointer-events-none z-[9000]`}
        >
          <div className={`flex items-center gap-4 ${spec.padding}`}>
            <WaveIcon className={`${spec.iconSize} hud-ink shrink-0 text-[var(--cn-accent-text)]`} />

            <div className="flex flex-col items-start">
              <span className={`hud-ink font-mono text-[10px] font-extrabold uppercase tracking-[0.28em] text-[var(--cn-ink-2)] ${spec.labelSize}`}>
                {t.game.wave}
              </span>
              <span
                className={`hud-ink mt-1 flex items-baseline gap-1.5 font-mono font-black tabular-nums leading-none text-[var(--cn-accent-text)] ${spec.numberSize}`}
              >
                {banner.wave}
                {!endlessMode && maxWaves > 0 && (
                  <span className="font-mono text-[13px] font-bold text-[var(--cn-ink-3)]">
                    / {maxWaves}
                  </span>
                )}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export default WaveBanner;
