/**
 * 場景瀏覽佈局 — HARDLINE 版
 *
 * token 名稱沿用（SCENE_GLASS / SCENE_BROWSE），內容全部換成硬線語言：
 * 方角、1px 線、實色底、無玻璃、無陰影。
 * 依賴這些 token 的 170+ 個檔案會一起換皮，不會出現兩套視覺。
 */
import type React from 'react';

const DECK = 'border border-[var(--hl-line)] bg-[var(--hl-deck)]';
const DECK_2 = 'border border-[var(--hl-line)] bg-[var(--hl-deck-2)]';
const HOVER =
  'transition-colors duration-150 hover:border-[var(--hl-line-hot)] hover:bg-[var(--hl-deck-2)]';

/** HARDLINE 實色 token（名稱沿用 SCENE_GLASS） */
export const SCENE_GLASS = {
  panel: DECK,
  panelStrong: 'border border-[var(--hl-line-strong)] bg-[var(--hl-deck-2)]',
  card: DECK,
  sidebar: DECK,
  toolbar: 'border-b border-[var(--hl-line)] bg-[var(--hl-void)]',
  chipIdle: `border border-[var(--hl-line)] bg-transparent font-mono text-[11px] text-[var(--hl-ink-2)] hover:border-[var(--hl-line-hot)] hover:text-[var(--hl-ink)]`,
  chipIdleSm: `border border-[var(--hl-line)] bg-transparent font-mono text-[10.5px] text-[var(--hl-ink-2)] hover:border-[var(--hl-line-hot)] hover:text-[var(--hl-ink)]`,
  progressTrack: 'overflow-hidden border border-[var(--hl-line)] bg-[var(--hl-void-2)]',
  buttonGhost: `border border-[var(--hl-line)] bg-transparent ${HOVER}`,
  selectionIdle: `border border-[var(--hl-line)] bg-[var(--hl-deck)] ${HOVER}`,
  selectionActive: 'border border-[var(--hl-signal)] bg-[var(--hl-signal-veil)]',
  workshopCard: `${DECK} overflow-hidden ${HOVER}`,
  workshopCardHover: 'hover:border-[var(--hl-line-hot)]',
  workshopIcon: `${DECK_2} group-hover:border-[var(--hl-signal)]`,
  workshopCover: 'border-b border-[var(--hl-line)] bg-[var(--hl-void-2)]',
  workshopBadge:
    'border border-[var(--hl-line)] bg-transparent px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--hl-ink-3)]',
  emptyPanel:
    'flex h-32 items-center justify-center border border-dashed border-[var(--hl-line)] bg-[var(--hl-void-2)]',
  listShell: `overflow-hidden ${DECK}`,
  settingRow: `${DECK} ${HOVER}`,
  sortBar: `flex flex-wrap items-center gap-2 border border-[var(--hl-line)] bg-[var(--hl-deck-2)] p-2`,
  sectionPanel: `${DECK} p-5 sm:p-6`,
  infoPanel: `${DECK} ${HOVER}`,
  infoPanelSm: `${DECK} ${HOVER}`,
  infoStat: `${DECK} p-3 text-center`,
  infoRow: `${DECK} p-3 ${HOVER}`,
  infoBadge:
    'border border-[var(--hl-line)] bg-transparent px-2 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--hl-ink-3)]',
  iconBox: DECK_2,
  progressTrackDark: `overflow-hidden ${DECK_2}`,
  detailHero: `${DECK} p-6`,
  detailBlock: `${DECK} p-5`,
  detailCell: `${DECK_2} px-3 py-2.5`,
  detailInset: `${DECK} px-4 py-3`,
  detailRow: `flex items-center gap-4 ${DECK} p-4`,
  detailRowSm: `flex items-center gap-4 ${DECK} p-3`,
  detailSurface: `overflow-hidden ${DECK}`,
  monoBadge:
    'border border-[var(--hl-line)] bg-[var(--hl-void-2)] px-1.5 py-0.5 font-mono text-[10.5px] tabular-nums text-[var(--hl-ink)]',
} as const;

export const SCENE_BROWSE = {
  frame: 'flex h-full w-full flex-col',
  body: 'relative z-10 flex w-full flex-1 min-h-0 gap-0 px-0 pb-0 pt-0',
  bodyDual: 'relative z-10 flex min-h-0 flex-1 flex-col gap-0 p-0 sm:flex-row',
  sidebar: 'flex w-[212px] flex-shrink-0 flex-col gap-0 border-r border-[var(--hl-line)]',
  sidebarShell: `flex flex-1 flex-col overflow-hidden bg-[var(--hl-deck)]`,
  mainPanel: 'min-w-0 flex-1 overflow-y-auto bg-[var(--hl-void)]',
  contentCard: 'relative flex flex-1 flex-col overflow-hidden bg-[var(--hl-void)]',
  gridPanel:
    'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[var(--hl-void)] p-4 sm:p-5',
  gridScroll:
    'min-h-0 flex-1 overflow-y-auto pb-2 pr-1 scrollbar-thin scrollbar-thumb-[var(--hl-line)] scrollbar-track-transparent',
  detailAside:
    'flex min-h-[280px] w-full min-w-0 shrink-0 flex-col overflow-hidden border-l border-[var(--hl-line)] bg-[var(--hl-deck)] p-3 sm:min-h-0 sm:w-[336px] sm:p-4 xl:w-[376px]',
  toolbar: `relative z-20 flex flex-col gap-3 border-b border-[var(--hl-line)] bg-[var(--hl-void)] px-4 py-2.5 sm:px-5`,
  contentInner: 'relative flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-[var(--hl-line)] md:p-7',
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
