import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface TabsContextType {
  value: string;
  onValueChange: (val: string) => void;
  layoutId?: string;
}

const TabsContext = React.createContext<TabsContextType | undefined>(undefined);

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  onValueChange: (val: string) => void;
  layoutId?: string;
  children: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({
  value,
  onValueChange,
  layoutId = 'shadcn-tabs-active-pill',
  children,
  className,
  ...props
}) => {
  return (
    <TabsContext.Provider value={{ value, onValueChange, layoutId }}>
      <div className={cn('w-full', className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export const TabsList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'inline-flex items-center justify-start rounded-xl bg-white/5 p-1 border border-white/10 text-zinc-400 gap-1 select-none backdrop-blur-md',
      className
    )}
    {...props}
  />
));
TabsList.displayName = 'TabsList';

export interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  TabsTriggerProps
>(({ className, value, children, ...props }, ref) => {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used within Tabs');

  const isActive = context.value === value;

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => context.onValueChange(value)}
      className={cn(
        'relative z-10 inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer focus-visible:outline-none',
        isActive ? 'text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200',
        className
      )}
      {...props}
    >
      {isActive && (
        <motion.span
          layoutId={context.layoutId}
          className="absolute inset-0 z-[-1] rounded-lg bg-blue-600/30 border border-blue-500/40 shadow-sm"
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        />
      )}
      {children}
    </button>
  );
});
TabsTrigger.displayName = 'TabsTrigger';

export interface TabsContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const TabsContent = React.forwardRef<
  HTMLDivElement,
  TabsContentProps
>(({ className, value, children, ...props }, ref) => {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used within Tabs');

  if (context.value !== value) return null;

  return (
    <div
      ref={ref}
      role="tabpanel"
      className={cn('mt-3 focus-visible:outline-none', className)}
      {...props}
    >
      {children}
    </div>
  );
});
TabsContent.displayName = 'TabsContent';

export default Tabs;
