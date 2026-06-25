import React, { useState, useEffect, useRef } from 'react';
import { TrackedApp } from '../types';
import FocusPet from './FocusPet';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ShieldAlert, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Compass, 
  BookOpen, 
  Briefcase, 
  Activity, 
  Lock,
  Hourglass,
  Bell,
  Trash2,
  AlertOctagon,
  Flame,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { synth } from '../utils/audio';

interface FocusTimerViewProps {
  trackedApps: TrackedApp[];
  skin: string;
  isHardcore: boolean;
  onAddXp: (amount: number) => void;
  onIncrementBlocks: () => void;
  onCompleteSession: (mins: number) => void;
}

const DISTRACTION_NOTIFICATIONS = [
  { id: 1, app: 'TikTok', message: 'Chloe shared: "Try this viral dance!" 💃', delay: 8000 },
  { id: 2, app: 'Instagram', message: 'lucas_graham liked your photo 📸', delay: 18000 },
  { id: 3, app: 'Snapchat', message: 'Emma is typing... 💬', delay: 28000 },
  { id: 4, app: 'YouTube', message: 'Trending: "10 Hours of satisfying ASMR" 📺', delay: 38000 },
  { id: 5, app: 'Clash Royale', message: 'Chest unlocked! Open now for Golden Giant! ⚔️', delay: 48000 },
  { id: 6, app: 'Reddit', message: 'r/AskReddit: "What is your biggest regret?" 🤔', delay: 58000 }
];

