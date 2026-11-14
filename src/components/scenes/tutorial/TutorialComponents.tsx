import { ThemeIcon } from '@/components/ui/Icons';
import { CheckIcon, ChevronRightIcon, ChevronLeftIcon, LightbulbIcon, GamepadIcon } from '@/components/ui/Icons';
import { Btn, Meter, Segments } from '@/components/hl';
import { useTranslation } from '@/i18n';
import { SpecNote } from './TutorialPageComponents';
import type { TutorialStep, TutorialCategory } from './TutorialData';

/** 分類選擇列（HARDLINE：1px 邊 + 選中只換線色） */
export const CategoryCard = ({
  category,
  selected,
  onClick,
  progress,
}: {
  category: TutorialCategory;
  selected: boolean;
  onClick: () => void;
  progress: number;
}) => {
  const { t } = useTranslation();
  const ui = t.tutorial.ui;

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'w-full border px-3 py-2.5 text-left transition-colors duration-150',
        selected
          ? 'border-[var(--hl-signal)] bg-[var(--hl-signal-veil)]'
          : 'border-[var(--hl-line)] bg-[var(--hl-deck)] hover:border-[var(--hl-line-hot)]',
      ].join(' ')}
    >
      <div className="flex items-center gap-2.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-[var(--hl-line)] text-[var(--hl-ink-2)]">
          <ThemeIcon icon={category.icon} className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12.5px] font-medium text-[var(--hl-ink)]">{category.name}</span>
          <span className="mt-0.5 block truncate text-[10.5px] text-[var(--hl-ink-3)]">{category.description}</span>
        </span>
        {selected && <CheckIcon className="h-3.5 w-3.5 shrink-0 text-[var(--hl-signal)]" />}
      </div>

      <div className="mt-2">
        <Meter value={progress} max={100} tone="signal" showTrack={false} className="h-1" />
      </div>
      <div className="mt-1 flex items-center justify-between font-mono text-[10px] tabular-nums text-[var(--hl-ink-4)]">
        <span>{ui.chaptersCount.replace('{count}', String(category.steps.length))}</span>
        <span>{ui.progressComplete.replace('{percent}', String(Math.round(progress)))}</span>
      </div>
    </button>
  );
};

/** 章節列 */
export const StepCard = ({
  step,
  index,
  isActive,
  isCompleted,
  onClick,
}: {
  step: TutorialStep;
  index: number;
  isActive: boolean;
  isCompleted: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={[
      'relative flex w-full items-center gap-2.5 border-b border-[var(--hl-line)] px-2.5 py-2 text-left last:border-b-0 transition-colors duration-150',
      isActive ? 'bg-[var(--hl-deck-2)]' : 'hover:bg-[var(--hl-deck-2)]',
    ].join(' ')}
  >
    {isActive && <span className="absolute left-0 top-0 h-full w-[2px] bg-[var(--hl-signal)]" />}
    <span className="w-5 shrink-0 font-mono text-[10px] tabular-nums text-[var(--hl-ink-4)]">
      {String(index + 1).padStart(2, '0')}
    </span>
    <ThemeIcon icon={step.icon || ''} className="h-3.5 w-3.5 shrink-0 text-[var(--hl-ink-3)]" />
    <span className="min-w-0 flex-1">
      <span className={['block truncate text-[12px]', isActive ? 'font-semibold text-[var(--hl-ink)]' : 'text-[var(--hl-ink-2)]'].join(' ')}>
        {step.title}
      </span>
      <span className="mt-0.5 block truncate text-[10.5px] text-[var(--hl-ink-3)]">
        {step.description.slice(0, 50)}…
      </span>
    </span>
    {isCompleted && <CheckIcon className="h-3 w-3 shrink-0 text-[var(--hl-vital)]" />}
  </button>
);

function getActionLabel(
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

/** 進度總覽 */
export const ProgressOverview = ({
  categories,
  progress,
}: {
  categories: TutorialCategory[];
  progress: Record<string, number[]>;
}) => {
  const { t } = useTranslation();
  const ui = t.tutorial.ui;

  const totalSteps = categories.reduce((sum, cat) => sum + cat.steps.length, 0);
  const completedSteps = Object.values(progress).reduce((sum, arr) => sum + arr.length, 0);
  const overallProgress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <div className="border border-[var(--hl-line)] bg-[var(--hl-deck)] p-3">
      <div className="flex items-baseline justify-between">
        <span className="hl-label">{ui.overallProgress}</span>
        <span className="hl-num text-[12px] leading-none text-[var(--hl-signal)]">
          {Math.round(overallProgress)}%
        </span>
      </div>
      <div className="mt-2">
        <Meter value={overallProgress} max={100} tone="signal" className="h-1.5" />
      </div>
      <p className="mt-1.5 font-mono text-[10px] tabular-nums text-[var(--hl-ink-4)]">
        {ui.completedChapters
          .replace('{done}', String(completedSteps))
          .replace('{total}', String(totalSteps))}
      </p>
    </div>
  );
};
