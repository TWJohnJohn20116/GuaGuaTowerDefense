const HINTS = {
  menu: '主選單改成左欄啟動、右欄等寬入口，不再用一整塊玻璃 Bento。',
  path: '選圖改成清單 + 預覽，難度用文字而非彩虹標籤牆。',
  battle: '對局 HUD 壓成頂列、底列塔塢、右側檢視；塔本體會畫在射程圈中心。',
  pause: '暫停是一張卡片，不是蓋滿半透明面板。',
  shop: '商店改成列清單，價錢與擁有狀態同一列對齊。',
  settings: '設定用分頁 + 列，開關不再各走一套樣式。',
  victory: '結算先講結果，再給下一步，按鈕只有兩顆。',
  atlas: '這是會重做的全部畫面清單。點卡片可跳到已做好的預覽。',
};

const ATLAS = [
  ['menu', '主選單', '啟動與所有入口'],
  ['path', '選地圖', '地圖、難度、協議'],
  ['battle', '對局 HUD', '血量、金錢、塔塢、檢視'],
  ['pause', '暫停', '繼續、設定、投降'],
  ['shop', '商店', '解鎖塔與消耗品'],
  ['settings', '設定', '畫面、操作、音訊'],
  ['victory', '勝利', '獎章與下一關'],
  [null, '失敗', '分析與重開'],
  [null, '每日挑戰', '今日任務與領獎'],
  [null, '突變挑戰', '規則卡與進度'],
  [null, '圖鑑', '塔／敵／地圖'],
  [null, '天賦樹', '點數與節點'],
  [null, '皮膚', '模型集與裝備'],
  [null, '成就', '進度與領取'],
  [null, '戰績', '搜尋與紀錄'],
  [null, '回放', '篩選與播放'],
  [null, '紀念堂', '敗北典藏'],
  [null, '教學', '關卡與提示'],
  [null, '工坊', '地圖與模組入口'],
  [null, '地圖編輯', '格子與路徑'],
  [null, 'Mod 管理', '啟用與排序'],
  [null, 'Mod 編輯', '資料與圖示'],
  [null, '更新日誌', '1.2.0 條目'],
  [null, '載入畫面', '提示與進度'],
  [null, '對話框', '戰役劇情'],
  [null, '互動教學', '高亮與步驟'],
  [null, '成就通知', '解鎖吐司'],
  [null, '更新通知', '下載與安裝'],
  [null, '浮動塔面板', '升級／出售／技能'],
  [null, '合體橫幅', '選擇合體對象'],
  [null, 'Boss 警告', '波次預告'],
];

function iconBack() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 6 9 12l6 6"/></svg>';
}

