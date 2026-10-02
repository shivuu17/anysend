import React, { useState, useEffect } from 'react';
import { Card } from '../Common/Card.jsx';
import { Button } from '../Common/Button.jsx';
import { ProgressBar } from '../Common/ProgressBar.jsx';
import { Badge } from '../Common/Badge.jsx';
import { Globe, ArrowRight, Download, CheckCircle2, FileText, RefreshCw } from 'lucide-react';
import { formatBytes, formatSpeed } from '../../utils/formatters.js';
import { getApiBaseUrl } from '../../utils/network.js';
import { useSocket } from '../../context/SocketContext.jsx';
import api from '../../services/api.js';

export function InternetCodeInputCard() {
  const [inputCode, setInputCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, looking_up, paired, downloading, completed, failed
  const [progressPercent, setProgressPercent] = useState(0);
  const [error, setError] = useState(null);

  const { socket } = useSocket();

  const handleLookup = async (e) => {
    e.preventDefault();
    const cleanCode = inputCode.replace(/[^0-9]/g, '');

    if (cleanCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setStatus('looking_up');

      const res = await api.post('/relay/lookup', { code: cleanCode });
      if (res.data.success) {
        setSessionInfo(res.data);
        await api.post('/relay/pair', { code: cleanCode, socketId: socket ? socket.id : null });
        setStatus('paired');
      } else {
        setError(res.data.error || 'Invalid 6-digit code');
        setStatus('failed');
      }
    } catch (err) {
      console.error('Relay lookup error:', err);
      setError(err.response?.data?.error || err.message || 'Code not found or expired');
      setStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!socket || !sessionInfo) return;

    const code = sessionInfo.code;

    const handleProgress = (data) => {
      setStatus('downloading');
      setProgressPercent(data.percent);
    };

    const handleCompleted = () => {
      setStatus('completed');
      setProgressPercent(100);
    };

    const handleFailed = (data) => {
      setError(data.error || 'Transfer failed');
      setStatus('failed');
    };

    socket.on(`relay:${code}:progress`, handleProgress);
    socket.on(`relay:${code}:completed`, handleCompleted);
    socket.on(`relay:${code}:failed`, handleFailed);

    return () => {
      socket.off(`relay:${code}:progress`, handleProgress);
      socket.off(`relay:${code}:completed`, handleCompleted);
      socket.off(`relay:${code}:failed`, handleFailed);
    };
  }, [socket, sessionInfo]);

  const handleReset = () => {
    setInputCode('');
    setSessionInfo(null);
    setStatus('idle');
    setProgressPercent(0);
    setError(null);
  };

  return (
    <Card className="bg-[#00F0FF] border-3 border-black shadow-brutal-lg p-4 sm:p-6">
      <div className="space-y-4 sm:space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-black stroke-[3]" />
            <h3 className="text-lg sm:text-xl font-black text-black uppercase tracking-tight">Receive via 6-Digit Code</h3>
          </div>
          {status === 'paired' && <Badge variant="info">Connected!</Badge>}
          {status === 'downloading' && <Badge variant="info font-bold">Receiving Stream...</Badge>}
          {status === 'completed' && <Badge variant="success">Completed!</Badge>}
        </div>

        {status === 'idle' && (
          <form onSubmit={handleLookup} className="space-y-4">
            <p className="text-xs font-bold text-black">
              Enter the 6-digit transfer code generated on the sender device (no Wi-Fi connection required).
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                maxLength="7"
                placeholder="e.g. 489-102"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                className="w-full sm:flex-1 bg-white border-3 border-black rounded-xl px-4 py-3 text-xl sm:text-2xl font-black font-mono tracking-widest text-black focus:outline-none focus:ring-4 focus:ring-black/20 shadow-brutal-sm text-center sm:text-left"
              />
              <Button type="submit" variant="primary" size="lg" icon={ArrowRight} loading={loading} className="w-full sm:w-auto">
                Connect
              </Button>
            </div>
          </form>
        )}

        {/* Paired & Payload Preview */}
        {sessionInfo && (status === 'paired' || status === 'downloading') && (
          <div className="p-4 sm:p-5 rounded-2xl bg-white border-3 border-black shadow-brutal space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-black pb-3">
              <div>
                <h4 className="font-black text-black uppercase text-sm">
                  From: {sessionInfo.senderDevice}
                </h4>
                <p className="text-xs font-bold text-slate-700">
                  {sessionInfo.files?.length || 1} file(s) ({formatBytes(sessionInfo.totalBytes)})
                </p>
              </div>
              <Badge variant="info">Code: {sessionInfo.formattedCode}</Badge>
            </div>

            {/* File List Preview */}
            <div className="space-y-2">
              {sessionInfo.files?.map((f, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F0] border-2 border-black text-xs font-bold">
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <FileText className="w-4 h-4 text-black stroke-[2.5] shrink-0" />
                    <span className="font-extrabold text-black truncate">{f.name}</span>
                  </div>
                  <span className="font-mono shrink-0">{formatBytes(f.size)}</span>
                </div>
              ))}
            </div>

            {/* Downloading Progress */}
            {status === 'downloading' && (
              <div className="space-y-2 pt-2">
                <ProgressBar percent={progressPercent} status="transferring" />
                <p className="text-xs font-mono font-bold text-black text-right">{progressPercent}% received</p>
              </div>
            )}
          </div>
        )}

        {/* Completed State with Download Link */}
        {status === 'completed' && sessionInfo && (
          <div className="p-5 rounded-2xl bg-white border-3 border-black shadow-brutal text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-black mx-auto stroke-[3]" />
            <h4 className="text-lg font-black uppercase text-black">File Download Ready!</h4>
            <p className="text-xs font-bold text-slate-800">
              The file payload has been received and verified via SHA-256.
            </p>

            <a
              href={`${getApiBaseUrl()}/api/relay/${sessionInfo.code}/download`}
              download={sessionInfo.files?.[0]?.name || 'download'}
              target="_self"
              className="inline-block w-full sm:w-auto"
            >
              <Button
                variant="primary"
                size="lg"
                icon={Download}
                className="w-full sm:w-auto"
              >
                Download Received File
              </Button>
            </a>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-3.5 rounded-xl bg-[#FF6B99] border-2 border-black text-black text-xs font-black shadow-brutal-sm">
            {error}
          </div>
        )}

        {/* Reset button */}
        {(status === 'completed' || status === 'failed') && (
          <div className="flex justify-end pt-2">
            <Button variant="ghost" size="sm" icon={RefreshCw} onClick={handleReset}>
              Enter Another Code
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
