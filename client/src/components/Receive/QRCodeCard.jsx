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
      const res = await api.post('/session/create');
      if (res.data.success) {
        setSession(res.data.session);
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
    version: session.version,
    host: session.host || deviceInfo.ip,
    port: session.port || deviceInfo.port,
    sessionId: session.sessionId,
    token: session.token,
    expiresAt: session.expiresAt
  }) : '';

  const copyAddress = () => {
    const address = `http://${session?.host || deviceInfo.ip}:${session?.port || deviceInfo.port}`;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="text-center bg-white border-3 border-black shadow-brutal-lg">
      <div className="flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#00F0FF] border-2 border-black text-xs font-black uppercase tracking-wider mb-3 shadow-brutal-sm">
          <ShieldCheck className="w-4 h-4 stroke-[3]" />
          <span>Secure Device Pairing</span>
        </div>

        <h3 className="text-2xl font-black text-black uppercase tracking-tight mb-1">
          Scan QR Code To Send
        </h3>
        <p className="text-xs font-bold text-slate-700 max-w-sm mb-6">
          Open AnySend on another device (iPhone, Android, PC) and scan this payload to initiate transfer.
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

        {/* Host details */}
        <div className="w-full max-w-xs space-y-2 mb-6 text-xs font-black">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#FAF7F0] border-2 border-black shadow-brutal-sm">
            <span className="text-slate-700 uppercase">Local IP:</span>
            <span className="font-mono text-black font-extrabold">{session?.host || deviceInfo.ip}</span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#FAF7F0] border-2 border-black shadow-brutal-sm">
            <span className="text-slate-700 uppercase">Server Port:</span>
            <span className="font-mono text-black font-extrabold">{session?.port || deviceInfo.port}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" icon={copied ? Check : Copy} onClick={copyAddress}>
            {copied ? 'Copied URL!' : 'Copy IP Address'}
          </Button>

          <Button variant="secondary" size="sm" icon={RefreshCw} loading={loading} onClick={createSession}>
            New Session
          </Button>
        </div>
      </div>
    </Card>
  );
}
