import React from 'react';
import { Card } from '../Common/Card.jsx';
import { ProgressBar } from '../Common/ProgressBar.jsx';
import { Button } from '../Common/Button.jsx';
import { Badge } from '../Common/Badge.jsx';
import { useTransfer } from '../../context/TransferContext.jsx';
import { formatBytes, formatSpeed, formatEta } from '../../utils/formatters.js';
import { CheckCircle2, XCircle, AlertTriangle, X, RefreshCw, Zap } from 'lucide-react';

export function SendingProgress() {
  const { sendingState, cancelTransfer, resetSendingState } = useTransfer();

  if (sendingState.status === 'idle') return null;

  const { status, bytesTransferred, totalBytes, overallSpeed, overallEta, overallPercent, error } = sendingState;

  const getStatusBadge = () => {
    switch (status) {
      case 'requesting':
        return <Badge variant="info">Waiting Approval...</Badge>;
      case 'accepted':
      case 'transferring':
        return <Badge variant="info">Transferring...</Badge>;
      case 'completed':
        return <Badge variant="success">Completed!</Badge>;
      case 'rejected':
        return <Badge variant="danger">Declined</Badge>;
      case 'cancelled':
        return <Badge variant="warning">Cancelled</Badge>;
      case 'failed':
        return <Badge variant="danger">Failed</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="bg-[#FFE600] border-3 border-black shadow-brutal-lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {status === 'completed' && <CheckCircle2 className="w-7 h-7 text-black stroke-[3]" />}
            {status === 'rejected' && <XCircle className="w-7 h-7 text-black stroke-[3]" />}
            {status === 'failed' && <AlertTriangle className="w-7 h-7 text-black stroke-[3]" />}
            {(status === 'transferring' || status === 'requesting' || status === 'accepted') && (
              <Zap className="w-7 h-7 text-black animate-bounce stroke-[3]" />
            )}
            <div>
              <h3 className="text-lg font-black uppercase text-black tracking-tight">File Transfer Progress</h3>
              <p className="text-xs font-bold text-black">
                {formatBytes(bytesTransferred)} / {formatBytes(totalBytes)} ({overallPercent}%)
              </p>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        {/* Progress Bar & Streaming Indicator */}
        <div className="space-y-3">
          {(status === 'transferring' || status === 'accepted' || status === 'requesting') && (
            <div className="flex items-center gap-2 text-xs font-black text-black">
              <RefreshCw className="w-4 h-4 animate-spin text-black stroke-[3]" />
              <span>
                {status === 'requesting' ? 'Waiting for receiver to accept transfer...' : 'Streaming binary chunks over P2P network...'}
              </span>
            </div>
          )}

          <ProgressBar percent={overallPercent} status={status} />
          
          <div className="flex items-center justify-between text-xs text-black font-mono font-extrabold">
            <span>Speed: <strong>{formatSpeed(overallSpeed)}</strong></span>
            <span>{formatEta(overallEta)}</span>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-3.5 rounded-xl bg-[#FF6B99] border-2 border-black text-black text-xs font-black shadow-brutal-sm">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-black">
          {(status === 'requesting' || status === 'transferring' || status === 'accepted') && (
            <Button variant="danger" icon={X} onClick={cancelTransfer}>
              Cancel Transfer
            </Button>
          )}

          {(status === 'completed' || status === 'rejected' || status === 'cancelled' || status === 'failed') && (
            <Button variant="secondary" icon={RefreshCw} onClick={resetSendingState}>
              Start New Transfer
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
