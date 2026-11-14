/**
 * 3D 塔血條：受傷的塔在模型上方顯示 billboard 條，跟 2D 同一套顯示規則。
 */
import * as THREE from 'three';
import type { RenderSnapshot } from '@/data/renderSnapshot';
import { towerLevelScale } from '@/data/renderSnapshot';
import { healthBarColorHex } from '@/data/healthBarColor';
import { shouldShowTowerHealthBar } from '@/data/towerHealthBarVisibility';

const MAX_TOWERS = 192;
const BAR_W = 0.66;
const BAR_H = 0.07;
const ZERO_SCALE = new THREE.Matrix4().makeScale(0, 0, 0);

interface TowerHealthBars3D {
  sync: (
    snapshot: RenderSnapshot,
    toWorld: (c: number, r: number) => [number, number],
    cameraQuat: THREE.Quaternion,
    showHealthBars: boolean,
  ) => void;
  dispose: () => void;
}

export function createTowerHealthBars3D(scene: THREE.Scene): TowerHealthBars3D {
  const bgGeo = new THREE.PlaneGeometry(BAR_W, BAR_H);
  const bgMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  });
  const hpBg = new THREE.InstancedMesh(bgGeo, bgMat, MAX_TOWERS);
  hpBg.frustumCulled = false;
  hpBg.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(hpBg);

  const fgGeo = new THREE.PlaneGeometry(BAR_W, BAR_H * 0.8);
  fgGeo.translate(BAR_W / 2, 0, 0);
  const fgMat = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false });
  const hpFg = new THREE.InstancedMesh(fgGeo, fgMat, MAX_TOWERS);
  hpFg.frustumCulled = false;
  hpFg.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(hpFg);

  const dummy = new THREE.Object3D();
  const tmpColor = new THREE.Color();

  const sync: TowerHealthBars3D['sync'] = (snapshot, toWorld, cameraQuat, showHealthBars) => {
    const frames = snapshot.towers;
    const n = Math.min(snapshot.towerCount, MAX_TOWERS);
    for (let i = 0; i < n; i++) {
      const t = frames[i];
      if (!shouldShowTowerHealthBar(t.health, t.maxHealth, showHealthBars)) {
        hpBg.setMatrixAt(i, ZERO_SCALE);
        hpFg.setMatrixAt(i, ZERO_SCALE);
        continue;
      }
      const [wx, wz] = toWorld(t.gridPos.col, t.gridPos.row);
      const hpRatio = t.healthRatio;
      const barY = 0.12 + 0.78 * towerLevelScale(t.level);

      dummy.position.set(wx, barY, wz);
      dummy.quaternion.copy(cameraQuat);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      hpBg.setMatrixAt(i, dummy.matrix);

      dummy.position.set(wx, barY, wz);
      dummy.quaternion.copy(cameraQuat);
      dummy.scale.set(Math.max(0.001, hpRatio), 1, 1);
      dummy.translateX(-BAR_W / 2);
      dummy.translateZ(0.01);
      dummy.updateMatrix();
      hpFg.setMatrixAt(i, dummy.matrix);
      hpFg.setColorAt(i, tmpColor.setHex(healthBarColorHex(hpRatio)));
    }
    hpBg.count = n;
    hpFg.count = n;
    hpBg.instanceMatrix.needsUpdate = true;
    hpFg.instanceMatrix.needsUpdate = true;
    if (hpFg.instanceColor) hpFg.instanceColor.needsUpdate = true;
  };

  const dispose = () => {
    for (const m of [hpBg, hpFg]) {
      scene.remove(m);
      m.geometry.dispose();
      (m.material as THREE.Material).dispose();
      m.dispose();
    }
  };

  return { sync, dispose };
}
