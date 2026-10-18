import React, { useRef, useState, useCallback } from 'react';
import { motion, useSpring } from 'framer-motion';
import { cn } from '../../lib/utils';

interface TiltedCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  perspective?: number;
  scaleOnHover?: number;
  showGlare?: boolean;
  glareOpacity?: number;
  glareColor?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export const TiltedCard: React.FC<TiltedCardProps> = ({
  children,
  className = '',
  maxTilt = 12,
  perspective = 1000,
  scaleOnHover = 1.03,
  showGlare = true,
  glareOpacity = 0.25,
  glareColor = 'rgba(255, 255, 255, 0.4)',
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [glarePosition, setGlarePosition] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  // Springs for smooth physics
  const springConfig = { stiffness: 260, damping: 20 };
  const rotateX = useSpring(0, springConfig);
  const rotateY = useSpring(0, springConfig);
  const scale = useSpring(1, springConfig);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const tiltX = ((y - centerY) / centerY) * -maxTilt;
    const tiltY = ((x - centerX) / centerX) * maxTilt;

    rotateX.set(tiltX);
    rotateY.set(tiltY);

    setGlarePosition({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  }, [maxTilt, rotateX, rotateY]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    scale.set(scaleOnHover);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    rotateX.set(0);
    rotateY.set(0);
    scale.set(1);
  };

  return (
    <div
      style={{ perspective: `${perspective}px` }}
      className="inline-block transform-gpu"
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          scale,
          transformStyle: 'preserve-3d',
        }}
        className={cn(
          'relative rounded-2xl transition-shadow duration-300',
          isHovered ? 'shadow-2xl shadow-blue-500/10' : '',
          className
        )}
        {...props}
      >
        {children}

        {/* Dynamic Glare / Shine Overlay */}
        {showGlare && (
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl overflow-hidden transition-opacity duration-300"
            style={{
              opacity: isHovered ? glareOpacity : 0,
              background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, ${glareColor}, transparent 65%)`,
            }}
          />
        )}
      </motion.div>
    </div>
  );
};

export default TiltedCard;
