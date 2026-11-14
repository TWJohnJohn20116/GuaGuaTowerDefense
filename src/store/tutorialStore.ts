import { create } from 'zustand';
import {
  campaignTutorialPartForLevel,
  markTutorialPartCompleted,
  markTutorialSkipped,
  shouldStartCampaignTutorial,
  tutorialPartFromFinishStepId,
} from './tutorialDismiss';
import type { TutorialPart } from './tutorialDismiss';

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  targetId?: string; // HTML ID of the element to highlight
  action?: 'click' | 'place_tower' | 'start_wave' | 'next' | 'wait_wave_end' | 'select_placed_tower' | 'upgrade_tower' | 'select_path' | 'change_priority' | 'change_speed' | 'explain_stats' | 'use_skill' | 'sell_tower' | 'undo_action' | 'redo_action' | 'pause_game';
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  transparentMask?: boolean; // 如果為 true，遮罩會變透明，讓玩家可以清楚觀看戰鬥過程
}

export const INTERACTIVE_TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: '歡迎來到塔防世界！',
    content: '指揮官，我們需要您的智慧！這是一個簡短的互動教學，將引導您熟悉戰場的基本操作。',
    action: 'next',
    position: 'center',
  },
  {
    id: 'explain_stats',
    title: '觀察資源與血量',
    content: '在畫面左上角，您可以看到目前的【生命值 ❤️】與【金幣 💰】。保護好您的生命值，並妥善運用金幣來佈署防線！',
    targetId: 'tutorial-target-top-stats',
    action: 'next',
    position: 'bottom',
  },
  {
    id: 'select_tower',
    title: '第一步：選擇防禦塔',
    content: '是時候建立第一道防線了。請在右側面板中，點擊選擇【基礎塔】。',
    targetId: 'tutorial-target-tower-basic',
    action: 'click',
    position: 'right', // 改為 right，避免左側擋住塔
  },
  {
    id: 'place_tower',
    title: '第二步：佈署防禦',
    content: '很好！現在請點擊地圖上發光的空白網格，將防禦塔部署在戰略位置上。',
    targetId: 'tutorial-target-specific-grid',
    action: 'place_tower',
    position: 'top',
  },
  {
    id: 'undo_action',
    title: '進階技巧：復原操作',
    content: '哎呀，好像放錯位置了？別擔心！遊戲支援復原操作。請點擊左下側控制列的【復原】按鈕，撤銷剛剛的放置。',
    targetId: 'tutorial-target-undo',
    action: 'undo_action',
    position: 'right',
  },
  {
    id: 'redo_action',
    title: '進階技巧：重做操作',
    content: '其實剛剛的位置挺好的！請點擊【重做】按鈕，把防禦塔再次放回去。',
    targetId: 'tutorial-target-redo',
    action: 'redo_action',
    position: 'right',
  },
  {
    id: 'start_wave',
    title: '第三步：迎擊敵人！',
    content: '防線已就緒！點擊下方的【開始波次】按鈕，讓第一波敵人嚐嚐苦頭吧！',
    targetId: 'tutorial-target-start-wave',
    action: 'start_wave',
    position: 'top',
  },
  {
    id: 'wait_wave_end',
    title: '激烈交戰中...',
    content: '系統已自動為您切換至 10 倍速！當您的防禦塔開火或命中敵人時，會瞬間自動恢復正常速度，請觀察您的防禦塔如何秒殺這群小怪，等待這波敵人被完全消滅...',
    action: 'wait_wave_end',
    position: 'top',
    transparentMask: true,
  },
  {
    id: 'finish_part1',
    title: '第一階段訓練完成！',
    content: '漂亮！敵人已經被消滅，您獲得了金幣獎勵！接下來我們將前往真正的戰場，學習進階的防禦塔升級與技能施放。',
    action: 'next',
    position: 'center',
  },
  // 以下為 part 2 (從 1-2 關卡開始)
  {
    id: 'welcome_part2',
    title: '進階訓練：佈署防線',
    content: '歡迎來到前線！物資匱乏，但我們仍須建立防線。請先在右側面板選擇【基礎塔】。',
    targetId: 'tutorial-target-tower-basic',
    action: 'click',
    position: 'left',
  },
  {
    id: 'place_tower_part2',
    title: '進階訓練：佈署防線',
    content: '請將基礎塔佈署在畫面中央的指定位置上！',
    targetId: 'tutorial-target-specific-grid',
    action: 'place_tower',
    position: 'top',
  },
  {
    id: 'start_wave_part2',
    title: '迎擊敵人',
    content: '準備就緒！點擊【開始波次】來迎擊第一波敵人，戰後我們再進行升級。',
    targetId: 'tutorial-target-start-wave',
    action: 'start_wave',
    position: 'top',
  },
  {
    id: 'wait_wave_end_part2',
    title: '激烈交戰中...',
    content: '切換至 10 倍速等待這波敵人被消滅...',
    action: 'wait_wave_end',
    position: 'top',
    transparentMask: true,
  },
  {
    id: 'select_placed_tower',
    title: '戰後整備：獲得賞金',
    content: '第一波防守成功！我們獲得了足夠的資源。現在請【點擊您剛剛放置的防禦塔】開啟控制面板。',
    targetId: 'tutorial-target-specific-grid',
    action: 'select_placed_tower',
    position: 'top',
  },
  {
    id: 'upgrade_tower',
    title: '戰後整備：強化火力',
    content: '在彈出的面板中點擊【升級】按鈕，花費金幣讓防禦塔變得更強大！',
    targetId: 'tutorial-target-upgrade-tower',
    action: 'upgrade_tower',
    position: 'left',
  },
  {
    id: 'select_path',
    title: '戰後整備：選擇專精路線',
    content: '基礎塔升級時可以選擇不同的專精路線。請點擊選擇【路線 A】，解鎖強大的連鎖閃電能力！',
    targetId: 'tutorial-target-path-a',
    action: 'select_path',
    position: 'left',
  },
  {
    id: 'change_priority',
    title: '戰後整備：設定目標優先級',
    content: '您可以決定防禦塔的攻擊策略。請點擊【最強】，讓這座塔優先攻擊血量最高的敵人。',
    targetId: 'tutorial-target-priority',
    action: 'change_priority',
    position: 'left',
  },
  {
    id: 'use_skill',
    title: '進階技巧：主動技能',
    content: '某些防禦塔擁有強大的主動技能。請點擊面板中央的【發動技能】按鈕，這在危急時刻能逆轉戰局！',
    targetId: 'tutorial-target-use-skill',
    action: 'use_skill',
    position: 'left',
  },
  {
    id: 'finish_part2',
    title: '第二階段訓練完成！',
    content: '太棒了！您已經學會了如何升級防禦塔與施放技能。接下來請發揮您的戰術完成這個關卡！',
    action: 'next',
    position: 'center',
  },
  // 以下為 part 3 (從 1-3 關卡開始)
  {
    id: 'welcome_part3',
    title: '最終訓練：戰術轉換',
    content: '指揮官，這片森林視野不佳，我們需要學習使用進階功能。請先在右側面板選擇【基礎塔】。',
    targetId: 'tutorial-target-tower-basic',
    action: 'click',
    position: 'left',
  },
  {
    id: 'place_tower_part3',
    title: '最終訓練：佈署防線',
    content: '請將基礎塔佈署在指定位置上！',
    targetId: 'tutorial-target-specific-grid',
    action: 'place_tower',
    position: 'top',
  },
  {
    id: 'select_placed_tower_part3',
    title: '戰術轉型：重新佈署',
    content: '有時候我們需要根據戰況改變防線。請【點擊您剛剛放置的防禦塔】開啟控制面板。',
    targetId: 'tutorial-target-specific-grid',
    action: 'select_placed_tower',
    position: 'top',
  },
  {
    id: 'sell_tower',
    title: '戰術轉型：出售防禦塔',
    content: '有時候您需要重新佈署防線。請點擊面板右下角的【出售】按鈕，賣掉這座基礎塔，收回部分資金！',
    targetId: 'tutorial-target-sell-tower',
    action: 'sell_tower',
    position: 'left',
  },
  {
    id: 'change_speed',
    title: '進階技巧：掌控時間',
    content: '如果您覺得戰局進展太慢，可以在下方控制列切換遊戲速度。請點擊【 2x 】來加快遊戲節奏。',
    targetId: 'tutorial-target-game-speed',
    action: 'change_speed',
    position: 'top',
  },
  {
    id: 'select_sniper',
    title: '戰術轉型：選擇狙擊塔',
    content: '現在資金充足了！請在右側面板選擇【狙擊塔】，它擁有超遠射程和極高單發傷害！',
    targetId: 'tutorial-target-tower-sniper',
    action: 'click',
    position: 'right',
  },
  {
    id: 'place_sniper',
    title: '戰術轉型：佈署狙擊塔',
    content: '請將狙擊塔佈署在剛剛的位置，讓它掌控全場！',
    targetId: 'tutorial-target-specific-grid',
    action: 'place_tower',
    position: 'top',
  },
  {
    id: 'start_next_wave',
    title: '準備就緒',
    content: '防線已重新部署！點擊【開始波次】迎接下一波挑戰！',
    targetId: 'tutorial-target-start-wave',
    action: 'start_wave',
    position: 'top',
  },
  {
    id: 'finish_part2',
    title: '結訓！',
    content: '太棒了指揮官！您已經完全掌握了建造、升級、技能施放與戰術轉換。接下來請發揮您的戰術完成這個關卡！',
    action: 'next',
    position: 'center',
  },
  // 以下為 part 3 (從 1-3 關卡開始)
  {
    id: 'welcome_part3',
    title: '最終訓練：極限控場',
    content: '指揮官，這片森林裡的敵人處於狂暴狀態，移動速度極快！我們必須學會控制節奏。',
    action: 'next',
    position: 'center',
  },
  {
    id: 'pause_game_part3',
    title: '最終訓練：暫停遊戲',
    content: '遇到危急情況或需要思考時，您可以隨時暫停遊戲。請點擊下方的【暫停】按鈕（或按下 P）。',
    targetId: 'tutorial-target-pause',
    action: 'pause_game',
    position: 'top',
  },
  {
    id: 'select_frost',
    title: '極限控場：冰凍塔',
    content: '趁著暫停時間，我們來佈署防線。請在右側面板選擇【冰凍塔】，它能大幅降低敵人的移動速度。',
    targetId: 'tutorial-target-tower-frost',
    action: 'click',
    position: 'right',
  },
  {
    id: 'place_frost',
    title: '極限控場：佈署防線',
    content: '請將冰凍塔佈署在交叉路口附近，這樣能最大化它的控場範圍！',
    targetId: 'tutorial-target-specific-grid',
    action: 'place_tower',
    position: 'top',
  },
  {
    id: 'resume_game_part3',
    title: '極限控場：繼續遊戲',
    content: '佈署完畢！請再次點擊【暫停】按鈕（或按下 P）來繼續遊戲。',
    targetId: 'tutorial-target-pause',
    action: 'pause_game',
    position: 'top',
  },
  {
    id: 'start_next_wave_part3',
    title: '準備迎戰',
    content: '點擊【開始波次】，讓我們看看冰凍塔如何克制狂暴的敵人！',
    targetId: 'tutorial-target-start-wave',
    action: 'start_wave',
    position: 'top',
  },
  {
    id: 'finish_part3',
    title: '全數結訓！',
    content: '完美！您已經掌握了所有的戰術技巧與節奏控制。作為最終獎勵，已為您發放了 500 金幣！祝您武運昌隆！',
    action: 'next',
    position: 'center',
  },
];

