import React from 'react';
import { Card } from '../components/Common/Card.jsx';
import { ShieldCheck, Lock, EyeOff, Trash2, HardDrive, CheckCircle2 } from 'lucide-react';

export function PrivacyPolicyPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-black text-black uppercase tracking-tight">Privacy Policy</h2>
        <p className="text-xs font-bold text-slate-700 mt-1">
          Zero-cloud, zero-tracking, privacy-first local & P2P file transfer architecture.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Zero Cloud Storage" subtitle="Direct P2P & local ephemeral buffers" className="bg-[#FFE600]">
          <div className="space-y-3 text-xs font-bold text-black leading-relaxed">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border-2 border-black flex items-center justify-center shrink-0 shadow-brutal-sm">
                <Lock className="w-4 h-4 stroke-[2.5]" />
              </div>
              <p>
                AnySend never uploads your file contents to cloud servers (AWS, Supabase, Firebase). All transfers are direct local P2P or encrypted ephemeral relays.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border-2 border-black flex items-center justify-center shrink-0 shadow-brutal-sm">
                <EyeOff className="w-4 h-4 stroke-[2.5]" />
              </div>
              <p>
                No user accounts, email registration, tracking cookies, or third-party analytical scripts are used.
              </p>
            </div>
          </div>
        </Card>

        <Card title="Automatic Cleanup" subtitle="15-minute expiration & cleanup" className="bg-[#00F0FF]">
          <div className="space-y-3 text-xs font-bold text-black leading-relaxed">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border-2 border-black flex items-center justify-center shrink-0 shadow-brutal-sm">
                <Trash2 className="w-4 h-4 stroke-[2.5]" />
              </div>
              <p>
                Temporary transfer sessions and partial chunk files are automatically purged after 15 minutes of inactivity or immediately upon cancellation.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border-2 border-black flex items-center justify-center shrink-0 shadow-brutal-sm">
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
              </div>
              <p>
                Filename sanitization strips OS system paths to protect local directory privacy.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Privacy Principles Checklist">
        <div className="space-y-3 text-xs font-extrabold text-black">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FAF7F0] border-2 border-black shadow-brutal-sm">
            <CheckCircle2 className="w-5 h-5 text-black stroke-[3] shrink-0" />
            <span>100% Free & Open Local P2P Transfer</span>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FAF7F0] border-2 border-black shadow-brutal-sm">
            <CheckCircle2 className="w-5 h-5 text-black stroke-[3] shrink-0" />
            <span>Zero Content Logging or Third-Party Tracking</span>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FAF7F0] border-2 border-black shadow-brutal-sm">
            <CheckCircle2 className="w-5 h-5 text-black stroke-[3] shrink-0" />
            <span>Automatic 15-Minute Ephemeral File Purge</span>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FAF7F0] border-2 border-black shadow-brutal-sm">
            <CheckCircle2 className="w-5 h-5 text-black stroke-[3] shrink-0" />
            <span>Bit-Exact SHA-256 Checksum Verification</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
