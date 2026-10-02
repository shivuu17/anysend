import React, { useState } from 'react';
import { QRCodeCard } from '../components/Receive/QRCodeCard.jsx';
import { ReceivingProgress } from '../components/Receive/ReceivingProgress.jsx';
import { InternetCodeInputCard } from '../components/Receive/InternetCodeInputCard.jsx';
import { Card } from '../components/Common/Card.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { QrCode, Globe } from 'lucide-react';

export function ReceivePage() {
  const { deviceInfo, settings } = useSettings();
  const [tab, setTab] = useState('code'); // code, qr

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-black uppercase tracking-tight">Receive Mode</h2>
        <p className="text-xs font-bold text-slate-700 mt-1">
          Receive files via 6-digit internet code anywhere (no Wi-Fi needed) or local QR scanner.
        </p>
      </div>

      {/* Mode Selector Tabs (Stacked vertically on mobile) */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={() => setTab('code')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-3 border-black font-black text-xs sm:text-sm uppercase transition-all shadow-brutal ${
            tab === 'code' ? 'bg-[#FFE600] text-black -translate-y-0.5 shadow-brutal-lg' : 'bg-white text-slate-800 hover:bg-slate-100'
          }`}
        >
          <Globe className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
          <span>6-Digit Code (Anywhere)</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('qr')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-3 border-black font-black text-xs sm:text-sm uppercase transition-all shadow-brutal ${
            tab === 'qr' ? 'bg-[#00F0FF] text-black -translate-y-0.5 shadow-brutal-lg' : 'bg-white text-slate-800 hover:bg-slate-100'
          }`}
        >
          <QrCode className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
          <span>Local Wi-Fi QR Code</span>
        </button>
      </div>

      {/* Active Incoming Transfers */}
      <ReceivingProgress />

      {/* 6-Digit Internet Code Receive Card */}
      {tab === 'code' && <InternetCodeInputCard />}

      {/* Local Wi-Fi QR Pairing Card */}
      {tab === 'qr' && <QRCodeCard />}

      {/* Server Status Info */}
      <Card title="Receiver Node Specs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs font-extrabold">
          <div className="p-3.5 sm:p-4 rounded-xl bg-[#FAF7F0] border-2 border-black shadow-brutal-sm space-y-1">
            <span className="text-slate-600 uppercase text-[10px] sm:text-xs">Device Name:</span>
            <p className="font-black text-black text-sm sm:text-base uppercase truncate">{settings.deviceName || deviceInfo.deviceName}</p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-[#FAF7F0] border-2 border-black shadow-brutal-sm space-y-1">
            <span className="text-slate-600 uppercase text-[10px] sm:text-xs">Pairing Security:</span>
            <p className="font-black text-black text-sm sm:text-base uppercase">
              {settings.autoAccept ? (
                <span className="text-[#FF8A00]">Auto-Accepting</span>
              ) : (
                <span className="text-[#00F0FF]">Approval Prompt</span>
              )}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
