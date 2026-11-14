/**
 * @/components/ui 共用元件 barrel
 *
 * 常用匯入路徑：
 *   場景殼層    → SceneShell, SceneBrowseFrame, SCENE_GLASS
 *   設定列      → SettingRow, SectionGroup, SceneChoiceButton
 *   詳情面板    → DetailBlock, DetailHeroSection, DetailRow（SceneDetailParts）
 *   篩選 chip    → SceneFilterChip（SceneBrowseParts）
 *   暫停選單    → PauseSectionShell, PauseSections（./pause 或本 barrel）
 *   字級 token  → SCENE_TYPOGRAPHY
 *   側欄導航    → SceneSidebarNav, SceneSectionBanner
 */
export { PauseOverlay } from './PauseOverlay';
export { DevPanel } from './DevPanel';
export { SceneShell } from './SceneShell';
export type { SceneAccent, SceneShellProps } from './SceneShell';
export { SceneModal, SceneModalCloseBar, SceneModalHeader, SceneModalBody, SceneModalFooter } from './SceneModal';
export type {
  SceneModalProps,
  SceneModalCloseBarProps,
  SceneModalHeaderProps,
  SceneModalBodyProps,
  SceneModalFooterProps,
  SceneModalVariant,
} from './SceneModal';
export {
  SceneBrowseFrame,
  SceneBrowseBody,
  SceneBrowseSidebar,
  SceneBrowseMain,
  SceneBrowseGridPanel,
  SceneBrowseGridScroll,
  SceneBrowseDetailAside,
  SceneBrowseToolbar,
  SCENE_BROWSE,
  SCENE_GLASS,
} from './SceneWorkshopLayout';
export { BackButton } from './BackButton';
export { SceneNoticeToast } from './SceneNoticeToast';
export type { SceneNoticeTone } from './SceneNoticeToast';
export {
  SceneFilterChip,
  SceneFilterChipCount,
  SceneProgressBar,
  SceneCategoryChip,
  SceneBrowseEmptyState,
} from './SceneBrowseParts';
export type {
  SceneFilterAccent,
  SceneFilterChipProps,
  SceneFilterChipCountProps,
  SceneProgressBarProps,
  SceneCategoryChipProps,
  SceneBrowseEmptyStateProps,
} from './SceneBrowseParts';
export { SidebarPanelHeader } from './SidebarPanelHeader';
export type { PanelAccent, SidebarPanelHeaderProps } from './SidebarPanelHeader';
export { SelectionCardFrame } from './SelectionCardFrame';
export type { SelectionCardFrameProps } from './SelectionCardFrame';
export { WorkshopCard } from './WorkshopCard';
export { SceneInfoPanel } from './SceneInfoPanel';
export type { SceneInfoPanelProps, SceneInfoPanelVariant } from './SceneInfoPanel';
export {
  DetailStatGrid,
  DetailTraitRow,
  DetailSectionLabel,
  DetailEmptyState,
  DetailMiniStatCell,
  DetailHeroSection,
  DetailBlock,
  DetailCell,
  DetailInset,
  DetailRow,
  DetailSurface,
  SceneMonoBadge,
} from './SceneDetailParts';
export type { DetailStatCell, DetailTraitTag } from './SceneDetailParts';
export { Tabs } from './Tabs';
export { InteractiveTutorialOverlay } from './InteractiveTutorialOverlay';
export * from './CustomCheckbox';
export * from './CustomNumberInput';
export { SettingRow } from './SettingRow';
export { SectionGroup } from './SectionGroup';
export type { AccentColor, SettingRowProps } from './SettingRow';
export type { SectionGroupProps } from './SectionGroup';
export { SceneChoiceRow, SceneChoiceButton, sceneChoiceClass } from './SceneChoiceParts';
export type { SceneChoiceAccent, SceneChoiceButtonProps, SceneChoiceRowProps } from './SceneChoiceParts';
export {
  StatRecordSection,
  StatHeroBlock,
  StatSectionHeader,
  StatCard,
  StatBestRecordCard,
} from './SceneStatParts';
export type { SceneStatColor } from './SceneStatParts';
export { SCENE_TYPOGRAPHY } from './SceneTypography';
export {
  SceneSidebarNav,
  SceneSidebarNavButton,
  SceneSectionBanner,
} from './SceneSidebarNav';
export type {
  SceneSidebarNavItem,
  SceneSidebarNavProps,
  SceneSidebarNavButtonProps,
  SceneSectionBannerProps,
} from './SceneSidebarNav';
export { PauseSectionShell } from './pause/PauseSectionShell';
export { PauseSectionTitle } from './pause/PauseSectionTitle';
export {
  PauseSections,
  PauseSessionPanel,
  PauseSettingsPanel,
  PausePreviewSection,
  PauseSkillCooldowns,
  PauseTowerRanking,
  PauseEnemyInsights,
  PauseBattleTowerMatch,
  PauseEncyclopediaPanel,
} from './pause/index';
