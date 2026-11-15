// 新工坊（Studio）狀態：專案／六類可重用資產／選取狀態。
//
// 契約由 lead 鎖定：projects、assets、activeProjectId，
// createProject／updateProject／duplicateProject／deleteProject／setActiveProject／
// listAssets／upsertAsset／deleteAsset／getProject／getAsset，
// 以及關卡 CRUD：addLevel／updateLevel／deleteLevel／getLevel。
//
// 刪除一律「先問引用」：專案引用中的資產不給刪，並回 i18n key 讓 UI 顯示原因。

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  WorkshopArtAsset,
  WorkshopArtData,
  WorkshopAsset,
  WorkshopAssetKind,
  WorkshopEnemyAsset,
  WorkshopEnemyData,
  WorkshopLevel,
  WorkshopMapAsset,
  WorkshopMapData,
  WorkshopProject,
  WorkshopRuleSet,
  WorkshopRuleSetAsset,
  WorkshopScriptAsset,
  WorkshopScriptData,
  WorkshopTowerAsset,
  WorkshopTowerData,
} from '@/types/workshop';
import { DEFAULT_WIN_CONDITIONS } from '@/workshop/model/winsConditions';
import { assetIdPrefix, createWorkshopId } from '@/workshop/ids';
import { findAssetReferences, findDependentAssetIds } from '@/workshop/compile/assetGraph';

const RECENT_LIMIT = 8;

const DEFAULT_TOWER_DATA: WorkshopTowerData = {
  baseType: 'basic',
  damage: 10,
  range: 3,
  fireRate: 1,
  cost: 50,
  color: '#7dd3fc',
  projectileColor: '#38bdf8',
  highlightColor: '#0ea5e9',
};

const DEFAULT_ENEMY_DATA: WorkshopEnemyData = {
  baseType: 'normal',
  health: 100,
  speed: 60,
  reward: 10,
  size: 14,
  color: '#f97316',
};

const DEFAULT_MAP_DATA: WorkshopMapData = {
  difficulty: 'normal',
  waypoints: [],
  blockedAreas: [],
  grid: { cols: 16, rows: 12 },
};

const DEFAULT_RULE_SET: WorkshopRuleSet = { rules: [] };

const DEFAULT_SCRIPT_DATA: WorkshopScriptData = {
  code: '',
  hooks: [],
  permissions: [],
  enabled: true,
};

const DEFAULT_ART_DATA: WorkshopArtData = {
  artKind: 'icon',
  mime: 'image/png',
  payload: '',
};

interface WorkshopDeleteAssetResult {
  ok: boolean;
  /** 阻擋原因的 i18n key（studio.* 命名空間） */
  reason?: string;
}

interface WorkshopStore {
  projects: WorkshopProject[];
  assets: WorkshopAsset[];
  activeProjectId: string | null;
  activeLevelId: string | null;
  selectedAssetId: string | null;
  /** 最近編輯的專案 id（最新在前，上限 RECENT_LIMIT） */
  recentProjectIds: string[];

  createProject: (name: string) => string;
  updateProject: (id: string, patch: Partial<WorkshopProject>) => void;
  duplicateProject: (id: string) => string | null;
  deleteProject: (id: string) => void;
  setActiveProject: (id: string | null) => void;
  getProject: (id: string) => WorkshopProject | undefined;

  addLevel: (projectId: string, level: WorkshopLevel) => void;
  newLevel: (projectId: string, name: string) => string | null;
  updateLevel: (projectId: string, levelId: string, patch: Partial<WorkshopLevel>) => void;
  deleteLevel: (projectId: string, levelId: string) => void;
  getLevel: (projectId: string, levelId: string) => WorkshopLevel | null;
  setActiveLevel: (levelId: string | null) => void;

  listAssets: (kind: WorkshopAssetKind) => WorkshopAsset[];
  createAsset: (kind: WorkshopAssetKind, name: string) => string;
  upsertAsset: (asset: WorkshopAsset) => void;
  deleteAsset: (id: string) => WorkshopDeleteAssetResult;
  getAsset: (id: string) => WorkshopAsset | undefined;
  setSelectedAsset: (assetId: string | null) => void;
}

function cloneValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function makeLevel(name: string): WorkshopLevel {
  const now = Date.now();
  return {
    id: createWorkshopId('level'),
    name,
    description: '',
    mapAssetId: null,
    waves: [],
    winConditions: { ...DEFAULT_WIN_CONDITIONS },
    ruleOverrides: [],
    startingResources: {
      money: DEFAULT_WIN_CONDITIONS.initialMoney ?? 150,
      health: DEFAULT_WIN_CONDITIONS.baseHealth ?? 20,
      waveDelayMult: 1,
    },
    ruleSetRef: null,
    towerRefs: [],
    scriptRefs: [],
    artRefs: [],
    createdAt: now,
    updatedAt: now,
  };
}

function makeAsset(kind: WorkshopAssetKind, name: string): WorkshopAsset {
  const now = Date.now();
  const id = createWorkshopId(assetIdPrefix(kind));
  const base = { id, name, version: '1.0.0', createdAt: now, updatedAt: now, dependsOn: [] as string[] };

  switch (kind) {
    case 'tower': {
      const tower: WorkshopTowerAsset = { ...base, kind: 'tower', data: { ...DEFAULT_TOWER_DATA } };
      return tower;
    }
    case 'enemy': {
      const enemy: WorkshopEnemyAsset = { ...base, kind: 'enemy', data: { ...DEFAULT_ENEMY_DATA } };
      return enemy;
    }
    case 'map': {
      const map: WorkshopMapAsset = { ...base, kind: 'map', data: cloneValue(DEFAULT_MAP_DATA) };
      return map;
    }
    case 'ruleSet': {
      const ruleSet: WorkshopRuleSetAsset = { ...base, kind: 'ruleSet', data: cloneValue(DEFAULT_RULE_SET) };
      return ruleSet;
    }
    case 'script': {
      const script: WorkshopScriptAsset = { ...base, kind: 'script', data: cloneValue(DEFAULT_SCRIPT_DATA) };
      return script;
    }
    case 'art': {
      const art: WorkshopArtAsset = { ...base, kind: 'art', data: { ...DEFAULT_ART_DATA } };
      return art;
    }
  }
}

function promoteRecent(recentProjectIds: string[], id: string): string[] {
  return [id, ...recentProjectIds.filter((item) => item !== id)].slice(0, RECENT_LIMIT);
}

