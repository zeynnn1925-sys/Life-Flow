import React, { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';

interface CountUpProps {
  to: number;
  from?: number;
  duration?: number; // seconds
  delay?: number;
  separator?: string;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const CountUp: React.FC<CountUpProps> = ({
  to,
  from = 0,
  duration = 1.2,
  delay = 0,
  separator = '.',
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
}) => {
  const [value, setValue] = useState(from);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let animId: number;

    timeout = setTimeout(() => {
      const startTime = performance.now();
      const diff = to - from;

      const update = (now: number) => {
        const elapsed = (now - startTime) / 1000;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out expo for snappy responsive feel
        const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const current = from + diff * ease;

        setValue(current);

        if (progress < 1) {
          animId = requestAnimationFrame(update);
        } else {
          setValue(to);
        }
      };

      animId = requestAnimationFrame(update);
    }, delay * 1000);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(animId);
    };
  }, [to, from, duration, delay]);

  const formatted = value.toLocaleString('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span className={cn('tabular-nums font-semibold tracking-tight', className)}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};

export default CountUp;
