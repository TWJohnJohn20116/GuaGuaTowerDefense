/**
 * 戰役任務簡報（HARDLINE Console 主區）
 *
 * Hero（地圖預覽 + 標題 + 資料格）→ 規則／獎勵／星等／出戰前對話 → 出擊列。
 * 全部方角、1px 線；獎勵用 Field，星等用 Segments。
 */

import { useState } from 'react';
import { useTranslation } from '@/i18n';
import { useCampaignStore } from '@/store/campaignStore';
import { PATHS, TOWER_DATA } from '@/data/gameData';
import {
  findCampaignLevelById,
  getRecommendedCampaignLevelId,
  getCampaignLevelUnlockHint,
} from '@/data/campaignData';
import { isHiddenCampaignMap } from '@/data/gameData/hiddenCampaignMaps';
import { sanitizeUnlockTowers } from '@/utils/campaignRewards';
import { Btn, Field, Segments } from '@/components/hl';
import {
  SectionHeader,
  BriefingHero,
  BriefingFooter,
  EmptyBriefing,
  Badge,
} from './BriefingShared';
import { calculatePathStats } from './utils';
import { getStarRequirementPercents } from '@/utils/campaignStars';
import { isCampaignPlayerSpeaker } from '@/i18n/campaignSpeakerUtils';
import type { CampaignLevel, DialogueLine } from '@/types/campaign';

interface CampaignDetailProps {
  selectedId: string | null;
  onStart: (levelId: string) => void;
}

// ──────────────────────────────────────────────────────────────────────────
// 特殊戰場規則
// ──────────────────────────────────────────────────────────────────────────

