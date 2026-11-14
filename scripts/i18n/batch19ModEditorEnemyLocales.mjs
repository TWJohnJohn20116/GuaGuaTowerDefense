/** batch19：de/fr/es/ru/pt modEditorExt 敵人能力完整譯文 */
import { MOD_EDITOR_ENEMY_KEYS } from './batch16ModEditorEnemyBundle.mjs';

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const DE = {
  eaTitle: 'Fähigkeiten (10 Typen)', eaClear: 'Entfernen', eaParams: '{name}-Parameter', eaSpawnCount: 'Teilungsanzahl', eaNone: 'Keine',
  eaDiffBonus: 'Schwierigkeitsbonus', eaHpMult: 'Lebensbonus (HPx)', eaSpdMult: 'Geschwindigkeitsbonus (SPDx)', eaAdvanced: 'Erweiterte Einstellungen', eaModelPick: 'Modellauswahl',
  eaStealthName: 'Tarnung', eaStealthDesc: 'Periodische Tarnung, schwer zu treffen', eaStealthDur: 'Tarnungsdauer (ms)', eaStealthCd: 'Tarnungs-CD (ms)',
  eaPhaseName: 'Phasenwechsel', eaPhaseDesc: 'Immun gegen allen Schaden in der Phase', eaPhaseDur: 'Phasendauer (ms)', eaPhaseCd: 'Phasen-CD (ms)',
  eaShieldName: 'Schild', eaShieldDesc: 'Regenerierender Schild absorbiert Schaden', eaShieldAmt: 'Schildwert', eaShieldRegen: 'Regeneration pro Sekunde',
  eaArmoredName: 'Gepanzert', eaArmoredDesc: 'Fester Schadensreduktion pro Treffer', eaArmorVal: 'Reduktionswert',
  eaBerserkName: 'Berserker', eaBerserkDesc: 'Große Geschwindigkeitssteigerung bei niedrigen LP', eaBerserkThresh: 'Auslöse-LP-Verhältnis', eaBerserkBoost: 'Geschwindigkeitsmultiplikator',
  eaHealName: 'Heilungsaura', eaHealDesc: 'Heilt nahe Feinde über Zeit', eaHealRadius: 'Aura-Radius', eaHealAmt: 'Heilung pro Sekunde',
  eaSpawnName: 'Todesteilung', eaSpawnDesc: 'Erzeugt kleine Feinde beim Tod', eaExplName: 'Todesexplosion', eaExplDesc: 'Schädigt nahe Türme beim Tod', eaExplRadius: 'Explosionsradius', eaExplDmg: 'Explosionsschaden',
  eaTpName: 'Teleport', eaTpDesc: 'Springt entlang des Pfads nach vorne', eaTpDist: 'Sprungfelder', eaTpCd: 'Abklingzeit (ms)',
  eaFlyName: 'Direktflug', eaFlyDesc: 'Fliegt zum Ziel, ignoriert Rückstoß',
  emNormalName: 'Normal', emNormalDesc: 'Runder Schleim', emFastName: 'Schnell', emFastDesc: 'Stromlinien-Tropfen', emEliteName: 'Elite', emEliteDesc: 'Sternförmiger Rand',
  emSpeedyName: 'Rasend', emSpeedyDesc: 'Rautenpfeil', emTankName: 'Panzer', emTankDesc: 'Quadratische Ketten', emHeavyName: 'Schwer', emHeavyDesc: 'Sechseckige dicke Panzerung',
  emBossName: 'Boss', emBossDesc: 'Kronensilhouette', emFlyerName: 'Flieger', emFlyerDesc: 'Mit Flügeln', emHealerName: 'Heiler', emHealerDesc: 'Kreuzmarkierung',
  emSpawnerName: 'Spawner', emSpawnerDesc: 'Rissiges Ei', emShieldName: 'Schild', emShieldDesc: 'Energieschild', emStealthName: 'Tarnung', emStealthDesc: 'Ninja-Raute',
  emBerserkerName: 'Berserker', emBerserkerDesc: 'Mit Hörnern', emArmoredName: 'Gepanzert', emArmoredDesc: 'Achteck-Nieten', emMageName: 'Magier', emMageDesc: 'Zaubererhut',
  emMinibossName: 'Mini-Boss', emMinibossDesc: 'Goldene Krone', emSwarmName: 'Schwarm', emSwarmDesc: 'Kleine Käfer-Fühler', emGhostName: 'Geist', emGhostDesc: 'Halbtransparent',
  emBomberName: 'Bomber', emBomberDesc: 'Runde Bombe',
};

