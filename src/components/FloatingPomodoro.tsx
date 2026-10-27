import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, ArrowsCounterClockwise, ArrowsOutSimple, X } from '@phosphor-icons/react';
import { usePomodoro } from '../contexts/PomodoroContext';
import { useLanguage } from '../contexts/LanguageContext';

interface FloatingPomodoroProps {
  activeView: string;
  setActiveView: (view: any) => void;
}

export const FloatingPomodoro: React.FC<FloatingPomodoroProps> = ({ activeView, setActiveView }) => {
  const { language } = useLanguage();
  const isId = language === 'id';

  const {
    pomoMinutes,
    pomoSeconds,
    pomoActive,
    pomoMode,
    breathingText,
    resetTimer,
    setPomoActive,
    isFloating,
    setIsFloating
  } = usePomodoro();

  // Show hover controls state
  const [isHovered, setIsHovered] = useState(false);

  // We should render the floating timer if:
  // 1. We are explicitly in "isFloating" mode, OR
  // 2. The timer is currently active (ticking) and the user has navigated away from the "smart_space" tab.
  const shouldRender = isFloating || (pomoActive && activeView !== 'smart_space');

  if (!shouldRender) return null;

  // Calculate percentage of elapsed time
  const totalSeconds = pomoMode === 'focus' ? 25 * 60 : pomoMode === 'short_break' ? 5 * 60 : 15 * 60;
  const remainingSeconds = pomoMinutes * 60 + pomoSeconds;
  const elapsedSeconds = totalSeconds - remainingSeconds;
  const progressPercent = (elapsedSeconds / totalSeconds) * 100;

  // SVG Circle calculations
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <AnimatePresence>
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0.05}
        initial={{ opacity: 0, scale: 0.8, x: '80vw', y: '75vh' }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        whileHover={{ scale: 1.02 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="fixed z-50 cursor-grab active:cursor-grabbing bg-[#0f1115]/95 border border-white/10 rounded-2xl p-3 shadow-2xl shadow-black/80 backdrop-blur-md flex items-center gap-3"
        style={{
          width: isHovered ? '240px' : '90px',
          transition: 'width 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Progress Ring & Timer */}
        <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
          <svg className="absolute -rotate-90 w-14 h-14">
            {/* Background ring */}
            <circle
              cx="28"
              cy="28"
              r={radius}
              className="stroke-stone-800"
              strokeWidth="3.5"
              fill="transparent"
              style={{ r: 24 }}
            />
            {/* Animated progress ring */}
            <motion.circle
              cx="28"
              cy="28"
              r={radius}
              className="stroke-[#C8A27C]"
              strokeWidth="3.5"
              fill="transparent"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{ r: 24 }}
            />
          </svg>

          {/* Time digits inside circle */}
          <div className="flex flex-col items-center justify-center z-10 pointer-events-none">
            <span className="text-[11px] font-bold font-mono text-slate-100 tabular-nums">
              {String(pomoMinutes).padStart(2, '0')}
            </span>
            <span className="text-[9px] font-bold font-mono text-slate-400 -mt-1 tabular-nums">
              {String(pomoSeconds).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Expanded micro-panel */}
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col justify-between h-14 flex-1 overflow-hidden"
          >
            {/* Mode & Breathing Indicator */}
            <div className="flex flex-col">
              <span className="text-[9px] font-bold tracking-widest text-[#C8A27C] uppercase leading-none font-mono">
                {pomoMode.replace('_', ' ')}
              </span>
              {pomoActive ? (
                <span className="text-[10px] text-slate-300 font-medium truncate mt-1 flex items-center gap-1">
                  {breathingText}
                </span>
              ) : (
                <span className="text-[10px] text-slate-500 font-medium truncate mt-1">
                  {isId ? 'Sesi Jeda' : 'Paused'}
                </span>
              )}
            </div>

            {/* Micro Controls */}
            <div className="flex items-center gap-1.5 mt-auto">
              <button
                onClick={() => setPomoActive(!pomoActive)}
                className="p-1 rounded bg-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer"
                title={pomoActive ? (isId ? "Jeda" : "Pause") : (isId ? "Mulai" : "Start")}
              >
                {pomoActive ? <Pause size={12} weight="regular" /> : <Play size={12} weight="regular" />}
              </button>
              <button
                onClick={resetTimer}
                className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                title="Reset"
              >
                <ArrowsCounterClockwise size={12} weight="regular" />
              </button>
              <button
                onClick={() => {
                  setActiveView('smart_space');
                  setIsFloating(false);
                }}
                className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                title={isId ? "Buka Ruang Fokus" : "Maximize view"}
              >
                <ArrowsOutSimple size={12} weight="regular" />
              </button>
              <button
                onClick={() => setIsFloating(false)}
                className="p-1 rounded bg-white/5 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer ml-auto"
                title={isId ? "Tutup Melayang" : "Hide floating widget"}
              >
                <X size={12} weight="regular" />
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
