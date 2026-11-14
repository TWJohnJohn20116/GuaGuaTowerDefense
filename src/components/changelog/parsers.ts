import type { ChangeSection, ChangeItem, NumberedListItem, TableData } from './types';

// 解析 Markdown 內容
export const parseChangelog = (content: string): ChangeSection[] => {
  const lines = content.split('\n');
  const sections: ChangeSection[] = [];
  let currentSection: ChangeSection | null = null;
  let currentChange: { title: string; items: ChangeItem[] } | null = null;
  let inTable = false;
  let currentTable: TableData | null = null;
  let inNumberedList = false;
  let currentNumberedList: NumberedListItem[] = [];

  // 保存當前編號列表
  const saveNumberedList = () => {
    if (inNumberedList && currentNumberedList.length > 0 && currentChange) {
      currentChange.items.push({ type: 'numbered-list', content: [...currentNumberedList] });
      currentNumberedList = [];
      inNumberedList = false;
    }
  };

  // 保存當前表格
  const saveTable = () => {
    if (inTable && currentTable && currentChange) {
      currentChange.items.push({ type: 'table', content: currentTable });
      currentTable = null;
      inTable = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // 版本標題 (## [x.x.x] - date)
    const versionMatch = line.match(/^## \[(.+?)\] - (.+)$/);
    if (versionMatch) {
      saveNumberedList();
      saveTable();
      if (currentChange && currentSection) {
        currentSection.changes.push(currentChange);
      }
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        version: versionMatch[1],
        date: versionMatch[2],
        changes: []
      };
      currentChange = null;
      continue;
    }

    // 變更類別 (### xxx)
    const changeMatch = line.match(/^### (.+)$/);
    if (changeMatch && currentSection) {
      saveNumberedList();
      saveTable();
      if (currentChange) {
        currentSection.changes.push(currentChange);
      }
      currentChange = {
        title: changeMatch[1],
        items: []
      };
      continue;
    }

    // 編號列表 (1. xxx, 2. xxx, etc.)
    const numberedMatch = line.match(/^(\d+)\.\s+(.+)$/);
    if (numberedMatch && currentChange) {
      saveTable(); // 結束表格
      inNumberedList = true;
      currentNumberedList.push({
        number: parseInt(numberedMatch[1]),
        text: numberedMatch[2]
      });
      continue;
    }

    // 非編號列表行，結束編號列表
    if (inNumberedList && !line.match(/^(\d+)\.\s+/)) {
      saveNumberedList();
    }

    // 表格行 (| xxx | xxx |)
    const tableMatch = line.match(/^\|(.+)\|$/);
    if (tableMatch && currentChange) {
      const cells = tableMatch[1].split('|').map(cell => cell.trim());
      
      // 檢查是否為分隔行 (|---|---|)
      const isSeparator = cells.every(cell => /^[-:]+$/.test(cell));
      
      if (!inTable && !isSeparator) {
        // 開始新表格，這是表頭
        inTable = true;
        currentTable = {
          headers: cells,
          rows: []
        };
      } else if (inTable && currentTable) {
        if (!isSeparator) {
          // 添加數據行
          currentTable.rows.push(cells);
        }
        // 分隔行直接跳過
      }
      continue;
    }

    // 非表格行，結束表格
    if (inTable && currentTable && currentChange) {
      if (line.trim() !== '' && !line.startsWith('|')) {
        saveTable();
      }
    }

    // 變更項目 (- xxx) 或縮進項目 (  - xxx)
    const itemMatch = line.match(/^(\s*)- (.+)$/);
    if (itemMatch && currentChange) {
      const indent = itemMatch[1].length;
      const content = itemMatch[2];
      // 縮進項目視為上一項的子項目，用 "  └ " 標記
      if (indent > 0 && currentChange.items.length > 0) {
        const lastItem = currentChange.items[currentChange.items.length - 1];
        if (lastItem.type === 'text') {
          lastItem.content = lastItem.content + '\n  └ ' + content;
        }
      } else {
        currentChange.items.push({ type: 'text', content });
      }
    }
  }

  // 保存最後的編號列表
  saveNumberedList();
  
  // 保存最後的表格
  saveTable();
  
  // 添加最後一個
  if (currentChange && currentSection) {
    currentSection.changes.push(currentChange);
  }
  if (currentSection) {
    sections.push(currentSection);
  }

  return sections;
};

// 獲取變更類型圖標
export const getChangeTypeIcon = (text: string): string => {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('新增') || lowerText.includes('添加') || lowerText.includes('add')) return '✨';
  if (lowerText.includes('修復') || lowerText.includes('修正') || lowerText.includes('fix')) return '🔧';
  if (lowerText.includes('優化') || lowerText.includes('改進') || lowerText.includes('improve')) return '⚡';
  if (lowerText.includes('介面') || lowerText.includes('ui') || lowerText.includes('界面')) return '🎨';
  if (lowerText.includes('故事') || lowerText.includes('story')) return '📖';
  if (lowerText.includes('mod') || lowerText.includes('模組')) return '🧩';
  if (lowerText.includes('設定') || lowerText.includes('setting')) return '⚙️';
  if (lowerText.includes('移除') || lowerText.includes('刪除') || lowerText.includes('remove')) return '🗑️';
  if (lowerText.includes('重構') || lowerText.includes('refactor')) return '🔄';
  return '📝';
};

// 獲取版本類型徽章
export const getChangeTypeBadge = (title: string): { text: string; color: string } | null => {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('新功能') || lowerTitle.includes('新增')) {
    return { text: '新功能', color: 'bg-[var(--cn-mint-soft)] text-[var(--cn-mint-deep)]' };
  }
  if (lowerTitle.includes('修復') || lowerTitle.includes('bug')) {
    return { text: '修復', color: 'bg-[var(--cn-alert-soft)] text-[var(--cn-alert)]' };
  }
  if (lowerTitle.includes('優化') || lowerTitle.includes('改進')) {
    return { text: '優化', color: 'bg-[var(--cn-sky-soft)] text-[var(--cn-sky-deep)]' };
  }
  if (lowerTitle.includes('ui') || lowerTitle.includes('介面')) {
    return { text: 'UI', color: 'bg-[var(--cn-grape-soft)] text-[var(--cn-grape-deep)]' };
  }
  return null;
};

// 計算統計資料
export const calculateStats = (sections: ChangeSection[]): { 
  totalVersions: number; 
  totalChanges: number; 
  majorUpdates: number;
  featureUpdates: number;
  bugFixes: number;
} => {
  let totalChanges = 0;
  let majorUpdates = 0;
  let featureUpdates = 0;
  let bugFixes = 0;
  
  sections.forEach(section => {
    const versionParts = section.version.split('.');
    if (versionParts[0] && parseInt(versionParts[0]) > 0 && versionParts[1] === '0' && versionParts[2] === '0') {
      majorUpdates++;
    } else if (versionParts[2] === '0') {
      featureUpdates++;
    }
    
    section.changes.forEach(change => {
      change.items.forEach(item => {
        totalChanges++;
        if (item.type === 'text' && typeof item.content === 'string') {
          if (item.content.includes('修復') || item.content.includes('fix')) {
            bugFixes++;
          }
        }
      });
    });
  });
  
  return {
    totalVersions: sections.length,
    totalChanges,
    majorUpdates,
    featureUpdates,
    bugFixes,
  };
};
