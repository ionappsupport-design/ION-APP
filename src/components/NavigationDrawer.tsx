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
import { IonLogo } from './IonLogo';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: NavigationTab;
  onNavigate: (tab: NavigationTab) => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  currentTab,
  onNavigate,
}) => {
  const menuItems = [
    { id: 'home' as NavigationTab, label: 'Dashboard & Scanner', icon: Home },
    { id: 'storage_overview' as NavigationTab, label: 'Storage Overview', icon: BarChart2 },
    { id: 'recycle_bin' as NavigationTab, label: 'Recycle Bin (30d Recovery)', icon: Trash2, badge: 'Recovery' },
    { id: 'video_compressor' as NavigationTab, label: 'Video Compressor', icon: Zap },
    { id: 'social_cleaner' as NavigationTab, label: 'Social Media Cleaner', icon: Layers },
    { id: 'reports' as NavigationTab, label: 'Monthly Storage Report', icon: FileText },
    { id: 'security' as NavigationTab, label: 'Security & Privacy', icon: ShieldCheck },
    { id: 'settings' as NavigationTab, label: 'Settings & Preferences', icon: Settings },
    { id: 'help_support' as NavigationTab, label: 'Help & Support', icon: HelpCircle },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex max-w-[430px] mx-auto overflow-hidden">
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

              <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-800">
                <div className="mt-3 p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                  <Crown className="w-4 h-4 shrink-0" />
                  <span>ION Cleaner Active</span>
                </div>
              </div>

              {/* Navigation Menu Links */}
              <nav className="p-3 space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;

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
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600 dark:text-cyan-400' : 'text-slate-400'}`} />
                        <span className="text-xs">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[9px] font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-cyan-400 px-2 py-0.5 rounded-full">
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
