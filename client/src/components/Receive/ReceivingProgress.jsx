import React from 'react';
import { Card } from '../Common/Card.jsx';
import { ProgressBar } from '../Common/ProgressBar.jsx';
import { useTransfer } from '../../context/TransferContext.jsx';
import { formatBytes } from '../../utils/formatters.js';
import { Download, ArrowDownCircle } from 'lucide-react';

export function ReceivingProgress() {
  const { receivingState } = useTransfer();
  const activeTransfers = Object.entries(receivingState.activeTransfers);

  if (activeTransfers.length === 0) return null;

  return (
    <div className="space-y-4">
      <h4 className="text-base font-black uppercase text-black flex items-center gap-2">
        <ArrowDownCircle className="w-5 h-5 text-black animate-bounce stroke-[3]" />
        <span>Active Incoming Transfers ({activeTransfers.length})</span>
      </h4>

      {activeTransfers.map(([transferId, transfer]) => (
        <Card key={transferId} className="bg-[#00F0FF] border-3 border-black shadow-brutal-lg">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Download className="w-6 h-6 text-black animate-pulse stroke-[3]" />
                <div>
                  <h5 className="text-base font-black uppercase text-black">Receiving Files...</h5>
                  <p className="text-xs font-bold text-black">
                    {formatBytes(transfer.bytesTransferred)} / {formatBytes(transfer.totalBytes)} ({transfer.percent || 0}%)
                  </p>
                </div>
              </div>
              <span className="text-sm font-black text-black font-mono">{transfer.percent || 0}%</span>
            </div>

            <ProgressBar percent={transfer.percent || 0} status="transferring" />
          </div>
        </Card>
      ))}
    </div>
  );
}
