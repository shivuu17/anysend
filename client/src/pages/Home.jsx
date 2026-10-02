import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/Common/Card.jsx';
import { Button } from '../components/Common/Button.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { useTransfer } from '../context/TransferContext.jsx';
import { formatBytes, formatDate } from '../utils/formatters.js';
import { Send, Download, Wifi, FileText, ArrowRight, Radio, Globe } from 'lucide-react';

export function Home() {
  const { deviceInfo } = useSettings();
  const { transferHistory } = useTransfer();

  const recentTransfers = transferHistory.slice(0, 5);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[#FFE600] border-3 border-black p-6 sm:p-10 shadow-brutal-xl">
        <div className="max-w-2xl relative z-10 space-y-4 sm:space-y-5">
          {/* Logo Tag */}
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-white border-2 border-black shadow-brutal-sm">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-[#FFE600] border-2 border-black flex items-center justify-center text-black shrink-0">
              <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black stroke-[3]" />
            </div>
            <span className="font-black text-[10px] sm:text-xs text-black uppercase tracking-wider">
              Local Wi-Fi & Internet Code File Engine
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-black tracking-tight leading-tight uppercase">
            Fast File Drop Across Any Device & Network
          </h1>

          <p className="text-xs sm:text-base font-extrabold text-black leading-relaxed">
            Transfer photos, 4K videos, documents, and multi-gigabyte files over local Wi-Fi or cross-network with a simple 6-digit code (no login required).
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link to="/send" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" icon={Send} className="w-full sm:w-auto">
                Send Files Now
              </Button>
            </Link>
            <Link to="/receive" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" icon={Download} className="w-full sm:w-auto">
                Receive Mode
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Internet Code Action */}
        <Card className="hover:-translate-x-1 hover:-translate-y-1 hover:shadow-brutal-lg transition-all group cursor-pointer bg-[#FFE600] p-5">
          <Link to="/send" className="space-y-3 sm:space-y-4 block">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white border-3 border-black flex items-center justify-center text-black shadow-brutal">
              <Globe className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-black uppercase flex items-center justify-between">
                <span>6-Digit Code</span>
                <ArrowRight className="w-5 h-5 text-black group-hover:translate-x-1 transition-transform stroke-[3]" />
              </h3>
              <p className="text-xs font-bold text-black mt-1">
                Share files anywhere on the internet using a temporary 6-digit code.
              </p>
            </div>
          </Link>
        </Card>

        {/* Local Wi-Fi Action */}
        <Card className="hover:-translate-x-1 hover:-translate-y-1 hover:shadow-brutal-lg transition-all group cursor-pointer bg-[#00F0FF] p-5">
          <Link to="/send" className="space-y-3 sm:space-y-4 block">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white border-3 border-black flex items-center justify-center text-black shadow-brutal">
              <Send className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-black uppercase flex items-center justify-between">
                <span>Local Wi-Fi</span>
                <ArrowRight className="w-5 h-5 text-black group-hover:translate-x-1 transition-transform stroke-[3]" />
              </h3>
              <p className="text-xs font-bold text-black mt-1">
                Direct LAN P2P transfer over local Wi-Fi or mobile hotspot.
              </p>
            </div>
          </Link>
        </Card>

        {/* Receive Action */}
        <Card className="hover:-translate-x-1 hover:-translate-y-1 hover:shadow-brutal-lg transition-all group cursor-pointer bg-[#A3E635] p-5">
          <Link to="/receive" className="space-y-3 sm:space-y-4 block">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white border-3 border-black flex items-center justify-center text-black shadow-brutal">
              <Download className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-black uppercase flex items-center justify-between">
                <span>Receive Mode</span>
                <ArrowRight className="w-5 h-5 text-black group-hover:translate-x-1 transition-transform stroke-[3]" />
              </h3>
              <p className="text-xs font-bold text-black mt-1">
                Enter a 6-digit code or scan QR code to receive incoming files.
              </p>
            </div>
          </Link>
        </Card>
      </div>

      {/* Recent Transfers Section */}
      <Card
        title="Recent Transfers"
        subtitle="Completed file transfer history on this network node"
        action={
          <Link to="/transfers" className="text-xs font-black uppercase text-black hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4 stroke-[3]" />
          </Link>
        }
      >
        {recentTransfers.length === 0 ? (
          <div className="text-center py-8 font-bold text-slate-600 text-xs">
            No recent transfers found. Start sending or receiving files!
          </div>
        ) : (
          <div className="space-y-3">
            {recentTransfers.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 sm:p-3.5 rounded-xl bg-white border-2 border-black shadow-brutal-sm text-xs"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#FFE600] border-2 border-black flex items-center justify-center text-black shrink-0 shadow-brutal-sm">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-extrabold text-black truncate">
                      {item.files?.[0]?.name || 'Transferred file'}
                      {item.files?.length > 1 ? ` (+${item.files.length - 1} more)` : ''}
                    </p>
                    <p className="text-[11px] font-bold text-slate-700 mt-0.5 font-mono">
                      {formatBytes(item.totalBytes)} • {formatDate(item.createdAt)}
                    </p>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border-2 border-black shadow-brutal-sm shrink-0 ${
                  item.status === 'completed' ? 'bg-[#A3E635] text-black' : 'bg-[#FF6B99] text-black'
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
