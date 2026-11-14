import type { PlayerSkill, PlayerSkillId } from '@/data/playerSkillData';
import type { Translations } from '@/i18n';

export function getPlayerSkillName(skill: PlayerSkill, t: Translations): string {
  return t.playerSkills[skill.id as PlayerSkillId]?.name ?? skill.nameZh;
}

export function getPlayerSkillDesc(skill: PlayerSkill, t: Translations): string {
  return t.playerSkills[skill.id as PlayerSkillId]?.desc ?? skill.descZh;
}

function getPlayerSkillById(id: PlayerSkillId, t: Translations): { name: string; desc: string } {
  const entry = t.playerSkills[id];
  return entry ?? { name: id, desc: '' };
}

/** 搜尋用：回傳當前語系名稱與描述的小寫字串 */
export function getPlayerSkillSearchText(id: PlayerSkillId, t: Translations): string {
  const { name, desc } = getPlayerSkillById(id, t);
  return `${name} ${desc}`.toLowerCase();
}
