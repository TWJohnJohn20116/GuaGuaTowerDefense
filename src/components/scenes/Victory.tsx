/**
 * Victory.tsx - 遊戲勝利介面（獨立場景，非彈窗）
 *
 * HARDLINE `Page` 版面：TopBar → 單欄 max-w-[1080px]
 *   1. 結果帶：大字「勝利」+ mono 副資訊（關卡／難度／時間）+ 分數／波次／星等
 *   2. 本局數據：摘要、統計（可摺疊）、戰役面板、戰績摘要
 *   3. 成就解鎖：獎章與新解鎖清單
 *   4. 挑戰報告：每日挑戰／突變試煉
 *   5. 回放：本局回放
 *   底部只留兩顆主行動：再玩一次（signal）與返回（line）。
 *
 * 結算計算、存檔與熱鍵行為皆未變更。
 */

import type React from 'react';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useShopStore, calculateCoinReward } from '@/store/shopStore';
import { useTalentStore } from '@/store/talentStore';
import { useStatsStore } from '@/store/statsStore';
import { useAchievementStore } from '@/store/achievementStore';
import { useTranslation } from '@/i18n';
import { SceneShell } from '@/components/ui/SceneShell';
import { calculateCampaignStars } from '@/utils/campaignStars';
import { resolveCampaignVictoryGrant } from '@/utils/campaignRewards';
import { getNextLevelId, findCampaignLevelById } from '@/data/campaignData';
import { useCampaignStore } from '@/store/campaignStore';
import {
  TrophyIcon, SkullIcon, ConstructionIcon, StarIcon, SwordsIcon,
  ShieldIcon, MapIcon, RefreshIcon, HomeIcon, CelebrationIcon,
  ChevronUpIcon, ChevronDownIcon,
} from '@/components/ui/Icons';
import { formatPlayTime } from '@/types/gameEndReport';
import { formatGameRecordDifficulty, gameDifficultyLabelsFromDetail } from '@/data/gameRecordLabels';
import { getPathDisplayName } from '@/data/gameData/pathData';
import { Btn, Deck, TopBar } from '@/components/hl';
import { GameEndSessionReport } from '@/components/scenes/game-end/GameEndSessionReport';
import { GameEndResultBand } from '@/components/scenes/game-end/GameEndResultBand';
import { GameEndStatGrid, type GameEndStatItem } from '@/components/scenes/game-end/GameEndStatGrid';
import { GameEndAchievementPanels } from '@/components/scenes/game-end/GameEndAchievementPanels';
import { GameEndChallengePanel } from '@/components/scenes/game-end/GameEndChallengePanel';
import { GameEndReplayPanel } from '@/components/scenes/game-end/GameEndReplayPanel';
import { VictoryCampaignPanel } from '@/components/scenes/campaign-end/VictoryCampaignPanel';
import { VictoryShareCard } from '@/components/scenes/campaign-end/VictoryShareCard';
import { isGameEndTypingTarget, resolveGameEndHotkey } from '@/data/gameEndHotkey';
import { formatVictoryNextLabel } from '@/data/victoryNextCopy';
import { resolveVictoryMedalIds, type VictoryMedalId } from '@/data/victoryMedals';

// 面板外觀已全面改由 hl 原語（Deck / StatCell / Segments）提供；舊 SCENE_GLASS 覆蓋層不再使用。
const MEDAL_ICON: Record<VictoryMedalId, React.ReactNode> = {
  perfectDefense: <TrophyIcon className="h-3.5 w-3.5" />,
  hunter: <SkullIcon className="h-3.5 w-3.5" />,
  architect: <ConstructionIcon className="h-3.5 w-3.5" />,
  maxUpgrade: <StarIcon className="h-3.5 w-3.5" />,
  destroyer: <SwordsIcon className="h-3.5 w-3.5" />,
  ironWall: <ShieldIcon className="h-3.5 w-3.5" />,
};