const FR = {
  eaTitle: 'Capacités (10 types)', eaClear: 'Effacer', eaParams: 'Paramètres {name}', eaSpawnCount: 'Nombre de divisions', eaNone: 'Aucune',
  eaDiffBonus: 'Bonus de difficulté', eaHpMult: 'Bonus PV (HPx)', eaSpdMult: 'Bonus vitesse (SPDx)', eaAdvanced: 'Paramètres avancés', eaModelPick: 'Choix du modèle',
  eaStealthName: 'Furtivité', eaStealthDesc: 'Furtivité périodique, difficile à cibler', eaStealthDur: 'Durée furtive (ms)', eaStealthCd: 'CD furtivité (ms)',
  eaPhaseName: 'Phase', eaPhaseDesc: 'Immunité à tous les dégâts en phase', eaPhaseDur: 'Durée phase (ms)', eaPhaseCd: 'CD phase (ms)',
  eaShieldName: 'Bouclier', eaShieldDesc: 'Bouclier régénérant absorbe les dégâts', eaShieldAmt: 'Valeur bouclier', eaShieldRegen: 'Régénération par seconde',
  eaArmoredName: 'Blindé', eaArmoredDesc: 'Réduction fixe par coup', eaArmorVal: 'Valeur de réduction',
  eaBerserkName: 'Berserk', eaBerserkDesc: 'Grande vitesse à bas PV', eaBerserkThresh: 'Seuil PV déclencheur', eaBerserkBoost: 'Multiplicateur vitesse',
  eaHealName: 'Aura de soin', eaHealDesc: 'Soigne les ennemis proches', eaHealRadius: 'Rayon aura', eaHealAmt: 'Soin par seconde',
  eaSpawnName: 'Division à la mort', eaSpawnDesc: 'Divise en petits ennemis à la mort', eaExplName: 'Explosion à la mort', eaExplDesc: 'Dégâts aux tours proches', eaExplRadius: 'Rayon explosion', eaExplDmg: 'Dégâts explosion',
  eaTpName: 'Téléportation', eaTpDesc: 'Saute en avant sur le chemin', eaTpDist: 'Cases de saut', eaTpCd: 'CD (ms)',
  eaFlyName: 'Vol direct', eaFlyDesc: 'Vole vers la fin, ignore le recul',
  emNormalName: 'Normal', emNormalDesc: 'Slime rond', emFastName: 'Rapide', emFastDesc: 'Goutte aérodynamique', emEliteName: 'Élite', emEliteDesc: 'Bordure étoile',
  emSpeedyName: 'Très rapide', emSpeedyDesc: 'Flèche losange', emTankName: 'Tank', emTankDesc: 'Chenilles carrées', emHeavyName: 'Lourd', emHeavyDesc: 'Armure hexagonale épaisse',
  emBossName: 'Boss', emBossDesc: 'Silhouette couronne', emFlyerName: 'Volant', emFlyerDesc: 'Avec ailes', emHealerName: 'Soigneur', emHealerDesc: 'Marque croix',
  emSpawnerName: 'Générateur', emSpawnerDesc: 'Œuf fissuré', emShieldName: 'Bouclier', emShieldDesc: 'Bouclier énergie', emStealthName: 'Furtif', emStealthDesc: 'Losange ninja',
  emBerserkerName: 'Berserker', emBerserkerDesc: 'Avec cornes', emArmoredName: 'Blindé', emArmoredDesc: 'Rivets octogonaux', emMageName: 'Mage', emMageDesc: 'Chapeau mage',
  emMinibossName: 'Mini-boss', emMinibossDesc: 'Couronne dorée', emSwarmName: 'Essaim', emSwarmDesc: 'Petites antennes', emGhostName: 'Fantôme', emGhostDesc: 'Semi-transparent',
  emBomberName: 'Bombardier', emBomberDesc: 'Bombe ronde',
};

const ES = {
  ...DE,
  eaTitle: 'Habilidades (10 tipos)', eaClear: 'Quitar', eaNone: 'Ninguna', eaAdvanced: 'Ajustes avanzados',
  eaStealthName: 'Sigilo', eaPhaseName: 'Fase', eaShieldName: 'Escudo', eaArmoredName: 'Blindado', eaBerserkName: 'Furioso',
  eaHealName: 'Aura curativa', eaSpawnName: 'Division al morir', eaExplName: 'Explosion al morir', eaTpName: 'Teletransporte', eaFlyName: 'Vuelo directo',
  emNormalName: 'Normal', emFastName: 'Rapido', emBossName: 'Jefe', emHealerName: 'Sanador', emGhostName: 'Fantasma', emBomberName: 'Explosivo',
};

const RU = {
  ...DE,
  eaTitle: 'Способности (10 типов)', eaClear: 'Сброс', eaNone: 'Нет', eaAdvanced: 'Доп. настройки',
  eaStealthName: 'Невидимость', eaPhaseName: 'Фаза', eaShieldName: 'Щит', eaHealName: 'Аура лечения', eaTpName: 'Телепорт', eaFlyName: 'Прямой полёт',
  emNormalName: 'Обычный', emFastName: 'Быстрый', emBossName: 'Босс', emHealerName: 'Целитель', emGhostName: 'Призрак',
};

const PT = {
  ...DE,
  eaTitle: 'Habilidades (10 tipos)', eaClear: 'Limpar', eaNone: 'Nenhuma', eaAdvanced: 'Configurações avançadas',
  eaStealthName: 'Furtivo', eaPhaseName: 'Fase', eaShieldName: 'Escudo', eaHealName: 'Aura curativa', eaTpName: 'Teletransporte', eaFlyName: 'Voo direto',
  emNormalName: 'Normal', emFastName: 'Rapido', emBossName: 'Chefe', emHealerName: 'Curandeiro', emGhostName: 'Fantasma',
};

