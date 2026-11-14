/**
 * Dev 面板 · 壓力測試
 *
 * 一鍵把戰場塞爆，配合 StressTestHud 觀察 FPS / 幀時間 / 逐階段耗時。
 * 之所以放在 Dev 面板而不是正式 UI：這是量測工具，不是玩法。
 */
import { useState } from 'react';
import { useDevStore } from '@/store/devStore';
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/i18n';
import {
  STRESS_DEFAULT_ENEMIES,
  STRESS_DEFAULT_TOWERS,
} from '@/data/stressTest';
import { LightningIcon, PlayIcon, TrashIcon, ChartIcon, SkullIcon } from '@/components/ui/Icons';
import { DevSection, DevButton, DevSelect, DevInfoRow, DevToggle } from './common';

type EnemyScale = '1000' | '5000' | '10000' | '20000' | '50000';
type TowerScale = '0' | '50' | '100' | '150';

const ENEMY_SCALES: { value: EnemyScale; label: string }[] = [
  { value: '1000', label: '1,000' },
  { value: '5000', label: '5,000' },
  { value: '10000', label: '10,000' },
  { value: '20000', label: '20,000' },
  { value: '50000', label: '50,000' },
];

const TOWER_SCALES: { value: TowerScale; label: string }[] = [
  { value: '0', label: '0' },
  { value: '50', label: '50' },
  { value: '100', label: '100' },
  { value: '150', label: '150（塞滿空地）' },
];

export const StressTestSection = () => {
  const { t } = useTranslation();
  const u = t.dev.ui;

  const [enemyScale, setEnemyScale] = useState<EnemyScale>('10000');
  const [towerScale, setTowerScale] = useState<TowerScale>('100');

  const scene = useGameStore((s) => s.scene);
  const enemyCount = useGameStore((s) => s.enemies.length);
  const towerCount = useGameStore((s) => s.towers.length);
  const spawnStressEntities = useGameStore((s) => s.spawnStressEntities);
  const clearStressEntities = useGameStore((s) => s.clearStressEntities);

  const stressHud = useDevStore((s) => s.stressTestActive);
  const setStressHud = useDevStore((s) => s.setStressTestActive);
  const lastRun = useDevStore((s) => s.stressTestLastRun);
  const setLastRun = useDevStore((s) => s.setStressTestLastRun);

  const inGame = scene === 'game';

  const run = (enemies: number, towers: number) => {
    const result = spawnStressEntities(enemies, towers);
    setLastRun({ enemies: result.enemies, towers: result.towers, at: Date.now(), reason: result.reason });
    // 壓測一開始就把 HUD 打開，不然看不到任何數字
    if (result.enemies > 0 && !useDevStore.getState().stressTestActive) {
      setStressHud(true);
    }
  };

  const runPreset = () => run(Number(enemyScale), Number(towerScale));

  const clearAll = () => {
    const result = clearStressEntities();
    setLastRun({ enemies: result.enemies, towers: result.towers, at: Date.now() });
  };

  return (
    <DevSection
      title={t.dev.secStressTest}
      icon={<LightningIcon className="w-4 h-4" />}
      accent="rose"
      keywords={['stress', 'stress test', 'fps', 'perf', 'load', '壓測', '壓力測試', '效能']}
    >
      <DevToggle
        icon={<ChartIcon className="w-3.5 h-3.5" />}
        label={u.stressHud}
        value={stressHud}
        onChange={() => setStressHud(!stressHud)}
        accent="rose"
      />

      <DevSelect
        label={u.stressEnemyScale}
        value={enemyScale}
        onChange={setEnemyScale}
        options={ENEMY_SCALES}
      />
      <DevSelect
        label={u.stressTowerScale}
        value={towerScale}
        onChange={setTowerScale}
        options={TOWER_SCALES}
      />

      <DevButton
        icon={<PlayIcon className="w-3.5 h-3.5" />}
        label={`${u.stressSpawnAll} · ${Number(enemyScale).toLocaleString()}e / ${towerScale}t`}
        onClick={runPreset}
        disabled={!inGame}
        variant="danger"
      />

      <div className="grid grid-cols-2 gap-2">
        <DevButton
          icon={<SkullIcon className="w-3.5 h-3.5" />}
          label={u.stressSpawnEnemies}
          onClick={() => run(Number(enemyScale), 0)}
          disabled={!inGame}
          variant="default"
        />
        <DevButton
          icon={<LightningIcon className="w-3.5 h-3.5" />}
          label={u.stressSpawnTowers}
          onClick={() => run(0, Number(towerScale) || STRESS_DEFAULT_TOWERS)}
          disabled={!inGame}
          variant="default"
        />
      </div>

      <DevButton
        icon={<TrashIcon className="w-3.5 h-3.5" />}
        label={u.stressClear}
        onClick={clearAll}
        variant="default"
      />

      <DevInfoRow label={u.stressLiveEnemies} value={enemyCount.toLocaleString()} color="rose" />
      <DevInfoRow label={u.stressLiveTowers} value={towerCount.toLocaleString()} color="cyan" />
      {lastRun && (
        <DevInfoRow
          label={u.stressLastRun}
          value={`${lastRun.enemies.toLocaleString()}e / ${lastRun.towers}t${
            lastRun.reason === 'not-in-game' ? ` · ${u.stressNeedGame}` : ''
          }${lastRun.reason === 'no-path' ? ` · ${u.stressNoPath}` : ''}`}
          color="amber"
        />
      )}

      <p className="text-[10px] leading-relaxed text-[var(--hl-ink-4)]">{u.stressHint}</p>
      {!inGame && (
        <p className="text-[10px] font-bold text-[var(--hl-alarm)]">{u.stressNeedGame}</p>
      )}
      <p className="text-[9px] font-mono text-[var(--hl-ink-4)]/70">
        default: {STRESS_DEFAULT_ENEMIES.toLocaleString()} enemies · {STRESS_DEFAULT_TOWERS} towers
      </p>
    </DevSection>
  );
};

export default StressTestSection;
