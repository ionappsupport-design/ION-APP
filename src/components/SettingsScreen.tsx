import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ChevronRight, 
  ChevronDown, 
  Moon, 
  Sun, 
  Star, 
  HelpCircle, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';
import { UserSettings, NavigationTab } from '../types';
import { IonNativeStorage } from '../services/nativeStorageBridge';

interface SettingsScreenProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  onBack: () => void;
  onNavigate: (tab: NavigationTab) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onUpdateSettings,
  onBack,
  onNavigate,
}) => {
  const [autoScanInterval, setAutoScanInterval] = useState<'Daily' | 'Weekly' | 'Monthly'>('Weekly');
  const [isAutoScanDropdownOpen, setIsAutoScanDropdownOpen] = useState(false);

  const [scanReminder, setScanReminder] = useState(settings.junkReminder ?? true);
  const [showStorageOnDashboard, setShowStorageOnDashboard] = useState(true);
  const [backupBeforeDelete, setBackupBeforeDelete] = useState(true);
  const [showRecommendations, setShowRecommendations] = useState(true);

  const toggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    onUpdateSettings({
      ...settings,
      theme: nextTheme,
    });
  };

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
        {/* Section 1: General */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">
            General
          </h2>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-2 border border-slate-200/80 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800/60">
            {/* Auto scan */}
            <div className="flex items-center justify-between p-3.5">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                Auto scan
              </span>
              <div className="relative">
                <button
                  onClick={() => setIsAutoScanDropdownOpen(!isAutoScanDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
                >
                  <span>{autoScanInterval}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isAutoScanDropdownOpen && (
                  <div className="absolute right-0 mt-1 w-28 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-30 py-1">
                    {(['Daily', 'Weekly', 'Monthly'] as const).map((interval) => (
                      <button
                        key={interval}
                        onClick={() => {
                          setAutoScanInterval(interval);
                          setIsAutoScanDropdownOpen(false);
                          
                          // Convert interval to hours and schedule in native WorkManager
                          let hours = 24 * 7; // Weekly default
                          if (interval === 'Daily') hours = 24;
                          if (interval === 'Monthly') hours = 24 * 30;
                          
                          IonNativeStorage.scheduleAutoClean({ intervalHours: hours }).catch(err => {
                            console.error('Failed to schedule auto-clean', err);
                          });
                        }}
                        className="w-full px-3 py-1.5 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        {interval}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Scan reminder toggle */}
            <div className="flex items-center justify-between p-3.5">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                Scan reminder
              </span>
              <button
                onClick={() => setScanReminder(!scanReminder)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  scanReminder ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    scanReminder ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

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

            {/* Dark mode toggle */}
            <div className="flex items-center justify-between p-3.5">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                Dark mode
              </span>
              <button
                onClick={toggleTheme}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  settings.theme === 'dark' ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    settings.theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
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
              onClick={() => alert('Thank you for rating ION 5 Stars!')}
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
          </div>
        </div>
      </main>
    </div>
  );
};
