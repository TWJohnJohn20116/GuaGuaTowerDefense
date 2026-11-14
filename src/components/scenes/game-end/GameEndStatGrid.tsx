/**
 * 結算畫面 · 數值格
 *
 * 所有結算數值都走這裡：mono、tabular-nums arc-num、標籤在數值上方。
 * 不畫卡片、不加底色，格子之間只有欄距。
 */

import type React from 'react';
import { StatCell } from '@/components/hl';

export interface GameEndStatItem {
  key: string;
  label: React.ReactNode;
  value: React.ReactNode;
  unit?: React.ReactNode;
  tone?: 'ink' | 'signal' | 'vital' | 'alarm' | 'caution' | 'reach' | 'muted';
}

export function GameEndStatGrid({
  items,
  className = '',
}: {
  items: GameEndStatItem[];
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-3 ${className}`}>
      {items.map((item) => (
        <StatCell
          key={item.key}
          label={item.label}
          value={item.value}
          unit={item.unit}
          tone={item.tone}
        />
      ))}
    </div>
  );
}
