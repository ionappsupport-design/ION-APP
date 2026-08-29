import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ChevronRight, 
  Moon, 
  Sun, 
  Smartphone,
  Star, 
  HelpCircle, 
  Crown
} from 'lucide-react';
import { UserSettings, NavigationTab, ProMembership } from '../types';
import { AdMob } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';
import toast from 'react-hot-toast';

interface SettingsScreenProps {
  settings: UserSettings;
  membership?: ProMembership;
  onUpdateSettings: (newSettings: UserSettings) => void;
  onBack: () => void;
  onNavigate: (tab: NavigationTab) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  membership,
  onUpdateSettings,
  onBack,
  onNavigate,
}) => {
  const [showStorageOnDashboard, setShowStorageOnDashboard] = useState(true);
  const [backupBeforeDelete, setBackupBeforeDelete] = useState(true);
  const [showRecommendations, setShowRecommendations] = useState(true);

  const setTheme = (t: 'light' | 'system' | 'dark') => {
    onUpdateSettings({ ...settings, theme: t });
  };

  const isPro = membership?.isPro || false;

  return (
    <div className="flex flex-col h-full select-none bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      {/* Header */}
      <header className="shrink-0 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md px-4 py-3 flex items-center gap-3 border-b border-slate-200/80 dark:border-slate-800">
        <button
          onClick={onBack}
          className="p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-transform"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">
          Settings
        </h1>
      </header>

      {/* Main Content Sections */}
      <main className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Section 0: Pro Membership */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">
            Membership & Billing
          </h2>

          <div 
            onClick={() => onNavigate('upgrade_pro')}
            className={`cursor-pointer rounded-3xl p-4 border shadow-sm transition-all ${
              isPro
                ? 'bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 border-amber-500/40 hover:border-amber-500/60'
                : 'bg-gradient-to-r from-blue-600/10 via-cyan-500/10 to-blue-600/10 border-blue-500/30 hover:border-blue-500/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                  isPro ? 'bg-amber-500/20 text-amber-500' : 'bg-blue-600/20 text-blue-600 dark:text-cyan-400'
                }`}>
                  <Crown className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {isPro ? (membership?.planName || 'ION Pro VIP') : 'ION Free Tier'}
                    </span>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                      isPro ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}>
                      {isPro ? 'VIP ACTIVE' : 'FREE'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {isPro 
                      ? 'Razorpay Verified Subscription' 
                      : 'Upgrade with Razorpay for unlimited deep clean'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </div>
          </div>
        </div>


        {/* Section 1: General */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">
            General
          </h2>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-2 border border-slate-200/80 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800/60">
            {/* Show storage on dashboard */}
            <div className="flex items-center justify-between p-3.5">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                Show storage on dashboard
              </span>
              <button
                onClick={() => setShowStorageOnDashboard(!showStorageOnDashboard)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  showStorageOnDashboard ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    showStorageOnDashboard ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Theme Picker — 3-way: Light / System / Dark */}
            <div className="flex flex-col gap-1.5 p-3.5">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                App Theme
              </span>
              <div className="flex rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 mt-1">
                {([
                  { key: 'light', label: 'Light', Icon: Sun },
                  { key: 'system', label: 'System', Icon: Smartphone },
                  { key: 'dark', label: 'Dark', Icon: Moon },
                ] as const).map(({ key, label, Icon }) => (
                  <button
                    key={key}
                    onClick={() => setTheme(key)}
                    className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-bold transition-all ${
                      settings.theme === key
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-cyan-400 shadow-sm rounded-xl mx-0.5 my-0.5'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Cleaning */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">
            Cleaning
          </h2>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-2 border border-slate-200/80 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800/60">
            {/* Backup before delete */}
            <div className="flex items-center justify-between p-3.5">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                Backup before delete
              </span>
              <button
                onClick={() => setBackupBeforeDelete(!backupBeforeDelete)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  backupBeforeDelete ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    backupBeforeDelete ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Show recommendations */}
            <div className="flex items-center justify-between p-3.5">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                Show recommendations
              </span>
              <button
                onClick={() => setShowRecommendations(!showRecommendations)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  showRecommendations ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    showRecommendations ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Section 3: About */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">
            About
          </h2>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-2 border border-slate-200/80 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800/60">
            {/* Version */}
            <div className="flex items-center justify-between p-3.5">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                Version
              </span>
              <span className="text-xs font-bold text-slate-400">
                1.0.0
              </span>
            </div>

            {/* Rate ION */}
            <button
              onClick={() => toast.success('Thank you for rating ION 5 Stars!')}
              className="w-full flex items-center justify-between p-3.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-2xl transition-colors"
            >
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                Rate ION
              </span>
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            </button>

            {/* Help & Support */}
            <button
              onClick={() => onNavigate('help_support')}
              className="w-full flex items-center justify-between p-3.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-2xl transition-colors"
            >
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                Help & Support
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Privacy Policy & Security */}
            <button
              onClick={() => onNavigate('security')}
              className="w-full flex items-center justify-between p-3.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-2xl transition-colors"
            >
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                Privacy Policy & Terms
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Manage GDPR/UMP Consent */}
            {Capacitor.getPlatform() !== 'web' && (
              <button
                onClick={async () => {
                  try {
                    await AdMob.showPrivacyOptionsForm();
                  } catch (e) {
                    console.error("Failed to show privacy options", e);
                    toast.error("Consent form not available.");
                  }
                }}
                className="w-full flex items-center justify-between p-3.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-2xl transition-colors"
              >
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  Privacy & Consent Options
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>
        </div>


      </main>
    </div>
  );
};
