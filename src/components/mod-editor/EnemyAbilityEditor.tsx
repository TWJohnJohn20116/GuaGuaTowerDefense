/**
 * 敵人能力編輯面板（10 種遊戲內真實機制）
 *
 * HARDLINE：段頭用 SegHead，能力用密集列（1px 線、選中只有左緣 2px 訊號條），
 * 參數欄位標籤 mono 10px 在上、控件在下。
 */
import type { CustomEnemyData } from '@/types/game';
import { CustomNumberInput } from '@/components/ui/CustomNumberInput';
import { XIcon } from '@/components/ui/Icons';
import { useTranslation } from '@/i18n';
import { Btn, SegHead } from '@/components/hl';
import { applyEnemyAbility, getAbilityDef, getEnemyGameAbilities } from './enemyAbilityConfig';

interface EnemyAbilityEditorProps {
  enemy: CustomEnemyData;
  onChange: (enemy: CustomEnemyData) => void;
}

export function EnemyAbilityEditor({ enemy, onChange }: EnemyAbilityEditorProps) {
  const { t } = useTranslation();
  const m = t.modEditorExt;
  const abilities = getEnemyGameAbilities(m);
  const activeDef = getAbilityDef(enemy.ability, m);

  return (
    <div className="flex flex-col gap-3">
      <SegHead
        label={m.eaTitle}
        right={
          enemy.ability ? (
            <Btn
              size="sm"
              variant="line"
              onClick={() => onChange(applyEnemyAbility(enemy, '', m))}
              icon={<XIcon className="h-3.5 w-3.5" />}
            >
              {m.eaClear}
            </Btn>
          ) : undefined
        }
      />

      <div className="grid grid-cols-2 gap-px border border-[var(--hl-line)] bg-[var(--hl-line)]">
        {abilities.map((def) => {
          const active = enemy.ability === def.id;
          return (
            <button
              key={def.id}
              type="button"
              onClick={() => onChange(applyEnemyAbility(enemy, active ? '' : def.id, m))}
              className="relative flex items-start gap-2.5 bg-[var(--hl-void-2)] px-2.5 py-2 text-left transition-colors duration-150 hover:bg-[var(--hl-deck-2)]"
            >
              <span
                className={`absolute left-0 top-0 h-full w-[2px] ${active ? 'bg-[var(--hl-signal)]' : 'bg-transparent'}`}
              />
              <span
                className={`mt-[1px] flex flex-shrink-0 items-center ${active ? 'text-[var(--hl-signal)]' : 'text-[var(--hl-ink-4)]'}`}
              >
                {def.icon}
              </span>
              <span className="min-w-0">
                <span
                  className={`block truncate font-mono text-[10.5px] leading-none ${active ? 'text-[var(--hl-ink)]' : 'text-[var(--hl-ink-2)]'}`}
                >
                  {def.name}
                </span>
                <span className="mt-1.5 block text-[10px] leading-snug text-[var(--hl-ink-3)]">{def.desc}</span>
              </span>
            </button>
          );
        })}
      </div>

      {activeDef && activeDef.fields.length > 0 && (
        <div className="border border-[var(--hl-line)]">
          <div className="border-b border-[var(--hl-line)] bg-[var(--hl-deck-2)] px-2.5 py-2">
            <span className="hl-label text-[var(--hl-ink-2)]">
              {m.eaParams.replace('{name}', activeDef.name)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-px bg-[var(--hl-line)]">
            {activeDef.fields.map((field) => (
              <div key={field.key} className="flex flex-col gap-1.5 bg-[var(--hl-void-2)] px-2.5 py-2">
                <label className="hl-label">{field.label}</label>
                <CustomNumberInput
                  value={Number(enemy[field.key] ?? 0)}
                  onChange={(v) => onChange({ ...enemy, [field.key]: v })}
                  step={field.step}
                  min={field.min}
                  max={field.max}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {enemy.ability === 'spawning' && (
        <div className="grid grid-cols-2 gap-px border border-[var(--hl-line)] bg-[var(--hl-line)]">
          <div className="flex flex-col gap-1.5 bg-[var(--hl-void-2)] px-2.5 py-2">
            <label className="hl-label">{m.eaSpawnCount}</label>
            <CustomNumberInput
              value={enemy.spawnOnDeath?.count ?? 3}
              onChange={(v) => onChange({
                ...enemy,
                spawnOnDeath: { type: enemy.spawnOnDeath?.type ?? 'normal', count: v },
              })}
              min={1}
              max={8}
            />
          </div>
        </div>
      )}
    </div>
  );
}
