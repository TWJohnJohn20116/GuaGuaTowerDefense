/** batch19：3D 編輯器 49 種部件名稱 i18n */

export const SHAPE_IDS = [
  'base', 'baseWide', 'baseTall', 'baseHex', 'skirt', 'skirtHex', 'collar', 'leg',
  'turret', 'turretBig', 'dome', 'pole', 'plate', 'shield',
  'barrel', 'barrelLong', 'barrelFat', 'barrelShort', 'muzzle', 'muzzleWide', 'brake', 'shroud', 'scope', 'nozzle', 'blade',
  'orb', 'orbSmall', 'crystal', 'crystalSmall', 'cone', 'spike', 'coil', 'torus', 'ringThin', 'bandRing', 'halo', 'energyBeam', 'lens',
  'ammoBox', 'tank', 'pipe', 'fin', 'antenna', 'valve', 'bolt', 'coin', 'coinSmall', 'nacelle', 'tailFin',
];

export function shapeKey(id) {
  return `m3dShape${id.charAt(0).toUpperCase()}${id.slice(1)}`;
}

export const SHAPE_KEYS = SHAPE_IDS.map(shapeKey);

const ZH = {
  base: '圓底座', baseWide: '寬底座', baseTall: '高塔身', baseHex: '六稜座', skirt: '裙邊', skirtHex: '六稜裙邊', collar: '頸環', leg: '支撐腿',
  turret: '球形砲塔', turretBig: '大球塔', dome: '半球頂', pole: '長杆', plate: '裝甲板', shield: '護盾板',
  barrel: '砲管', barrelLong: '長砲管', barrelFat: '粗砲管', barrelShort: '短砲管', muzzle: '砲口', muzzleWide: '寬砲口', brake: '制退器', shroud: '套筒', scope: '瞄準鏡', nozzle: '噴嘴', blade: '葉片',
  orb: '能量球', orbSmall: '小光球', crystal: '大水晶', crystalSmall: '小水晶', cone: '錐體', spike: '尖刺', coil: '線圈', torus: '大環', ringThin: '細環', bandRing: '腰環', halo: '光環', energyBeam: '能量柱', lens: '透鏡',
  ammoBox: '彈藥箱', tank: '副油罐', pipe: '管線', fin: '散熱片', antenna: '天線', valve: '閥門', bolt: '鉚釘', coin: '金幣', coinSmall: '小金幣', nacelle: '機艙', tailFin: '尾舵',
};

const EN = {
  base: 'Round base', baseWide: 'Wide base', baseTall: 'Tall body', baseHex: 'Hex base', skirt: 'Skirt', skirtHex: 'Hex skirt', collar: 'Collar ring', leg: 'Support leg',
  turret: 'Ball turret', turretBig: 'Large ball', dome: 'Hemisphere', pole: 'Long pole', plate: 'Armor plate', shield: 'Shield plate',
  barrel: 'Barrel', barrelLong: 'Long barrel', barrelFat: 'Thick barrel', barrelShort: 'Short barrel', muzzle: 'Muzzle', muzzleWide: 'Wide muzzle', brake: 'Muzzle brake', shroud: 'Shroud', scope: 'Scope', nozzle: 'Nozzle', blade: 'Blade',
  orb: 'Energy orb', orbSmall: 'Small orb', crystal: 'Large crystal', crystalSmall: 'Small crystal', cone: 'Cone', spike: 'Spike', coil: 'Coil', torus: 'Large ring', ringThin: 'Thin ring', bandRing: 'Waist ring', halo: 'Halo', energyBeam: 'Energy beam', lens: 'Lens',
  ammoBox: 'Ammo box', tank: 'Fuel tank', pipe: 'Pipe', fin: 'Heat fin', antenna: 'Antenna', valve: 'Valve', bolt: 'Rivet', coin: 'Coin', coinSmall: 'Small coin', nacelle: 'Nacelle', tailFin: 'Tail fin',
};

const DE = {
  base: 'Runde Basis', baseWide: 'Breite Basis', baseTall: 'Hoher Turm', baseHex: 'Sechskant', skirt: 'Sockel', skirtHex: 'Sechskant-Sockel', collar: 'Kragenring', leg: 'Stuetzbein',
  turret: 'Kugelturm', turretBig: 'Grosse Kugel', dome: 'Halbkugel', pole: 'Stange', plate: 'Panzerplatte', shield: 'Schildplatte',
  barrel: 'Lauf', barrelLong: 'Langer Lauf', barrelFat: 'Dicker Lauf', barrelShort: 'Kurzer Lauf', muzzle: 'Muendung', muzzleWide: 'Breite Muendung', brake: 'Muendungsbremse', shroud: 'Huelse', scope: 'Visier', nozzle: 'Duuese', blade: 'Fluegel',
  orb: 'Energiekugel', orbSmall: 'Kleine Kugel', crystal: 'Grosser Kristall', crystalSmall: 'Kleiner Kristall', cone: 'Kegel', spike: 'Stachel', coil: 'Spule', torus: 'Grosser Ring', ringThin: 'Duenner Ring', bandRing: 'Guertelring', halo: 'Heiligenschein', energyBeam: 'Energiestrahlen', lens: 'Linse',
  ammoBox: 'Munitionskiste', tank: 'Nebentank', pipe: 'Rohr', fin: 'Kuehlrippe', antenna: 'Antenne', valve: 'Ventil', bolt: 'Niet', coin: 'Muenze', coinSmall: 'Kleine Muenze', nacelle: 'Gondel', tailFin: 'Heckflosse',
};

