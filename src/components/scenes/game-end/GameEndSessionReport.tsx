/**
 * 結算畫面共用區塊：本局數據
 *
 * 只負責「本局數據」這一段：SegHead + 摘要數值格，後面接各場景自己的統計與戰役面板。
 * 成就、挑戰、回放各自是獨立區段，由場景依序組合。
 */

import type React from 'react';
import { useTranslation } from '@/i18n';
import { useAchievementStore } from '@/store/achievementStore';
import { formatPlayTime } from '@/types/gameEndReport';
import { Deck, Dot, SegHead } from '@/components/hl';
import { GameEndStatGrid, type GameEndStatItem } from './GameEndStatGrid';

interface GameEndSessionReportProps {
  /** 勝利／失敗色調，只用來標記資料狀態 */
  variant?: 'success' | 'danger';
  /** 場景自有的統計列與戰役面板，接在摘要下方 */
  children?: React.ReactNode;
}

export function GameEndSessionReport({
  variant = 'success',
  children,
}: GameEndSessionReportProps) {
  const { t } = useTranslation();
  const g = t.gameEnd;
  const report = useAchievementStore((s) => s.lastGameEndReport);

  const waveLabel = report
    ? report.endless
      ? g.waveEndless.replace('{wave}', String(report.wave))
      : report.maxWaves > 0
        ? g.waveOf.replace('{wave}', String(report.wave)).replace('{max}', String(report.maxWaves))
        : g.waveOnly.replace('{wave}', String(report.wave))
    : '';

  const summaryItems: GameEndStatItem[] = report
    ? [
        { key: 'wave', label: g.waveProgress, value: waveLabel },
        { key: 'time', label: g.playTime, value: formatPlayTime(report.playTimeSeconds) },
        { key: 'perfect', label: g.perfectWaves, value: report.perfectWaves },
        { key: 'damage', label: g.damageTaken, value: report.damageTaken },
        {
          key: 'kills',
          label: g.enemiesKilled,
          value: report.enemiesKilled,
        },
        {
          key: 'towers',
          label: g.towersBuiltSold,
          value: `${report.towersPlaced} / ${report.towersSold}`,
        },
      ]
    : [];

  return (
    <section className="flex flex-col gap-3">
      <SegHead
        label="run data"
        right={<Dot tone={variant === 'success' ? 'vital' : 'alarm'} />}
      />

      {report && (
        <Deck className="p-4 sm:p-5">
          <GameEndStatGrid items={summaryItems} className="lg:grid-cols-6" />
        </Deck>
      )}

      {children}
    </section>
  );
}
