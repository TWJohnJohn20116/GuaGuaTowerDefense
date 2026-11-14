/**
 * 商店商品格 · HARDLINE
 *
 * 一格就是一個 Deck：1px 線、方角、hover 只換線色。
 * 價格與持有狀態一律 mono；不畫光暈、不做徑向漸層。
 */

import type React from 'react';
import { TOWER_DATA } from '@/data/gameData';
import type { TowerType } from '@/types/game';
import { PLAYER_SKILLS } from '@/data/playerSkillData';
import type { PlayerSkill } from '@/data/playerSkillData';
import { TOWER_SHOP_PRICES, PLAYER_SKILL_SHOP_PRICES } from '@/store/shopStore';
import { useTranslation } from '@/i18n';
import { getPlayerSkillName } from '@/i18n/playerSkillLabels';
import TowerPreview from '@/components/ui/TowerPreview';
import { CoinIcon, CheckIcon, LockIcon } from '@/components/ui/Icons';
import { Deck, Num } from '@/components/hl';
import { PLAYER_SKILL_ICONS, getTowerName } from './shopData';
import { getTowerRoleLabel } from './shopShopI18n';
import type { ShopSelection } from './shopData';

/* --------------------------------------------------------- 卡片外框 */

function CardShell({
  selected,
  onClick,
  label,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Deck
      active={selected}
      className={[
        'group relative flex h-full min-h-[172px] w-full flex-col overflow-hidden text-left',
        'transition-colors duration-150',
        selected ? '' : 'hover:border-[var(--arc-line-hot)]',
      ].join(' ')}
    >
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        className="absolute inset-0 z-10 cursor-pointer"
      />
      {children}
    </Deck>
  );
}

/* --------------------------------------------------------- 底部狀態 */

interface CardFooterProps {
  unlocked: boolean;
  free: boolean;
  price: number;
  canAfford: boolean;
}

function CardFooter({ unlocked, free, price, canAfford }: CardFooterProps) {
  const { t } = useTranslation();
  if (unlocked) {
    return (
      <span className="flex items-center gap-1.5 text-[var(--arc-vital)]">
        <CheckIcon className="h-3 w-3" />
        <span className="arc-label text-[var(--arc-vital)]">{t.shop.statusUnlocked}</span>
      </span>
    );
  }
  if (free) {
    return <span className="arc-label text-[var(--arc-vital)]">{t.shop.statusFree}</span>;
  }
  return (
    <span className="flex items-center gap-1.5">
      <CoinIcon className={`h-3 w-3 ${canAfford ? 'text-[var(--arc-gold)]' : 'text-[var(--arc-ink-4)]'}`} />
      <Num value={price.toLocaleString()} size="sm" tone={canAfford ? 'signal' : 'caution'} />
    </span>
  );
}

/* ------------------------------------------------------------- 預覽區 */

