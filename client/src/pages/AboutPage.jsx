import React from 'react';
import { Card } from '../components/Common/Card.jsx';
import { ShieldCheck, Cpu, HardDrive, Radio, Layers, Zap } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-black text-black uppercase tracking-tight">About AnySend</h2>
        <p className="text-xs font-bold text-slate-700 mt-1">
          High-performance, zero-cloud local network P2P & internet code file transfer engine.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Streaming Pipeline" subtitle="Zero RAM overflow architecture" className="bg-[#FFE600]">
          <div className="space-y-3 text-xs font-bold text-black leading-relaxed">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border-2 border-black flex items-center justify-center shrink-0 shadow-brutal-sm">
                <Layers className="w-4 h-4 stroke-[2.5]" />
              </div>
              <p>
                Files are divided into 4 MB chunks on the sender device (`Blob.slice()`) and streamed directly over HTTP POST endpoints.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border-2 border-black flex items-center justify-center shrink-0 shadow-brutal-sm">
                <Cpu className="w-4 h-4 stroke-[2.5]" />
              </div>
              <p>
                Multi-gigabyte payload transfers (up to 100 GB) append iteratively to temporary files without buffering full file contents in RAM.
              </p>
            </div>
          </div>
        </Card>

        <Card title="SHA-256 Checksums" subtitle="Bit-exact integrity enforcement" className="bg-[#00F0FF]">
          <div className="space-y-3 text-xs font-bold text-black leading-relaxed">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border-2 border-black flex items-center justify-center shrink-0 shadow-brutal-sm">
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
              </div>
              <p>
                Browser client computes incremental SHA-256 checksums while reading chunks. Upon upload completion, Node.js re-verifies the digest.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border-2 border-black flex items-center justify-center shrink-0 shadow-brutal-sm">
                <HardDrive className="w-4 h-4 stroke-[2.5]" />
              </div>
              <p>
                Path traversal protection, filename sanitization, and unique file path resolution prevent accidental file overwrites.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Supported Network Topology">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-black">
          <div className="p-4 rounded-xl bg-[#FAF7F0] border-2 border-black shadow-brutal-sm space-y-1 text-center">
            <Radio className="w-7 h-7 text-black mx-auto mb-2 stroke-[2.5]" />
            <span className="font-black text-black uppercase block">Wi-Fi Router</span>
            <span className="text-slate-700 text-[11px] font-bold">Both devices connected to same LAN</span>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF7F0] border-2 border-black shadow-brutal-sm space-y-1 text-center">
            <Zap className="w-7 h-7 text-black mx-auto mb-2 stroke-[2.5]" />
            <span className="font-black text-black uppercase block">Mobile Hotspot</span>
            <span className="text-slate-700 text-[11px] font-bold">Phone or Laptop hotspot tethering</span>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF7F0] border-2 border-black shadow-brutal-sm space-y-1 text-center">
            <Cpu className="w-7 h-7 text-black mx-auto mb-2 stroke-[2.5]" />
            <span className="font-black text-black uppercase block">Ethernet Cable</span>
            <span className="text-slate-700 text-[11px] font-bold">Direct wired network setup</span>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF7F0] border-2 border-black shadow-brutal-sm space-y-1 text-center">
            <ShieldCheck className="w-7 h-7 text-black mx-auto mb-2 stroke-[2.5]" />
            <span className="font-black text-black uppercase block">6-Digit Code</span>
            <span className="text-slate-700 text-[11px] font-bold">Cross-network internet relay</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
