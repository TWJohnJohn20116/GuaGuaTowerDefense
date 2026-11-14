/**
 * 紀念堂 · 展開內容（HARDLINE Page：條目下方直接展開，不用右欄卡片）
 */
import { useTranslation } from '@/i18n';
import { SegHead } from '@/components/hl';
import { type MemorialEntry } from '@/data/memorialData';

interface MemorialDetailPanelProps {
  entry: MemorialEntry | null;
}

export function MemorialDetailPanel({ entry }: MemorialDetailPanelProps) {
  const { t } = useTranslation();
  const d = t.memorial.detail;

  if (!entry) return null;

  return (
    <div className="border-b border-[var(--hl-line)] bg-[var(--hl-void-2)] px-3 py-3">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_280px]">
        <div className="min-w-0">
          <SegHead label={d.story} />
          <div className="mt-2 flex flex-col gap-2">
            {entry.story.map((paragraph, idx) => (
              <div key={idx} className="flex gap-2.5">
                <span className="mt-[3px] shrink-0 font-mono text-[9.5px] tabular-nums text-[var(--hl-ink-4)]">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <p className="min-w-0 text-[12.5px] leading-relaxed text-[var(--hl-ink-2)]">
                  {paragraph}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="min-w-0">
          <SegHead label={d.intro} />
          <p className="mt-2 text-[12px] leading-relaxed text-[var(--hl-ink-2)]">{entry.shortBio}</p>

          {entry.lastWords && (
            <div className="mt-3 border-l-2 border-[var(--hl-signal)] pl-2.5">
              <div className="hl-label">{d.lastWords}</div>
              <p className="mt-1 text-[13px] italic leading-relaxed text-[var(--hl-ink)]">
                「{entry.lastWords}」
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MemorialDetailPanel;
