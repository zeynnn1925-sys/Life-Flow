import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  animationFrom?: { opacity: number; transform: string };
  animationTo?: { opacity: number; transform: string };
  easing?: (t: number) => number;
  threshold?: number;
  rootMargin?: string;
  textAlign?: 'left' | 'right' | 'center' | 'justify' | 'initial' | 'inherit';
}

export const SplitText: React.FC<SplitTextProps> = ({
  text,
  className = '',
  delay = 40,
  textAlign = 'left',
}) => {
  const words = text.split(' ');

  return (
    <span
      className={cn('inline-flex flex-wrap gap-x-1.5', className)}
      style={{ textAlign }}
    >
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-flex whitespace-nowrap overflow-hidden">
          {word.split('').map((char, charIndex) => (
            <motion.span
              key={charIndex}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.35,
                delay: ((wordIndex * 5 + charIndex) * delay) / 1000,
                ease: [0.215, 0.61, 0.355, 1],
              }}
              className="inline-block"
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </span>
  );
};

export default SplitText;
