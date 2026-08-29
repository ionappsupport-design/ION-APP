import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Folder as FolderIcon 
} from 'lucide-react';
import { ScannedFile } from '../types';

interface ScanScreenProps {
  files: ScannedFile[];
  isNativeScanning: boolean;
  onScanCompleted: () => void;
  onCancel: () => void;
  storageOverview?: any;
  onNavigateToReview?: () => void;
  onNavigateToJunk?: () => void;
  onNavigateToDuplicates?: () => void;
  onNavigateToLarge?: () => void;
  onQuickClean?: (files: any[]) => void;
}

export const ScanScreen: React.FC<ScanScreenProps> = ({
  isNativeScanning,
  onScanCompleted,
  onCancel,
}) => {
  // Listen for native scan completion
  useEffect(() => {
    if (!isNativeScanning) {
      onScanCompleted();
    }
  }, [isNativeScanning, onScanCompleted]);

  const radius = 95;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  // Indeterminate spinner takes 25% of the circle
  const strokeDashoffset = circumference - (25 / 100) * circumference;

  return (
    <div className="flex flex-col h-full min-h-[600px] justify-between p-4 pb-12 select-none bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      {/* Header with Back button — disabled while scan is in progress */}
      <header className="flex items-center gap-3 pt-2">
        <button
          onClick={onCancel}
          disabled={isNativeScanning}
          className="p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-transform disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">
          Scanning...
        </h1>
      </header>

      {/* Center: Signature ION Ring */}
      <div className="flex flex-col items-center justify-center my-auto space-y-6">
        <div className="relative w-64 h-64 flex items-center justify-center">
          <motion.svg 
            className="w-full h-full transform -rotate-90" 
            viewBox="0 0 220 220"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          >
            <defs>
              <linearGradient id="scanRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="50%" stopColor="#06B6D4" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
              <filter id="scanRingGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="6" floodColor="#06B6D4" floodOpacity="0.3" />
              </filter>
            </defs>

            {/* Background Circle */}
            <circle
              cx="110"
              cy="110"
              r={radius}
              className="stroke-slate-200/70 dark:stroke-slate-800"
              strokeWidth={strokeWidth}
              fill="none"
            />

            {/* Dynamic Indeterminate Progress Circle */}
            <circle
              cx="110"
              cy="110"
              r={radius}
              stroke="url(#scanRingGradient)"
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </motion.svg>
        </div>

        {/* Status Message */}
        <div className="text-center space-y-1.5 px-4 max-w-xs">
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Scanning storage...
          </h2>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Please wait while ION finds items you can review.
          </p>
        </div>
      </div>

      {/* Bottom Category Status Indicators */}
      <div className="grid grid-cols-3 gap-2.5 pt-4">
        {/* Photos Indicator */}
        <div className="p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-cyan-400 mb-1">
            <ImageIcon className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Photos</span>
        </div>

        {/* Videos Indicator */}
        <div className="p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center bg-cyan-50 dark:bg-cyan-950/40 border-cyan-300 dark:border-cyan-700 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-1">
            <VideoIcon className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Videos</span>
        </div>

        {/* Files Indicator */}
        <div className="p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-1">
            <FolderIcon className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Files</span>
        </div>
      </div>
    </div>
  );
};
