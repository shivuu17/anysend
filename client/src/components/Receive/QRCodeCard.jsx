import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card } from '../Common/Card.jsx';
import { Button } from '../Common/Button.jsx';
import { ProgressBar } from '../Common/ProgressBar.jsx';
import { Badge } from '../Common/Badge.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { useSocket } from '../../context/SocketContext.jsx';
import { formatBytes } from '../../utils/formatters.js';
import { getApiBaseUrl } from '../../utils/network.js';
import api from '../../services/api.js';
import { RefreshCw, Copy, Check, ShieldCheck, ArrowDownCircle, Download, CheckCircle2, Zap, FileText, Image, Video } from 'lucide-react';

export function QRCodeCard() {
  const { deviceInfo } = useSettings();
  const { socket } = useSocket();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [transferState, setTransferState] = useState({
    status: 'waiting', // waiting, paired, receiving, completed, failed
    percent: 0,
    bytesTransferred: 0,
    totalBytes: 0,
    files: [],
    finalFile: null,
    error: null
  });

  const createSession = async () => {
    try {
      setLoading(true);
      setTransferState({
        status: 'waiting',
        percent: 0,
        bytesTransferred: 0,
        totalBytes: 0,
        files: [],
        finalFile: null,
        error: null
      });

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

  // Listen for QR code scan/pairing and file transfer events
  useEffect(() => {
    if (!socket || !session?.code) return;

    const code = session.code;

    const handlePaired = (data) => {
      console.log('QR Code scanned & paired:', data);
      setTransferState(prev => ({
        ...prev,
        status: 'paired',
        files: data.session?.files || []
      }));
    };

    const handleProgress = (data) => {
      setTransferState(prev => ({
        ...prev,
        status: 'receiving',
        percent: data.percent || 0,
        bytesTransferred: data.bytesTransferred || 0,
        totalBytes: data.totalBytes || 0
      }));
    };

    const handleCompleted = (data) => {
      console.log('QR Transfer completed:', data);
      setTransferState(prev => ({
        ...prev,
        status: 'completed',
        percent: 100,
        finalFile: data.finalizedFile
      }));
    };

    const handleFailed = (data) => {
      setTransferState(prev => ({
        ...prev,
        status: 'failed',
        error: data.error || 'Transfer failed'
      }));
    };

    socket.on(`relay:${code}:paired`, handlePaired);
    socket.on(`relay:${code}:progress`, handleProgress);
    socket.on(`relay:${code}:completed`, handleCompleted);
    socket.on(`relay:${code}:failed`, handleFailed);

    return () => {
      socket.off(`relay:${code}:paired`, handlePaired);
      socket.off(`relay:${code}:progress`, handleProgress);
      socket.off(`relay:${code}:completed`, handleCompleted);
      socket.off(`relay:${code}:failed`, handleFailed);
    };
  }, [socket, session?.code]);

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

  const isImageFile = (name = '') => /\.(png|jpe?g|webp|gif|svg)$/i.test(name);
  const isVideoFile = (name = '') => /\.(mp4|webm|mov|mkv|avi)$/i.test(name);

  const getSaveButtonText = (name = '') => {
    if (isImageFile(name)) return 'Save Photo';
    if (isVideoFile(name)) return 'Save Video';
    return 'Save File';
  };

  // If QR code has been scanned, automatically render the File Transfer Page!
  if (transferState.status === 'paired' || transferState.status === 'receiving' || transferState.status === 'completed') {
    const isFinished = transferState.status === 'completed';
    const downloadUrl = transferState.finalFile ? `${getApiBaseUrl()}/api/files/download/${transferState.finalFile.filename}` : `${getApiBaseUrl()}/api/relay/${session?.code}/download`;

    return (
      <Card className="bg-[#00F0FF] border-3 border-black shadow-brutal-lg">
        <div className="space-y-6">
          {/* Transfer Page Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isFinished ? (
                <CheckCircle2 className="w-8 h-8 text-black stroke-[3]" />
              ) : (
                <Zap className="w-8 h-8 text-black animate-bounce stroke-[3]" />
              )}
              <div>
                <h3 className="text-xl font-black uppercase text-black tracking-tight">
                  {isFinished ? 'QR File Transfer Completed!' : 'QR Scanned — Receiving Files...'}
                </h3>
                <p className="text-xs font-bold text-black">
                  {formatBytes(transferState.bytesTransferred)} / {formatBytes(transferState.totalBytes)} ({transferState.percent}%)
                </p>
              </div>
            </div>
            <Badge variant={isFinished ? 'success' : 'info'}>
              {isFinished ? 'Completed' : 'Streaming...'}
            </Badge>
          </div>

          {/* Active File Streaming Progress Bar */}
          <div className="space-y-3 p-4 rounded-xl bg-white border-2 border-black shadow-brutal-sm">
            {!isFinished && (
              <div className="flex items-center gap-2 text-xs font-black text-black">
                <RefreshCw className="w-4 h-4 animate-spin text-black stroke-[3]" />
                <span>Sender scanned QR code — receiving binary file stream...</span>
              </div>
            )}
            
            <ProgressBar percent={transferState.percent} status={isFinished ? 'completed' : 'transferring'} />
            
            <div className="flex justify-between text-xs font-mono font-bold text-black pt-1">
              <span>Status: {isFinished ? '100% Downloaded' : 'Receiving Chunks...'}</span>
              <span>{transferState.percent}%</span>
            </div>
          </div>

          {/* Download & Save File Action Prompt upon completion */}
          {isFinished && (
            <div className="p-4 rounded-xl bg-white border-2 border-black shadow-brutal-sm text-center space-y-3">
              <h4 className="text-base font-black text-black uppercase">File Available for Instant Download</h4>
              
              {/* Thumbnail Preview for Images */}
              {transferState.finalFile && isImageFile(transferState.finalFile.filename) && (
                <div className="flex justify-center">
                  <img
                    src={downloadUrl}
                    alt="Received Photo"
                    className="w-28 h-28 object-cover rounded-xl border-2 border-black shadow-brutal-sm"
                  />
                </div>
              )}

              <div className="flex justify-center gap-3 pt-1">
                <a href={downloadUrl} download={transferState.finalFile?.filename || 'received_file'} target="_blank" rel="noreferrer">
                  <Button variant="primary" size="lg" icon={Download}>
                    {getSaveButtonText(transferState.finalFile?.filename || '')}
                  </Button>
                </a>
              </div>
            </div>
          )}

          {/* New QR Code Action Button */}
          <div className="flex justify-end pt-2 border-t-2 border-black">
            <Button variant="ghost" icon={RefreshCw} onClick={createSession}>
              Scan / Generate New QR Code
            </Button>
          </div>
        </div>
      </Card>
    );
  }

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
