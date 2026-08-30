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
import { BottomBannerAd } from './BottomBannerAd';

interface AndroidFrameProps {
  currentTab: NavigationTab;
  onNavigate: (tab: NavigationTab) => void;
  unreadNotificationsCount: number;
  batteryLevel: number | null;
  isCharging: boolean | null;
  onOpenDrawer: () => void;
  isPro?: boolean;
  children: React.ReactNode;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  currentTab,
  onNavigate,
  unreadNotificationsCount,
  batteryLevel,
  isCharging,
  onOpenDrawer,
  isPro = false,
  children,
}) => {

  const isSplashScreen = currentTab === 'splash';
  const isCleaningScreen = currentTab === 'cleaning';

  return (
    <div className="min-h-[100dvh] bg-slate-100 dark:bg-slate-950 flex flex-col lg:flex-row items-center justify-center p-0 sm:p-4 md:p-6 gap-6 select-none font-sans transition-colors duration-200">
      
      {/* Companion Blueprint Screen Switcher for Desktop / Quick Nav */}
      <div className="hidden xl:flex flex-col w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 text-slate-900 dark:text-white shadow-xl max-h-[94vh] overflow-y-auto space-y-4 transition-colors duration-200">
        <div className="flex flex-col items-center justify-center p-3 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800/80">
          <IonLogo size="md" showTagline={true} />
        </div>

        {/* Generated APK Direct Download Banner on Display */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-emerald-500/10 border border-emerald-500/30 text-left space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">ION v3.0.0 APK</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">9.5 MB</span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            Android APK ready on your Desktop & Browser download.
          </p>
          <a
            href="/ION_Clean_Storage_v3.apk"
            download="ION_Clean_Storage_v3.apk"
            className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all text-center"
          >
            <span>📥 Download Android APK</span>
          </a>
        </div>

        {/* User Account / Membership Quick Card */}
        <div 
          onClick={() => onNavigate('upgrade_pro')}
          className="cursor-pointer p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between hover:border-amber-500/50 transition-all group"
        >
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              isPro ? 'bg-amber-500/20 text-amber-500' : 'bg-blue-600/20 text-blue-500'
            }`}>
              <Crown className="w-4 h-4 fill-current" />
            </div>
            <div>
              <p className="text-xs font-bold truncate max-w-[120px]">
                {isPro ? 'ION Pro VIP' : 'Free Member'}
              </p>
              <p className="text-[10px] text-slate-400">
                {isPro ? 'Razorpay Verified' : 'Tap to Upgrade'}
              </p>
            </div>
          </div>
          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
            isPro ? 'bg-amber-400 text-slate-950' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-cyan-400'
          }`}>
            {isPro ? 'PRO' : 'UPGRADE'}
          </span>
        </div>

        {/* Pro Monetization / Razorpay Flow */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 px-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Monetization & Plans</span>
          </div>

          <button
            onClick={() => onNavigate('upgrade_pro')}
            className={`w-full text-left p-2.5 rounded-xl text-xs font-bold transition-all flex flex-col ${
              currentTab === 'upgrade_pro'
                ? 'bg-amber-500 text-slate-950 shadow-lg ring-1 ring-amber-400 font-black'
                : 'hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-500/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <span>Upgrade to Pro (Razorpay)</span>
              <Crown className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className={`text-[10px] font-normal ${currentTab === 'upgrade_pro' ? 'text-slate-900' : 'text-slate-400'}`}>
              UPI, Cards & NetBanking Checkout
            </span>
          </button>
        </div>

        {/* Core Navigation Flow */}
        <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800/80">
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
            { tab: 'clean_complete' as NavigationTab, label: '6. Clean Complete', desc: 'Freed storage celebration' },
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
            { tab: 'recycle_bin' as NavigationTab, label: '7. Recycle Bin', desc: '30-Day Safe Restore & Purge' },
            { tab: 'video_compressor' as NavigationTab, label: '8. Video Compressor', desc: 'Reclaim up to 70% video space' },
            { tab: 'social_cleaner' as NavigationTab, label: '9. Social Media Cleaner', desc: 'WhatsApp & Telegram junk' },
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
            { tab: 'storage_overview' as NavigationTab, label: '10. Storage Overview', desc: '30-day storage trends' },
            { tab: 'monthly_report' as NavigationTab, label: '11. Monthly Report', desc: '6-month space saved chart' },
            { tab: 'security' as NavigationTab, label: '12. Security & Privacy', desc: 'Guaranteed privacy policy' },
            { tab: 'settings' as NavigationTab, label: '13. Settings', desc: 'Theme & general settings' },
            { tab: 'help_support' as NavigationTab, label: '14. Help & Support', desc: 'FAQs & Realtime ticket' },
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
      <div className="w-full sm:max-w-[420px] h-[100dvh] sm:h-[92dvh] sm:max-h-[920px] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col sm:rounded-[40px] shadow-2xl overflow-hidden border-0 sm:border-8 sm:border-slate-300 dark:sm:border-slate-800 relative transition-colors duration-200" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        
        {/* Main Screen Viewport Container */}
        <div className="flex-1 overflow-y-auto overscroll-contain bg-slate-50 dark:bg-slate-950 flex flex-col relative">
          {/* Inject onOpenDrawer into child elements when needed */}
          {React.isValidElement(children) 
            ? React.cloneElement(children as React.ReactElement<any>, { 
                onOpenDrawer: () => onOpenDrawer() 
              })
            : children}
        </div>

        {/* Bottom Banner Ad Placement (Displayed only for free tier, removed for Pro & 7-Day Free Trial) */}
        {!isSplashScreen && !isCleaningScreen && currentTab !== 'upgrade_pro' && (
          <BottomBannerAd isPro={isPro} />
        )}

        {/* Bottom 5-Tab Navigation Bar (Home | Clean | Files | Overview | Settings) */}
        {!isSplashScreen && !isCleaningScreen && currentTab !== 'upgrade_pro' && (
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


        {/* Android Navigation Gesture Pill */}
        <div className="w-full bg-white dark:bg-slate-900 py-1.5 flex justify-center items-center shrink-0">
          <div className="w-32 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
        </div>

      </div>
    </div>
  );
};
