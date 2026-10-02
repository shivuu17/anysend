import React, { useState } from 'react';
import { Modal } from './Modal.jsx';
import { Button } from './Button.jsx';
import { FolderDown, Image, Video, FileText, Share2, Eye, Sparkles } from 'lucide-react';
import { saveToGallery } from '../../utils/gallerySaver.js';
import { formatBytes } from '../../utils/formatters.js';

export function SaveMediaModal({ isOpen, onClose, fileData }) {
  const [loadingShare, setLoadingShare] = useState(false);

  if (!fileData) return null;

  const { name, downloadUrl, type, size } = fileData;

  const isImage = /\.(png|jpe?g|webp|gif|svg)$/i.test(name) || (type && type.startsWith('image/'));
  const isVideo = /\.(mp4|webm|mov|mkv|avi)$/i.test(name) || (type && type.startsWith('video/'));

  // Option 1: Direct File Download to Phone File Manager / Downloads Folder
  const handleDirectDownload = () => {
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = name;
    link.target = '_self';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
    }, 500);
    onClose();
  };

  // Option 2: Save Photo / Video to Native Photos Gallery
  const handleSaveToGallery = async () => {
    try {
      setLoadingShare(true);
      const res = await saveToGallery(downloadUrl, name, type);
      if (!res || !res.success || res.method !== 'native_share') {
        // Fallback for Photo Gallery: open image in preview tab so user can long-press "Save Image" / "Add to Photos"
        window.open(downloadUrl, '_blank');
      }
    } catch (err) {
      window.open(downloadUrl, '_blank');
    } finally {
      setLoadingShare(false);
      onClose();
    }
  };

  // Option 3: View Full Media in New Tab (Long-Press to Save Image directly)
  const handleOpenNewTab = () => {
    window.open(downloadUrl, '_blank');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Save & Download Options"
      maxWidth="max-w-lg"
    >
      <div className="space-y-5">
        {/* File Details Banner */}
        <div className="flex items-center gap-3.5 p-4 rounded-xl bg-[#FFE600] border-3 border-black shadow-brutal-sm">
          <div className="w-12 h-12 rounded-xl bg-white border-2 border-black flex items-center justify-center text-black shrink-0 shadow-brutal-sm">
            {isImage ? <Image className="w-6 h-6 stroke-[2.5]" /> : isVideo ? <Video className="w-6 h-6 stroke-[2.5]" /> : <FileText className="w-6 h-6 stroke-[2.5]" />}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-black text-sm text-black uppercase truncate">{name}</h4>
            <p className="text-xs font-bold text-black mt-0.5">
              Size: {formatBytes(size || 0)}
            </p>
          </div>
        </div>

        {/* Thumbnail Preview for Images */}
        {isImage && downloadUrl && (
          <div className="flex justify-center p-2 rounded-xl bg-[#FAF7F0] border-2 border-black">
            <img
              src={downloadUrl}
              alt={name}
              className="max-h-40 object-contain rounded-lg border-2 border-black shadow-brutal-sm"
            />
          </div>
        )}

        {/* Action Choice Grid */}
        <div className="space-y-3">
          <p className="text-xs font-black uppercase text-black tracking-wider">Choose Download Destination:</p>

          {/* Option 1: Direct File Manager Download */}
          <button
            type="button"
            onClick={handleDirectDownload}
            className="w-full flex items-start gap-3.5 p-4 rounded-xl bg-[#A3E635] border-3 border-black shadow-brutal hover:-translate-y-0.5 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-white border-2 border-black flex items-center justify-center text-black shrink-0 shadow-brutal-sm group-hover:scale-105 transition-transform">
              <FolderDown className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="flex-1">
              <div className="font-black text-sm uppercase text-black flex items-center gap-2">
                <span>📁 Download to Device File Manager</span>
              </div>
              <p className="text-xs font-bold text-slate-900 mt-0.5">
                Saves directly into Android Downloads / iPhone Files app folder.
              </p>
            </div>
          </button>

          {/* Option 2: Save to Photo Gallery */}
          {(isImage || isVideo) && (
            <button
              type="button"
              onClick={handleSaveToGallery}
              disabled={loadingShare}
              className="w-full flex items-start gap-3.5 p-4 rounded-xl bg-[#00F0FF] border-3 border-black shadow-brutal hover:-translate-y-0.5 transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-white border-2 border-black flex items-center justify-center text-black shrink-0 shadow-brutal-sm group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="flex-1">
                <div className="font-black text-sm uppercase text-black flex items-center gap-2">
                  <span>🖼️ Save Photo / Video to Gallery</span>
                </div>
                <p className="text-xs font-bold text-slate-900 mt-0.5">
                  Save to Camera Roll via long-press "Save Image" or native share.
                </p>
              </div>
            </button>
          )}

          {/* Option 3: Share to Apps */}
          <button
            type="button"
            onClick={handleSaveToGallery}
            className="w-full flex items-start gap-3.5 p-3.5 rounded-xl bg-white border-2 border-black shadow-brutal-sm hover:bg-slate-50 transition-all text-left group"
          >
            <div className="w-9 h-9 rounded-lg bg-[#FAF7F0] border-2 border-black flex items-center justify-center text-black shrink-0 shadow-brutal-sm">
              <Share2 className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="flex-1">
              <div className="font-extrabold text-xs uppercase text-black">
                <span>📤 Share File to Apps</span>
              </div>
              <p className="text-[11px] font-bold text-slate-700 mt-0.5">
                Send file directly to WhatsApp, Drive, Gmail, or Bluetooth.
              </p>
            </div>
          </button>
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
