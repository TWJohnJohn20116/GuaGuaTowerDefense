import { useEffect, useState } from 'react';
import { useTranslation } from '@/i18n';
import { ClipboardIcon } from '@/components/ui/Icons';
import { DevButton, DevInfoRow, DevSection } from './common';

const SAVE_PREFIX = 'guagua-';

function measureSaveBytes(): number {
  let total = 0;
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (key && key.startsWith(SAVE_PREFIX)) {
      total += key.length + (localStorage.getItem(key) ?? '').length;
    }
  }
  return total;
}

function collectSave(): Record<string, string> {
  const out: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (key && key.startsWith(SAVE_PREFIX)) {
      out[key] = localStorage.getItem(key) ?? '';
    }
  }
  return out;
}

/**
 * 存檔操作
 *
 * 匯出：把所有 guagua-* 存檔打包成一個 JSON 下載（除錯時要帶走現場）。
 * 清除：只動 guagua-* 前綴，不碰其他網站的 localStorage；清完重新載入。
 */
export function SaveSection() {
  const { t } = useTranslation();
  const [bytes, setBytes] = useState(0);

  useEffect(() => {
    setBytes(measureSaveBytes());
  }, []);

  const exportAll = () => {
    const payload = JSON.stringify({ exportedAt: new Date().toISOString(), data: collectSave() }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'guagua-save-' + Date.now() + '.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    if (!window.confirm(t.dev.saveClearConfirm)) return;
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key && key.startsWith(SAVE_PREFIX)) keys.push(key);
    }
    keys.forEach((key) => localStorage.removeItem(key));
    window.location.reload();
  };

  return (
    <DevSection
      title={t.dev.secSave}
      icon={<ClipboardIcon className="h-3.5 w-3.5" />}
      accent="violet"
      keywords={['save', 'storage', 'export', 'clear', '存檔', '匯出', '清除']}
    >
      <DevInfoRow
        label={t.dev.saveSize}
        value={(bytes / 1024).toFixed(1) + ' KB'}
        color="cyan"
      />
      <DevButton label={t.dev.saveExport} onClick={exportAll} variant="primary" />
      <DevButton label={t.dev.saveClear} onClick={clearAll} variant="danger" />
    </DevSection>
  );
}