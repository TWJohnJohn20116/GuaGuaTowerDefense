/**
 * 設定 - 關於 · 音訊 API 鳴謝（HARDLINE）
 */
import { useCallback, useEffect, useState } from 'react';
import { MusicNotesIcon, RefreshIcon, LinkIcon2 } from '@/components/ui/Icons';
import { useTranslation } from '@/i18n';
import { Deck, Btn, Dot } from '@/components/hl';
import { getAudioAttributions } from '@/services/audioCache/audioFetchService';
import type { AudioAttribution } from '@/services/audioCache/audioApiConfig';
import { openDownloadPage } from '@/services/updateService';

export function AudioCreditsPanel() {
  const { t } = useTranslation();
  const ac = t.settings.audioCredits;
  const [items, setItems] = useState<AudioAttribution[]>([]);
  const [loading, setLoading] = useState(true);

  const sourceLabel = (source: AudioAttribution['source']): string => {
    if (source === 'jamendo') return 'Jamendo';
    if (source === 'freesound') return 'Freesound';
    return ac.sourceFile;
  };

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await getAudioAttributions());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return (
    <Deck notch className="flex flex-col">
      <div className="flex items-center gap-2.5 border-b border-[var(--cn-line-soft)] px-3 py-2.5">
        <span className="flex h-6 w-6 items-center justify-center border-[3px] border-[var(--cn-line-soft)] text-[var(--arc-ink-2)]">
          <MusicNotesIcon className="h-3.5 w-3.5" />
        </span>
        <span className="arc-label text-[var(--arc-ink-2)]">{ac.title}</span>
        <span className="h-px flex-1 bg-[var(--arc-line)]" />
        <span className="font-mono text-[10px] tabular-nums text-[var(--arc-ink-4)]">
          {String(items.length).padStart(2, '0')}
        </span>
        <Btn
          size="sm"
          variant="ghost"
          disabled={loading}
          onClick={() => void reload()}
          icon={<RefreshIcon className="h-3.5 w-3.5" />}
        >
          {ac.refresh}
        </Btn>
      </div>

      <p className="border-b border-[var(--cn-line-soft)] px-3 py-2 text-[11px] leading-relaxed text-[var(--arc-ink-3)]">
        {ac.intro}
      </p>

      {loading && (
        <div className="flex items-center gap-2 px-3 py-4">
          <Dot tone="signal" pulse />
          <span className="font-mono text-[10.5px] text-[var(--arc-ink-3)]">{ac.loading}</span>
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="m-3 flex flex-col items-center gap-1.5 border border-dashed border-[var(--cn-line-soft)] px-4 py-6 text-center">
          <span className="arc-label">empty</span>
          <span className="text-[11.5px] text-[var(--arc-ink-2)]">{ac.emptyTitle}</span>
          <span className="text-[10.5px] text-[var(--arc-ink-3)]">{ac.emptyHint}</span>
        </div>
      )}

      {!loading && items.length > 0 && (
        <ul className="flex max-h-80 flex-col gap-0 overflow-y-auto">
          {items.map((item) => (
            <li
              key={`${item.source}-${item.url}`}
              className="flex flex-col gap-1.5 border-b border-[var(--cn-line-soft)] px-3 py-2 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate text-[12px] text-[var(--arc-ink)]">{item.title}</p>
                <p className="truncate text-[10.5px] text-[var(--arc-ink-3)]">
                  {item.author}
                  {' · '}
                  <span className="font-mono text-[var(--arc-ink-2)]">{sourceLabel(item.source)}</span>
                </p>
                <p className="mt-0.5 line-clamp-2 font-mono text-[9.5px] text-[var(--arc-ink-4)]">{item.license}</p>
              </div>
              <Btn
                size="sm"
                variant="line"
                className="shrink-0 self-start sm:self-center"
                onClick={() => void openDownloadPage(item.url)}
                icon={<LinkIcon2 className="h-3 w-3" />}
              >
                {ac.sourceLink}
              </Btn>
            </li>
          ))}
        </ul>
      )}
    </Deck>
  );
}
