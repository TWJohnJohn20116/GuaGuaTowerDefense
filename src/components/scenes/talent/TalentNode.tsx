/**
 * 天賦樹 - 節點
 *
 * HARDLINE：一律方角 + 1px 線。
 *   未解鎖（前置未達）＝線色 + 低透明
 *   已解鎖可點          ＝訊號色邊
 *   已投入              ＝訊號色填充
 * Keystone 只多一個角標記，不做旋轉菱形、不做光暈。
 */

import type React from 'react';
import { useTranslation } from '@/i18n';
import { LockIcon, StarIcon } from '@/components/ui/Icons';
import type { TalentNode as TalentNodeType } from '@/store/talentStore';
import { TALENT_NODES, getTalentUpgradeCost, meetsTalentRequirements } from '@/store/talentStore';
import { Segments } from '@/components/hl';
import { CATEGORY_STYLES, getCategoryIcon, getCategoryLabel, NODE_POSITIONS } from './talentLayout';

const nodeNameById = new Map<string, string>(TALENT_NODES.map((n) => [n.id, n.name]));

const NODE_SIZE = 76;

interface TalentNodeProps {
  node: TalentNodeType;
  rank: number;
  ranks: Record<string, number>;
  isSelected: boolean;
  canUpgrade: boolean;
  hoveredNodeId: string | null;
  /** 左軌聚焦分類：非此分類的節點降低存在感 */
  dimmed?: boolean;
  onSelect: () => void;
  onUpgrade: () => void;
  onRefund: () => void;
  onHover: (id: string | null) => void;
}

export function TalentNode({
  node, rank, ranks, isSelected, canUpgrade, hoveredNodeId, dimmed = false,
  onSelect, onUpgrade, onRefund, onHover,
}: TalentNodeProps) {
  const { t } = useTranslation();
  const pos = NODE_POSITIONS[node.id];
  if (!pos) return null;

  const maxed = rank >= node.maxRank;
  const meetsReq = meetsTalentRequirements(ranks, node.id);
  const invested = rank > 0;
  const isHovered = hoveredNodeId === node.id;
  const isKeystone = node.maxRank === 1;
  const style = CATEGORY_STYLES[node.category];

  const cost = getTalentUpgradeCost(node.id, rank + 1);
  const reqText = node.requires && node.requires.length > 0
    ? node.requires.map((r) => `${nodeNameById.get(r.id) ?? r.id} LV.${r.rank}`).join(' · ')
    : null;

  const locked = !meetsReq;

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (invested) onRefund();
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canUpgrade) onUpgrade();
  };

  const boxState = locked
    ? 'border-[var(--hl-line)] bg-[var(--hl-void-2)] text-[var(--hl-ink-4)] opacity-60'
    : invested
      ? 'border-[var(--hl-signal)] bg-[var(--hl-signal)] text-[var(--hl-signal-ink)]'
      : 'border-[var(--hl-signal)] bg-[var(--hl-deck-2)] text-[var(--hl-signal)] hover:bg-[var(--hl-deck-3)]';

  return (
    <div
      className={[
        'absolute z-10 flex items-center justify-center',
        dimmed ? 'opacity-35' : '',
      ].join(' ')}
      style={{ left: pos.x, top: pos.y, width: 0, height: 0 }}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
      onContextMenu={handleContextMenu}
    >
      <div className="relative" style={{ width: NODE_SIZE, height: NODE_SIZE }}>
        {/* 選中：外框偏移 4px 的 1px 線，不加光暈 */}
        {isSelected && (
          <span className="pointer-events-none absolute -inset-[5px] border border-[var(--hl-signal)]" />
        )}

        <button
          type="button"
          className={[
            'flex h-full w-full flex-col items-center justify-center gap-1 border transition-colors duration-150',
            boxState,
            locked ? 'cursor-not-allowed' : 'cursor-pointer',
          ].join(' ')}
        >
          {locked ? (
            <LockIcon className="h-4 w-4" />
          ) : (
            <>
              {getCategoryIcon(node.category, 'h-5 w-5')}
              <Segments
                total={node.maxRank}
                filled={rank}
                size="sm"
                tone={invested ? 'ink' : 'signal'}
                className={invested ? 'opacity-70' : ''}
              />
            </>
          )}
        </button>

        {/* Keystone 角標 */}
        {isKeystone && (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center border border-[var(--hl-line-strong)] bg-[var(--hl-void)]">
            <StarIcon className="h-2 w-2 text-[var(--hl-caution)]" />
          </span>
        )}

        {/* 可升級提示：方塊，不閃爍 */}
        {canUpgrade && (
          <span className="absolute -left-1.5 -top-1.5 h-2 w-2 bg-[var(--hl-vital)]" />
        )}

        {/* 等級徽章 */}
        <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 border border-[var(--hl-line-strong)] bg-[var(--hl-void)] px-1 font-mono text-[9px] tabular-nums text-[var(--hl-ink-2)]">
          {rank}/{node.maxRank}
        </span>
      </div>

      {/* 名牌 */}
      <div className="pointer-events-none absolute left-1/2 top-[56px] flex w-32 -translate-x-1/2 flex-col items-center text-center">
        <span
          className={[
            'block w-full truncate border px-1.5 py-0.5 font-mono text-[10px] tracking-[0.04em]',
            locked
              ? 'border-transparent text-[var(--hl-ink-4)]'
              : 'border-[var(--hl-line)] bg-[var(--hl-void)] text-[var(--hl-ink)]',
          ].join(' ')}
        >
          {node.name}
        </span>
      </div>

      {/* Hover 資訊：Deck，不開切角（會被撐破） */}
      {isHovered && !isSelected && (
        <div className="pointer-events-none absolute bottom-[56px] left-1/2 z-30 w-60 -translate-x-1/2 border border-[var(--hl-line)] bg-[var(--hl-deck)] px-3 py-2.5">
          <div className="flex items-center gap-1.5">
            <span className={`font-mono text-[10px] uppercase tracking-[0.08em] ${style.color}`}>
              {getCategoryLabel(node.category, t)}
            </span>
            {isKeystone && (
              <span className="border border-[var(--hl-line-strong)] px-1 font-mono text-[9px] text-[var(--hl-caution)]">
                KEYSTONE
              </span>
            )}
            <span className="ml-auto font-mono text-[10px] tabular-nums text-[var(--hl-ink-2)]">
              {rank}/{node.maxRank}
            </span>
          </div>

          <div className="mt-1.5 text-[11px] leading-relaxed text-[var(--hl-ink-2)]">
            {node.description}
          </div>

          {!meetsReq && reqText && (
            <div className="mt-1.5 font-mono text-[10px] text-[var(--hl-alarm)]">
              {t.talent.nodeUnmetReq.replace('{req}', reqText)}
            </div>
          )}
          {meetsReq && cost && !maxed && (
            <div className="mt-1.5 font-mono text-[10px] text-[var(--hl-signal)]">
              {t.talent.nodeNextRank.replace('{cost}', String(cost))}
            </div>
          )}
          <div className="mt-2 border-t border-[var(--hl-line)] pt-1.5 font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--hl-ink-4)]">
            {t.talent.hintClick} · {t.talent.hintRightClick}
          </div>
        </div>
      )}
    </div>
  );
}

export default TalentNode;