const FR = {
  base: 'Base ronde', baseWide: 'Base large', baseTall: 'Corps haut', baseHex: 'Base hex', skirt: 'Jupe', skirtHex: 'Jupe hex', collar: 'Collier', leg: 'Jambe',
  turret: 'Tourelle sph.', turretBig: 'Grande sphere', dome: 'Hemisphere', pole: 'Mats', plate: 'Plaque blind.', shield: 'Plaque bouclier',
  barrel: 'Canon', barrelLong: 'Canon long', barrelFat: 'Canon epais', barrelShort: 'Canon court', muzzle: 'Bouche', muzzleWide: 'Bouche large', brake: 'Frein de bouche', shroud: 'Gainage', scope: 'Lunette', nozzle: 'Buse', blade: 'Pale',
  orb: 'Orbe energie', orbSmall: 'Petit orbe', crystal: 'Grand cristal', crystalSmall: 'Petit cristal', cone: 'Cone', spike: 'Pointe', coil: 'Bobine', torus: 'Grand anneau', ringThin: 'Anneau fin', bandRing: 'Anneau taille', halo: 'Halo', energyBeam: 'Faisceau', lens: 'Lentille',
  ammoBox: 'Caisse munitions', tank: 'Reservoir', pipe: 'Tuyau', fin: 'Ailette', antenna: 'Antenne', valve: 'Valve', bolt: 'Rivet', coin: 'Piece', coinSmall: 'Petite piece', nacelle: 'Nacelle', tailFin: 'Derive',
};

const ES = {
  base: 'Base redonda', baseWide: 'Base ancha', baseTall: 'Cuerpo alto', baseHex: 'Base hex', skirt: 'Falda', skirtHex: 'Falda hex', collar: 'Anillo', leg: 'Pata',
  turret: 'Torreta bola', turretBig: 'Bola grande', dome: 'Hemisferio', pole: 'Poste', plate: 'Placa', shield: 'Placa escudo',
  barrel: 'Canon', barrelLong: 'Canon largo', barrelFat: 'Canon grueso', barrelShort: 'Canon corto', muzzle: 'Boca', muzzleWide: 'Boca ancha', brake: 'Freno', shroud: 'Fundas', scope: 'Mira', nozzle: 'Boquilla', blade: 'Paleta',
  orb: 'Orbe energia', orbSmall: 'Orbe pequeno', crystal: 'Cristal grande', crystalSmall: 'Cristal pequeno', cone: 'Cono', spike: 'Punta', coil: 'Bobina', torus: 'Anillo grande', ringThin: 'Anillo fino', bandRing: 'Anillo cintura', halo: 'Halo', energyBeam: 'Haz energia', lens: 'Lente',
  ammoBox: 'Caja municion', tank: 'Tanque aux.', pipe: 'Tuberia', fin: 'Aleta', antenna: 'Antena', valve: 'Valvula', bolt: 'Remache', coin: 'Moneda', coinSmall: 'Moneda peq.', nacelle: 'Gondola', tailFin: 'Aleta cola',
};

const RU = {
  base: 'Kruglaya baza', baseWide: 'Shirokaya baza', baseTall: 'Vysokiy korpus', baseHex: 'Shestigr. baza', skirt: 'Yuбka', skirtHex: 'Shestigr. yubka', collar: 'Kolco', leg: 'Opora',
  turret: 'Shar. bashnya', turretBig: 'Bolshoy shar', dome: 'Polusfera', pole: 'Stoyka', plate: 'Bronelist', shield: 'Shchit',
  barrel: 'Stvol', barrelLong: 'Dlin. stvol', barrelFat: 'Tolst. stvol', barrelShort: 'Korot. stvol', muzzle: 'Dulo', muzzleWide: 'Shir. dulo', brake: 'Dulo-tormoz', shroud: 'Kozhuh', scope: 'Pritsel', nozzle: 'Soplo', blade: 'Lopast',
  orb: 'Energo-sfera', orbSmall: 'Mal. sfera', crystal: 'Bolshoy krist.', crystalSmall: 'Mal. krist.', cone: 'Konus', spike: 'Ship', coil: 'Katushka', torus: 'Bolshoe kol.', ringThin: 'Tonkoe kol.', bandRing: 'Poyas', halo: 'Orel', energyBeam: 'Luch', lens: 'Linza',
  ammoBox: 'Yashchik patronov', tank: 'Bak', pipe: 'Truba', fin: 'Rebro', antenna: 'Antenna', valve: 'Klapn', bolt: 'Zaklepka', coin: 'Moneta', coinSmall: 'Mal. moneta', nacelle: 'Gondola', tailFin: 'Kilevoe',
};

