import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Search, 
  CheckCircle2, 
  CheckSquare, 
  Square,
  Sparkles,
  Image as ImageIcon 
} from 'lucide-react';
import { ScannedFile } from '../types';
import { formatBytes } from '../utils';

interface DuplicateGroupScreenProps {
  files?: ScannedFile[];
  onBack: () => void;
  onKeepBest: () => void;
}

export const DuplicateGroupScreen: React.FC<DuplicateGroupScreenProps> = ({
  files = [],
  onBack,
  onKeepBest,
}) => {
  const duplicates = files.filter(f => f.isDuplicate);
  const duplicateCopies = duplicates.filter(f => !f.isOriginal);
  const totalFreeableBytes = duplicateCopies.reduce((sum, f) => sum + f.size, 0);

  const [selectedFileIds, setSelectedFileIds] = useState<Record<string, boolean>>(() => {
    const initialMap: Record<string, boolean> = {};
    duplicateCopies.forEach(f => {
      initialMap[f.id] = true;
    });
    return initialMap;
  });

  const toggleFile = (id: string) => {
    setSelectedFileIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const isAllSelected = Object.keys(selectedFileIds).length === duplicateCopies.length && duplicateCopies.length > 0;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedFileIds({});
    } else {
      const allSelected: Record<string, boolean> = {};
      duplicateCopies.forEach(f => {
        allSelected[f.id] = true;
      });
      setSelectedFileIds(allSelected);
    }
  };

  return (
    <div className="flex flex-col h-full select-none bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 pb-2">
        {/* Header */}
        <header className="flex items-center justify-between pt-2 mb-2">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-transform"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              Duplicate Group
            </h1>
          </div>
        </header>

        {/* Subtitle / Stat Banner with Select All */}
        <div className="flex items-center justify-between px-1 mb-4">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {duplicates.length > 0 ? `${duplicates.length} duplicate items` : 'No duplicates detected'}
            </span>
            <span className="text-xs font-bold text-blue-600 dark:text-cyan-400">
              {formatBytes(totalFreeableBytes)} recoverable
            </span>
          </div>
          {duplicates.length > 0 && (
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 active:scale-95 transition-transform"
            >
              {isAllSelected ? (
                <>
                  <CheckSquare className="w-3.5 h-3.5 text-blue-500" />
                  Deselect All
                </>
              ) : (
                <>
                  <Square className="w-3.5 h-3.5 text-slate-400" />
                  Select All
                </>
              )}
            </button>
          )}
        </div>

        {/* Dynamic Photo List or Empty State */}
        {duplicates.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 mb-4">
            {duplicates.map((file) => {
              const isSelected = selectedFileIds[file.id];
              const isBest = file.isOriginal;

              return (
                <div
                  key={file.id}
                  onClick={() => !isBest && toggleFile(file.id)}
                  className={`relative rounded-2xl overflow-hidden border-2 transition-all cursor-pointer aspect-[4/3] flex flex-col justify-between p-2.5 ${
                    isBest
                      ? 'border-emerald-500 shadow-sm shadow-emerald-500/10'
                      : isSelected
                      ? 'border-blue-500 dark:border-cyan-400 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-500 to-sky-400 opacity-80" />
                  <div className="absolute inset-0 bg-slate-950/30 backdrop-blur-[1px]" />

                  {/* Top Badge */}
                  <div className="relative z-10 flex items-center justify-between w-full">
                    {isBest ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black tracking-wide flex items-center gap-1 shadow-sm">
                        <CheckCircle2 className="w-3 h-3" />
                        Best
                      </span>
                    ) : (
                      <div />
                    )}

                    {!isBest && (
                      <div className="p-1">
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-cyan-400 drop-shadow-md" />
                        ) : (
                          <Square className="w-5 h-5 text-white/80 drop-shadow-md" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bottom Metadata */}
                  <div className="relative z-10 bg-slate-950/70 backdrop-blur-md rounded-xl p-1.5 text-white">
                    <div className="text-[11px] font-bold leading-tight truncate">{file.name}</div>
                    <div className="text-[9px] text-slate-300 flex items-center justify-between mt-0.5">
                      <span>{file.category}</span>
                      <span className="font-semibold text-cyan-300">{formatBytes(file.size)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 text-center border border-slate-200/80 dark:border-slate-800 my-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Zero Duplicates Found
            </h3>
            <p className="text-xs text-slate-400">
              Your storage is clean and free of duplicate photos or file copies.
            </p>
          </div>
        )}

        {/* ION Recommendation Card */}
        {duplicates.length > 0 && (
          <div className="bg-blue-50/80 dark:bg-blue-950/40 rounded-2xl p-4 border border-blue-100 dark:border-blue-900/40 space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
              Recommendation
            </div>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
              Keep the best quality original file and remove selected duplicates.
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons — outside scroll area, always visible */}
      <div className="shrink-0 p-4 pt-0 space-y-2.5">
        {duplicates.length > 0 ? (
          <button
            onClick={onKeepBest}
            className="w-full relative group overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-2xl py-4 font-bold text-base shadow-lg shadow-cyan-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-cyan-200" />
            <span>KEEP BEST VERSION</span>
          </button>
        ) : (
          <button
            onClick={onBack}
            className="w-full py-4 rounded-2xl bg-slate-900 text-white text-xs font-bold"
          >
            RETURN TO DASHBOARD
          </button>
        )}
      </div>
    </div>
  );
};
