/**
 * 創意工坊 — HARDLINE Console：TopBar + 左軌模式清單 + 主區工作台
 */
import { useMemo, useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useModStore } from '@/store/modStore';
import ModManager from './ModManager';
import ModEditor from './ModEditor';
import { SceneShell } from '@/components/ui/SceneShell';
import { Rail, RailItem, TopBar } from '@/components/hl';
import { WrenchIcon } from '@/components/ui/Icons';
import { WorkshopToolbar, type WorkshopTab } from './creative-workshop/WorkshopToolbar';
import { WorkshopHeaderStats } from './creative-workshop/WorkshopHeaderStats';
import { useTranslation } from '@/i18n';

export default function CreativeWorkshop() {
  const { t } = useTranslation();
  const w = t.workshop;
  const mods = useModStore((s) => s.mods);
  const workshopTab = useModStore((s) => s.workshopTab);
  const setWorkshopTab = useModStore((s) => s.setWorkshopTab);
  const [activeTab, setActiveTab] = useState<WorkshopTab>(workshopTab);

  useEffect(() => {
    setActiveTab(workshopTab);
  }, [workshopTab]);

  const handleTabChange = (tab: WorkshopTab) => {
    setActiveTab(tab);
    setWorkshopTab(tab);
  };

  const stats = useMemo(() => ({
    total: mods.length,
    enabled: mods.filter((m) => m.enabled).length,
  }), [mods]);

  const handleEditMod = () => handleTabChange('modEditor');

  const modes: { id: WorkshopTab; label: string }[] = [
    { id: 'modEditor', label: w.modEditor },
    { id: 'modManager', label: w.modManager },
  ];

  return (
    <SceneShell scrollable={false}>
      <div className="flex h-full w-full flex-col">
        <TopBar
          title={w.title}
          meta={w.subtitle}
          glyph={<WrenchIcon className="h-4 w-4" />}
          back={{ to: 'mainMenu' }}
          right={(
            <WorkshopHeaderStats
              mode={activeTab === 'modEditor' ? 'editor' : 'manager'}
              installedCount={stats.total}
              enabledCount={stats.enabled}
            />
          )}
        />

        <div className="flex min-h-0 flex-1">
          {/* 左軌：工作模式 */}
          <Rail
            label={w.title}
            foot={(
              <div className="flex items-center justify-between">
                <span className="hl-label">{w.headerStats.installed}</span>
                <span className="hl-num text-[10.5px] leading-none text-[var(--hl-ink-2)]">
                  {stats.enabled}/{stats.total}
                </span>
              </div>
            )}
          >
            {modes.map((mode, i) => (
              <RailItem
                key={mode.id}
                index={i + 1}
                label={mode.label}
                active={activeTab === mode.id}
                onClick={() => handleTabChange(mode.id)}
              />
            ))}
          </Rail>

          {/* 主區 */}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <WorkshopToolbar tab={activeTab} />

            <div className="relative min-h-0 flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  className="h-full"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                >
                  {activeTab === 'modEditor'
                    ? <ModEditor embedded />
                    : <ModManager embedded onEdit={handleEditMod} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </SceneShell>
  );
}
