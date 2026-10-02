import React, { useState } from 'react';
import { Modal } from '../Common/Modal.jsx';
import { Button } from '../Common/Button.jsx';
import { Server, ArrowRight } from 'lucide-react';

export function ManualConnectModal({ isOpen, onClose, onConnect }) {
  const [host, setHost] = useState('');
  const [port, setPort] = useState('5000');
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    const trimmedHost = host.trim();
    if (!trimmedHost) {
      setError('Please enter a valid IP address');
      return;
    }

    const payload = {
      host: trimmedHost,
      port: parseInt(port, 10) || 5000,
      sessionId: `manual_${Date.now()}`,
      token: null
    };

    onConnect(payload);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Connect via IP Address">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-xl bg-[#FF6B99] border-2 border-black font-black text-black text-xs shadow-brutal-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-black text-black uppercase tracking-wider mb-2">
            Receiver IP Address
          </label>
          <div className="relative">
            <Server className="w-5 h-5 text-black absolute left-3.5 top-3 stroke-[2.5]" />
            <input
              type="text"
              placeholder="e.g. 192.168.1.15"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              className="w-full bg-white border-2 border-black rounded-xl pl-11 pr-4 py-2.5 text-sm text-black font-mono font-extrabold focus:outline-none focus:ring-2 focus:ring-black shadow-brutal-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-black text-black uppercase tracking-wider mb-2">
            Port Number
          </label>
          <input
            type="number"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            className="w-full bg-white border-2 border-black rounded-xl px-4 py-2.5 text-sm text-black font-mono font-extrabold focus:outline-none focus:ring-2 focus:ring-black shadow-brutal-sm"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-black">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" icon={ArrowRight}>
            Connect Receiver
          </Button>
        </div>
      </form>
    </Modal>
  );
}
