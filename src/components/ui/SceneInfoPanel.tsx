/**
 * 場景資訊面板 — 教學 / 設定說明等通用玻璃容器
 */
import type React from 'react';
import { SCENE_GLASS } from './SceneWorkshopLayout';

export type SceneInfoPanelVariant = 'panel' | 'stat' | 'row' | 'compact' | 'badge';

const VARIANT_CLASS: Record<SceneInfoPanelVariant, string> = {
  panel: SCENE_GLASS.infoPanel,
  stat: SCENE_GLASS.infoStat,
  row: SCENE_GLASS.infoRow,
  compact: SCENE_GLASS.infoPanelSm,
  badge: SCENE_GLASS.infoBadge,
};

export interface SceneInfoPanelProps {
  variant?: SceneInfoPanelVariant;
  className?: string;
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
}

export function SceneInfoPanel({
  variant = 'panel',
  className = '',
  children,
  as: Tag = 'div',
}: SceneInfoPanelProps) {
  const Component = Tag as React.ElementType;
  return (
    <Component className={`${VARIANT_CLASS[variant]} ${className}`.trim()}>
      {children}
    </Component>
  );
}

export default SceneInfoPanel;
