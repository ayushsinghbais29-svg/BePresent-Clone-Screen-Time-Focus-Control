import React, { useState } from 'react';
import { TrackedApp } from '../types';
import { 
  Instagram, 
  Flame, 
  Youtube, 
  MessageSquare, 
  Gamepad2, 
  Slack, 
  Settings, 
  ShieldAlert, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  Plus, 
  Search,
  Lock,
  Unlock,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { synth } from '../utils/audio';

interface DashboardViewProps {
  trackedApps: TrackedApp[];
  streak: number;
  xp: number;
  level: number;
  blockCounter: number;
  onUpdateApp: (app: TrackedApp) => void;
  onAddApp: (app: Omit<TrackedApp, 'id' | 'usageMinutes' | 'isBlocked'>) => void;
  onAddXp: (amount: number) => void;
  onIncrementBlocks: () => void;
}

export default function DashboardView({
  trackedApps,
  streak,
  xp,
  level,
  blockCounter,
  onUpdateApp,
  onAddApp,
  onAddXp,
  onIncrementBlocks
}: DashboardViewProps) {
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<TrackedApp | null>(null);
  
  // App limit edit fields
  const [limitMinutes, setLimitMinutes] = useState<number>(30);
  const [hasLimit, setHasLimit] = useState(true);

  // New App creation fields
  const [newAppName, setNewAppName] = useState('');
  const [newAppCategory, setNewAppCategory] = useState<'Social' | 'Entertainment' | 'Productivity' | 'Games'>('Social');
  const [newAppLimit, setNewAppLimit] = useState<number>(45);
  const [hasNewLimit, setHasNewLimit] = useState(true);

  // Total screen time calculation
  const totalScreenTimeMins = trackedApps.reduce((acc, app) => acc + app.usageMinutes, 0);
  // Calculate average daily limit threshold (sum of limits)
  const totalLimitsMins = trackedApps.reduce((acc, app) => acc + (app.limitMinutes || 0), 0) || 180;
  
  const formattedTotalTime = `${Math.floor(totalScreenTimeMins / 60)}h ${totalScreenTimeMins % 60}m`;
  const ratio = Math.min(totalScreenTimeMins / totalLimitsMins, 1);
  const strokeDashoffset = 282.6 - (282.6 * ratio);

  const appIconMap: Record<string, React.ReactNode> = {
    Instagram: <Instagram className="w-5 h-5 text-white" />,
    Flame: <Flame className="w-5 h-5 text-white" />,
    Youtube: <Youtube className="w-5 h-5 text-white" />,
    MessageSquare: <MessageSquare className="w-5 h-5 text-white" />,
    Gamepad2: <Gamepad2 className="w-5 h-5 text-white" />,
    Slack: <Slack className="w-5 h-5 text-white" />,
  };

  const getAppIcon = (iconName: string) => {
    return appIconMap[iconName] || <SmartphoneIcon />;
  };

  function SmartphoneIcon() {
    return <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
  }

  const handleToggleBlock = (app: TrackedApp) => {
    const updated = { ...app, isBlocked: !app.isBlocked };
    onUpdateApp(updated);
    if (updated.isBlocked) {
      synth.playBlockZap();
      onIncrementBlocks();
      onAddXp(15); // reward points for blocking
    } else {
      synth.playTick();
    }
  };

  const openLimitModal = (app: TrackedApp) => {
    setSelectedApp(app);
    setLimitMinutes(app.limitMinutes || 30);
    setHasLimit(app.limitMinutes !== null);
    setIsLimitModalOpen(true);
  };

  const saveAppLimit = () => {
    if (selectedApp) {
      const updated = {
        ...selectedApp,
        limitMinutes: hasLimit ? limitMinutes : null
      };
      // If setting limit and current usage exceeds it, auto-block
      if (hasLimit && updated.usageMinutes >= limitMinutes) {
        updated.isBlocked = true;
      }
      onUpdateApp(updated);
      setIsLimitModalOpen(false);
      synth.playTick();
    }
  };

  const handleCreateApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppName.trim()) return;

    // Map category to a gorgeous color scheme
    let color = 'from-slate-500 to-slate-700';
    let icon = 'Smartphone';
    if (newAppCategory === 'Social') {
      color = 'from-[#D98364] to-[#B45309]';
      icon = 'Instagram';
    } else if (newAppCategory === 'Entertainment') {
      color = 'from-amber-600 to-amber-700';
      icon = 'Youtube';
    } else if (newAppCategory === 'Games') {
      color = 'from-[#8E9B7E] to-[#4A6741]';
      icon = 'Gamepad2';
    } else if (newAppCategory === 'Productivity') {
      color = 'from-[#4A6741] to-[#2D302D]';
      icon = 'Slack';
    }

    onAddApp({
      name: newAppName,
      category: newAppCategory,
      limitMinutes: hasNewLimit ? newAppLimit : null,
      color,
      icon
    });

    setNewAppName('');
    setIsAddModalOpen(false);
    synth.playChime(true);
  };

  const filteredApps = filterCategory === 'All' 
    ? trackedApps 
    : trackedApps.filter(app => app.category === filterCategory);

  return (
    <div className="flex flex-col h-full bg-[#F2F2EB] text-[#2D302D] overflow-y-auto pb-24 scrollbar-none">
      
      {/* Header Info */}
      <div className="p-4 flex justify-between items-center bg-white border-b border-[#E1E3D5]">
        <div>
          <h1 className="text-xl font-serif font-bold tracking-tight text-[#2D302D] flex items-center gap-1.5">
            <ShieldCheck className="w-6 h-6 text-[#4A6741]" />
            BePresent <span className="text-xs px-2 py-0.5 bg-[#4A6741]/10 text-[#4A6741] rounded-full font-semibold font-sans">Active Shield</span>
          </h1>
          <p className="text-xs text-[#6A6E6A]">Control your digital habits</p>
        </div>
        
        {/* Streak & Level Info */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#D98364]/10 border border-[#D98364]/20 px-2.5 py-1 rounded-full text-xs font-bold text-[#D98364]">
            <Flame className="w-3.5 h-3.5 fill-[#D98364] mr-1 animate-bounce" />
            {streak}d Streak
          </div>
          <div className="flex items-center bg-[#4A6741]/10 border border-[#4A6741]/20 px-2.5 py-1 rounded-full text-xs font-bold text-[#4A6741]">
            <Sparkles className="w-3.5 h-3.5 mr-1 text-[#4A6741]" />
            Lvl {level}
          </div>
        </div>
      </div>

      {/* Hero Circular Progress */}
      <div className="p-6 flex flex-col items-center justify-center bg-white/40 border-b border-[#E1E3D5] relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#4A6741]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative w-40 h-40 flex items-center justify-center">
          {/* Radial SVG Track */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="transparent"
              className="stroke-[#E1E3D5]"
              strokeWidth="6"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="transparent"
              className="stroke-[#4A6741]"
              strokeWidth="6"
              strokeDasharray="282.6"
              initial={{ strokeDashoffset: 282.6 }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              strokeLinecap="round"
            />
          </svg>
          
          {/* Center text */}
          <div className="absolute flex flex-col items-center text-center">
            <Clock className="w-5 h-5 text-[#6A6E6A] mb-0.5" />
            <span className="text-2xl font-bold font-sans text-[#2D302D] tracking-tight leading-none">{formattedTotalTime}</span>
            <span className="text-[10px] text-[#6A6E6A] mt-1 uppercase font-bold tracking-wider">Used Time</span>
          </div>
        </div>

        {/* Mini stats dashboard */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-sm mt-6">
          <div className="bg-white border border-[#E1E3D5] p-3 rounded-2xl flex flex-col items-center text-center shadow-sm">
            <span className="text-[10px] uppercase text-[#6A6E6A] font-bold">Total Saved</span>
            <span className="text-sm font-bold text-[#4A6741] mt-0.5">45 mins</span>
          </div>
          <div className="bg-white border border-[#E1E3D5] p-3 rounded-2xl flex flex-col items-center text-center shadow-sm">
            <span className="text-[10px] uppercase text-[#6A6E6A] font-bold">Block Rate</span>
            <span className="text-sm font-bold text-[#D98364] mt-0.5">82%</span>
          </div>
          <div className="bg-white border border-[#E1E3D5] p-3 rounded-2xl flex flex-col items-center text-center shadow-sm">
            <span className="text-[10px] uppercase text-[#6A6E6A] font-bold">Deflected</span>
            <span className="text-sm font-bold text-[#8E9B7E] mt-0.5">{blockCounter} hits</span>
          </div>
        </div>
      </div>

      {/* Quick Tips or Streak Warning */}
      {totalScreenTimeMins > totalLimitsMins && (
        <div className="mx-4 mt-4 bg-[#D98364]/10 border border-[#D98364]/20 p-3 rounded-xl flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 text-[#D98364] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-[#D98364]">Daily Screen Limit Exceeded</h4>
            <p className="text-[11px] text-[#6A6E6A] mt-0.5">You are {totalScreenTimeMins - totalLimitsMins} mins over your target limit. Distracting apps are locked to protect your focus.</p>
          </div>
        </div>
      )}

      {/* Apps Section Header */}
      <div className="px-4 mt-6 flex justify-between items-center">
        <h3 className="text-sm font-bold font-serif text-[#2D302D]">My Tracked Apps</h3>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1 text-xs text-[#4A6741] hover:text-[#3D5535] font-semibold bg-[#4A6741]/10 px-2.5 py-1 rounded-full border border-[#4A6741]/15"
        >
          <Plus className="w-3.5 h-3.5" /> Track App
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex gap-1.5 px-4 mt-3 overflow-x-auto pb-1 scrollbar-none">
        {['All', 'Social', 'Entertainment', 'Games', 'Productivity'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filterCategory === cat
                ? 'bg-[#4A6741] text-white font-bold shadow-sm shadow-[#4A6741]/20'
                : 'bg-white border border-[#E1E3D5] hover:bg-white/80 text-[#6A6E6A]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* App Cards List */}
      <div className="px-4 mt-4 space-y-2.5">
        <AnimatePresence>
          {filteredApps.map((app) => {
            const isOverLimit = app.limitMinutes !== null && app.usageMinutes >= app.limitMinutes;
            const limitPercentage = app.limitMinutes ? Math.min((app.usageMinutes / app.limitMinutes) * 100, 100) : 0;

            return (
              <motion.div
                key={app.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`bg-white border rounded-2xl p-3.5 relative overflow-hidden transition-all shadow-sm ${
                  app.isBlocked 
                    ? 'border-[#D98364]/40 bg-[#D98364]/5' 
                    : isOverLimit
                    ? 'border-[#D98364]/20 bg-[#D98364]/2'
                    : 'border-[#E1E3D5] hover:border-[#8E9B7E]'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  {/* App info */}
                  <div className="flex items-center gap-3">
                    {/* Visual Rounded App Icon Container */}
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${app.color} flex items-center justify-center shadow-sm`}>
                      {getAppIcon(app.name)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#2D302D] flex items-center gap-1.5">
                        {app.name}
                        {app.isBlocked && (
                          <span className="text-[10px] px-1.5 py-0.2 bg-[#D98364]/10 text-[#D98364] font-sans font-bold rounded uppercase">
                            Blocked
                          </span>
                        )}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-[#6A6E6A] mt-0.5">
                        <span>{app.category}</span>
                        <span>•</span>
                        <span>{app.usageMinutes}m used</span>
                      </div>
                    </div>
                  </div>

                  {/* Right side controls */}
                  <div className="flex items-center gap-2">
                    {/* Limit config trigger */}
                    <button 
                      onClick={() => openLimitModal(app)}
                      className="p-1.5 rounded-lg text-[#6A6E6A] hover:bg-[#F2F2EB] hover:text-[#2D302D] transition-colors"
                      title="Set limits"
                    >
                      <Settings className="w-4 h-4" />
                    </button>

                    {/* Quick Shield Toggle */}
                    <button
                      onClick={() => handleToggleBlock(app)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 ${
                        app.isBlocked
                          ? 'bg-[#D98364] border-[#D98364] text-white shadow-md shadow-[#D98364]/10'
                          : 'bg-[#F2F2EB] border-[#E1E3D5] text-[#6A6E6A] hover:bg-[#E1E3D5] hover:text-[#2D302D]'
                      }`}
                    >
                      {app.isBlocked ? (
                        <>
                          <Lock className="w-3.5 h-3.5" /> Blocked
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3.5 h-3.5" /> Shield
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Progress bar (only if limit is set) */}
                {app.limitMinutes !== null && (
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-[#6A6E6A] mb-1">
                      <span>Daily Limit: {app.limitMinutes} mins</span>
                      <span className={isOverLimit ? 'text-[#D98364] font-bold' : 'text-[#2D302D]'}>
                        {Math.round(limitPercentage)}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#E1E3D5] rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          app.isBlocked 
                            ? 'bg-[#D98364]' 
                            : isOverLimit
                            ? 'bg-[#D98364]'
                            : 'bg-[#4A6741]'
                        }`}
                        style={{ width: `${limitPercentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* EDIT LIMIT MODAL */}
      <AnimatePresence>
        {isLimitModalOpen && selectedApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D302D]/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border border-[#E1E3D5] p-5 rounded-2xl w-full max-w-sm text-[#2D302D] shadow-2xl"
            >
              <h3 className="text-base font-serif font-bold text-[#2D302D] mb-1">Configure Limits</h3>
              <p className="text-xs text-[#6A6E6A] mb-4">Adjust daily screen time limits for <span className="font-bold text-[#4A6741]">{selectedApp.name}</span>.</p>
              
              {/* Has Limit toggle */}
              <div className="flex items-center justify-between py-2 border-b border-[#E1E3D5] mb-4">
                <span className="text-xs font-semibold text-[#2D302D]">Enable Daily Limit</span>
                <button
                  type="button"
                  onClick={() => setHasLimit(!hasLimit)}
                  className={`w-10 h-6 rounded-full p-1 transition-all ${hasLimit ? 'bg-[#4A6741]' : 'bg-[#E1E3D5]'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-all ${hasLimit ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Slider for minutes */}
              {hasLimit && (
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#6A6E6A]">Limit Duration</span>
                    <span className="text-[#4A6741] font-bold">{limitMinutes} mins</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="180"
                    step="5"
                    value={limitMinutes}
                    onChange={(e) => setLimitMinutes(Number(e.target.value))}
                    className="w-full accent-[#4A6741] h-1.5 bg-[#E1E3D5] rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-[#6A6E6A]">
                    <span>5m</span>
                    <span>1h</span>
                    <span>2h</span>
                    <span>3h</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2.5">
                <button
                  onClick={() => setIsLimitModalOpen(false)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-[#F2F2EB] hover:bg-[#E1E3D5] text-[#6A6E6A] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveAppLimit}
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-[#4A6741] hover:bg-[#3D5535] text-white transition-colors"
                >
                  Apply Limits
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TRACK NEW APP MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D302D]/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border border-[#E1E3D5] p-5 rounded-2xl w-full max-w-sm text-[#2D302D] shadow-2xl"
            >
              <h3 className="text-base font-serif font-bold text-[#2D302D] mb-2">Track New App</h3>
              
              <form onSubmit={handleCreateApp} className="space-y-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#6A6E6A] font-bold mb-1">App Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Candy Crush, Twitter"
                    value={newAppName}
                    onChange={(e) => setNewAppName(e.target.value)}
                    className="w-full bg-[#F2F2EB] border border-[#E1E3D5] rounded-xl px-3.5 py-2 text-xs text-[#2D302D] focus:outline-none focus:border-[#4A6741]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#6A6E6A] font-bold mb-1">Category</label>
                  <select
                    value={newAppCategory}
                    onChange={(e) => setNewAppCategory(e.target.value as any)}
                    className="w-full bg-[#F2F2EB] border border-[#E1E3D5] rounded-xl px-3 py-2 text-xs text-[#2D302D] focus:outline-none focus:border-[#4A6741]"
                  >
                    <option value="Social">Social</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Games">Games</option>
                    <option value="Productivity">Productivity</option>
                  </select>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-[#E1E3D5]">
                  <span className="text-xs font-semibold text-[#2D302D]">Enable Daily Shield Limit</span>
                  <button
                    type="button"
                    onClick={() => setHasNewLimit(!hasNewLimit)}
                    className={`w-10 h-6 rounded-full p-1 transition-all ${hasNewLimit ? 'bg-[#4A6741]' : 'bg-[#E1E3D5]'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-all ${hasNewLimit ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </div>

                {hasNewLimit && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#6A6E6A]">Limit Duration</span>
                      <span className="text-[#4A6741] font-bold">{newAppLimit} mins</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="120"
                      step="5"
                      value={newAppLimit}
                      onChange={(e) => setNewAppLimit(Number(e.target.value))}
                      className="w-full accent-[#4A6741] h-1.5 bg-[#E1E3D5] rounded-lg cursor-pointer"
                    />
                  </div>
                )}

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-2 rounded-xl text-xs font-bold bg-[#F2F2EB] hover:bg-[#E1E3D5] text-[#6A6E6A] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl text-xs font-bold bg-[#4A6741] hover:bg-[#3D5535] text-white transition-colors"
                  >
                    Add Tracked App
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
