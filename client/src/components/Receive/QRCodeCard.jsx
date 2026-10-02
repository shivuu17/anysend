import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card } from '../Common/Card.jsx';
import { Button } from '../Common/Button.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import api from '../../services/api.js';
import { RefreshCw, Copy, Check, ShieldCheck } from 'lucide-react';

export function QRCodeCard() {
  const { deviceInfo } = useSettings();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const createSession = async () => {
    try {
      setLoading(true);
      const res = await api.post('/relay/create', {
        files: [{ id: 'qr_pair', name: 'Universal QR Pair', size: 0 }],
        senderDevice: deviceInfo.deviceName || 'AnySend Receiver'
      });
      if (res.data.success) {
        setSession(res.data);
      }
    } catch (err) {
      console.error('Error creating QR session:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    createSession();
  }, []);

  const qrPayloadString = session ? JSON.stringify({
    code: session.code,
    formattedCode: session.formattedCode,
    hostUrl: getApiBaseUrl()
  }) : '';

  const copyCode = () => {
    if (session?.code) {
      navigator.clipboard.writeText(session.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="text-center bg-white border-3 border-black shadow-brutal-lg">
      <div className="flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#00F0FF] border-2 border-black text-xs font-black uppercase tracking-wider mb-3 shadow-brutal-sm">
          <ShieldCheck className="w-4 h-4 stroke-[3]" />
          <span>Universal Cross-Network QR Code</span>
        </div>

        <h3 className="text-2xl font-black text-black uppercase tracking-tight mb-1">
          Scan QR Code To Send
        </h3>
        <p className="text-xs font-bold text-slate-700 max-w-sm mb-6">
          Works across <strong>any network or mobile data (no same Wi-Fi required)</strong>. Point camera to connect instantly.
        </p>

        {/* QR Code Frame */}
        <div className="p-5 rounded-2xl bg-[#FFE600] border-3 border-black shadow-brutal mb-6">
          <div className="p-3 bg-white border-2 border-black rounded-xl shadow-brutal-sm">
            {session ? (
              <QRCodeSVG
                value={qrPayloadString}
                size={200}
                bgColor="#ffffff"
                fgColor="#000000"
                level="H"
                includeMargin={false}
              />
            ) : (
              <div className="w-[200px] h-[200px] flex items-center justify-center bg-white rounded-lg">
                <RefreshCw className="w-8 h-8 animate-spin text-black stroke-[3]" />
              </div>
            )}
          </div>
        </div>

        {/* 6-Digit Code Display */}
        {session && (
          <div className="w-full max-w-xs p-3.5 rounded-xl bg-[#FAF7F0] border-2 border-black shadow-brutal-sm mb-6 space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-700">Internet Pairing Code:</span>
            <p className="font-mono font-black text-2xl text-black tracking-widest">{session.formattedCode}</p>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" icon={copied ? Check : Copy} onClick={copyCode}>
            {copied ? 'Code Copied!' : 'Copy Pairing Code'}
          </Button>

          <Button variant="secondary" size="sm" icon={RefreshCw} loading={loading} onClick={createSession}>
            New QR Code
          </Button>
        </div>
      </div>
    </Card>
  );
}