function SpecialRules({ rules }: { rules: string[] }) {
  return (
    <div className="flex flex-col border-t border-[var(--hl-line)]">
      {rules.map((rule, idx) => (
        <div key={idx} className="flex items-start gap-2.5 border-b border-[var(--hl-line)] py-2">
          <span className="mt-[5px] h-2 w-[2px] shrink-0 bg-[var(--hl-caution)]" />
          <span className="min-w-0 font-mono text-[10px] tabular-nums text-[var(--hl-ink-4)]">
            {String(idx + 1).padStart(2, '0')}
          </span>
          <span className="min-w-0 text-[12.5px] leading-relaxed text-[var(--hl-ink-2)]">
            {rule}
          </span>
        </div>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// 出戰前對話（可摺疊）
// ──────────────────────────────────────────────────────────────────────────

function PreBattleDialogue({ lines }: { lines: DialogueLine[] }) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const c = t.pathSelection.campaign;

  return (
    <section>
      <SectionHeader
        title={c.preBattleBriefing}
        right={
          <Btn size="sm" variant="ghost" onClick={() => setOpen((v) => !v)}>
            {open ? c.collapse : c.expand.replace('{count}', String(lines.length))}
          </Btn>
        }
      />
      {open && (
        <div className="hl-enter flex flex-col">
          {lines.map((line, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 border-b border-[var(--hl-line)] py-2 last:border-b-0"
            >
              <span className="mt-[3px] shrink-0 border border-[var(--hl-line)] px-1 font-mono text-[9px] uppercase leading-[14px] tracking-[0.08em] text-[var(--hl-ink-3)]">
                {isCampaignPlayerSpeaker(line.speaker, c.speakerPlayer) ? 'p1' : 'ai'}
              </span>
              <div className="min-w-0">
                <div className="hl-label">
                  {line.speaker === 'ai'
                    ? c.speakerAi
                    : line.speaker === 'player'
                      ? c.speakerPlayer
                      : line.speaker}
                </div>
                <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--hl-ink-2)]">
                  {line.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// 主組件
// ──────────────────────────────────────────────────────────────────────────

export function CampaignDetail({ selectedId, onStart }: CampaignDetailProps) {
  const { t } = useTranslation();
  const c = t.pathSelection.campaign;
  const isLevelUnlocked = useCampaignStore((s) => s.isLevelUnlocked);
  const isLevelCompleted = useCampaignStore((s) => s.isLevelCompleted);
  const getLevelStars = useCampaignStore((s) => s.getLevelStars);

  const level = selectedId
    ? (findCampaignLevelById(selectedId) as CampaignLevel | undefined)
    : undefined;

  if (!level) {
    return <EmptyBriefing title={c.selectMissionTitle} hint={c.selectMissionHint} />;
  }

  const path = PATHS[level.mapId];
  const stats = path ? calculatePathStats(path.waypoints, path.segments) : { length: 0, turns: 0 };
  const completed = isLevelCompleted(level.id);
  const unlocked = isLevelUnlocked(level.id);
  const isBoss = !!level.isBossLevel;
  const dialogueLines = (level.preBattleDialogue || []) as DialogueLine[];
  const hasSpecialRules = level.specialRules && level.specialRules.length > 0;
  const unlockTowers = sanitizeUnlockTowers(level.rewards.unlockTower);
  const hasUnlockTower = unlockTowers.length > 0;
  const currentStars = getLevelStars(level.id);
  const { twoStarPercent, threeStarPercent } = getStarRequirementPercents();
  const nextTargetId = getRecommendedCampaignLevelId(isLevelUnlocked, isLevelCompleted);
  const isNextTarget = !completed && unlocked && level.id === nextTargetId;

  const starRequirements = [
    { stars: 1, label: c.starReq1Label, description: c.starReq1Desc },
    {
      stars: 2,
      label: c.starReq2Label.replace('{percent}', String(twoStarPercent)),
      description: c.starReq2Desc,
    },
    {
      stars: 3,
      label: c.starReq3Label.replace('{percent}', String(threeStarPercent)),
      description: c.starReq3Desc,
    },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <BriefingHero
          path={path}
          eyebrow={c.chapterEyebrow
            .replace('{chapter}', String(level.chapter))
            .replace('{level}', String(level.level))}
          title={level.title}
          description={level.description}
          topBadges={
            <>
              {isBoss && <Badge label={c.badgeBoss} tone="alarm" />}
              {isNextTarget && <Badge label={c.badgeNext} tone="signal" />}
              {isHiddenCampaignMap(level.mapId) && <Badge label={c.badgeHidden} tone="caution" />}
              {completed && <Badge label={c.badgeCompleted} tone="vital" />}
              {completed && currentStars > 0 && currentStars < 3 && (
                <Badge
                  label={c.badgeIncompleteStars.replace('{missing}', String(3 - currentStars))}
                  tone="caution"
                />
              )}
              {!unlocked && !completed && <Badge label={c.badgeLocked} tone="muted" />}
            </>
          }
          stats={[
            { label: c.statPathLength, value: stats.length },
            { label: c.statTurns, value: stats.turns },
            { label: t.pathSelection.totalWaves, value: level.maxWaves || 15 },
            { label: c.sectionStarChallenge, value: `${currentStars}/3` },
          ]}
        />

        <div className="flex flex-col gap-5 p-4 lg:p-5">
          {hasSpecialRules && (
            <section>
              <SectionHeader title={c.sectionSpecialEnv} />
              <SpecialRules rules={level.specialRules!} />
            </section>
          )}

          <section>
            <SectionHeader title={c.sectionRewards} />
            <div className="flex flex-col">
              <Field label={c.rewardCoins}>
                <span className="text-[12.5px] text-[var(--hl-signal)]">依本局表現結算</span>
              </Field>
              <Field label={c.rewardTalent}>
                <span className="text-[12.5px] text-[var(--hl-reach)]">依星等發放</span>
              </Field>
              {hasUnlockTower && (
                <Field label={c.rewardUnlockTowers.replace('{count}', '').trim()}>
                  <span className="text-[12.5px] text-[var(--hl-ink-2)]">
                    {unlockTowers.map((type) => TOWER_DATA[type]?.name ?? type).join('、')}
                  </span>
                </Field>
              )}
            </div>
          </section>

          <section>
            <SectionHeader
              title={
                currentStars > 0
                  ? c.sectionStarChallengeWithStars.replace('{stars}', String(currentStars))
                  : c.sectionStarChallenge
              }
              right={
                <Segments total={3} filled={currentStars} tone="caution" size="sm" />
              }
            />
            <div className="flex flex-col border-t border-[var(--hl-line)]">
              {starRequirements.map((req) => {
                const achieved = currentStars >= req.stars;
                return (
                  <div key={req.stars} className="hl-row hl-row-hover">
                    <Segments
                      total={3}
                      filled={req.stars}
                      size="sm"
                      tone={achieved ? 'caution' : 'ink'}
                    />
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block truncate text-[12.5px] ${
                          achieved ? 'text-[var(--hl-ink)]' : 'text-[var(--hl-ink-3)]'
                        }`}
                      >
                        {req.label}
                      </span>
                      <span className="mt-0.5 block truncate text-[10.5px] text-[var(--hl-ink-4)]">
                        {req.description}
                      </span>
                    </span>
                    <span
                      className={`shrink-0 font-mono text-[10px] uppercase tracking-[0.08em] ${
                        achieved ? 'text-[var(--hl-vital)]' : 'text-[var(--hl-ink-4)]'
                      }`}
                    >
                      {achieved ? 'done' : `0${req.stars}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {dialogueLines.length > 0 && <PreBattleDialogue lines={dialogueLines} />}

          {!unlocked && !completed && (
            <section>
              <SectionHeader title={c.levelLocked} />
              <p className="border-l-2 border-[var(--hl-alarm)] py-1 pl-2.5 text-[12.5px] leading-relaxed text-[var(--hl-ink-2)]">
                {getCampaignLevelUnlockHint(level.id)}
                {isHiddenCampaignMap(level.mapId) && (
                  <span className="mt-1.5 block text-[var(--hl-caution)]">{c.hiddenMapHint}</span>
                )}
              </p>
            </section>
          )}
        </div>
      </div>

      <BriefingFooter
        unlocked={unlocked}
        rewardCoins={0}
        rewardNote={
          hasUnlockTower
            ? `依表現結算 · 解鎖 ${unlockTowers.map((type) => TOWER_DATA[type]?.name ?? type).join('、')}`
            : '金幣與天賦點依本局表現結算'
        }
        onStart={() => onStart(level.id)}
      />
    </div>
  );
}

export default CampaignDetail;
