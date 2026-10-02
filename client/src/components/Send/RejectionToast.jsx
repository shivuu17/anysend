import React from 'react';
import { useTransfer } from '../../context/TransferContext.jsx';
import { XCircle, X } from 'lucide-react';

export function RejectionToast() {
  const { sendingState, resetSendingState } = useTransfer();

  if (sendingState.status !== 'rejected') return null;

  return (
    <div className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-50 max-w-md w-full animate-bounce-short">
      <div className="p-4 rounded-2xl bg-[#FF6B99] border-3 border-black text-black shadow-brutal-lg flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-white border-2 border-black flex items-center justify-center text-black shrink-0 shadow-brutal-sm">
          <XCircle className="w-6 h-6 stroke-[3]" />
        </div>
        <div className="flex-1 min-w-0 pr-2">
          <h4 className="font-black text-sm uppercase tracking-tight text-black">Transfer Request Declined</h4>
          <p className="text-xs font-extrabold text-black mt-0.5 leading-snug">
            {sendingState.error || 'Receiver declined the approval.'}
          </p>
        </div>
        <button
          onClick={resetSendingState}
          className="p-1.5 rounded-lg hover:bg-black/10 text-black border-2 border-transparent hover:border-black transition-all"
          title="Dismiss notification"
        >
          <X className="w-5 h-5 stroke-[3]" />
        </button>
      </div>
    </div>
  );
}
