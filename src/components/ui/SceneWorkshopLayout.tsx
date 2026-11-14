/**
 * 場景瀏覽佈局 — ARCADE HUD 版
 *
 * token 名稱沿用（SCENE_GLASS / SCENE_BROWSE），內容換成斜切艙體語言：
 * 小圓角 + 斜切角 + 硬陰影 + 內側厚度；金＝選中、青＝資訊。
 * 依賴這些 token 的 170+ 個檔案會一起換皮，不會出現兩套視覺。
 */
import type React from 'react';

const DECK = 'arc-panel';
const DECK_2 = 'arc-panel bg-[var(--arc-deck-2)]';
const HOVER =
  'transition-[border-color,background-color,box-shadow] duration-[160ms] hover:border-[var(--arc-line-hot)] hover:bg-[var(--arc-deck-2)]';

/** ARCADE 面板 token（名稱沿用 SCENE_GLASS） */
export const SCENE_GLASS = {
  panel: DECK,
  panelStrong: 'arc-panel border-[var(--arc-line-hot)] bg-[var(--arc-deck-2)]',
  card: DECK,
  sidebar: DECK,
  toolbar: 'border-b border-[var(--arc-line-strong)] bg-[var(--arc-void)] shadow-[0_2px_0_var(--arc-line)]',
  chipIdle: 'arc-chip',
  chipIdleSm: 'arc-chip text-[10.5px]',
  progressTrack:
    'overflow-hidden rounded-full border-[3px] border-[var(--cn-line-soft)] bg-[var(--cn-card-2)]',
  buttonGhost: 'arc-btn arc-btn--ghost',
  selectionIdle: `${DECK} ${HOVER}`,
  selectionActive:
    'arc-panel border-[var(--arc-gold-edge)] bg-[var(--arc-gold-veil)] shadow-[0_4px_0_-2px_rgba(46,36,64,0.16)]',
  workshopCard: `${DECK} overflow-hidden ${HOVER}`,
  workshopCardHover:
    'hover:border-[var(--arc-gold-edge)] hover:shadow-[0_10px_24px_-8px_rgba(0,0,0,0.9)]',
  workshopIcon: `${DECK_2} group-hover:border-[var(--arc-gold-edge)] group-hover:shadow-[0_4px_0_-2px_rgba(46,36,64,0.16)]`,
  workshopCover: 'border-b-[3px] border-[var(--cn-line-soft)] bg-[var(--cn-card-2)]',
  workshopBadge: 'arc-chip text-[10px] uppercase tracking-[0.08em]',
  emptyPanel:
    'arc-bracket relative flex h-32 items-center justify-center border border-dashed border-[var(--arc-line-strong)] bg-[var(--arc-void-2)]',
  listShell: `overflow-hidden ${DECK}`,
  settingRow: `${DECK} ${HOVER}`,
  sortBar: 'flex flex-wrap items-center gap-2 border-[3px] border-[var(--cn-line-soft)] bg-[var(--arc-deck-2)] p-2',
  sectionPanel: `${DECK} p-5 sm:p-6`,
  infoPanel: `${DECK} ${HOVER}`,
  infoPanelSm: `${DECK} ${HOVER}`,
  infoStat: `${DECK} p-3 text-center`,
  infoRow: `${DECK} p-3 ${HOVER}`,
  infoBadge: 'arc-chip text-[10px] uppercase tracking-[0.08em]',
  iconBox: DECK_2,
  progressTrackDark: `overflow-hidden rounded-[14px] ${DECK_2}`,
  detailHero: `${DECK} p-6`,
  detailBlock: `${DECK} p-5`,
  detailCell: `${DECK_2} px-3 py-2.5`,
  detailInset: `${DECK} px-4 py-3`,
  detailRow: `flex items-center gap-4 ${DECK} p-4`,
  detailRowSm: `flex items-center gap-4 ${DECK} p-3`,
  detailSurface: `overflow-hidden ${DECK}`,
  monoBadge:
    'rounded-sm border-[3px] border-[var(--cn-line-soft)] bg-[var(--arc-void-2)] px-1.5 py-0.5 font-mono text-[10.5px] tabular-nums text-[var(--arc-ink)] shadow-[0_4px_0_-2px_rgba(46,36,64,0.16)]',
} as const;

export const SCENE_BROWSE = {
  frame: 'flex h-full w-full flex-col',
  body: 'relative z-10 flex w-full flex-1 min-h-0 gap-0 px-0 pb-0 pt-0',
  bodyDual: 'relative z-10 flex min-h-0 flex-1 flex-col gap-0 p-0 sm:flex-row',
  sidebar:
    'flex w-[220px] flex-shrink-0 flex-col gap-0 border-r border-[var(--cn-line-soft)] bg-[var(--arc-deck-2)] shadow-[inset_0_3px_0_rgba(46,36,64,0.06)]',
  sidebarShell: `flex flex-1 flex-col overflow-hidden bg-[var(--arc-deck-2)]`,
  mainPanel: 'min-w-0 flex-1 overflow-y-auto bg-[var(--arc-void)]',
  contentCard: 'relative flex flex-1 flex-col overflow-hidden bg-[var(--arc-void)]',
  gridPanel:
    'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[var(--arc-void)] p-4 sm:p-5',
  gridScroll:
    'min-h-0 flex-1 overflow-y-auto pb-2 pr-1 scrollbar-thin scrollbar-thumb-[var(--arc-line-strong)] scrollbar-track-transparent',
  detailAside:
    'flex min-h-[280px] w-full min-w-0 shrink-0 flex-col overflow-hidden border-l border-[var(--cn-line-soft)] bg-[var(--arc-deck)] p-3 sm:min-h-0 sm:w-[336px] sm:p-4 xl:w-[376px]',
  toolbar:
    'relative z-20 flex flex-col gap-3 border-b border-[var(--arc-line-strong)] bg-[var(--arc-void)] px-4 py-2.5 shadow-[0_2px_0_var(--arc-line)] sm:px-5',
  contentInner:
    'relative flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-[var(--arc-line-strong)] md:p-7',
} as const;

export function SceneBrowseFrame({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`${SCENE_BROWSE.frame} ${className}`}>{children}</div>;
}

export function SceneBrowseBody({
  children,
  dual = false,
  className = '',
}: {
  children: React.ReactNode;
  dual?: boolean;
  className?: string;
}) {
  return <div className={`${dual ? SCENE_BROWSE.bodyDual : SCENE_BROWSE.body} ${className}`}>{children}</div>;
}

export function SceneBrowseSidebar({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <nav className={`${SCENE_BROWSE.sidebar} ${className}`}>
      <div className={SCENE_BROWSE.sidebarShell}>{children}</div>
    </nav>
  );
}

export function SceneBrowseMain({
  children,
  card = false,
  className = '',
}: {
  children: React.ReactNode;
  card?: boolean;
  className?: string;
}) {
  return <main className={`${card ? SCENE_BROWSE.contentCard : SCENE_BROWSE.mainPanel} ${className}`}>{children}</main>;
}

export function SceneBrowseGridPanel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`${SCENE_BROWSE.gridPanel} ${className}`}>{children}</div>;
}

export function SceneBrowseGridScroll({ children }: { children: React.ReactNode }) {
  return <div className={SCENE_BROWSE.gridScroll}>{children}</div>;
}

export function SceneBrowseDetailAside({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <aside className={`${SCENE_BROWSE.detailAside} ${className}`}>{children}</aside>;
}

export function SceneBrowseToolbar({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`${SCENE_BROWSE.toolbar} ${className}`}>{children}</div>;
}

export default SceneBrowseFrame;
