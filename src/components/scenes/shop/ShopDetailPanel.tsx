/**
 * 商店詳情（右側常駐欄）· HARDLINE
 *
 * 由上到下：1px 線預覽框 → 名稱／定位 → 描述 → 屬性列 → 底部單顆購買 Btn。
 * 買不起＝Btn variant="line" + disabled，不做彩色玻璃紅。
 */

import { useEffect, useState } from 'react';
import { TOWER_DATA } from '@/data/gameData';
import { PLAYER_SKILL_BY_ID } from '@/data/playerSkillData';
import { TOWER_SHOP_PRICES, PLAYER_SKILL_SHOP_PRICES } from '@/store/shopStore';
import { useTranslation } from '@/i18n';
import { getPlayerSkillName, getPlayerSkillDesc } from '@/i18n/playerSkillLabels';
import TowerPreview from '@/components/ui/TowerPreview';
import {
  CoinIcon, CheckIcon, CartCheckIcon, ShieldIcon, LightningIcon,
} from '@/components/ui/Icons';
import { Deck, SegHead, Field, Btn, Empty, Num } from '@/components/hl';
import {
  PLAYER_SKILL_ICONS, getTowerName, getTowerDesc, getShopUnlockActionLabel,
} from './shopData';
import {
  getTowerRoleLabel, getTowerTraitsI18n, getTowerStatsI18n, getSkillStatsI18n,
} from './shopShopI18n';
import type { ShopSelection } from './shopData';
import { isShopTypingTarget, resolveShopPurchaseKey } from '@/data/shopKeyboardNav';

/* ------------------------------------------------------------ 購買區 */

interface PurchaseActionProps {
  unlocked: boolean;
  price: number;
  coins: number;
  buyLabel: string;
  onPurchase: () => void;
  /** 切換商品時重置確認狀態用 */
  resetKey: string;
}

