import React from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  TrendingUp,
  TrendingDown,
  Minus,
  Trash2,
  ScanLine,
  FileX
} from 'lucide-react';
import { NavigationTab } from '../types';
import { MonthlyStats } from '../services/cleaningHistoryManager';
import { formatBytes } from '../utils/formatters';

interface MonthlyReportScreenProps {
  onBack: () => void;
  onNavigate: (tab: NavigationTab) => void;
  monthlyStats: MonthlyStats[];
}

export const MonthlyReportScreen: React.FC<MonthlyReportScreenProps> = ({
  onBack,
  onNavigate,
  monthlyStats,
}) => {
  // monthlyStats[0] = current month, [1] = last month, etc.
  const current = monthlyStats[0];
  const previous = monthlyStats[1];

  const totalBytesAllTime = monthlyStats.reduce((s, m) => s + m.totalBytesFreed, 0);
  const totalFilesAllTime = monthlyStats.reduce((s, m) => s + m.totalFilesFreed, 0);
  const totalScansAllTime = monthlyStats.reduce((s, m) => s + m.scanCount, 0);

  // Trend vs last month
  const trend = previous && previous.totalBytesFreed > 0
    ? Math.round(((current.totalBytesFreed - previous.totalBytesFreed) / previous.totalBytesFreed) * 100)
    : null;

  // Bar chart: reverse so oldest is leftmost
  const chartData = [...monthlyStats].reverse();
  const maxBytes = Math.max(...chartData.map(m => m.totalBytesFreed), 1);

  const hasAnyData = totalBytesAllTime > 0;

  return (
    <div className="flex flex-col h-full select-none bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      {/* Header */}
      <header className="shrink-0 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-transform"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">
            Monthly Report
          </h1>
        </div>
        <span className="text-xs font-semibold text-slate-400">
          {current?.label ?? 'This Month'}
        </span>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {!hasAnyData ? (
          /* ── Empty State ── */
          <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-16">
            <div className="w-20 h-20 rounded-3xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
              <ScanLine className="w-10 h-10 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No data yet</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[260px]">
                Run your first scan and clean to start tracking your storage savings here.
              </p>
            </div>
            <button
              onClick={() => onNavigate('scan')}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 active:scale-95 transition-all"
            >
              Start Scan
            </button>
          </div>
        ) : (
          <>
            {/* Hero Card: This Month */}
            <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 rounded-[28px] p-6 text-white shadow-lg shadow-blue-500/20 text-center relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
              <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-cyan-300/20 rounded-full blur-lg pointer-events-none" />

              <div className="relative z-10 space-y-1">
                <span className="text-xs font-semibold text-blue-100 uppercase tracking-wider">
                  This month · {current?.label}
                </span>
                <div className="text-4xl font-black tracking-tight drop-shadow-sm">
                  {formatBytes(current?.totalBytesFreed ?? 0)}
                </div>
                {trend !== null ? (
                  <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold text-white mt-1 shadow-sm`}>
                    {trend > 0 ? <TrendingUp className="w-3 h-3 text-cyan-200" /> : trend < 0 ? <TrendingDown className="w-3 h-3 text-red-200" /> : <Minus className="w-3 h-3" />}
                    <span>{trend > 0 ? `+${trend}%` : trend < 0 ? `${trend}%` : 'Same'} vs last month</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold text-white mt-1">
                    <Sparkles className="w-3 h-3 text-cyan-200" />
                    <span>First month tracked</span>
                  </div>
                )}
              </div>
            </div>

            {/* 3 Quick Metrics */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center shadow-sm">
                <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mb-0.5">
                  Total scans
                </div>
                <div className="text-base font-black text-slate-900 dark:text-white">
                  {totalScansAllTime}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center shadow-sm">
                <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mb-0.5">
                  Files cleaned
                </div>
                <div className="text-base font-black text-slate-900 dark:text-white">
                  {totalFilesAllTime}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center shadow-sm">
                <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mb-0.5">
                  Total freed
                </div>
                <div className="text-base font-black text-slate-900 dark:text-white text-[11px]">
                  {formatBytes(totalBytesAllTime)}
                </div>
              </div>
            </div>

            {/* Space Saved Bar Chart (6 months) */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  Space saved trend
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  Last 6 months
                </span>
              </div>

              <div className="relative h-44 flex items-end justify-between pt-6 pb-2 px-2">
                {/* Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                  <div className="border-b border-slate-400 w-full" />
                  <div className="border-b border-slate-400 w-full" />
                  <div className="border-b border-slate-400 w-full" />
                  <div className="border-b border-slate-400 w-full" />
                </div>

                {chartData.map((bar, idx) => {
                  const isCurrentMonth = idx === chartData.length - 1;
                  const heightPct = maxBytes > 0 ? Math.max((bar.totalBytesFreed / maxBytes) * 100, bar.totalBytesFreed > 0 ? 8 : 0) : 0;
                  return (
                    <div key={bar.yearMonth} className="flex flex-col items-center gap-2 z-10 flex-1 px-1">
                      <div className="w-full max-w-[28px] h-32 flex items-end justify-center">
                        <div
                          style={{ height: `${heightPct}%` }}
                          className={`w-full rounded-t-xl transition-all duration-500 ${
                            isCurrentMonth
                              ? 'bg-gradient-to-t from-blue-600 to-cyan-400 shadow-md shadow-cyan-500/30'
                              : bar.totalBytesFreed > 0
                                ? 'bg-blue-200 dark:bg-blue-800'
                                : 'bg-slate-100 dark:bg-slate-800'
                          }`}
                        />
                      </div>
                      <span className={`text-[10px] font-bold ${isCurrentMonth ? 'text-blue-600 dark:text-cyan-400 font-extrabold' : 'text-slate-400'}`}>
                        {bar.label.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Monthly breakdown list */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
              <span className="text-sm font-bold text-slate-900 dark:text-white block mb-3">
                Month by Month
              </span>
              {monthlyStats.map((m, i) => (
                <div key={m.yearMonth} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
                    <span className={`text-xs font-semibold ${i === 0 ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                      {m.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-black ${m.totalBytesFreed > 0 ? 'text-blue-600 dark:text-cyan-400' : 'text-slate-300 dark:text-slate-700'}`}>
                      {m.totalBytesFreed > 0 ? formatBytes(m.totalBytesFreed) : '—'}
                    </div>
                    {m.scanCount > 0 && (
                      <div className="text-[10px] text-slate-400">{m.scanCount} scan{m.scanCount !== 1 ? 's' : ''}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};
