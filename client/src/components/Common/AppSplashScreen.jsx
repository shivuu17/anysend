import React from 'react';
import { Radio } from 'lucide-react';

export function AppSplashScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FAF7F0] p-6 text-black select-none">
      <div className="flex flex-col items-center max-w-sm w-full space-y-6 text-center">
        {/* Animated AnySend Logo Badge */}
        <div className="relative group">
          <div className="w-24 h-24 rounded-3xl bg-[#FFE600] border-4 border-black flex items-center justify-center shadow-brutal-lg animate-bounce">
            <img src="/logo.png" alt="AnySend Logo" className="w-16 h-16 object-contain" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#00F0FF] border-2 border-black flex items-center justify-center shadow-brutal-sm">
            <Radio className="w-4 h-4 text-black animate-pulse stroke-[3]" />
          </div>
        </div>

        {/* Title & Tagline */}
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-black uppercase tracking-tight">AnySend</h1>
          <p className="text-xs font-black text-slate-700 uppercase tracking-wider">
            Zero-Cloud P2P & Internet File Transfer
          </p>
        </div>

        {/* Loading Progress Bar */}
        <div className="w-full space-y-2">
          <div className="w-full h-4 bg-white border-3 border-black rounded-full overflow-hidden p-0.5 shadow-brutal-sm">
            <div className="h-full bg-[#00F0FF] border-r-2 border-black rounded-full animate-pulse w-3/4 transition-all duration-500"></div>
          </div>
          <p className="text-[11px] font-mono font-extrabold text-slate-800 uppercase tracking-widest animate-pulse">
            Connecting P2P Node & Socket Relay...
          </p>
        </div>
      </div>
    </div>
  );
}
