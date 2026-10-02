import React from 'react';
import { SettingsForm } from '../components/Settings/SettingsForm.jsx';

export function SettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="text-3xl font-black text-black uppercase tracking-tight">Settings</h2>
        <p className="text-xs font-bold text-slate-700 mt-1">
          Customize device identity, auto-accept behavior, and transfer limits.
        </p>
      </div>

      <SettingsForm />
    </div>
  );
}
