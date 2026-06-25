import React, { useState, useEffect } from 'react';
import MobileFrame from './components/MobileFrame';
import DashboardView from './components/DashboardView';
import FocusTimerView from './components/FocusTimerView';
import RewardsView from './components/RewardsView';
import InsightsView from './components/InsightsView';
import { TrackedApp, DailyQuest, RewardItem } from './types';
import { getInitialState, saveState, AppState } from './utils/storage';
import { synth } from './utils/audio';

export default function App() {
  const [state, setState] = useState<AppState>(getInitialState());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'timer' | 'rewards' | 'insights'>('dashboard');

  // Sync state to local storage whenever it changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  const handleUpdateApp = (updatedApp: TrackedApp) => {
    const updatedApps = state.trackedApps.map(app => 
      app.id === updatedApp.id ? updatedApp : app
    );
    
    // Check if daily quest for blocks needs updating
    let questUpdate = state.quests;
    if (updatedApp.isBlocked && !state.trackedApps.find(a => a.id === updatedApp.id)?.isBlocked) {
      questUpdate = state.quests.map(q => {
        if (q.id === 'q_blocks') {
          const newProgress = Math.min(q.progress + 1, q.target);
          return { ...q, progress: newProgress };
        }
        return q;
      });
    }

    setState(prev => ({
      ...prev,
      trackedApps: updatedApps,
      quests: questUpdate
    }));
  };

  const handleAddApp = (newApp: Omit<TrackedApp, 'id' | 'usageMinutes' | 'isBlocked'>) => {
    const id = `app_${newApp.name.toLowerCase().replace(/\s+/g, '_')}`;
    const created: TrackedApp = {
      ...newApp,
      id,
      usageMinutes: 0,
      isBlocked: false
    };
    setState(prev => ({
      ...prev,
      trackedApps: [...prev.trackedApps, created]
    }));
  };

  const handleAddXp = (amount: number) => {
    setState(prev => {
      const newXp = Math.max(prev.xp + amount, 0);
      const newLevel = Math.floor(newXp / 500) + 1;
      
      if (newLevel > prev.level) {
        // Triggers audio chime and alert
        setTimeout(() => {
          synth.playChime(true);
        }, 100);
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel
      };
    });
  };

  const handleIncrementBlocks = () => {
    setState(prev => {
      // Find today's entry and increment blocksCount
      const updatedHistory = prev.usageHistory.map((d, index) => {
        if (index === prev.usageHistory.length - 1) {
          return { ...d, blocksCount: d.blocksCount + 1 };
        }
        return d;
      });

      return {
        ...prev,
        blockCounter: prev.blockCounter + 1,
        usageHistory: updatedHistory
      };
    });
  };

  const handleCompleteFocusSession = (mins: number) => {
    setState(prev => {
      // 1. Update active daily usage history
      const updatedHistory = prev.usageHistory.map((d, index) => {
        if (index === prev.usageHistory.length - 1) {
          return { ...d, focusMins: d.focusMins + mins };
        }
        return d;
      });

      // 2. Increment focus session and productive mins quests
      const updatedQuests = prev.quests.map(q => {
        if (q.id === 'q_session') {
          return { ...q, progress: Math.min(q.progress + 1, q.target) };
        }
        if (q.id === 'q_prod') {
          return { ...q, progress: Math.min(q.progress + mins, q.target) };
        }
        return q;
      });

      return {
        ...prev,
        usageHistory: updatedHistory,
        quests: updatedQuests
      };
    });
  };

  const handleToggleHardcore = () => {
    setState(prev => ({
      ...prev,
      hardcoreMode: !prev.hardcoreMode
    }));
  };

  const handleUpdateQuests = (updatedQuests: DailyQuest[]) => {
    setState(prev => ({
      ...prev,
      quests: updatedQuests
    }));
  };

  const handleUpdateRewards = (updatedRewards: RewardItem[]) => {
    setState(prev => ({
      ...prev,
      rewardsStore: updatedRewards
    }));
  };

  const handleUpdateSkin = (skin: string) => {
    setState(prev => ({
      ...prev,
      selectedSkin: skin
    }));
  };

  const handleUpdateTheme = (theme: string) => {
    setState(prev => ({
      ...prev,
      selectedTheme: theme
    }));
  };

  return (
    <MobileFrame 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      themeClass={state.selectedTheme}
    >
      <div className="flex-1 relative overflow-hidden h-full">
        {activeTab === 'dashboard' && (
          <DashboardView
            trackedApps={state.trackedApps}
            streak={state.streak}
            xp={state.xp}
            level={state.level}
            blockCounter={state.blockCounter}
            onUpdateApp={handleUpdateApp}
            onAddApp={handleAddApp}
            onAddXp={handleAddXp}
            onIncrementBlocks={handleIncrementBlocks}
          />
        )}
        
        {activeTab === 'timer' && (
          <FocusTimerView
            trackedApps={state.trackedApps}
            skin={state.selectedSkin}
            isHardcore={state.hardcoreMode}
            onAddXp={handleAddXp}
            onIncrementBlocks={handleIncrementBlocks}
            onCompleteSession={handleCompleteFocusSession}
          />
        )}

        {activeTab === 'rewards' && (
          <RewardsView
            xp={state.xp}
            level={state.level}
            quests={state.quests}
            rewardsStore={state.rewardsStore}
            leaderboard={state.leaderboard}
            selectedSkin={state.selectedSkin}
            selectedTheme={state.selectedTheme}
            onUpdateQuests={handleUpdateQuests}
            onUpdateRewards={handleUpdateRewards}
            onUpdateSkin={handleUpdateSkin}
            onUpdateTheme={handleUpdateTheme}
            onAddXp={handleAddXp}
          />
        )}

        {activeTab === 'insights' && (
          <InsightsView
            usageHistory={state.usageHistory}
            trackedApps={state.trackedApps}
            hardcoreMode={state.hardcoreMode}
            onToggleHardcore={handleToggleHardcore}
          />
        )}
      </div>
    </MobileFrame>
  );
}
