import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Image as ImageIcon, 
  FileText, 
  Folder,
  Video,
  Music,
  BarChart2,
  PieChart as PieChartIcon,
  ChevronRight,
  HardDrive
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';
import { StorageOverview, ScannedFile, NavigationTab } from '../types';
import { formatBytes } from '../utils/formatters';

interface StorageOverviewScreenProps {
  storageOverview: StorageOverview;
  files: ScannedFile[];
  onBack: () => void;
  onNavigate: (tab: NavigationTab, payload?: string) => void;
}

export const StorageOverviewScreen: React.FC<StorageOverviewScreenProps> = ({
  storageOverview,
  files,
  onBack,
  onNavigate,
}) => {
  const [chartType, setChartType] = useState<'donut' | 'bar'>('donut');

  const totalGB = storageOverview.totalBytes > 0 
    ? (storageOverview.totalBytes / (1024 * 1024 * 1024)).toFixed(1)
    : '0';
  const usedGB = storageOverview.usedBytes > 0 
    ? (storageOverview.usedBytes / (1024 * 1024 * 1024)).toFixed(1)
    : '0';
  const availableGB = storageOverview.availableBytes > 0 
    ? (storageOverview.availableBytes / (1024 * 1024 * 1024)).toFixed(1)
    : '0';
  const usedPercent = storageOverview.usedPercentage || 0;

  // Compute dynamic category storage from scanned files or use native metrics
  const imageBytes = storageOverview.imageBytes ?? files
    .filter(f => f.category === 'image' || f.category === 'screenshot')
    .reduce((sum, f) => sum + (f.size || 0), 0);

  const videoBytes = storageOverview.videoBytes ?? files
    .filter(f => f.category === 'video' || f.category === 'large')
    .reduce((sum, f) => sum + (f.size || 0), 0);

  const docBytes = storageOverview.documentBytes ?? files
    .filter(f => f.category === 'document' || f.category === 'download')
    .reduce((sum, f) => sum + (f.size || 0), 0);

  const audioBytes = storageOverview.audioBytes ?? files
    .filter(f => f.category === 'audio')
    .reduce((sum, f) => sum + (f.size || 0), 0);

  const junkBytes = files
    .filter(f => f.isJunk || f.category === 'junk' || f.category === 'temp' || f.category === 'cache')
    .reduce((sum, f) => sum + (f.size || 0), 0);

  const knownTotal = imageBytes + videoBytes + docBytes + audioBytes + junkBytes;
  const otherBytes = Math.max(0, storageOverview.usedBytes - knownTotal);

  // Recharts Chart Data
  const chartData = [
    { name: 'Images', value: imageBytes, formatted: formatBytes(imageBytes), color: '#3B82F6', icon: ImageIcon },
    { name: 'Videos', value: videoBytes, formatted: formatBytes(videoBytes), color: '#8B5CF6', icon: Video },
    { name: 'Documents', value: docBytes, formatted: formatBytes(docBytes), color: '#F59E0B', icon: FileText },
    { name: 'Audio', value: audioBytes, formatted: formatBytes(audioBytes), color: '#10B981', icon: Music },
    { name: 'Junk & Cache', value: junkBytes, formatted: formatBytes(junkBytes), color: '#EF4444', icon: Folder },
    { name: 'System & Other', value: otherBytes, formatted: formatBytes(otherBytes), color: '#64748B', icon: Folder },
  ].filter(item => item.value > 0);

  const barData = chartData.map(item => ({
    name: item.name,
    sizeMB: +(item.value / (1024 * 1024)).toFixed(1),
    formatted: item.formatted,
    fill: item.color,
  }));

  return (
    <div className="flex flex-col min-h-full pb-24 select-none bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-transform"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">
            Storage Overview
          </h1>
        </div>

        {/* Toggle Chart Type */}
        <div className="flex items-center bg-slate-200/70 dark:bg-slate-800/80 p-1 rounded-xl">
          <button
            onClick={() => setChartType('donut')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              chartType === 'donut' 
                ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <PieChartIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              chartType === 'bar' 
                ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-4">
        {/* 1. Internal Storage Progress Bar Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              Internal Storage
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {totalGB} GB Total
            </span>
          </div>

          {/* Segmented Progress Bar */}
          <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
            <div 
              style={{ width: `${Math.min(100, Math.max(usedPercent, 2))}%` }} 
              className="bg-gradient-to-r from-blue-600 to-cyan-500 h-full rounded-full transition-all duration-700" 
            />
            <div 
              style={{ width: `${Math.max(0, 100 - usedPercent)}%` }} 
              className="bg-emerald-400/30 dark:bg-emerald-500/20 h-full" 
            />
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <span className="text-slate-500 dark:text-slate-400 font-medium">Used</span>
              <span className="font-bold text-slate-900 dark:text-white">{usedGB} GB</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-500 dark:text-slate-400 font-medium">Available</span>
              <span className="font-bold text-slate-900 dark:text-white">{availableGB} GB</span>
            </div>
          </div>
        </div>

        {/* 2. Recharts Data Visualization Chart Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Storage Breakdown by File Type
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Visualizing file categories in Recharts
              </p>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-950 px-2 py-1 rounded-lg">
              {chartData.length} Categories
            </span>
          </div>

          {/* Recharts Container */}
          <div className="w-full h-56 flex items-center justify-center">
            {chartType === 'donut' ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded-xl shadow-lg border border-slate-800">
                            <p className="font-bold">{data.name}</p>
                            <p className="text-slate-300">{data.formatted}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} unit=" MB" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded-xl shadow-lg border border-slate-800">
                            <p className="font-bold">{data.name}</p>
                            <p className="text-slate-300">{data.formatted}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="sizeMB" radius={[6, 6, 0, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={`bar-cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Interactive Custom Legend Grid */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            {chartData.map((item) => (
              <div key={item.name} className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <span className="w-3 h-3 rounded-md shrink-0" style={{ backgroundColor: item.color }} />
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate">
                    {item.name}
                  </div>
                  <div className="text-[10px] font-extrabold text-slate-900 dark:text-white">
                    {item.formatted}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Detailed File Category List */}
        <div className="space-y-2.5">
          <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">
            File Category Breakdown
          </h2>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-2 border border-slate-200/80 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800/60">
            {files.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <HardDrive className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white mb-2">No Scan Data Available</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-6 max-w-[200px]">
                  Run a full deep scan to view your storage breakdown and reclaim space.
                </div>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-blue-500/30 active:scale-95 transition-all text-sm w-full max-w-[200px]"
                >
                  Start Scan Now
                </button>
              </div>
            ) : (
              <>
                {/* Photos */}
            <div 
              onClick={() => onNavigate('category_detail', 'images')}
              className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-cyan-400 flex items-center justify-center">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  Images & Screenshots
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  {formatBytes(imageBytes)}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
              </div>
            </div>

            {/* Videos */}
            <div 
              onClick={() => onNavigate('category_detail', 'videos')}
              className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Video className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  Videos & Large Media
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  {formatBytes(videoBytes)}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-500 transition-colors" />
              </div>
            </div>

            {/* Documents */}
            <div 
              onClick={() => onNavigate('category_detail', 'documents')}
              className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  Documents & Downloads
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  {formatBytes(docBytes)}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition-colors" />
              </div>
            </div>

            {/* Audio */}
            <div 
              onClick={() => onNavigate('category_detail', 'audio')}
              className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Music className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  Audio & Voice Recordings
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  {formatBytes(audioBytes)}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
              </div>
            </div>

            {/* Junk / Cache */}
            <div 
              onClick={() => onNavigate('review_select')}
              className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <Folder className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  Temporary & Cache Junk
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  {formatBytes(junkBytes)}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-500 transition-colors" />
              </div>
            </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
