import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Capacitor } from '@capacitor/core';
import { 
  ArrowLeft, 
  Video, 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ArrowDownCircle,
  Play,
  Gauge
} from 'lucide-react';
import { ScannedFile } from '../types';
import { formatBytes } from '../utils';
import { compressVideoFile, saveVideoToGallery } from '../services/videoCompressor';

interface VideoCompressorScreenProps {
  files: ScannedFile[];
  onBack: () => void;
  onCompressedSaved: (originalFile: ScannedFile, savedBytes: number) => void;
}

export const VideoCompressorScreen: React.FC<VideoCompressorScreenProps> = ({
  files,
  onBack,
  onCompressedSaved,
}) => {
  const videoFiles = files.filter(
    (f) => f.category === 'video' || f.category === 'large' || f.mimeType.startsWith('video/')
  );

  const [selectedVideo, setSelectedVideo] = useState<ScannedFile | null>(
    videoFiles.length > 0 ? videoFiles[0] : null
  );
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('medium');
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completedResult, setCompletedResult] = useState<{
    actualSize: number;
    savingsBytes: number;
    downloadUrl?: string;
  } | null>(null);

  const estimatedFactor = quality === 'low' ? 0.35 : quality === 'medium' ? 0.55 : 0.75;
  const estimatedSavings = selectedVideo ? Math.round(selectedVideo.size * (1 - estimatedFactor)) : 0;

  const handleStartCompress = async () => {
    if (!selectedVideo) return;
    setIsCompressing(true);
    setProgress(0);
    setCompletedResult(null);

    const res = await compressVideoFile(selectedVideo, quality, (p) => {
      setProgress(p);
    });

    setIsCompressing(false);
    if (res.success && res.actualSize && res.savingsBytes) {
      setCompletedResult({
        actualSize: res.actualSize,
        savingsBytes: res.savingsBytes,
        downloadUrl: res.downloadUrl,
      });
      onCompressedSaved(selectedVideo, res.savingsBytes);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white select-none">
      {/* Header — shrink-0 so it stays pinned above the scrollable content */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/80 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold">Video Compressor</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Reclaim up to 70% space per video</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {videoFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-slate-500">
              <Video className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-600 dark:text-slate-300">No Videos Found</h3>
            <p className="text-xs text-slate-500 max-w-xs">
              Scan your storage to detect videos that can be compressed.
            </p>
          </div>
        ) : (
          <>
            {/* Video Selector Horizontal Carousel */}
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-2">
                Select Video to Compress ({videoFiles.length} available)
              </label>
              <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                {videoFiles.map((vid) => {
                  const isSelected = selectedVideo?.id === vid.id;
                  return (
                    <button
                      key={vid.id}
                      onClick={() => {
                        setSelectedVideo(vid);
                        setCompletedResult(null);
                      }}
                      className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border text-left shrink-0 transition-all ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500 text-slate-900 dark:text-white shadow-lg shadow-blue-500/10'
                          : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-500 dark:text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900/80 flex items-center justify-center shrink-0 overflow-hidden relative">
                        {vid.thumbnailUrl || vid.nativeUri ? (
                          vid.thumbnailUrl ? (
                            <img src={vid.thumbnailUrl} alt={vid.name} className="absolute inset-0 w-full h-full object-cover" />
                          ) : (
                            <video 
                              src={Capacitor.convertFileSrc(vid.nativeUri!)}
                              className="absolute inset-0 w-full h-full object-cover opacity-80"
                              preload="metadata"
                              muted
                            />
                          )
                        ) : (
                          <Video className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      <div className="max-w-[120px]">
                        <p className="text-xs font-bold truncate">{vid.name}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{formatBytes(vid.size)}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedVideo && (
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm">
                
                {/* Video Preview */}
                <div className="w-full h-48 bg-slate-100 dark:bg-slate-800/60 rounded-2xl overflow-hidden shadow-inner relative flex items-center justify-center group">
                  {selectedVideo.nativeUri ? (
                    <video 
                      src={Capacitor.convertFileSrc(selectedVideo.nativeUri)}
                      className="w-full h-full object-cover"
                      controls
                      controlsList="nodownload"
                      disablePictureInPicture
                      preload="metadata"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-slate-500 dark:text-slate-400">
                      <Video className="w-8 h-8 mb-2 opacity-50" />
                      <span className="text-xs font-semibold">Preview Unavailable</span>
                    </div>
                  )}
                </div>

                {/* Active Video Info */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[200px]">
                      {selectedVideo.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Original Size: <strong className="text-slate-900 dark:text-white">{formatBytes(selectedVideo.size)}</strong>
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[11px] font-semibold border border-blue-100 dark:border-blue-500/20">
                    MP4 / H.264
                  </span>
                </div>

                {/* Quality Tier Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                    Target Compression Quality
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'low', label: 'Maximum', reduction: '~65% space freed', desc: '480p standard' },
                      { id: 'medium', label: 'Balanced', reduction: '~45% space freed', desc: '720p HD' },
                      { id: 'high', label: 'High Quality', reduction: '~25% space freed', desc: 'Original res' },
                    ].map((tier) => {
                      const isTierActive = quality === tier.id;
                      return (
                        <button
                          key={tier.id}
                          onClick={() => setQuality(tier.id as any)}
                          className={`p-3 rounded-2xl border text-center transition-all ${
                            isTierActive
                              ? 'bg-blue-600 text-slate-900 dark:text-white border-blue-400 shadow-md'
                              : 'bg-slate-100 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700/60 text-slate-500 dark:text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <p className="text-xs font-bold">{tier.label}</p>
                          <p className="text-[10px] mt-0.5 opacity-90">{tier.reduction}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Estimated Space Recovery Banner */}
                <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs text-emerald-800 dark:text-emerald-200">Estimated Space Saved:</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    ~{formatBytes(estimatedSavings)}
                  </span>
                </div>

                {/* Compression Progress */}
                {isCompressing && (
                  <div className="space-y-2 bg-slate-100 dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-600 dark:text-slate-300">Compressing video frames...</span>
                      <span className="text-blue-600 dark:text-blue-400">{progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-white dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300 rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Completion Banner */}
                {completedResult && (
                  <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/40 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      <span>Compression Complete!</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <div>New Size: <strong className="text-slate-900 dark:text-white">{formatBytes(completedResult.actualSize)}</strong></div>
                      <div>Space Recovered: <strong className="text-emerald-600 dark:text-emerald-400">{formatBytes(completedResult.savingsBytes)}</strong></div>
                    </div>
                    {completedResult.downloadUrl && (
                      <button
                        onClick={async () => {
                          const success = await saveVideoToGallery(completedResult.downloadUrl!);
                          if (success) {
                            alert('Video saved successfully to your Movies folder!');
                          } else {
                            alert('Failed to save video. Please try again.');
                          }
                        }}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-900 dark:text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg"
                      >
                        <ArrowDownCircle className="w-4 h-4" />
                        <span>Save Compressed Video</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Action Trigger */}
                {!completedResult && (
                  <button
                    disabled={isCompressing}
                    onClick={handleStartCompress}
                    className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-slate-900 dark:text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20 transition-all"
                  >
                    <Zap className="w-4 h-4" />
                    <span>{isCompressing ? 'Compressing...' : 'Start Video Compression'}</span>
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
