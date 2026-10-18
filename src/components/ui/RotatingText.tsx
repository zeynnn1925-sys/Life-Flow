import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

interface RotatingTextProps {
  texts: string[];
  interval?: number; // ms
  className?: string;
  textClassName?: string;
  direction?: 'up' | 'down';
}

export const RotatingText: React.FC<RotatingTextProps> = ({
  texts,
  interval = 2500,
  className = '',
  textClassName = '',
  direction = 'up',
}) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!texts.length) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % texts.length);
    }, interval);

    return () => clearInterval(timer);
  }, [texts.length, interval]);

  const variants = {
    initial: {
      y: direction === 'up' ? 20 : -20,
      opacity: 0,
      filter: 'blur(4px)',
    },
    animate: {
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 24,
      },
    },
    exit: {
      y: direction === 'up' ? -20 : 20,
      opacity: 0,
      filter: 'blur(4px)',
      transition: {
        duration: 0.25,
        ease: 'easeInOut' as const,
      },
    },
  };

  return (
    <span className={cn('inline-flex relative overflow-hidden align-baseline min-h-[1.25em]', className)}>
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          className={cn('inline-block whitespace-nowrap font-semibold', textClassName)}
        >
          {texts[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

export default RotatingText;
