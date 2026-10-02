import React from 'react';

export function Logo({ size = 'md', showText = true, className = '' }) {
  const iconSizes = {
    sm: { img: 'w-10 h-10', title: 'text-lg', sub: 'text-[9px]' },
    md: { img: 'w-12 h-12', title: 'text-xl', sub: 'text-[10px]' },
    lg: { img: 'w-16 h-16', title: 'text-3xl', sub: 'text-xs' }
  };

  const current = iconSizes[size] || iconSizes.md;

  return (
    <div className={`flex items-center gap-3.5 ${className}`}>
      {/* Transparent cropped Neo-Brutalist logo image */}
      <img
        src="/logo.png"
        alt="AnySend Logo"
        className={`${current.img} object-contain filter drop-shadow-[2px_2px_0px_#000000]`}
      />

      {showText && (
        <div className="flex flex-col">
          <span className={`${current.title} font-black text-black tracking-tight uppercase leading-none`}>
            AnySend
          </span>
          <span className={`${current.sub} font-extrabold text-black uppercase tracking-widest mt-1`}>
            P2P File Engine
          </span>
        </div>
      )}
    </div>
  );
}
