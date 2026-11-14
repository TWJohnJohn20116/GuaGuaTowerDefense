/**
 * HUD 即時可視化預覽（無戰場背景）· HARDLINE
 *
 * 預覽框＝下沉面 + 1px 線 + 細格底。
 * 裡面畫的是「玩家設定的遊戲內 HUD」，因此角樣式 / 模糊 / 陰影仍由
 * getHudStyleClasses 依設定回傳；框本身不再有漸層、圓角、內陰影。
 */

import { motion } from 'framer-motion';
import {
  type HudHorizontalPosition,
  type HudVerticalPosition,
  type HudUiScale,
  type WaveBannerSize,
  type HudLayoutState,
} from '@/store/settingsStore';
import {
  CoinIcon, HeartIcon, WaveIcon, StarIcon,
  Play2Icon, FastForwardIcon, PauseIcon, CrosshairIcon,
  SnowflakeIcon, FlameIcon, LightningIcon, DangerIcon, ExplosionIcon,
  TowerIcon, CheckSquareIcon,
} from '@/components/ui/Icons';
import { getHudStyleClasses } from '@/components/game/sidebar/hudStyle';
import { useTranslation } from '@/i18n';

const HORIZONTAL_TO_JUSTIFY: Record<HudHorizontalPosition, string> = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
};

const SCALE_VALUE: Record<HudUiScale, number> = {
  compact: 0.86,
  normal: 1,
  large: 1.18,
};

export function HudPreviewCard({ layout }: { layout: HudLayoutState }) {
  const { t } = useTranslation();
  const h = t.settings.hudPreview;
  const towerOnLeft = layout.towerPanel === 'left';
  const scale = SCALE_VALUE[layout.uiScale];

  return (
    <div className="flex w-full flex-col gap-2.5 border border-[var(--hl-line)] bg-[var(--hl-deck)] p-3">
      <div className="flex items-center gap-2">
        <span className="border border-[var(--hl-signal-edge)] px-1.5 py-0.5 font-mono text-[10px] uppercase leading-none tracking-[0.1em] text-[var(--hl-signal)]">
          {h.live}
        </span>
        <span className="hl-label">{h.livePreview}</span>
        <span className="h-px flex-1 bg-[var(--hl-line)]" />
        <span className="font-mono text-[10px] tabular-nums text-[var(--hl-ink-3)]">
          {scaleLabel(layout.uiScale)}
        </span>
      </div>

      <div
        className="relative h-72 w-full overflow-hidden border border-[var(--hl-line)] bg-[var(--hl-void-2)]"
        style={{ opacity: Math.max(0.55, layout.opacity) }}
      >
        <PreviewGridBackground />

        {layout.showWaveBanner && (
          <MiniWaveBannerOverlay
            vertical={layout.waveBannerVertical}
            horizontal={layout.waveBannerHorizontal}
            size={layout.waveBannerSize}
          />
        )}

        <div className="relative z-10 flex h-full flex-col justify-between p-3">
          <div className={`flex w-full ${HORIZONTAL_TO_JUSTIFY[layout.statsBar]}`}>
            {layout.showStatsBar ? (
              <motion.div
                layout
                transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
              >
                <MiniTopStatsBar layout={layout} />
              </motion.div>
            ) : (
              <HiddenPlaceholder label={h.statsBarHidden} />
            )}
          </div>

          <div className={`my-2 flex flex-1 items-center ${towerOnLeft ? 'justify-start' : 'justify-end'}`}>
            {layout.showTowerPanel ? (
              <motion.div
                layout
                transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: towerOnLeft ? 'left center' : 'right center',
                }}
              >
                <MiniTowerPanel layout={layout} towerLabel={h.towerLabel} />
              </motion.div>
            ) : (
              <HiddenPlaceholder label={h.towerPanelHidden} />
            )}
          </div>

          <div className={`flex w-full ${HORIZONTAL_TO_JUSTIFY[layout.bottomControls]}`}>
            {layout.showBottomControls ? (
              <motion.div
                layout
                transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                style={{ transform: `scale(${scale})`, transformOrigin: 'bottom center' }}
              >
                <MiniBottomControls layout={layout} />
              </motion.div>
            ) : (
              <HiddenPlaceholder label={h.bottomControlsHidden} />
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-[var(--hl-line)] pt-2">
        <PreviewLegend tone="vital" label={h.legendStatsBar} hidden={!layout.showStatsBar} />
        <PreviewLegend tone="caution" label={h.legendTowerPanel} hidden={!layout.showTowerPanel} />
        <PreviewLegend tone="reach" label={h.legendBottomControls} hidden={!layout.showBottomControls} />
        <span className="ml-auto font-mono text-[10px] tabular-nums text-[var(--hl-ink-4)]">
          {h.opacityLabel.replace('{percent}', String(Math.round(layout.opacity * 100)))}
        </span>
      </div>
    </div>
  );
}

