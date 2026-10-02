import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Send, Download, History, Settings, Info, ShieldCheck } from 'lucide-react';
import { Logo } from '../Common/Logo.jsx';

export function Sidebar() {
  const navItems = [
    { to: '/', label: 'Home', icon: Home, bg: 'bg-[#FFE600]' },
    { to: '/send', label: 'Send Files', icon: Send, bg: 'bg-[#00F0FF]' },
    { to: '/receive', label: 'Receive Files', icon: Download, bg: 'bg-[#A3E635]' },
    { to: '/transfers', label: 'Transfers', icon: History, bg: 'bg-[#FF6B99]' },
    { to: '/settings', label: 'Settings', icon: Settings, bg: 'bg-[#C084FC]' },
    { to: '/about', label: 'About', icon: Info, bg: 'bg-[#FF8A00]' },
    { to: '/privacy', label: 'Privacy', icon: ShieldCheck, bg: 'bg-[#FFE600]' },
  ];

  return (
    <aside className="w-64 border-r-3 border-black bg-white flex flex-col hidden md:flex h-screen sticky top-0 shadow-brutal-sm">
      {/* Brand Header */}
      <div className="p-5 border-b-3 border-black bg-white">
        <Logo size="md" />
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-2 mt-3 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-extrabold border-2 border-black transition-all duration-150 ${
                  isActive
                    ? `${item.bg} text-black shadow-brutal -translate-y-0.5`
                    : 'bg-white text-slate-800 hover:bg-slate-100 hover:shadow-brutal-sm'
                }`
              }
            >
              <Icon className="w-5 h-5 stroke-[2.5]" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer info */}
      <div className="p-3.5 mx-4 mb-4 rounded-xl bg-[#FAF7F0] border-2 border-black shadow-brutal-sm">
        <div className="text-xs">
          <p className="font-black text-black uppercase">Local Wi-Fi & Code</p>
          <p className="text-[11px] font-bold text-slate-700 mt-0.5">P2P Relay Engine • Zero Cloud</p>
        </div>
      </div>
    </aside>
  );
}
