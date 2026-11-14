/**
 * HUD 設定 - 通用選項按鈕群（HARDLINE）
 *
 * 全部選項都是方框、1px 線、mono 標籤；選中＝訊號膜。
 * 縮圖（圓角風格 / 模糊強度 / 欄數…）用 inline style 呈現「遊戲內 HUD 會被設成什麼樣」，
 * 那是在預覽使用者設定，不是介面自己的裝飾。
 */

import type {
  HudHorizontalPosition,
  HudVerticalPosition,
  HudSidePosition,
  HudUiScale,
  HudCornerStyle,
  HudBlurIntensity,
  HudAccentColor,
  TowerListColumns,
  TowerButtonSize,
  TowerDisplayMode,
  TowerListSpacing,
  WaveBannerSize,
} from '@/store/settingsStore';
import { useTranslation } from '@/i18n';
import {
  SettingsChoiceRow,
  SettingsChoiceButton,
  SettingsChoiceDot,
} from '../../settingsChoice';

/** 縮圖小方塊的共同外觀 */
const swatch = 'flex items-center justify-center border';

function SwatchNote({ children }: { children: React.ReactNode }) {
  return <span className="font-mono text-[9.5px] leading-none text-[var(--hl-ink-3)]">{children}</span>;
}

// =====================================================
// HUD 位置：水平（左/中/右）
// =====================================================

export function HorizontalChoice({
  value, options, labels, onChange,
}: {
  value: HudHorizontalPosition;
  options: HudHorizontalPosition[];
  labels: Record<HudHorizontalPosition, string>;
  onChange: (v: HudHorizontalPosition) => void;
}) {
  return (
    <SettingsChoiceRow>
      {options.map((opt) => {
        const active = opt === value;
        return (
          <SettingsChoiceButton key={opt} active={active} onClick={() => onChange(opt)}>
            <SettingsChoiceDot active={active} />
            <span className="truncate">{labels[opt]}</span>
          </SettingsChoiceButton>
        );
      })}
    </SettingsChoiceRow>
  );
}

// =====================================================
// HUD 位置：左/右側邊
// =====================================================

export function SideChoice({
  value, onChange,
}: {
  value: HudSidePosition;
  onChange: (v: HudSidePosition) => void;
}) {
  const { t } = useTranslation();
  const h = t.settings.hud;
  const options: { id: HudSidePosition; label: string }[] = [
    { id: 'left', label: h.choiceLeft },
    { id: 'right', label: h.choiceRight },
  ];
  return (
    <SettingsChoiceRow>
      {options.map(({ id, label }) => {
        const active = id === value;
        return (
          <SettingsChoiceButton key={id} active={active} onClick={() => onChange(id)}>
            <SettingsChoiceDot active={active} />
            <span className="truncate">{label}</span>
          </SettingsChoiceButton>
        );
      })}
    </SettingsChoiceRow>
  );
}

// =====================================================
// UI 縮放：緊湊 / 標準 / 放大
// =====================================================

export function ScaleChoice({
  value, onChange,
}: {
  value: HudUiScale;
  onChange: (v: HudUiScale) => void;
}) {
  const { t } = useTranslation();
  const h = t.settings.hud;
  const options: { id: HudUiScale; label: string; size: string }[] = [
    { id: 'compact', label: h.choiceCompact, size: 'text-[11px]' },
    { id: 'normal', label: h.choiceNormal, size: 'text-[14px]' },
    { id: 'large', label: h.choiceLarge, size: 'text-[18px]' },
  ];
  return (
    <SettingsChoiceRow>
      {options.map(({ id, label, size }) => (
        <SettingsChoiceButton key={id} active={id === value} layout="stack" onClick={() => onChange(id)}>
          <span className={`font-mono font-semibold leading-none ${size}`}>A</span>
          <SwatchNote>{label}</SwatchNote>
        </SettingsChoiceButton>
      ))}
    </SettingsChoiceRow>
  );
}

// =====================================================
// 圓角風格 / 模糊 / 點綴色
// =====================================================

