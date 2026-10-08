import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  color?: string;
}

export function Logo({ className = "w-8 h-8", size }: LogoProps) {
  const inlineStyle = size ? { width: size, height: size } : undefined;

  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={inlineStyle}
      aria-label="LifeFlow Logo"
    >
      <defs>
        {/* Dynamic primary gradient */}
        <linearGradient id="lf_primary_grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="50%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>

        {/* Glow / accent gradient */}
        <linearGradient id="lf_accent_grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>

        {/* Soft shadow filter */}
        <filter id="lf_glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#06b6d4" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Rounded squircle background with subtle translucent fill */}
      <rect
        x="2"
        y="2"
        width="44"
        height="44"
        rx="12"
        className="fill-surface-2/80 stroke-hairline"
        strokeWidth="1"
      />

      {/* Flowing 'L' line ribbon (representing stability / base / life) */}
      <path
        d="M14 13V29C14 31.2091 15.7909 33 18 33H30"
        stroke="url(#lf_primary_grad)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#lf_glow)"
      />

      {/* Flowing dynamic pulse / wave (representing growth & finance flow) */}
      <path
        d="M20 21C22 17 26 15 31 15C33.2091 15 35 16.7909 35 19C35 22 31 24 26 24H21"
        stroke="url(#lf_accent_grad)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Momentum pulse node (spark of productivity) */}
      <circle
        cx="34"
        cy="15"
        r="3"
        fill="#10b981"
        className="animate-pulse"
      />
    </svg>
  );
}

export default Logo;