function PurchaseAction({
  unlocked, price, coins, buyLabel, onPurchase, resetKey,
}: PurchaseActionProps) {
  const { t } = useTranslation();
  const [confirming, setConfirming] = useState(false);
  const free = price === 0;
  const canAfford = coins >= price;
  const shortBy = price - coins;

  useEffect(() => setConfirming(false), [resetKey]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const action = resolveShopPurchaseKey({
        key: e.key,
        inTextField: isShopTypingTarget(e.target),
        unlocked,
        canAfford,
        free,
        confirming,
      });
      if (action === 'ignore') return;
      e.preventDefault();
      if (action === 'start_confirm') {
        setConfirming(true);
        return;
      }
      onPurchase();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [unlocked, canAfford, free, confirming, onPurchase]);

  if (unlocked) {
    return (
      <div className="flex items-center justify-center gap-2 border border-[var(--hl-line)] bg-[var(--hl-deck-2)] py-3 text-[var(--hl-vital)]">
        <CheckIcon className="h-3.5 w-3.5" />
        <span className="hl-label text-[var(--hl-vital)]">{t.shop.priceOwned}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {/* 價格列 */}
      <div className="flex items-center justify-between border-b border-[var(--hl-line)] pb-2.5">
        <span className="hl-label">{t.shop.unlockNeeds}</span>
        {free ? (
          <span className="hl-label text-[var(--hl-vital)]">{t.shop.free}</span>
        ) : (
          <span className="flex items-center gap-1.5">
            <CoinIcon className="h-3.5 w-3.5 text-[var(--hl-signal)]" />
            <Num value={price.toLocaleString()} tone="signal" size="md" />
          </span>
        )}
      </div>

      {/* 金幣缺口：只有字與線 */}
      {!free && !canAfford && (
        <div className="flex items-center justify-between border border-[rgba(255,75,62,0.35)] px-2.5 py-1.5">
          <span className="hl-label text-[var(--hl-alarm)]">{t.shop.coinShort}</span>
          <span className="font-mono text-[11px] tabular-nums text-[var(--hl-alarm)]">
            {t.shop.coinShortBy.replace('{amount}', String(shortBy))}
          </span>
        </div>
      )}

      {confirming ? (
        <div className="flex gap-2">
          <Btn variant="line" size="md" className="flex-1" onClick={() => setConfirming(false)}>
            {t.common.cancel}
          </Btn>
          <Btn variant="signal" size="md" className="flex-1" icon={<CartCheckIcon className="h-3.5 w-3.5" />} onClick={onPurchase}>
            {t.shop.confirmPurchase}
          </Btn>
        </div>
      ) : (
        <Btn
          variant={canAfford || free ? 'signal' : 'line'}
          size="lg"
          block
          disabled={!canAfford && !free}
          icon={free ? <CheckIcon className="h-3.5 w-3.5" /> : <CartCheckIcon className="h-3.5 w-3.5" />}
          onClick={() => (free ? onPurchase() : setConfirming(true))}
        >
          {free ? t.shop.claimFree : buyLabel}
        </Btn>
      )}
    </div>
  );
}

/* -------------------------------------------------------------- 區段 */

function TraitRow({ traits }: { traits: { label: string }[] }) {
  if (traits.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {traits.map((trait) => (
        <span
          key={trait.label}
          className="border border-[var(--hl-line)] px-1.5 py-0.5 font-mono text-[10px] tracking-[0.06em] text-[var(--hl-ink-3)]"
        >
          {trait.label}
        </span>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------ 主面板 */

export interface ShopDetailPanelProps {
  selection: ShopSelection | null;
  coins: number;
  unlockedTowers: string[];
  unlockedSkills: string[];
  onPurchase: (sel: ShopSelection) => void;
}

export function ShopDetailPanel({
  selection,
  coins,
  unlockedTowers,
  unlockedSkills,
  onPurchase,
}: ShopDetailPanelProps) {
  const { t } = useTranslation();
  const s = t.shop;

  if (!selection) {
    return <Empty title={s.detailSelectHint1} hint={s.detailSelectHint2} />;
  }

  /* ===== 塔詳情 ===== */
  if (selection.kind === 'tower') {
    const towerId = selection.id;
    const data = TOWER_DATA[towerId];
    if (!data) return null;
    const unlocked = unlockedTowers.includes(towerId);
    const price = TOWER_SHOP_PRICES[towerId];
    const stats = getTowerStatsI18n(s, data);
    const traits = getTowerTraitsI18n(s, data);

    return (
      <div className="flex h-full flex-col gap-4">
        <Deck tone="sunken" className="relative flex h-44 shrink-0 items-center justify-center overflow-hidden">
          <div className="scale-[1.5]">
            <TowerPreview towerId={towerId} size={72} animate />
          </div>
          <span className="absolute left-2 top-2 hl-label">tower</span>
          {unlocked && (
            <span className="absolute right-2 top-2 flex items-center gap-1 text-[var(--hl-vital)]">
              <CheckIcon className="h-3 w-3" />
              <span className="hl-label text-[var(--hl-vital)]">{s.statusUnlocked}</span>
            </span>
          )}
        </Deck>

        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[17px] font-semibold leading-tight tracking-[-0.01em] text-[var(--hl-ink)]">
              {getTowerName(towerId)}
            </h2>
            <span className="border border-[var(--hl-line)] px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--hl-ink-3)]">
              {getTowerRoleLabel(s, towerId)}
            </span>
          </div>
          <p className="hl-sub">{getTowerDesc(towerId)}</p>
        </div>

        <div className="flex flex-col gap-2">
          <SegHead
            label={s.battleStats}
            right={<ShieldIcon className="h-3.5 w-3.5 text-[var(--hl-ink-4)]" />}
          />
          <div className="flex flex-col">
            {stats.map((stat) => (
              <Field key={stat.label} label={stat.label}>
                <Num value={stat.value} size="md" />
              </Field>
            ))}
          </div>
          <TraitRow traits={traits} />
        </div>

        <div className="mt-auto pt-2">
          <PurchaseAction
            unlocked={unlocked}
            price={price}
            coins={coins}
            buyLabel={getShopUnlockActionLabel('tower', s)}
            onPurchase={() => onPurchase(selection)}
            resetKey={`tower-${towerId}`}
          />
        </div>
      </div>
    );
  }

  /* ===== 技能詳情 ===== */
  const skill = PLAYER_SKILL_BY_ID[selection.id];
  if (!skill) return null;
  const Icon = PLAYER_SKILL_ICONS[skill.effectKey];
  const unlocked = unlockedSkills.includes(skill.id);
  const price = PLAYER_SKILL_SHOP_PRICES[skill.id];
  const stats = getSkillStatsI18n(s, skill);

  return (
    <div className="flex h-full flex-col gap-4">
      <Deck tone="sunken" className="relative flex h-44 shrink-0 items-center justify-center overflow-hidden">
        <Icon className="h-16 w-16 text-[var(--hl-ink-2)]" />
        <span className="absolute left-2 top-2 hl-label">skill</span>
        {unlocked && (
          <span className="absolute right-2 top-2 flex items-center gap-1 text-[var(--hl-vital)]">
            <CheckIcon className="h-3 w-3" />
            <span className="hl-label text-[var(--hl-vital)]">{s.statusUnlocked}</span>
          </span>
        )}
      </Deck>

      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-[17px] font-semibold leading-tight tracking-[-0.01em] text-[var(--hl-ink)]">
            {getPlayerSkillName(skill, t)}
          </h2>
          <span className="border border-[var(--hl-line)] px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--hl-ink-3)]">
            {t.encyclopedia.detailActiveSkillTag}
          </span>
        </div>
        <p className="hl-sub">{getPlayerSkillDesc(skill, t)}</p>
      </div>

      <div className="flex flex-col gap-2">
        <SegHead
          label={s.battleStats}
          right={<LightningIcon className="h-3.5 w-3.5 text-[var(--hl-ink-4)]" />}
        />
        <div className="flex flex-col">
          {stats.map((stat) => (
            <Field key={stat.label} label={stat.label}>
              <Num value={stat.value} size="md" />
            </Field>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-2">
        <PurchaseAction
          unlocked={unlocked}
          price={price}
          coins={coins}
          buyLabel={getShopUnlockActionLabel('skill', s)}
          onPurchase={() => onPurchase(selection)}
          resetKey={`skill-${skill.id}`}
        />
      </div>
    </div>
  );
}

export default ShopDetailPanel;
