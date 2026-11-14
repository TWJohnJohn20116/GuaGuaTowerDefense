/** batch13：dev-panel 敵人/塔選擇器文案 */

const ZH = {
  pickerEnemyFooter: '{count} 種敵人 · 點擊外部關閉',
  pickerTowerFooter: '{count} 種塔 · 點擊外部關閉',
  pickerEnemyTitle: '{name}\nHP: {hp}\n速度: {speed}\n獎勵: ${reward}',
  pickerTowerTitle: '{name}\n價格: ${cost}\n傷害: {damage}\n射程: {range}\n攻速: {rate}/s',
};

const EN = {
  pickerEnemyFooter: '{count} enemy types · click outside to close',
  pickerTowerFooter: '{count} tower types · click outside to close',
  pickerEnemyTitle: '{name}\nHP: {hp}\nSpeed: {speed}\nReward: ${reward}',
  pickerTowerTitle: '{name}\nCost: ${cost}\nDamage: {damage}\nRange: {range}\nFire rate: {rate}/s',
};

const JA = {
  pickerEnemyFooter: '{count} 種類の敵 · 外側クリックで閉じる',
  pickerTowerFooter: '{count} 種類のタワー · 外側クリックで閉じる',
  pickerEnemyTitle: '{name}\nHP: {hp}\n速度: {speed}\n報酬: ${reward}',
  pickerTowerTitle: '{name}\n価格: ${cost}\nダメージ: {damage}\n射程: {range}\n攻速: {rate}/s',
};

const KO = {
  pickerEnemyFooter: '{count}종 적 · 바깥 클릭으로 닫기',
  pickerTowerFooter: '{count}종 타워 · 바깥 클릭으로 닫기',
  pickerEnemyTitle: '{name}\nHP: {hp}\n속도: {speed}\n보상: ${reward}',
  pickerTowerTitle: '{name}\n가격: ${cost}\n피해: {damage}\n사거리: {range}\n공속: {rate}/s',
};

const DE = {
  pickerEnemyFooter: '{count} Gegnertypen · außerhalb klicken zum Schließen',
  pickerTowerFooter: '{count} Turmtypen · außerhalb klicken zum Schließen',
  pickerEnemyTitle: '{name}\nHP: {hp}\nTempo: {speed}\nBelohnung: ${reward}',
  pickerTowerTitle: '{name}\nKosten: ${cost}\nSchaden: {damage}\nReichweite: {range}\nFeuerrate: {rate}/s',
};

const FR = {
  pickerEnemyFooter: '{count} types d\'ennemis · cliquer dehors pour fermer',
  pickerTowerFooter: '{count} types de tours · cliquer dehors pour fermer',
  pickerEnemyTitle: '{name}\nPV: {hp}\nVitesse: {speed}\nRécompense: ${reward}',
  pickerTowerTitle: '{name}\nPrix: ${cost}\nDégâts: {damage}\nPortée: {range}\nCadence: {rate}/s',
};

const ES = {
  pickerEnemyFooter: '{count} tipos de enemigos · clic fuera para cerrar',
  pickerTowerFooter: '{count} tipos de torres · clic fuera para cerrar',
  pickerEnemyTitle: '{name}\nPV: {hp}\nVelocidad: {speed}\nRecompensa: ${reward}',
  pickerTowerTitle: '{name}\nPrecio: ${cost}\nDaño: {damage}\nAlcance: {range}\nCadencia: {rate}/s',
};

const RU = {
  pickerEnemyFooter: '{count} типов врагов · клик снаружи, чтобы закрыть',
  pickerTowerFooter: '{count} типов башен · клик снаружи, чтобы закрыть',
  pickerEnemyTitle: '{name}\nHP: {hp}\nСкорость: {speed}\nНаграда: ${reward}',
  pickerTowerTitle: '{name}\nЦена: ${cost}\nУрон: {damage}\nДальность: {range}\nСкорострельность: {rate}/s',
};

const PT = {
  pickerEnemyFooter: '{count} tipos de inimigos · clique fora para fechar',
  pickerTowerFooter: '{count} tipos de torres · clique fora para fechar',
  pickerEnemyTitle: '{name}\nHP: {hp}\nVelocidade: {speed}\nRecompensa: ${reward}',
  pickerTowerTitle: '{name}\nPreço: ${cost}\nDano: {damage}\nAlcance: {range}\nCadência: {rate}/s',
};

const MAP = {
  'zh-TW': ZH,
  'zh-CN': ZH,
  en: EN,
  ja: JA,
  ko: KO,
  de: DE,
  fr: FR,
  es: ES,
  ru: RU,
  pt: PT,
};

export function getDevPickerUi(loc) {
  return MAP[loc] ?? EN;
}

export const PICKER_KEYS = Object.keys(ZH);
