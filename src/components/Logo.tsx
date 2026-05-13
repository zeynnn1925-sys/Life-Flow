import React from 'react';

export function Logo({ className = "w-8 h-8", color = "currentColor" }: { className?: string, color?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Stylized L (Left Side) */}
      <path 
        d="M22 18V72H32V82H22V18Z" 
        fill={color}
      />
      <path 
        d="M22 72H42L38 82H22V72Z" 
        fill={color}
      />
      
      {/* Stylized F (Right Side) */}
      <path 
        d="M78 18H48V28H78V18Z" 
        fill={color}
      />
      <path 
        d="M48 18V82H38V18H48Z" 
        fill={color}
      />
      <path 
        d="M48 45H72V55H48V45Z" 
        fill={color}
      />

      {/* The "Flow" Connection - Recreating the curved bridge faithfully */}
      <path 
        fillRule="evenodd" 
        clipRule="evenodd" 
        d="M38 82C30 82 25 70 25 50C25 30 35 18 50 18C65 18 75 30 75 50C75 70 70 82 62 82L58 72C65 72 65 60 65 50C65 40 60 28 50 28C40 28 35 40 35 50C35 60 35 72 42 72L38 82Z" 
        fill={color} 
      />
      
      {/* Central Purple Eye - The signature detail */}
      <circle cx="50" cy="50" r="8" fill="#7C3AED" />
      <circle cx="50" cy="50" r="3" fill="black" />
    </svg>
  );
}