interface TutorialStore {
  isActive: boolean;
  currentStepIndex: number;
  startTutorial: (part?: TutorialPart) => void;
  startCampaignTutorialIfNeeded: (levelId: string | null | undefined) => void;
  nextStep: () => void;
  endTutorial: (options?: { awardGold?: boolean }) => void;
  skipTutorial: () => void;
  checkAction: (action: string, targetId?: string) => void;
}

export const useTutorialStore = create<TutorialStore>((set, get) => ({
  isActive: false,
  currentStepIndex: 0,

  startTutorial: (part?: TutorialPart) => {
    if (part === 'part2') {
      // 從 1-2 關卡的教學步驟開始
      const part2StartIndex = INTERACTIVE_TUTORIAL_STEPS.findIndex(s => s.id === 'welcome_part2');
      set({ isActive: true, currentStepIndex: part2StartIndex >= 0 ? part2StartIndex : 0 });
    } else if (part === 'part3') {
      // 從 1-3 關卡的教學步驟開始
      const part3StartIndex = INTERACTIVE_TUTORIAL_STEPS.findIndex(s => s.id === 'welcome_part3');
      set({ isActive: true, currentStepIndex: part3StartIndex >= 0 ? part3StartIndex : 0 });
    } else {
      set({ isActive: true, currentStepIndex: 0 });
    }
  },

  startCampaignTutorialIfNeeded: (levelId) => {
    if (!shouldStartCampaignTutorial(levelId)) return;
    if (get().isActive) return;
    const part = campaignTutorialPartForLevel(levelId);
    if (!part) return;
    get().startTutorial(part);
  },

  nextStep: () => {
    set((state) => {
      if (!state.isActive) return state;
      const nextIndex = state.currentStepIndex + 1;
      
      // 特殊邏輯：如果進入等待敵人死亡階段，自動切換 10 倍速
      const nextStepObj = INTERACTIVE_TUTORIAL_STEPS[nextIndex];
      if (nextStepObj && nextStepObj.action === 'wait_wave_end') {
        import('./gameStore').then(m => {
          m.useGameStore.getState().setGameSpeed(10);
        });
      }
      
      // 特殊邏輯：如果離開等待階段，且之前有加速過，恢復 1 倍速
      // (注意：因為 wait_wave_end 是自動被外部 nextStep 觸發離開的，所以這裡也要處理)
      const currentStepObj = INTERACTIVE_TUTORIAL_STEPS[state.currentStepIndex];
      if (currentStepObj && currentStepObj.action === 'wait_wave_end') {
        import('./gameStore').then(m => {
          m.useGameStore.getState().setGameSpeed(1);
        });
      }

      const finishedPart = tutorialPartFromFinishStepId(currentStepObj?.id);
      if (finishedPart) {
        markTutorialPartCompleted(finishedPart);
        setTimeout(() => get().endTutorial(), 0);
        return state;
      }

      if (state.currentStepIndex < INTERACTIVE_TUTORIAL_STEPS.length - 1) {
        return { currentStepIndex: nextIndex };
      } else {
        setTimeout(() => get().endTutorial(), 0);
        return state;
      }
    });
  },

  endTutorial: (options?: { awardGold?: boolean }) => {
    set({ isActive: false, currentStepIndex: 0 });
    if (options?.awardGold === false) return;
    import('./gameStore').then(m => {
      m.useGameStore.getState().addMoney(500);
    });
  },

  skipTutorial: () => {
    markTutorialSkipped();
    set({ isActive: false, currentStepIndex: 0 });
    import('./gameStore').then(m => {
      m.useGameStore.getState().setGameSpeed(1);
    });
  },

  checkAction: (action: string, targetId?: string) => {
    set((state) => {
      if (!state.isActive) return state;
      const currentStep = INTERACTIVE_TUTORIAL_STEPS[state.currentStepIndex];
      
      // Check if action matches
      if (currentStep.action !== action) return state;
      
      // If targetId is provided in step, ensure it matches
      if (currentStep.targetId && currentStep.targetId !== targetId) return state;
      
      // 如果進入等待敵人死亡階段，自動切換 10 倍速
      const nextIndex = state.currentStepIndex + 1;
      const nextStepObj = INTERACTIVE_TUTORIAL_STEPS[nextIndex];
      if (nextStepObj && nextStepObj.action === 'wait_wave_end') {
        import('./gameStore').then(m => {
          m.useGameStore.getState().setGameSpeed(10);
        });
      }

      return { currentStepIndex: nextIndex };
    });
  },
}));
