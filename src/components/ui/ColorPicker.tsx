import { useState, useRef, useEffect } from 'react';
import type React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PaletteIcon, 
  SparklesIcon, 
  CheckIcon, 
  CrosshairIcon, 
  RainbowIcon, 
  WaterWaveIcon, 
  SunIcon, 
  LightningIcon 
} from '@/components/ui/Icons';
import { useTranslation } from '@/i18n';
import { Btn, IconBtn, Input } from '@/components/hl';

// 調色盤顏色分類（9 類 × 5 色；僅本檔使用，故不對外匯出）
const colorPalette = {
  red: ['#FF6B6B', '#E74C3C', '#C0392B', '#FF4757', '#FF6348'],
  orange: ['#F39C12', '#E67E22', '#D35400', '#FFA502', '#FF7F50'],
  yellow: ['#F1C40F', '#FFEAA7', '#F7DC6F', '#FFD93D', '#FFC312'],
  green: ['#2ECC71', '#27AE60', '#1ABC9C', '#00D2D3', '#26DE81'],
  cyan: ['#4ECDC4', '#45B7D1', '#00CEC9', '#81ECEC', '#74B9FF'],
  blue: ['#3498DB', '#2980B9', '#5B9BD5', '#0984E3', '#686DE0'],
  purple: ['#9B59B6', '#8E44AD', '#BB8FCE', '#A29BFE', '#6C5CE7'],
  pink: ['#E84393', '#FD79A8', '#F8A5C2', '#FDA7DF', '#D980FA'],
  neutral: ['#636E72', '#B2BEC3', '#DFE6E9', '#2D3436', '#1A1A2E'],
};

/** 欄位小標：mono 10px / uppercase，圖示 12px */
const FieldLabel = ({ icon, children, right }: { icon?: React.ReactNode; children: React.ReactNode; right?: React.ReactNode }) => (
  <div className="mb-1.5 flex items-center gap-1.5">
    {icon}
    <span className="arc-label">{children}</span>
    {right && <span className="ml-auto font-mono text-[10px] tabular-nums text-[var(--arc-ink-3)]">{right}</span>}
  </div>
);

