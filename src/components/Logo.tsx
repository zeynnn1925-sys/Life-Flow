import React from 'react';

export function Logo({ className = "w-8 h-8", color = "currentColor" }: { className?: string, color?: string }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      {/* L Shape (Left) */}
      <path 
        d="M20 20V70C20 75.5228 24.4772 80 30 80H40L35 70H30V20H20Z" 
        fill={color}
      />
      
      {/* F Shape (Right) */}
      <path 
        d="M80 20H50V30H80V20Z" 
        fill={color}
      />
      <path 
        d="M50 20V80L40 70V20H50Z" 
        fill={color}
      />
      <path 
        d="M50 45H75V55H50V45Z" 
        fill={color}
      />
      
      {/* Central Flowing Connection */}
      <path 
        fillRule="evenodd" 
        clipRule="evenodd" 
        d="M40 80C30 80 25 70 25 50C25 30 35 20 50 20C65 20 75 30 75 50C75 70 70 80 60 80L55 70C62 70 65 60 65 50C65 40 60 30 50 30C40 30 35 40 35 50C40.6667 50 35 63.3333 45 70L40 80ZM50 58C54.4183 58 58 54.4183 58 50C58 45.5817 54.4183 42 50 42C45.5817 42 42 45.5817 42 50C42 54.4183 45.5817 58 50 58Z" 
        fill={color} 
      />
      
      {/* Core Purple Signal */}
      <circle cx="50" cy="50" r="8" fill="#6A4CF5" />
      <circle cx="50" cy="50" r="3" fill="#010102" />
    </svg>
  );
}
