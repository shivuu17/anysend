import React, { useState, useEffect } from 'react';
import { Modal } from './Modal.jsx';
import { Button } from './Button.jsx';
import { ShieldCheck, Image, Video, Download, CheckCircle2, Lock } from 'lucide-react';

export function StoragePermissionModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    const hasPermission = localStorage.getItem('anysend_storage_permission');
    if (!hasPermission) {
      // Small delay on app load so user sees splash screen first
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1200);
      return () => clearTimeout(timer);
    } else if (hasPermission === 'granted') {
      setGranted(true);
    }
  }, []);

  const handleGrantPermission = () => {
    localStorage.setItem('anysend_storage_permission', 'granted');
    setGranted(true);
    setIsOpen(false);
  };

  const handleSkip = () => {
    localStorage.setItem('anysend_storage_permission', 'declined');
    setIsOpen(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleSkip}
      title="Storage & Gallery Permission"
      maxWidth="max-w-md"
    >
      <div className="space-y-5">
        {/* Header Icon Card */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-[#00F0FF] border-3 border-black shadow-brutal-sm">
          <div className="w-12 h-12 rounded-xl bg-white border-2 border-black flex items-center justify-center text-black shrink-0 shadow-brutal-sm">
            <ShieldCheck className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <h4 className="font-black text-base text-black uppercase tracking-tight">Direct Gallery Downloads</h4>
            <p className="text-xs font-bold text-slate-900 mt-0.5">
              iPhone & Android Native Storage Access
            </p>
          </div>
        </div>

        {/* Feature Permissions List */}
        <div className="space-y-3">
          <p className="text-xs font-extrabold text-black leading-relaxed">
            AnySend requires your permission to safely download received photos, videos, and media files directly into your device's native <strong>Photos Gallery</strong> / <strong>Camera Roll</strong>.
          </p>

          <div className="p-3.5 rounded-xl bg-[#FAF7F0] border-2 border-black space-y-2 text-xs font-black">
            <div className="flex items-center gap-2.5 text-black">
              <Image className="w-4 h-4 text-black stroke-[2.5]" />
              <span>Direct Photo Gallery Save (.jpg, .png, .webp)</span>
            </div>
            <div className="flex items-center gap-2.5 text-black">
              <Video className="w-4 h-4 text-black stroke-[2.5]" />
              <span>Direct Camera Roll Save (.mp4, .mov, .webm)</span>
            </div>
            <div className="flex items-center gap-2.5 text-black">
              <Lock className="w-4 h-4 text-black stroke-[2.5]" />
              <span>Private SHA-256 Verified Storage Security</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3 border-t-2 border-black">
          <Button variant="ghost" size="sm" onClick={handleSkip} className="w-full sm:w-auto">
            Skip for Now
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={CheckCircle2}
            onClick={handleGrantPermission}
            className="w-full sm:w-auto"
          >
            Allow Gallery Access
          </Button>
        </div>
      </div>
    </Modal>
  );
}
