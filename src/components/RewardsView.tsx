import React, { useState } from 'react';
import { RewardItem, DailyQuest, LeaderboardUser } from '../types';
import { 
  Trophy, 
  Flame, 
  Sparkles, 
  ShieldAlert, 
  Palette, 
  Lock, 
  Check, 
  Shirt, 
  Compass, 
  Quote, 
  ChevronRight,
  TrendingUp,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { synth } from '../utils/audio';

interface RewardsViewProps {
  quests: DailyQuest[];
  rewardsStore: RewardItem[];
  leaderboard: LeaderboardUser[];
  xp: number;
  level: number;
  selectedTheme: string;
  selectedSkin: string;
  onUpdateQuests: (quests: DailyQuest[]) => void;
  onUpdateRewards: (rewards: RewardItem[]) => void;
  onUpdateSkin: (skin: string) => void;
  onUpdateTheme: (theme: string) => void;
  onAddXp: (amount: number) => void;
}

export default function RewardsView({
  quests,
  rewardsStore,
  leaderboard,
  xp,
  level,
  selectedTheme,
  selectedSkin,
  onUpdateQuests,
  onUpdateRewards,
  onUpdateSkin,
  onUpdateTheme,
  onAddXp
}: RewardsViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'quests' | 'shop' | 'leagues'>('quests');
  
  // XP bounds calculation (each level is 500 XP)
  const levelXpStart = (level - 1) * 500;
  const currentLevelXp = xp - levelXpStart;
  const xpPercentage = Math.min((currentLevelXp / 500) * 100, 100);

  // Sound triggers
  const handleTabClick = (tab: 'quests' | 'shop' | 'leagues') => {
    synth.playTick();
    setActiveSubTab(tab);
  };

  const handleBuy = (item: RewardItem) => {
    if (xp >= item.cost) {
      synth.playChime(true);
      onAddXp(-item.cost);
      const updatedStore = rewardsStore.map(r => r.id === item.id ? { ...r, unlocked: true } : r);
      onUpdateRewards(updatedStore);
    } else {
      synth.playGiveUp(); // error buzz
    }
  };

  const handleEquip = (item: RewardItem) => {
    synth.playChime(false);
    if (item.category === 'skins') {
      onUpdateSkin(item.value);
    } else if (item.category === 'themes') {
      onUpdateTheme(item.value);
    }
  };

  const getRewardIcon = (iconName: string) => {
    if (iconName === 'Shirt') return <Shirt className="w-5 h-5 text-amber-500" />;
    if (iconName === 'Sparkles') return <Sparkles className="w-5 h-5 text-yellow-500" />;
    if (iconName === 'Palette') return <Palette className="w-5 h-5 text-indigo-400" />;
    if (iconName === 'ShieldAlert') return <ShieldAlert className="w-5 h-5 text-rose-400" />;
    if (iconName === 'Quote') return <Quote className="w-5 h-5 text-cyan-400" />;
    return <Trophy className="w-5 h-5 text-[#D98364]" />;
  };

  return (
    <div className="flex flex-col h-full bg-[#F2F2EB] text-[#2D302D] overflow-y-auto pb-24 scrollbar-none">
      
      {/* HEADER BAR */}
      <div className="p-4 flex justify-between items-center bg-white border-b border-[#E1E3D5] shrink-0">
        <div>
          <h1 className="text-xl font-serif font-bold tracking-tight text-[#2D302D] flex items-center gap-1.5">
            <Trophy className="w-5 h-5 text-[#4A6741]" />
            Zenji's Rewards
          </h1>
          <p className="text-xs text-[#6A6E6A]">Collect XP & customize your shield</p>
        </div>
        
        {/* Seed Points counter button */}
        <div className="flex items-center bg-[#D98364]/10 border border-[#D98364]/20 px-3 py-1 rounded-full text-xs font-bold text-[#D98364] shadow-sm">
          <Sparkles className="w-3.5 h-3.5 mr-1 text-[#D98364] animate-pulse" />
          <span>{xp} XP Points</span>
        </div>
      </div>

      {/* Level Info Hero Section */}
      <div className="p-5 flex flex-col bg-white/40 border-b border-[#E1E3D5] relative overflow-hidden">
        {/* Progress header details */}
        <div className="flex justify-between items-baseline mb-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-[#2D302D] tracking-tight">Level {level}</span>
            <span className="text-xs text-[#6A6E6A] font-bold uppercase tracking-wider">Zen Guardian</span>
          </div>
          <span className="text-xs font-bold text-[#6A6E6A]">{currentLevelXp}/500 XP to Lvl {level + 1}</span>
        </div>

        {/* Level XP progress bar */}
        <div className="w-full h-3 bg-[#E1E3D5] rounded-full overflow-hidden shadow-inner">
          <motion.div 
            className="h-full bg-gradient-to-r from-[#4A6741] to-[#8E9B7E] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${xpPercentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>

        <div className="flex justify-between text-[10px] text-[#6A6E6A] mt-2 font-semibold">
          <span>Level {level} Start</span>
          <span>Next Milestone</span>
        </div>
      </div>

      {/* Sub Navigation Pills */}
      <div className="flex gap-2 px-4 mt-4 shrink-0">
        {[
          { id: 'quests', label: 'Daily Quests' },
          { id: 'shop', label: 'Theme Store' },
          { id: 'leagues', label: 'Zen League' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id as any)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
              activeSubTab === tab.id
                ? 'bg-[#4A6741] text-white border-[#4A6741] shadow-sm shadow-[#4A6741]/20'
                : 'bg-white hover:bg-white/80 text-[#6A6E6A] border-[#E1E3D5]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT PORTAL */}
      <div className="flex-1 p-4">
        <AnimatePresence mode="wait">
          
          {/* TAB A: DAILY QUESTS */}
          {activeSubTab === 'quests' && (
            <motion.div
              key="quests"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-3"
            >
              <div className="flex justify-between items-baseline px-1">
                <span className="text-xs font-serif font-bold text-[#6A6E6A]">Strengthen daily micro-habits</span>
                <span className="text-[10px] text-[#4A6741] font-bold font-sans">Resets in 14 hours</span>
              </div>

              {quests.map(quest => {
                const isComplete = quest.completed || quest.progress >= quest.target;
                const progressRatio = Math.min(quest.progress / quest.target, 1);
                
                return (
                  <div 
                    key={quest.id}
                    className="bg-white border border-[#E1E3D5] rounded-2xl p-4 flex flex-col justify-between hover:border-[#8E9B7E] transition-all shadow-sm relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="text-xs font-bold text-[#2D302D] leading-tight">{quest.title}</h4>
                        <p className="text-[10px] text-[#6A6E6A] mt-1 font-sans">
                          Progress: {quest.progress} / {quest.target} {quest.unit}
                        </p>
                      </div>
                      
                      {isComplete ? (
                        <div className="flex items-center gap-1 bg-[#4A6741]/10 border border-[#4A6741]/20 px-2 py-0.5 rounded-full text-[10px] font-extrabold text-[#4A6741] uppercase tracking-wider">
                          <Check className="w-3 h-3 text-[#4A6741]" /> Complete
                        </div>
                      ) : (
                        <div className="flex items-center bg-[#D98364]/10 border border-[#D98364]/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-[#D98364] tracking-tight">
                          +{quest.points} XP
                        </div>
                      )}
                    </div>

                    {/* Progress tracking line */}
                    <div className="w-full h-1.5 bg-[#E1E3D5] rounded-full overflow-hidden mt-3 relative">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-[#4A6741]' : 'bg-[#D98364]'}`}
                        style={{ width: `${progressRatio * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}

          {/* TAB B: SHOP / THEMES & SKINS */}
          {activeSubTab === 'shop' && (
            <motion.div
              key="shop"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-3"
            >
              <div className="flex justify-between items-baseline px-1">
                <span className="text-xs font-serif font-bold text-[#6A6E6A]">Customize your focus companion</span>
                <span className="text-[10px] text-[#D98364] font-bold font-sans">Redeem points safely</span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {rewardsStore.map(item => {
                  const isSkinEquipped = item.category === 'skins' && selectedSkin === item.value;
                  const isThemeEquipped = item.category === 'themes' && selectedTheme === item.value;
                  const isEquipped = isSkinEquipped || isThemeEquipped;
                  
                  return (
                    <div 
                      key={item.id}
                      className={`bg-white border rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-sm transition-all relative overflow-hidden ${
                        isEquipped 
                          ? 'border-[#4A6741] bg-[#4A6741]/2' 
                          : 'border-[#E1E3D5] hover:border-[#8E9B7E]'
                      }`}
                    >
                      {/* Left: icon & details */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#F2F2EB] flex items-center justify-center shrink-0">
                          {getRewardIcon(item.icon)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-[#2D302D] truncate">{item.name}</h4>
                            <span className="text-[8px] bg-[#F2F2EB] text-[#6A6E6A] px-1.5 py-0.2 rounded font-sans uppercase font-bold tracking-wider">{item.category}</span>
                          </div>
                          <p className="text-[10px] text-[#6A6E6A] leading-tight mt-0.5 max-w-[190px]">{item.description}</p>
                        </div>
                      </div>

                      {/* Right: action buttons */}
                      <div className="shrink-0">
                        {item.unlocked ? (
                          isEquipped ? (
                            <div className="flex items-center gap-0.5 bg-[#4A6741]/10 border border-[#4A6741]/30 text-[#4A6741] text-[10px] px-2.5 py-1 rounded-xl font-extrabold font-sans uppercase">
                              <Check className="w-3.5 h-3.5" /> Equipped
                            </div>
                          ) : (
                            <button
                              onClick={() => handleEquip(item)}
                              className="px-3 py-1 bg-[#F2F2EB] border border-[#E1E3D5] text-[#2D302D] hover:bg-[#E1E3D5] rounded-xl text-[10px] font-bold uppercase transition-all"
                            >
                              Equip
                            </button>
                          )
                        ) : (
                          <button
                            onClick={() => handleBuy(item)}
                            disabled={xp < item.cost}
                            className={`px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold uppercase transition-all flex items-center gap-1 ${
                              xp >= item.cost
                                ? 'bg-[#D98364] hover:bg-[#C27354] text-white shadow-md shadow-[#D98364]/10'
                                : 'bg-[#E1E3D5] text-[#6A6E6A] cursor-not-allowed'
                            }`}
                          >
                            <Lock className="w-3 h-3" /> {item.cost} XP
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* TAB C: LEAGUES */}
          {activeSubTab === 'leagues' && (
            <motion.div
              key="leagues"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-4"
            >
              {/* League header banner */}
              <div className="bg-gradient-to-r from-[#4A6741]/10 via-[#8E9B7E]/5 to-transparent border border-[#E1E3D5] p-4 rounded-2xl flex items-center gap-3.5 shadow-sm">
                <div className="p-2.5 bg-[#4A6741]/15 rounded-xl text-[#4A6741]">
                  <TrendingUp className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#4A6741] uppercase tracking-wider">Emerald League</h3>
                  <p className="text-[11px] text-[#2D302D] font-serif leading-none mt-1">Top 3 advance to Diamond League</p>
                  <p className="text-[10px] text-[#6A6E6A] mt-1 font-sans">Ends Sunday at midnight UTC</p>
                </div>
              </div>

              {/* Leaderboard list */}
              <div className="bg-white border border-[#E1E3D5] rounded-2xl overflow-hidden shadow-sm">
                {leaderboard.map(user => {
                  const isCurrentUser = !!user.isCurrentUser;
                  const rankColor = 
                    user.rank === 1 
                      ? 'bg-[#D98364] text-white' 
                      : user.rank === 2 
                      ? 'bg-[#8E9B7E] text-white' 
                      : user.rank === 3 
                      ? 'bg-[#E1E3D5] text-[#2D302D]' 
                      : 'text-[#6A6E6A]';

                  return (
                    <div 
                      key={user.name}
                      className={`flex items-center justify-between px-4 py-3 border-b border-[#E1E3D5] last:border-0 transition-colors ${
                        isCurrentUser 
                          ? 'bg-[#4A6741]/10 hover:bg-[#4A6741]/15' 
                          : 'hover:bg-[#F2F2EB]/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Rank Badge */}
                        <div className={`w-6 h-6 rounded-lg text-center flex items-center justify-center text-xs font-bold font-sans ${rankColor}`}>
                          {user.rank}
                        </div>

                        {/* User info */}
                        <div>
                          <span className={`text-xs font-bold text-[#2D302D] flex items-center gap-1 ${isCurrentUser ? 'font-black' : ''}`}>
                            {user.name}
                            {isCurrentUser && (
                              <span className="text-[8px] px-1 bg-[#4A6741]/10 text-[#4A6741] font-extrabold uppercase rounded">You</span>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Score XP */}
                      <span className="text-xs font-bold text-[#4A6741] font-sans">
                        {user.xp} XP
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
