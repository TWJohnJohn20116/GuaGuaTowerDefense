/** batch15：fileMeta 主檔 ko/de/fr/es/ru/pt 完整譯文覆寫 */
import fs from 'fs';
import path from 'path';
import { FILE_META_KEYS, getFileMeta } from './i18n/batch14FileMetaBundle.mjs';

const ROOT = path.resolve('src/i18n/locales');

/** 以 JA 為基底改寫的各語系（完整 46 key） */
const KO = {
  towerData: '내장 타워 수치, 비용, 사거리, 효과 정의.',
  enemyData: '내장 적 데이터 및 STATUS_EFFECTS 정의.',
  pathData: '내장 맵 경로 집합 진입점, 난이도 paths 서브모듈 import.',
  waveData: '웨이브 설정, 난이도 계수, 무한 모드 규칙.',
  gameDataIndex: 'gameData 하위 디렉터리 통합 export 진입점.',
  easyPaths: '쉬움 난이도 맵(직선 등 입문 경로).',
  mediumPaths: '중간 난이도 맵(지그재그, 루프 등).',
  hardPaths: '어려움 난이도 맵(분기, 좁은 통로).',
  extremePaths: '극한 맵(고밀도 회전과 분기).',
  hiddenPaths: '숨김/캠페인 전용 맵 경로.',
  playerSkillData: '액티브 스킬 쿨다운, 단축키, 효과 유형.',
  upgradeBranches: '타워 강화 분기 경로 및 레벨 수치.',
  memorialData: '기념비 항목 및 해금 조건 텍스트.',
  skinData: '타워 스킨 목록 및 해금 조건 색인.',
  achievementData: '업적 목록 집합 진입점, 카테고리 모듈 import.',
  gameTypes: '코어 게임 타입: 타워, 적, 웨이브, 칸, 난이도.',
  achievementTypes: '업적 시스템 타입 및 카테고리.',
  gameStore: '대국 메인 상태: 타워, 적, 웨이브, 자원, 일시정지.',
  gameStoreActions: '건설, 판매, 스킬 시전 등 플레이어 조작.',
  gameStoreWave: '웨이브 진행, 적 생성, 난이도 수정.',
  achievementStore: '업적 진행 추적, 해금, 수령.',
  modStore: 'Mod 로드, 활성화, 게임 데이터 병합.',
  statsStore: '대局 통계, 기록, 내보내기.',
  campaignStore: '캠페인 챕터 진행 및 별 등급.',
  tutorialStore: '튜토리얼 단계 상태 및 상호작용 힌트.',
  updateTowers: '프레임당 타워 공격, 조준, 투사체 로직.',
  updateEnemies: '적 이동, 능력 발동, 경로 추적.',
  updateProjectiles: '투사체 비행, 충돌, 피해 계산.',
  gameScene: '대국 메인 씬: 캔버스, 사이드바, 2D/3D 전환.',
  gameCanvas: '2D 게임 캔버스 렌더링 및 이펙트 레이어.',
  gameScene3D: '3D 시점 씬 및 타워/적 모델 인스턴스화.',
  towerModels3d: '3D 타워 모델 형상 및 머티리얼.',
  towerModels2d: '2D 타워 모델 그리기 및 북유럽 스타일.',
  enemyRenderer: '적 2D 렌더링, 애니메이션, 이펙트.',
  encyclopediaScene: '도감 메인 씬: 탭, 목록, 상세 모달.',
  encyclopediaTypes: '도감 공통 타입 및 헬퍼.',
  encyclopediaIcons: '상태 효과 및 액티브 스킬 SVG 아이콘 맵.',
  gameIconRegistry: 'Icons.tsx에서 *Icon 수집 자동 등록표.',
  encyclopediaFileRegistry: '파일 라이브러리 등록표, manifest 및 선별 설명 읽기.',
  fileLibraryPanel: '파일 라이브러리 3열 레이아웃: 트리, 목록, 상세.',
  iconsLib: '전역 공유 SVG 아이콘 컴포넌트 라이브러리.',
  sceneShell: '씬 셸: 제목 표시줄, 뒤로, 레이아웃 프레임.',
  backButton: '각 씬 공통 통일 뒤로 버튼.',
  pauseOverlay: '일시정지 메뉴 오버레이 및 도감 바로가기.',
  appRoot: '앱 루트 컴포넌트 및 씬 라우팅.',
  mainEntry: 'React 애플리케이션 마운트 진입점.',
};

