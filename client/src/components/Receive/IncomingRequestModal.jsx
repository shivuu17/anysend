import React from 'react';
import { Modal } from '../Common/Modal.jsx';
import { Button } from '../Common/Button.jsx';
import { FileText, Check, X, Smartphone } from 'lucide-react';
import { formatBytes } from '../../utils/formatters.js';
import { useSocket } from '../../context/SocketContext.jsx';
import api from '../../services/api.js';

export function IncomingRequestModal() {
  const { incomingTransfer, clearIncomingTransfer, socket } = useSocket();

  if (!incomingTransfer) return null;

  const handleAccept = async () => {
    try {
      if (socket) {
        socket.emit('transfer:accept', { transferId: incomingTransfer.id });
      } else {
        await api.post(`/transfer/${incomingTransfer.id}/accept`);
      }
    } catch (err) {
      console.error('Error accepting transfer:', err);
    } finally {
      clearIncomingTransfer();
    }
  };

  const handleReject = async () => {
    try {
      if (socket) {
        socket.emit('transfer:reject', { transferId: incomingTransfer.id, reason: 'Declined by receiver' });
      } else {
        await api.post(`/transfer/${incomingTransfer.id}/reject`, { reason: 'Declined by receiver' });
      }
    } catch (err) {
      console.error('Error rejecting transfer:', err);
    } finally {
      clearIncomingTransfer();
    }
  };

  const totalSize = incomingTransfer.files ? incomingTransfer.files.reduce((acc, f) => acc + (f.size || 0), 0) : 0;

  return (
    <Modal
      isOpen={!!incomingTransfer}
      onClose={handleReject}
      title="Incoming File Request"
      maxWidth="max-w-lg"
    >
      <div className="space-y-5">
        {/* Sender Device Card */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-[#FFE600] border-2 border-black shadow-brutal-sm">
          <div className="w-12 h-12 rounded-xl bg-white border-2 border-black flex items-center justify-center text-black shrink-0 shadow-brutal-sm">
            <Smartphone className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h4 className="font-extrabold text-base text-black uppercase">{incomingTransfer.senderDevice || 'Nearby Device'}</h4>
            <p className="text-xs font-bold text-slate-800 mt-0.5">
              Wants to send {incomingTransfer.files?.length || 0} file(s) ({formatBytes(totalSize)})
            </p>
          </div>
        </div>

        {/* File Preview List */}
        <div>
          <h5 className="text-xs font-black uppercase tracking-wider text-black mb-2">Payload Contents</h5>
          <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
            {incomingTransfer.files?.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white border-2 border-black shadow-brutal-sm text-xs">
                <div className="flex items-center gap-3 min-w-0 pr-3">
                  <FileText className="w-4 h-4 text-black shrink-0 stroke-[2.5]" />
                  <span className="font-extrabold text-black truncate">{file.name}</span>
                </div>
                <span className="text-xs text-black font-mono font-bold shrink-0">{formatBytes(file.size)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-black">
          <Button variant="danger" icon={X} onClick={handleReject}>
            Decline
          </Button>
          <Button variant="primary" icon={Check} onClick={handleAccept}>
            Accept & Receive
          </Button>
        </div>
      </div>
    </Modal>
  );
}
