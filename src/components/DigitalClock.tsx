import React, { useState, useEffect } from 'react';

export default function DigitalClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="hidden sm:flex flex-col items-end">
      <span className="text-eyebrow font-black text-ink-tertiary uppercase tracking-widest leading-none mb-1 opacity-70">
        {time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
      </span>
      <span className="text-body-sm font-black text-ink font-mono tracking-tight bg-surface-2 px-3 py-1 rounded shadow-inner border border-hairline/50">
        {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </span>
    </div>
  );
}
