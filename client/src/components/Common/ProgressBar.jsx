import React from 'react';

export function ProgressBar({ percent = 0, status = 'transferring', className = '' }) {
  const safePercent = Math.min(100, Math.max(0, percent));

  const statusColors = {
    transferring: 'bg-[#00F0FF]',
    completed: 'bg-[#A3E635]',
    rejected: 'bg-[#FF6B99]',
    cancelled: 'bg-[#FF8A00]',
    failed: 'bg-[#FF6B99]'
  };

  const barColor = statusColors[status] || statusColors.transferring;

  return (
    <div className={`w-full ${className}`}>
      <div className="w-full bg-slate-100 rounded-xl h-4 overflow-hidden border-2 border-black shadow-brutal-sm p-0.5">
        <div
          className={`h-full rounded-lg transition-all duration-300 ease-out border-r-2 border-black ${barColor}`}
          style={{ width: `${safePercent}%` }}
        />
      </div>
    </div>
  );
}