const PT = {
  base: 'Base redonda', baseWide: 'Base larga', baseTall: 'Corpo alto', baseHex: 'Base hex', skirt: 'Saia', skirtHex: 'Saia hex', collar: 'Anel', leg: 'Perna',
  turret: 'Torre bola', turretBig: 'Bola grande', dome: 'Hemisferio', pole: 'Haste', plate: 'Placa', shield: 'Placa escudo',
  barrel: 'Canhao', barrelLong: 'Canhao longo', barrelFat: 'Canhao grosso', barrelShort: 'Canhao curto', muzzle: 'Boca', muzzleWide: 'Boca larga', brake: 'Freio', shroud: 'Capa', scope: 'Mira', nozzle: 'Bico', blade: 'Paleta',
  orb: 'Orbe energia', orbSmall: 'Orbe pequeno', crystal: 'Cristal grande', crystalSmall: 'Cristal pequeno', cone: 'Cone', spike: 'Espeto', coil: 'Bobina', torus: 'Anel grande', ringThin: 'Anel fino', bandRing: 'Anel cintura', halo: 'Halo', energyBeam: 'Feixe', lens: 'Lente',
  ammoBox: 'Caixa municao', tank: 'Tanque aux.', pipe: 'Tubo', fin: 'Aleta', antenna: 'Antena', valve: 'Valvula', bolt: 'Rebite', coin: 'Moeda', coinSmall: 'Moeda peq.', nacelle: 'Gondola', tailFin: 'Leme',
};

const JA = {
  base: '丸底座', baseWide: '広底座', baseTall: '高塔身', baseHex: '六角座', skirt: 'スカート', skirtHex: '六角スカート', collar: '首輪', leg: '支持脚',
  turret: '球形砲塔', turretBig: '大球塔', dome: '半球', pole: '長杆', plate: '装甲板', shield: '盾板',
  barrel: '砲身', barrelLong: '長砲身', barrelFat: '太砲身', barrelShort: '短砲身', muzzle: '砲口', muzzleWide: '広砲口', brake: '制退器', shroud: 'スリーブ', scope: '照準', nozzle: 'ノズル', blade: 'ブレード',
  orb: 'エネルギー球', orbSmall: '小光球', crystal: '大水晶', crystalSmall: '小水晶', cone: '円錐', spike: 'スパイク', coil: 'コイル', torus: '大リング', ringThin: '細リング', bandRing: '腰リング', halo: 'ハロー', energyBeam: 'エネルギー柱', lens: 'レンズ',
  ammoBox: '弾薬箱', tank: '副タンク', pipe: 'パイプ', fin: 'フィン', antenna: 'アンテナ', valve: 'バルブ', bolt: 'リベット', coin: 'コイン', coinSmall: '小コイン', nacelle: 'ナセル', tailFin: '尾翼',
};

const KO = {
  base: '원형 받침', baseWide: '넓은 받침', baseTall: '높은 몸통', baseHex: '육각 받침', skirt: '스커트', skirtHex: '육각 스커트', collar: '칼라', leg: '지지대',
  turret: '구형 포탑', turretBig: '큰 구', dome: '반구', pole: '긴 기둥', plate: '장갑판', shield: '방패판',
  barrel: '포신', barrelLong: '긴 포신', barrelFat: '굵은 포신', barrelShort: '짧은 포신', muzzle: '포구', muzzleWide: '넓은 포구', brake: '制退器', shroud: '슬리브', scope: '조준경', nozzle: '노즐', blade: '블레이드',
  orb: '에너지 구', orbSmall: '작은 구', crystal: '큰 수정', crystalSmall: '작은 수정', cone: '원뿔', spike: '스파이크', coil: '코일', torus: '큰 고리', ringThin: '얇은 고리', bandRing: '허리 고리', halo: '후광', energyBeam: '에너지 기둥', lens: '렌즈',
  ammoBox: '탄약 상자', tank: '보조 탱크', pipe: '파이프', fin: '핀', antenna: '안테나', valve: '밸브', bolt: '리벳', coin: '코인', coinSmall: '작은 코인', nacelle: '나셀', tailFin: '꼬리 날개',
};

const MAP = { 'zh-TW': ZH, 'zh-CN': ZH, en: EN, ja: JA, ko: KO, de: DE, fr: FR, es: ES, ru: RU, pt: PT };

export function getShapeNames(loc) {
  const m = MAP[loc] ?? EN;
  const out = {};
  for (const id of SHAPE_IDS) out[shapeKey(id)] = m[id] ?? EN[id];
  return out;
}

export function formatShapeLines(loc) {
  const d = getShapeNames(loc);
  return SHAPE_KEYS.map((k) => `    ${k}: ${JSON.stringify(d[k])},`).join('\n');
}
