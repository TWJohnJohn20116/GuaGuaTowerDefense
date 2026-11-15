/**
 * 遊戲 3D 視圖 · 玩家主動技能演出 + 火焰塔噴射束
 *
 * 消費 store.playerSkillAnimations（過期清理由 updatePlayerSkills 負責），
 * 按 elapsed 純函式驅動各技能的 3D 演出：
 *  - lightningStorm：全場隨機落雷光柱
 *  - frozenTime：冰藍地面光盤 + 擴散環
 *  - cashRain：金色方塊雨
 *  - battleInspire：紫色雙擴散環
 *  - meteorStorm：隕石斜落
 *  - chainLightning：沿 chainPath 的發光折線
 *  - holyHeal：聖光柱 + 綠色擴散環
 *  - warpTrap：紫紅雙端傳送門環 + 連線（起點收縮、落點擴張）
 */

import * as THREE from 'three';
import type { PlayerSkillAnimation } from '@/store/gameStoreTypes';
import type { RenderSnapshot } from '@/data/renderSnapshot';
import { enemyFrameById } from '@/data/renderSnapshot';
import { fxProgress } from '@/data/fxProgress';
import { getTowerData } from '@/store/gameStoreUtils';

const ADD = THREE.AdditiveBlending;

interface SkillFxEntry {
  group: THREE.Group;
  anim: PlayerSkillAnimation;
  /** 各元素的隨機種子（位置/相位） */
  seeds: number[];
}

interface SkillFx3D {
  syncSkills: (
    anims: PlayerSkillAnimation[],
    toWorld: (c: number, r: number) => [number, number],
    now: number,
  ) => void;
  syncFlames: (snapshot: RenderSnapshot, toWorld: (c: number, r: number) => [number, number], now: number) => void;
  dispose: () => void;
}

const basicMat = (color: number, opacity = 1) =>
  new THREE.MeshBasicMaterial({ color, transparent: true, opacity, blending: ADD, depthWrite: false, side: THREE.DoubleSide });

