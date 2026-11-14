/**
 * 天賦樹 · HARDLINE Console
 *
 * TopBar 52px → 左軌 212px（分類 + 重置）＋ 畫布主區 ＋ 右側詳情 336–376px。
 * 節點仍是遊戲內容：可點、可拖曳、有連線與鎖定狀態；天賦點數與升級邏輯完全不動。
 */

import { useMemo, useState, useEffect, useCallback, type WheelEvent } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/i18n';
import { useGameStore } from '@/store/gameStore';
import { isTalentTypingTarget, resolveTalentEscape } from '@/data/talentEscape';
import {
  TALENT_NODES,
  computeTalentModifiers,
  useTalentStore,
  type TalentCategory,
  type TalentNode as TalentNodeType,
} from '@/store/talentStore';
import { TreeIcon } from '@/components/ui/Icons';
import { SceneShell } from '@/components/ui/SceneShell';
import { Btn, Deck, Rail, RailItem, SegHead, TopBar } from '@/components/hl';
import { TalentConnections } from './talent/TalentConnections';
import { TalentNode } from './talent/TalentNode';
import { TalentDetailPanel } from './talent/TalentDetailPanel';
import { ResetConfirmModal } from './talent/ResetConfirmModal';
import { TalentHeaderStats } from './talent/TalentHeaderStats';
import { TalentToolbar } from './talent/TalentToolbar';
import { TalentCanvasBackground } from './talent/TalentCanvasBackground';
import { TalentZoomControls } from './talent/TalentZoomControls';
import { TalentModifiersPanel } from './talent/TalentModifiersPanel';
import { CATEGORY_LIST, getCategoryLabel, getCategoryIcon } from './talent/talentLayout';

