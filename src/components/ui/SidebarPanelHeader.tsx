/**
 * SidebarPanelHeader - 側欄／頂條統一標題模塊
 *
 * 供側欄式場景（商店、每日挑戰、天賦樹、皮膚系統、地圖選擇等）使用，
 * 與 SceneShell.Header（橫欄場景用）構成兩套統一的標題規格：
 *  - stack 佈局：窄側欄用（返回按鈕一行、標題塊一行）
 *  - row 佈局：全寬頂條用（返回按鈕與標題同行）
 *
 * 標題排版統一：accent 發光色條 eyebrow + 大寫標題 + 灰階副標。
 */

import type React from 'react';
import { motion } from 'framer-motion';
import { BackButton } from './BackButton';
import type { GameScene } from '@/types/game';

export type PanelAccent = 'cyan' | 'blue' | 'amber' | 'yellow' | 'purple' | 'pink' | 'emerald' | 'red';

const ACCENT_STYLES: Record<PanelAccent, { bar: string; text: string; iconBox: string }> = {
  cyan: {
    bar: 'bg-[var(--cn-sky)] shadow-[0_4px_0_-2px_rgba(46,36,64,0.16)]',
    text: 'text-[var(--arc-reach)]',
    iconBox: 'bg-[rgba(111,140,255,0.12)] border-[rgba(111,140,255,0.38)] text-[var(--arc-reach)]',
  },
  blue: {
    bar: 'bg-[var(--cn-sky)] shadow-[0_4px_0_-2px_rgba(46,36,64,0.16)]',
    text: 'text-[var(--arc-reach)]',
    iconBox: 'bg-[rgba(111,140,255,0.12)] border-[rgba(111,140,255,0.38)] text-[var(--arc-reach)]',
  },
  amber: {
    bar: 'bg-[var(--cn-sun)] shadow-[0_4px_0_-2px_rgba(46,36,64,0.16)]',
    text: 'text-[var(--arc-caution)]',
    iconBox: 'bg-[rgba(255,182,39,0.12)] border-[rgba(255,182,39,0.38)] text-[var(--arc-caution)]',
  },
  yellow: {
    bar: 'bg-[var(--cn-sun)] shadow-[0_4px_0_-2px_rgba(46,36,64,0.16)]',
    text: 'text-[var(--arc-caution)]',
    iconBox: 'bg-[rgba(255,182,39,0.12)] border-[rgba(255,182,39,0.38)] text-[var(--arc-caution)]',
  },
  purple: {
    bar: 'bg-[var(--cn-grape)] shadow-[0_4px_0_-2px_rgba(46,36,64,0.16)]',
    text: 'text-[var(--arc-ink-2)]',
    iconBox: 'bg-[var(--cn-grape-soft)] border-[var(--arc-line-strong)] text-[var(--arc-ink-2)]',
  },
  pink: {
    bar: 'bg-[var(--cn-rose)] shadow-[0_4px_0_-2px_rgba(46,36,64,0.16)]',
    text: 'text-[var(--arc-ink-2)]',
    iconBox: 'bg-[var(--cn-coral-soft)] border-[var(--arc-line-strong)] text-[var(--arc-ink-2)]',
  },
  emerald: {
    bar: 'bg-[var(--cn-mint)] shadow-[0_4px_0_-2px_rgba(46,36,64,0.16)]',
    text: 'text-[var(--arc-vital)]',
    iconBox: 'bg-[rgba(56,224,143,0.12)] border-[rgba(56,224,143,0.38)] text-[var(--arc-vital)]',
  },
  red: {
    bar: 'bg-[var(--cn-alert)] shadow-[0_4px_0_-2px_rgba(46,36,64,0.16)]',
    text: 'text-[var(--arc-alert)]',
    iconBox: 'bg-[rgba(255,61,113,0.12)] border-[rgba(255,61,113,0.38)] text-[var(--arc-alert)]',
  },
};

export interface SidebarPanelHeaderProps {
  title: string;
  /** 標題上方的小型大寫提示字（與發光色條成組） */
  eyebrow?: string;
  /** 標題下方的灰階副標 */
  subtitle?: string;
  /** 可選圖標徽章（顯示在標題塊左側） */
  icon?: React.ReactNode;
  accent?: PanelAccent;
  /** stack：窄側欄（返回一行、標題一行）；row：全寬頂條（同行） */
  layout?: 'stack' | 'row';
  showBack?: boolean;
  backTo?: GameScene;
  onBack?: () => void;
  /** 右側槽位（統計、進度、操作等） */
  right?: React.ReactNode;
  className?: string;
  /** 標題動畫 key（分類切換時重播入場動畫） */
  motionKey?: string | number;
}

/** eyebrow 色條 + 標題 + 副標（共用標題塊） */
function TitleBlock({
  title,
  eyebrow,
  subtitle,
  icon,
  accent,
  motionKey,
}: Pick<SidebarPanelHeaderProps, 'title' | 'eyebrow' | 'subtitle' | 'icon' | 'motionKey'> & {
  accent: PanelAccent;
}) {
  const a = ACCENT_STYLES[accent];
  return (
    <motion.div
      key={motionKey}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-center gap-3 min-w-0"
    >
      {icon && (
        <div className={`w-10 h-10 rounded-sm flex items-center justify-center border  flex-shrink-0 ${a.iconBox}`}>
          {icon}
        </div>
      )}
      <div className="flex flex-col min-w-0">
        {eyebrow && (
          <div className="flex items-center gap-1.5 mb-0.5">
            <div className={`w-1 h-3  ${a.bar}`} />
            <span className={`text-[9px] font-extrabold tracking-[0.2em] uppercase ${a.text}`}>
              {eyebrow}
            </span>
          </div>
        )}
        <h1 className="arc-title text-lg font-extrabold tracking-widest uppercase text-[var(--arc-ink)] drop- truncate leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[9px] font-bold tracking-widest uppercase text-[var(--arc-ink-4)] mt-0.5 truncate">
            {subtitle}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export function SidebarPanelHeader({
  title,
  eyebrow,
  subtitle,
  icon,
  accent = 'cyan',
  layout = 'stack',
  showBack = true,
  backTo,
  onBack,
  right,
  className = '',
  motionKey,
}: SidebarPanelHeaderProps) {
  if (layout === 'row') {
    return (
      <div className={`flex items-center justify-between gap-4 ${className}`}>
        <div className="flex items-center gap-4 min-w-0">
          {showBack && <BackButton variant="glass" size="lg" to={backTo} onClick={onBack} />}
          <TitleBlock title={title} eyebrow={eyebrow} subtitle={subtitle} icon={icon} accent={accent} motionKey={motionKey} />
        </div>
        {right}
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {(showBack || right) && (
        <div className="flex items-center justify-between gap-3">
          {showBack && <BackButton variant="glass" size="lg" to={backTo} onClick={onBack} />}
          {right}
        </div>
      )}
      <TitleBlock title={title} eyebrow={eyebrow} subtitle={subtitle} icon={icon} accent={accent} motionKey={motionKey} />
    </div>
  );
}

export default SidebarPanelHeader;
