import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { useGameStore } from '@/store/gameStore';
import { setAudioPrefsProvider } from '@/services/audioService';
import { useSettingsStore } from '@/store/settingsStore';
import { applyTheme } from '@/services/themeService';
import './styles/index.css';

// 音效服務不直接依賴 store（避免循環 import），由入口把手上的 store 注入進去
setAudioPrefsProvider(() => {
  const { soundEnabled, soundVolume } = useGameStore.getState();
  return { soundEnabled, soundVolume };
});

// 主題必須在第一次繪製前套用（存檔已同步還原），否則深色主題會先閃一下亮色
applyTheme(useSettingsStore.getState().themeId);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
