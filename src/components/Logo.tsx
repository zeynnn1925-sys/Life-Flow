import React from 'react';

export function Logo({ className = "w-8 h-8" }: { className?: string, color?: string }) {
  return (
    <img 
      src="/logo.png" 
      alt="LifeFlow Logo" 
      className={`object-contain ${className}`}
      referrerPolicy="no-referrer"
    />
  );
}

