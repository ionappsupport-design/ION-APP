import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Home, 
  BarChart2, 
  Trash2, 
  Zap, 
  Layers, 
  FileText, 
  ShieldCheck, 
  Settings, 
  HelpCircle, 
  Crown, 
  User, 
  LogOut,
  ChevronRight
} from 'lucide-react';
import { NavigationTab, AuthUser, TrialState } from '../types';
import { UserProfile } from '../services/authService';
import { IonLogo } from './IonLogo';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: NavigationTab;
  onNavigate: (tab: NavigationTab) => void;
  isPro?: boolean;
  currentUser?: UserProfile | null;
  onSignOut?: () => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  currentTab,
  onNavigate,
  isPro = false,
  currentUser = null,
  onSignOut,
}) => {
  const menuItems = [
    { id: 'home' as NavigationTab, label: 'Dashboard & Scanner', icon: Home },
    { id: 'upgrade_pro' as NavigationTab, label: 'Upgrade to Pro (Razorpay)', icon: Crown, badge: isPro ? 'VIP' : 'PRO' },
    { id: 'storage_overview' as NavigationTab, label: 'Storage Overview', icon: BarChart2 },
    { id: 'recycle_bin' as NavigationTab, label: 'Recycle Bin (30d Recovery)', icon: Trash2, badge: 'Recovery' },
    { id: 'video_compressor' as NavigationTab, label: 'Video Compressor', icon: Zap },
    { id: 'social_cleaner' as NavigationTab, label: 'Social Media Cleaner', icon: Layers },
    { id: 'monthly_report' as NavigationTab, label: 'Monthly Storage Report', icon: FileText },
    { id: 'security' as NavigationTab, label: 'Security & Privacy', icon: ShieldCheck },
    { id: 'settings' as NavigationTab, label: 'Settings & Preferences', icon: Settings },
    { id: 'help_support' as NavigationTab, label: 'Help & Support', icon: HelpCircle },
    { id: 'admin_banner' as NavigationTab, label: 'Admin Banner Panel', icon: Settings },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex max-w-[430px] mx-auto overflow-hidden">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Drawer Slide Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="relative w-4/5 max-w-[320px] h-full bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 shadow-2xl flex flex-col justify-between z-10 overflow-y-auto"
          >
            <div>
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <IonLogo size="sm" showTagline={false} />
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Account / Login Card */}
              <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                {currentUser && currentUser.email ? (
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                        {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold truncate text-slate-900 dark:text-white flex items-center gap-1">
                          <span className="truncate">{currentUser.displayName || 'Verified User'}</span>
                          {currentUser.isDemoTester && (
                            <span className="text-[8px] font-black px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-500 border border-cyan-500/30 shrink-0">
                              DEMO
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {currentUser.email}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        onSignOut?.();
                        onClose();
                      }}
                      title="Sign Out"
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div 
                    onClick={() => {
                      onNavigate('auth');
                      onClose();
                    }}
                    className="cursor-pointer p-3 rounded-2xl bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-indigo-500/10 border border-cyan-500/30 flex items-center justify-between hover:border-cyan-500 active:scale-95 transition-all group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-500 flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          Sign In / Demo Login
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          Reviewer credentials available
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-cyan-500 text-white shadow-sm">
                      LOGIN
                    </span>
                  </div>
                )}
              </div>

              {/* Pro Status / Upgrade Banner */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-800">
                {isPro ? (
                  <div 
                    onClick={() => {
                      onNavigate('upgrade_pro');
                      onClose();
                    }}
                    className="cursor-pointer p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 flex items-center justify-between text-amber-600 dark:text-amber-400 text-xs font-bold shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 fill-amber-400 text-amber-500 shrink-0" />
                      <div>
                        <div>ION PRO VIP Active</div>
                        <div className="text-[10px] font-normal text-slate-400">All features unlocked</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                ) : (
                  <div 
                    onClick={() => {
                      onNavigate('upgrade_pro');
                      onClose();
                    }}
                    className="cursor-pointer p-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white flex items-center justify-between shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <Crown className="w-5 h-5 fill-amber-300 text-amber-300 shrink-0" />
                      <div>
                        <div className="text-xs font-black tracking-wide">UPGRADE TO PRO</div>
                        <div className="text-[10px] text-blue-100">Unlock VIP deep cleaning & no ads</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/80" />
                  </div>
                )}
              </div>

              {/* Navigation Menu Links */}
              <nav className="p-3 space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  const isUpgradeItem = item.id === 'upgrade_pro';

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        onClose();
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all ${
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400 font-bold'
                          : isUpgradeItem
                          ? 'bg-amber-50/60 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 font-bold hover:bg-amber-100/60 dark:hover:bg-amber-900/40'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${
                          isActive 
                            ? 'text-blue-600 dark:text-cyan-400' 
                            : isUpgradeItem 
                            ? 'text-amber-500 fill-amber-400/30' 
                            : 'text-slate-400'
                        }`} />
                        <span className="text-xs">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          isUpgradeItem
                            ? 'bg-amber-400 text-slate-950 font-black'
                            : 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-cyan-400'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Drawer Footer Version Info */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-center">
              <div className="text-[11px] font-bold text-slate-400">
                ION Cleaner v3.0.0
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Native Storage & Protection Engine
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
