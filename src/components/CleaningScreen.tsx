import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { formatBytes } from '../utils/formatters';

interface CleaningScreenProps {
  totalBytesToClean: number;
  totalFilesToClean: number;
  isBackendFinished?: boolean;
  onCleanCompleted: () => void;
  onCancel?: () => void;
}

export const CleaningScreen: React.FC<CleaningScreenProps> = ({
  totalBytesToClean,
  totalFilesToClean,
  isBackendFinished = true,
  onCleanCompleted,
  onCancel,
}) => {
  // Guard: only call onCleanCompleted after the component has actually mounted
  // and been visible for at least one render, preventing an instant skip.
  const hasMounted = useRef(false);

  useEffect(() => {
    // Skip the very first render
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    if (isBackendFinished) {
      onCleanCompleted();
    }
  }, [isBackendFinished, onCleanCompleted]);

  // Circle Math
  const radius = 95;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  // Indeterminate spinner takes 25% of the circle
  const strokeDashoffset = circumference - (25 / 100) * circumference;

  return (
    <div className="flex flex-col h-full min-h-[600px] justify-between p-4 pb-16 select-none bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      {/* Header */}
      <header className="flex items-center gap-3 pt-2">
        {/* Only allow cancelling after the backend operation has completed */}
        {onCancel && isBackendFinished && (
          <button
            onClick={onCancel}
            className="p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-transform"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">
          Cleaning...
        </h1>
      </header>

      {/* Center: ION Ring Gauge with Animated Cleaning Progress */}
      <div className="flex flex-col items-center justify-center my-auto space-y-6">
        <div className="relative w-64 h-64 flex items-center justify-center">
          <motion.svg 
            className="w-full h-full transform -rotate-90" 
            viewBox="0 0 220 220"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          >
            <defs>
              <linearGradient id="cleanRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="50%" stopColor="#06B6D4" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
              <filter id="cleanRingGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="6" floodColor="#10B981" floodOpacity="0.3" />
              </filter>
            </defs>

            {/* Background Track */}
            <circle
              cx="110"
              cy="110"
              r={radius}
              className="stroke-slate-200/70 dark:stroke-slate-800"
              strokeWidth={strokeWidth}
              fill="none"
            />

            {/* Indeterminate Progress Circle */}
            <circle
              cx="110"
              cy="110"
              r={radius}
              stroke="url(#cleanRingGradient)"
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              filter="url(#cleanRingGlow)"
            />
          </motion.svg>
        </div>

        {/* Status Message */}
        <div className="text-center space-y-1.5 px-4 max-w-xs">
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Cleaning your storage...
          </h2>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Please don't close the app.
          </p>
        </div>
      </div>

      {/* Target Stats at Bottom */}
      <div className="grid grid-cols-2 gap-3 pt-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center shadow-sm">
          <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mb-0.5">
            Targeting
          </div>
          <div className="text-base font-black text-blue-600 dark:text-cyan-400">
            {formatBytes(totalBytesToClean)}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center shadow-sm">
          <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mb-0.5">
            Target Files
          </div>
          <div className="text-base font-black text-emerald-600 dark:text-emerald-400">
            {totalFilesToClean}
          </div>
        </div>
      </div>
    </div>
  );
};
