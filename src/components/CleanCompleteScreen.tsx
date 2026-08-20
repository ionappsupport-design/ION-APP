import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import { formatBytes } from '../utils/formatters';
import { NavigationTab } from '../types';

interface CleanCompleteScreenProps {
  freedBytes: number;
  freedCount: number;
  onDone: () => void;
  onViewDetails: () => void;
}

export const CleanCompleteScreen: React.FC<CleanCompleteScreenProps> = ({
  freedBytes,
  freedCount,
  onDone,
  onViewDetails,
}) => {
  const displayBytes = freedBytes;
  const displayCount = freedCount;

  return (
    <div className="flex flex-col h-full select-none bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-6 text-center">
        {/* Spacer */}
        <div className="pt-4" />

        {/* Main Success Celebration Container */}
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Animated Green Checkmark Ring with Glow & Sparkles */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-36 h-36 flex items-center justify-center"
          >
            {/* Ambient celebration particles / glow */}
            <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-2xl animate-pulse" />

            {/* Glowing Green Ring */}
            <div className="relative w-28 h-28 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-400 p-1 shadow-2xl shadow-emerald-500/30 flex items-center justify-center">
              <div className="w-full h-full bg-white dark:bg-slate-900 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-14 h-14 text-emerald-500" />
              </div>
            </div>

            {/* Decorative Sparkles */}
            <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-amber-400 animate-bounce" />
            <Sparkles className="absolute -bottom-2 -left-2 w-5 h-5 text-cyan-400 animate-pulse" />
          </motion.div>

          {/* Heading & Subtitle */}
          <div className="space-y-1.5 px-2">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Great! You saved
            </h1>
            <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">
              {formatBytes(displayBytes)}
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 pt-1">
              Your storage is now optimized.
            </p>
          </div>

          {/* 2-Column Summary Stat Cards */}
          <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center shadow-sm">
              <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mb-0.5">
                Files cleaned
              </div>
              <div className="text-lg font-black text-slate-900 dark:text-white">
                {displayCount}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center shadow-sm">
              <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mb-0.5">
                Space saved
              </div>
              <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                {formatBytes(displayBytes)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons: DONE and VIEW DETAILS — outside scroll area, always visible */}
      <div className="shrink-0 p-6 pt-4 space-y-3 w-full">
        <button
          onClick={onDone}
          className="w-full relative group overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-2xl py-4 font-bold text-base shadow-lg shadow-cyan-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <span>DONE</span>
        </button>

        <button
          onClick={onViewDetails}
          className="w-full py-3.5 rounded-2xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors uppercase tracking-wider text-center"
        >
          VIEW DETAILS
        </button>
      </div>
    </div>
  );
};
