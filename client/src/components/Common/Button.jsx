import React from 'react';
import { Loader2 } from 'lucide-react';

export function Button({
  children,
  variant = 'primary', // primary, secondary, danger, ghost, outline
  size = 'md', // sm, md, lg
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  icon: Icon,
  className = ''
}) {
  const baseStyles = 'inline-flex items-center justify-center font-extrabold rounded-xl border-2 border-black transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-black/20 disabled:opacity-50 disabled:cursor-not-allowed shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-lg active:translate-x-1 active:translate-y-1 active:shadow-none';

  const variants = {
    primary: 'bg-[#FFE600] text-black hover:bg-[#FFF066]',
    secondary: 'bg-[#00F0FF] text-black hover:bg-[#66F5FF]',
    danger: 'bg-[#FF6B99] text-black hover:bg-[#FF8DAF]',
    ghost: 'bg-white text-black hover:bg-slate-100',
    outline: 'bg-[#A3E635] text-black hover:bg-[#B7EE5B]'
  };

  const sizes = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5',
    md: 'text-sm px-5 py-2.5 gap-2',
    lg: 'text-base px-7 py-3.5 gap-2.5 font-black uppercase tracking-wider'
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin stroke-[3]" />
      ) : Icon ? (
        <Icon className={size === 'sm' ? 'w-3.5 h-3.5 stroke-[3]' : size === 'lg' ? 'w-5 h-5 stroke-[3]' : 'w-4 h-4 stroke-[3]'} />
      ) : null}
      <span>{children}</span>
    </button>
  );
}