export function CornerChoice({
  value, onChange,
}: {
  value: HudCornerStyle;
  onChange: (v: HudCornerStyle) => void;
}) {
  const { t } = useTranslation();
  const h = t.settings.hud;
  // 預覽「遊戲內 HUD 的角」：使用者選什麼就畫什麼
  const options: { id: HudCornerStyle; label: string; radius: string }[] = [
    { id: 'pill', label: h.choicePill, radius: '9999px' },
    { id: 'rounded', label: h.choiceRounded, radius: '12px' },
    { id: 'square', label: h.choiceSquare, radius: '2px' },
  ];
  return (
    <SettingsChoiceRow>
      {options.map(({ id, label, radius }) => {
        const active = id === value;
        return (
          <SettingsChoiceButton key={id} active={active} layout="stack" onClick={() => onChange(id)}>
            <span
              className={`${swatch} h-5 w-9 ${
                active
                  ? 'border-[var(--hl-signal)] bg-[var(--hl-signal-veil)]'
                  : 'border-[var(--hl-line-strong)] bg-[var(--hl-void-2)]'
              }`}
              style={{ borderRadius: radius }}
            />
            <SwatchNote>{label}</SwatchNote>
          </SettingsChoiceButton>
        );
      })}
    </SettingsChoiceRow>
  );
}

export function BlurChoice({
  value, onChange,
}: {
  value: HudBlurIntensity;
  onChange: (v: HudBlurIntensity) => void;
}) {
  const { t } = useTranslation();
  const h = t.settings.hud;
  // 用線的密度示意模糊強度，而不是真的畫漸層
  const options: { id: HudBlurIntensity; label: string; lines: number }[] = [
    { id: 'heavy', label: h.choiceBlurHeavy, lines: 4 },
    { id: 'medium', label: h.choiceBlurMedium, lines: 3 },
    { id: 'light', label: h.choiceBlurLight, lines: 2 },
    { id: 'none', label: h.choiceBlurNone, lines: 0 },
  ];
  return (
    <SettingsChoiceRow>
      {options.map(({ id, label, lines }) => {
        const active = id === value;
        return (
          <SettingsChoiceButton key={id} active={active} layout="stack" onClick={() => onChange(id)}>
            <span className={`${swatch} h-5 w-9 flex-col gap-[2px] border-[var(--hl-line-strong)] bg-[var(--hl-void-2)]`}>
              {Array.from({ length: lines }).map((_, i) => (
                <span key={i} className="block h-px w-4 bg-[var(--hl-line-hot)] opacity-70" />
              ))}
            </span>
            <SwatchNote>{label}</SwatchNote>
          </SettingsChoiceButton>
        );
      })}
    </SettingsChoiceRow>
  );
}

export function AccentChoice({
  value, onChange,
}: {
  value: HudAccentColor;
  onChange: (v: HudAccentColor) => void;
}) {
  const { t } = useTranslation();
  const h = t.settings.hud;
  // 點綴色是遊戲內 HUD 的設定值，所以這裡要顯示實際顏色
  const options: { id: HudAccentColor; label: string; swatch: string }[] = [
    { id: 'default', label: h.choiceAccentDefault, swatch: 'var(--hl-ink-2)' },
    { id: 'cyan', label: h.choiceAccentCyan, swatch: '#22d3ee' },
    { id: 'purple', label: h.choiceAccentPurple, swatch: '#c084fc' },
    { id: 'amber', label: h.choiceAccentAmber, swatch: '#fbbf24' },
    { id: 'rose', label: h.choiceAccentRose, swatch: '#fb7185' },
    { id: 'emerald', label: h.choiceAccentEmerald, swatch: '#34d399' },
  ];
  return (
    <SettingsChoiceRow>
      {options.map(({ id, label, swatch: color }) => {
        const active = id === value;
        return (
          <SettingsChoiceButton
            key={id}
            active={active}
            onClick={() => onChange(id)}
            className="min-w-[78px] flex-none"
          >
            <span className="inline-block h-2.5 w-2.5 shrink-0" style={{ backgroundColor: color }} />
            <span className="truncate">{label}</span>
          </SettingsChoiceButton>
        );
      })}
    </SettingsChoiceRow>
  );
}

// =====================================================
// 塔列表設定
// =====================================================

