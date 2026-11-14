/**
 * Mod 編輯器 · 圖標編輯器 emoji 分類 / 底色 i18n
 */
import type { Translations } from '@/i18n';

type M = Translations['modEditorExt'];

const EMOJI_DATA: Record<string, string[]> = {
  tower: ['🗼', '🏰', '🏯', '🏗️', '🏭', '⛩️', '🗽', '🏛️', '🛖', '🏠', '⛺', '🧱', '🛡️', '🚪', '🕋', '🕌', '🕍', '🏟️', '🎪', '🎡', '🎢', '🎠', '⛲', '⛱️'],
  weapon: ['🗡️', '⚔️', '🏹', '💣', '🧨', '🔫', '🪓', '⛏️', '🔨', '🛠️', '🪃', '🛡️', '🚁', '🛸', '🛰️', '⚓', '💥', '🔪'],
  magic: ['🪄', '🔮', '🧪', '🧿', '💧', '⚡', '❄️', '🌪️', '🌀', '☄️', '💥', '✨', '🌟', '💫', '🔱', '⚜️', '🪬', '🧞', '🧜', '🧚', '🧙', '🧝', '🧛', '🧟', '🦸', '🦹'],
  monster: ['👾', '👽', '👻', '💀', '☠️', '🧟', '🧛', '🐲', '🐉', '🦖', '🦇', '🕷️', '🦂', '🐍', '🐺', '🐗', '🐙', '🦑', '🦕', '🐊', '🦈', '🐅', '🐆', '🦍', '🦧', '🦣', '🦠'],
  nature: ['🌲', '🌳', '🌴', '🌵', '🍄', '🌺', '🌹', '🌻', '🍁', '🍂', '🌿', '🌱', '☀️', '🌙', '☁️', '⛅', '☔', '🌩️', '🌈', '⛄', '🔥', '💧', '🌊', '🌬️', '❄️', '🌪️', '🌫️'],
  terrain: ['🏔️', '⛰️', '🌋', '🏜️', '🏝️', '🏞️', '🗺️', '🧭', '🌌', '🌃', '🌉', '🌊', '🛤️', '🛣️', '🚂', '🛸', '🚀', '🚁', '🛶', '⛵', '🛳️', '⛴️', '🚢'],
  treasure: ['👑', '💎', '💍', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '📦', '🎁', '💰', '🪙', '💸', '💵', '💴', '💶', '💷', '🔑', '🗝️', '📜', '🩸', '🛍️', '🛒', '🔮', '🧿', '📿'],
  status: ['❤️', '💔', '💢', '💤', '💦', '💨', '🎯', '⚕️', '☣️', '☢️', '⚠️', '🛑', '⛔', '✅', '❌', '💯', '⬆️', '⬇️', '🛡️', '🔥', '🧊', '⚡', '☠️', '💫', '⚔️'],
  armor: ['🪖', '👑', '🧢', '🎩', '🎓', '👢', '🥾', '👟', '🎒', '🧳', '🥽', '👓', '🕶️', '🧣', '🧤', '🧥', '🦺', '👔', '👕', '👖', '🧦', '👗', '👘', '🥻', '🩱'],
  food: ['🍎', '🍏', '🍄', '🍖', '🍗', '🥩', '🍔', '🍕', '🌭', '🥪', '🌮', '🌯', '🍲', '🍜', '🍝', '🥫', '🍞', '🥐', '🥖', '🥨', '🧀', '🥗', '🥙', '🍳', '🥘', '🥣'],
  potion: ['🧪', '🩸', '💧', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧉', '🍾', '🍶', '🍵', '☕', '🧃', '🥤', '🧋', '🥛', '🍼', '💊', '💉', '🩹', '🩺'],
  tech: ['🤖', '💻', '📱', '🔋', '🔌', '💡', '🛰️', '🚀', '🛸', '🦾', '🦿', '🕹️', '🖲️', '💽', '💾', '💿', '📀', '📡', '🔭', '🔬', '⚙️', '🗜️', '⚖️', '🧭'],
  animal: ['🦅', '🦉', '🐢', '🦈', '🐎', '🦄', '🦌', '🐪', '🐘', '🐅', '🐆', '🦓', '🦍', '🦧', '🦣', '🦏', '🦛', '🐁', '🐀', '🐂', '🐃', '🐄', '🐇', '🐈', '🐉'],
  symbol: ['⚙️', '⏳', '⌛', '🔔', '📢', '📣', '👁️', '🧠', '🦴', '🦷', '🐾', '🎲', '🧩', '🎨', '💠', '🔘', '🔳', '🔲', '🔺', '🔻', '🔸', '🔹', '🔶', '🔷', '🔴', '🔵', '⚫'],
};

const EMOJI_CAT_IDS = [
  'tower', 'weapon', 'magic', 'monster', 'nature', 'terrain', 'treasure',
  'status', 'armor', 'food', 'potion', 'tech', 'animal', 'symbol',
] as const;

const EMOJI_CAT_KEY: Record<typeof EMOJI_CAT_IDS[number], keyof M> = {
  tower: 'iconEmojiCatTower',
  weapon: 'iconEmojiCatWeapon',
  magic: 'iconEmojiCatMagic',
  monster: 'iconEmojiCatMonster',
  nature: 'iconEmojiCatNature',
  terrain: 'iconEmojiCatTerrain',
  treasure: 'iconEmojiCatTreasure',
  status: 'iconEmojiCatStatus',
  armor: 'iconEmojiCatArmor',
  food: 'iconEmojiCatFood',
  potion: 'iconEmojiCatPotion',
  tech: 'iconEmojiCatTech',
  animal: 'iconEmojiCatAnimal',
  symbol: 'iconEmojiCatSymbol',
};

const BG_IDS = [
  'transparent', 'deepBlack', 'glacier', 'crimson', 'jade', 'amethyst', 'amber', 'pureWhite',
] as const;

const BG_VALUES: Record<typeof BG_IDS[number], string> = {
  transparent: 'transparent',
  deepBlack: '#12141a',
  glacier: '#1a2433',
  crimson: '#331a1a',
  jade: '#1a3324',
  amethyst: '#241a33',
  amber: '#332a1a',
  pureWhite: '#ffffff',
};

const BG_KEY: Record<typeof BG_IDS[number], keyof M> = {
  transparent: 'iconBgTransparent',
  deepBlack: 'iconBgDeepBlack',
  glacier: 'iconBgGlacier',
  crimson: 'iconBgCrimson',
  jade: 'iconBgJade',
  amethyst: 'iconBgAmethyst',
  amber: 'iconBgAmber',
  pureWhite: 'iconBgPureWhite',
};

export function getEmojiCategories(m: M) {
  return EMOJI_CAT_IDS.map((id) => ({
    id,
    name: String(m[EMOJI_CAT_KEY[id]]),
    emojis: EMOJI_DATA[id],
  }));
}

export function getIconBackgroundColors(m: M) {
  return BG_IDS.map((id) => ({
    id,
    name: String(m[BG_KEY[id]]),
    value: BG_VALUES[id],
  }));
}
