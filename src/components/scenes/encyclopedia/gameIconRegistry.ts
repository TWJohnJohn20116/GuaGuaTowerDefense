/**
 * 遊戲內 SVG 圖示註冊表
 * 從 Icons.tsx 自動收集所有 *Icon 元件（排除 ThemeIcon）
 */

import type { ComponentType, SVGProps } from 'react';
import * as IconModule from '@/components/ui/Icons';
import iconsRaw from '@/components/ui/Icons.tsx?raw';

export type IconCategory =
  | 'currency'
  | 'navigation'
  | 'gameState'
  | 'combat'
  | 'tools'
  | 'overlay'
  | 'settings'
  | 'enemy'
  | 'effects'
  | 'theme'
  | 'achievement'
  | 'shapes'
  | 'other';

export type IconSource = 'ui';

export interface GameIconEntry {
  id: string;
  exportName: string;
  displayName: string;
  category: IconCategory;
  source: IconSource;
  sourceFile: string;
  sourceLine?: number;
  sourceSection?: string;
  Component: ComponentType<SVGProps<SVGSVGElement> & { className?: string }>;
}

export const ICON_CATEGORY_LABELS: Record<IconCategory, string> = {
  currency: '貨幣',
  navigation: '導航與選單',
  gameState: '遊戲狀態',
  combat: '戰鬥與塔',
  tools: '操作工具',
  overlay: '統計與覆蓋',
  settings: '設定',
  enemy: '敵人與生物',
  effects: '狀態與特效',
  theme: '主題',
  achievement: '成就',
  shapes: '形狀標記',
  other: '其他',
};

export const ICON_CATEGORY_ORDER: IconCategory[] = [
  'navigation',
  'gameState',
  'combat',
  'enemy',
  'effects',
  'currency',
  'tools',
  'overlay',
  'settings',
  'achievement',
  'theme',
  'shapes',
  'other',
];

const EXCLUDED = new Set(['ThemeIcon']);
const ICONS_SOURCE_FILE = 'src/components/ui/Icons.tsx';

interface IconSourceMeta {
  lineMap: Record<string, number>;
  sectionByLine: { line: number; label: string }[];
}

function parseIconsSourceMeta(raw: string): IconSourceMeta {
  const lineMap: Record<string, number> = {};
  const sectionByLine: { line: number; label: string }[] = [];

  raw.split('\n').forEach((line, index) => {
    const lineNo = index + 1;
    const sectionMatch = line.match(/^\/\/ ── (.+?) ─+/);
    if (sectionMatch) {
      sectionByLine.push({ line: lineNo, label: sectionMatch[1].trim() });
    }
    const exportMatch = line.match(/^export const (\w+Icon)/);
    if (exportMatch) {
      lineMap[exportMatch[1]] = lineNo;
    }
  });

  return { lineMap, sectionByLine };
}

const ICON_SOURCE_META = parseIconsSourceMeta(iconsRaw);

function resolveSection(line?: number): string | undefined {
  if (!line) return undefined;
  let section: string | undefined;
  for (const entry of ICON_SOURCE_META.sectionByLine) {
    if (entry.line <= line) section = entry.label;
    else break;
  }
  return section;
}

/** 圖示庫可篩選的來源檔案 */
export const ICON_SOURCE_FILES = [ICONS_SOURCE_FILE] as const;

/** CoinIcon → Coin Icon */
function toDisplayName(exportName: string): string {
  const base = exportName.replace(/Icon\d*$/, '');
  return base.replace(/([a-z])([A-Z])/g, '$1 $2');
}

