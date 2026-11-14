/**
 * Victory.tsx - 遊戲勝利介面（獨立場景，非彈窗）
 *
 * HARDLINE `Page` 版面：TopBar → 單欄 max-w-[1080px]
 *   1. 結果帶：大字「勝利」+ mono 副資訊（關卡／難度／時間）+ 分數／波次／星等
 *   2. 本局數據：摘要、統計（可摺疊）
 *   3. 成就解鎖：獎章與新解鎖清單
 *   4. 挑戰報告：每日挑戰／突變試煉
 *   5. 回放：本局回放
 *   底部只留兩顆主行動：再玩一次（signal）與返回（line）。
 *
 * 結算計算、存檔與熱鍵行為皆未變更。
 */

import type React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useShopStore, calculateCoinReward } from '@/store/shopStore';
import { useTalentStore } from '@/store/talentStore';
import { useStatsStore } from '@/store/statsStore';
import { useAchievementStore } from '@/store/achievementStore';
import { useTranslation } from '@/i18n';
import { SceneShell } from '@/components/ui/SceneShell';
import {
  TrophyIcon, SkullIcon, ConstructionIcon, StarIcon, SwordsIcon,
  ShieldIcon, MapIcon, RefreshIcon, HomeIcon, CelebrationIcon,
  ChevronUpIcon, ChevronDownIcon,
} from '@/components/ui/Icons';
import { formatPlayTime } from '@/types/gameEndReport';
import { formatGameRecordDifficulty, gameDifficultyLabelsFromGameCopy } from '@/data/gameRecordLabels';
import { getPathDisplayName } from '@/data/gameData/pathData';
import { Btn, Deck, TopBar } from '@/components/hl';
import { GameEndSessionReport } from '@/components/scenes/game-end/GameEndSessionReport';
import { GameEndResultBand } from '@/components/scenes/game-end/GameEndResultBand';
import { GameEndStatGrid, type GameEndStatItem } from '@/components/scenes/game-end/GameEndStatGrid';
import { GameEndAchievementPanels } from '@/components/scenes/game-end/GameEndAchievementPanels';
import { GameEndReplayPanel } from '@/components/scenes/game-end/GameEndReplayPanel';
import { isGameEndTypingTarget, resolveGameEndHotkey } from '@/data/gameEndHotkey';
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
  signal: 'border-[var(--arc-gold)] text-[var(--arc-gold)]',
  vital: 'border-[var(--arc-line-strong)] text-[var(--arc-vital)]',
  reach: 'border-[var(--arc-line-strong)] text-[var(--arc-reach)]',
  muted: 'border-[var(--arc-line-strong)] text-[var(--arc-ink-2)]',
};

/**
 * 勝利星等（戰役星等系統移除後的本地替代）：只依剩餘生命比例換算，
 * 滿血 3 星、六成以上 2 星、其餘 1 星。結果帶的 3 星刻度與獎章判定都吃這個值。
 */
function resolveEndStars(health: number, startingHealth: number): number {
  if (startingHealth <= 0) return 0;
  const ratio = health / startingHealth;
  if (ratio >= 1) return 3;
  if (ratio >= 0.6) return 2;
  return 1;
}

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
  const startingHealth = useGameStore((s) => s.difficultyModifiers.startingHealth);
  const report = useAchievementStore((s) => s.lastGameEndReport);

  const metaCoinMult = useTalentStore((s) => s.getModifiers().metaCoinMult);
  const addCoins = useShopStore((s) => s.addCoins);
  const incrementGamesPlayed = useShopStore((s) => s.incrementGamesPlayed);
  const endGameTracking = useStatsStore((s) => s.endGameTracking);
  const rewardedRef = useRef(false);

  const [showStats, setShowStats] = useState(false);

  const stars = resolveEndStars(health, startingHealth);

  const baseCoinReward = calculateCoinReward({ isVictory: true, score, currentWave, health, stars });
  const coinReward = Math.floor(baseCoinReward * metaCoinMult);

  useEffect(() => {
    if (!rewardedRef.current) {
      rewardedRef.current = true;
      addCoins(coinReward);
      incrementGamesPlayed();
      endGameTracking(selectedPath, gameDifficulty, true, score, currentWave, health);
    }
    // 空 deps 是刻意的：獎勵與通關紀錄只寫一次（rewardedRef 守門），而 score／stars／
    // coinReward 在勝利畫面掛載期間不會再變，列進來只是多跑 no-op（TD-17 判定：非債）
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

  const stageLabel = getPathDisplayName(selectedPath);
  const difficultyLabel = formatGameRecordDifficulty(
    gameDifficulty,
    gameDifficultyLabelsFromGameCopy(t.game),
  );
  const timeLabel = report ? formatPlayTime(report.playTimeSeconds) : '--';

  const handleNextLevel = () => {
    resetGame();
    setScene('pathSelection');
  };

  const handlePlayAgain = () => {
    // 複用本局啟動參數，避免丟失 maxWaves / 難度 / 無盡模式等設定
    const args = useGameStore.getState().lastStartArgs;
    resetGame();
    if (args) {
      startGame(args.pathName, args.difficulty, args.endless, args.maxWaves, args.customModifiers, args.customWaveSetId);
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
  }, [resetGame, setScene]);

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
              {t.game.selectMap}
            </Btn>
          }
        />
      </div>

      <main className="px-6 pb-16 pt-6">
        <div className="mx-auto flex w-full max-w-[1080px] flex-col gap-7">
          <GameEndResultBand
            tone="vital"
            headline={t.game.victory}
            tag={t.campaignEnd.modeStandard}
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
                <span className="arc-label">grade</span>
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
                <span className="arc-label">{t.game.stats}</span>
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

          </GameEndSessionReport>

          <GameEndAchievementPanels unlockedIds={report?.unlockedAchievementIds ?? []}>
            {medals.length > 0 && (
              <Deck tone="sunken" className="flex flex-wrap items-center gap-2 p-3">
                {medals.map((medal) => (
                  <span
                    key={medal.id}
                    className="arc-chip inline-flex items-center gap-1.5"
                  >
                    <span className="text-[var(--arc-caution)]">{medal.icon}</span>
                    {medal.name}
                  </span>
                ))}
              </Deck>
            )}
          </GameEndAchievementPanels>

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