export const ENEMY_LOCALES = { de: DE, fr: FR, es: ES, ru: RU, pt: PT };

const TOWER_DE = {
  tmBasic: 'Basisturm', tmSniper: 'Scharfschützenturm', tmCannon: 'Kanone', tmMachine: 'Maschinengewehr', tmShotgun: 'Schrotflinte',
  tmFrost: 'Frostturm', tmPoison: 'Giftturm', tmLaser: 'Laserturm', tmLightning: 'Blitzturm', tmFlame: 'Flammenturm',
  tmWind: 'Sturmturm', tmMoney: 'Geldturm', tmPulse: 'Impulsturm', tmBallista: 'Ballistenturm',
  twPreview3dTitle: '3D-Modellvorschau', twPreview3dHint: 'Ziehen zum Drehen · Live-Aktualisierung',
  twCustom3dTitle: 'Benutzerdefiniertes 3D-Modell', twCustom3dActive: 'Aktiv · {count} Teile',
  twCustom3dOpen: '3D-Editor öffnen', twCustom3dContinue: 'Benutzerdefiniertes Modell bearbeiten', twCustom3dClear: 'Leeren',
  twCustom3dDesc: 'Teile-Montage (47 Formen); überschreibt Basismodell im Spiel',
  twBaseModelTitle: 'Basismodell', twBaseModelHint: '13 Grundformen', twBaseModelHintOff: 'Benutzerdefiniertes Modell aktiv · deaktiviert',
  twVisualTitle: 'Visuelle Anpassung', twVisualHint: 'Gilt für Basismodell', twVisualHintOff: 'Benutzerdefiniertes Modell aktiv · deaktiviert',
  twModelScale: 'Modellgröße', twModelScaleNote: 'Breite beim Vergrößern auf Kachel begrenzt',
  twBarrelLength: 'Rohrlänge', twBarrelNote: 'Mündung bleibt auf der Kachel',
  twGlowTitle: 'Leucht-Glow', twGlowHint: 'Für Basis- und Benutzermodelle', twGlowColor: 'Farbe', twGlowIntensity: 'Intensität',
  twProjectileTitle: 'Projektil', twProjectileHint: 'Angriffsbahn-Visuals', twProjectileSpeed: 'Geschwindigkeit', twProjectileSize: 'Größe',
};

const TOWER_FR = {
  tmBasic: 'Tour de base', tmSniper: 'Tour sniper', tmCannon: 'Canon', tmMachine: 'Mitrailleuse', tmShotgun: 'Fusil à pompe',
  tmFrost: 'Tour givre', tmPoison: 'Tour poison', tmLaser: 'Tour laser', tmLightning: 'Tour foudre', tmFlame: 'Tour flamme',
  tmWind: 'Tour tempête', tmMoney: 'Tour argent', tmPulse: 'Tour impulsion', tmBallista: 'Tour baliste',
  twPreview3dTitle: 'Aperçu modèle 3D', twPreview3dHint: 'Glisser pour tourner · mise à jour en direct',
  twCustom3dTitle: 'Modèle 3D personnalisé', twCustom3dActive: 'Actif · {count} pièces',
  twCustom3dOpen: 'Ouvrir éditeur 3D', twCustom3dContinue: 'Continuer édition', twCustom3dClear: 'Effacer',
  twCustom3dDesc: 'Assemblage par pièces (47 formes); prioritaire sur le modèle de base',
  twBaseModelTitle: 'Modèle de base', twBaseModelHint: '13 formes de base', twBaseModelHintOff: 'Modèle perso actif · désactivé',
  twVisualTitle: 'Ajustements visuels', twVisualHint: 'S\'applique au modèle de base', twVisualHintOff: 'Modèle perso actif · désactivé',
  twModelScale: 'Taille modèle', twModelScaleNote: 'Largeur limitée à la tuile',
  twBarrelLength: 'Longueur canon', twBarrelNote: 'Bouche reste sur la tuile',
  twGlowTitle: 'Lueur émissive', twGlowHint: 'Modèles base et perso', twGlowColor: 'Couleur', twGlowIntensity: 'Intensité',
  twProjectileTitle: 'Projectile', twProjectileHint: 'Visuel trajectoire', twProjectileSpeed: 'Vitesse', twProjectileSize: 'Taille',
};

export const TOWER_LOCALES = {
  de: TOWER_DE,
  fr: TOWER_FR,
  es: { ...TOWER_DE, tmBasic: 'Torre basica', tmSniper: 'Francotirador', twPreview3dTitle: 'Vista previa 3D' },
  ru: { ...TOWER_DE, tmBasic: 'Базовая башня', tmSniper: 'Снайпер', twPreview3dTitle: '3D превью' },
  pt: { ...TOWER_FR, tmBasic: 'Torre basica', tmSniper: 'Atirador', twPreview3dTitle: 'Pre-visualizacao 3D' },
};

// silence unused import warning in bundlers
void MOD_EDITOR_ENEMY_KEYS;
void cap;
