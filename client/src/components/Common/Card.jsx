import React from 'react';

export function Card({ children, className = '', title, subtitle, action }) {
  return (
    <div className={`bg-white border-3 border-black rounded-2xl p-6 shadow-brutal ${className}`}>
      {(title || subtitle || action) && (
        <div className="flex items-center justify-between mb-5 pb-3 border-b-2 border-black">
          <div>
            {title && <h3 className="text-xl font-extrabold text-black tracking-tight uppercase">{title}</h3>}
            {subtitle && <p className="text-xs font-bold text-slate-700 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
