import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trash2, 
  RotateCcw, 
  ShieldCheck, 
  ArrowLeft, 
  Calendar, 
  AlertTriangle,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  CheckCircle2
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { RecycleBinItem } from '../types';
import { formatBytes } from '../utils';

interface RecycleBinScreenProps {
  items: RecycleBinItem[];
  onRestoreItem: (item: RecycleBinItem) => void;
  onPermanentlyDeleteItem: (item: RecycleBinItem) => void;
  onClearAll: () => void;
  onBack: () => void;
}

export const RecycleBinScreen: React.FC<RecycleBinScreenProps> = ({
  items,
  onRestoreItem,
  onPermanentlyDeleteItem,
  onClearAll,
  onBack,
}) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showClearAllModal, setShowClearAllModal] = useState(false);

  const totalBytes = items.reduce((sum, i) => sum + i.size, 0);

  const getIcon = (item: RecycleBinItem) => {
    switch (item.category) {
      case 'image':
      case 'screenshot':
      case 'video':
      case 'large':
        if (item.fileData?.thumbnailUrl || item.fileData?.nativeUri) {
          const src = item.fileData.thumbnailUrl || (item.fileData.nativeUri ? Capacitor.convertFileSrc(item.fileData.nativeUri) : '');
          
          if (item.mimeType?.startsWith('video/') || item.category === 'video' || (item.category === 'large' && item.mimeType?.startsWith('video/'))) {
            if (item.fileData?.thumbnailUrl) {
              return <img src={src} alt={item.name} className="absolute inset-0 w-full h-full object-cover" />;
            }
            return (
              <video
                src={src}
                className="absolute inset-0 w-full h-full object-cover"
                preload="metadata"
                muted
                playsInline
                onLoadedData={(e) => {
                  e.currentTarget.currentTime = 0.1;
                }}
              />
            );
          }

          return (
            <img 
              src={src} 
              alt={item.name} 
              className="absolute inset-0 w-full h-full object-cover"
            />
          );
        }
        if (item.category === 'image' || item.category === 'screenshot') {
          return <ImageIcon className="w-8 h-8 text-blue-800 dark:text-blue-400" />;
        }
        return <Video className="w-8 h-8 text-purple-800 dark:text-purple-400" />;
      case 'audio':
        return <Music className="w-8 h-8 text-amber-400" />;
      default:
        return <FileText className="w-8 h-8 text-emerald-800 dark:text-emerald-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white select-none">
      {/* Top Header — shrink-0 so it never scrolls away */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/80 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold">Recycle Bin</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">30-Day Safe Recovery Protection</p>
          </div>
        </div>
        {items.length > 0 && (
          <button
            onClick={() => setShowClearAllModal(true)}
            className="px-3 py-1.5 rounded-xl bg-rose-100 dark:bg-rose-500/20 hover:bg-rose-200 dark:bg-rose-500/30 text-rose-600 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-500/30 transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Empty Bin</span>
          </button>
        )}
      </div>

      {/* Info Banner */}
      <div className="p-4">
        <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-500/30 rounded-2xl p-3.5 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <p className="font-semibold text-blue-800 dark:text-blue-200">Guaranteed 30-Day Recovery</p>
            <p className="text-slate-500 dark:text-slate-400">
              Cleaned files are safely preserved here for 30 days. You can restore any file with one tap before it is permanently purged.
            </p>
          </div>
        </div>
      </div>

      {/* Storage Summary */}
      <div className="px-4 pb-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
        <span>{items.length} items preserved</span>
        <span>Total: <strong className="text-slate-900 dark:text-white font-bold">{formatBytes(totalBytes)}</strong></span>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-2.5">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-600 dark:text-slate-300">Recycle Bin is Empty</h3>
            <p className="text-xs text-slate-500 max-w-xs">
              Files you clean from ION with backup protection will be stored here for 30 days.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 rounded-2xl overflow-hidden flex flex-col shadow-md relative"
              >
                {/* Preview Area */}
                <div className="aspect-square bg-slate-100 dark:bg-slate-900 flex items-center justify-center relative">
                  {getIcon(item)}
                  {/* File Size Badge */}
                  <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-md z-10">
                    {formatBytes(item.size)}
                  </div>
                </div>

                {/* Info & Actions Area */}
                <div className="p-3 flex flex-col justify-between flex-1 gap-2">
                  <div className="min-w-0">
                    <h4 className="text-[11px] font-bold text-slate-900 dark:text-slate-100 truncate">{item.name}</h4>
                    <span className="flex items-center gap-1 text-[10px] text-cyan-600 dark:text-cyan-400 mt-1">
                      <Calendar className="w-3 h-3" />
                      {item.remainingDays} days left
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5 mt-auto">
                    <button
                      onClick={() => onRestoreItem(item)}
                      title="Restore File"
                      className="flex-1 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-md flex items-center justify-center gap-1 text-[10px] font-semibold"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Restore</span>
                    </button>
                    <button
                      onClick={() => onPermanentlyDeleteItem(item)}
                      title="Permanently Delete"
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-slate-500 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Clear All Confirmation Modal */}
      <AnimatePresence>
        {showClearAllModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-50 dark:bg-slate-900 border border-rose-200 dark:border-rose-500/30 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-200 dark:border-rose-500/30">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1.5">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Empty Recycle Bin?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  This will permanently delete all {items.length} items ({formatBytes(totalBytes)}). This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={() => setShowClearAllModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onClearAll();
                    setShowClearAllModal(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-slate-900 dark:text-white text-xs font-bold shadow-lg shadow-rose-600/30"
                >
                  Empty Now
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
