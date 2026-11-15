/**
 * PlayerSkillBar - 玩家主動技能按鈕條
 *
 * 底部指揮帶的一部分：一排 36px 棋盤格按鈕，冷卻用「剩餘秒數 + 底部進度條」表示，
 * 就緒只有 accent 邊框，不發光。與塔格、狀態帶共用 `--bd-*` 色票。
 */

import { useEffect, useState, useMemo } from 'react';
import type { SVGProps } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useShopStore } from '@/store/shopStore';
import { PLAYER_SKILLS } from '@/data/playerSkillData';
import type { PlayerSkill } from '@/data/playerSkillData';
import { LightningIcon, SnowflakeIcon, CoinIcon, SwordsIcon, MeteorIcon, ChainLightningIcon, HealIcon, AegisIcon, WarpIcon, EmpIcon } from '@/components/ui/Icons';
import { useTranslation } from '@/i18n';
import { getPlayerSkillName, getPlayerSkillDesc } from '@/i18n/playerSkillLabels';
import { BD_LABEL, BD_NUM, BD_PANEL } from './hudBoard';

type SkillIconComp = (p: SVGProps<SVGSVGElement> & { className?: string }) => JSX.Element;

const ICON_BY_EFFECT: Record<PlayerSkill['effectKey'], SkillIconComp> = {
  lightning: LightningIcon,
  freeze: SnowflakeIcon,
  cash: CoinIcon,
  inspire: SwordsIcon,
  meteor: MeteorIcon,
  chain: ChainLightningIcon,
  heal: HealIcon,
  aegis: AegisIcon,
  warp: WarpIcon,
  emp: EmpIcon,
};

export function PlayerSkillBar() {
  const { t } = useTranslation();
  const isPlaying = useGameStore((s) => s.isPlaying);
  const isPaused = useGameStore((s) => s.isPaused);
  const isGameOver = useGameStore((s) => s.isGameOver);
  const isVictory = useGameStore((s) => s.isVictory);
  const unlockedSkills = useShopStore((s) => s.unlockedPlayerSkills);

  const visibleSkills = useMemo(
    () => PLAYER_SKILLS.filter((s) => unlockedSkills.includes(s.id)),
    [unlockedSkills],
  );

  if (!isPlaying || isPaused || isGameOver || isVictory) return null;
  if (visibleSkills.length === 0) return null;

  const hotkeys = visibleSkills.map((s) => s.hotkey).sort();
  const hotkeyHint = hotkeys.length === 1 ? `⇧ ${hotkeys[0]}` : `⇧ ${hotkeys[0]}-${hotkeys[hotkeys.length - 1]}`;

  return (
    <div className="flex items-center gap-1">
      <span className={`${BD_LABEL} mr-0.5 hidden xl:inline`}>{t.game.skills}</span>
      {visibleSkills.map((skill) => (
        <SkillButton key={skill.id} skill={skill} />
      ))}
      <span className="ml-1 hidden font-mono text-[9px] tabular-nums text-[var(--bd-ink-4)] xl:inline">
        {hotkeyHint}
      </span>
    </div>
  );
}

interface SkillButtonProps {
  skill: PlayerSkill;
}

function SkillButton({ skill }: SkillButtonProps) {
  const { t } = useTranslation();
  const activatePlayerSkill = useGameStore((s) => s.activatePlayerSkill);
  const playerSkillStates = useGameStore((s) => s.playerSkillStates);
  const [hovered, setHovered] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 100);
    return () => clearInterval(id);
  }, []);

  const state = playerSkillStates[skill.id];
  const now = Date.now();
  const lastUsedTime = state?.lastUsedTime ?? 0;
  const elapsedCooldown = lastUsedTime === 0 ? skill.cooldown : now - lastUsedTime;
  const cooldownRemaining = lastUsedTime === 0 ? 0 : Math.max(0, skill.cooldown - elapsedCooldown);
  const cooldownRatio = lastUsedTime === 0 ? 0 : Math.max(0, Math.min(1, cooldownRemaining / skill.cooldown));
  const ready = cooldownRemaining <= 0;

  const isActive = (state?.activeUntil ?? 0) > now;

  // 避免 React 抱怨 tick 未使用
  void tick;

  const handleClick = () => {
    if (!ready) return;
    activatePlayerSkill(skill.id);
  };

  const IconComp = ICON_BY_EFFECT[skill.effectKey];

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`${getPlayerSkillName(skill, t)} · ${t.game.skills}`}
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        disabled={!ready}
        className={[
          'relative flex h-9 w-9 flex-col items-center justify-center gap-0.5 rounded-[10px] border-[2px] transition-colors duration-100',
          ready
            ? 'border-[var(--cn-line)] bg-[var(--cn-card)] text-[var(--cn-ink)] shadow-[0_3px_0_var(--cn-line)] hover:bg-[var(--cn-card-2)]'
            : 'cursor-not-allowed border-[var(--cn-line-soft)] bg-[var(--cn-card-2)] text-[var(--cn-ink-4)]',
        ].join(' ')}
      >
        <IconComp className={`h-4 w-4 ${ready ? 'text-[var(--bd-ink)]' : 'text-[var(--bd-ink-4)]'}`} />

        {!ready && (
          <span className={`${BD_NUM} text-[10px]`}>{Math.ceil(cooldownRemaining / 1000)}</span>
        )}

        {/* 冷卻進度：底部一條，寬度＝已回復比例 */}
        {!ready && (
          <span
            className="pointer-events-none absolute inset-x-0 bottom-0 bg-[var(--bd-ink-4)]"
            style={{ height: 2, width: `${(1 - cooldownRatio) * 100}%` }}
          />
        )}

        {isActive && (
          <span className="pointer-events-none absolute inset-0 rounded-[2px] border border-[var(--bd-accent)]" />
        )}
      </button>

      {/* 鍵位 */}
      <span className="pointer-events-none absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-[6px] border-[2px] border-[var(--cn-line)] bg-[var(--cn-card)] px-1 font-mono text-[8px] font-extrabold leading-[12px] text-[var(--cn-ink-3)]">
        ⇧{skill.hotkey}
      </span>

      {/* Hover 詳細 */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.12 }}
            className={`${BD_PANEL} pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 w-52 -translate-x-1/2 p-2.5`}
          >
            <div className={`${BD_NUM} text-[12.5px]`}>{getPlayerSkillName(skill, t)}</div>
            <div className="mt-1 whitespace-normal text-[10.5px] leading-snug text-[var(--bd-ink-2)]">
              {getPlayerSkillDesc(skill, t)}
            </div>
            <div className="mt-1.5 flex items-center justify-between border-t border-[var(--bd-line)] pt-1.5 font-mono text-[9.5px] tabular-nums text-[var(--bd-ink-3)]">
              <span>CD {skill.cooldown / 1000}s</span>
              {skill.duration ? <span>{t.game.skillActive} {skill.duration / 1000}s</span> : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
