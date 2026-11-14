// 天賦樹 · 右欄加成面板（可收合，Deck 不開切角）
import { useState } from 'react';
import { useTranslation } from '@/i18n';
import { ChevronDownIcon } from '@/components/ui/Icons';
import type { TalentModifiers } from '@/store/talentStore';
import { Deck } from '@/components/hl';
import { TalentStatsPanel } from './TalentStatsPanel';

interface TalentModifiersPanelProps {
  modifiers: TalentModifiers;
}

export function TalentModifiersPanel({ modifiers }: TalentModifiersPanelProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(true);

  return (
    <Deck className="overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2 transition-colors duration-150 hover:bg-[var(--hl-deck-2)]"
      >
        <span className="h-3 w-[2px] bg-[var(--hl-signal)]" />
        <span className="hl-label flex-1 text-left text-[var(--hl-ink)]">
          {t.talent.currentModifiers}
        </span>
        <ChevronDownIcon
          className={[
            'h-3.5 w-3.5 text-[var(--hl-ink-3)] transition-transform duration-150',
            expanded ? 'rotate-180' : '',
          ].join(' ')}
        />
      </button>
      {expanded && (
        <div className="border-t border-[var(--hl-line)] px-3 py-2.5">
          <TalentStatsPanel modifiers={modifiers} />
        </div>
      )}
    </Deck>
  );
}

export default TalentModifiersPanel;