function scaleLabel(scale: HudUiScale): string {
  if (scale === 'compact') return '0.86x';
  if (scale === 'large') return '1.18x';
  return '1.00x';
}

function PreviewGridBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-60"
      style={{
        backgroundImage:
          'linear-gradient(to right, rgba(236,239,242,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(236,239,242,0.05) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    />
  );
}

function HiddenPlaceholder({ label }: { label: string }) {
  return (
    <span className="border border-dashed border-[var(--hl-line)] px-1.5 py-0.5 font-mono text-[10px] uppercase leading-none tracking-[0.1em] text-[var(--hl-ink-4)]">
      {label}
    </span>
  );
}

function MiniTopStatsBar({ layout }: { layout: HudLayoutState }) {
  const cls = getHudStyleClasses(layout, 'pill');
  return (
    <div
      className={`flex items-center gap-2 border bg-[var(--hl-deck-3)] px-3 py-1 font-mono text-[10px] tabular-nums text-[var(--hl-ink)] ${cls.corner} ${cls.blur} ${cls.border} ${cls.shadow}`}
    >
      <span className="flex items-center gap-1">
        <CoinIcon className="h-3 w-3 text-[var(--hl-caution)]" />
        <span>128</span>
      </span>
      <span className="h-3 w-px bg-[var(--hl-line)]" />
      <span className="flex items-center gap-1">
        <HeartIcon className="h-3 w-3 text-[var(--hl-alarm)]" />
        <span>10</span>
      </span>
      <span className="h-3 w-px bg-[var(--hl-line)]" />
      <span className="flex items-center gap-1">
        <WaveIcon className="h-3 w-3 text-[var(--hl-ink-2)]" />
        <span>3/10</span>
      </span>
      <span className="h-3 w-px bg-[var(--hl-line)]" />
      <span className="flex items-center gap-1">
        <StarIcon className="h-3 w-3 text-[var(--hl-caution)]" />
        <span>42</span>
      </span>
    </div>
  );
}

function MiniTowerPanel({ layout, towerLabel }: { layout: HudLayoutState; towerLabel: string }) {
  const cls = getHudStyleClasses(layout, 'panel');
  const towers = [
    { Icon: CrosshairIcon, tone: 'text-[var(--hl-ink-2)]', bg: 'bg-[var(--hl-deck-3)] border border-[var(--hl-line)]' },
    { Icon: SnowflakeIcon, tone: 'text-[var(--hl-reach)]', bg: 'bg-[var(--hl-deck-3)] border border-[var(--hl-line)]' },
    { Icon: FlameIcon, tone: 'text-[var(--hl-caution)]', bg: 'bg-[var(--hl-deck-3)] border border-[var(--hl-line)]' },
    { Icon: LightningIcon, tone: 'text-[var(--hl-caution)]', bg: 'bg-[var(--hl-deck-3)] border border-[var(--hl-line)]' },
    { Icon: DangerIcon, tone: 'text-[var(--hl-alarm)]', bg: 'bg-[var(--hl-deck-3)] border border-[var(--hl-line)]' },
    { Icon: ExplosionIcon, tone: 'text-[var(--hl-alarm)]', bg: 'bg-[var(--hl-deck-3)] border border-[var(--hl-line)]' },
  ] as const;

  const cols = layout.towerListColumns;
  const sizeMap = { small: 'h-4 w-4', medium: 'h-5 w-5', large: 'h-7 w-7' } as const;
  const iconSizeMap = { small: 'h-2.5 w-2.5', medium: 'h-3 w-3', large: 'h-4 w-4' } as const;
  const gapMap = { tight: 'gap-0.5', normal: 'gap-1.5', wide: 'gap-2' } as const;
  const itemSize = sizeMap[layout.towerButtonSize];
  const itemIcon = iconSizeMap[layout.towerButtonSize];
  const itemGap = gapMap[layout.towerListSpacing];

  return (
    <div
      className={`flex flex-col ${itemGap} border bg-[var(--hl-deck-2)] p-2 ${cls.corner} ${cls.blur} ${cls.border} ${cls.shadow}`}
    >
      {layout.showTowerCategories && (
        <div className="flex items-center justify-center gap-1 px-1">
          <TowerIcon className="h-2.5 w-2.5 text-[var(--hl-ink-3)]" />
          <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-[var(--hl-ink-3)]">{towerLabel}</span>
        </div>
      )}
      <div
        className={`grid ${itemGap}`}
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}
      >
        {towers.slice(0, cols * 2).map(({ Icon, tone, bg }, i) => (
          <span key={i} className={`flex items-center justify-center ${bg} ${itemSize}`}>
            <Icon className={`${itemIcon} ${tone}`} />
          </span>
        ))}
      </div>
      {layout.showTowerSkillBar && (
        <div className="mt-1 flex justify-center gap-1">
          <span className="h-2 w-2 bg-[var(--hl-signal)] opacity-80" />
          <span className="h-2 w-2 bg-[var(--hl-signal)] opacity-55" />
          <span className="h-2 w-2 bg-[var(--hl-signal)] opacity-30" />
        </div>
      )}
    </div>
  );
}

