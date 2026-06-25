import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface FocusPetProps {
  status: 'idle' | 'focusing' | 'sad' | 'happy' | 'sleeping';
  skin: string; // 'panda_classic' | 'panda_zen' | 'panda_gold'
  isBreathingGuideActive?: boolean;
}

export default function FocusPet({ status, skin, isBreathingGuideActive = false }: FocusPetProps) {
  const [blink, setBlink] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');

  // Periodic blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 200);
    }, 4000);
    return () => clearInterval(blinkInterval);
  }, []);

  // Breathing guide phase tracker (4s inhale, 2s hold, 4s exhale)
  useEffect(() => {
    if (!isBreathingGuideActive) return;

    let timer: NodeJS.Timeout;
    const runBreathingCycle = () => {
      setBreathPhase('Inhale');
      timer = setTimeout(() => {
        setBreathPhase('Hold');
        timer = setTimeout(() => {
          setBreathPhase('Exhale');
          timer = setTimeout(runBreathingCycle, 4000); // Exhale for 4s
        }, 2000); // Hold for 2s
      }, 4000); // Inhale for 4s
    };

    runBreathingCycle();
    return () => clearTimeout(timer);
  }, [isBreathingGuideActive]);

  // Skin color overrides
  const earColor = skin === 'panda_gold' ? '#D97706' : '#1E293B';
  const bodyColor = skin === 'panda_gold' ? '#FBBF24' : '#FFFFFF';
  const patchColor = skin === 'panda_gold' ? '#B45309' : '#1E293B';
  const cheekColor = skin === 'panda_gold' ? '#F59E0B' : '#FDA4AF';
  const robeColor = skin === 'panda_zen' ? '#4A6741' : skin === 'panda_gold' ? '#F59E0B' : '#8E9B7E';

  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      {/* Breathing Guide Glow Ring */}
      {isBreathingGuideActive && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            animate={{
              scale: breathPhase === 'Inhale' ? [1, 1.45] : breathPhase === 'Hold' ? 1.45 : [1.45, 1],
              opacity: breathPhase === 'Hold' ? 0.4 : 0.25,
            }}
            transition={{
              duration: breathPhase === 'Hold' ? 2 : 4,
              ease: 'easeInOut',
            }}
            className="w-36 h-36 rounded-full bg-[#4A6741]/20 blur-md"
          />
          <motion.div
            animate={{
              scale: breathPhase === 'Inhale' ? [1, 1.3] : breathPhase === 'Hold' ? 1.3 : [1.3, 1],
              opacity: breathPhase === 'Hold' ? 0.6 : 0.4,
            }}
            transition={{
              duration: breathPhase === 'Hold' ? 2 : 4,
              ease: 'easeInOut',
            }}
            className="w-28 h-28 rounded-full border border-[#4A6741]/30"
          />
          
          {/* Real-time Breathing Subtitle */}
          <div className="absolute top-[-2rem] text-center">
            <span className="text-xs uppercase tracking-widest text-[#4A6741] font-sans font-bold animate-pulse">
              {breathPhase}
            </span>
          </div>
        </div>
      )}

      {/* Zenji SVG Character */}
      <div className="w-36 h-36 relative select-none">
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-lg">
          {/* Gradients */}
          <defs>
            <radialGradient id="goldGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="60%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </radialGradient>
            <radialGradient id="silverGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F1F5F9" />
              <stop offset="80%" stopColor="#CBD5E1" />
              <stop offset="100%" stopColor="#94A3B8" />
            </radialGradient>
          </defs>

          {/* Golden Halo for Gold Skin */}
          {skin === 'panda_gold' && (
            <motion.circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="1.5"
              strokeDasharray="4,4"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 15, ease: 'linear' }}
            />
          )}

          {/* Ears */}
          <motion.ellipse
            cx="25"
            cy="24"
            rx="9"
            ry="9"
            fill={earColor}
            animate={status === 'focusing' ? { rotate: [-2, 2, -2] } : {}}
            transition={{ repeat: Infinity, duration: 3 }}
          />
          <motion.ellipse
            cx="75"
            cy="24"
            rx="9"
            ry="9"
            fill={earColor}
            animate={status === 'focusing' ? { rotate: [2, -2, 2] } : {}}
            transition={{ repeat: Infinity, duration: 3 }}
          />

          {/* Panda Head Base */}
          <motion.circle
            cx="50"
            cy="45"
            r="26"
            fill={skin === 'panda_gold' ? 'url(#goldGrad)' : bodyColor}
            stroke={skin === 'panda_gold' ? '#92400E' : '#E2E8F0'}
            strokeWidth="1"
            animate={
              isBreathingGuideActive
                ? { scale: breathPhase === 'Inhale' ? 1.05 : breathPhase === 'Hold' ? 1.05 : 0.98 }
                : status === 'sleeping'
                ? { y: [0, 1, 0] }
                : {}
            }
            transition={{ duration: isBreathingGuideActive ? (breathPhase === 'Hold' ? 2 : 4) : 3, ease: 'easeInOut' }}
          />

          {/* Face Patches (Eye circles) */}
          <ellipse cx="38" cy="45" rx="7" ry="9" fill={patchColor} transform="rotate(-15 38 45)" />
          <ellipse cx="62" cy="45" rx="7" ry="9" fill={patchColor} transform="rotate(15 62 45)" />

          {/* Cheeks */}
          <circle cx="30" cy="50" r="3.5" fill={cheekColor} opacity="0.8" />
          <circle cx="70" cy="50" r="3.5" fill={cheekColor} opacity="0.8" />

          {/* Eyes */}
          {blink || status === 'sleeping' || status === 'focusing' ? (
            // Closed/Meditating Eyes
            <>
              <path d="M 34 44 Q 38 47 42 44" fill="none" stroke={skin === 'panda_gold' ? '#78350F' : '#FFFFFF'} strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 58 44 Q 62 47 66 44" fill="none" stroke={skin === 'panda_gold' ? '#78350F' : '#FFFFFF'} strokeWidth="2.5" strokeLinecap="round" />
            </>
          ) : status === 'sad' ? (
            // Sad Eyes
            <>
              <path d="M 34 46 Q 38 41 42 45" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
              <path d="M 58 45 Q 62 41 66 46" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
              <circle cx="38" cy="45" r="1.5" fill="#E2E8F0" />
              <circle cx="62" cy="45" r="1.5" fill="#E2E8F0" />
            </>
          ) : status === 'happy' ? (
            // Happy Curved Up Eyes
            <>
              <path d="M 34 45 Q 38 40 42 45" fill="none" stroke={skin === 'panda_gold' ? '#78350F' : '#FFFFFF'} strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 58 45 Q 62 40 66 45" fill="none" stroke={skin === 'panda_gold' ? '#78350F' : '#FFFFFF'} strokeWidth="2.5" strokeLinecap="round" />
            </>
          ) : (
            // Regular Eyes
            <>
              <circle cx="38" cy="44" r="3.5" fill="#000000" />
              <circle cx="62" cy="44" r="3.5" fill="#000000" />
              <circle cx="39.5" cy="42.5" r="1.2" fill="#FFFFFF" />
              <circle cx="63.5" cy="42.5" r="1.2" fill="#FFFFFF" />
            </>
          )}

          {/* Nose */}
          <path d="M 48 49 L 52 49 L 50 51.5 Z" fill="#1E293B" />

          {/* Mouth */}
          {status === 'happy' ? (
            // Wide happy smile
            <path d="M 46 53 Q 50 57 54 53" fill="none" stroke="#1E293B" strokeWidth="1.8" strokeLinecap="round" />
          ) : status === 'sad' ? (
            // Sad mouth down curve
            <path d="M 47 55 Q 50 52 53 55" fill="none" stroke="#1E293B" strokeWidth="1.8" strokeLinecap="round" />
          ) : (
            // Tiny kitten smile
            <path d="M 46 53 Q 48 54 50 53 Q 52 54 54 53" fill="none" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />
          )}

          {/* Robe / Body (Clothes skin customization) */}
          {skin === 'panda_classic' ? (
            // Classic panda arms / tummy
            <>
              {/* Tummy */}
              <ellipse cx="50" cy="74" rx="20" ry="14" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
              {/* Arms folded in meditation */}
              <path d="M 28 68 Q 50 82 72 68" fill="none" stroke="#1E293B" strokeWidth="8" strokeLinecap="round" />
            </>
          ) : (
            // Kimono Robe (Green Zen or Golden)
            <>
              <path d="M 30 63 L 70 63 L 75 84 L 25 84 Z" fill={robeColor} rx="4" />
              {/* V neck collar detail */}
              <path d="M 44 63 L 50 72 L 56 63" fill="none" stroke="#F1F5F9" strokeWidth="2.5" />
              {/* Belt / Sash */}
              <rect x="33" y="74" width="34" height="4" fill="#1E293B" rx="1" />
              {/* Sleeves folded */}
              <path d="M 26 65 Q 50 78 74 65" fill="none" stroke={robeColor} strokeWidth="7.5" strokeLinecap="round" />
            </>
          )}

          {/* Tiny Zen Accessories (Like gold crown or forehead diamond depending on skin) */}
          {skin === 'panda_gold' && (
            <polygon points="46,12 50,4 54,12 49,10" fill="#FBBF24" stroke="#D97706" strokeWidth="1" />
          )}
        </svg>

        {/* Sleeping Bubbles Animation */}
        {status === 'sleeping' && (
          <>
            <motion.div
              initial={{ x: 30, y: -10, opacity: 0, scale: 0.5 }}
              animate={{ x: 45, y: -35, opacity: [0, 1, 0], scale: 1.2 }}
              transition={{ repeat: Infinity, duration: 4, delay: 0 }}
              className="absolute text-[#4A6741] font-sans font-bold text-sm"
            >
              Z
            </motion.div>
            <motion.div
              initial={{ x: 32, y: -12, opacity: 0, scale: 0.5 }}
              animate={{ x: 52, y: -45, opacity: [0, 1, 0], scale: 1.4 }}
              transition={{ repeat: Infinity, duration: 4, delay: 1.5 }}
              className="absolute text-[#4A6741] font-sans font-bold text-lg"
            >
              Z
            </motion.div>
          </>
        )}

        {/* Happy Confetti Sparkles */}
        {status === 'happy' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {[...Array(6)].map((_, i) => {
              const angle = (i * 360) / 6;
              const xDir = Math.cos((angle * Math.PI) / 180) * 45;
              const yDir = Math.sin((angle * Math.PI) / 180) * 45;
              return (
                <motion.div
                  key={i}
                  initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                  animate={{ x: xDir, y: yDir, scale: [0, 1.2, 0], opacity: [1, 1, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.1 }}
                  className={`absolute w-3 h-3 rounded-full ${
                    i % 2 === 0 ? 'bg-[#D98364]' : 'bg-[#4A6741]'
                  }`}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Zenji Mood Subtitle */}
      <div className="mt-2 text-center">
        <span className="text-xs tracking-wider text-[#6A6E6A] font-bold font-sans">
          {status === 'focusing'
            ? 'Zenji is meditating with you...'
            : status === 'sleeping'
            ? 'Zenji is resting. Start a session!'
            : status === 'sad'
            ? 'Zenji misses your focus.'
            : status === 'happy'
            ? 'Zenji is incredibly proud!'
            : 'Zenji the Focus Panda'}
        </span>
      </div>
    </div>
  );
}
