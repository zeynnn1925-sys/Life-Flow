import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface BlurTextProps {
  text: string;
  delay?: number;
  className?: string;
  animateBy?: 'words' | 'letters';
  direction?: 'top' | 'bottom';
  threshold?: number;
  rootMargin?: string;
}

export const BlurText: React.FC<BlurTextProps> = ({
  text,
  delay = 50,
  className = '',
  animateBy = 'words',
  direction = 'top',
}) => {
  const elements = animateBy === 'words' ? text.split(' ') : text.split('');

  const defaultFrom =
    direction === 'top'
      ? { filter: 'blur(10px)', opacity: 0, y: -20 }
      : { filter: 'blur(10px)', opacity: 0, y: 20 };

  const defaultTo = {
    filter: 'blur(0px)',
    opacity: 1,
    y: 0,
  };

  return (
    <span className={cn('inline-flex flex-wrap gap-x-1', className)}>
      {elements.map((element, index) => (
        <motion.span
          key={index}
          initial={defaultFrom}
          animate={defaultTo}
          transition={{
            duration: 0.45,
            delay: (index * delay) / 1000,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="inline-block"
        >
          {element}
          {animateBy === 'words' && index < elements.length - 1 ? '\u00A0' : ''}
        </motion.span>
      ))}
    </span>
  );
};

export default BlurText;
