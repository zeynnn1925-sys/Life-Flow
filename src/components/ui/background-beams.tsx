"use client";
import React from "react";
import { cn } from "../../lib/utils";

export const BackgroundBeams = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "absolute inset-0 z-0 h-full w-full pointer-events-none overflow-hidden",
        className
      )}
    >
      <svg
        className="h-full w-full opacity-50"
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M-100 450C100 450 300 200 500 200C700 200 900 700 1100 700C1300 700 1500 450 1700 450"
          stroke="url(#beam-gradient)"
          strokeWidth="2"
          strokeLinecap="round"
          className="animate-beam"
        />
        <defs>
          <linearGradient
            id="beam-gradient"
            x1="-100"
            y1="450"
            x2="1700"
            y2="450"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#494FDF" stopOpacity="0" offset="0" />
            <stop stopColor="#494FDF" offset="0.5" />
            <stop stopColor="#494FDF" stopOpacity="0" offset="1" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
