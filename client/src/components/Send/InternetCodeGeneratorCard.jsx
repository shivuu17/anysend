import React, { useState, useEffect } from 'react';
import { Card } from '../Common/Card.jsx';
import { Button } from '../Common/Button.jsx';
import { ProgressBar } from '../Common/ProgressBar.jsx';
import { Badge } from '../Common/Badge.jsx';
import { Globe, Copy, Check, RefreshCw, X, Radio, ArrowUpCircle } from 'lucide-react';
import { formatBytes, formatSpeed, formatEta } from '../../utils/formatters.js';
import { FileChunker } from '../../services/fileChunker.js';
import { useSocket } from '../../context/SocketContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import api from '../../services/api.js';

export function InternetCodeGeneratorCard({ selectedFiles, onReset }) {
  const [relayData, setRelayData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState('generating'); // generating, waiting, uploading, completed, failed
  const [progressData, setProgressData] = useState({
    percent: 0,
    bytesTransferred: 0,
    totalBytes: 0,
    speed: 0,
    eta: 0
  });
  const [error, setError] = useState(null);

  const { socket } = useSocket();
  const { settings } = useSettings();

  const generateCode = async () => {
    try {
      setLoading(true);
      setError(null);
      setStatus('generating');

      const fileMetaList = selectedFiles.map((file, idx) => ({
        id: `relay_file_${idx}_${Date.now()}`,
        name: file.name,
        size: file.size,
        type: file.type,
        totalChunks: Math.ceil(file.size / (4 * 1024 * 1024))
      }));

      const res = await api.post('/relay/create', {
        files: fileMetaList,
        senderDevice: settings.deviceName || 'Internet Sender',
        socketId: socket ? socket.id : null
      });

      if (res.data.success) {
        setRelayData(res.data);
        setStatus('waiting');
      } else {
        setError(res.data.error || 'Failed to generate relay code');
        setStatus('failed');
      }
    } catch (err) {
      console.error('Error creating relay code:', err);
      setError(err.message);
      setStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateCode();
  }, []);

  // Listen for socket pairing event
  useEffect(() => {
    if (!socket || !relayData) return;

    const code = relayData.code;

    const handlePaired = (data) => {
      console.log('Relay code paired with receiver:', data);
      startRelayUpload(code, relayData.session.files);
    };

    const handleProgress = (data) => {
      setProgressData(prev => ({ ...prev, percent: data.percent }));
    };

    socket.on(`relay:${code}:paired`, handlePaired);
    socket.on(`relay:${code}:progress`, handleProgress);

    return () => {
      socket.off(`relay:${code}:paired`, handlePaired);
      socket.off(`relay:${code}:progress`, handleProgress);
    };
  }, [socket, relayData]);

  const startRelayUpload = async (code, fileMetaList) => {
    setStatus('uploading');
    let grandTotalBytes = selectedFiles.reduce((acc, f) => acc + f.size, 0);
    let totalTransferred = 0;

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const rawFile = selectedFiles[i];
        const meta = fileMetaList[i] || {
          id: `relay_file_${i}`,
          name: rawFile.name,
          size: rawFile.size
        };

        await FileChunker.uploadFile({
          transferId: code,
          fileObj: rawFile,
          fileMeta: meta,
          targetHostUrl: null, // Uses default API base URL
          onProgress: (p) => {
            const currentTotal = totalTransferred + p.bytesTransferred;
            const percent = Math.min(100, Math.round((currentTotal / grandTotalBytes) * 100));

            setProgressData({
              percent,
              bytesTransferred: currentTotal,
              totalBytes: grandTotalBytes,
              speed: p.speed,
              eta: p.etaSeconds
            });
          }
        });

        totalTransferred += rawFile.size;
      }

      setStatus('completed');
    } catch (err) {
      console.error('Relay upload error:', err);
      setError(err.message);
      setStatus('failed');
    }
  };

  const copyCode = () => {
    if (relayData) {
      navigator.clipboard.writeText(relayData.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="bg-[#FFE600] border-3 border-black shadow-brutal-lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-6 h-6 text-black stroke-[3]" />
            <h3 className="text-xl font-black text-black uppercase tracking-tight">Internet 6-Digit Transfer Code</h3>
          </div>
          {status === 'waiting' && <Badge variant="info">Waiting Receiver...</Badge>}
          {status === 'uploading' && <Badge variant="info">Streaming...</Badge>}
          {status === 'completed' && <Badge variant="success">Transfer Complete!</Badge>}
          {status === 'failed' && <Badge variant="danger">Failed</Badge>}
        </div>

        {/* Display 6-Digit Code */}
        {status === 'waiting' && relayData && (
          <div className="text-center p-6 rounded-2xl bg-white border-3 border-black shadow-brutal space-y-4">
            <p className="text-xs font-black text-black uppercase tracking-wider">Share this 6-digit code with the receiver anywhere on the internet</p>
            
            <div className="text-4xl md:text-5xl font-black font-mono text-black tracking-widest py-2 bg-[#FAF7F0] border-2 border-black rounded-xl shadow-brutal-sm inline-block px-8">
              {relayData.formattedCode}
            </div>

            <div className="flex justify-center gap-3">
              <Button variant="secondary" size="sm" icon={copied ? Check : Copy} onClick={copyCode}>
                {copied ? 'Code Copied!' : 'Copy Code'}
              </Button>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-black pt-2">
              <Radio className="w-4 h-4 text-black animate-pulse stroke-[3]" />
              <span>Receiver can open LocalDrop on any network & enter code to connect!</span>
            </div>
          </div>
        )}

        {/* Progress Monitor */}
        {status === 'uploading' && (
          <div className="space-y-3 p-5 rounded-2xl bg-white border-3 border-black shadow-brutal">
            <div className="flex justify-between text-xs font-black text-black">
              <span className="flex items-center gap-2">
                <ArrowUpCircle className="w-4 h-4 stroke-[3] animate-bounce" />
                <span>Uploading Files via Relay...</span>
              </span>
              <span>{progressData.percent}%</span>
            </div>
            <ProgressBar percent={progressData.percent} status="transferring" />
            <div className="flex justify-between text-xs font-mono font-bold text-black">
              <span>Speed: {formatSpeed(progressData.speed)}</span>
              <span>{formatEta(progressData.eta)}</span>
            </div>
          </div>
        )}

        {/* Completed State */}
        {status === 'completed' && (
          <div className="p-5 rounded-2xl bg-white border-3 border-black shadow-brutal text-center space-y-3">
            <h4 className="text-lg font-black text-black uppercase">Files Sent Successfully!</h4>
            <p className="text-xs font-bold text-black">Receiver downloaded files over the internet code relay.</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-3.5 rounded-xl bg-[#FF6B99] border-2 border-black text-black text-xs font-black shadow-brutal-sm">
            {error}
          </div>
        )}

        {/* Reset */}
        <div className="flex justify-end pt-3 border-t-2 border-black">
          <Button variant="ghost" onClick={onReset}>
            Back to File Picker
          </Button>
        </div>
      </div>
    </Card>
  );
}
