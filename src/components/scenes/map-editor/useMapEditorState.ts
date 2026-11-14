/**
 * 地圖編輯器 · 狀態與動作 Hook
 *
 *  集中管理：
 *   - 編輯模式、地圖元資料（名稱、描述、難度）
 *   - 普通模式：waypoints
 *   - 進階模式：segments + active segment
 *   - 匯出代碼生成
 */

import { useState, useEffect } from 'react';
import type { GridPosition, PathSegment, MapCategory } from '@/types/game';
import { useTranslation } from '@/i18n';
import { EditMode, PATH_TEMPLATES, generateSegId } from './types';

export function useMapEditorState() {
  const { t } = useTranslation();

  const [editMode, setEditMode] = useState<EditMode>('path');
  const [waypoints, setWaypoints] = useState<GridPosition[]>([]);
  const [mapName, setMapName] = useState('My Map');
  const [mapDescription, setMapDescription] = useState('Custom map');
  const [difficulty, setDifficulty] = useState('medium');

  const [mapCategory, setMapCategory] = useState<MapCategory>('normal');
  const [segments, setSegments] = useState<PathSegment[]>([]);
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportedCode, setExportedCode] = useState('');

  // 同步 waypoints 到 active segment
  useEffect(() => {
    if (mapCategory === 'advanced' && activeSegmentId) {
      setSegments((prev) =>
        prev.map((s) => (s.id === activeSegmentId ? { ...s, waypoints } : s))
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waypoints]);

  // 切換 active segment 時載入其 waypoints
  useEffect(() => {
    if (mapCategory === 'advanced' && activeSegmentId) {
      const seg = segments.find((s) => s.id === activeSegmentId);
      if (seg) setWaypoints([...seg.waypoints]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSegmentId]);

  const addSegment = () => {
    const newId = generateSegId();
    setSegments((prev) => [...prev, { id: newId, waypoints: [], next: [] }]);
    setActiveSegmentId(newId);
  };

  const removeSegment = (id: string) => {
    setSegments((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      return filtered.map((s) => ({ ...s, next: s.next.filter((n) => n !== id) }));
    });
    if (activeSegmentId === id) {
      setActiveSegmentId(segments.length > 1 ? segments.find((s) => s.id !== id)?.id || null : null);
    }
  };

  const updateSegmentNext = (segId: string, targetId: string, add: boolean) => {
    setSegments((prev) =>
      prev.map((s) => {
        if (s.id !== segId) return s;
        const next = add ? [...s.next, targetId] : s.next.filter((n) => n !== targetId);
        return { ...s, next };
      })
    );
  };

  const undoLastPoint = () => {
    if (waypoints.length > 0) setWaypoints(waypoints.slice(0, -1));
  };

  const clearPath = () => setWaypoints([]);

  const removeWaypoint = (idx: number) =>
    setWaypoints(waypoints.filter((_, i) => i !== idx));

  const loadTemplate = (name: string) => {
    const template = PATH_TEMPLATES[name];
    if (template) setWaypoints([...template]);
  };

  const getDifficultyLabel = (diff: string) => {
    switch (diff) {
      case 'veryEasy': return t.pathSelection.difficulty.veryEasy;
      case 'easy': return t.pathSelection.difficulty.easy;
      case 'medium': return t.pathSelection.difficulty.medium;
      case 'hard': return t.pathSelection.difficulty.hard;
      default: return diff;
    }
  };

  const exportMap = () => {
    if (mapCategory === 'advanced') {
      const startId = segments.length > 0 ? segments[0].id : '';
      const code = `// ${mapName} (進階地圖)
{
  name: '${mapName}',
  description: '${mapDescription}',
  difficulty: '${getDifficultyLabel(difficulty)}',
  category: 'advanced',
  waypoints: [${segments.length > 0 ? `{ col: ${segments[0].waypoints[0]?.col || 0}, row: ${segments[0].waypoints[0]?.row || 0} }` : ''}],
  startSegmentId: '${startId}',
  segments: [
${segments.map((seg) => `    { id: '${seg.id}', waypoints: [${seg.waypoints.map((wp) => `{ col: ${wp.col}, row: ${wp.row} }`).join(', ')}], next: [${seg.next.map((n) => `'${n}'`).join(', ')}] }`).join(',\n')}
  ]
}`;
      setExportedCode(code);
    } else {
      const code = `// ${mapName}
{
  name: '${mapName}',
  description: '${mapDescription}',
  difficulty: '${getDifficultyLabel(difficulty)}',
  category: 'normal',
  waypoints: [
${waypoints.map((wp) => `    { col: ${wp.col}, row: ${wp.row} }`).join(',\n')}
  ]
}`;
      setExportedCode(code);
    }
    setShowExportModal(true);
  };

  return {
    editMode,
    setEditMode,
    waypoints,
    setWaypoints,
    mapName,
    setMapName,
    mapDescription,
    setMapDescription,
    difficulty,
    setDifficulty,
    mapCategory,
    setMapCategory,
    segments,
    activeSegmentId,
    setActiveSegmentId,
    showExportModal,
    setShowExportModal,
    exportedCode,
    addSegment,
    removeSegment,
    updateSegmentNext,
    undoLastPoint,
    clearPath,
    removeWaypoint,
    loadTemplate,
    exportMap,
  };
}
