import React from 'react';

export function Badge({ children, variant = 'neutral', className = '' }) {
  const variants = {
    neutral: 'bg-white text-black border-2 border-black shadow-brutal-sm font-bold',
    success: 'bg-[#A3E635] text-black border-2 border-black shadow-brutal-sm font-extrabold',
    warning: 'bg-[#FF8A00] text-black border-2 border-black shadow-brutal-sm font-extrabold',
    danger: 'bg-[#FF6B99] text-black border-2 border-black shadow-brutal-sm font-extrabold',
    info: 'bg-[#00F0FF] text-black border-2 border-black shadow-brutal-sm font-extrabold'
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs tracking-wide uppercase ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
