import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { NavigationTab } from '../types';
import { registerPlugin } from '@capacitor/core';

const IonNativeStorage = registerPlugin<any>('IonNativeStorage');

interface SecurityPrivacyScreenProps {
  onBack: () => void;
  onNavigate: (tab: NavigationTab) => void;
}

export const SecurityPrivacyScreen: React.FC<SecurityPrivacyScreenProps> = ({
  onBack,
  onNavigate,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedApps, setScannedApps] = useState<any[]>([]);

  const handleScanApps = async () => {
    setIsScanning(true);
    try {
      const res = await IonNativeStorage.scanInstalledApps();
      if (res && res.apps) {
        setScannedApps(res.apps);
      }
    } catch (e) {
      console.error('Failed to scan apps natively', e);
    }
    setIsScanning(false);
  };

  return (
    <div className="flex flex-col h-full select-none bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      {/* Header */}
      <header className="shrink-0 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md px-4 py-3 flex items-center gap-3 border-b border-slate-200/50 dark:border-slate-800/50">
        <button
          onClick={onBack}
          className="p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-transform"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">
          Security & Privacy
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Center Visual: Shield with Keyhole */}
        <div className="flex flex-col items-center text-center my-4 space-y-4">
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-blue-500/20 dark:bg-cyan-500/20 rounded-full blur-2xl animate-pulse" />

            {/* Glowing Shield Ring */}
            <div className="relative w-32 h-32 rounded-full bg-gradient-to-tr from-blue-600 via-cyan-500 to-emerald-400 p-1 shadow-2xl shadow-cyan-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-white dark:bg-slate-900 rounded-full flex items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-cyan-400 flex items-center justify-center">
                  <Lock className="w-8 h-8" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Your data is safe with ION
            </h2>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Enterprise-grade privacy built directly into the storage engine.
            </p>
          </div>
        </div>

        {/* 4 Guarantees List */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3.5">
          <div className="flex items-center gap-3.5">
            <div className="w-7 h-7 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Files never leave your device
            </span>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-7 h-7 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              We don't collect personal data
            </span>
          </div>
        </div>

        {/* Privacy Risk Scanner */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Privacy Risk Scan</h3>
              <button
                onClick={handleScanApps}
                disabled={isScanning}
                className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50"
              >
                {isScanning ? 'Scanning...' : 'Scan Installed Apps'}
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Analyzes installed applications for excessive permissions and unknown installation sources.
            </p>
          </div>
          
          {scannedApps.length > 0 && (
            <div className="space-y-2 mt-4 max-h-60 overflow-y-auto pr-2">
              {scannedApps.map((app, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">{app.name}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{app.packageName}</span>
                  </div>
                  <div className={`shrink-0 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    app.securityStatus === 'suspicious' 
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  }`}>
                    {app.securityStatus}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Learn More Link */}
        <div className="text-center pt-2">
          <button
            onClick={() => onNavigate('help_support')}
            className="text-xs font-bold text-blue-600 dark:text-cyan-400 hover:underline"
          >
            Learn more about privacy
          </button>
        </div>
      </main>
    </div>
  );
};
