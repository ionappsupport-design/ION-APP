import React from 'react';
import { 
  Home, 
  BarChart2, 
  FileText, 
  ShieldCheck, 
  Settings 
} from 'lucide-react';
import { NavigationTab } from '../types';

interface BottomNavBarProps {
  currentTab: NavigationTab;
  onNavigate: (tab: NavigationTab) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  onNavigate,
}) => {
  const tabs = [
    { id: 'home' as NavigationTab, label: 'Home', icon: Home },
    { id: 'storage_overview' as NavigationTab, label: 'Overview', icon: BarChart2 },
    { id: 'reports' as NavigationTab, label: 'Report', icon: FileText },
    { id: 'security' as NavigationTab, label: 'Security', icon: ShieldCheck },
    { id: 'settings' as NavigationTab, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="shrink-0 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 px-3 py-2 flex items-center justify-around shadow-lg z-30">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = 
          currentTab === tab.id || 
          (tab.id === 'home' && (currentTab === 'scan' || currentTab === 'scan_results' || currentTab === 'review_select' || currentTab === 'duplicate_group' || currentTab === 'backup_prompt' || currentTab === 'cleaning' || currentTab === 'clean_complete' || currentTab === 'no_items_found'));

        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 ${
              isActive
                ? 'text-blue-600 dark:text-cyan-400 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