export default function TalentTree() {
  const { t } = useTranslation();
  const talentPoints = useTalentStore((s) => s.talentPoints);
  const totalEarnedPoints = useTalentStore((s) => s.totalEarnedPoints);
  const totalSpentPoints = useTalentStore((s) => s.totalSpentPoints);
  const ranks = useTalentStore((s) => s.ranks);
  const canUpgradeTalent = useTalentStore((s) => s.canUpgradeTalent);
  const upgradeTalent = useTalentStore((s) => s.upgradeTalent);
  const refundOneRank = useTalentStore((s) => s.refundOneRank);
  const resetTalents = useTalentStore((s) => s.resetTalents);
  const setScene = useGameStore((s) => s.setScene);

  const [selectedNode, setSelectedNode] = useState<TalentNodeType | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetViewKey, setResetViewKey] = useState(0);
  const [focusCategory, setFocusCategory] = useState<TalentCategory | 'all'>('all');

  const totalRank = useMemo(
    () => TALENT_NODES.reduce((sum, n) => sum + (ranks[n.id] ?? 0), 0),
    [ranks],
  );

  const modifiers = useMemo(() => computeTalentModifiers(ranks), [ranks]);

  const categoryCounts = useMemo(() => {
    const counts: Record<TalentCategory, { invested: number; total: number }> = {
      economy: { invested: 0, total: 0 },
      offense: { invested: 0, total: 0 },
      defense: { invested: 0, total: 0 },
      utility: { invested: 0, total: 0 },
    };
    for (const node of TALENT_NODES) {
      counts[node.category].total += node.maxRank;
      counts[node.category].invested += ranks[node.id] ?? 0;
    }
    return counts;
  }, [ranks]);

  const handleWheel = useCallback((e: WheelEvent) => {
    setScale((prev) => {
      const delta = e.deltaY * -0.001;
      return Math.min(Math.max(0.3, prev + delta), 2);
    });
  }, []);

  const handleConfirmReset = useCallback(() => {
    resetTalents();
    setShowResetModal(false);
    setSelectedNode(null);
  }, [resetTalents]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const action = resolveTalentEscape({
        key: e.key,
        inTextField: isTalentTypingTarget(e.target),
        hasResetModal: showResetModal,
        hasDetail: Boolean(selectedNode),
      });
      if (action === 'ignore') return;
      e.preventDefault();
      if (action === 'close_detail') {
        setSelectedNode(null);
        return;
      }
      setScene('mainMenu');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode, showResetModal, setScene]);

  const selectedNodeLive = selectedNode
    ? TALENT_NODES.find((n) => n.id === selectedNode.id) ?? null
    : null;

  return (
    <SceneShell scrollable={false}>
      <div className="flex h-full w-full flex-col">
        <TopBar
          title={t.talent.system}
          meta={t.mainMenu.talentTree}
          back={{ to: 'mainMenu' }}
          glyph={<TreeIcon className="h-4 w-4" />}
          right={<TalentHeaderStats
            talentPoints={talentPoints}
            totalSpentPoints={totalSpentPoints}
            totalEarnedPoints={totalEarnedPoints}
          />}
        />

        <div className="flex min-h-0 flex-1">
          <Rail
            label={t.talent.categoryProgress}
            foot={
              <Btn
                variant="line"
                size="sm"
                block
                disabled={totalRank <= 0}
                onClick={() => setShowResetModal(true)}
              >
                {t.talent.resetAll}
              </Btn>
            }
          >
            <RailItem
              label={t.talent.currentModifiers}
              active={focusCategory === 'all'}
              onClick={() => setFocusCategory('all')}
              right={<span className="font-mono text-[10px] tabular-nums text-[var(--arc-ink-3)]">
                {totalRank}
              </span>}
            />

            <div className="px-3 pb-1 pt-4">
              <SegHead label={t.talent.system} />
            </div>

            {CATEGORY_LIST.map((category, i) => {
              const info = categoryCounts[category];
              return (
                <RailItem
                  key={category}
                  index={i + 1}
                  label={getCategoryLabel(category, t)}
                  active={focusCategory === category}
                  onClick={() => setFocusCategory(category)}
                  right={
                    <span className="flex items-center gap-1.5">
                      <span className="text-[var(--arc-ink-4)]">
                        {getCategoryIcon(category, 'h-3 w-3')}
                      </span>
                      <span className="font-mono text-[10px] tabular-nums text-[var(--arc-ink-3)]">
                        {info.invested}/{info.total}
                      </span>
                    </span>
                  }
                />
              );
            })}
          </Rail>

          <main className="flex min-w-0 flex-1 flex-col bg-[var(--arc-void)]">
            <TalentToolbar totalRank={totalRank} />

            <div
              className="relative min-h-0 flex-1 overflow-hidden bg-[var(--arc-void-2)]"
              onWheel={handleWheel}
              onClick={() => { if (selectedNode) setSelectedNode(null); }}
            >
              <TalentCanvasBackground />

              <motion.div
                key={resetViewKey}
                drag
                onClick={(e) => {
                  if (e.target === e.currentTarget) setSelectedNode(null);
                }}
                dragConstraints={{ top: -2000, bottom: 2000, left: -3000, right: 3000 }}
                dragElastic={0.1}
                dragMomentum={false}
                className="absolute inset-0 origin-center cursor-grab active:cursor-grabbing"
                style={{ width: '100%', height: '100%' }}
                animate={{ scale }}
                transition={{ type: 'spring', bounce: 0, duration: 0.2 }}
              >
                <div className="absolute left-1/2 top-1/2 h-0 w-0">
                  <svg className="pointer-events-none absolute overflow-visible" style={{ left: 0, top: 0 }}>
                    <TalentConnections ranks={ranks} />
                  </svg>

                  {TALENT_NODES.map((node) => (
                    <TalentNode
                      key={node.id}
                      node={node}
                      rank={ranks[node.id] ?? 0}
                      ranks={ranks}
                      isSelected={selectedNodeLive?.id === node.id}
                      canUpgrade={canUpgradeTalent(node.id)}
                      hoveredNodeId={hoveredNodeId}
                      dimmed={focusCategory !== 'all' && node.category !== focusCategory}
                      onSelect={() => setSelectedNode(node)}
                      onUpgrade={() => upgradeTalent(node.id)}
                      onRefund={() => refundOneRank(node.id)}
                      onHover={setHoveredNodeId}
                    />
                  ))}
                </div>
              </motion.div>

              <TalentZoomControls
                scale={scale}
                onIncrease={() => setScale((s) => Math.min(2, s + 0.1))}
                onDecrease={() => setScale((s) => Math.max(0.3, s - 0.1))}
                onReset={() => setScale(1)}
                onCenter={() => { setScale(1); setResetViewKey((k) => k + 1); }}
              />
            </div>
          </main>

          <Deck as="aside" className="flex w-[336px] shrink-0 flex-col overflow-y-auto arc-panel--flat p-4 xl:w-[376px]">
            {selectedNodeLive ? (
              <TalentDetailPanel
                node={selectedNodeLive}
                ranks={ranks}
                canUpgrade={canUpgradeTalent(selectedNodeLive.id)}
                onClose={() => setSelectedNode(null)}
                onUpgrade={() => upgradeTalent(selectedNodeLive.id)}
                onRefund={() => refundOneRank(selectedNodeLive.id)}
              />
            ) : (
              <TalentModifiersPanel modifiers={modifiers} />
            )}
          </Deck>
        </div>
      </div>

      <ResetConfirmModal
        open={showResetModal}
        totalSpentPoints={totalSpentPoints}
        onConfirm={handleConfirmReset}
        onCancel={() => setShowResetModal(false)}
      />
    </SceneShell>
  );
}
