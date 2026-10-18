import React, { useRef, useState } from 'react';
import { motion, useSpring } from 'framer-motion';
import { cn } from '../../lib/utils';

interface MagnetProps {
  children: React.ReactNode;
  strength?: number; // max pixels to pull
  damping?: number;
  stiffness?: number;
  className?: string;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export const Magnet: React.FC<MagnetProps> = ({
  children,
  strength = 20,
  damping = 15,
  stiffness = 180,
  className = '',
  disabled = false,
  ...props
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(0, { damping, stiffness });
  const y = useSpring(0, { damping, stiffness });
  const [isActive, setIsActive] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;

    const pullX = (distanceX / (width / 2)) * strength;
    const pullY = (distanceY / (height / 2)) * strength;

    x.set(pullX);
    y.set(pullY);
  };

  const handleMouseEnter = () => {
    if (!disabled) setIsActive(true);
  };

  const handleMouseLeave = () => {
    setIsActive(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ x, y }}
      className={cn('inline-block cursor-pointer', className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Magnet;
