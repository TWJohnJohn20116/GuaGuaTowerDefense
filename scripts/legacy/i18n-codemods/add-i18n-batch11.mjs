/**
 * batch11：path-selection 難度補漏 + 設定音訊鳴謝 / 匯出勾選 / 音效搜尋
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('src/i18n/locales');

const MAP = {
  'zh-TW': {
    pathDiff: { verySimple: '非常簡單', extremeHard: '極難' },
    audioCredits: {
      title: '音訊素材鳴謝',
      refresh: '重新整理',
      intro: '以下為透過 Jamendo（背景音樂）或 Freesound（音效）API 下載並快取於本機的素材。各項目均受創用 CC 或平台授權條款約束。',
      loading: '載入中…',
      emptyTitle: '尚無 API 下載紀錄',
      emptyHint: '請確認已設定 API 金鑰並連線，首次啟動後再重新整理此頁。',
      sourceLink: '來源',
      sourceFile: '本地檔案',
    },
    exportExtra: {
      checklistSelected: '勾選項目（已選 {selected} / {total}）',
      selectAll: '全選',
      selectNone: '全不選',
    },
    audioSection: {
      searchDownload: '下載,快取,jamendo,freesound,api,bgm,音訊,音效',
      searchMenuMusic: '專輯,主選單,bgm,音樂,jamendo,menu,主選單音樂',
    },
  },
  'zh-CN': {
    pathDiff: { verySimple: '非常简单', extremeHard: '极难' },
    audioCredits: {
      title: '音訊素材鸣谢',
      refresh: '重新整理',
      intro: '以下为透过 Jamendo（背景音乐）或 Freesound（音效）API 下载并缓存于本机的素材。各项目均受创用 CC 或平台授权条款约束。',
      loading: '载入中…',
      emptyTitle: '尚无 API 下载纪录',
      emptyHint: '请确认已设定 API 金钥并连线，首次启动后再重新整理此页。',
      sourceLink: '来源',
      sourceFile: '本地档案',
    },
    exportExtra: {
      checklistSelected: '勾选项目（已选 {selected} / {total}）',
      selectAll: '全选',
      selectNone: '全不选',
    },
    audioSection: {
      searchDownload: '下载,缓存,jamendo,freesound,api,bgm,音讯,音效',
      searchMenuMusic: '专辑,主选单,bgm,音乐,jamendo,menu,主选单音乐',
    },
  },
};

const EN = {
  pathDiff: { verySimple: 'Very easy', extremeHard: 'Extreme' },
  audioCredits: {
    title: 'Audio credits',
    refresh: 'Refresh',
    intro: 'Tracks cached locally via Jamendo (BGM) or Freesound (SFX). Each item is under CC or platform license terms.',
    loading: 'Loading…',
    emptyTitle: 'No API download records',
    emptyHint: 'Set API keys and connect, then refresh after first prefetch.',
    sourceLink: 'Source',
    sourceFile: 'Local file',
  },
  exportExtra: {
    checklistSelected: 'Selected {selected} / {total}',
    selectAll: 'Select all',
    selectNone: 'Select none',
  },
  audioSection: {
    searchDownload: 'download,cache,jamendo,freesound,api,bgm,audio,sfx',
    searchMenuMusic: 'album,main menu,bgm,music,jamendo,menu',
  },
};

function pick(loc) {
  return MAP[loc] ?? EN;
}

const locales = ['zh-TW', 'zh-CN', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru', 'pt'];

for (const loc of locales) {
  const file = path.join(ROOT, `${loc}.ts`);
  let s = fs.readFileSync(file, 'utf8');
  const d = pick(loc);
  let changed = false;

  if (!s.includes('verySimple:')) {
    const block = `      verySimple: ${JSON.stringify(d.pathDiff.verySimple)},\r\n      extremeHard: ${JSON.stringify(d.pathDiff.extremeHard)},`;
    s = s.replace(/(\s+hard: [^,]+,)(\r?\n\s+\},)/, `$1\r\n${block}$2`);
    changed = true;
  }

  if (!s.includes('audioCredits: {')) {
    const ac = d.audioCredits;
    const lines = Object.entries(ac).map(([k, v]) => `      ${k}: ${JSON.stringify(v)},`).join('\r\n');
    s = s.replace(
      /(\s+audioApiHint: [^,]+,)(\r?\n\s+aboutTab:)/,
      `$1\r\n    audioCredits: {\r\n${lines}\r\n    },$2`,
    );
    changed = true;
  }

  if (!s.includes('checklistSelected:')) {
    const ex = d.exportExtra;
    const block = Object.entries(ex)
      .map(([k, v]) => `      ${k}: ${JSON.stringify(v)},`)
      .join('\r\n');
    s = s.replace(/(\s+exportedMessage: [^,]+,)(\r?\n\s+\},)/, `$1\r\n${block}$2`);
    changed = true;
  }

  if (!s.includes('audioSection: {')) {
    const as = d.audioSection;
    const block = Object.entries(as)
      .map(([k, v]) => `      ${k}: ${JSON.stringify(v)},`)
      .join('\r\n');
    s = s.replace(/(\s+hudPreview: \{)/, `    audioSection: {\r\n${block}\r\n    },\r\n$1`);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, s, 'utf8');
    console.log('batch11', loc);
  }
}

console.log('Done batch11');
