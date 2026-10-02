import React, { useState } from 'react';
import { Card } from '../Common/Card.jsx';
import { Button } from '../Common/Button.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { generateCoolDeviceName } from '../../utils/nameGenerator.js';
import { Save, CheckCircle2, Smartphone, Shield, Layers, Sparkles } from 'lucide-react';

export function SettingsForm() {
  const { settings, updateSettings } = useSettings();

  const [deviceName, setDeviceName] = useState(settings.deviceName || 'Neon Phoenix');
  const [autoAccept, setAutoAccept] = useState(!!settings.autoAccept);
  const [maxConcurrentTransfers, setMaxConcurrentTransfers] = useState(settings.maxConcurrentTransfers || 5);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRandomizeName = () => {
    const coolName = generateCoolDeviceName();
    setDeviceName(coolName);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    const res = await updateSettings({
      deviceName,
      autoAccept,
      maxConcurrentTransfers: parseInt(maxConcurrentTransfers, 10)
    });

    setLoading(false);
    if (res.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <Card title="Application Preferences" subtitle="Configure node parameters and pairing settings">
      <form onSubmit={handleSubmit} className="space-y-6">
        {saved && (
          <div className="p-3.5 rounded-xl bg-[#A3E635] border-2 border-black text-black text-xs font-black shadow-brutal-sm flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 stroke-[3]" />
            <span>Settings saved successfully!</span>
          </div>
        )}

        {/* Device Name */}
        <div>
          <label className="block text-xs font-black text-black uppercase tracking-wider mb-2 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 stroke-[2.5]" />
              <span>Device Name</span>
            </span>
            <button
              type="button"
              onClick={handleRandomizeName}
              className="text-[11px] font-black uppercase tracking-wider text-black bg-[#FFE600] px-2.5 py-1 rounded-lg border-2 border-black shadow-brutal-sm hover:bg-[#00F0FF] transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Randomize Name</span>
            </button>
          </label>
          <input
            type="text"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            placeholder="e.g. Neon Falcon, Cosmic Panther"
            className="w-full bg-white border-2 border-black rounded-xl px-4 py-2.5 text-sm text-black font-extrabold focus:outline-none focus:ring-2 focus:ring-black shadow-brutal-sm"
          />
          <p className="text-[11px] font-bold text-slate-600 mt-1">
            Cool, unique device name broadcasted to nearby devices during file transfer requests.
          </p>
        </div>

        {/* Auto Accept Transfers */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-[#FAF7F0] border-2 border-black shadow-brutal-sm">
          <div className="space-y-0.5">
            <div className="text-sm font-black uppercase text-black flex items-center gap-2">
              <Shield className="w-4 h-4 stroke-[2.5]" />
              <span>Auto-Accept Incoming Requests</span>
            </div>
            <p className="text-xs font-bold text-slate-700">
              Bypass incoming modal prompt and receive files immediately.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAutoAccept(!autoAccept)}
            className={`w-14 h-8 flex items-center rounded-full p-1 border-2 border-black transition-all shadow-brutal-sm ${
              autoAccept ? 'bg-[#A3E635]' : 'bg-slate-200'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white border-2 border-black shadow-sm transform transition-transform" />
          </button>
        </div>

        {/* Max Concurrent Transfers */}
        <div>
          <label className="block text-xs font-black text-black uppercase tracking-wider mb-2 flex items-center gap-2">
            <Layers className="w-4 h-4 stroke-[2.5]" />
            <span>Max Concurrent Transfers</span>
          </label>
          <input
            type="number"
            min="1"
            max="20"
            value={maxConcurrentTransfers}
            onChange={(e) => setMaxConcurrentTransfers(e.target.value)}
            className="w-full bg-white border-2 border-black rounded-xl px-4 py-2.5 text-sm text-black font-mono font-extrabold focus:outline-none focus:ring-2 focus:ring-black shadow-brutal-sm"
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4 border-t-2 border-black">
          <Button type="submit" variant="primary" icon={Save} loading={loading}>
            Save Preferences
          </Button>
        </div>
      </form>
    </Card>
  );
}