function inferCategory(name: string): IconCategory {
  if (/Dot|Square|Circle|Solid/.test(name)) return 'shapes';
  if (/^(Coin|Coins|Bill|Bank|Money)/.test(name)) return 'currency';
  if (/^(Gamepad|Trophy|Palette|Shop|Cart|Wrench|Books|OpenBook|Clipboard|Gear|Home|Chevron|GameController)/.test(name)) return 'navigation';
  if (/^(Heart|BrokenHeart|Wave|Infinity|Star|Lock|Box|Search)/.test(name)) return 'gameState';
  if (/^(Shield|Target|Explosion|Snowflake|Skull|CrystalBall|Lightning|Chain|Heal|Aegis|Warp|Flame|Meteor|Tornado|Tower|Sword|Crosshair|Build|Gun|Dagger|Bomb|PinIcon2)/.test(name)) return 'combat';
  if (/^(Pin|Robot|Scales|Swords|UpArrow|Construction|Edit|Skip|Hourglass|Play|Pause|Door|Refresh|Plus|Cross|Check|Warning|Trash|Lightbulb|Undo|Redo|Save|Download|Upload|Copy|Folder|Package|Document|Link|Keyboard|Pencil|Floppy|FastForward|Rewind)/.test(name)) return 'tools';
  if (/^(Celebration|Sparkle|Map|Chart|Notepad|Alien|Endless|Globe)/.test(name)) return 'overlay';
  if (/^(Monitor|Speaker|Bell|Music|Sliders|Mouse|Pointer|Laptop|Smartphone|Cloud|Settings)/.test(name)) return 'settings';
  if (/^(Spider|Snake|Scorpion|Demon|Ghost|Ant|Dragon|AlienMonster|Cactus|Sunflower|Herb|Clover)/.test(name)) return 'enemy';
  if (/^(Footprints|Run|Walk|Bone|Blood|Swirl|Storm|SkullCrossbones|Zap|Radioactive|BlackHole|DNA|Brain|StopSign|Info|Question|X|Check2|Plus2|Minus|Multiply|Divide|Cold|Cool|Rain|Snow|Water)/.test(name)) return 'effects';
  if (/^(Moon|Sun|Eye|Tree|Sunrise|HeartPurple|Flower|Christmas|Pumpkin|Rainbow|Castle)/.test(name)) return 'theme';
  if (/^(BuildTower|UpgradeTower|KillEnemy|ShieldLock|Danger|Magic|Template|Medal|Ribbon|Puzzle|Gift|Graduation|Rocket|Timer|Clock|Calendar|Watch|Crown|Dice|Gem|User|Dash|Trophy2|Play2|Pause2|MoneyIcon|SwordsCross|ChartUp|Shield2|Construction2|Crown2|Target2|TestTube)/.test(name)) return 'achievement';
  return 'other';
}

function buildRegistry(): GameIconEntry[] {
  return Object.entries(IconModule)
    .filter(([name, exp]) => name.endsWith('Icon') && !EXCLUDED.has(name) && typeof exp === 'function')
    .map(([exportName, Component]) => {
      const sourceLine = ICON_SOURCE_META.lineMap[exportName];
      return {
        id: exportName,
        exportName,
        displayName: toDisplayName(exportName),
        category: inferCategory(exportName),
        source: 'ui' as IconSource,
        sourceFile: ICONS_SOURCE_FILE,
        sourceLine,
        sourceSection: resolveSection(sourceLine),
        Component: Component as GameIconEntry['Component'],
      };
    })
    .sort((a, b) => a.displayName.localeCompare(b.displayName, 'zh-Hant'));
}

export const ALL_GAME_ICONS = buildRegistry();

/** Icons.tsx 匯出的 *Icon 總數（含 ThemeIcon） */
export const ICONS_TSX_EXPORT_TOTAL = Object.keys(IconModule).filter(
  (name) => name.endsWith('Icon') && typeof IconModule[name as keyof typeof IconModule] === 'function',
).length;

/**
 * 圖示庫收錄範圍說明：
 * - 每一項都是 Icons.tsx 內嵌 <svg> React 元件，非 emoji / PNG / Canvas
 * - 自動收錄所有 *Icon 匯出，僅排除 ThemeIcon（emoji 字串 → SVG 的路由器）
 */
export const ICON_LIBRARY_SCOPE = {
  sourceFile: 'src/components/ui/Icons.tsx',
  format: 'svg' as const,
  excluded: ['ThemeIcon'] as const,
  totalInRegistry: ALL_GAME_ICONS.length,
  totalInSource: ICONS_TSX_EXPORT_TOTAL,
};

export function getIconById(id: string): GameIconEntry | undefined {
  return ALL_GAME_ICONS.find((icon) => icon.id === id);
}

export function filterGameIcons(opts: {
  search?: string;
  category?: IconCategory | 'all';
  sourceFile?: string | 'all';
}): GameIconEntry[] {
  const term = opts.search?.trim().toLowerCase() ?? '';
  return ALL_GAME_ICONS.filter((icon) => {
    if (opts.category && opts.category !== 'all' && icon.category !== opts.category) return false;
    if (opts.sourceFile && opts.sourceFile !== 'all' && icon.sourceFile !== opts.sourceFile) return false;
    if (!term) return true;
    return (
      icon.displayName.toLowerCase().includes(term) ||
      icon.exportName.toLowerCase().includes(term) ||
      icon.sourceFile.toLowerCase().includes(term) ||
      (icon.sourceSection?.includes(term) ?? false) ||
      ICON_CATEGORY_LABELS[icon.category].includes(term)
    );
  });
}
