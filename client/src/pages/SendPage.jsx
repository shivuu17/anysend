import React, { useState } from 'react';
import { Card } from '../components/Common/Card.jsx';
import { Button } from '../components/Common/Button.jsx';
import { Dropzone } from '../components/Send/Dropzone.jsx';
import { FileList } from '../components/Send/FileList.jsx';
import { QRScannerModal } from '../components/Send/QRScannerModal.jsx';
import { ManualConnectModal } from '../components/Send/ManualConnectModal.jsx';
import { SendingProgress } from '../components/Send/SendingProgress.jsx';
import { InternetCodeGeneratorCard } from '../components/Send/InternetCodeGeneratorCard.jsx';
import { useTransfer } from '../context/TransferContext.jsx';
import { QrCode, Server, Send, Smartphone, Globe } from 'lucide-react';

export function SendPage() {
  const { selectedFiles, targetDevice, setTargetDevice, initiateTransfer, sendingState } = useTransfer();

  const [mode, setMode] = useState('picker'); // picker, internet_code
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  const handleScanSuccess = (payload) => {
    setTargetDevice(payload);
    initiateTransfer(payload);
  };

  const handleManualConnect = (payload) => {
    setTargetDevice(payload);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-black text-black uppercase tracking-tight">Send Files</h2>
        <p className="text-xs font-bold text-slate-700 mt-1">
          Select files and pair via Local Wi-Fi or 6-Digit Internet Code (no same network or login required).
        </p>
      </div>

      {/* Sending Progress view if active */}
      <SendingProgress />

      {/* Internet Code Mode */}
      {mode === 'internet_code' && selectedFiles.length > 0 && (
        <InternetCodeGeneratorCard
          selectedFiles={selectedFiles}
          onReset={() => setMode('picker')}
        />
      )}

      {/* Standard File Selection & Connection Picker */}
      {mode === 'picker' && sendingState.status === 'idle' && (
        <>
          <Dropzone />

          <FileList />

          {/* Receiver Connection Target Card */}
          {selectedFiles.length > 0 && (
            <Card title="Choose Transfer Mode" subtitle="Transfer via local Wi-Fi or 6-digit internet code anywhere">
              <div className="space-y-5">
                {/* Connection Options Grid */}
                {targetDevice ? (
                  <div className="flex items-center justify-between p-4 rounded-xl bg-[#00F0FF] border-2 border-black shadow-brutal-sm text-black">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-white border-2 border-black flex items-center justify-center text-black shadow-brutal-sm">
                        <Smartphone className="w-6 h-6 stroke-[2.5]" />
                      </div>
                      <div>
                        <p className="font-black text-base text-black uppercase">
                          Target: {targetDevice.host}:{targetDevice.port}
                        </p>
                        <p className="text-xs font-extrabold text-black">Local Wi-Fi connection ready</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setTargetDevice(null)}>
                      Change Target
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Option 1: Internet Code (No Wi-Fi needed!) */}
                    <button
                      type="button"
                      onClick={() => setMode('internet_code')}
                      className="flex flex-col items-center justify-center p-6 rounded-2xl bg-[#FFE600] border-3 border-black shadow-brutal hover:-translate-x-1 hover:-translate-y-1 hover:shadow-brutal-lg transition-all text-center group"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-white border-2 border-black flex items-center justify-center text-black mb-3 shadow-brutal-sm group-hover:scale-110 transition-transform">
                        <Globe className="w-7 h-7 stroke-[2.5]" />
                      </div>
                      <span className="font-black text-base text-black uppercase">6-Digit Code</span>
                      <span className="text-xs font-bold text-slate-800 mt-0.5">No same Wi-Fi needed</span>
                    </button>

                    {/* Option 2: Scan QR Code */}
                    <button
                      type="button"
                      onClick={() => setIsQrModalOpen(true)}
                      className="flex flex-col items-center justify-center p-6 rounded-2xl bg-[#00F0FF] border-3 border-black shadow-brutal hover:-translate-x-1 hover:-translate-y-1 hover:shadow-brutal-lg transition-all text-center group"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-white border-2 border-black flex items-center justify-center text-black mb-3 shadow-brutal-sm group-hover:scale-110 transition-transform">
                        <QrCode className="w-7 h-7 stroke-[2.5]" />
                      </div>
                      <span className="font-black text-base text-black uppercase">Scan QR Code</span>
                      <span className="text-xs font-bold text-slate-800 mt-0.5">Local Wi-Fi QR camera</span>
                    </button>

                    {/* Option 3: Manual IP */}
                    <button
                      type="button"
                      onClick={() => setIsManualModalOpen(true)}
                      className="flex flex-col items-center justify-center p-6 rounded-2xl bg-[#C084FC] border-3 border-black shadow-brutal hover:-translate-x-1 hover:-translate-y-1 hover:shadow-brutal-lg transition-all text-center group"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-white border-2 border-black flex items-center justify-center text-black mb-3 shadow-brutal-sm group-hover:scale-110 transition-transform">
                        <Server className="w-7 h-7 stroke-[2.5]" />
                      </div>
                      <span className="font-black text-base text-black uppercase">Manual IP</span>
                      <span className="text-xs font-bold text-slate-800 mt-0.5">Type IP address & port</span>
                    </button>
                  </div>
                )}

                {/* Initiate Wi-Fi Transfer Button */}
                {targetDevice && (
                  <div className="flex justify-end pt-3 border-t-2 border-black">
                    <Button
                      variant="primary"
                      size="lg"
                      icon={Send}
                      onClick={() => initiateTransfer()}
                    >
                      Start Wi-Fi Transfer
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          )}
        </>
      )}

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        onScanSuccess={handleScanSuccess}
      />

      {/* Manual IP Connect Modal */}
      <ManualConnectModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onConnect={handleManualConnect}
      />
    </div>
  );
}
