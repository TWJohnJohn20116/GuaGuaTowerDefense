/**
 * 天賦樹 - 節點連線 SVG
 *
 * HARDLINE：只有 1px 線，沒有模糊光暈、沒有流光粒子。
 * 已達前置＝訊號色實線；未達前置＝線色虛線。
 */

import type React from 'react';
import { TALENT_NODES } from '@/store/talentStore';
import { NODE_POSITIONS } from './talentLayout';

const RADIUS = 18;
const NODE_HALF = 44;

function buildPath(startX: number, startY: number, endX: number, endY: number): string {
  if (Math.abs(startY - endY) < 5) {
    return `M ${startX} ${startY} L ${endX} ${endY}`;
  }
  const midX = startX + (endX - startX) / 2;
  const yDir = endY > startY ? 1 : -1;
  const r = Math.min(RADIUS, Math.abs(endY - startY) / 2, Math.abs(midX - startX) / 2);
  return `M ${startX} ${startY} 
          L ${midX - r} ${startY} 
          A ${r} ${r} 0 0 ${yDir > 0 ? 1 : 0} ${midX} ${startY + r * yDir}
          L ${midX} ${endY - r * yDir}
          A ${r} ${r} 0 0 ${yDir > 0 ? 0 : 1} ${midX + r} ${endY}
          L ${endX} ${endY}`;
}

interface TalentConnectionsProps {
  ranks: Record<string, number>;
}

export function TalentConnections({ ranks }: TalentConnectionsProps) {
  const lines: React.ReactNode[] = [];

  TALENT_NODES.forEach((node) => {
    if (!node.requires || node.requires.length === 0) return;
    const targetPos = NODE_POSITIONS[node.id];
    if (!targetPos) return;

    node.requires.forEach((req) => {
      const sourcePos = NODE_POSITIONS[req.id];
      if (!sourcePos) return;

      const isUnlocked = (ranks[req.id] ?? 0) >= req.rank;

      const startX = sourcePos.x + NODE_HALF;
      const startY = sourcePos.y;
      const endX = targetPos.x - NODE_HALF;
      const endY = targetPos.y;

      lines.push(
        <path
          key={`${req.id}-${node.id}`}
          d={buildPath(startX, startY, endX, endY)}
          fill="none"
          strokeWidth={1}
          stroke={isUnlocked ? 'var(--hl-signal-dim)' : 'var(--hl-line-strong)'}
          strokeDasharray={isUnlocked ? undefined : '3 5'}
          opacity={isUnlocked ? 0.9 : 0.75}
        />,
      );
    });
  });

  return <>{lines}</>;
}

export default TalentConnections;