export function ColumnsChoice({
  value, onChange,
}: {
  value: TowerListColumns;
  onChange: (v: TowerListColumns) => void;
}) {
  const { t } = useTranslation();
  const h = t.settings.hud;
  const options: { id: TowerListColumns; label: string; cells: number }[] = [
    { id: 1, label: h.choiceCol1, cells: 1 },
    { id: 2, label: h.choiceCol2, cells: 2 },
    { id: 3, label: h.choiceCol3, cells: 3 },
  ];
  return (
    <SettingsChoiceRow>
      {options.map(({ id, label, cells }) => {
        const active = id === value;
        return (
          <SettingsChoiceButton key={id} active={active} layout="stack" onClick={() => onChange(id)}>
            <span className="flex h-5 gap-[2px]">
              {Array.from({ length: cells }).map((_, i) => (
                <span
                  key={i}
                  className={`h-full w-[7px] border ${
                    active
                      ? 'border-[var(--hl-signal)] bg-[var(--hl-signal-veil)]'
                      : 'border-[var(--hl-line-strong)] bg-[var(--hl-void-2)]'
                  }`}
                />
              ))}
            </span>
            <SwatchNote>{label}</SwatchNote>
          </SettingsChoiceButton>
        );
      })}
    </SettingsChoiceRow>
  );
}

export function ButtonSizeChoice({
  value, onChange,
}: {
  value: TowerButtonSize;
  onChange: (v: TowerButtonSize) => void;
}) {
  const { t } = useTranslation();
  const h = t.settings.hud;
  const options: { id: TowerButtonSize; label: string; size: string }[] = [
    { id: 'small', label: h.choiceSizeSmall, size: 'h-2.5 w-2.5' },
    { id: 'medium', label: h.choiceSizeMedium, size: 'h-3.5 w-3.5' },
    { id: 'large', label: h.choiceSizeLarge, size: 'h-5 w-5' },
  ];
  return (
    <SettingsChoiceRow>
      {options.map(({ id, label, size }) => {
        const active = id === value;
        return (
          <SettingsChoiceButton key={id} active={active} layout="stack" onClick={() => onChange(id)}>
            <span
              className={`${swatch} ${size} ${
                active
                  ? 'border-[var(--hl-signal)] bg-[var(--hl-signal-veil)]'
                  : 'border-[var(--hl-line-strong)] bg-[var(--hl-void-2)]'
              }`}
            />
            <SwatchNote>{label}</SwatchNote>
          </SettingsChoiceButton>
        );
      })}
    </SettingsChoiceRow>
  );
}

export function DisplayModeChoice({
  value, onChange,
}: {
  value: TowerDisplayMode;
  onChange: (v: TowerDisplayMode) => void;
}) {
  const { t } = useTranslation();
  const h = t.settings.hud;
  const options: { id: TowerDisplayMode; label: string; sub: string }[] = [
    { id: 'compact', label: h.choiceDisplayCompact, sub: h.choiceDisplayCompactSub },
    { id: 'normal', label: h.choiceDisplayNormal, sub: h.choiceDisplayNormalSub },
    { id: 'detailed', label: h.choiceDisplayDetailed, sub: h.choiceDisplayDetailedSub },
  ];
  return (
    <SettingsChoiceRow>
      {options.map(({ id, label, sub }) => (
        <SettingsChoiceButton key={id} active={id === value} layout="stack" onClick={() => onChange(id)}>
          <span className="font-mono text-[10.5px] font-semibold leading-none">{label}</span>
          <span className="font-mono text-[10px] leading-none text-[var(--hl-ink-4)]">{sub}</span>
        </SettingsChoiceButton>
      ))}
    </SettingsChoiceRow>
  );
}

export function SpacingChoice({
  value, onChange,
}: {
  value: TowerListSpacing;
  onChange: (v: TowerListSpacing) => void;
}) {
  const { t } = useTranslation();
  const h = t.settings.hud;
  const options: { id: TowerListSpacing; label: string; gap: string }[] = [
    { id: 'tight', label: h.choiceSpacingTight, gap: 'gap-[2px]' },
    { id: 'normal', label: h.choiceSpacingNormal, gap: 'gap-1' },
    { id: 'wide', label: h.choiceSpacingWide, gap: 'gap-2' },
  ];
  return (
    <SettingsChoiceRow>
      {options.map(({ id, label, gap }) => {
        const active = id === value;
        return (
          <SettingsChoiceButton key={id} active={active} layout="stack" onClick={() => onChange(id)}>
            <span className={`flex items-end ${gap}`}>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className={`h-3 w-1.5 border ${
                    active
                      ? 'border-[var(--hl-signal)] bg-[var(--hl-signal-veil)]'
                      : 'border-[var(--hl-line-strong)] bg-[var(--hl-void-2)]'
                  }`}
                />
              ))}
            </span>
            <SwatchNote>{label}</SwatchNote>
          </SettingsChoiceButton>
        );
      })}
    </SettingsChoiceRow>
  );
}

