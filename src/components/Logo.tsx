import React from 'react';

export interface LogoProps {
  className?: string;
  size?: number;
  color?: string;
  showBackground?: boolean;
}

export function Logo({
  className = 'w-8 h-8',
  size,
  showBackground = true,
}: LogoProps) {
  const inlineStyle = size ? { width: size, height: size } : undefined;

  return (
    <img
      src="/Icon.png"
      alt="LifeFlow Icon"
      className={`shrink-0 select-none object-contain ${showBackground ? 'rounded-xl' : ''} ${className}`}
      style={inlineStyle}
      onError={(e) => {
        // Fallback if needed
        const target = e.currentTarget;
        if (!target.src.endsWith('/icon.png')) {
          target.src = '/icon.png';
        }
      }}
    />
  );
}

export default Logo;
