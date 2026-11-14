/**
 * PauseOverlay 各 Tab 內容元件
 * 由主 PauseOverlay 引入並渲染 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/i18n';
import { ENEMY_DATA } from '@/data/gameData';
import { useGetTowerData } from '@/components/game/hooks';
import type { Tower } from '@/types/game';
import { SparklesIcon, AlienIcon, SwordsIcon, TowerIcon, TargetIcon, ChartIcon, CoinIcon, SkullIcon, UpArrowIcon, TrashIcon, PlayIcon, DoorExitIcon, HeartIcon, WaveIcon } from '@/components/ui/Icons';
import { SectionGroup } from '@/components/ui';
import { SCENE_TYPOGRAPHY } from '@/components/ui/SceneTypography';
import { SCENE_GLASS } from '@/components/ui/SceneWorkshopLayout';
import { PauseSectionTitle } from './PauseSectionTitle';
import { PauseSectionShell } from './PauseSectionShell';
import { PauseSessionPanel } from './PauseSessionPanel';
import { PauseTowerRanking } from './PauseTowerRanking';
import { PauseSettingsPanel } from './PauseSettingsPanel';
import { PauseSkillCooldowns } from './PauseSkillCooldowns';
import { PauseEnemyInsights } from './PauseEnemyInsights';
import { PausePreviewSection } from './PausePreviewSection';
import { PauseBattleTowerMatch } from './PauseBattleTowerMatch';

// ========== 共用元件 ==========

export const HeroResumeButton = ({ onResume }: { onResume: () => void }) => {
 const { t } = useTranslation();
 return (
 <button
 type="button"
 onClick={onResume}
 className="hl-btn-cut flex h-11 w-full items-center justify-center gap-2 border border-[var(--hl-signal)] bg-[var(--hl-signal)] text-[var(--hl-signal-ink)] transition-colors hover:bg-[#e6ff74]"
 >
 <PlayIcon className="h-4 w-4"/>
 <span className="text-[13px] font-semibold tracking-[0.04em]">{t.game.continueGame}</span>
 </button>
 );
};

const SmallStatCard = ({ icon, value, label, color }: {
 icon: React.ReactNode;
 value: string | number;
 label: string;
 color: string;
}) => (
 <div className="flex flex-col items-center justify-center border border-[var(--hl-line)] bg-[var(--hl-void-2)] p-2.5">
 <div className={`mb-1 ${color}`}>{icon}</div>
 <div className="font-mono text-[15px] font-semibold text-[var(--hl-ink)] tabular-nums">{value}</div>
 <div className={`${SCENE_TYPOGRAPHY.microMuted} mt-1 uppercase tracking-widest`}>{label}</div>
 </div>
);

// ========== 主控台 Tab ==========

export const MainSection = ({ onResume, onQuit, onStrategy }: {
 onResume: () => void;
 onQuit: () => void;
 onStrategy: () => void;
}) => {
 const { t } = useTranslation();

 return (
 <motion.div
 key="main"
 initial={{ opacity: 0, y: 5 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -5 }}
 transition={{ duration: 0.18 }}
 className="space-y-4"
 >
 <HeroResumeButton onResume={onResume} />

 <div className="flex flex-col gap-1.5">
 <button
 type="button"
 onClick={onStrategy}
 className="flex h-9 w-full items-center justify-center gap-2 border border-[var(--hl-line-strong)] text-[12px] font-medium text-[var(--hl-ink-2)] transition-colors hover:border-[var(--hl-line-hot)] hover:text-[var(--hl-ink)]"
 >
 <TargetIcon className="h-3.5 w-3.5"/> {t.game.pauseStrategicMode}
 </button>
 <button
 type="button"
 onClick={onQuit}
 className="flex h-9 w-full items-center justify-center gap-2 border border-[rgba(255,75,62,0.4)] text-[12px] font-medium text-[var(--hl-alarm)] transition-colors hover:bg-[rgba(255,75,62,0.1)] hover:border-[var(--hl-alarm)]"
 >
 <DoorExitIcon className="h-3.5 w-3.5"/> {t.mainMenu.exitGame}
 </button>
 </div>

 <PauseSessionPanel />
 </motion.div>
 );
};

// ========== 戰況 Tab（合併 stats + towers + enemies） ==========

export const BattleStatusSection = () => {
 const { t } = useTranslation();
 const towers = useGameStore((s) => s.towers);
 const placementStats = useGameStore((s) => s.placementStats);
 const upgradeStats = useGameStore((s) => s.upgradeStats);
 const getTowerData = useGetTowerData();

 const totalKills = towers.reduce((sum, t) => sum + t.kills, 0);
 const totalDamage = towers.reduce((sum, t) => sum + t.totalDamage, 0);
 const efficiency = useMemo(() => {
 const totalSpent = placementStats.totalSpent + upgradeStats.totalSpent;
 const moneyEff = totalSpent > 0 ? (totalDamage / totalSpent).toFixed(1) : '0';
 const avgLevel = towers.length > 0 ? (towers.reduce((s, t) => s + t.level, 0) / towers.length).toFixed(1) : '0';
 const killPerTower = towers.length > 0 ? (totalKills / towers.length).toFixed(1) : '0';
 return { moneyEff, avgLevel, killPerTower, totalSpent };
 }, [towers, placementStats, upgradeStats, totalDamage, totalKills]);

 return (
 <motion.div
 key="battle"
 initial={{ opacity: 0, y: 5 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -5 }}
 transition={{ duration: 0.18 }}
 className="space-y-4"
 >
 <PauseSectionTitle>{t.game.pauseBattleLive}</PauseSectionTitle>
 <div className="grid gap-4 lg:grid-cols-2">
 <PauseSectionShell
 title={t.game.pauseOnFieldEnemies}
 icon={<AlienIcon className="h-5 w-5"/>}
 accent="rose"
 >
 <PauseEnemyInsights embedded />
 </PauseSectionShell>
 <PauseSectionShell
 title={t.game.pauseActiveSkills}
 icon={<SparklesIcon className="h-5 w-5"/>}
 accent="purple"
 >
 <PauseSkillCooldowns embedded />
 </PauseSectionShell>
 </div>

 <PauseSectionShell
 title={t.game.pauseTowerMatch}
 icon={<TargetIcon className="h-5 w-5"/>}
 accent="emerald"
 >
 <PauseBattleTowerMatch embedded />
 </PauseSectionShell>

 <PauseSectionTitle>{t.game.pauseOutputBuild}</PauseSectionTitle>
 <div className="grid gap-4 lg:grid-cols-2">
 <PauseSectionShell
 title={t.game.pauseTowerRanking}
 icon={<SwordsIcon className="h-5 w-5"/>}
 accent="amber"
 >
 <PauseTowerRanking embedded />
 </PauseSectionShell>
 <TowerDistributionPanel towers={towers} getTowerData={getTowerData} t={t} />
 </div>

 <SectionGroup
 title={t.game.pauseCumulativeStats}
 icon={<ChartIcon className="h-5 w-5"/>}
 accent="indigo"
 columns={1}
 >
 <div className="col-span-full grid grid-cols-3 gap-2">
 <SmallStatCard icon={<SkullIcon className="w-4 h-4"/>} value={totalKills} label={t.game.pauseStatTotalKills} color="text-[var(--hl-alarm)]"/>
 <SmallStatCard icon={<SwordsIcon className="w-4 h-4"/>} value={Math.floor(totalDamage).toLocaleString()} label={t.game.pauseStatTotalDamage} color="text-[var(--hl-caution)]"/>
 <SmallStatCard icon={<UpArrowIcon className="w-4 h-4"/>} value={upgradeStats.totalUpgrades} label={t.game.pauseStatUpgrades} color="text-[var(--hl-reach)]"/>
 <SmallStatCard icon={<TowerIcon className="w-4 h-4"/>} value={placementStats.totalPlaced} label={t.game.pauseStatBuilt} color="text-[var(--hl-reach)]"/>
 <SmallStatCard icon={<TrashIcon className="w-4 h-4"/>} value={placementStats.totalSold} label={t.game.pauseStatSold} color="text-[var(--hl-ink-2)]"/>
 <SmallStatCard icon={<CoinIcon className="w-4 h-4"/>} value={`$${efficiency.totalSpent}`} label={t.game.pauseStatTotalSpent} color="text-[var(--hl-caution)]"/>
 </div>
 </SectionGroup>

 <PauseSectionShell
 title={t.game.detailedStats}
 icon={<ChartIcon className="h-5 w-5"/>}
 accent="indigo"
 >
 <div className="grid grid-cols-3 gap-3">
 <div>
 <div className={`${SCENE_TYPOGRAPHY.microMuted} mb-0.5`}>{t.game.pauseStatKillsPerTower}</div>
 <div className="text-base font-bold text-[var(--hl-ink)] font-mono">{efficiency.killPerTower}</div>
 </div>
 <div>
 <div className={`${SCENE_TYPOGRAPHY.microMuted} mb-0.5`}>{t.game.pauseStatAverageLevel}</div>
 <div className="text-base font-bold text-[var(--hl-ink)] font-mono">{efficiency.avgLevel}</div>
 </div>
 <div>
 <div className={`${SCENE_TYPOGRAPHY.microMuted} mb-0.5`}>{t.game.pauseStatMoneyEff}</div>
 <div className="text-base font-bold text-[var(--hl-ink)] font-mono">{efficiency.moneyEff}</div>
 </div>
 </div>
 </PauseSectionShell>
 </motion.div>
 );
};

// ========== 預覽下波 Tab ==========

export const PreviewSection = PausePreviewSection;

// ========== 設定 Tab ==========

export const SettingsSection = PauseSettingsPanel;

// ========== 塔分佈 ==========

function TowerDistributionPanel({
 towers,
 getTowerData,
 t,
}: {
 towers: Tower[];
 getTowerData: ReturnType<typeof useGetTowerData>;
 t: { game: { pauseTypeDistribution: string; pauseNoTowers: string } };
}) {
 const grouped = Object.entries(
 towers.reduce((acc, tw) => {
 acc[tw.type] = (acc[tw.type] || 0) + 1;
 return acc;
 }, {} as Record<string, number>),
 );

 return (
 <PauseSectionShell
 title={t.game.pauseTypeDistribution}
 icon={<TowerIcon className="h-5 w-5"/>}
 accent="blue"
 action={<span className="font-mono text-[10px] tabular-nums text-[var(--hl-ink-3)]">?{towers.length}</span>}
 >
 {grouped.length > 0 ? (
 <div className="flex max-h-36 flex-wrap gap-1.5 overflow-y-auto no-scrollbar">
 {grouped.map(([type, count]) => {
 const data = getTowerData(type as keyof typeof ENEMY_DATA);
 return (
 <div
 key={type}
 className="flex items-center gap-1.5 border border-[var(--hl-line)] bg-[rgba(6,7,10,0.55)] px-2 py-1"
 >
 <span className="h-2.5 w-2.5 "style={{ backgroundColor: data?.color || '#888' }} />
 <span className="text-[10px] font-bold text-[var(--hl-ink-2)]">{data?.name || type}</span>
 <span className="font-mono text-[10px] font-bold text-[var(--hl-ink)]">?{count}</span>
 </div>
 );
 })}
 </div>
 ) : (
 <div className="py-4 text-center text-xs text-[var(--hl-ink-4)]">{t.game.pauseNoTowers}</div>
 )}
 </PauseSectionShell>
 );
}

// ========== 戰略模式 ==========

export const StrategyModeView = ({ onResume, onBackToMenu }: {
 onResume: () => void;
 onBackToMenu: () => void;
}) => {
 const { t } = useTranslation();
 const money = useGameStore((s) => s.money);
 const health = useGameStore((s) => s.health);
 const currentWave = useGameStore((s) => s.currentWave);
 const towers = useGameStore((s) => s.towers);
 const enemies = useGameStore((s) => s.enemies);

 return (
 <motion.div
 className="absolute top-4 left-4 z-40"
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -20 }}
 >
 <div className={`${SCENE_GLASS.panel} p-4 w-[260px]`}>
 <div className="flex items-center gap-2 mb-3">
 <div className="w-9 h-9 bg-[var(--hl-deck-2)] border border-[var(--hl-line)] flex items-center justify-center">
 <TargetIcon className="w-4 h-4 text-[var(--hl-ink-2)]"/>
 </div>
 <div>
 <div className="text-sm font-black text-[var(--hl-ink)] tracking-wide">{t.game.pauseStrategicMode}</div>
 <div className="text-[10px] text-[var(--hl-ink-2)]">{t.game.pauseStrategicHint}</div>
 </div>
 </div>

 <div className="grid grid-cols-3 gap-2 mb-3">
 <div className="bg-[rgba(6,7,10,0.55)] border border-[var(--hl-line)] p-2 text-center">
 <CoinIcon className="w-3 h-3 text-[var(--hl-caution)] mx-auto mb-0.5"/>
 <div className="text-sm font-bold text-[var(--hl-caution)]">${money}</div>
 </div>
 <div className="bg-[rgba(6,7,10,0.55)] border border-[var(--hl-line)] p-2 text-center">
 <HeartIcon className="w-3 h-3 text-[var(--hl-alarm)] mx-auto mb-0.5"/>
 <div className="text-sm font-bold text-[var(--hl-alarm)]">{health}</div>
 </div>
 <div className="bg-[rgba(6,7,10,0.55)] border border-[var(--hl-line)] p-2 text-center">
 <WaveIcon className="w-3 h-3 text-[var(--hl-reach)] mx-auto mb-0.5"/>
 <div className="text-sm font-bold text-[var(--hl-reach)]">{currentWave}</div>
 </div>
 </div>

 <div className="grid grid-cols-2 gap-2 mb-3">
 <div className="bg-[rgba(6,7,10,0.55)] border border-[var(--hl-line)] p-2 flex items-center justify-between">
 <span className={`${SCENE_TYPOGRAPHY.microMuted} flex items-center gap-1`}><TowerIcon className="w-3 h-3 text-[var(--hl-reach)]"/> {t.game.pauseTowerShort}</span>
 <span className="text-sm font-bold text-[var(--hl-reach)]">{towers.length}</span>
 </div>
 <div className="bg-[rgba(6,7,10,0.55)] border border-[var(--hl-line)] p-2 flex items-center justify-between">
 <span className={`${SCENE_TYPOGRAPHY.microMuted} flex items-center gap-1`}><AlienIcon className="w-3 h-3 text-[var(--hl-alarm)]"/> {t.game.pauseEnemyShort}</span>
 <span className="text-sm font-bold text-[var(--hl-alarm)]">{enemies.length}</span>
 </div>
 </div>

 <div className="flex gap-2">
 <button
 onClick={onResume}
 className="flex-1 py-2 bg-[var(--hl-deck-2)] border border-[var(--hl-line)] text-[var(--hl-vital)] text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[var(--hl-deck-2)]"
 >
 <PlayIcon className="w-3.5 h-3.5"/> {t.game.continue}
 </button>
 <button
 onClick={onBackToMenu}
 className="px-3 py-2 border border-[var(--hl-line)] bg-[var(--hl-deck-2)] text-[var(--hl-ink)] text-xs font-bold hover:border-[var(--hl-signal)]"
 >
 {t.game.pauseBack}
 </button>
 </div>
 </div>
 </motion.div>
 );
};

/** @/components/ui barrel 用命名空間匯出 */
export const PauseSections = {
 HeroResumeButton,
 MainSection,
 BattleStatusSection,
 PreviewSection,
 SettingsSection,
 StrategyModeView,
};