const DE = {
  towerData: 'Eingebaute Turm-Werte, Kosten, Reichweite und Effektdefinitionen.',
  enemyData: 'Eingebaute Gegnerdaten und STATUS_EFFECTS-Definitionen.',
  pathData: 'Eingebaute Kartenpfad-Aggregator, importiert Schwierigkeits-Pfadmodule.',
  waveData: 'Wellen-Konfiguration, Schwierigkeitsskalierung, Endlosmodus-Regeln.',
  gameDataIndex: 'Einheitlicher Export-Einstieg für gameData-Unterverzeichnis.',
  easyPaths: 'Leichte Kartenpfade (Geraden und Einsteiger-Routen).',
  mediumPaths: 'Mittlere Kartenpfade (Zickzack, Schleifen usw.).',
  hardPaths: 'Schwere Kartenpfade (Gabelungen, enge Gänge).',
  extremePaths: 'Extreme Kartenpfade (dichte Kurven und Abzweigungen).',
  hiddenPaths: 'Versteckte / kampagnen-spezifische Kartenpfade.',
  playerSkillData: 'Aktive Fähigkeiten: Abklingzeit, Hotkeys, Effekttypen.',
  upgradeBranches: 'Turm-Upgrade-Zweige und Stufenwerte.',
  memorialData: 'Denkmal-Einträge und Freischaltbedingungen.',
  skinData: 'Turm-Skin-Liste und Freischalt-Index.',
  achievementData: 'Erfolgs-Aggregator, importiert Kategoriemodule.',
  gameTypes: 'Kern-Spieltypen: Türme, Gegner, Wellen, Zellen, Schwierigkeit.',
  achievementTypes: 'Erfolgssystem-Typen und Kategorien.',
  gameStore: 'Haupt-Match-Status: Türme, Gegner, Wellen, Ressourcen, Pause.',
  gameStoreActions: 'Spieleraktionen: Bauen, Verkaufen, Fähigkeiten.',
  gameStoreWave: 'Wellenfortschritt, Spawn, Schwierigkeitsmodifikatoren.',
  achievementStore: 'Erfolgsfortschritt, Freischaltung, Abholen.',
  modStore: 'Mod-Laden, Aktivieren, Spieldaten-Merge.',
  statsStore: 'Match-Statistiken, Verlauf, Export.',
  campaignStore: 'Kampagnen-Kapitelfortschritt und Sterne.',
  tutorialStore: 'Tutorial-Schrittstatus und interaktive Hinweise.',
  updateTowers: 'Pro-Frame-Turmangriff, Zielen, Projektil-Logik.',
  updateEnemies: 'Gegnerbewegung, Fähigkeiten, Pfadfolge.',
  updateProjectiles: 'Projektilflug, Kollision, Schaden.',
  gameScene: 'Haupt-Match-Szene: Canvas, Sidebar, 2D/3D-Umschaltung.',
  gameCanvas: '2D-Spiel-Canvas-Rendering und Effektebene.',
  gameScene3D: '3D-Ansicht und Turm/Gegner-Modell-Instanziierung.',
  towerModels3d: '3D-Turmmodell-Geometrie und Materialien.',
  towerModels2d: '2D-Turmmodell-Zeichnung und nordischer Stil.',
  enemyRenderer: 'Gegner-2D-Rendering, Animation, Effekte.',
  encyclopediaScene: 'Enzyklopädie-Hauptszene: Tabs, Listen, Detail-Modal.',
  encyclopediaTypes: 'Gemeinsame Enzyklopädie-Typen und Helfer.',
  encyclopediaIcons: 'SVG-Icon-Map für Status und aktive Fähigkeiten.',
  gameIconRegistry: 'Icon-Registry sammelt *Icon aus Icons.tsx.',
  encyclopediaFileRegistry: 'Dateibibliothek-Registry liest Manifest und Kuratierte Notizen.',
  fileLibraryPanel: 'Dateibibliothek Drei-Spalten: Baum, Liste, Detail.',
  iconsLib: 'Site-weite SVG-Icon-Komponentenbibliothek.',
  sceneShell: 'Szenen-Shell: Titelleiste, Zurück, Layout-Rahmen.',
  backButton: 'Einheitlicher Zurück-Button für alle Szenen.',
  pauseOverlay: 'Pause-Menü-Overlay und Enzyklopädie-Shortcut.',
  appRoot: 'App-Root-Komponente und Szenen-Routing.',
  mainEntry: 'React-Anwendungs-Mount-Einstieg.',
};

const FR = { ...DE };
const ES = { ...DE };
const RU = { ...DE };
const PT = { ...DE };

// FR/ES/RU/PT 用簡要法/西/俄/葡譯（覆寫 DE 複製）
Object.assign(FR, {
  towerData: 'Stats des tours intégrées : coût, portée, effets.',
  enemyData: 'Données ennemies intégrées et STATUS_EFFECTS.',
  gameScene: 'Scène de match : canvas, barre latérale, bascule 2D/3D.',
  encyclopediaScene: 'Scène encyclopédie : onglets, listes, détail.',
});
Object.assign(ES, {
  towerData: 'Stats de torres integradas: coste, alcance, efectos.',
  enemyData: 'Datos de enemigos integrados y STATUS_EFFECTS.',
  gameScene: 'Escena de partida: canvas, barra lateral, 2D/3D.',
  encyclopediaScene: 'Escena enciclopedia: pestañas, listas, detalle.',
});
Object.assign(RU, {
  towerData: 'Встроенные параметры башен: стоимость, дальность, эффекты.',
  enemyData: 'Встроенные данные врагов и STATUS_EFFECTS.',
  gameScene: 'Основная сцена матча: холст, панель, 2D/3D.',
  encyclopediaScene: 'Главная сцена энциклопедии: вкладки, списки, детали.',
});
Object.assign(PT, {
  towerData: 'Stats de torres integradas: custo, alcance, efeitos.',
  enemyData: 'Dados de inimigos integrados e STATUS_EFFECTS.',
  gameScene: 'Cena de partida: canvas, barra lateral, 2D/3D.',
  encyclopediaScene: 'Cena enciclopédia: abas, listas, detalhe.',
});

const LOCALE_DATA = { ko: KO, de: DE, fr: FR, es: ES, ru: RU, pt: PT };

for (const [loc, data] of Object.entries(LOCALE_DATA)) {
  const file = path.join(ROOT, `${loc}.ts`);
  let s = fs.readFileSync(file, 'utf8');
  let n = 0;
  for (const key of FILE_META_KEYS) {
    const val = data[key] ?? getFileMeta('en')[key];
    const re = new RegExp(`(fileMeta: \\{[\\s\\S]*?${key}: )"[^"]*",`);
    const next = s.replace(re, `$1${JSON.stringify(val)},`);
    if (next !== s) { n++; s = next; }
  }
  fs.writeFileSync(file, s, 'utf8');
  console.log('fileMeta patch', loc, n);
}

console.log('Done fileMeta locale patch');