// 自訂顏色選擇器組件（HSL 滑桿版）
const CustomColorPicker = ({ 
  color, 
  onChange,
  onApply 
}: { 
  color: string; 
  onChange: (color: string) => void;
  onApply: () => void;
}) => {
  const { t } = useTranslation();
  const c = t.modEditorExt;
  // 將 HEX 轉換為 HSL
  const hexToHsl = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return [0, 100, 50];
    
    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;
    
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  };
  
  // 將 HSL 轉換為 HEX
  const hslToHex = (h: number, s: number, l: number): string => {
    s /= 100;
    l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const [hsl, setHsl] = useState<[number, number, number]>(() => hexToHsl(color));
  const gradientRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // 當外部顏色變化時更新 HSL
  useEffect(() => {
    const newHsl = hexToHsl(color);
    setHsl(newHsl);
  }, [color]);

  // 當 HSL 變化時更新 HEX
  useEffect(() => {
    const newHex = hslToHex(hsl[0], hsl[1], hsl[2]);
    if (newHex.toLowerCase() !== color.toLowerCase()) {
      onChange(newHex);
    }
  }, [hsl]);

  // 處理漸變區域點擊/拖拽
  const handleGradientInteraction = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!gradientRef.current) return;
    const rect = gradientRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    
    const saturation = Math.round(x * 100);
    const lightness = Math.round((1 - y) * 100);
    setHsl([hsl[0], saturation, lightness]);
  };

  return (
    <div className="space-y-4">
      {/* 顏色選擇漸變區域（功能控件：保留漸層填充） */}
      <div>
        <FieldLabel icon={<CrosshairIcon className="h-3 w-3 text-[var(--arc-ink-4)]" />}>{c.pickColor}</FieldLabel>
        <div 
          ref={gradientRef}
          className="relative h-32 w-full cursor-crosshair overflow-hidden border-[3px] border-[var(--cn-line-soft)]"
          style={{
            background: `
              linear-gradient(to top, #000 0%, transparent 100%),
              linear-gradient(to right, #fff 0%, hsl(${hsl[0]}, 100%, 50%) 100%)
            `
          }}
          onMouseDown={(e) => { setIsDragging(true); handleGradientInteraction(e); }}
          onMouseMove={(e) => isDragging && handleGradientInteraction(e)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
        >
          {/* 選擇指示器 */}
          <motion.div
            className="pointer-events-none absolute h-4 w-4 border border-[var(--arc-ink)]"
            style={{
              left: `${hsl[1]}%`,
              top: `${100 - hsl[2]}%`,
              transform: 'translate(-50%, -50%)',
              backgroundColor: color,
            }}
            animate={{ scale: isDragging ? 1.2 : 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </div>
      </div>

      {/* 色相滑桿（功能控件：色帶是 hsl 漸層） */}
      <div>
        <FieldLabel
          icon={<RainbowIcon className="h-3 w-3 text-[var(--arc-ink-4)]" />}
          right={`${hsl[0]}°`}
        >
          {c.hueLabel}
        </FieldLabel>
        <div className="relative h-3 overflow-hidden border-[3px] border-[var(--cn-line-soft)]">
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)'
            }}
          />
          <input
            type="range"
            min="0"
            max="360"
            value={hsl[0]}
            onChange={(e) => setHsl([Number(e.target.value), hsl[1], hsl[2]])}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
          {/* 滑桿指示器：方塊，不是圓點 */}
          <div 
            className="pointer-events-none absolute top-1/2 h-3.5 w-3.5 border border-[var(--arc-ink)] bg-[var(--arc-void-2)]"
            style={{ 
              left: `${(hsl[0] / 360) * 100}%`, 
              transform: 'translate(-50%, -50%)'
            }}
          />
        </div>
      </div>

      {/* 飽和度滑桿（功能控件） */}
      <div>
        <FieldLabel
          icon={<WaterWaveIcon className="h-3 w-3 text-[var(--arc-ink-4)]" />}
          right={`${hsl[1]}%`}
        >
          {c.saturationLabel}
        </FieldLabel>
        <div className="relative h-3 overflow-hidden border-[3px] border-[var(--cn-line-soft)]">
          <div 
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to right, hsl(${hsl[0]}, 0%, ${hsl[2]}%) 0%, hsl(${hsl[0]}, 100%, ${hsl[2]}%) 100%)`
            }}
          />
          <input
            type="range"
            min="0"
            max="100"
            value={hsl[1]}
            onChange={(e) => setHsl([hsl[0], Number(e.target.value), hsl[2]])}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
          <div 
            className="pointer-events-none absolute top-1/2 h-3.5 w-3.5 border border-[var(--arc-ink)] bg-[var(--arc-void-2)]"
            style={{ 
              left: `${hsl[1]}%`, 
              transform: 'translate(-50%, -50%)'
            }}
          />
        </div>
      </div>

      {/* 亮度滑桿（功能控件） */}
      <div>
        <FieldLabel
          icon={<SunIcon className="h-3 w-3 text-[var(--arc-ink-4)]" />}
          right={`${hsl[2]}%`}
        >
          {c.lightnessLabel}
        </FieldLabel>
        <div className="relative h-3 overflow-hidden border-[3px] border-[var(--cn-line-soft)]">
          <div 
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to right, #000 0%, hsl(${hsl[0]}, ${hsl[1]}%, 50%) 50%, #fff 100%)`
            }}
          />
          <input
            type="range"
            min="0"
            max="100"
            value={hsl[2]}
            onChange={(e) => setHsl([hsl[0], hsl[1], Number(e.target.value)])}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
          <div 
            className="pointer-events-none absolute top-1/2 h-3.5 w-3.5 border border-[var(--arc-ink)] bg-[var(--arc-void-2)]"
            style={{ 
              left: `${hsl[2]}%`, 
              transform: 'translate(-50%, -50%)'
            }}
          />
        </div>
      </div>

      {/* HEX 輸入和套用 */}
      <div className="pt-1">
        <div className="flex gap-2">
          <div className="flex flex-1 items-center overflow-hidden border-[3px] border-[var(--cn-line-soft)] bg-[var(--arc-void-2)] transition-colors focus-within:border-[var(--arc-gold)]">
            <div 
              className="h-7 w-7 flex-shrink-0 border-r border-[var(--cn-line-soft)]"
              style={{ backgroundColor: color }}
            />
            <Input
              type="text"
              value={color.toUpperCase()}
              onChange={(e) => {
                const val = e.target.value;
                if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                  onChange(val);
                }
              }}
              className="flex-1 bg-transparent px-2 py-1 text-center font-mono text-[11px] tabular-nums text-[var(--arc-ink)] outline-none"
              placeholder="#000000"
            />
          </div>
          <Btn size="sm" variant="line" onClick={onApply}>
            {c.applyColor}
          </Btn>
        </div>
      </div>

      {/* 快速預設 */}
      <div>
        <FieldLabel icon={<LightningIcon className="h-3 w-3 text-[var(--arc-ink-4)]" />}>{c.quickColors}</FieldLabel>
        <div className="grid grid-cols-5 gap-1.5">
          {['#FF0000', '#FF8800', '#FFFF00', '#00FF00', '#00FFFF', 
            '#0088FF', '#0000FF', '#8800FF', '#FF00FF', '#FFFFFF',
            '#000000', '#333333', '#666666', '#999999', '#CCCCCC'].map((c) => (
            <button
              key={c}
              type="button"
              className={`aspect-square border transition-colors ${
                color.toUpperCase() === c
                  ? 'border-[var(--arc-gold)]'
                  : 'border-[var(--cn-line-soft)] hover:border-[var(--arc-line-hot)]'
              }`}
              style={{ backgroundColor: c }}
              onClick={() => onChange(c)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// 顏色選擇器組件
export const ColorPicker = ({ color, onChange }: { color: string; onChange: (color: string) => void }) => {
  const { t } = useTranslation();
  const c = t.modEditorExt;
  const [showPicker, setShowPicker] = useState(false);
  const [activeTab, setActiveTab] = useState<'palette' | 'custom'>('palette');
  const [customColor, setCustomColor] = useState(color);
  const [popupStyle, setPopupStyle] = useState({ top: 0, left: 0 });

  // 點擊外部關閉
  const pickerRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const isOutsidePicker = pickerRef.current && !pickerRef.current.contains(e.target as Node);
      const isOutsidePopup = popupRef.current && !popupRef.current.contains(e.target as Node);
      if (isOutsidePicker && isOutsidePopup) {
        setShowPicker(false);
      }
    };
    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPicker]);

  // 計算選色器彈窗位置
  useEffect(() => {
    if (showPicker && pickerRef.current) {
      const rect = pickerRef.current.getBoundingClientRect();
      const popupWidth = 320;
      const popupHeight = 450; // 預估最大高度
      const spaceBelow = window.innerHeight - rect.bottom;
      
      let top = rect.bottom + window.scrollY + 8;
      let left = rect.left + window.scrollX;
      
      // 如果下方空間不夠，向上展開
      if (spaceBelow < popupHeight && rect.top > popupHeight) {
        top = rect.top + window.scrollY - popupHeight - 8;
      }
      
      // 確保不超出右邊界
      if (left + popupWidth > window.innerWidth) {
        left = window.innerWidth - popupWidth - 16;
      }

      setPopupStyle({ top, left });
    }
  }, [showPicker]);

  const categoryLabels: Record<string, { label: string, hex: string }> = {
    red: { label: c.colorCatRed, hex: '#FF6B6B' },
    orange: { label: c.colorCatOrange, hex: '#F39C12' },
    yellow: { label: c.colorCatYellow, hex: '#F1C40F' },
    green: { label: c.colorCatGreen, hex: '#2ECC71' },
    cyan: { label: c.colorCatCyan, hex: '#4ECDC4' },
    blue: { label: c.colorCatBlue, hex: '#3498DB' },
    purple: { label: c.colorCatPurple, hex: '#9B59B6' },
    pink: { label: c.colorCatPink, hex: '#E84393' },
    neutral: { label: c.colorCatNeutral, hex: '#636E72' },
  };
  
  return (
    <div className="relative" ref={pickerRef}>
      {/* 顏色預覽按鈕：方角 1px 線，滑過只換邊與覆蓋圖示 */}
      <IconBtn
        label={c.pickColor}
        className="group relative block h-7 w-7 shrink-0 cursor-pointer overflow-hidden border border-[var(--arc-line-strong)] transition-colors hover:border-[var(--arc-gold)]"
        style={{ backgroundColor: color }}
        onClick={() => setShowPicker(!showPicker)}
      >
        <span className="absolute inset-0 flex items-center justify-center bg-[rgba(6,7,10,0.72)] opacity-0 transition-opacity group-hover:opacity-100">
          <PaletteIcon className="h-4 w-4 text-[var(--arc-ink)]" />
        </span>
      </IconBtn>

      {/* 選色器彈窗 */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showPicker && (
            <motion.div
              ref={popupRef}
              className="absolute z-[100002] overflow-hidden arc-panel"
              style={{ width: '260px', top: popupStyle.top, left: popupStyle.left }}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
            >
              {/* 標籤頁切換：選中＝底部 1px 訊號線 */}
              <div className="relative flex border-b border-[var(--cn-line-soft)] bg-[var(--arc-void-2)]">
                {[
                  { id: 'palette', label: c.colorTabPalette, icon: <PaletteIcon className="h-3.5 w-3.5" /> },
                  { id: 'custom', label: c.colorTabCustom, icon: <SparklesIcon className="h-3.5 w-3.5" /> }
                ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id as typeof activeTab)}
                      className={[
                        'relative flex flex-1 items-center justify-center gap-1.5 py-2.5 font-mono text-[10px] uppercase tracking-[0.08em] transition-colors',
                        isActive
                          ? 'text-[var(--arc-ink)]'
                          : 'text-[var(--arc-ink-3)] hover:text-[var(--arc-ink-2)]',
                      ].join(' ')}
                    >
                      {tab.icon}
                      {tab.label}
                      {isActive && (
                        <motion.div
                          layoutId="color-picker-tab-indicator"
                          className="absolute bottom-0 left-0 right-0 h-px bg-[var(--arc-gold)]"
                          initial={false}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

            {/* 內容區 */}
            <div className="max-h-[380px] overflow-y-auto p-3">
              {activeTab === 'palette' ? (
                <div className="space-y-3">
                  {Object.entries(colorPalette).map(([category, colors]) => (
                    <div key={category} className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5" style={{ backgroundColor: categoryLabels[category].hex }} />
                        <span className="arc-label">{categoryLabels[category].label}</span>
                      </div>
                      <div className="flex gap-1.5">
                        {colors.map((c) => (
                          <button
                            key={c}
                            type="button"
                            className={`relative h-7 w-7 overflow-hidden border transition-colors ${
                              color === c
                                ? 'border-[var(--arc-gold)]'
                                : 'border-[var(--cn-line-soft)] hover:border-[var(--arc-line-hot)]'
                            }`}
                            style={{ backgroundColor: c }}
                            onClick={() => { onChange(c); setShowPicker(false); }}
                          >
                            {/* 選中標記 */}
                            {color === c && (
                              <span className="absolute inset-0 flex items-center justify-center bg-[rgba(6,7,10,0.45)]">
                                <CheckIcon className="h-3.5 w-3.5 text-[var(--arc-ink)]" />
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <CustomColorPicker 
                  color={customColor} 
                  onChange={setCustomColor}
                  onApply={() => { onChange(customColor); setShowPicker(false); }}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    )}
    </div>
  );
};
