import React, { useState } from 'react';
import { DayUsage } from '../types';
import { 
  TrendingUp, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  Zap, 
  Info, 
  Activity, 
  ArrowUpRight,
  BrainCircuit,
  Lock,
  ChevronRight,
  Sliders,
  Settings,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { synth } from '../utils/audio';
import { getAiCoachRecommendation } from '../utils/ai';

interface InsightsViewProps {
  usageHistory: DayUsage[];
  trackedApps?: any;
  hardcoreMode: boolean;
  onToggleHardcore: () => void;
}

export default function InsightsView({
  usageHistory,
  hardcoreMode,
  onToggleHardcore
}: InsightsViewProps) {
  const [dailyGoalMins, setDailyGoalMins] = useState(180); // Default 3 hours
  const [coachResponse, setCoachResponse] = useState<string>(
    `“Zenji observes that you are most distracted during lunchtime (12 PM - 2 PM), with TikTok accounting for 65% of screen usage. Your morning focus block is highly disciplined — keep up that Stoic posture!”`
  );
  const [isGeneratingCoach, setIsGeneratingCoach] = useState(false);

  // Stats aggregate calculations
  const totalScreenTime = usageHistory.reduce((acc, curr) => acc + curr.screenTimeMins, 0);
  const totalFocusTime = usageHistory.reduce((acc, curr) => acc + curr.focusMins, 0);
  const totalDeflections = usageHistory.reduce((acc, curr) => acc + curr.blocksCount, 0);
  const avgScreenTime = Math.round(totalScreenTime / usageHistory.length);

  const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDailyGoalMins(Number(e.target.value));
  };

  const handleAskCoach = async () => {
    synth.playTick();
    setIsGeneratingCoach(true);
    try {
      // Create a payload from actual history logs
      const historySummary = usageHistory.map(h => `${h.day}: ScreenTime=${h.screenTimeMins}m, FocusTime=${h.focusMins}m, Blocks=${h.blocksCount}`).join('; ');
      const result = await getAiCoachRecommendation(historySummary, hardcoreMode);
      setCoachResponse(result);
      synth.playChime(true);
    } catch (e) {
      console.error(e);
      setCoachResponse("“Zenji cannot reach the Stoic scrolls right now due to a connection break, but suggests taking a brief deep breath before continuing your day.”");
    } finally {
      setIsGeneratingCoach(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F2F2EB] text-[#2D302D] overflow-y-auto pb-24 scrollbar-none">
      
      {/* HEADER */}
      <div className="p-4 flex justify-between items-center bg-white border-b border-[#E1E3D5] shrink-0">
        <div>
          <h1 className="text-xl font-serif font-bold tracking-tight text-[#2D302D] flex items-center gap-1.5">
            <TrendingUp className="w-5 h-5 text-[#4A6741]" />
            Digital Insights
          </h1>
          <p className="text-xs text-[#6A6E6A]">Detailed stats & AI lifestyle recommendations</p>
        </div>
      </div>

      {/* Grid Stats Overview row */}
      <div className="p-4 grid grid-cols-3 gap-2.5 shrink-0">
        <div className="bg-white border border-[#E1E3D5] p-3 rounded-2xl flex flex-col items-center text-center shadow-sm">
          <span className="text-[9px] uppercase text-[#6A6E6A] font-bold">Avg Screen</span>
          <span className="text-base font-extrabold text-[#2D302D] mt-0.5">{avgScreenTime}m</span>
        </div>
        <div className="bg-white border border-[#E1E3D5] p-3 rounded-2xl flex flex-col items-center text-center shadow-sm">
          <span className="text-[9px] uppercase text-[#6A6E6A] font-bold">Total Focus</span>
          <span className="text-base font-extrabold text-[#4A6741] mt-0.5">{totalFocusTime}m</span>
        </div>
        <div className="bg-white border border-[#E1E3D5] p-3 rounded-2xl flex flex-col items-center text-center shadow-sm">
          <span className="text-[9px] uppercase text-[#6A6E6A] font-bold">Deflected</span>
          <span className="text-base font-extrabold text-[#D98364] mt-0.5">{totalDeflections}</span>
        </div>
      </div>

      {/* Weekly Trend Chart */}
      <div className="px-4 shrink-0">
        <div className="bg-white border border-[#E1E3D5] p-4.5 rounded-2xl shadow-sm relative overflow-hidden flex flex-col">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#6A6E6A] mb-3 font-sans">Weekly Screen Time Trend</h3>
          
          {/* Histogram Rows */}
          <div className="h-40 flex items-end justify-between gap-2.5 pt-3 border-b border-[#E1E3D5] pb-2 relative">
            
            {/* Guide Gridlines */}
            <div className="absolute inset-x-0 top-1/4 border-t border-[#E1E3D5]/40 border-dashed pointer-events-none" />
            <div className="absolute inset-x-0 top-2/4 border-t border-[#E1E3D5]/40 border-dashed pointer-events-none" />
            <div className="absolute inset-x-0 top-3/4 border-t border-[#E1E3D5]/40 border-dashed pointer-events-none" />

            {usageHistory.map((day) => {
              // Calculate percentages relative to 360 max scale
              const screenPct = Math.min((day.screenTimeMins / 360) * 100, 100);
              const focusPct = Math.min((day.focusMins / 360) * 100, 100);

              return (
                <div key={day.day} className="flex-1 flex flex-col items-center h-full justify-end relative group">
                  
                  {/* Outer interactive tooltip */}
                  <div className="absolute -top-12 scale-0 group-hover:scale-100 transition-all bg-[#2D302D] text-white text-[9px] px-2 py-1 rounded-lg z-20 pointer-events-none shadow-md font-sans flex flex-col text-center">
                    <span>Screen: {day.screenTimeMins}m</span>
                    <span className="text-[#8E9B7E]">Focus: {day.focusMins}m</span>
                  </div>

                  {/* Dual Bar Track Columns */}
                  <div className="w-full flex items-end gap-1 h-full max-h-[120px]">
                    
                    {/* Screen Time Bar (Terracotta) */}
                    <div className="flex-1 bg-[#F2F2EB] rounded-t h-full flex flex-col justify-end">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${screenPct}%` }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="w-full bg-[#D98364] hover:bg-[#C27354] rounded-t transition-colors cursor-pointer"
                      />
                    </div>

                    {/* Focus Time Bar (Forest Green) */}
                    <div className="flex-1 bg-[#F2F2EB] rounded-t h-full flex flex-col justify-end">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${focusPct}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="w-full bg-[#4A6741] hover:bg-[#3D5535] rounded-t transition-colors cursor-pointer"
                      />
                    </div>

                  </div>

                  <span className="text-[9px] text-[#6A6E6A] font-semibold mt-2.5 tracking-tighter max-w-full overflow-hidden whitespace-nowrap">
                    {day.day.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Legend indicator badges */}
          <div className="flex justify-center gap-4 text-[10px] text-[#6A6E6A] mt-3.5 font-bold">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#D98364]" />
              <span>Screen Time</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#4A6741]" />
              <span>Focus Shield Time</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Coach Section */}
      <div className="p-4 shrink-0">
        <div className="bg-gradient-to-tr from-white via-white to-[#4A6741]/5 border border-[#E1E3D5] p-4.5 rounded-2xl relative overflow-hidden flex flex-col shadow-sm">
          
          {/* Subtle logo backdrops */}
          <div className="absolute top-4 right-4 text-[#4A6741]/10">
            <BrainCircuit className="w-16 h-16" />
          </div>

          <div className="flex items-center gap-2 mb-3.5">
            <BrainCircuit className="w-5 h-5 text-[#4A6741]" />
            <h3 className="text-sm font-serif font-extrabold text-[#4A6741]">Stoic AI Habit Coach</h3>
          </div>

          <div className="bg-[#F2F2EB]/50 border border-[#E1E3D5]/60 p-4 rounded-xl relative">
            <p className="text-xs font-serif leading-relaxed italic text-[#2D302D]">
              {coachResponse}
            </p>
          </div>

          <button 
            onClick={handleAskCoach}
            disabled={isGeneratingCoach}
            className="w-full py-2.5 bg-[#4A6741] hover:bg-[#3D5535] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm mt-4 flex items-center justify-center gap-2"
          >
            {isGeneratingCoach ? (
              <>
                <svg className="animate-spin h-4 w-4 text-[#4A6741]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Consulting Stoic scrolls...</span>
              </>
            ) : (
              <>
                <span>Generate Stoic Coach Report</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Hardcore & Target Config Controls */}
      <div className="px-4 pb-12 shrink-0">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#6A6E6A] mb-2 px-1">Settings</h3>
        
        <div className="bg-white border border-[#E1E3D5] rounded-2xl p-4 space-y-4 shadow-sm">
          
          {/* Hardcore Mode Toggle */}
          <div className="flex items-center justify-between py-1">
            <div className="max-w-[75%]">
              <span className="text-xs font-bold text-[#2D302D] flex items-center gap-1">
                <ShieldAlert className="w-4 h-4 text-[#D98364] shrink-0" />
                Hardcore Shield Lock
              </span>
              <p className="text-[10px] text-[#6A6E6A] mt-0.5">Disables pause options and inflicts negative XP penances when active timers are terminated early.</p>
            </div>
            <button
              onClick={() => { synth.playChime(true); onToggleHardcore(); }}
              className={`w-11 h-6 rounded-full p-1 transition-all shrink-0 ${
                hardcoreMode ? 'bg-[#D98364]' : 'bg-[#E1E3D5]'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-all ${
                hardcoreMode ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          <div className="border-t border-[#E1E3D5]/60 pt-4">
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-xs font-bold text-[#2D302D]">Daily Screen Goal</span>
              <span className="text-xs font-sans font-extrabold text-[#4A6741]">{Math.floor(dailyGoalMins / 60)} hrs {dailyGoalMins % 60} mins</span>
            </div>
            <input
              type="range"
              min="60"
              max="360"
              step="15"
              value={dailyGoalMins}
              onChange={handleGoalChange}
              className="w-full accent-[#4A6741] h-1.5 bg-[#E1E3D5] rounded-lg cursor-pointer"
            />
          </div>

        </div>
      </div>

    </div>
  );
}
