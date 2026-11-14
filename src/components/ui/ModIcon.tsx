// Mod 自訂圖標渲染（共用模組）
// 解析 advanced_icon JSON 組合圖標；相容舊版純字串圖標；無資料時顯示預設圖標
import type { ReactNode } from 'react';

// advanced_icon JSON 中的單個圖層
interface AdvancedIconLayer {
  id: string;
  emoji: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  flipX?: boolean;
  flipY?: boolean;
  zIndex: number;
  opacity?: number;
}

interface ModIconRenderOptions {
  /** 容器圓角 class（各使用場景尺寸不同） */
  rounded?: string;
  /** 圖層位移縮放係數 */
  translateFactor?: number;
  /** 圖層大小縮放係數 */
  scaleFactor?: number;
}

export function renderModIcon(
  iconData: string | undefined,
  defaultIcon: ReactNode,
  className: string = 'text-base',
  options: ModIconRenderOptions = {},
) {
  const { rounded = '', translateFactor = 0.5, scaleFactor = 0.5 } = options;
  if (!iconData) return <span className={className}>{defaultIcon}</span>;

  try {
    const parsed = JSON.parse(iconData);
    if (parsed.type === 'advanced_icon') {
      const layers = (parsed.icons as AdvancedIconLayer[]).slice().sort((a, b) => a.zIndex - b.zIndex);
      return (
        <div
          className={`relative overflow-hidden flex items-center justify-center border-[3px] border-[var(--cn-line-soft)] ${rounded} ${className}`}
          style={{ backgroundColor: parsed.bgColor === 'transparent' ? 'rgba(0,0,0,0.2)' : parsed.bgColor }}
        >
          {layers.map((icon) => (
            <div
              key={icon.id}
              className="absolute"
              style={{
                transform: `translate(${icon.x * translateFactor}px, ${icon.y * translateFactor}px) scale(${icon.scale * scaleFactor}) rotate(${icon.rotation}deg) scaleX(${icon.flipX ? -1 : 1}) scaleY(${icon.flipY ? -1 : 1})`,
                zIndex: icon.zIndex,
                opacity: icon.opacity ?? 1,
              }}
            >
              {icon.emoji}
            </div>
          ))}
        </div>
      );
    }
  } catch {
    // 相容舊版純字串圖標
    return <span className={className}>{iconData}</span>;
  }

  return <span className={className}>{defaultIcon}</span>;
}
