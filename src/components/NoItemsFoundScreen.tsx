import React from 'react';
import { ArrowLeft, Box, Sparkles, CheckCircle2 } from 'lucide-react';
import { NavigationTab } from '../types';

interface NoItemsFoundScreenProps {
  onBack: () => void;
  onScanAgain: () => void;
}

export const NoItemsFoundScreen: React.FC<NoItemsFoundScreenProps> = ({
  onBack,
  onScanAgain,
}) => {
  return (
    <div className="flex flex-col h-full select-none bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto flex flex-col p-4">
        {/* Header */}
        <header className="flex items-center gap-3 pt-2 mb-6">
          <button
            onClick={onBack}
            className="p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-transform"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">
            No Items Found
          </h1>
        </header>

        {/* Center 3D Box Illustration & Empty Message */}
        <div className="flex flex-col items-center text-center my-auto space-y-6">
          <div className="relative w-44 h-44 flex items-center justify-center">
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-blue-500/15 dark:bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />

            {/* Glowing 3D Clean Cube Graphic */}
            <div className="relative w-36 h-36 rounded-3xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-emerald-400 p-1 shadow-2xl shadow-cyan-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[22px] flex items-center justify-center">
                <Box className="w-20 h-20 text-blue-600 dark:text-cyan-400 drop-shadow-md" />
              </div>
            </div>
          </div>

          <div className="space-y-1.5 px-4">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              No unnecessary files found
            </h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Your storage looks great!
            </p>
          </div>
        </div>
      </div>

      {/* Action Button: SCAN AGAIN — outside scroll area, always visible */}
      <div className="shrink-0 p-4 pt-0">
        <button
          onClick={onScanAgain}
          className="w-full relative group overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-2xl py-4 font-bold text-base shadow-lg shadow-cyan-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5 text-cyan-200" />
          <span>SCAN AGAIN</span>
        </button>
      </div>
    </div>
  );
};