export function createSkillFx3D(scene: THREE.Scene): SkillFx3D {
  const fxMap = new Map<string, SkillFxEntry>();

  // 共享幾何
  const pillarGeo = new THREE.CylinderGeometry(0.09, 0.16, 6, 8, 1, true);
  const bigPillarGeo = new THREE.CylinderGeometry(1.6, 2.2, 8, 24, 1, true);
  const ringGeo = new THREE.RingGeometry(0.92, 1, 48);
  const diskGeo = new THREE.CircleGeometry(1, 48);
  const cubeGeo = new THREE.BoxGeometry(0.16, 0.16, 0.16);
  const meteorGeo = new THREE.SphereGeometry(0.2, 10, 8);
  const segGeo = new THREE.BoxGeometry(1, 0.06, 0.06);

  // ===== 各技能的 3D 構建 =====
  const buildSkillGroup = (anim: PlayerSkillAnimation, toWorld: (c: number, r: number) => [number, number]): SkillFxEntry => {
    const group = new THREE.Group();
    const seeds: number[] = [];
    const rand = () => {
      const v = Math.random();
      seeds.push(v);
      return v;
    };

    switch (anim.skillId) {
      case 'lightningStorm': {
        // 12 根隨機位置的落雷光柱
        for (let i = 0; i < 12; i++) {
          const m = new THREE.Mesh(pillarGeo, basicMat(0xfde047));
          m.position.set((rand() - 0.5) * 13, 3, (rand() - 0.5) * 8);
          rand(); // 相位種子
          group.add(m);
        }
        break;
      }
      case 'frozenTime': {
        const disk = new THREE.Mesh(diskGeo, basicMat(0x60a5fa, 0.16));
        disk.rotation.x = -Math.PI / 2;
        disk.position.y = 0.16;
        disk.scale.setScalar(9);
        group.add(disk);
        const ring = new THREE.Mesh(ringGeo, basicMat(0x93c5fd, 0.8));
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.2;
        group.add(ring);
        break;
      }
      case 'cashRain': {
        for (let i = 0; i < 18; i++) {
          const m = new THREE.Mesh(cubeGeo, basicMat(0xfbbf24, 0.95));
          m.position.set((rand() - 0.5) * 12, 5, (rand() - 0.5) * 7);
          rand(); // 落下相位
          group.add(m);
        }
        break;
      }
      case 'battleInspire': {
        for (let i = 0; i < 2; i++) {
          const ring = new THREE.Mesh(ringGeo, basicMat(0xa855f7, 0.85));
          ring.rotation.x = -Math.PI / 2;
          ring.position.y = 0.18 + i * 0.06;
          group.add(ring);
        }
        break;
      }
      case 'meteorStorm': {
        for (let i = 0; i < 10; i++) {
          const m = new THREE.Mesh(meteorGeo, basicMat(0xf97316, 1));
          // 起點高空隨機，斜向落點（落點存於 userData）
          const tx = (rand() - 0.5) * 13;
          const tz = (rand() - 0.5) * 8;
          rand(); // 相位
          m.userData = { tx, tz };
          m.position.set(tx + 3, 7, tz - 3);
          group.add(m);
        }
        break;
      }
      case 'chainLightning': {
        // 沿 chainPath 的發光線段（每段一個拉伸 box）
        const path = anim.chainPath || [];
        for (let i = 0; i < path.length - 1; i++) {
          const [ax, az] = toWorld(path[i].x, path[i].y);
          const [bx, bz] = toWorld(path[i + 1].x, path[i + 1].y);
          const dx = bx - ax;
          const dz = bz - az;
          const len = Math.sqrt(dx * dx + dz * dz);
          const m = new THREE.Mesh(segGeo, basicMat(0x22d3ee, 1));
          m.position.set((ax + bx) / 2, 0.55, (az + bz) / 2);
          m.scale.set(Math.max(0.001, len), 1.6, 1.6);
          m.rotation.y = -Math.atan2(dz, dx);
          group.add(m);
        }
        break;
      }
      case 'holyHeal': {
        const pillar = new THREE.Mesh(bigPillarGeo, basicMat(0x34d399, 0.35));
        pillar.position.y = 4;
        group.add(pillar);
        const ring = new THREE.Mesh(ringGeo, basicMat(0x6ee7b7, 0.8));
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.2;
        group.add(ring);
        break;
      }
      case 'warpTrap': {
        // 每組傳送：起點環（收縮）+ 落點環（擴張）+ 虛線連接段
        for (const jump of anim.warpJumps || []) {
          const [ax, az] = toWorld(jump.fromX, jump.fromY);
          const [bx, bz] = toWorld(jump.toX, jump.toY);

          const fromRing = new THREE.Mesh(ringGeo, basicMat(0xe879f9, 0.9));
          fromRing.rotation.x = -Math.PI / 2;
          fromRing.position.set(ax, 0.22, az);
          fromRing.userData = { role: 'from' };
          group.add(fromRing);

          const toRing = new THREE.Mesh(ringGeo, basicMat(0xf0abfc, 0.9));
          toRing.rotation.x = -Math.PI / 2;
          toRing.position.set(bx, 0.22, bz);
          toRing.userData = { role: 'to' };
          group.add(toRing);

          const dx = bx - ax;
          const dz = bz - az;
          const len = Math.sqrt(dx * dx + dz * dz);
          const seg = new THREE.Mesh(segGeo, basicMat(0xe879f9, 0.5));
          seg.position.set((ax + bx) / 2, 0.4, (az + bz) / 2);
          seg.scale.set(Math.max(0.001, len), 0.7, 0.7);
          seg.rotation.y = -Math.atan2(dz, dx);
          seg.userData = { role: 'seg' };
          group.add(seg);
        }
        break;
      }
      case 'empPulse': {
        const pillar = new THREE.Mesh(bigPillarGeo, basicMat(0x22d3ee, 0.32));
        pillar.position.y = 4;
        group.add(pillar);
        const ring = new THREE.Mesh(ringGeo, basicMat(0x67e8f9, 0.85));
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.2;
        group.add(ring);
        break;
      }
    }

    scene.add(group);
    return { group, anim, seeds };
  };

  // ===== 各技能的逐幀更新（progress 0~1） =====
  const updateSkillGroup = (entry: SkillFxEntry, progress: number, now: number) => {
    const { group, anim, seeds } = entry;
    const fade = 1 - progress;

    switch (anim.skillId) {
      case 'lightningStorm': {
        group.children.forEach((c, i) => {
          const flick = Math.sin(now * 0.05 + seeds[i * 2 + 1] * 20) > -0.2 ? 1 : 0.15;
          ((c as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = fade * flick;
        });
        break;
      }
      case 'frozenTime': {
        const [disk, ring] = group.children as THREE.Mesh[];
        // 前 10% 淡入、後 25% 淡出
        const env = progress < 0.1 ? progress / 0.1 : progress > 0.75 ? (1 - progress) / 0.25 : 1;
        (disk.material as THREE.MeshBasicMaterial).opacity = 0.16 * env;
        ring.scale.setScalar(0.5 + progress * 10);
        (ring.material as THREE.MeshBasicMaterial).opacity = 0.8 * (1 - progress);
        break;
      }
      case 'cashRain': {
        group.children.forEach((c, i) => {
          const phase = seeds[i * 2 + 1];
          const t = Math.max(0, Math.min(1, progress * 1.6 - phase * 0.5));
          c.position.y = 5 - t * 4.9;
          c.rotation.x = now * 0.004 + phase * 9;
          c.rotation.z = now * 0.003 + phase * 7;
          ((c as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = t >= 1 ? 0 : 0.95 * fade;
        });
        break;
      }
      case 'battleInspire': {
        group.children.forEach((c, i) => {
          const local = Math.max(0, Math.min(1, progress * 1.4 - i * 0.25));
          c.scale.setScalar(0.5 + local * 9);
          ((c as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 0.85 * (1 - local);
        });
        break;
      }
      case 'meteorStorm': {
        group.children.forEach((c, i) => {
          const phase = seeds[i * 3 + 2];
          const t = Math.max(0, Math.min(1, progress * 1.8 - phase * 0.7));
          const { tx, tz } = c.userData as { tx: number; tz: number };
          c.position.set(tx + 3 * (1 - t), 7 * (1 - t) + 0.2, tz - 3 * (1 - t));
          ((c as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = t >= 1 ? 0 : 1;
        });
        break;
      }
      case 'chainLightning': {
        const flick = Math.sin(now * 0.06) > -0.4 ? 1 : 0.3;
        group.children.forEach((c) => {
          ((c as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = fade * flick;
        });
        break;
      }
      case 'holyHeal': {
        const [pillar, ring] = group.children as THREE.Mesh[];
        const env = progress < 0.15 ? progress / 0.15 : progress > 0.7 ? (1 - progress) / 0.3 : 1;
        (pillar.material as THREE.MeshBasicMaterial).opacity = 0.35 * env;
        pillar.rotation.y = now * 0.001;
        ring.scale.setScalar(0.5 + progress * 8);
        (ring.material as THREE.MeshBasicMaterial).opacity = 0.8 * (1 - progress);
        break;
      }
      case 'warpTrap': {
        group.children.forEach((c) => {
          const mesh = c as THREE.Mesh;
          const mat = mesh.material as THREE.MeshBasicMaterial;
          const role = (mesh.userData as { role?: string }).role;
          if (role === 'from') {
            // 起點環：前半段由 1.1 收縮至 0.15 後消失
            const t = Math.min(1, progress / 0.5);
            mesh.scale.setScalar(Math.max(0.15, 1.1 * (1 - t)));
            mat.opacity = progress < 0.5 ? 0.9 * (1 - t * 0.5) : 0;
            mesh.rotation.z = now * 0.004;
          } else if (role === 'to') {
            // 落點環：後半段由 0.2 擴張至 1.5 並淡出
            const t = Math.max(0, (progress - 0.45) / 0.55);
            mesh.scale.setScalar(0.2 + t * 1.3);
            mat.opacity = t <= 0 ? 0 : 0.9 * (1 - t);
            mesh.rotation.z = -now * 0.004;
          } else {
            // 連接段：中段最亮、帶閃爍
            const flick = Math.sin(now * 0.05) > -0.3 ? 1 : 0.4;
            const mid = Math.sin(Math.min(1, progress) * Math.PI);
            mat.opacity = 0.5 * mid * flick;
          }
        });
        break;
      }
      case 'empPulse': {
        const [pillar, ring] = group.children as THREE.Mesh[];
        const env = progress < 0.15 ? progress / 0.15 : progress > 0.7 ? (1 - progress) / 0.3 : 1;
        (pillar.material as THREE.MeshBasicMaterial).opacity = 0.32 * env;
        pillar.rotation.y = now * 0.002;
        ring.scale.setScalar(0.5 + progress * 9);
        (ring.material as THREE.MeshBasicMaterial).opacity = 0.85 * (1 - progress);
        break;
      }
    }
  };

  const disposeGroup = (group: THREE.Group) => {
    scene.remove(group);
    for (const child of group.children) {
      ((child as THREE.Mesh).material as THREE.Material).dispose();
    }
  };

  const syncSkills: SkillFx3D['syncSkills'] = (anims, toWorld, now) => {
    const alive = new Set<string>();
    for (const anim of anims) {
      alive.add(anim.id);
      let entry = fxMap.get(anim.id);
      if (!entry) {
        entry = buildSkillGroup(anim, toWorld);
        fxMap.set(anim.id, entry);
      }
      const progress = fxProgress(anim.startTime, anim.duration, now);
      updateSkillGroup(entry, progress, now);
    }
    for (const [id, entry] of fxMap) {
      if (!alive.has(id)) {
        disposeGroup(entry.group);
        fxMap.delete(id);
      }
    }
  };

  // ===== 火焰塔噴射束 =====
  const flameMap = new Map<string, { group: THREE.Group; inner: THREE.Mesh; outer: THREE.Mesh }>();
  const coneGeoOuter = new THREE.ConeGeometry(0.3, 1, 12, 1, true);
  const coneGeoInner = new THREE.ConeGeometry(0.16, 1, 10, 1, true);

  const syncFlames: SkillFx3D['syncFlames'] = (snapshot, toWorld, now) => {
    const alive = new Set<string>();
    const frames = snapshot.towers;
    for (let i = 0; i < snapshot.towerCount; i++) {
      const t = frames[i];
      const data = getTowerData(t.type);
      if (!data?.flameEffect || !t.targetId) continue;
      // 與 2D 同一條解析路徑：契約的 targetId → 敵人 frame
      const target = enemyFrameById(snapshot, t.targetId);
      if (!target || target.health <= 0) continue;
      alive.add(t.id);

      let fx = flameMap.get(t.id);
      if (!fx) {
        const group = new THREE.Group();
        const outer = new THREE.Mesh(coneGeoOuter, basicMat(0xf97316, 0.4));
        const inner = new THREE.Mesh(coneGeoInner, basicMat(0xfde047, 0.55));
        group.add(outer);
        group.add(inner);
        scene.add(group);
        fx = { group, inner, outer };
        flameMap.set(t.id, fx);
      }

      const [tx, tz] = toWorld(t.pos.x - 0.5, t.pos.y - 0.5);
      const [ex, ez] = toWorld(target.x, target.y);
      const dx = ex - tx;
      const dz = ez - tz;
      const len = Math.max(0.5, Math.sqrt(dx * dx + dz * dz));
      const pulse = 1 + Math.sin(now * 0.02) * 0.12;

      // 錐體：尖端在塔砲口、開口朝目標（Cone 預設沿 +Y，旋轉後沿水平指向）
      fx.group.position.set(tx + dx / 2, 0.55, tz + dz / 2);
      fx.group.rotation.set(0, -Math.atan2(dz, dx), -Math.PI / 2);
      fx.group.scale.set(pulse, len, pulse);
      (fx.outer.material as THREE.MeshBasicMaterial).opacity = 0.32 + Math.sin(now * 0.03) * 0.08;
    }
    for (const [id, fx] of flameMap) {
      if (!alive.has(id)) {
        scene.remove(fx.group);
        (fx.inner.material as THREE.Material).dispose();
        (fx.outer.material as THREE.Material).dispose();
        flameMap.delete(id);
      }
    }
  };

  const dispose = () => {
    for (const [, entry] of fxMap) disposeGroup(entry.group);
    fxMap.clear();
    for (const [, fx] of flameMap) {
      scene.remove(fx.group);
      (fx.inner.material as THREE.Material).dispose();
      (fx.outer.material as THREE.Material).dispose();
    }
    flameMap.clear();
    for (const g of [pillarGeo, bigPillarGeo, ringGeo, diskGeo, cubeGeo, meteorGeo, segGeo, coneGeoOuter, coneGeoInner]) {
      g.dispose();
    }
  };

  return { syncSkills, syncFlames, dispose };
}
