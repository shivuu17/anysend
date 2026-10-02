import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Send, Download, History, Settings } from 'lucide-react';

export function MobileNav() {
  const items = [
    { to: '/', label: 'Home', icon: Home, activeBg: 'bg-[#FFE600]' },
    { to: '/send', label: 'Send', icon: Send, activeBg: 'bg-[#00F0FF]' },
    { to: '/receive', label: 'Receive', icon: Download, activeBg: 'bg-[#A3E635]' },
    { to: '/transfers', label: 'Transfers', icon: History, activeBg: 'bg-[#FF6B99]' },
    { to: '/settings', label: 'Settings', icon: Settings, activeBg: 'bg-[#C084FC]' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t-3 border-black px-2 py-2 shadow-brutal-lg">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 p-2 rounded-xl text-[11px] font-black border-2 transition-all ${
                  isActive
                    ? `${item.activeBg} text-black border-black shadow-brutal-sm -translate-y-1`
                    : 'border-transparent text-slate-700 hover:text-black'
                }`
              }
            >
              <Icon className="w-5 h-5 stroke-[2.5]" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
