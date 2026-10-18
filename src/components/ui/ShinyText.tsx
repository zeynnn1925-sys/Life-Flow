import React from 'react';
import { cn } from '../../lib/utils';

interface ShinyTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  className?: string;
  shimmerWidth?: number;
  speed?: number; // duration in seconds
  disabled?: boolean;
}

export const ShinyText: React.FC<ShinyTextProps> = ({
  children,
  className = '',
  shimmerWidth = 100,
  speed = 3,
  disabled = false,
  ...props
}) => {
  if (disabled) {
    return <span className={className} {...props}>{children}</span>;
  }

  return (
    <span
      className={cn(
        'inline-block bg-clip-text text-transparent bg-[linear-gradient(110deg,#a1a1aa,45%,#ffffff,55%,#a1a1aa)] [background-size:200%_100%] animate-shine',
        className
      )}
      style={{
        animationDuration: `${speed}s`,
      }}
      {...props}
    >
      {children}
    </span>
  );
};

export default ShinyText;
