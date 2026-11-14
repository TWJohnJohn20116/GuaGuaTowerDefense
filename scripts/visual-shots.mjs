/**
 * 截圖與頁內稽核的五個動作（視口截圖／頁內稽核／像素統計／整頁長圖／局部特寫）。
 *
 * 為什麼抽成獨立檔：visual-check.mjs 一度長到 899 行，超過 §3 的 888 行硬上限。
 * 這些動作只依賴 CDP 的 send 與三個格式常量，用工廠注入（而不是讓主檔反向匯出）
 * 就能拆檔而不製造循環依賴。
 *
 * 兩個子模組（稽核／像素）都是選配：缺檔時各自降級，不會讓整支工具爆掉。
 */

import { writeFileSync } from 'node:fs';

let modulesPromise = null;
const loadModules = () =>
  (modulesPromise ??= Promise.all([
    import('./visual-audit.mjs').catch(() => null),
    import('./visual-pixel.mjs').catch(() => null),
  ]).then(([a, p]) => ({
    audit: a?.AUDIT_EXPR ?? null,
    pixel: p?.pixelStatsExpr ?? null,
  })));

export function createShots({ FORMAT, DPR, sleep }) {
  const quality = (q) => (FORMAT === 'jpeg' ? { quality: q } : {});

  // 刻意不做虛擬時間凍結：實測 Emulation.setVirtualTimePolicy 在 headless 下不回響，
  // 會讓 captureScreenshot 永遠拿不到畫框。動態區域改用 --mask 塗掉再比。
  async function captureViewport(cdp, sessionId) {
    const shot = await cdp.send('Page.captureScreenshot', { format: FORMAT, ...quality(88) }, sessionId);
    return shot.data;
  }

  /** 頁內稽核：對比度、截斷、溢出、遮擋。失敗只回傳 error，不影響截圖 */
  async function runAudit(cdp, sessionId) {
    const mods = await loadModules();
    if (!mods.audit) return null;
    try {
      const { result } = await cdp.send(
        'Runtime.evaluate',
        { expression: mods.audit, returnByValue: true },
        sessionId,
      );
      return result?.value ? JSON.parse(result.value) : null;
    } catch (error) {
      return { error: String(error?.message ?? error) };
    }
  }

  /** 像素統計：用真實截圖判斷「是不是幾乎單色」，比 bytes>20000 穩 */
  async function samplePixels(cdp, sessionId, base64) {
    const mods = await loadModules();
    if (!mods.pixel) return null;
    const dataUrl = `data:image/${FORMAT === 'png' ? 'png' : 'jpeg'};base64,${base64}`;
    try {
      const { result } = await cdp.send(
        'Runtime.evaluate',
        { expression: mods.pixel(dataUrl), returnByValue: true, awaitPromise: true },
        sessionId,
      );
      return result?.value ? JSON.parse(result.value) : null;
    } catch (error) {
      return { error: String(error?.message ?? error) };
    }
  }

  /** 整頁長圖：抓「主行動鍵被推到摺疊線以下」。限高避免單張圖吃掉幾十 MB */
  async function captureFullPage(cdp, sessionId, outFile) {
    const metrics = await cdp.send('Page.getLayoutMetrics', {}, sessionId);
    const cs = metrics.cssContentSize ?? metrics.contentSize;
    const width = Math.min(Math.ceil(cs.width), 4000);
    const height = Math.min(Math.ceil(cs.height), 6000);
    const shot = await cdp.send(
      'Page.captureScreenshot',
      {
        format: FORMAT,
        ...quality(82),
        captureBeyondViewport: true,
        clip: { x: 0, y: 0, width, height, scale: 1 },
      },
      sessionId,
    );
    writeFileSync(outFile, Buffer.from(shot.data, 'base64'));
    return { height, width };
  }

  /** mask 選擇器的視口座標：diff 要用它把 canvas／計時器這類每幀變動的區域塗掉 */
  async function collectMaskRects(cdp, sessionId, selectors) {
    if (!selectors?.length) return [];
    const list = JSON.stringify(selectors);
    const expr = `JSON.stringify(${list}.map((s) => { const el = document.querySelector(s); if (!el) return null; const r = el.getBoundingClientRect(); return r.width < 2 || r.height < 2 ? null : { x: r.left, y: r.top, w: r.width, h: r.height }; }).filter(Boolean))`;
    const { result } = await cdp
      .send('Runtime.evaluate', { expression: expr, returnByValue: true }, sessionId)
      .catch(() => ({ result: null }));
    if (!result?.value) return [];
    try {
      return JSON.parse(result.value);
    } catch {
      return [];
    }
  }

  /** 局部特寫：總表縮圖看不出圓角與邊界，Modal 要拍原尺寸 */
  async function captureClip(cdp, sessionId, selector, outFile) {
    const sel = JSON.stringify(selector);
    const expr = `(() => { const el = document.querySelector(${sel}); if (!el) return 'null'; el.scrollIntoView({ block: 'center', inline: 'center' }); const r = el.getBoundingClientRect(); return JSON.stringify({ x: r.left + window.scrollX, y: r.top + window.scrollY, w: r.width, h: r.height }); })()`;
    const { result } = await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true }, sessionId);
    if (!result?.value || result.value === 'null') return { error: `clip 找不到元素：${selector}` };
    const rect = JSON.parse(result.value);
    if (rect.w < 2 || rect.h < 2) return { error: `clip 元素尺寸過小：${Math.round(rect.w)}x${Math.round(rect.h)}` };
    await sleep(120);
    const shot = await cdp.send(
      'Page.captureScreenshot',
      { format: FORMAT, ...quality(88), clip: { x: rect.x, y: rect.y, width: rect.w, height: rect.h, scale: DPR } },
      sessionId,
    );
    writeFileSync(outFile, Buffer.from(shot.data, 'base64'));
    return { rect };
  }

  /**
   * 與基準線比對：算出差異統計，必要時再產一張差異圖。
   * visual-diff.mjs 是選配（缺檔就回傳 error，一般驗證照跑）。
   */
  async function compareWithBaseline(cdp, sessionId, opts) {
    const { baselineDataUrl, currentBase64, tolerance, maskRects, diffOutFile } = opts;
    let mod = null;
    try {
      mod = await import('./visual-diff.mjs');
    } catch {
      return { error: 'visual-diff.mjs 不存在，略過 diff' };
    }
    const currentDataUrl = `data:image/${FORMAT === 'png' ? 'png' : 'jpeg'};base64,${currentBase64}`;
    const masks = maskRects ?? [];
    try {
      const statsRes = await cdp.send(
        'Runtime.evaluate',
        {
          expression: mod.diffStatsExpr(baselineDataUrl, currentDataUrl, tolerance, masks),
          returnByValue: true,
          awaitPromise: true,
        },
        sessionId,
      );
      const stats = statsRes.result?.value ? JSON.parse(statsRes.result.value) : null;
      let diffFile = null;
      if (diffOutFile) {
        const imgRes = await cdp.send(
          'Runtime.evaluate',
          {
            expression: mod.diffImageExpr(baselineDataUrl, currentDataUrl, tolerance, masks),
            returnByValue: true,
            awaitPromise: true,
          },
          sessionId,
        );
        const payload = imgRes.result?.value ? JSON.parse(imgRes.result.value) : null;
        const comma = payload?.dataUrl ? payload.dataUrl.indexOf(',') : -1;
        if (comma > 0) {
          writeFileSync(diffOutFile, Buffer.from(payload.dataUrl.slice(comma + 1), 'base64'));
          diffFile = diffOutFile;
        }
      }
      return { stats, diffFile };
    } catch (error) {
      return { error: String(error?.message ?? error) };
    }
  }

  return { captureViewport, runAudit, samplePixels, captureFullPage, captureClip, collectMaskRects, compareWithBaseline };
}