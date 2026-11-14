import { useDevStore } from '@/store/devStore';
import { useTranslation } from '@/i18n';
import { EyeIcon, MapIcon, LightningIcon } from '@/components/ui/Icons';
import { DevSection, DevToggle } from './common';

export const VisualSection = () => {
  const { t } = useTranslation();
  const showDebugInfo = useDevStore((s) => s.showDebugInfo);
  const showFPS = useDevStore((s) => s.showFPS);
  const showGrid = useDevStore((s) => s.showGrid);
  const showPath = useDevStore((s) => s.showPath);
  const showHitboxes = useDevStore((s) => s.showHitboxes);
  const showPerfMonitor = useDevStore((s) => s.showPerfMonitor);

  const toggleDebugInfo = useDevStore((s) => s.toggleDebugInfo);
  const toggleFPS = useDevStore((s) => s.toggleFPS);
  const toggleGrid = useDevStore((s) => s.toggleGrid);
  const togglePath = useDevStore((s) => s.togglePath);
  const toggleHitboxes = useDevStore((s) => s.toggleHitboxes);
  const togglePerfMonitor = useDevStore((s) => s.togglePerfMonitor);

  return (
    <div className="space-y-3">
      <DevSection
        title={t.dev.secScreenDebug}
        icon={<EyeIcon className="w-4 h-4" />}
        accent="cyan"
        keywords={['debug', 'fps', 'hitbox', 'overlay', '除錯', '幀率', '碰撞']}
      >
        <DevToggle icon={<EyeIcon className="w-3.5 h-3.5" />} label="Debug Info" value={showDebugInfo} onChange={toggleDebugInfo} accent="cyan" />
        <DevToggle icon={<LightningIcon className="w-3.5 h-3.5" />} label="FPS" value={showFPS} onChange={toggleFPS} accent="cyan" />
        <DevToggle icon={<EyeIcon className="w-3.5 h-3.5" />} label="Hitbox" value={showHitboxes} onChange={toggleHitboxes} accent="cyan" />
      </DevSection>

      <DevSection
        title={t.dev.secMapDebug}
        icon={<MapIcon className="w-4 h-4" />}
        accent="emerald"
        keywords={['grid', 'path', 'map', '網格', '路徑', '地圖']}
      >
        <DevToggle icon={<MapIcon className="w-3.5 h-3.5" />} label="Grid" value={showGrid} onChange={toggleGrid} accent="emerald" />
        <DevToggle icon={<MapIcon className="w-3.5 h-3.5" />} label="Path" value={showPath} onChange={togglePath} accent="emerald" />
      </DevSection>

      <DevSection
        title={t.dev.secPerfMonitor}
        icon={<LightningIcon className="w-4 h-4" />}
        accent="amber"
        keywords={['perf', 'performance', 'monitor', '效能', '監視']}
      >
        <DevToggle icon={<LightningIcon className="w-3.5 h-3.5" />} label="Perf Monitor" value={showPerfMonitor} onChange={togglePerfMonitor} accent="amber" />
      </DevSection>
    </div>
  );
};
