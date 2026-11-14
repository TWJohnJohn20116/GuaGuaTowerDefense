// 主選單 · HARDLINE Home
// 左：識別與主行動（固定 380）。右：等寬入口格（1px 共用格線，沒有多餘留白）。底：遙測帶。
import { SceneShell } from '@/components/ui/SceneShell';
import { MenuHomeRail } from '@/components/scenes/main-menu/MenuHomeRail';
import { MenuHomeGrid } from '@/components/scenes/main-menu/MenuHomeGrid';
import { HomeTelemetry } from '@/components/scenes/main-menu/HomeTelemetry';

export default function MainMenu() {
  return (
    <SceneShell scrollable={false}>
      <div className="flex h-full w-full flex-col">
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <MenuHomeRail />
          <MenuHomeGrid />
        </div>
        <HomeTelemetry />
      </div>
    </SceneShell>
  );
}
