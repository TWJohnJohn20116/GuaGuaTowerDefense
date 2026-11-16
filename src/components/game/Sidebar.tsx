import { memo } from 'react';
import { useTranslation } from '@/i18n';
import { useSettingsStore } from '@/store/settingsStore';
import { TopStatsBar } from './sidebar/TopStatsBar';
import { BottomControls } from './sidebar/BottomControls';
import { TowerPanel } from './sidebar/TowerPanel';
import { IntelPanel } from './IntelPanel';
import { AIStatusHeader } from './sidebar/AIStatusHeader';
import { ViewModeToggle } from '@/components/scenes/game-scene/three/ViewModeToggle';
import { PlayerSkillBar } from './PlayerSkillBar';
import { AutoBattlePanel } from './autobattle/AutoBattlePanel';

/**
 * 戰鬥 HUD — 無卡片緊湊構圖
 *
 *   左上：戰況簇（生命／金幣／波次／分數，數值 22px）
 *   右上：2D/3D 切換
 *   左側：塔輪盤（寬 68，鎖定只留鎖圖示）
 *   右側：情報標籤（預設收起，點開才是紙卡浮層）
 *   底部：居中指揮膠囊（主鍵＝開始波次）＋ 左角技能 ＋ 右角離開
 *
 * 所有元素直接壓在戰場上，只有真的浮起來的東西（情報浮層、彈窗）才有白卡底。
 * 塔輪盤固定左側：舊存檔的 towerPanel='right' 不再影響構圖。
 */

interface SidebarProps {
  /** 2D / 3D 視圖模式；不傳＝不顯示切換鍵（教學模式） */
  viewMode?: '2d' | '3d';
  onToggleView?: () => void;
}

const SidebarImpl = ({ viewMode, onToggleView }: SidebarProps) => {
  useTranslation();
  const hudLayout = useSettingsStore((s) => s.hudLayout);

  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden" style={{ opacity: hudLayout.opacity }}>
      {/* 左上：戰況簇 */}
      {hudLayout.showStatsBar && (
        <div className="pointer-events-auto absolute left-4 top-3">
          <TopStatsBar />
        </div>
      )}

      {/* 右上：2D / 3D */}
      {viewMode && onToggleView && (
        <div className="pointer-events-auto absolute right-4 top-3">
          <ViewModeToggle mode={viewMode} onToggle={onToggleView} />
        </div>
      )}

      {/* 左側：塔輪盤（固定左） */}
      {hudLayout.showTowerPanel && (
        <div className="pointer-events-auto absolute bottom-24 left-3 top-20 flex w-[104px] flex-col overflow-hidden rounded-[var(--cn-r-md)] border-[3px] border-[var(--cn-line)] bg-[color-mix(in_oklab,var(--cn-card)_90%,transparent)] p-1.5 shadow-[0_4px_0_var(--cn-line)]">
          <TowerPanel />
        </div>
      )}

      {/* 右側：情報標籤／浮層 */}
      {hudLayout.showIntelPanel && (
        <div className="pointer-events-auto absolute right-3 top-20 flex w-[236px] flex-col items-end gap-2">
          <IntelPanel />
          {/* AI 啟動中：與情報標籤同款的豎排小卡，自動戰鬥關閉時自己消失 */}
          <AIStatusHeader />
        </div>
      )}

      {/* 左下：主動技能 */}
      {hudLayout.showTowerSkillBar && (
        <div className="pointer-events-auto absolute bottom-4 left-4">
          <PlayerSkillBar />
        </div>
      )}

      {/* AI 自動戰鬥面板（右側抽屜，由面板開關控制） */}
      <AutoBattlePanel />

      {/* 底部：指揮膠囊 */}
      {hudLayout.showBottomControls && (
        <div className="pointer-events-auto absolute bottom-4 left-1/2 -translate-x-1/2">
          <BottomControls />
        </div>
      )}
    </div>
  );
};

export const Sidebar = memo(SidebarImpl);
