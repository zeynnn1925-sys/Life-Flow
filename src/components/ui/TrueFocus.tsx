import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface TrueFocusProps {
  sentence?: string;
  words?: string[];
  manualMode?: boolean;
  blurAmount?: number;
  borderColor?: string;
  glowColor?: string;
  animationDuration?: number;
  pauseBetweenAnimations?: number;
  className?: string;
  wordClassName?: string;
}

export const TrueFocus: React.FC<TrueFocusProps> = ({
  sentence = 'True Focus Engineering',
  words: propWords,
  manualMode = false,
  blurAmount = 4,
  borderColor = '#3b82f6',
  glowColor = 'rgba(59, 130, 246, 0.45)',
  animationDuration = 0.4,
  pauseBetweenAnimations = 1.5,
  className = '',
  wordClassName = '',
}) => {
  const words = propWords || sentence.split(' ');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [lastActiveIndex, setLastActiveIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [focusRect, setFocusRect] = useState<{ x: number; y: number; width: number; height: number }>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  // Automatic cycle if not manual mode
  useEffect(() => {
    if (manualMode) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length);
    }, (animationDuration + pauseBetweenAnimations) * 1000);

    return () => clearInterval(interval);
  }, [manualMode, animationDuration, pauseBetweenAnimations, words.length]);

  // Update focus rectangle position
  useEffect(() => {
    if (currentIndex === null || currentIndex === -1) return;
    const activeEl = wordRefs.current[currentIndex];
    const containerEl = containerRef.current;

    if (activeEl && containerEl) {
      const parentRect = containerEl.getBoundingClientRect();
      const elRect = activeEl.getBoundingClientRect();

      setFocusRect({
        x: elRect.left - parentRect.left,
        y: elRect.top - parentRect.top,
        width: elRect.width,
        height: elRect.height,
      });
    }
  }, [currentIndex, words]);

  const handleMouseEnter = (index: number) => {
    if (manualMode) {
      setLastActiveIndex(index);
      setCurrentIndex(index);
    }
  };

  const handleMouseLeave = () => {
    if (manualMode) {
      setCurrentIndex(lastActiveIndex ?? 0);
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative inline-flex flex-wrap items-center gap-x-2 gap-y-1 select-none', className)}
      onMouseLeave={handleMouseLeave}
    >
      {words.map((word, index) => {
        const isActive = index === currentIndex;
        return (
          <span
            key={index}
            ref={(el) => {
              wordRefs.current[index] = el;
            }}
            onMouseEnter={() => handleMouseEnter(index)}
            className={cn(
              'relative z-10 cursor-pointer font-bold transition-all duration-300 px-1 py-0.5',
              isActive ? 'text-white scale-105' : 'text-zinc-400 hover:text-zinc-200',
              wordClassName
            )}
            style={{
              filter: !isActive && !manualMode ? `blur(${blurAmount}px)` : 'none',
              opacity: !isActive && !manualMode ? 0.6 : 1,
            }}
          >
            {word}
          </span>
        );
      })}

      {/* Focus Indicator with 4 glowing corners */}
      <motion.div
        className="pointer-events-none absolute z-20 rounded-md border"
        animate={{
          x: focusRect.x - 4,
          y: focusRect.y - 3,
          width: focusRect.width + 8,
          height: focusRect.height + 6,
          opacity: focusRect.width > 0 ? 1 : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 320,
          damping: 26,
        }}
        style={{
          borderColor: borderColor,
          boxShadow: `0 0 14px ${glowColor}, inset 0 0 8px ${glowColor}`,
        }}
      >
        {/* Corner Accents */}
        <span
          className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2"
          style={{ borderColor: borderColor }}
        />
        <span
          className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2"
          style={{ borderColor: borderColor }}
        />
        <span
          className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2"
          style={{ borderColor: borderColor }}
        />
        <span
          className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2"
          style={{ borderColor: borderColor }}
        />
      </motion.div>
    </div>
  );
};

export default TrueFocus;
