import React, { useState } from 'react';
import { Modal } from './Modal.jsx';
import { Button } from './Button.jsx';
import { Smartphone, FolderDown, ExternalLink, Image, Video, FileText, Check } from 'lucide-react';
import { saveToGallery } from '../../utils/gallerySaver.js';
import { formatBytes } from '../../utils/formatters.js';

export function SaveMediaModal({ isOpen, onClose, fileData }) {
  const [loadingShare, setLoadingShare] = useState(false);
  const [loadingDownload, setLoadingDownload] = useState(false);

  if (!fileData) return null;

  const { name, downloadUrl, type, size } = fileData;

  const isImage = /\.(png|jpe?g|webp|gif|svg)$/i.test(name) || (type && type.startsWith('image/'));
  const isVideo = /\.(mp4|webm|mov|mkv|avi)$/i.test(name) || (type && type.startsWith('video/'));

  // Option 1: Share to Photos Gallery / Apps
  const handleShareToGallery = async () => {
    try {
      setLoadingShare(true);
      await saveToGallery(downloadUrl, name, type);
    } catch (err) {
      console.error('Share to gallery error:', err);
    } finally {
      setLoadingShare(false);
      onClose();
    }
  };

  // Option 2: Direct File Download
  const handleDirectDownload = async () => {
    try {
      setLoadingDownload(true);
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = blobUrl;
      a.download = name;
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
      }, 1000);
    } catch (err) {
      console.error('Direct download error:', err);
      window.open(downloadUrl, '_blank');
    } finally {
      setLoadingDownload(false);
      onClose();
    }
  };

  // Option 3: View full media in new tab for long-press saving
  const handleOpenNewTab = () => {
    window.open(downloadUrl, '_blank');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Save File Options"
      maxWidth="max-w-lg"
    >
      <div className="space-y-5">
        {/* File Card Banner */}
        <div className="flex items-center gap-3.5 p-4 rounded-xl bg-[#FFE600] border-3 border-black shadow-brutal-sm">
          <div className="w-12 h-12 rounded-xl bg-white border-2 border-black flex items-center justify-center text-black shrink-0 shadow-brutal-sm">
            {isImage ? <Image className="w-6 h-6 stroke-[2.5]" /> : isVideo ? <Video className="w-6 h-6 stroke-[2.5]" /> : <FileText className="w-6 h-6 stroke-[2.5]" />}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-black text-sm text-black uppercase truncate">{name}</h4>
            <p className="text-xs font-bold text-black mt-0.5">
              Payload Size: {formatBytes(size || 0)}
            </p>
          </div>
        </div>

        {/* Thumbnail Preview if Image */}
        {isImage && downloadUrl && (
          <div className="flex justify-center p-2 rounded-xl bg-[#FAF7F0] border-2 border-black">
            <img
              src={downloadUrl}
              alt={name}
              className="max-h-40 object-contain rounded-lg border-2 border-black shadow-brutal-sm"
            />
          </div>
        )}

        {/* Options Grid */}
        <div className="space-y-3">
          <p className="text-xs font-black uppercase text-black tracking-wider">Select Save Destination:</p>

          {/* Option 1: Share / Save to Gallery */}
          <button
            type="button"
            onClick={handleShareToGallery}
            disabled={loadingShare}
            className="w-full flex items-start gap-3.5 p-4 rounded-xl bg-[#00F0FF] border-3 border-black shadow-brutal hover:-translate-y-0.5 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-white border-2 border-black flex items-center justify-center text-black shrink-0 shadow-brutal-sm group-hover:scale-105 transition-transform">
              <Smartphone className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="flex-1">
              <div className="font-black text-sm uppercase text-black flex items-center gap-2">
                <span>📱 Save to Photos / Gallery</span>
              </div>
              <p className="text-xs font-bold text-slate-900 mt-0.5">
                Opens native iPhone / Android share menu to save to Camera Roll or share to apps.
              </p>
            </div>
          </button>

          {/* Option 2: Direct File Download */}
          <button
            type="button"
            onClick={handleDirectDownload}
            disabled={loadingDownload}
            className="w-full flex items-start gap-3.5 p-4 rounded-xl bg-[#A3E635] border-3 border-black shadow-brutal hover:-translate-y-0.5 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-white border-2 border-black flex items-center justify-center text-black shrink-0 shadow-brutal-sm group-hover:scale-105 transition-transform">
              <FolderDown className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="flex-1">
              <div className="font-black text-sm uppercase text-black flex items-center gap-2">
                <span>📁 Save to Files / Downloads</span>
              </div>
              <p className="text-xs font-bold text-slate-900 mt-0.5">
                Downloads file directly to device storage / Files folder.
              </p>
            </div>
          </button>

          {/* Option 3: View Full Image in New Tab (Long Press) */}
          {(isImage || isVideo) && (
            <button
              type="button"
              onClick={handleOpenNewTab}
              className="w-full flex items-start gap-3.5 p-3.5 rounded-xl bg-white border-2 border-black shadow-brutal-sm hover:bg-slate-50 transition-all text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-[#FAF7F0] border-2 border-black flex items-center justify-center text-black shrink-0 shadow-brutal-sm">
                <ExternalLink className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="flex-1">
                <div className="font-extrabold text-xs uppercase text-black">
                  <span>👁️ Open Full Media (Long-Press "Add to Photos")</span>
                </div>
                <p className="text-[11px] font-bold text-slate-700 mt-0.5">
                  Opens full resolution image in browser for native long-press photo saving.
                </p>
              </div>
            </button>
          )}
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-2 border-t-2 border-black">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
