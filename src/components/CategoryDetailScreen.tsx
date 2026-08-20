import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  FileText, 
  Music,
  CheckSquare,
  Square,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { ScannedFile } from '../types';
import { formatBytes } from '../utils/formatters';

/** Resolve the best URL to render a thumbnail for a given file */
function getThumbnailSrc(file: ScannedFile): string | null {
  if (file.thumbnailUrl) return file.thumbnailUrl;
  if (file.nativeUri) {
    try {
      const cap = (window as any).Capacitor;
      if (cap && cap.convertFileSrc) return cap.convertFileSrc(file.nativeUri);
    } catch { /* ignore */ }
    return file.nativeUri;
  }
  return null;
}

interface CategoryDetailScreenProps {
  category: 'images' | 'videos' | 'documents' | 'audio' | string;
  files: ScannedFile[];
  prefilteredFiles?: ScannedFile[];
  title?: string;
  onBack: () => void;
  onClean: (filesToClean: ScannedFile[]) => void;
}

export const CategoryDetailScreen: React.FC<CategoryDetailScreenProps> = ({
  category,
  files,
  prefilteredFiles,
  title,
  onBack,
  onClean
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());

  // Filter files based on category
  const categoryFiles = useMemo(() => {
    if (prefilteredFiles) return prefilteredFiles;
    
    return files.filter(f => {
      if (category === 'images') {
        return f.category === 'screenshot' || f.category === 'image' || f.name.toLowerCase().match(/\.(jpg|jpeg|png|webp|gif|svg)$/);
      }
      if (category === 'videos') {
        return f.category === 'video' || f.name.toLowerCase().match(/\.(mp4|mov|mkv|avi|webm)$/);
      }
      if (category === 'documents') {
        return f.category === 'document' || f.name.toLowerCase().match(/\.(pdf|doc|docx|xls|xlsx|txt|zip|rar)$/);
      }
      if (category === 'audio') {
        return f.category === 'audio' || f.name.toLowerCase().match(/\.(mp3|wav|m4a|flac|aac)$/);
      }
      if (category === 'large') {
        return f.category === 'large' || (f.size && f.size > 50 * 1024 * 1024);
      }
      if (category === 'screenshot') {
        return f.category === 'screenshot';
      }
      if (category === 'blurry') {
        return f.isBlurry;
      }
      if (category === 'other') {
        return (f.isJunk || f.category === 'junk' || f.category === 'cache' || f.category === 'temp') && !f.isDuplicate && f.category !== 'screenshot' && f.category !== 'large' && !f.isBlurry;
      }
      return false;
    });
  }, [files, category, prefilteredFiles]);

  const totalSize = categoryFiles.reduce((sum, f) => sum + (f.size || 0), 0);

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const selectAll = () => {
    if (selectedIds.size === categoryFiles.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(categoryFiles.map(f => f.id)));
    }
  };

  const handleClean = () => {
    const toClean = categoryFiles.filter(f => selectedIds.has(f.id));
    if (toClean.length > 0) {
      onClean(toClean);
    }
  };

  const getHeaderInfo = () => {
    switch (category) {
      case 'images': return { title: 'Images & Photos', icon: <ImageIcon className="w-6 h-6 text-blue-500" /> };
      case 'videos': return { title: 'Videos', icon: <VideoIcon className="w-6 h-6 text-purple-500" /> };
      case 'documents': return { title: 'Documents', icon: <FileText className="w-6 h-6 text-amber-500" /> };
      case 'audio': return { title: 'Audio & Voice', icon: <Music className="w-6 h-6 text-emerald-500" /> };
      default: return { title: 'Files', icon: <FileText className="w-6 h-6 text-slate-500" /> };
    }
  };

  const { title: defaultTitle, icon } = getHeaderInfo();

  const isGridView = category === 'images' || category === 'videos' || category === 'large' || !!prefilteredFiles;

  return (
    // Outer: full height flex column — header | scrollable content | sticky delete bar
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">

      {/* Header */}
      <header className="flex items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold capitalize">
              {title || defaultTitle}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {categoryFiles.length} files • {formatBytes(totalSize)}
            </p>
          </div>
        </div>
        
        {categoryFiles.length > 0 && (
          <button
            onClick={selectAll}
            className="text-sm font-bold text-blue-600 dark:text-cyan-400 p-2 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-xl transition-colors shrink-0"
          >
            {selectedIds.size === categoryFiles.length ? 'Deselect All' : 'Select All'}
          </button>
        )}
      </header>

      {/* Scrollable file grid/list */}
      <div className="flex-1 overflow-y-auto p-4 pb-4" style={{ WebkitOverflowScrolling: 'touch' }}>
        {categoryFiles.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
            <AlertCircle className="w-16 h-16 mb-4 text-slate-400" />
            <h2 className="text-xl font-bold mb-2">No files found</h2>
            <p className="text-sm">We couldn't find any {category} on your device.</p>
          </div>
        ) : (
          <div className={isGridView ? "grid grid-cols-3 gap-2" : "flex flex-col space-y-2"}>
            {categoryFiles.map(file => {
              const thumbSrc = getThumbnailSrc(file);
              const hasImgError = imgErrors.has(file.id);
              const showImage = isGridView && !!thumbSrc && !hasImgError;

              return (
                <div 
                  key={file.id} 
                  onClick={() => toggleSelection(file.id)}
                  className={`
                    relative cursor-pointer overflow-hidden transition-all
                    ${isGridView 
                      ? 'aspect-square rounded-2xl flex flex-col items-center justify-center border-2' 
                      : 'flex items-center gap-4 p-4 rounded-2xl border bg-white dark:bg-slate-900'
                    }
                    ${selectedIds.has(file.id) 
                      ? 'border-blue-500 ring-2 ring-blue-400/30' 
                      : isGridView
                        ? 'border-transparent bg-slate-200 dark:bg-slate-800'
                        : 'border-slate-200/80 dark:border-slate-800'
                    }
                  `}
                >
                  {/* Selection Checkbox */}
                  <div className={`
                    ${isGridView ? 'absolute top-2 right-2' : 'ml-auto order-last'}
                    z-10
                  `}>
                    {selectedIds.has(file.id) ? (
                      <CheckSquare className="w-5 h-5 text-blue-500 drop-shadow-md" />
                    ) : (
                      <Square className="w-5 h-5 text-white drop-shadow-md" />
                    )}
                  </div>

                  {isGridView ? (
                    <>
                      {/* Real thumbnail — video or image */}
                      {showImage ? (
                        category === 'videos' ? (
                          <video
                            src={thumbSrc!}
                            className="absolute inset-0 w-full h-full object-cover"
                            preload="metadata"
                            muted
                            playsInline
                            onLoadedData={(e) => {
                              // Seek slightly to ensure first frame paints
                              e.currentTarget.currentTime = 0.1;
                            }}
                            onError={() => setImgErrors(prev => { const s = new Set(prev); s.add(file.id); return s; })}
                          />
                        ) : (
                          <img
                            src={thumbSrc!}
                            alt={file.name}
                            loading="lazy"
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={() => setImgErrors(prev => { const s = new Set(prev); s.add(file.id); return s; })}
                          />
                        )
                      ) : (
                        <div className="opacity-30">
                          {category === 'images' ? <ImageIcon className="w-10 h-10" /> : <VideoIcon className="w-10 h-10" />}
                        </div>
                      )}

                      {/* Gradient overlay so badge & checkbox are readable over the image */}
                      {showImage && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                      )}

                      {/* File Size Badge */}
                      <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-md z-10">
                        {formatBytes(file.size)}
                      </div>

                      {/* Blue selection tint overlay */}
                      {selectedIds.has(file.id) && (
                        <div className="absolute inset-0 bg-blue-500/20 pointer-events-none" />
                      )}
                    </>
                  ) : (
                    <>
                      {/* Icon for List view */}
                      <div className={`
                        w-12 h-12 rounded-xl flex items-center justify-center shrink-0
                        ${category === 'documents' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'}
                      `}>
                        {category === 'documents' ? <FileText className="w-6 h-6" /> : <Music className="w-6 h-6" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate text-slate-900 dark:text-white">
                          {file.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {formatBytes(file.size)} • {new Date(file.lastModified).toLocaleDateString()}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/*
        Delete button — lives OUTSIDE the scroll area, so it is never clipped.
        Uses opacity + translateY animation instead of translate-y-full (which was
        getting swallowed by the overflow:hidden on the parent scroller).
      */}
      <div
        className={`
          shrink-0 px-4 pb-4 pt-3
          bg-gradient-to-t from-white via-white to-transparent
          dark:from-slate-950 dark:via-slate-950 dark:to-transparent
          transition-all duration-300 ease-out
          ${selectedIds.size > 0
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-3 pointer-events-none h-0 py-0'
          }
        `}
      >
        <button
          onClick={handleClean}
          className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-red-500/30 active:scale-95 transition-all"
        >
          <Trash2 className="w-5 h-5" />
          Delete {selectedIds.size} {selectedIds.size === 1 ? 'Item' : 'Items'}
        </button>
      </div>
    </div>
  );
};
