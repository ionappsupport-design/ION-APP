import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Search, 
  CheckSquare, 
  Square, 
  Copy, 
  Video, 
  Smartphone, 
  Image as ImageIcon, 
  FileText,
  ChevronRight 
} from 'lucide-react';
import { ScannedFile, CleaningRecommendation, NavigationTab } from '../types';
import { formatBytes } from '../utils/formatters';
import { filterSelectedFiles } from '../utils/selectionUtils';

interface ReviewSelectScreenProps {
  files: ScannedFile[];
  recommendations?: CleaningRecommendation[];
  onContinueToBackup?: (selectedFiles: ScannedFile[]) => void;
  onProceedToClean?: (selectedFiles: ScannedFile[]) => void;
  onOpenDuplicateGroup?: () => void;
  onNavigateToCategory?: (category: string) => void;
  onBack: () => void;
  onNavigate?: (tab: NavigationTab) => void;
}

export const ReviewSelectScreen: React.FC<ReviewSelectScreenProps> = ({
  files,
  recommendations = [],
  onContinueToBackup,
  onProceedToClean,
  onOpenDuplicateGroup,
  onNavigateToCategory,
  onBack,
  onNavigate,
}) => {
  const [activeFilter, setActiveFilter] = useState<'All' | 'Duplicate' | 'Screenshots' | 'Large' | 'Blurry' | 'Other'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Selection states for each category
  const [selectedCategories, setSelectedCategories] = useState<Record<string, boolean>>({
    duplicate: false,
    large: false,
    screenshot: false,
    blurry: false,
    junk: false,
  });

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => ({
      ...prev,
      [cat]: !prev[cat]
    }));
  };

  const selectAll = () => {
    setSelectedCategories({
      duplicate: true,
      large: true,
      screenshot: true,
      blurry: true,
      junk: true,
    });
  };

  const deselectAll = () => {
    setSelectedCategories({
      duplicate: false,
      large: false,
      screenshot: false,
      blurry: false,
      junk: false,
    });
  };

  // Compute category statistics dynamically from scanned files
  const duplicateFiles = files.filter(f => f.isDuplicate && !f.isOriginal);
  const largeFiles = files.filter(f => f.category === 'large' || f.size > 20 * 1024 * 1024);
  const screenshotFiles = files.filter(f => f.category === 'screenshot' || f.name.toLowerCase().includes('screenshot') || f.path.toLowerCase().includes('screenshot'));
  const blurryFiles = files.filter(f => f.isBlurry || f.category === 'blurry');
  const junkFiles = files.filter(f => f.isJunk || f.category === 'junk' || f.category === 'cache' || f.category === 'temp');

  const duplicateHashes = new Set(duplicateFiles.map(f => f.hash || f.name));

  const categoryStats = {
    duplicate: {
      count: duplicateFiles.length,
      groups: duplicateHashes.size > 0 ? duplicateHashes.size : Math.ceil(duplicateFiles.length / 2),
      size: duplicateFiles.reduce((sum, f) => sum + (f.size || 0), 0),
      label: 'Duplicate Photos',
      files: duplicateFiles
    },
    large: {
      count: largeFiles.length,
      size: largeFiles.reduce((sum, f) => sum + (f.size || 0), 0),
      label: 'Large Files',
      files: largeFiles
    },
    screenshot: {
      count: screenshotFiles.length,
      size: screenshotFiles.reduce((sum, f) => sum + (f.size || 0), 0),
      label: 'Screenshots',
      files: screenshotFiles
    },
    blurry: {
      count: blurryFiles.length,
      size: blurryFiles.reduce((sum, f) => sum + (f.size || 0), 0),
      label: 'Blurry Photos',
      files: blurryFiles
    },
    junk: {
      count: junkFiles.length,
      size: junkFiles.reduce((sum, f) => sum + (f.size || 0), 0),
      label: 'Temporary & Cache Junk',
      files: junkFiles
    },
  };

  // Calculate totals for selected items
  let totalSelectedFiles = 0;
  let totalSelectedBytes = 0;

  if (selectedCategories.duplicate) {
    totalSelectedFiles += categoryStats.duplicate.count;
    totalSelectedBytes += categoryStats.duplicate.size;
  }
  if (selectedCategories.large) {
    totalSelectedFiles += categoryStats.large.count;
    totalSelectedBytes += categoryStats.large.size;
  }
  if (selectedCategories.screenshot) {
    totalSelectedFiles += categoryStats.screenshot.count;
    totalSelectedBytes += categoryStats.screenshot.size;
  }
  if (selectedCategories.blurry) {
    totalSelectedFiles += categoryStats.blurry.count;
    totalSelectedBytes += categoryStats.blurry.size;
  }
  if (selectedCategories.junk) {
    totalSelectedFiles += categoryStats.junk.count;
    totalSelectedBytes += categoryStats.junk.size;
  }

  const handleContinue = () => {
    const selected = filterSelectedFiles(files, selectedCategories);

    const cleanHandler = onContinueToBackup || onProceedToClean;
    if (cleanHandler && selected.length > 0) {
      cleanHandler(selected);
    }
  };

  return (
    <div className="flex flex-col h-full select-none bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto p-4 pb-2">
        {/* Header with Search */}
        <header className="flex items-center justify-between pt-2 mb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-transform"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              Review & Select
            </h1>
          </div>

          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-transform"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>
        </header>

        {/* Search Bar Input (Toggleable) */}
        {isSearchOpen && (
          <div className="mb-3">
            <input
              type="text"
              placeholder="Search files or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Status Strip: Files Selected & Size to be removed */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between mb-3">
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {totalSelectedFiles} files selected
            </div>
            <div className="text-xs font-semibold text-blue-600 dark:text-cyan-400">
              {formatBytes(totalSelectedBytes)} to be removed
            </div>
          </div>

          {/* Quick Select / Deselect All Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={selectAll}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-cyan-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
            >
              Select All
            </button>
            <button
              onClick={deselectAll}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Deselect All
            </button>
          </div>
        </div>

        {/* Horizontal Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none mb-3">
          {(['All', 'Duplicate', 'Screenshots', 'Large', 'Blurry', 'Other'] as const).map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/70 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {filter === 'Large' ? 'Large Files' : filter}
              </button>
            );
          })}
        </div>

        {/* Group Review Items List with Checkboxes */}
        <div className="space-y-2.5">
          {/* Duplicate Photos Group */}
          {(activeFilter === 'All' || activeFilter === 'Duplicate') && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div 
                onClick={onOpenDuplicateGroup}
                className="flex items-center gap-3 cursor-pointer flex-1"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-cyan-400 flex items-center justify-center">
                  <Copy className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    Duplicate Photos
                    <ChevronRight className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                  <div className="text-xs text-slate-400">
                    {categoryStats.duplicate.groups} groups • {categoryStats.duplicate.count} files
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  {formatBytes(categoryStats.duplicate.size)}
                </span>
                <button
                  onClick={() => toggleCategory('duplicate')}
                  className="text-blue-600 dark:text-cyan-400 p-1"
                  aria-label="Toggle duplicate selection"
                >
                  {selectedCategories.duplicate ? (
                    <CheckSquare className="w-5 h-5" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Large Files */}
          {(activeFilter === 'All' || activeFilter === 'Large') && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div 
                className="flex items-center gap-3 flex-1 cursor-pointer"
                onClick={() => onNavigateToCategory?.('large')}
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    Large Files
                    <ChevronRight className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <div className="text-xs text-slate-400">
                    {categoryStats.large.count} files
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  {formatBytes(categoryStats.large.size)}
                </span>
                <button
                  onClick={() => toggleCategory('large')}
                  className="text-blue-600 dark:text-cyan-400 p-1"
                  aria-label="Toggle large files selection"
                >
                  {selectedCategories.large ? (
                    <CheckSquare className="w-5 h-5" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Screenshots */}
          {(activeFilter === 'All' || activeFilter === 'Screenshots') && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div 
                className="flex items-center gap-3 flex-1 cursor-pointer"
                onClick={() => onNavigateToCategory?.('screenshot')}
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    Screenshots
                    <ChevronRight className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <div className="text-xs text-slate-400">
                    {categoryStats.screenshot.count} files
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  {formatBytes(categoryStats.screenshot.size)}
                </span>
                <button
                  onClick={() => toggleCategory('screenshot')}
                  className="text-blue-600 dark:text-cyan-400 p-1"
                  aria-label="Toggle screenshot selection"
                >
                  {selectedCategories.screenshot ? (
                    <CheckSquare className="w-5 h-5" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Blurry Photos */}
          {(activeFilter === 'All' || activeFilter === 'Blurry') && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div 
                className="flex items-center gap-3 flex-1 cursor-pointer"
                onClick={() => onNavigateToCategory?.('blurry')}
              >
                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    Blurry Photos
                    <ChevronRight className="w-3.5 h-3.5 text-rose-500" />
                  </div>
                  <div className="text-xs text-slate-400">
                    {categoryStats.blurry.count} files
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  {formatBytes(categoryStats.blurry.size)}
                </span>
                <button
                  onClick={() => toggleCategory('blurry')}
                  className="text-blue-600 dark:text-cyan-400 p-1"
                  aria-label="Toggle blurry photos selection"
                >
                  {selectedCategories.blurry ? (
                    <CheckSquare className="w-5 h-5" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Temporary & Cache Junk */}
          {(activeFilter === 'All' || activeFilter === 'Other') && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-5 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/20 text-purple-500 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg">
                      {categoryStats.junk.label}
                    </h3>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    {categoryStats.junk.count} files
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatBytes(categoryStats.junk.size)}
                </span>
                <button 
                  onClick={() => toggleCategory('junk')}
                  className="p-1.5 focus:outline-none"
                >
                  {selectedCategories.junk ? (
                    <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-md border-2 border-slate-300 dark:border-slate-600" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Bottom Button: CONTINUE — outside scroll area, always visible */}
      <div className="shrink-0 p-4 pt-0">
        <button
          onClick={handleContinue}
          disabled={totalSelectedFiles === 0}
          className="w-full relative group overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 disabled:opacity-50 text-white rounded-2xl py-4 font-bold text-base shadow-lg shadow-cyan-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <span>CONTINUE</span>
        </button>
      </div>
    </div>
  );
};
