/** batch26：百科 / 工坊額外 key */
export const BATCH26_ENC_KEYS = ['totalActiveSkillsCount'];

const ZH = { totalActiveSkillsCount: '共 {count} 個主動技能' };
const EN = { totalActiveSkillsCount: '{count} active skills' };
const JA = { totalActiveSkillsCount: 'アクティブスキル {count} 件' };
const KO = { totalActiveSkillsCount: '액티브 스킬 {count}개' };
const DE = { totalActiveSkillsCount: '{count} aktive Fähigkeiten' };
const FR = { totalActiveSkillsCount: '{count} compétences actives' };

const MAP = {
  'zh-TW': ZH, 'zh-CN': ZH, en: EN, ja: JA, ko: KO, de: DE, fr: FR, es: EN, ru: EN, pt: EN,
};

export function getBatch26Enc(loc) {
  return { ...EN, ...MAP[loc] };
}

export function formatBatch26EncLines(loc) {
  const d = getBatch26Enc(loc);
  return BATCH26_ENC_KEYS.map((k) => `    ${k}: ${JSON.stringify(d[k])},`).join('\n');
}
