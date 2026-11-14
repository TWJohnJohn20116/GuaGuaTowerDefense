/**
 * 天賦樹 - 右欄節點詳情（Console 右側 336–376px，不再是浮動彈窗）
 */
import { useTranslation } from '@/i18n';
import {
  CheckIcon, LockIcon, UpArrowIcon, StarIcon, CoinIcon, RedoIcon, CrossIcon,
} from '@/components/ui/Icons';
import type { TalentNode as TalentNodeType } from '@/store/talentStore';
import { TALENT_NODES, getTalentUpgradeCost, meetsTalentRequirements } from '@/store/talentStore';
import { Deck, SegHead, Segments, Btn, Num } from '@/components/hl';
import { CATEGORY_STYLES, getCategoryIcon, getCategoryLabel } from './talentLayout';

const nodeNameById = new Map<string, string>(TALENT_NODES.map((n) => [n.id, n.name]));

export interface TalentDetailPanelProps {
  node: TalentNodeType | null;
  ranks: Record<string, number>;
  canUpgrade: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  onRefund: () => void;
}

export function TalentDetailPanel({
  node, ranks, canUpgrade, onClose, onUpgrade, onRefund,
}: TalentDetailPanelProps) {
  const { t } = useTranslation();
  if (!node) return null;

  const rank = ranks[node.id] ?? 0;
  const maxed = rank >= node.maxRank;
  const meetsReq = meetsTalentRequirements(ranks, node.id);
  const isKeystone = node.maxRank === 1;
  const style = CATEGORY_STYLES[node.category];
  const cost = getTalentUpgradeCost(node.id, rank + 1) ?? 0;
  const refundCost = rank > 0 ? getTalentUpgradeCost(node.id, rank) : null;
  const reqText = node.requires && node.requires.length > 0
    ? node.requires.map((r) => `${nodeNameById.get(r.id) ?? r.id} LV.${r.rank}`).join(' · ')
    : null;

  return (
    <div className="flex h-full flex-col gap-3.5">
      {/* 標頭 */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-[var(--hl-line-strong)] text-[var(--hl-ink-2)]">
            {getCategoryIcon(node.category, 'h-4 w-4')}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={`font-mono text-[10px] uppercase tracking-[0.08em] ${style.color}`}>
                {getCategoryLabel(node.category, t)}
              </span>
              {isKeystone && (
                <span className="flex items-center gap-1 border border-[var(--hl-line-strong)] px-1 font-mono text-[9px] text-[var(--hl-caution)]">
                  <StarIcon className="h-2 w-2" /> KEYSTONE
                </span>
              )}
              {maxed && !isKeystone && (
                <span className="border border-[var(--hl-signal-edge)] px-1 font-mono text-[9px] text-[var(--hl-signal)]">
                  MAX
                </span>
              )}
            </div>
            <h2 className="mt-1 truncate text-[17px] font-semibold leading-tight tracking-[-0.01em] text-[var(--hl-ink)]">
              {node.name}
            </h2>
          </div>
        </div>
        <Btn size="sm" variant="ghost" onClick={onClose} aria-label={t.talent.closeLabel}>
          <CrossIcon className="h-3.5 w-3.5" />
        </Btn>
      </div>

      {/* 等級進度 */}
      <div className="flex flex-col gap-1.5">
        <SegHead
          label={t.talent.nodeUpgradeCost}
          right={<Num value={`${rank}/${node.maxRank}`} size="sm" tone={maxed ? 'signal' : 'ink'} />}
        />
        <Segments total={node.maxRank} filled={rank} tone={maxed ? 'signal' : 'caution'} />
      </div>

      {/* 描述 */}
      <p className="hl-sub">{node.description}</p>

      {/* 前置需求 */}
      {reqText && (
        <Deck tone="sunken" className="flex items-start gap-2 px-2.5 py-2">
          <LockIcon
            className={[
              'mt-0.5 h-3 w-3 shrink-0',
              meetsReq ? 'text-[var(--hl-ink-4)]' : 'text-[var(--hl-alarm)]',
            ].join(' ')}
          />
          <div className="min-w-0">
            <div className="hl-label">{t.talent.nodeRequirement}</div>
            <div
              className={[
                'mt-1 font-mono text-[10px]',
                meetsReq ? 'text-[var(--hl-ink-2)]' : 'text-[var(--hl-alarm)]',
              ].join(' ')}
            >
              {reqText}
            </div>
          </div>
          {meetsReq && <CheckIcon className="ml-auto mt-0.5 h-3 w-3 shrink-0 text-[var(--hl-vital)]" />}
        </Deck>
      )}

      {/* 底部操作 */}
      <div className="mt-auto flex flex-col gap-2 border-t border-[var(--hl-line)] pt-3">
        {maxed ? (
          <div className="flex items-center justify-center gap-2 border border-[var(--hl-signal-edge)] py-2.5 text-[var(--hl-signal)]">
            <CheckIcon className="h-3.5 w-3.5" />
            <span className="hl-label text-[var(--hl-signal)]">{t.talent.nodeMaxLevel}</span>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="hl-label">{t.talent.nodeUpgradeCost}</span>
              <span className="flex items-center gap-1.5">
                <CoinIcon className="h-3 w-3 text-[var(--hl-signal)]" />
                <Num value={String(cost)} unit={t.talent.pointUnit} tone="signal" />
              </span>
            </div>
            <Btn
              variant={canUpgrade ? 'signal' : 'line'}
              size="md"
              block
              disabled={!canUpgrade}
              icon={<UpArrowIcon className="h-3.5 w-3.5" />}
              onClick={onUpgrade}
            >
              {meetsReq
                ? (canUpgrade ? t.talent.nodeUpgrade : t.talent.nodeInsufficient)
                : t.talent.nodeNotUnlocked}
            </Btn>
          </>
        )}

        {rank > 0 && refundCost != null && (
          <Btn
            variant="line"
            size="sm"
            block
            icon={<RedoIcon className="h-3 w-3" />}
            onClick={onRefund}
            title={t.talent.nodeRightClickRefund}
          >
            {t.talent.nodeRefundRank.replace('{cost}', String(refundCost))}
          </Btn>
        )}
      </div>
    </div>
  );
}

export default TalentDetailPanel;
