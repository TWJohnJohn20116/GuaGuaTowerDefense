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

  async function captureViewport(cdp, sessionId) {
    const shot = await cdp.send(
      'Page.captureScreenshot',
      { format: FORMAT, ...quality(88) },
      sessionId,
    );
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

  return { captureViewport, runAudit, samplePixels, captureFullPage, captureClip };
}