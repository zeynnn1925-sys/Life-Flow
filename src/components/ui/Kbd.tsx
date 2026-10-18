import React from 'react';
import { cn } from '../../lib/utils';

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export const Kbd: React.FC<KbdProps> = ({ children, className, ...props }) => {
  return (
    <kbd
      className={cn(
        'pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-white/15 bg-white/10 px-1.5 font-mono text-[10px] font-medium text-zinc-300 shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </kbd>
  );
};

export default Kbd;
