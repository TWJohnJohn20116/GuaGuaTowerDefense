import { ThemeIcon } from '@/components/ui/Icons';
import { CheckIcon, ChevronRightIcon, ChevronLeftIcon, LightbulbIcon, GamepadIcon } from '@/components/ui/Icons';
import { Btn, Meter, Segments } from '@/components/hl';
import { useTranslation } from '@/i18n';
import { SpecNote } from './TutorialPageComponents';
import type { TutorialStep, TutorialCategory } from './TutorialData';
unction getActionLabel(
  action: string,
  actions: Record<string, string>,
): string {
  return actions[action] ?? action;
}

/** 章節內容（HARDLINE：標題 + 內文 + 註記 + 上一／下一） */
export const TutorialContent = ({
  step,
  onNext,
  onPrev,
  canNext,
  canPrev,
  currentIndex,
  totalSteps,
}: {
  step: TutorialStep;
  onNext: () => void;
  onPrev: () => void;
  canNext: boolean;
  canPrev: boolean;
  currentIndex: number;
  totalSteps: number;
}) => {
  const { t } = useTranslation();
  const ui = t.tutorial.ui;

  return (
    <div className="border border-[var(--hl-line)] bg-[var(--hl-deck)] p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-[var(--hl-line)] text-[var(--hl-ink-2)]">
          <ThemeIcon icon={step.icon || ''} className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 className="hl-title">{step.title}</h2>
          <p className="mt-0.5 font-mono text-[10px] tabular-nums text-[var(--hl-ink-4)]">
            {ui.stepLabel.replace('{current}', String(currentIndex + 1)).replace('{total}', String(totalSteps))}
          </p>
        </div>
      </div>

      <p className="mt-3 text-[12px] leading-relaxed text-[var(--hl-ink-2)]">{step.description}</p>

      {step.tip && (
        <div className="mt-3">
          <SpecNote label={<span className="flex items-center gap-1"><LightbulbIcon className="h-2.5 w-2.5" />{t.tutorial.hintLabel}</span>} tone="caution">
            {step.tip}
          </SpecNote>
        </div>
      )}

      {step.action && (
        <div className="mt-3">
          <SpecNote label={<span className="flex items-center gap-1"><GamepadIcon className="h-2.5 w-2.5" />{ui.actionPrefix}</span>} tone="reach">
            {getActionLabel(step.action, ui.actions)}
          </SpecNote>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-[var(--hl-line)] pt-3">
        <Btn variant="line" size="sm" onClick={onPrev} disabled={!canPrev} icon={<ChevronLeftIcon className="h-3 w-3" />}>
          {ui.prevStep}
        </Btn>
        <Segments total={totalSteps} filled={currentIndex + 1} tone="signal" size="sm" />
        <Btn
          variant={canNext ? 'line' : 'signal'}
          size="sm"
          onClick={onNext}
          icon={<ChevronRightIcon className="h-3 w-3" />}
        >
          {canNext ? ui.nextStep : ui.complete}
        </Btn>
      </div>
    </div>
  );
};
