import React, { useState } from 'react';
import { 
  Home, 
  Trash2, 
  Copy, 
  Video, 
  ShieldAlert, 
  Activity, 
  FileText, 
  Crown,
  Layers,
  MessageSquare,
  Calendar,
  FolderArchive,
  X,
  Smartphone,
  Settings as SettingsIcon,
  RotateCcw,
  Zap,
  User,
  Headphones
} from 'lucide-react';
import { NavigationTab } from '../types';
import { IonLogo } from './IonLogo';

interface AndroidFrameProps {
  currentTab: NavigationTab;
  onNavigate: (tab: NavigationTab) => void;
  unreadNotificationsCount: number;
  batteryLevel: number | null;
  isCharging: boolean | null;
  children: React.ReactNode;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  currentTab,
  onNavigate,
  unreadNotificationsCount,
  batteryLevel,
  isCharging,
  children,
}) => {
  const [showDrawer, setShowDrawer] = useState(false);

  const isSplashScreen = currentTab === 'splash';
  const isCleaningScreen = currentTab === 'cleaning';

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col lg:flex-row items-center justify-center p-0 sm:p-4 md:p-6 gap-6 select-none font-sans transition-colors duration-200">
      
      {/* Companion Blueprint Screen Switcher for Desktop / Quick Nav */}
      <div className="hidden xl:flex flex-col w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 text-slate-900 dark:text-white shadow-xl max-h-[94vh] overflow-y-auto space-y-4 transition-colors duration-200">
        <div className="flex flex-col items-center justify-center p-3 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800/80">
          <IonLogo size="md" showTagline={true} />
        </div>

        {/* User Account Quick Card */}
        <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-500 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold truncate max-w-[120px]">
                Active User
              </p>
              <p className="text-[10px] text-slate-400">
                Pro Lifetime
              </p>
            </div>
          </div>
        </div>

        {/* Core Navigation Flow */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400 px-1">
            <span className="w-2 h-2 rounded-full bg-cyan-500" />
            <span>Core Navigation Flow</span>
          </div>

          {[
            { tab: 'home' as NavigationTab, label: '1. Dashboard', desc: 'Storage gauge, RAM & Battery' },
            { tab: 'scan' as NavigationTab, label: '2. Scan Progress', desc: 'Realtime ION Ring animation' },
            { tab: 'scan_results' as NavigationTab, label: '3. Scan Results', desc: 'Junk breakdown & 1-tap clean' },
            { tab: 'review_select' as NavigationTab, label: '4. Review & Select', desc: 'Photo grid & multi-select' },
            { tab: 'duplicate_group' as NavigationTab, label: '5. Duplicate Group', desc: 'Keep best quality photo' },
            { tab: 'backup_prompt' as NavigationTab, label: '6. Backup Before Delete', desc: 'Secure cloud protection' },
            { tab: 'clean_complete' as NavigationTab, label: '7. Clean Complete', desc: 'Freed storage celebration' },
          ].map(item => (
            <button
              key={item.tab}
              onClick={() => onNavigate(item.tab)}
              className={`w-full text-left p-2.5 rounded-xl text-xs font-bold transition-all flex flex-col ${
                currentTab === item.tab
                  ? 'bg-blue-600 text-white shadow-lg ring-1 ring-blue-400'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span>{item.label}</span>
              <span className={`text-[10px] font-normal ${currentTab === item.tab ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'}`}>
                {item.desc}
              </span>
            </button>
          ))}
        </div>

        {/* Advanced Storage Utilities */}
        <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 px-1">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span>Advanced Cleaners</span>
          </div>

          {[
            { tab: 'recycle_bin' as NavigationTab, label: '8. Recycle Bin', desc: '30-Day Safe Restore & Purge' },
            { tab: 'video_compressor' as NavigationTab, label: '9. Video Compressor', desc: 'Reclaim up to 70% video space' },
            { tab: 'social_cleaner' as NavigationTab, label: '10. Social Media Cleaner', desc: 'WhatsApp & Telegram junk' },
          ].map(item => (
            <button
              key={item.tab}
              onClick={() => onNavigate(item.tab)}
              className={`w-full text-left p-2.5 rounded-xl text-xs font-bold transition-all flex flex-col ${
                currentTab === item.tab
                  ? 'bg-purple-600 text-white shadow-lg ring-1 ring-purple-400'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span>{item.label}</span>
              <span className={`text-[10px] font-normal ${currentTab === item.tab ? 'text-purple-100' : 'text-slate-400 dark:text-slate-500'}`}>
                {item.desc}
              </span>
            </button>
          ))}
        </div>

        {/* Utilities & Insights */}
        <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 px-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Insights & Settings</span>
          </div>

          {[
            { tab: 'storage_overview' as NavigationTab, label: '11. Storage Overview', desc: '30-day storage trends' },
            { tab: 'monthly_report' as NavigationTab, label: '12. Monthly Report', desc: '6-month space saved chart' },
            { tab: 'security' as NavigationTab, label: '13. Security & Privacy', desc: 'Guaranteed privacy policy' },
            { tab: 'settings' as NavigationTab, label: '14. Settings', desc: 'Auto scan & dark theme' },
            { tab: 'help_support' as NavigationTab, label: '15. Help & Support', desc: 'FAQs & Realtime ticket' },
          ].map(item => (
            <button
              key={item.tab}
              onClick={() => onNavigate(item.tab)}
              className={`w-full text-left p-2.5 rounded-xl text-xs font-bold transition-all flex flex-col ${
                currentTab === item.tab
                  ? 'bg-emerald-600 text-white shadow-lg ring-1 ring-emerald-400'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span>{item.label}</span>
              <span className={`text-[10px] font-normal ${currentTab === item.tab ? 'text-emerald-100' : 'text-slate-400 dark:text-slate-500'}`}>
                {item.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Device Body */}
      <div className="w-full sm:max-w-md md:max-w-lg h-screen sm:h-[92vh] sm:max-h-[920px] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col sm:rounded-[40px] shadow-2xl overflow-hidden border-0 sm:border-8 sm:border-slate-300 dark:sm:border-slate-800 relative transition-colors duration-200">
        
        {/* Main Screen Viewport Container */}
        <div className="flex-1 overflow-y-auto overscroll-contain bg-slate-50 dark:bg-slate-950 flex flex-col relative">
          {/* Inject onOpenDrawer into child elements when needed */}
          {React.isValidElement(children) 
            ? React.cloneElement(children as React.ReactElement<any>, { 
                onOpenDrawer: () => setShowDrawer(true) 
              })
            : children}
        </div>

        {/* Bottom 5-Tab Navigation Bar (Home | Clean | Files | Overview | Settings) */}
        {!isSplashScreen && !isCleaningScreen && (
          <div className="w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around shrink-0 z-30 shadow-lg">
            {/* 1. Home */}
            <button
              id="nav-tab-home"
              onClick={() => onNavigate('home')}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
                currentTab === 'home'
                  ? 'text-blue-600 dark:text-cyan-400 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-xl transition-all ${currentTab === 'home' ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-cyan-400' : ''}`}>
                <Home className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">Home</span>
            </button>

            {/* 2. Clean */}
            <button
              id="nav-tab-clean"
              onClick={() => onNavigate('scan')}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
                currentTab === 'scan' || currentTab === 'scan_results' || currentTab === 'clean_complete'
                  ? 'text-blue-600 dark:text-cyan-400 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-xl transition-all ${currentTab === 'scan' || currentTab === 'scan_results' || currentTab === 'clean_complete' ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-cyan-400' : ''}`}>
                <Trash2 className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">Clean</span>
            </button>

            {/* 3. Files */}
            <button
              id="nav-tab-files"
              onClick={() => onNavigate('review_select')}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
                currentTab === 'review_select' || currentTab === 'duplicate_group'
                  ? 'text-blue-600 dark:text-cyan-400 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-xl transition-all ${currentTab === 'review_select' || currentTab === 'duplicate_group' ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-cyan-400' : ''}`}>
                <Copy className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">Files</span>
            </button>

            {/* 4. Overview */}
            <button
              id="nav-tab-overview"
              onClick={() => onNavigate('storage_overview')}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
                currentTab === 'storage_overview' || currentTab === 'monthly_report'
                  ? 'text-blue-600 dark:text-cyan-400 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-xl transition-all ${currentTab === 'storage_overview' || currentTab === 'monthly_report' ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-cyan-400' : ''}`}>
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">Overview</span>
            </button>

            {/* 5. Settings */}
            <button
              id="nav-tab-settings"
              onClick={() => onNavigate('settings')}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
                currentTab === 'settings'
                  ? 'text-blue-600 dark:text-cyan-400 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-xl transition-all ${currentTab === 'settings' ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-cyan-400' : ''}`}>
                <SettingsIcon className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">Settings</span>
            </button>
          </div>
        )}

        {/* Full Side Drawer Menu (Triggered by Hamburger in Dashboard) */}
        {showDrawer && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex animate-in fade-in duration-200">
            <div className="w-4/5 max-w-xs h-full bg-white dark:bg-slate-900 shadow-2xl p-5 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-250 border-r border-slate-200 dark:border-slate-800">
              
              <div className="space-y-4">
                {/* Header with Close */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <IonLogo size="sm" showTagline={false} />
                  </div>
                  <button
                    onClick={() => setShowDrawer(false)}
                    className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Account / User Section */}
                <div 
                  onClick={() => {
                    setShowDrawer(false);
                  }}
                  className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-800/40 cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[120px]">
                        Active User
                      </p>
                      <p className="text-[10px] text-blue-600 dark:text-blue-400">
                        Pro Lifetime
                      </p>
                    </div>
                  </div>
                </div>

                {/* Navigation Links */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3">
                    Main Features
                  </span>

                  <button
                    onClick={() => { setShowDrawer(false); onNavigate('home'); }}
                    className="w-full p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left flex items-center gap-3 text-xs font-bold text-slate-800 dark:text-slate-200"
                  >
                    <Home className="w-4 h-4 text-blue-600" />
                    <span>Dashboard</span>
                  </button>

                  <button
                    onClick={() => { setShowDrawer(false); onNavigate('scan'); }}
                    className="w-full p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left flex items-center gap-3 text-xs font-bold text-slate-800 dark:text-slate-200"
                  >
                    <Trash2 className="w-4 h-4 text-emerald-600" />
                    <span>Scan & Clean</span>
                  </button>

                  <button
                    onClick={() => { setShowDrawer(false); onNavigate('recycle_bin'); }}
                    className="w-full p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left flex items-center gap-3 text-xs font-bold text-slate-800 dark:text-slate-200"
                  >
                    <RotateCcw className="w-4 h-4 text-cyan-600" />
                    <span>Recycle Bin (30-Day Safe)</span>
                  </button>

                  <button
                    onClick={() => { setShowDrawer(false); onNavigate('video_compressor'); }}
                    className="w-full p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left flex items-center gap-3 text-xs font-bold text-slate-800 dark:text-slate-200"
                  >
                    <Video className="w-4 h-4 text-purple-600" />
                    <span>Video Compressor</span>
                  </button>

                  <button
                    onClick={() => { setShowDrawer(false); onNavigate('social_cleaner'); }}
                    className="w-full p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left flex items-center gap-3 text-xs font-bold text-slate-800 dark:text-slate-200"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-500" />
                    <span>Social Media Cleaner</span>
                  </button>

                  <button
                    onClick={() => { setShowDrawer(false); onNavigate('storage_overview'); }}
                    className="w-full p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left flex items-center gap-3 text-xs font-bold text-slate-800 dark:text-slate-200"
                  >
                    <Activity className="w-4 h-4 text-indigo-600" />
                    <span>Storage Overview</span>
                  </button>

                  <button
                    onClick={() => { setShowDrawer(false); onNavigate('monthly_report'); }}
                    className="w-full p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left flex items-center gap-3 text-xs font-bold text-slate-800 dark:text-slate-200"
                  >
                    <FileText className="w-4 h-4 text-amber-500" />
                    <span>Monthly Report</span>
                  </button>

                  <button
                    onClick={() => { setShowDrawer(false); onNavigate('help_support'); }}
                    className="w-full p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left flex items-center gap-3 text-xs font-bold text-slate-800 dark:text-slate-200"
                  >
                    <Headphones className="w-4 h-4 text-pink-500" />
                    <span>Help & Realtime Support</span>
                  </button>
                </div>
              </div>

              {/* Bottom Pro Card in Drawer */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="w-full p-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-between shadow-md">
                  <div className="text-left">
                    <span className="text-xs font-extrabold block">ION Pro Lifetime</span>
                    <span className="text-[10px] text-blue-100">Ad-free & automated scan</span>
                  </div>
                  <Crown className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                </div>
              </div>

            </div>

            {/* Click outside to dismiss */}
            <div className="flex-1" onClick={() => setShowDrawer(false)} />
          </div>
        )}

        {/* Android Navigation Gesture Pill */}
        <div className="w-full bg-white dark:bg-slate-900 py-1.5 flex justify-center items-center shrink-0">
          <div className="w-32 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
        </div>

      </div>
    </div>
  );
};
