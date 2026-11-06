import React from 'react';

interface LifeFlowHero3DProps {
  className?: string;
}

export const LifeFlowHero3D: React.FC<LifeFlowHero3DProps> = ({ className = '' }) => {
  return (
    <div className={`relative w-full h-[480px] sm:h-[540px] lg:h-[600px] overflow-hidden rounded-xl ${className}`}>
      <iframe
        src="/LifeFlow%20%E2%80%93%20Meja%20kerja%203D.html"
        title="LifeFlow – Meja kerja 3D"
        className="w-full h-full border-0 block"
        loading="lazy"
        allow="accelerometer; autoplay; encrypted-media; gyroscope"
      />
    </div>
  );
};

export default LifeFlowHero3D;