type GradeTone = 'signal' | 'vital' | 'reach' | 'muted';

const GRADE_CLASS: Record<GradeTone, string> = {
  signal: 'border-[var(--hl-signal)] text-[var(--hl-signal)]',
  vital: 'border-[var(--hl-line-strong)] text-[var(--hl-vital)]',
  reach: 'border-[var(--hl-line-strong)] text-[var(--hl-reach)]',
  muted: 'border-[var(--hl-line-strong)] text-[var(--hl-ink-2)]',
};

export default function Victory() {
  const { t } = useTranslation();
  const score = useGameStore((s) => s.score);
  const health = useGameStore((s) => s.health);
  const currentWave = useGameStore((s) => s.currentWave);
  const towers = useGameStore((s) => s.towers);
  const placementStats = useGameStore((s) => s.placementStats);
  const upgradeStats = useGameStore((s) => s.upgradeStats);
  const selectedPath = useGameStore((s) => s.selectedPath);
  const setScene = useGameStore((s) => s.setScene);
  const resetGame = useGameStore((s) => s.resetGame);
  const startGame = useGameStore((s) => s.startGame);
  const gameDifficulty = useGameStore((s) => s.gameDifficulty);
  const campaignLevelId = useGameStore((s) => s.campaignLevelId);
  const isCampaign = useGameStore((s) => s.isCampaign);
  const startingHealth = useGameStore((s) => s.difficultyModifiers.startingHealth);
  const isLevelUnlocked = useCampaignStore((s) => s.isLevelUnlocked);
  const report = useAchievementStore((s) => s.lastGameEndReport);

  const nextLevelId = useMemo(() => {
    if (!isCampaign || !campaignLevelId) return undefined;
    return getNextLevelId(campaignLevelId);
  }, [isCampaign, campaignLevelId]);

  const nextLevelData = useMemo(
    () => (nextLevelId ? findCampaignLevelById(nextLevelId) : undefined),
    [nextLevelId],
  );

  const canContinueCampaign = Boolean(
    nextLevelId && nextLevelData && isLevelUnlocked(nextLevelId),
  );

  const metaCoinMult = useTalentStore((s) => s.getModifiers().metaCoinMult);
  const addCoins = useShopStore((s) => s.addCoins);
  const grantTowers = useShopStore((s) => s.grantTowers);
  const incrementGamesPlayed = useShopStore((s) => s.incrementGamesPlayed);
  const addTalentPoints = useTalentStore((s) => s.addTalentPoints);
  const endGameTracking = useStatsStore((s) => s.endGameTracking);
  const rewardedRef = useRef(false);

  const [showStats, setShowStats] = useState(false);

  const stars = calculateCampaignStars(health, startingHealth);

  const baseCoinReward = calculateCoinReward({ isVictory: true, score, currentWave, health, stars });
  const coinReward = Math.floor(baseCoinReward * metaCoinMult);
  const campaignLevel = campaignLevelId ? findCampaignLevelById(campaignLevelId) : undefined;
  const campaignGrant = resolveCampaignVictoryGrant({
    formulaCoins: coinReward,
    stars,
    unlockTower: campaignLevel?.rewards.unlockTower,
  });

  useEffect(() => {
    if (!rewardedRef.current) {
      rewardedRef.current = true;
      addCoins(campaignGrant.coins);
      incrementGamesPlayed();
      addTalentPoints(campaignGrant.talentPoints);
      if (campaignGrant.unlockedTowers.length > 0) {
        grantTowers(campaignGrant.unlockedTowers);
      }
      endGameTracking(selectedPath, gameDifficulty, true, score, currentWave, health);

      if (campaignLevelId) {
        import('@/store/campaignStore').then(m => {
          m.useCampaignStore.getState().completeLevel(campaignLevelId, stars);
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalKills = towers.reduce((sum, tower) => sum + tower.kills, 0);
  const totalDamage = towers.reduce((sum, tower) => sum + tower.totalDamage, 0);
  const totalSpent = placementStats.totalSpent + upgradeStats.totalSpent;

  const getGrade = (): { grade: string; tone: GradeTone } => {
    if (stars === 3 && score >= 5000) return { grade: 'S', tone: 'signal' };
    if (stars === 3) return { grade: 'A', tone: 'vital' };
    if (stars === 2) return { grade: 'B', tone: 'reach' };
    return { grade: 'C', tone: 'muted' };
  };
  const gradeInfo = getGrade();

  const getMedals = () => {
    const medalNames = t.game.medals;
    return resolveVictoryMedalIds({
      stars,
      health,
      startingHealth,
      totalKills,
      towerCount: towers.length,
      maxLevelReached: upgradeStats.maxLevelReached,
      totalDamage,
    }).map((id) => ({ id, icon: MEDAL_ICON[id], name: medalNames[id] }));
  };
  const medals = getMedals();

  const expGained = score + (stars * 100) + (medals.length * 50);

  const baseStatItems: GameEndStatItem[] = [
    { key: 'wave', label: t.game.wave, value: currentWave },
    { key: 'health', label: t.game.health, value: health, tone: 'vital' },
    { key: 'kills', label: t.game.kills, value: totalKills },
    { key: 'exp', label: 'exp', value: `+${expGained}`, tone: 'reach' },
    { key: 'coins', label: t.mainMenu.coinsUnit, value: `+${coinReward}`, tone: 'signal' },
  ];

  const extraStatItems: GameEndStatItem[] = showStats
    ? [
        {
          key: 'damage',
          label: t.towers.damage,
          value: Math.floor(totalDamage).toLocaleString(),
        },
        { key: 'built', label: t.game.towerCount, value: placementStats.totalPlaced },
        { key: 'spent', label: t.game.spent, value: `$${totalSpent}` },
      ]
    : [];

  const statItems = [...baseStatItems, ...extraStatItems];

  const stageLabel =
    isCampaign && campaignLevel ? campaignLevel.title : getPathDisplayName(selectedPath);
  const difficultyLabel = formatGameRecordDifficulty(
    gameDifficulty,
    gameDifficultyLabelsFromDetail(t.mutatorChallenge.detail),
  );
  const timeLabel = report ? formatPlayTime(report.playTimeSeconds) : '--';

  const handleNextLevel = () => {
    if (canContinueCampaign && nextLevelId) {
      resetGame();
      startGame(
        nextLevelId,
        gameDifficulty,
        false,
        nextLevelData?.maxWaves,
      );
      return;
    }
    resetGame();
    setScene('pathSelection');
  };

  const handlePlayAgain = () => {
    // 複用本局啟動參數，避免丟失 maxWaves / 難度 / 無盡模式等設定
    const args = useGameStore.getState().lastStartArgs;
    resetGame();
    if (args) {
      startGame(args.pathName, args.difficulty, args.endless, args.maxWaves, args.customModifiers, args.customWaveSetId, args.mutator);
    } else {
      setScene('pathSelection');
    }
  };

  const handleMainMenu = () => {
    resetGame();
    setScene('mainMenu');
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const action = resolveGameEndHotkey(e.key, {
        inTextField: isGameEndTypingTarget(e.target),
      });
      if (action !== 'primary') return;
      e.preventDefault();
      handleNextLevel();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [canContinueCampaign, nextLevelId, nextLevelData, gameDifficulty, resetGame, startGame, setScene]);

  return (
    <SceneShell accent="success">
      <div className="sticky top-0 z-30">
        <TopBar
          title={t.game.victory}
          meta={`${gradeInfo.grade} · ${stars}/3 · ${difficultyLabel}`}
          glyph={<CelebrationIcon className="h-4 w-4" />}
          back={{ onClick: handleMainMenu }}
          right={
            <Btn
              variant="line"
              size="sm"
              icon={<MapIcon className="h-3.5 w-3.5" />}
              kbd={t.game.enterToConfirm}
              onClick={handleNextLevel}
            >
              {canContinueCampaign && nextLevelData
                ? formatVictoryNextLabel(t.game.nextLevelNamed, t.game.nextLevel, nextLevelData.title)
                : t.game.nextLevel}
            </Btn>
          }
        />
      </div>

      <main className="px-6 pb-16 pt-6">
        <div className="mx-auto flex w-full max-w-[1080px] flex-col gap-7">
          <GameEndResultBand
            tone="vital"
            headline={t.game.victory}
            tag={isCampaign ? t.campaignEnd.modeCampaign : t.campaignEnd.modeStandard}
            meta={[
              { label: 'stage', value: stageLabel },
              { label: 'difficulty', value: difficultyLabel },
              { label: 'time', value: timeLabel },
            ]}
            score={score.toLocaleString()}
            wave={currentWave}
            stars={stars}
            badge={
              <span className="flex flex-col gap-1">
                <span className="hl-label">grade</span>
                <span
                  className={`flex h-9 min-w-[36px] items-center justify-center border px-2 font-mono text-[18px] font-semibold leading-none tabular-nums ${GRADE_CLASS[gradeInfo.tone]}`}
                >
                  {gradeInfo.grade}
                </span>
              </span>
            }
          />

          <GameEndSessionReport variant="success">
            <Deck className="flex flex-col gap-3 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="hl-label">{t.game.stats}</span>
                <Btn
                  variant="ghost"
                  size="sm"
                  icon={
                    showStats ? (
                      <ChevronUpIcon className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDownIcon className="h-3.5 w-3.5" />
                    )
                  }
                  onClick={() => setShowStats((v) => !v)}
                >
                  {showStats ? t.game.hideStats : t.game.showStats}
                </Btn>
              </div>
              <GameEndStatGrid items={statItems} className="lg:grid-cols-3" />
            </Deck>

            {isCampaign && campaignLevelId && (
              <VictoryCampaignPanel
                levelId={campaignLevelId}
                health={health}
                startingHealth={startingHealth}
                coinsGranted={campaignGrant.coins}
                talentGranted={campaignGrant.talentPoints}
                unlockedTowers={campaignGrant.unlockedTowers}
              />
            )}

            <VictoryShareCard
              mapId={selectedPath}
              score={score}
              stars={stars}
              grade={gradeInfo.grade}
              wave={currentWave}
              health={health}
              startingHealth={startingHealth}
              coinReward={coinReward}
              expGained={expGained}
              totalKills={totalKills}
              isCampaign={!!isCampaign}
            />
          </GameEndSessionReport>

          <GameEndAchievementPanels unlockedIds={report?.unlockedAchievementIds ?? []}>
            {medals.length > 0 && (
              <Deck tone="sunken" className="flex flex-wrap items-center gap-2 p-3">
                {medals.map((medal) => (
                  <span
                    key={medal.id}
                    className="inline-flex items-center gap-1.5 border border-[var(--hl-line)] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--hl-ink-2)]"
                  >
                    <span className="text-[var(--hl-caution)]">{medal.icon}</span>
                    {medal.name}
                  </span>
                ))}
              </Deck>
            )}
          </GameEndAchievementPanels>

          <GameEndChallengePanel
            daily={report?.dailyChallenge}
            mutator={report?.mutatorChallenge}
          />

          <GameEndReplayPanel />

          <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:justify-end">
            <Btn
              variant="signal"
              size="lg"
              className="w-full sm:w-auto"
              icon={<RefreshIcon className="h-4 w-4" />}
              onClick={handlePlayAgain}
            >
              {t.game.playAgain}
            </Btn>
            <Btn
              variant="line"
              size="lg"
              className="w-full sm:w-auto"
              icon={<HomeIcon className="h-4 w-4" />}
              onClick={handleMainMenu}
            >
              {t.game.mainMenuBtn}
            </Btn>
          </div>
        </div>
      </main>
    </SceneShell>
  );
}