function MiniBottomControls({ layout }: { layout: HudLayoutState }) {
  const cls = getHudStyleClasses(layout, 'card');
  return (
    <div
      className={`flex items-center gap-1.5 border bg-[var(--hl-deck-3)] px-2 py-1 ${cls.corner} ${cls.blur} ${cls.border} ${cls.shadow}`}
    >
      <span className="flex h-5 w-5 items-center justify-center border border-[var(--hl-signal)] bg-[var(--hl-signal)]">
        <Play2Icon className="h-3 w-3 text-[var(--hl-signal-ink)]" />
      </span>
      <span className="flex h-5 w-5 items-center justify-center border border-[var(--hl-line)] bg-[var(--hl-deck-2)]">
        <PauseIcon className="h-3 w-3 text-[var(--hl-ink-2)]" />
      </span>
      <span className="flex h-5 items-center justify-center border border-[var(--hl-line)] bg-[var(--hl-deck-2)] px-1.5 font-mono text-[8px] tabular-nums text-[var(--hl-ink-2)]">
        1x
      </span>
      <span className="flex h-5 w-5 items-center justify-center border border-[var(--hl-line)] bg-[var(--hl-deck-2)]">
        <FastForwardIcon className="h-3 w-3 text-[var(--hl-ink-2)]" />
      </span>
    </div>
  );
}

// ----- 波次橫幅縮影：以小型徽章顯示在預覽畫面對應 9 宮格位置 -----
const V_POS_CLASS: Record<HudVerticalPosition, string> = {
  top: 'top-3',
  middle: 'top-1/2 -translate-y-1/2',
  bottom: 'bottom-3',
};

const H_POS_CLASS: Record<HudHorizontalPosition, string> = {
  left: 'left-3',
  center: 'left-1/2 -translate-x-1/2',
  right: 'right-3',
};

const MINI_SIZE_SPEC: Record<WaveBannerSize, { pad: string; icon: string; num: string; gap: string }> = {
  compact: { pad: 'px-2 py-0.5', icon: 'h-3 w-3', num: 'text-[11px]', gap: 'gap-1' },
  normal: { pad: 'px-2.5 py-1', icon: 'h-3.5 w-3.5', num: 'text-[13px]', gap: 'gap-1.5' },
  large: { pad: 'px-3.5 py-1.5', icon: 'h-4 w-4', num: 'text-[16px]', gap: 'gap-2' },
};

function MiniWaveBannerOverlay({
  vertical,
  horizontal,
  size,
}: {
  vertical: HudVerticalPosition;
  horizontal: HudHorizontalPosition;
  size: WaveBannerSize;
}) {
  const spec = MINI_SIZE_SPEC[size];
  const posClass = `${V_POS_CLASS[vertical]} ${H_POS_CLASS[horizontal]}`;
  return (
    <motion.div
      key={`${vertical}-${horizontal}-${size}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      className={`pointer-events-none absolute ${posClass} z-20`}
    >
      <div
        className={`flex items-center ${spec.gap} ${spec.pad} border border-[var(--hl-signal-edge)] bg-[var(--hl-void)]`}
      >
        <WaveIcon className={`${spec.icon} text-[var(--hl-signal)]`} />
        <span className={`${spec.num} font-mono font-semibold leading-none tabular-nums text-[var(--hl-ink)]`}>
          W 7
        </span>
      </div>
    </motion.div>
  );
}

function PreviewLegend({
  tone, label, hidden,
}: {
  tone: 'vital' | 'caution' | 'reach';
  label: string;
  hidden: boolean;
}) {
  const colorClass: Record<typeof tone, string> = {
    vital: 'bg-[var(--hl-vital)]',
    caution: 'bg-[var(--hl-caution)]',
    reach: 'bg-[var(--hl-reach)]',
  } as const;

  return (
    <span className={`flex items-center gap-1.5 ${hidden ? 'text-[var(--hl-ink-4)]' : 'text-[var(--hl-ink-3)]'}`}>
      <span className={`inline-block h-1.5 w-1.5 ${hidden ? 'bg-[var(--hl-line-hot)]' : colorClass[tone]}`} />
      <span className="font-mono text-[9.5px] uppercase leading-none tracking-[0.08em]">{label}</span>
      {hidden && (
        <span className="inline-flex items-center align-middle text-[var(--hl-ink-4)]">
          <CheckSquareIcon className="h-2.5 w-2.5" />
        </span>
      )}
    </span>
  );
}

export default HudPreviewCard;
