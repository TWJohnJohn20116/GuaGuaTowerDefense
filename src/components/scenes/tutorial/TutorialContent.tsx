/**
 * 模組教學內容 — HARDLINE 規格文件版
 */
import { useTranslation } from '@/i18n';
import { Btn } from '@/components/hl';
import {
  buildModIntroSteps,
  buildModTowerGuide,
  buildModEnemyGuide,
  buildModMapGuide,
} from './TutorialPageData';
import {
  StepIndicator,
  ModStepCard,
  SpecCell,
  SpecGrid,
  SpecNote,
  SpecRow,
  SpecSection,
} from './TutorialPageComponents';

export const ModIntroContent = ({ modStep, setModStep }: { modStep: number; setModStep: (step: number) => void }) => {
  const { t } = useTranslation();
  const steps = buildModIntroSteps(t);
  const current = steps[modStep];
  return (
    <div className="space-y-5">
      <SpecSection
        label={`${String(modStep + 1).padStart(2, '0')} / ${String(steps.length).padStart(2, '0')}`}
        right={<StepIndicator current={modStep} total={steps.length} onSelect={setModStep} />}
      >
        <h2 className="hl-title">{current.title}</h2>
        <p className="hl-sub mt-1.5">{current.description}</p>

        <div className="mt-3">
          <SpecNote label={t.tutorial.hintLabel} tone="caution">
            {current.tip}
          </SpecNote>
        </div>

        <div className="mt-4 border-t border-[var(--hl-line)]">
          {steps.map((step, i) => (
            <button key={step.title} type="button" onClick={() => setModStep(i)} className="block w-full text-left">
              <div className={i === modStep ? 'bg-[var(--hl-deck-2)]' : ''}>
                <SpecRow
                  index={i + 1}
                  title={step.title}
                  right={i === modStep ? <span className="h-1.5 w-1.5 bg-[var(--hl-signal)]" /> : undefined}
                />
              </div>
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          <Btn variant="line" size="md" onClick={() => setModStep(Math.max(0, modStep - 1))} disabled={modStep === 0}>
            {t.tutorial.prevStep}
          </Btn>
          <Btn
            variant="line"
            size="md"
            onClick={() => setModStep(Math.min(steps.length - 1, modStep + 1))}
            disabled={modStep === steps.length - 1}
          >
            {t.tutorial.nextStep}
          </Btn>
        </div>
      </SpecSection>

      <SpecSection label={t.tutorial.modTabs.intro}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { title: t.tutorial.modContent.towerCard, desc: t.tutorial.modContent.towerCardDesc },
            { title: t.tutorial.modContent.enemyCard, desc: t.tutorial.modContent.enemyCardDesc },
            { title: t.tutorial.modContent.mapCard, desc: t.tutorial.modContent.mapCardDesc },
            { title: t.tutorial.modContent.themeCard, desc: t.tutorial.modContent.themeCardDesc },
          ].map((card) => (
            <div key={card.title} className="border border-[var(--hl-line)] bg-[var(--hl-deck)] p-3">
              <div className="hl-label truncate">{card.title}</div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--hl-ink-2)]">{card.desc}</p>
            </div>
          ))}
        </div>
      </SpecSection>
    </div>
  );
};

export const ModTowerContent = () => {
  const { t } = useTranslation();
  const guide = buildModTowerGuide(t);
  const m = t.tutorial.modContent;
  return (
    <div className="space-y-5">
      <SpecSection label={guide.title}>
        <p className="hl-sub">{m.towerSubtitle}</p>
      </SpecSection>

      <SpecSection label={m.towerCard}>
        <div className="border-t border-[var(--hl-line)]">
          {guide.steps.map((step, index) => (
            <ModStepCard key={step.title} step={step} index={index} />
          ))}
        </div>
      </SpecSection>

      <SpecSection label={guide.example.name}>
        <SpecGrid cols={4}>
          <SpecCell label={m.towerDamage} value={guide.example.stats.damage} tone="alarm" />
          <SpecCell label={m.towerRange} value={guide.example.stats.range} tone="reach" />
          <SpecCell label={m.towerFireRate} value={`${guide.example.stats.fireRate}x`} tone="vital" />
          <SpecCell label={m.towerCost} value={`$${guide.example.stats.cost}`} tone="caution" />
        </SpecGrid>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {guide.example.effects.map((effect) => (
            <span key={effect} className="border border-[var(--hl-line)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--hl-ink-2)]">
              {effect}
            </span>
          ))}
        </div>
      </SpecSection>
    </div>
  );
};

