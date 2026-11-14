import type { GameRecord } from '@/store/statsStore';
import { StatsOverviewPanel } from './StatsOverviewPanel';
import { StatsRecordsPanel } from './StatsRecordsPanel';

export type StatsTab = 'overview' | 'history' | 'records';

interface Props {
  activeTab: StatsTab;
  onSelectGame?: (game: GameRecord) => void;
}

/** 總覽 / 紀錄分頁內容（歷史由 Statistics 雙欄處理） */
export function StatsContent({ activeTab, onSelectGame }: Props) {
  return (
    <div className="w-full">
      {activeTab === 'overview' && <StatsOverviewPanel onSelectGame={onSelectGame} />}
      {activeTab === 'records' && <StatsRecordsPanel />}
    </div>
  );
}
