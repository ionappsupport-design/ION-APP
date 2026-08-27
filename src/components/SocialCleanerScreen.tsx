import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Trash2, 
  CheckCircle2, 
  FolderCheck, 
  AlertCircle,
  MessageSquare,
  Send,
  Sparkles
} from 'lucide-react';
import { ScannedFile, SocialAppMediaCategory } from '../types';
import { formatBytes } from '../utils';
import { categorizeSocialMedia } from '../services/socialCleaner';
import { scanSocialMediaNative } from '../services/nativeStorageBridge';

interface SocialCleanerScreenProps {
  files: ScannedFile[];
  onBack: () => void;
  onReviewCategory: (categoryTitle: string, filesToReview: ScannedFile[]) => void;
  onScanFolder?: (initialUri?: string) => void;
}

export const SocialCleanerScreen: React.FC<SocialCleanerScreenProps> = ({
  files,
  onBack,
  onReviewCategory,
  onScanFolder,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'WhatsApp' | 'Telegram'>('all');
  const [deepFiles, setDeepFiles] = useState<ScannedFile[]>([]);
  const [isScanning, setIsScanning] = useState(true);

  // Auto-scan social media folders natively when opened
  React.useEffect(() => {
    let mounted = true;
    scanSocialMediaNative().then((res) => {
      if (mounted) {
        setDeepFiles(res.files);
        setIsScanning(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  const combinedFiles = [...files, ...deepFiles];
  // Deduplicate by ID just in case
  const uniqueFiles = Array.from(new Map(combinedFiles.map(item => [item.id, item])).values());

  const categories = categorizeSocialMedia(uniqueFiles);

  const filteredCategories = activeTab === 'all'
    ? categories
    : categories.filter((c) => c.appName === activeTab);

  const totalSocialBytes = categories.reduce((sum, c) => sum + c.sizeBytes, 0);

  const handleScanDeepFolders = () => {
    if (!onScanFolder) return;
    let initialUri: string | undefined;
    if (activeTab === 'WhatsApp' || activeTab === 'all') {
      // Android 11+ WhatsApp media path
      initialUri = "content://com.android.externalstorage.documents/document/primary%3AAndroid%2Fmedia%2Fcom.whatsapp";
    }
    onScanFolder(initialUri);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white select-none">
      {/* Top Bar — shrink-0 so it stays pinned above the scrollable content */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/80 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold">Social App Cleaner</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">WhatsApp & Telegram media junk</p>
          </div>
        </div>
      </div>

      {/* Overview Banner */}
      <div className="p-4 space-y-3">
        <div className="bg-gradient-to-r from-emerald-900/30 to-blue-900/30 border border-emerald-500/20 rounded-3xl p-4 flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <p className="text-xs text-slate-600 dark:text-slate-300">Social Media Junk Detected</p>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {isScanning ? (
                <span className="text-emerald-600 dark:text-emerald-400 text-sm animate-pulse">Scanning Deep Folders...</span>
              ) : (
                formatBytes(totalSocialBytes)
              )}
            </h2>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex gap-2 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
          {(['all', 'WhatsApp', 'Telegram'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
              }`}
            >
              {tab === 'all' ? 'All Apps' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Category List */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-3">
        {filteredCategories.map((cat, idx) => (
          <motion.div
            key={cat.categoryTitle}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-3xl p-4 space-y-3 shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${
                  cat.appName === 'WhatsApp'
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'
                    : 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/30'
                }`}>
                  {cat.appName === 'WhatsApp' ? <MessageSquare className="w-5 h-5" /> : <Send className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">{cat.categoryTitle}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{cat.description}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-200">{formatBytes(cat.sizeBytes)}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{cat.count} files</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-700/40">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[200px]">{cat.path}</span>
              <button
                disabled={cat.count === 0}
                onClick={() => onReviewCategory(cat.categoryTitle, cat.files)}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md"
              >
                <span>Review</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