function screens() {
  return {
    menu: `
      <div class="row grow" style="height:100%">
        <div class="col menu-hero">
          <div>
            <div class="chip">戰役進行中 · 第 4 章</div>
            <h1 class="title" style="margin-top:18px">瓜瓜塔防</h1>
            <p class="sub" style="margin-top:8px">把路守住。把介面讀清楚。</p>
          </div>
          <div class="col gap">
            <button class="btn btn-accent" data-screen="path">開始防衛</button>
            <button class="btn btn-ghost" data-screen="path">選擇地圖</button>
            <p class="tiny muted">金幣 2,400 · 天賦點 6</p>
          </div>
        </div>
        <div class="menu-grid grow">
          ${[
            ['每日挑戰', '連續 5 天 · 未領獎', 'shop'],
            ['突變挑戰', '12 / 24 完成', 'atlas'],
            ['商店', '新到貨 3', 'shop'],
            ['天賦', '可配置 6 點', 'atlas'],
            ['圖鑑', '塔 / 敵 / 地圖', 'atlas'],
            ['皮膚', '已裝備 2', 'atlas'],
            ['成就', '可領取 4', 'atlas'],
            ['戰績', '48 場紀錄', 'atlas'],
            ['設定', '畫面 · 操作 · 音訊', 'settings'],
          ].map(([t, s, go], i) => `
            <button class="nav-card ${i === 0 ? 'wide' : ''}" data-screen="${go}">
              <b>${t}</b>
              <span class="tiny muted">${s}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `,
    path: `
      <div class="col grow" style="height:100%">
        <div class="row gap pad" style="align-items:center;border-bottom:1px solid var(--stroke)">
          <button class="back" data-screen="menu" aria-label="返回">${iconBack()}</button>
          <div>
            <h2 style="font-size:18px">選擇地圖</h2>
            <p class="tiny muted">同一套返回鈕，所有次頁都用這一格</p>
          </div>
        </div>
        <div class="row grow" style="min-height:0">
          <div class="col gap pad" style="width:280px;border-right:1px solid var(--stroke);overflow:auto">
            ${['直線', '之字', '叉路', '環形'].map((name, i) => `
              <div class="shop-item" style="${i === 1 ? 'outline:2px solid var(--accent)' : ''}">
                <div>
                  <b>${name}</b>
                  <div class="tiny muted">${i === 1 ? '目前選取' : '中等'}</div>
                </div>
                <span class="chip">${['入門', '中等', '困難', '極端'][i]}</span>
              </div>
            `).join('')}
          </div>
          <div class="col grow pad gap">
            <div class="map grow" style="border-radius:12px;min-height:220px">
              <div class="path-h"></div>
              <div class="path-v"></div>
              <div class="spawn"></div>
            </div>
            <div class="row gap" style="justify-content:flex-end">
              <button class="btn btn-ghost" data-screen="menu">返回</button>
              <button class="btn btn-accent" data-screen="battle">進入防衛</button>
            </div>
          </div>
        </div>
      </div>
    `,
    battle: `
      <div class="map" style="height:100%">
        <div class="path-h"></div>
        <div class="path-v"></div>
        <div class="spawn"></div>
        <div class="range"></div>
        <div class="tower"></div>
        <div class="hud-top">
          <div class="hud-pill"><span>生命 18</span><span>金錢 320</span><span>波次 5 / 30</span></div>
          <div class="hud-pill">
            <span>1x</span>
            <button class="btn" style="padding:4px 8px" data-screen="pause">暫停</button>
          </div>
        </div>
        <div class="dock">
          ${['基礎', '狙擊', '冰霜', '火焰', '金錢'].map((n, i) => `<i class="${i === 0 ? 'on' : ''}">${n}</i>`).join('')}
        </div>
        <aside class="inspector panel">
          <div>
            <div class="tiny muted">已選取</div>
            <b>基礎塔 · Lv.1</b>
          </div>
          <div class="col gap-sm">
            <div class="stat"><span class="muted">傷害</span><b>25 → 32</b></div>
            <div class="stat"><span class="muted">射程</span><b>4</b></div>
            <div class="stat"><span class="muted">攻速</span><b>1.0</b></div>
          </div>
          <div class="tiny muted">超載就緒 · 擊殺 0 · 傷害 50</div>
          <div class="actions">
            <button class="btn btn-accent">升級 $75</button>
            <button class="btn btn-ghost">出售 +$50</button>
          </div>
        </aside>
      </div>
    `,
    pause: `
      <div class="map" style="height:100%">
        <div class="path-h"></div>
        <div class="path-v"></div>
        <div class="tower"></div>
        <div class="pause-mask">
          <div class="panel pause-card col gap">
            <h2 style="font-size:20px">暫停</h2>
            <p class="tiny muted">波次 5 · 生命 18 · 金錢 320</p>
            <button class="btn btn-accent" data-screen="battle">繼續</button>
            <button class="btn" data-screen="settings">設定</button>
            <button class="btn btn-ghost" data-screen="menu">離開對局</button>
          </div>
        </div>
      </div>
    `,
    shop: `
      <div class="col" style="height:100%">
        <div class="row gap pad" style="align-items:center;border-bottom:1px solid var(--stroke)">
          <button class="back" data-screen="menu" aria-label="返回">${iconBack()}</button>
          <div class="grow">
            <h2 style="font-size:18px">商店</h2>
            <p class="tiny muted">金幣 2,400</p>
          </div>
        </div>
        <div class="col gap pad" style="overflow:auto">
          ${[
            ['解鎖風塔', '擊退控制', '1,200', '購買'],
            ['解鎖脈衝塔', '範圍緩速', '1,500', '購買'],
            ['加速券 x3', '下一場開局加速', '400', '已擁有'],
          ].map(([n, d, p, a]) => `
            <div class="shop-item">
              <div>
                <b>${n}</b>
                <div class="tiny muted">${d}</div>
              </div>
              <div class="row gap-sm" style="align-items:center">
                <span class="tiny">${p}</span>
                <button class="btn ${a === '購買' ? 'btn-accent' : ''}" style="padding:6px 10px">${a}</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `,
    settings: `
      <div class="col" style="height:100%">
        <div class="row gap pad" style="align-items:center;border-bottom:1px solid var(--stroke)">
          <button class="back" data-screen="menu" aria-label="返回">${iconBack()}</button>
          <h2 style="font-size:18px">設定</h2>
        </div>
        <div class="row grow" style="min-height:0">
          <div class="col gap-sm pad" style="width:180px;border-right:1px solid var(--stroke)">
            <button class="btn btn-accent">畫面</button>
            <button class="btn btn-ghost">操作</button>
            <button class="btn btn-ghost">音訊</button>
          </div>
          <div class="col gap pad grow">
            ${['顯示射程', '顯示血條', '傷害數字', '螢幕抖動'].map((n, i) => `
              <div class="set-row">
                <span>${n}</span>
                <div class="toggle" style="${i === 3 ? 'opacity:.35' : ''}"></div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `,
    victory: `
      <div class="col pad gap" style="height:100%;justify-content:center;align-items:center;text-align:center">
        <div class="chip">第 4 章通過</div>
        <h1 class="title">防線守住了</h1>
        <p class="sub">生命 18 / 18 · 銅牆鐵壁</p>
        <div class="row gap" style="margin-top:12px">
          <button class="btn btn-ghost" data-screen="menu">回主選單</button>
          <button class="btn btn-accent" data-screen="path">下一關</button>
        </div>
      </div>
    `,
    atlas: `
      <div class="atlas">
        ${ATLAS.map(([go, title, sub]) => `
          <button class="atlas-card" ${go ? `data-screen="${go}"` : ''}>
            <b>${title}</b>
            <small>${sub}${go ? '' : ' · 核准後依同一套語言重做'}</small>
          </button>
        `).join('')}
      </div>
    `,
  };
}

function paint() {
  const screen = document.body.dataset.screen;
  document.getElementById('stage').innerHTML = screens()[screen];
  document.getElementById('hint').textContent = HINTS[screen];
  document.querySelectorAll('.screen-switch button').forEach((btn) => {
    btn.classList.toggle('is-on', btn.dataset.screen === screen);
  });
}

document.querySelector('.theme-switch').addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-theme]');
  if (!btn) return;
  document.body.dataset.theme = btn.dataset.theme;
  document.documentElement.dataset.theme = btn.dataset.theme;
  document.querySelectorAll('.theme-switch button').forEach((b) => {
    b.classList.toggle('is-on', b === btn);
  });
});

document.body.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-screen]');
  if (!btn || btn.closest('.theme-switch')) return;
  document.body.dataset.screen = btn.dataset.screen;
  paint();
});

paint();
