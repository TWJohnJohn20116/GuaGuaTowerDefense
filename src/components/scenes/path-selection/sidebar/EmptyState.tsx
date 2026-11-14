/**
 * 地圖側欄 · 空狀態（HARDLINE Empty：虛線框 + mono 標籤，無圖示底板）
 */
import { Empty } from '@/components/hl';

interface EmptyStateProps {
  title: string;
  hint?: string;
  /** 舊介面遺留；HARDLINE 不以 emoji／圖示當結構元素 */
  icon?: JSX.Element;
}

export function EmptyState({ title, hint }: EmptyStateProps) {
  return <Empty title={title} hint={hint} className="m-2" />;
}

export default EmptyState;
