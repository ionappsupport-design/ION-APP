import React from 'react';
import { Sparkles, Crown, Zap, Shield, ChevronRight } from 'lucide-react';
import { NavigationTab } from '../types';

interface BottomBannerAdProps {
  isPro: boolean;
  onUpgradeClick: () => void;
}

export const BottomBannerAd: React.FC<BottomBannerAdProps> = ({
  isPro,
  onUpgradeClick,
}) => {
  // If user is Pro or in active 7-Day Free Trial, do NOT show any banner ad
  if (isPro) {
    return null;
  }

  return (
    <div className="shrink-0 px-3 py-1.5 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
      <div 
        onClick={onUpgradeClick}
        className="cursor-pointer group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-900/60 via-slate-900 to-indigo-950/70 p-2.5 border border-blue-500/30 flex items-center justify-between shadow-sm hover:border-amber-500/50 transition-all"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 shrink-0 flex items-center justify-center shadow-md">
            <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center">
              <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
            </div>
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-400 text-slate-950">
                AD • ₹150 PRO
              </span>
              <span className="text-xs font-bold text-white truncate">
                Upgrade to ION Lifetime Pro
              </span>
            </div>
            <span className="text-[10px] text-slate-400 truncate">
              Remove all ads & unlock Turbo Video Compressor
            </span>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onUpgradeClick();
          }}
          className="shrink-0 ml-2 px-2.5 py-1 rounded-lg bg-blue-600 group-hover:bg-amber-500 group-hover:text-slate-950 text-white font-bold text-[10px] flex items-center gap-1 shadow-sm transition-colors"
        >
          <span>₹150</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
