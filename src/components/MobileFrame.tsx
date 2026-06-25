import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Hourglass, 
  Trophy, 
  TrendingUp, 
  Wifi, 
  Battery, 
  Signal 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { synth } from '../utils/audio';

interface MobileFrameProps {
  children: React.ReactNode;
  activeTab: 'dashboard' | 'timer' | 'rewards' | 'insights';
  onTabChange: (tab: 'dashboard' | 'timer' | 'rewards' | 'insights') => void;
  themeClass?: string;
}

export default function MobileFrame({
  children,
  activeTab,
  onTabChange,
  themeClass = 'classic'
}: MobileFrameProps) {
  const [time, setTime] = useState('');

  // Update clock in status bar
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const mins = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12; // 12-hour format
      setTime(`${hours}:${mins} ${ampm}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleTabPress = (tab: 'dashboard' | 'timer' | 'rewards' | 'insights') => {
    if (tab !== activeTab) {
      synth.playTick();
      onTabChange(tab);
    }
  };

  // Dynamic theme wrapper overlays (sakura, cyberpunk)
  const getThemeClasses = () => {
    if (themeClass === 'sakura') {
      return 'bg-pink-950/20 text-pink-100 border-pink-900/30';
    }
    if (themeClass === 'cyberpunk') {
      return 'bg-cyan-950/25 text-cyan-200 border-cyan-800/40';
    }
    return 'bg-slate-950 border-slate-900';
  };

  return (
    <div className="min-h-screen w-full bg-[#E1E3D5] flex items-center justify-center p-0 sm:p-4 md:p-6 overflow-hidden">
      
      {/* Outer Glow behind device */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#4A6741]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#D98364]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Mimicking Modern Smartphone App Frame */}
      <div className={`relative w-full max-w-md h-screen sm:h-[820px] sm:rounded-[42px] sm:shadow-[0_24px_60px_rgba(74,103,65,0.2)] sm:border-[10px] border-[#2D302D] bg-[#F2F2EB] flex flex-col overflow-hidden transition-all duration-300`}>
        
        {/* TOP STATUS BAR (MOCK PHONE CAP BAR) */}
        <div className="h-8 shrink-0 bg-white text-[#2D302D] px-6 flex items-center justify-between text-[11px] font-bold tracking-tight select-none border-b border-[#E1E3D5]">
          
          {/* Mock Time */}
          <span className="font-mono">{time || '9:41 AM'}</span>
          
          {/* Sleek Notch / Speaker grill on top of mockup (only on desktop screen view) */}
          <div className="hidden sm:block absolute top-[2px] left-1/2 -translate-x-1/2 w-28 h-4.5 bg-[#2D302D] rounded-b-xl border-x border-b border-[#2D302D] z-50">
            {/* Small camera/speaker indicators inside notch */}
            <div className="absolute left-4 top-1 w-1.5 h-1.5 rounded-full bg-slate-800" />
            <div className="absolute right-6 top-1.5 w-10 h-1 bg-slate-900 rounded-full" />
          </div>

          {/* Status Icons */}
          <div className="flex items-center gap-1.5 font-mono text-[#6A6E6A]">
            <Signal className="w-3.5 h-3.5 text-[#6A6E6A]" />
            <span className="text-[10px]">5G</span>
            <Wifi className="w-3.5 h-3.5 text-[#6A6E6A]" />
            <Battery className="w-4 h-4 ml-0.5 text-[#4A6741]" />
          </div>
        </div>

        {/* ACTIVE MAIN VIEW SCREEN PORTAL */}
        <div className="flex-1 relative overflow-hidden flex flex-col bg-[#F2F2EB]">
          {children}
        </div>

        {/* BOTTOM NAV BAR (MOCK PHONE NAV RAIL) */}
        <div className="absolute bottom-0 left-0 right-0 h-20 shrink-0 bg-white border-t border-[#E1E3D5] px-6 pt-2 pb-5 flex justify-between items-center z-30 select-none">
          {[
            { id: 'dashboard', label: 'Shield', icon: <ShieldCheck className="w-5 h-5" /> },
            { id: 'timer', label: 'Focus', icon: <Hourglass className="w-5 h-5" /> },
            { id: 'rewards', label: 'Shop', icon: <Trophy className="w-5 h-5" /> },
            { id: 'insights', label: 'Insights', icon: <TrendingUp className="w-5 h-5" /> }
          ].map(tab => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabPress(tab.id as any)}
                className="flex flex-col items-center justify-center flex-1 py-1.5 relative group"
              >
                {/* Visual Circle highlight for selected */}
                <div className={`p-1.5 rounded-xl transition-all relative ${
                  isSelected 
                    ? 'text-[#4A6741] bg-[#4A6741]/10 scale-110' 
                    : 'text-[#6A6E6A] hover:text-[#2D302D]'
                }`}>
                  {tab.icon}
                  {isSelected && (
                    <motion.div
                      layoutId="navGlow"
                      className="absolute inset-0 bg-[#4A6741]/5 rounded-xl blur-[2px]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </div>
                <span className={`text-[9px] mt-1 font-bold uppercase tracking-wider font-sans ${
                  isSelected ? 'text-[#4A6741] font-extrabold' : 'text-[#6A6E6A] group-hover:text-[#2D302D]'
                }`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

      </div>

    </div>
  );
}
