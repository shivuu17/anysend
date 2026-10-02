import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Modal } from '../Common/Modal.jsx';
import { parseQrPayload } from '../../utils/network.js';
import { AlertCircle, Camera } from 'lucide-react';

export function QRScannerModal({ isOpen, onClose, onScanSuccess }) {
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef(null);
  const containerId = 'qr-reader-container';

  useEffect(() => {
    if (!isOpen) return;

    let html5QrcodeScanner = null;

    const startScanner = async () => {
      try {
        setError(null);
        html5QrcodeScanner = new Html5Qrcode(containerId);
        scannerRef.current = html5QrcodeScanner;

        await html5QrcodeScanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          (decodedText) => {
            const parsed = parseQrPayload(decodedText);
            if (parsed.valid) {
              if (html5QrcodeScanner.isScanning) {
                html5QrcodeScanner.stop();
              }
              onScanSuccess(parsed.payload);
              onClose();
            } else {
              setError(parsed.error || 'Invalid AnySend QR Code');
            }
          },
          () => {}
        );
        setIsScanning(true);
      } catch (err) {
        console.error('Camera QR scanner error:', err);
        setError('Camera permission denied or camera not accessible.');
        setIsScanning(false);
      }
    };

    const timer = setTimeout(() => {
      startScanner();
    }, 300);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(err => console.error('Error stopping QR scanner:', err));
      }
    };
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Scan Receiver QR Code">
      <div className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-xl bg-[#FF6B99] border-2 border-black text-black text-xs font-black shadow-brutal-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 stroke-[3]" />
            <span>{error}</span>
          </div>
        )}

        <div className="relative overflow-hidden rounded-2xl bg-white border-3 border-black shadow-brutal min-h-[280px] flex items-center justify-center">
          <div id={containerId} className="w-full h-full"></div>
          {!isScanning && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-black gap-2">
              <Camera className="w-10 h-10 animate-bounce stroke-[3]" />
              <span className="text-xs font-black uppercase">Initializing Camera...</span>
            </div>
          )}
        </div>

        <p className="text-xs font-bold text-center text-slate-800">
          Point camera at QR code on receiver device screen.
        </p>
      </div>
    </Modal>
  );
}