// =====================================================
// 波次橫幅 - 9 宮格位置挑選器（垂直 × 水平）
// =====================================================

export function PositionGridChoice({
  vertical,
  horizontal,
  onChange,
}: {
  vertical: HudVerticalPosition;
  horizontal: HudHorizontalPosition;
  onChange: (v: HudVerticalPosition, h: HudHorizontalPosition) => void;
}) {
  const { t } = useTranslation();
  const h = t.settings.hud;
  const V_LABEL: Record<HudVerticalPosition, string> = {
    top: h.choicePosTop,
    middle: h.choicePosMiddle,
    bottom: h.choicePosBottom,
  };
  const H_LABEL: Record<HudHorizontalPosition, string> = {
    left: h.choicePosLeft,
    center: h.choicePosCenter,
    right: h.choicePosRight,
  };
  const verticals: HudVerticalPosition[] = ['top', 'middle', 'bottom'];
  const horizontals: HudHorizontalPosition[] = ['left', 'center', 'right'];

  return (
    <div className="flex w-full flex-col gap-2 border border-[var(--hl-line)] bg-[var(--hl-void-2)] p-2.5">
      <div className="grid grid-cols-3 gap-1.5">
        {verticals.map((v) =>
          horizontals.map((hor) => {
            const active = v === vertical && hor === horizontal;
            const label = `${V_LABEL[v]}${H_LABEL[hor]}`;
            return (
              <button
                key={`${v}-${hor}`}
                type="button"
                onClick={() => onChange(v, hor)}
                title={label}
                className={[
                  'flex h-9 items-center justify-center gap-1 border font-mono text-[10px] transition-colors duration-150',
                  active
                    ? 'border-[var(--hl-signal)] bg-[var(--hl-signal-veil)] text-[var(--hl-signal)]'
                    : 'border-[var(--hl-line)] bg-transparent text-[var(--hl-ink-4)] hover:border-[var(--hl-line-hot)] hover:text-[var(--hl-ink-2)]',
                ].join(' ')}
              >
                <span
                  className={`inline-block h-1.5 w-1.5 ${active ? 'bg-[var(--hl-signal)]' : 'bg-[var(--hl-line-hot)]'}`}
                />
                <span className="truncate">{label}</span>
              </button>
            );
          })
        )}
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-[var(--hl-line)] pt-2">
        <span className="hl-label">{h.choiceCurrentPosition}</span>
        <span className="font-mono text-[10px] text-[var(--hl-signal)]">
          {V_LABEL[vertical]} · {H_LABEL[horizontal]}
        </span>
      </div>
    </div>
  );
}

// =====================================================
// 波次橫幅尺寸：緊湊 / 標準 / 放大
// =====================================================

export function WaveBannerSizeChoice({
  value,
  onChange,
}: {
  value: WaveBannerSize;
  onChange: (v: WaveBannerSize) => void;
}) {
  const { t } = useTranslation();
  const h = t.settings.hud;
  const options: { id: WaveBannerSize; label: string; height: string }[] = [
    { id: 'compact', label: h.choiceCompact, height: 'h-2.5' },
    { id: 'normal', label: h.choiceNormal, height: 'h-3.5' },
    { id: 'large', label: h.choiceLarge, height: 'h-5' },
  ];
  return (
    <SettingsChoiceRow>
      {options.map(({ id, label, height }) => {
        const active = id === value;
        return (
          <SettingsChoiceButton key={id} active={active} layout="stack" onClick={() => onChange(id)}>
            <span
              className={`${swatch} w-10 ${height} ${
                active
                  ? 'border-[var(--hl-signal)] bg-[var(--hl-signal-veil)]'
                  : 'border-[var(--hl-line-strong)] bg-[var(--hl-void-2)]'
              }`}
            />
            <SwatchNote>{label}</SwatchNote>
          </SettingsChoiceButton>
        );
      })}
    </SettingsChoiceRow>
  );
}
