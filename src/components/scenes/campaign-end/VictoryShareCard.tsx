/**
 * 勝利畫面 · 可複製戰績摘要卡
 *
 * 純文字戰報 + 一顆複製鈕。mono、方角、1px 線，沒有內陰影也沒有毛玻璃。
 */
import { useState } from 'react';
import { useTranslation } from '@/i18n';
import { ClipboardIcon, CheckIcon } from '@/components/ui/Icons';
import { getPathDisplayName } from '@/data/gameData/pathData';
import { Btn, Deck } from '@/components/hl';

interface VictoryShareCardProps {
  mapId: string;
  score: number;
  stars: number;
  grade: string;
  wave: number;
  health: number;
  startingHealth: number;
  coinReward: number;
  expGained: number;
  totalKills: number;
  isCampaign: boolean;
}

export function VictoryShareCard({
  mapId,
  score,
  stars,
  grade,
  wave,
  health,
  startingHealth,
  coinReward,
  expGained,
  totalKills,
  isCampaign,
}: VictoryShareCardProps) {
  const { t } = useTranslation();
  const c = t.campaignEnd;
  const [copied, setCopied] = useState(false);
  const mapName = getPathDisplayName(mapId);
  const hpPct = startingHealth > 0 ? Math.round((health / startingHealth) * 100) : 0;

  const text = [
    '【瓜塔防 · 勝利戰報】',
    `地圖：${mapName}`,
    isCampaign ? '模式：戰役' : '模式：標準',
    `評級：${grade} · ${stars}/3 星`,
    `分數：${score.toLocaleString()}`,
    `波次：W${wave} · 剩餘生命 ${hpPct}%`,
    `擊殺：${totalKills.toLocaleString()}`,
    `獎勵：+${coinReward} 金幣 · +${expGained} EXP`,
  ].join('\n');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Deck tone="sunken" className="flex w-full flex-col gap-2.5 p-4">
      <span className="hl-label">{c.shareTitle}</span>
      <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed tabular-nums text-[var(--hl-ink-2)]">
        {text}
      </pre>
      <Btn
        variant="line"
        size="sm"
        block
        icon={
          copied ? (
            <CheckIcon className="h-3.5 w-3.5 text-[var(--hl-vital)]" />
          ) : (
            <ClipboardIcon className="h-3.5 w-3.5" />
          )
        }
        onClick={handleCopy}
      >
        {copied ? c.copied : c.copyReport}
      </Btn>
    </Deck>
  );
}

export default VictoryShareCard;
