/**
 * 關卡解鎖解析（純函式）
 *
 * 規則：關卡若有 requiresLevelId，必須「那一關已完成」才解鎖；
 * 需求鏈可以多層，遇到環或指向不存在的關卡時視為鎖住（不會讓整份清單炸掉）。
 */
import type { WorkshopLevel, WorkshopProject } from '@/types/workshop';

export interface LevelLockState {
  locked: boolean;
  /** 尚未完成的前置關卡名稱（給 UI 顯示） */
  missing: string[];
}

export function resolveLevelLocks(
  project: WorkshopProject,
  completedIds: readonly string[],
): Map<string, LevelLockState> {
  const completed = new Set(completedIds);
  const byId = new Map(project.levels.map((level) => [level.id, level]));
  const result = new Map<string, LevelLockState>();

  const resolve = (level: WorkshopLevel, trail: Set<string>): LevelLockState => {
    const requirement = level.requiresLevelId ?? null;
    if (!requirement) return { locked: false, missing: [] };
    const required = byId.get(requirement);
    if (!required) return { locked: true, missing: [requirement] };
    if (completed.has(required.id)) return { locked: false, missing: [] };
    if (trail.has(level.id)) return { locked: true, missing: [required.name] };
    trail.add(level.id);
    const upstream = resolve(required, trail);
    trail.delete(level.id);
    return { locked: true, missing: [required.name, ...upstream.missing] };
  };

  for (const level of project.levels) {
    result.set(level.id, resolve(level, new Set()));
  }
  return result;
}
