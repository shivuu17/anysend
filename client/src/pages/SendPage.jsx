import React, { useState } from 'react';
import { Card } from '../components/Common/Card.jsx';
import { Button } from '../components/Common/Button.jsx';
import { Badge } from '../components/Common/Badge.jsx';
import { Dropzone } from '../components/Send/Dropzone.jsx';
import { FileList } from '../components/Send/FileList.jsx';
import { QRScannerModal } from '../components/Send/QRScannerModal.jsx';
import { ManualConnectModal } from '../components/Send/ManualConnectModal.jsx';
import { SendingProgress } from '../components/Send/SendingProgress.jsx';
import { InternetCodeGeneratorCard } from '../components/Send/InternetCodeGeneratorCard.jsx';
import { useTransfer } from '../context/TransferContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import { QrCode, Server, Send, Smartphone, Globe, Radio, CheckCircle2 } from 'lucide-react';

export function SendPage() {
  const { selectedFiles, targetDevice, setTargetDevice, initiateTransfer, sendingState } = useTransfer();
  const { activeReceivers, socket } = useSocket();

  const [mode, setMode] = useState('picker'); // picker, internet_code
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Filter out sender's own socket from discovered receivers list
  const availableReceivers = activeReceivers.filter(r => r.socketId !== socket?.id);

  const handleScanSuccess = (payload) => {
    setTargetDevice(payload);
    initiateTransfer(payload);
  };

  const handleManualConnect = (payload) => {
    setTargetDevice(payload);
  };

  const handleSelectReceiver = (device) => {
    setTargetDevice({
      socketId: device.socketId,
      deviceName: device.deviceName,
      host: device.host || 'localhost',
      port: 5000
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-black text-black uppercase tracking-tight">Send Files</h2>
        <p className="text-xs font-bold text-slate-700 mt-1">
          Select files and pair via Discovered Devices, Local Wi-Fi, or 6-Digit Internet Code.
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
            <Card title="Choose Target Receiver" subtitle="Select a specific nearby device or pairing mode">
              <div className="space-y-5">

                {/* Discovered Nearby Devices Section */}
                {availableReceivers.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-black text-black uppercase">
                      <Radio className="w-4 h-4 text-black animate-pulse stroke-[3]" />
                      <span>Discovered Nearby Receivers ({availableReceivers.length})</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {availableReceivers.map((rec) => {
                        const isSelected = targetDevice?.socketId === rec.socketId;
                        return (
                          <div
                            key={rec.socketId}
                            onClick={() => handleSelectReceiver(rec)}
                            className={`flex items-center justify-between p-3.5 rounded-xl border-3 border-black cursor-pointer transition-all shadow-brutal ${
                              isSelected ? 'bg-[#00F0FF] text-black -translate-y-0.5 shadow-brutal-lg' : 'bg-white text-black hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-white border-2 border-black flex items-center justify-center shrink-0 shadow-brutal-sm">
                                <Smartphone className="w-5 h-5 stroke-[2.5]" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-black text-sm uppercase truncate">{rec.deviceName}</p>
                                <p className="text-[10px] font-bold text-slate-700">Single Receiver Target</p>
                              </div>
                            </div>
                            {isSelected && <CheckCircle2 className="w-5 h-5 text-black stroke-[3]" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Selected Target Banner */}
                {targetDevice ? (
                  <div className="flex items-center justify-between p-4 rounded-xl bg-[#00F0FF] border-2 border-black shadow-brutal-sm text-black">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-white border-2 border-black flex items-center justify-center text-black shadow-brutal-sm">
                        <Smartphone className="w-6 h-6 stroke-[2.5]" />
                      </div>
                      <div>
                        <p className="font-black text-base text-black uppercase">
                          Target Receiver: {targetDevice.deviceName || targetDevice.host}
                        </p>
                        <p className="text-xs font-extrabold text-black">Single-device targeted transfer ready</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setTargetDevice(null)}>
                      Change Target
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Option 1: Internet Code */}
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
                      <span className="text-xs font-bold text-slate-800 mt-0.5">Universal camera scanner</span>
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

                {/* Initiate Transfer Button */}
                {targetDevice && (
                  <div className="flex justify-end pt-3 border-t-2 border-black">
                    <Button
                      variant="primary"
                      size="lg"
                      icon={Send}
                      onClick={() => initiateTransfer()}
                    >
                      Send To Selected Receiver
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
