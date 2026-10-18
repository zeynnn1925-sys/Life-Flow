import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-blue-600 text-white shadow hover:bg-blue-500 shadow-blue-500/20',
        destructive:
          'bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25',
        outline:
          'border border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10 hover:text-white',
        secondary:
          'bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-white',
        ghost:
          'text-zinc-400 hover:bg-white/5 hover:text-zinc-100',
        link:
          'text-blue-400 underline-offset-4 hover:underline p-0 h-auto',
        glow:
          'relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:brightness-110',
        cyber:
          'border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 font-mono tracking-wider',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-7 rounded-md px-2.5 text-[11px]',
        lg: 'h-11 rounded-xl px-6 text-sm',
        icon: 'h-8 w-8 rounded-lg p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export default Button;