function PreviewSlot({
  dimmed,
  locked,
  canAfford,
  children,
}: {
  dimmed: boolean;
  locked: boolean;
  canAfford: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex h-24 shrink-0 items-center justify-center overflow-hidden border-b border-[var(--cn-line-soft)] bg-[var(--arc-void-2)]">
      <div className={`relative z-[1] ${dimmed ? 'opacity-40' : ''}`}>{children}</div>
      {locked && (
        <span className="absolute right-2 top-2 z-[2] flex h-5 w-5 items-center justify-center border-[3px] border-[var(--cn-line-soft)] bg-[var(--arc-void)]">
          <LockIcon className={`h-2.5 w-2.5 ${canAfford ? 'text-[var(--arc-caution)]' : 'text-[var(--arc-ink-4)]'}`} />
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------ 塔卡片 */

interface TowerCardProps {
  towerId: TowerType;
  coins: number;
  unlocked: boolean;
  selected: boolean;
  onSelect: () => void;
}

function TowerCard({ towerId, coins, unlocked, selected, onSelect }: TowerCardProps) {
  const { t } = useTranslation();
  const price = TOWER_SHOP_PRICES[towerId];
  const free = price === 0;
  const canAfford = coins >= price;
  const dimmed = !unlocked && !free && !canAfford;
  const name = getTowerName(towerId);

  return (
    <CardShell selected={selected} onClick={onSelect} label={name}>
      <PreviewSlot dimmed={dimmed} locked={!unlocked && !free} canAfford={canAfford}>
        <TowerPreview towerId={towerId} size={56} />
      </PreviewSlot>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-1.5 px-3 py-2.5">
        <div className="min-w-0">
          <span className={`block truncate text-[13px] font-medium leading-tight ${
            dimmed ? 'text-[var(--arc-ink-2)]' : 'text-[var(--arc-ink)]'
          }`}>
            {name}
          </span>
          <span className="mt-1 block truncate font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--arc-ink-3)]">
            {getTowerRoleLabel(t.shop, towerId)}
          </span>
        </div>
        <CardFooter unlocked={unlocked} free={free} price={price} canAfford={canAfford} />
      </div>
    </CardShell>
  );
}

/* ---------------------------------------------------------- 技能卡片 */

interface SkillCardProps {
  skill: PlayerSkill;
  coins: number;
  unlocked: boolean;
  selected: boolean;
  onSelect: () => void;
}

function SkillCard({ skill, coins, unlocked, selected, onSelect }: SkillCardProps) {
  const { t } = useTranslation();
  const tb = t.shop.toolbar;
  const price = PLAYER_SKILL_SHOP_PRICES[skill.id];
  const canAfford = coins >= price;
  const Icon = PLAYER_SKILL_ICONS[skill.effectKey];
  const dimmed = !unlocked && !canAfford;
  const name = getPlayerSkillName(skill, t);

  return (
    <CardShell selected={selected} onClick={onSelect} label={name}>
      <PreviewSlot dimmed={dimmed} locked={!unlocked} canAfford={canAfford}>
        <Icon className="h-10 w-10 text-[var(--arc-ink-2)]" />
      </PreviewSlot>

      <span className="absolute left-2 top-2 z-[2] border-[3px] border-[var(--cn-line-soft)] bg-[var(--arc-void)] px-1 py-0.5 font-mono text-[9px] tabular-nums text-[var(--arc-ink-3)]">
        ⇧{skill.hotkey}
      </span>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-1.5 px-3 py-2.5">
        <div className="min-w-0">
          <span className={`block truncate text-[13px] font-medium leading-tight ${
            dimmed ? 'text-[var(--arc-ink-2)]' : 'text-[var(--arc-ink)]'
          }`}>
            {name}
          </span>
          <span className="mt-1 block truncate font-mono text-[10px] tracking-[0.04em] text-[var(--arc-ink-3)]">
            {tb.skillCooldown} {skill.cooldown / 1000}s · {skill.duration ? `${tb.skillDuration} ${skill.duration / 1000}s` : tb.skillInstant}
          </span>
        </div>
        <CardFooter unlocked={unlocked} free={false} price={price} canAfford={canAfford} />
      </div>
    </CardShell>
  );
}

/* ------------------------------------------------------------ 網格容器 */

interface ShopGridProps {
  tab: 'towers' | 'skills';
  towers: TowerType[];
  coins: number;
  unlockedTowers: TowerType[];
  unlockedSkills: string[];
  selection: ShopSelection | null;
  onSelect: (sel: ShopSelection) => void;
}

export function ShopGrid({
  tab,
  towers,
  coins,
  unlockedTowers,
  unlockedSkills,
  selection,
  onSelect,
}: ShopGridProps) {
  const gridClass = 'grid grid-cols-2 items-stretch gap-2.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';

  if (tab === 'skills') {
    return (
      <div className={gridClass}>
        {PLAYER_SKILLS.map((skill) => (
          <SkillCard
            key={skill.id}
            skill={skill}
            coins={coins}
            unlocked={unlockedSkills.includes(skill.id)}
            selected={selection?.kind === 'skill' && selection.id === skill.id}
            onSelect={() => onSelect({ kind: 'skill', id: skill.id })}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={gridClass}>
      {towers.map((towerId) => {
        if (!TOWER_DATA[towerId]) return null;
        return (
          <TowerCard
            key={towerId}
            towerId={towerId}
            coins={coins}
            unlocked={unlockedTowers.includes(towerId)}
            selected={selection?.kind === 'tower' && selection.id === towerId}
            onSelect={() => onSelect({ kind: 'tower', id: towerId })}
          />
        );
      })}
    </div>
  );
}

export default ShopGrid;