export default function FocusTimerView({
  trackedApps,
  skin,
  isHardcore,
  onAddXp,
  onIncrementBlocks,
  onCompleteSession
}: FocusTimerViewProps) {
  // Configuration State
  const [duration, setDuration] = useState(25); // Minutes
  const [category, setCategory] = useState<'Work' | 'Study' | 'Mindfulness' | 'Reading'>('Study');
  const [blockedAppIds, setBlockedAppIds] = useState<string[]>(
    trackedApps.filter(app => app.category !== 'Productivity').map(app => app.id)
  );

  // Active Timer State
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // Seconds
  const [initialTime, setInitialTime] = useState(25 * 60);
  const [ambientSound, setAmbientSound] = useState<'off' | 'rain' | 'waves' | 'forest'>('off');

  // Interactive Pet visual mood state
  const [petMood, setPetMood] = useState<'idle' | 'focusing' | 'sad' | 'happy' | 'sleeping'>('sleeping');

  // Confirmation state
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);

  // Success summary state
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);

  // Intercepted notifications system state
  const [activeNotification, setActiveNotification] = useState<typeof DISTRACTION_NOTIFICATIONS[0] | null>(null);
  const [shieldZapped, setShieldZapped] = useState(false);
  const notificationIndexRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Confetti particles for completion
  const [confetti, setConfetti] = useState<{ x: number; y: number; color: string; size: number; id: number }[]>([]);

  // Sync initial configuration duration to timeLeft
  useEffect(() => {
    if (!isActive) {
      setTimeLeft(duration * 60);
      setInitialTime(duration * 60);
    }
  }, [duration, isActive]);

  // Main Timer Tick
  useEffect(() => {
    if (isActive && !isPaused && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          // Subtle audio ticks in standard focus mode
          if (prev % 5 === 0) {
            synth.playTick();
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, isPaused, timeLeft]);

  // Simulate incoming distraction notifications while focus timer is running
  useEffect(() => {
    if (!isActive || isPaused) {
      setActiveNotification(null);
      return;
    }

    const triggerNotification = () => {
      const idx = notificationIndexRef.current % DISTRACTION_NOTIFICATIONS.length;
      const notif = DISTRACTION_NOTIFICATIONS[idx];
      
      // Only trigger if this app category is currently "blocked" in the session config
      const appRef = trackedApps.find(a => a.id.includes(notif.app.toLowerCase()));
      const isAppBlocked = appRef ? blockedAppIds.includes(appRef.id) : true;

      if (isAppBlocked) {
        setActiveNotification(notif);
        setShieldZapped(false);

        // Zap sound and animation after 2.5 seconds
        setTimeout(() => {
          setShieldZapped(true);
          synth.playBlockZap();
          onIncrementBlocks();
          onAddXp(5); // +5 XP for each real-time distraction deflection

          // Clean up notification after showing shielded status
          setTimeout(() => {
            setActiveNotification(null);
          }, 3500);
        }, 2200);
      }

      notificationIndexRef.current += 1;
    };

    // Schedule notifications periodically every 15-20 seconds
    const interval = setInterval(triggerNotification, 16000);

    // Initial delayed start trigger
    const initialDelay = setTimeout(triggerNotification, 8000);

    return () => {
      clearInterval(interval);
      clearTimeout(initialDelay);
    };
  }, [isActive, isPaused, blockedAppIds, trackedApps]);

  const handleStartSession = () => {
    synth.playChime(true);
    setIsActive(true);
    setIsPaused(false);
    setPetMood('focusing');
    
    // Play ambient noise if configured
    if (ambientSound !== 'off') {
      synth.startAmbientWaves(ambientSound);
    }
  };

  const handleTogglePause = () => {
    synth.playTick();
    if (isPaused) {
      // Resuming
      setIsPaused(false);
      setPetMood('focusing');
      if (ambientSound !== 'off') {
        synth.startAmbientWaves(ambientSound);
      }
    } else {
      // Pausing
      setIsPaused(true);
      setPetMood('idle');
      synth.stopAmbient();
    }
  };

  const handleToggleAmbient = (type: 'off' | 'rain' | 'waves' | 'forest') => {
    synth.playTick();
    setAmbientSound(type);
    if (isActive && !isPaused) {
      if (type === 'off') {
        synth.stopAmbient();
      } else {
        synth.startAmbientWaves(type);
      }
    }
  };

  const handleTimerComplete = () => {
    synth.stopAmbient();
    synth.playChime(true);
    
    // XP rewards: 4 points per focused minute + 25 hardcore mode bonus
    const points = (duration * 4) + (isHardcore ? 25 : 0);
    setXpEarned(points);
    onAddXp(points);
    onCompleteSession(duration);

    setIsActive(false);
    setPetMood('happy');
    setShowSuccessScreen(true);
    triggerConfettiExplosion();
  };

  const handleQuitRequest = () => {
    synth.playGiveUp();
    if (isHardcore) {
      // In hardcore mode, can't pause, and quitting has deep penalty
      setPetMood('sad');
      setShowQuitConfirm(true);
    } else {
      setShowQuitConfirm(true);
    }
  };

  const confirmQuit = (punish: boolean) => {
    synth.stopAmbient();
    synth.playGiveUp();
    setIsActive(false);
    setShowQuitConfirm(false);
    setPetMood('sad');

    if (punish) {
      // Deduct 30 XP penalty
      onAddXp(-30);
    }
    
    // Reset timer
    setTimeLeft(duration * 60);
  };

  // Trigger colorful custom canvas confetti
  const triggerConfettiExplosion = () => {
    const colors = ['#4A6741', '#D98364', '#8E9B7E', '#2D302D', '#C8E6C9'];
    const particles = [...Array(100)].map((_, i) => ({
      id: i,
      x: Math.random() * 320,
      y: -10 - Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 4 + Math.random() * 6
    }));
    setConfetti(particles);

    // Fade out confetti after 5 seconds
    setTimeout(() => {
      setConfetti([]);
    }, 5500);
  };

  const toggleAppSelection = (id: string) => {
    synth.playTick();
    setBlockedAppIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Convert seconds to MM:SS format
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const ratio = timeLeft / initialTime;
  const strokeDashoffset = 314 - (314 * ratio);

  // Category visual setup with Natural Tones colors
  const categoryConfig = {
    Study: { icon: <BookOpen className="w-4 h-4" />, bg: 'bg-[#8E9B7E]/15', border: 'border-[#8E9B7E]/30', text: 'text-[#4A6741]' },
    Work: { icon: <Briefcase className="w-4 h-4" />, bg: 'bg-[#4A6741]/15', border: 'border-[#4A6741]/30', text: 'text-[#4A6741]' },
    Mindfulness: { icon: <Compass className="w-4 h-4" />, bg: 'bg-[#D98364]/15', border: 'border-[#D98364]/30', text: 'text-[#D98364]' },
    Reading: { icon: <Activity className="w-4 h-4" />, bg: 'bg-[#8E9B7E]/10', border: 'border-[#8E9B7E]/25', text: 'text-[#6A6E6A]' }
  };

  return (
    <div className="flex flex-col h-full bg-[#F2F2EB] text-[#2D302D] overflow-y-auto pb-24 relative scrollbar-none">
      
      {/* Absolute Confetti Overlay */}
      {confetti.length > 0 && (
        <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden">
          {confetti.map(p => (
            <motion.div
              key={p.id}
              initial={{ y: p.y, x: p.x, opacity: 1, rotate: 0 }}
              animate={{ 
                y: 600, 
                x: p.x + (Math.random() * 80 - 40), 
                opacity: [1, 1, 0],
                rotate: 360
              }}
              transition={{ duration: 3 + Math.random() * 2.5, ease: 'linear' }}
              className="absolute rounded-sm"
              style={{
                backgroundColor: p.color,
                width: p.size,
                height: p.size,
              }}
            />
          ))}
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="p-4 flex justify-between items-center bg-white border-b border-[#E1E3D5] shrink-0">
        <div>
          <h1 className="text-xl font-serif font-bold tracking-tight text-[#2D302D] flex items-center gap-1.5">
            <Hourglass className="w-5 h-5 text-[#4A6741] animate-spin-slow" />
            Shield Focus Timer
          </h1>
          <p className="text-xs text-[#6A6E6A]">Lock distractions & grow mindfulness</p>
        </div>
        
        {isHardcore && (
          <div className="flex items-center gap-1 bg-[#D98364]/10 border border-[#D98364]/20 px-2.5 py-1 rounded-full text-[10px] font-bold text-[#D98364] uppercase tracking-wider animate-pulse">
            <ShieldAlert className="w-3 h-3" /> Hardcore Mode
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        
        {/* VIEW 1: DURATION CONFIGURATION SCREEN */}
        {!isActive && !showSuccessScreen && (
          <motion.div 
            key="config"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-5 space-y-6 flex-1"
          >
            {/* Meditating Idle Pet Hero */}
            <div className="bg-white/40 border border-[#E1E3D5] rounded-2xl py-2 relative overflow-hidden flex flex-col items-center justify-center">
              <FocusPet status={petMood} skin={skin} />
            </div>

            {/* Category Selector */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6A6E6A] font-sans">1. Choose Focus Goal</h3>
              <div className="grid grid-cols-4 gap-2">
                {(['Study', 'Work', 'Mindfulness', 'Reading'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => { synth.playTick(); setCategory(cat); }}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all text-center gap-1.5 ${
                      category === cat
                        ? 'bg-[#4A6741]/10 border-[#4A6741]/40 text-[#4A6741] font-bold'
                        : 'bg-white border-[#E1E3D5] hover:bg-white/80 text-[#6A6E6A]'
                    }`}
                  >
                    <span className="p-1 rounded-lg bg-[#F2F2EB]/50">{categoryConfig[cat].icon}</span>
                    <span className="text-[10px] font-bold tracking-tight">{cat}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Timer Presets and Custom Slider */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6A6E6A] font-sans">2. Set Focus Duration</h3>
              <div className="flex justify-between items-center bg-white border border-[#E1E3D5] p-3 rounded-2xl shadow-sm">
                <span className="text-xs font-semibold text-[#6A6E6A]">Selected Interval</span>
                <span className="text-2xl font-bold text-[#4A6741] font-sans tracking-tight">{duration} <span className="text-xs font-semibold">mins</span></span>
              </div>
              
              {/* Preset Quick Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[15, 25, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => { synth.playTick(); setDuration(mins); }}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      duration === mins
                        ? 'bg-[#4A6741] text-white border-[#4A6741] shadow-md shadow-[#4A6741]/10'
                        : 'bg-white border-[#E1E3D5] text-[#6A6E6A] hover:bg-white/80'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>

              {/* Slider for precision custom setting */}
              <div className="space-y-1.5 pt-1.5">
                <input
                  type="range"
                  min="5"
                  max="120"
                  step="5"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full accent-[#4A6741] h-1.5 bg-[#E1E3D5] rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-[#6A6E6A] font-sans">
                  <span>5m</span>
                  <span>45m</span>
                  <span>90m</span>
                  <span>120m</span>
                </div>
              </div>
            </div>

            {/* Blocking App Toggles */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#6A6E6A] font-sans">3. Select Shield Block list</h3>
                <span className="text-[10px] text-[#6A6E6A] font-bold">{blockedAppIds.length} Selected</span>
              </div>
              <div className="bg-white border border-[#E1E3D5] rounded-2xl p-3 max-h-36 overflow-y-auto space-y-1.5 shadow-sm">
                {trackedApps.filter(app => app.limitMinutes !== null).map((app) => {
                  const isChecked = blockedAppIds.includes(app.id);
                  return (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => toggleAppSelection(app.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left border transition-all text-xs ${
                        isChecked
                          ? 'bg-[#D98364]/10 border-[#D98364]/30 text-[#D98364]'
                          : 'bg-[#F2F2EB] border-[#E1E3D5] text-[#6A6E6A]'
                      }`}
                    >
                      <span className="font-bold flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isChecked ? 'bg-[#D98364] animate-ping' : 'bg-[#8E9B7E]'}`} />
                        {app.name}
                      </span>
                      <span className="text-[10px] font-sans font-bold uppercase">{isChecked ? 'Hard Blocked' : 'Bypass'}</span>
                    </button>
                  );
                })}
                {trackedApps.filter(app => app.limitMinutes !== null).length === 0 && (
                  <p className="text-xs text-[#6A6E6A] text-center py-4">No apps currently have daily shield limits. Go to tracking to set a limit!</p>
                )}
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={handleStartSession}
              className="w-full py-3.5 bg-[#4A6741] hover:bg-[#3D5535] text-white font-bold text-sm uppercase tracking-wider rounded-2xl shadow-lg shadow-[#4A6741]/10 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-white text-white" /> Start Shield Session
            </button>
          </motion.div>
        )}

        {/* VIEW 2: ACTIVE FOCUS IMMERSIVE TIMER SCREEN */}
        {isActive && !showSuccessScreen && (
          <motion.div
            key="active"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="p-5 flex flex-col justify-between flex-1 relative overflow-hidden"
          >
            {/* Dynamic Real-time Distraction Alert Toast Simulation */}
            <AnimatePresence>
              {activeNotification && (
                <motion.div
                  initial={{ y: -60, opacity: 0, scale: 0.9 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: -30, opacity: 0, scale: 0.95 }}
                  className={`absolute top-4 left-4 right-4 z-40 p-3.5 rounded-2xl border shadow-2xl flex items-center gap-3 transition-all ${
                    shieldZapped
                      ? 'bg-[#D98364]/15 border-[#D98364]/40 text-[#D98364] shadow-[#D98364]/10'
                      : 'bg-white border-[#E1E3D5] text-[#2D302D]'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center ${
                    shieldZapped ? 'bg-[#D98364] text-white animate-pulse' : 'bg-[#F2F2EB] text-[#2D302D]'
                  }`}>
                    {shieldZapped ? <Lock className="w-4 h-4" /> : <Bell className="w-4 h-4 text-[#D98364]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#6A6E6A] font-sans">{activeNotification.app}</span>
                      <span className="text-[9px] text-[#6A6E6A] font-sans">Just Now</span>
                    </div>
                    <p className="text-xs font-bold truncate leading-tight mt-0.5">{activeNotification.message}</p>
                    
                    {shieldZapped && (
                      <div className="text-[10px] text-[#D98364] font-bold uppercase tracking-wider font-sans flex items-center gap-1 mt-1 animate-pulse">
                        🛡️ Distraction Shield Blocked (+5 XP)
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Timer Circle Hero & Virtual Pet */}
            <div className="flex-1 flex flex-col justify-center items-center py-6 space-y-6">
              
              {/* Radial Timer Wheel */}
              <div className="relative w-52 h-52 flex items-center justify-center">
                
                {/* Pet sitting center-stage inside timer ring */}
                <div className="absolute inset-0 flex items-center justify-center scale-90">
                  <FocusPet status={petMood} skin={skin} isBreathingGuideActive={true} />
                </div>

                <svg className="w-full h-full transform -rotate-90 scale-105 pointer-events-none" viewBox="0 0 108 108">
                  {/* Outer ring */}
                  <circle
                    cx="54"
                    cy="54"
                    r="50"
                    fill="transparent"
                    className="stroke-[#E1E3D5]"
                    strokeWidth="3.5"
                  />
                  {/* Active Ring */}
                  <motion.circle
                    cx="54"
                    cy="54"
                    r="50"
                    fill="transparent"
                    className="stroke-[#4A6741]"
                    strokeWidth="3.5"
                    strokeDasharray="314"
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 0.5, ease: 'linear' }}
                    strokeLinecap="round"
                  />
                </svg>
                
                {/* Floating Timer Countdown Pill */}
                <div className="absolute bottom-1 bg-white border border-[#E1E3D5] px-3.5 py-1 rounded-full text-sm font-bold text-[#4A6741] font-sans tracking-tight shadow-sm">
                  {formatTime(timeLeft)}
                </div>
              </div>

              {/* Focus Category Tag */}
              <div className={`px-4 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1.5 uppercase tracking-widest font-sans ${categoryConfig[category].bg} ${categoryConfig[category].border} ${categoryConfig[category].text}`}>
                {categoryConfig[category].icon}
                <span>Focusing on {category}</span>
              </div>
            </div>

            {/* LOWER CONTROLS & AMBIENT SYNTH */}
            <div className="space-y-5 bg-white border border-[#E1E3D5] p-4 rounded-2xl shadow-sm">
              
              {/* Ambient Track Selection */}
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#6A6E6A] font-sans mb-2 text-center">Ambient Sound Shield</h4>
                <div className="flex justify-center gap-1.5">
                  {[
                    { id: 'off', label: 'Mute', icon: <VolumeX className="w-3.5 h-3.5" /> },
                    { id: 'rain', label: 'Rain', icon: <Volume2 className="w-3.5 h-3.5 text-blue-500" /> },
                    { id: 'waves', label: 'Ocean', icon: <Volume2 className="w-3.5 h-3.5 text-teal-600" /> },
                    { id: 'forest', label: 'Forest', icon: <Volume2 className="w-3.5 h-3.5 text-[#4A6741]" /> }
                  ].map(sound => (
                    <button
                      key={sound.id}
                      onClick={() => handleToggleAmbient(sound.id as any)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                        ambientSound === sound.id
                          ? 'bg-[#4A6741] text-white border-[#4A6741] shadow-inner'
                          : 'bg-[#F2F2EB] border-[#E1E3D5] text-[#6A6E6A] hover:text-[#2D302D]'
                      }`}
                    >
                      {sound.icon}
                      <span>{sound.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Primary Buttons */}
              <div className="flex gap-3">
                {/* Give Up / Exit */}
                <button
                  onClick={handleQuitRequest}
                  className="px-4 py-3 bg-white hover:bg-[#D98364]/10 text-[#D98364] border border-[#E1E3D5] hover:border-[#D98364]/30 rounded-xl text-xs font-bold tracking-wider uppercase transition-all"
                >
                  Give Up
                </button>

                {/* Pause/Resume Toggle */}
                {!isHardcore ? (
                  <button
                    onClick={handleTogglePause}
                    className="flex-1 py-3 bg-[#4A6741] text-white hover:bg-[#3D5535] rounded-xl text-xs font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    {isPaused ? (
                      <>
                        <Play className="w-4 h-4 fill-white text-white" /> Resume Shield
                      </>
                    ) : (
                      <>
                        <Pause className="w-4 h-4 fill-white text-white" /> Pause Timer
                      </>
                    )}
                  </button>
                ) : (
                  <div className="flex-1 py-3 bg-[#D98364]/10 text-[#D98364] border border-[#D98364]/20 rounded-xl text-xs font-bold tracking-widest uppercase text-center flex items-center justify-center gap-1 animate-pulse">
                    <Lock className="w-3.5 h-3.5" /> Pause Blocked (Hardcore)
                  </div>
                )}
              </div>
            </div>

            {/* CONFIRM GIVE UP MODAL */}
            <AnimatePresence>
              {showQuitConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D302D]/40 backdrop-blur-sm">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white border border-[#E1E3D5] p-5 rounded-2xl w-full max-w-sm text-[#2D302D] shadow-2xl"
                  >
                    <div className="w-12 h-12 bg-[#D98364]/10 border border-[#D98364]/20 text-[#D98364] rounded-2xl flex items-center justify-center mb-3">
                      <AlertOctagon className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-serif font-bold text-[#2D302D] mb-1">Give Up on Your Goal?</h3>
                    <p className="text-xs text-[#6A6E6A] mb-4">Quitting now will break your streak, subtract <span className="font-semibold text-[#D98364]">30 XP points</span>, and leave Zenji feeling disappointed.</p>
                    
                    <div className="flex gap-2.5">
                      <button
                        onClick={() => { synth.playTick(); setShowQuitConfirm(false); setPetMood('focusing'); }}
                        className="flex-1 py-2 rounded-xl text-xs font-bold bg-[#4A6741] hover:bg-[#3D5535] text-white transition-colors"
                      >
                        Keep Going
                      </button>
                      <button
                        onClick={() => confirmQuit(true)}
                        className="py-2 px-4 rounded-xl text-xs font-bold bg-[#F2F2EB] hover:bg-[#D98364]/10 hover:text-[#D98364] text-[#6A6E6A] transition-colors"
                      >
                        Yes, Quit
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

          </motion.div>
        )}

        {/* VIEW 3: SUCCESS MILESTONE SCREEN */}
        {showSuccessScreen && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="p-6 flex flex-col justify-between flex-1 text-center"
          >
            <div className="my-auto space-y-6">
              
              {/* Joyous cheering Focus Pet */}
              <div className="relative">
                <FocusPet status="happy" skin={skin} />
                <div className="absolute top-0 inset-0 pointer-events-none flex items-center justify-center animate-pulse">
                  <Sparkles className="w-16 h-16 text-[#D98364]/20 scale-125" />
                </div>
              </div>

              {/* Title Header */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#4A6741] font-sans">Shield Session Complete</span>
                <h2 className="text-2xl font-serif font-bold text-[#2D302D] leading-tight">Amazing Focus!</h2>
                <p className="text-xs text-[#6A6E6A] max-w-xs mx-auto">You successfully blocked all digital triggers. Your digital shield held perfectly!</p>
              </div>

              {/* Rewards Summary list */}
              <div className="bg-white border border-[#E1E3D5] p-4 rounded-2xl max-w-sm mx-auto grid grid-cols-2 gap-3.5 shadow-sm">
                <div className="flex flex-col items-center p-2 rounded-xl bg-[#F2F2EB]">
                  <span className="text-[9px] uppercase tracking-wider text-[#6A6E6A] font-bold">Reward Points</span>
                  <span className="text-lg font-bold text-[#D98364] flex items-center mt-1">
                    <Sparkles className="w-4 h-4 mr-0.5 text-[#D98364] animate-pulse" />
                    +{xpEarned} XP
                  </span>
                </div>
                <div className="flex flex-col items-center p-2 rounded-xl bg-[#F2F2EB]">
                  <span className="text-[9px] uppercase tracking-wider text-[#6A6E6A] font-bold">Time Focused</span>
                  <span className="text-lg font-bold text-[#4A6741] flex items-center mt-1">
                    <Flame className="w-4 h-4 mr-0.5 fill-[#4A6741] text-[#4A6741]" />
                    {duration}m
                  </span>
                </div>
              </div>
            </div>

            {/* Back home trigger button */}
            <button
              onClick={() => { synth.playTick(); setShowSuccessScreen(false); setPetMood('sleeping'); }}
              className="w-full py-3 bg-[#4A6741] hover:bg-[#3D5535] text-white font-bold text-xs uppercase tracking-widest rounded-2xl transition-colors shadow-sm shrink-0"
            >
              Continue Focus Journey
            </button>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
