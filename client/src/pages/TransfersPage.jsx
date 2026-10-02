import React from 'react';
import { Card } from '../components/Common/Card.jsx';
import { Button } from '../components/Common/Button.jsx';
import { Badge } from '../components/Common/Badge.jsx';
import { useTransfer } from '../context/TransferContext.jsx';
import { formatBytes, formatDate } from '../utils/formatters.js';
import { getApiBaseUrl } from '../utils/network.js';
import api from '../services/api.js';
import { Download, Trash2, FileText, Image, Video, Music } from 'lucide-react';

export function TransfersPage() {
  const { transferHistory, fetchHistory, loadingHistory } = useTransfer();

  const handleDelete = async (fileId) => {
    try {
      await api.delete(`/files/${fileId}`);
      fetchHistory();
    } catch (err) {
      console.error('Error deleting file:', err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'rejected':
        return <Badge variant="danger">Rejected</Badge>;
      case 'cancelled':
        return <Badge variant="warning">Cancelled</Badge>;
      case 'failed':
        return <Badge variant="danger">Failed</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const isImageFile = (name = '') => /\.(png|jpe?g|webp|gif|svg)$/i.test(name);
  const isVideoFile = (name = '') => /\.(mp4|webm|mov|mkv|avi)$/i.test(name);
  const isAudioFile = (name = '') => /\.(mp3|wav|ogg|aac|flac)$/i.test(name);

  const getFileIcon = (name = '') => {
    if (isImageFile(name)) return <Image className="w-4 h-4 stroke-[2.5]" />;
    if (isVideoFile(name)) return <Video className="w-4 h-4 stroke-[2.5]" />;
    if (isAudioFile(name)) return <Music className="w-4 h-4 stroke-[2.5]" />;
    return <FileText className="w-4 h-4 stroke-[2.5]" />;
  };

  const getSaveButtonText = (name = '') => {
    if (isImageFile(name)) return 'Save Photo';
    if (isVideoFile(name)) return 'Save Video';
    if (isAudioFile(name)) return 'Save Audio';
    return 'Save File';
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-black uppercase tracking-tight">Transfer Log & Saved Media</h2>
          <p className="text-xs font-bold text-slate-700 mt-1">
            Historical logs of received photos, videos, and documents with instant 1-click device saving.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={fetchHistory} loading={loadingHistory}>
          Refresh Log
        </Button>
      </div>

      <Card>
        {transferHistory.length === 0 ? (
          <div className="text-center py-12 font-bold text-slate-600 text-xs">
            No transfer records found in history.
          </div>
        ) : (
          <div className="space-y-4">
            {transferHistory.map((transfer) => (
              <div
                key={transfer.id}
                className="p-4 rounded-xl bg-white border-2 border-black shadow-brutal-sm space-y-3"
              >
                {/* Transfer Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-black pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-black uppercase">
                      From: {transfer.senderDevice || 'Nearby Device'}
                    </span>
                    <span className="text-xs text-slate-600 font-mono font-bold">• {formatDate(transfer.createdAt)}</span>
                  </div>
                  {getStatusBadge(transfer.status)}
                </div>

                {/* File Items in Transfer */}
                <div className="space-y-2">
                  {transfer.files?.map((file, idx) => {
                    const downloadUrl = `${getApiBaseUrl()}/api/files/download/${file.storedName || file.id}`;

                    return (
                      <div
                        key={idx}
                        className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#FAF7F0] border-2 border-black text-xs font-extrabold"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-9 h-9 rounded-lg bg-[#FFE600] border-2 border-black flex items-center justify-center text-black shrink-0 shadow-brutal-sm">
                            {getFileIcon(file.name)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-black text-black truncate">{file.name}</p>
                            <div className="flex items-center gap-3 text-[11px] text-slate-700 font-mono mt-0.5">
                              <span>{formatBytes(file.size)}</span>
                              {file.verifiedHash && (
                                <span className="text-slate-600 truncate max-w-xs" title={`SHA-256: ${file.verifiedHash}`}>
                                  SHA-256: {file.verifiedHash.substring(0, 12)}...
                                </span>
                              )}
                            </div>

                            {/* Inline Media Preview Thumbnail if Image or Video */}
                            {transfer.status === 'completed' && file.storedName && isImageFile(file.name) && (
                              <div className="mt-2">
                                <img
                                  src={downloadUrl}
                                  alt={file.name}
                                  className="w-20 h-20 object-cover rounded-lg border-2 border-black shadow-brutal-sm"
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Download & Save Media Actions */}
                        <div className="flex items-center gap-2">
                          {transfer.status === 'completed' && file.storedName && (
                            <a
                              href={downloadUrl}
                              download={file.name}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <Button variant="primary" size="sm" icon={Download}>
                                {getSaveButtonText(file.name)}
                              </Button>
                            </a>
                          )}

                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(file.id || file.storedName)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
