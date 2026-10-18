import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';

interface DecryptedTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  text: string;
  speed?: number;
  maxIterations?: number;
  sequential?: boolean;
  revealDirection?: 'start' | 'end' | 'center';
  useOriginalCharsOnly?: boolean;
  characters?: string;
  className?: string;
  encryptedClassName?: string;
  parentClassName?: string;
  animateOn?: 'view' | 'hover';
}

export const DecryptedText: React.FC<DecryptedTextProps> = ({
  text,
  speed = 40,
  maxIterations = 10,
  sequential = true,
  revealDirection = 'start',
  useOriginalCharsOnly = false,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()',
  className = '',
  encryptedClassName = 'text-orange-400/80 font-mono',
  parentClassName = '',
  animateOn = 'hover',
  ...props
}) => {
  const [displayText, setDisplayText] = useState<string>(text);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [isScrambling, setIsScrambling] = useState<boolean>(false);
  const intervalRef = useRef<any>(null);

  const scramble = () => {
    let iteration = 0;
    clearInterval(intervalRef.current);
    setIsScrambling(true);

    intervalRef.current = setInterval(() => {
      setDisplayText(() =>
        text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < iteration) {
              return text[index];
            }
            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join('')
      );

      if (iteration >= text.length) {
        clearInterval(intervalRef.current);
        setIsScrambling(false);
      }

      iteration += 1 / (maxIterations / text.length);
    }, speed);
  };

  useEffect(() => {
    if (animateOn === 'view') {
      scramble();
    }
    return () => clearInterval(intervalRef.current);
  }, [text, animateOn]);

  const handleMouseEnter = () => {
    setIsHovering(true);
    if (animateOn === 'hover') {
      scramble();
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  return (
    <span
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn('inline-block cursor-default select-none', parentClassName)}
      {...props}
    >
      <span className={cn(isScrambling ? encryptedClassName : '', className)}>
        {displayText}
      </span>
    </span>
  );
};

export default DecryptedText;