export const useWorkshopStore = create<WorkshopStore>()(
  persist(
    (set, get) => ({
      projects: [],
      assets: [],
      activeProjectId: null,
      activeLevelId: null,
      selectedAssetId: null,
      recentProjectIds: [],

      createProject: (name) => {
        const now = Date.now();
        const level = makeLevel(name);
        const project: WorkshopProject = {
          id: createWorkshopId('project'),
          name,
          description: '',
          thumbnail: '',
          version: '1.0.0',
          author: '',
          license: 'all-rights-reserved',
          signature: null,
          ruleSetRef: null,
          winConditions: { ...DEFAULT_WIN_CONDITIONS },
          assetRefs: [],
          levels: [level],
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          projects: [...state.projects, project],
          activeProjectId: project.id,
          activeLevelId: level.id,
          recentProjectIds: promoteRecent(state.recentProjectIds, project.id),
        }));
        return project.id;
      },

      updateProject: (id, patch) => {
        set((state) => {
          let found = false;
          const projects = state.projects.map((project) => {
            if (project.id !== id) return project;
            found = true;
            return { ...project, ...patch, id: project.id, createdAt: project.createdAt, updatedAt: Date.now() };
          });
          if (!found) return state;
          return { projects, recentProjectIds: promoteRecent(state.recentProjectIds, id) };
        });
      },

      duplicateProject: (id) => {
        const source = get().projects.find((project) => project.id === id);
        if (!source) return null;

        const now = Date.now();
        const levels = source.levels.map((level) => ({
          ...cloneValue(level),
          id: createWorkshopId('level'),
          createdAt: now,
          updatedAt: now,
        }));
        const copy: WorkshopProject = {
          ...cloneValue(source),
          id: createWorkshopId('project'),
          levels,
          signature: null,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          projects: [...state.projects, copy],
          activeProjectId: copy.id,
          activeLevelId: levels[0]?.id ?? null,
          recentProjectIds: promoteRecent(state.recentProjectIds, copy.id),
        }));
        return copy.id;
      },

      deleteProject: (id) => {
        set((state) => {
          if (!state.projects.some((project) => project.id === id)) return state;
          const projects = state.projects.filter((project) => project.id !== id);
          const wasActive = state.activeProjectId === id;
          const nextActiveId = wasActive ? projects[0]?.id ?? null : state.activeProjectId;
          const nextActive = projects.find((project) => project.id === nextActiveId) ?? null;
          return {
            projects,
            activeProjectId: nextActiveId,
            activeLevelId: wasActive ? nextActive?.levels[0]?.id ?? null : state.activeLevelId,
            recentProjectIds: state.recentProjectIds.filter((recentId) => recentId !== id),
          };
        });
      },

      setActiveProject: (id) => {
        if (id === null) {
          set({ activeProjectId: null, activeLevelId: null });
          return;
        }
        const project = get().projects.find((item) => item.id === id);
        if (!project) return;
        set({ activeProjectId: project.id, activeLevelId: project.levels[0]?.id ?? null });
      },

      getProject: (id) => get().projects.find((project) => project.id === id),

      addLevel: (projectId, level) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? { ...project, levels: [...project.levels, level], updatedAt: Date.now() }
              : project,
          ),
          activeLevelId: state.activeProjectId === projectId ? state.activeLevelId ?? level.id : state.activeLevelId,
        }));
      },

      newLevel: (projectId, name) => {
        const project = get().projects.find((item) => item.id === projectId);
        if (!project) return null;
        const level = makeLevel(name);
        get().addLevel(projectId, level);
        return level.id;
      },

      updateLevel: (projectId, levelId, patch) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  levels: project.levels.map((level) =>
                    level.id === levelId
                      ? { ...level, ...patch, id: level.id, createdAt: level.createdAt, updatedAt: Date.now() }
                      : level,
                  ),
                  updatedAt: Date.now(),
                }
              : project,
          ),
        }));
      },

      deleteLevel: (projectId, levelId) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? { ...project, levels: project.levels.filter((level) => level.id !== levelId), updatedAt: Date.now() }
              : project,
          ),
          activeLevelId: state.activeLevelId === levelId ? null : state.activeLevelId,
        }));
      },

      getLevel: (projectId, levelId) => {
        const project = get().projects.find((item) => item.id === projectId);
        return project?.levels.find((level) => level.id === levelId) ?? null;
      },

      setActiveLevel: (levelId) => set({ activeLevelId: levelId }),

      listAssets: (kind) => get().assets.filter((asset) => asset.kind === kind),

      createAsset: (kind, name) => {
        const asset = makeAsset(kind, name);
        set((state) => ({ assets: [...state.assets, asset] }));
        return asset.id;
      },

      upsertAsset: (asset) => {
        set((state) => ({
          assets: state.assets.some((item) => item.id === asset.id)
            ? state.assets.map((item) => (item.id === asset.id ? asset : item))
            : [...state.assets, asset],
        }));
      },

      deleteAsset: (id) => {
        const { projects, assets } = get();
        if (!assets.some((asset) => asset.id === id)) {
          return { ok: false, reason: 'studio.asset.notFound' };
        }
        if (findAssetReferences(projects, assets, id).length > 0) {
          return { ok: false, reason: 'studio.asset.inUse' };
        }
        if (findDependentAssetIds(assets, id).length > 0) {
          return { ok: false, reason: 'studio.asset.dependedOn' };
        }
        set((state) => ({
          assets: state.assets.filter((asset) => asset.id !== id),
          selectedAssetId: state.selectedAssetId === id ? null : state.selectedAssetId,
        }));
        return { ok: true };
      },

      getAsset: (id) => get().assets.find((asset) => asset.id === id),

      setSelectedAsset: (assetId) => set({ selectedAssetId: assetId }),
    }),
    {
      name: 'guagua-workshop',
      version: 1,
      partialize: (state) => ({
        projects: state.projects,
        assets: state.assets,
        activeProjectId: state.activeProjectId,
        activeLevelId: state.activeLevelId,
        selectedAssetId: state.selectedAssetId,
        recentProjectIds: state.recentProjectIds,
      }),
    },
  ),
);
