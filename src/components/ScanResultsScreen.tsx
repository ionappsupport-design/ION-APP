import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Copy, 
  Video, 
  Smartphone, 
  Image as ImageIcon, 
  FileText,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { ScannedFile, CleaningRecommendation, NavigationTab } from '../types';
import { formatBytes } from '../utils/formatters';

interface ScanResultsScreenProps {
  files: ScannedFile[];
  recommendations: CleaningRecommendation[];
  onCleanNow?: () => void;
  onReviewSelect: () => void;
  onBack: () => void;
  onNavigate: (tab: NavigationTab) => void;
}

export const ScanResultsScreen: React.FC<ScanResultsScreenProps> = ({
  files,
  recommendations,
  onCleanNow,
  onReviewSelect,
  onBack,
  onNavigate,
}) => {
  // Compute Real Category Totals from Scanned Files
  const duplicateFiles = files.filter(f => f.isDuplicate && !f.isOriginal);
  const duplicateBytes = duplicateFiles.reduce((sum, f) => sum + f.size, 0);
  const duplicateCount = duplicateFiles.length;

  const largeFiles = files.filter(f => f.category === 'large' || f.size > 20 * 1024 * 1024);
  const largeBytes = largeFiles.reduce((sum, f) => sum + f.size, 0);
  const largeCount = largeFiles.length;

  const screenshotFiles = files.filter(f => f.category === 'screenshot' || f.name.toLowerCase().includes('screenshot') || f.path.toLowerCase().includes('screenshot'));
  const screenshotBytes = screenshotFiles.reduce((sum, f) => sum + f.size, 0);
  const screenshotCount = screenshotFiles.length;

  const junkFiles = files.filter(f => f.isJunk || f.category === 'junk' || f.category === 'temp' || f.category === 'cache');
  const junkBytes = junkFiles.reduce((sum, f) => sum + f.size, 0);
  const junkCount = junkFiles.length;

  const otherFiles = files.filter(f => !f.isDuplicate && !f.isJunk && f.category !== 'screenshot' && !f.name.toLowerCase().includes('screenshot') && !f.path.toLowerCase().includes('screenshot') && (f.category !== 'large' && f.size <= 20 * 1024 * 1024));
  const otherBytes = otherFiles.reduce((sum, f) => sum + f.size, 0);
  const otherCount = otherFiles.length;

  const totalRecoverableBytes = duplicateBytes + largeBytes + screenshotBytes + junkBytes;
  const totalFileCount = duplicateCount + largeCount + screenshotCount + junkCount;

  return (
    <div className="flex flex-col h-full min-h-[600px] justify-between p-4 pb-20 select-none bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      <div>
        {/* Header with Back button */}
        <header className="flex items-center gap-3 pt-2 mb-4">
          <button
            onClick={onBack}
            className="p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-transform"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">
            Scan Results
          </h1>
        </header>

        {/* Hero Card: Recoverable GB is Hero */}
        <div className="bg-white dark:bg-slate-900 rounded-[28px] p-6 text-center border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
          {/* Subtle Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none" />

          {/* Hero Circular Badge Container */}
          <div className="w-36 h-36 mx-auto rounded-full border-4 border-cyan-400/30 dark:border-cyan-500/20 bg-gradient-to-b from-blue-50/50 to-cyan-50/50 dark:from-blue-950/30 dark:to-cyan-950/30 flex flex-col items-center justify-center p-3 shadow-inner mb-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatBytes(totalRecoverableBytes)}
            </span>
            <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mt-0.5">
              Potentially
            </span>
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
              Recoverable
            </span>
          </div>

          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {totalFileCount} files found
          </div>
        </div>

        {/* Space Breakdown Section */}
        <div className="mt-5 space-y-2.5">
          <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">
            Space breakdown
          </h2>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-2 border border-slate-200/80 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800/60">
            {/* Duplicate Photos */}
            <div 
              onClick={onReviewSelect}
              className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-2xl cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-cyan-400 flex items-center justify-center">
                  <Copy className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    Duplicate Photos
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {duplicateCount} duplicate files
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  {formatBytes(duplicateBytes)}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Large Files */}
            <div 
              onClick={onReviewSelect}
              className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-2xl cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    Large Files
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {largeCount} files
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  {formatBytes(largeBytes)}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Screenshots */}
            <div 
              onClick={onReviewSelect}
              className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-2xl cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    Screenshots
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {screenshotCount} files
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  {formatBytes(screenshotBytes)}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Temporary & Cache Junk */}
            <div 
              onClick={onReviewSelect}
              className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-2xl cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    Temporary & Cache Junk
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {junkCount} files
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  {formatBytes(junkBytes)}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Other Files */}
            <div 
              onClick={onReviewSelect}
              className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-2xl cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    Other Scanned Files
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {otherCount} files
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  {formatBytes(otherBytes)}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Action Button: REVIEW & SELECT */}
      <div className="pt-4">
        <button
          onClick={onReviewSelect}
          className="w-full relative group overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-2xl py-4 font-bold text-base shadow-lg shadow-cyan-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <span>REVIEW & SELECT</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
