import React from 'react';
import { Wifi } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext.jsx';
import { useSocket } from '../../context/SocketContext.jsx';
import { Logo } from '../Common/Logo.jsx';

export function Navbar() {
  const { deviceInfo } = useSettings();
  const { isConnected } = useSocket();

  return (
    <header className="h-16 border-b-3 border-black bg-white px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-brutal-sm">
      {/* Mobile Brand Logo */}
      <div className="flex items-center md:hidden">
        <Logo size="sm" showText={false} />
        <span className="font-black text-sm text-black tracking-tight uppercase ml-2 sm:hidden">
          AnySend
        </span>
        <div className="hidden sm:block ml-2">
          <Logo size="sm" showText={true} />
        </div>
      </div>

      {/* Network & Local IP Pill */}
      <div className="flex items-center gap-2 sm:gap-3 ml-auto">
        <div className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-xl bg-[#00F0FF] border-2 border-black text-[11px] sm:text-xs font-black text-black shadow-brutal-sm">
          <Wifi className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3] shrink-0" />
          <span className="font-mono">{deviceInfo.ip}</span>
        </div>

        {/* Server status indicator */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-xl border-2 border-black text-[11px] sm:text-xs font-black shadow-brutal-sm ${
          isConnected ? 'bg-[#A3E635] text-black' : 'bg-slate-200 text-black'
        }`}>
          <span className="w-2 h-2 rounded-full bg-black animate-ping shrink-0" />
          <span>{isConnected ? 'ONLINE' : 'CONNECTING'}</span>
        </div>
      </div>
    </header>
  );
}