export const ModEnemyContent = () => {
  const { t } = useTranslation();
  const guide = buildModEnemyGuide(t);
  const m = t.tutorial.modContent;
  return (
    <div className="space-y-5">
      <SpecSection label={guide.title}>
        <p className="hl-sub">{m.enemySubtitle}</p>
      </SpecSection>

      <SpecSection label={m.enemyCard}>
        <div className="border-t border-[var(--hl-line)]">
          {guide.steps.map((step, index) => (
            <ModStepCard key={step.title} step={step} index={index} />
          ))}
        </div>
      </SpecSection>

      <SpecSection label={guide.example.name}>
        <SpecGrid cols={3}>
          <SpecCell label={m.enemyHealth} value={guide.example.stats.health} tone="alarm" />
          <SpecCell label={m.enemySpeed} value={`${guide.example.stats.speed}x`} tone="reach" />
          <SpecCell label={m.enemyReward} value={`$${guide.example.stats.reward}`} tone="caution" />
        </SpecGrid>
        <div className="mt-2.5">
          <SpecNote label={m.specialAbilityLabel} tone="reach">
            {guide.example.ability}
          </SpecNote>
        </div>
      </SpecSection>
    </div>
  );
};

export const ModMapContent = () => {
  const { t } = useTranslation();
  const guide = buildModMapGuide(t);
  const m = t.tutorial.modContent;
  return (
    <div className="space-y-5">
      <SpecSection label={guide.title}>
        <p className="hl-sub">{m.mapSubtitle}</p>
      </SpecSection>

      <SpecSection label={m.mapCard}>
        <div className="border-t border-[var(--hl-line)]">
          {guide.steps.map((step, index) => (
            <ModStepCard key={step.title} step={step} index={index} />
          ))}
        </div>
      </SpecSection>

      <SpecSection label={m.mapEditorTitle}>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {[
            { label: m.mapStartLabel, desc: m.mapStartDesc, color: 'var(--hl-vital)' },
            { label: m.mapPathLabel, desc: m.mapPathDesc, color: 'var(--hl-caution)' },
            { label: m.mapEndLabel, desc: m.mapEndDesc, color: 'var(--hl-alarm)' },
          ].map((cell) => (
            <div key={cell.label} className="border border-[var(--hl-line)] bg-[var(--hl-deck)] p-3">
              <div className="mb-2 flex items-center gap-2">
                <span className="h-2.5 w-2.5 border border-[var(--hl-line-strong)]" style={{ backgroundColor: cell.color }} />
                <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--hl-ink-2)]">{cell.label}</span>
              </div>
              <p className="text-[11px] leading-relaxed text-[var(--hl-ink-3)]">{cell.desc}</p>
            </div>
          ))}
        </div>
      </SpecSection>
    </div>
  );
};

export const ModExportContent = () => {
  const { t } = useTranslation();
  const m = t.tutorial.modContent;
  return (
    <div className="space-y-5">
      <SpecSection label={m.exportTitle}>
        <p className="hl-sub">{m.exportSubtitle}</p>
      </SpecSection>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SpecSection label={m.exportLabel}>
          <div className="border-t border-[var(--hl-line)]">
            {[m.exportStep1, m.exportStep2, m.exportStep3, m.exportStep4].map((step, i) => (
              <SpecRow key={i} index={i + 1} title={step} />
            ))}
          </div>
        </SpecSection>

        <SpecSection label={m.importLabel}>
          <div className="border-t border-[var(--hl-line)]">
            {[m.importStep1, m.importStep2, m.importStep3, m.importStep4].map((step, i) => (
              <SpecRow key={i} index={i + 1} title={step} />
            ))}
          </div>
        </SpecSection>
      </div>

      <SpecSection label={m.noteTitle}>
        <div className="space-y-1.5">
          {[m.noteItem1, m.noteItem2, m.noteItem3].map((item, i) => (
            <SpecNote key={i} label={`0${i + 1}`} tone="caution">
              {item}
            </SpecNote>
          ))}
        </div>
      </SpecSection>
    </div>
  );
};
