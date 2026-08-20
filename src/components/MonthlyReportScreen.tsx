import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ChevronDown, 
  Sparkles, 
  TrendingUp,
  Calendar
} from 'lucide-react';
import { NavigationTab } from '../types';

interface MonthlyReportScreenProps {
  onBack: () => void;
  onNavigate: (tab: NavigationTab) => void;
}

export const MonthlyReportScreen: React.FC<MonthlyReportScreenProps> = ({
  onBack,
  onNavigate,
}) => {
  const [selectedMonth, setSelectedMonth] = useState('June 2025');
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);

  const months = ['June 2025', 'May 2025', 'April 2025', 'March 2025'];

  const barData = [
    { month: 'Jan', value: 2.1, height: '35%' },
    { month: 'Feb', value: 3.4, height: '55%' },
    { month: 'Mar', value: 2.8, height: '45%' },
    { month: 'Apr', value: 4.2, height: '70%' },
    { month: 'May', value: 5.1, height: '85%' },
    { month: 'Jun', value: 5.68, height: '95%', isCurrent: true },
  ];

  return (
    <div className="flex flex-col h-full select-none bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      {/* Header with Month Dropdown */}
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

        {/* Month Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-sm"
          >
            <span>{selectedMonth}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isMonthDropdownOpen && (
            <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-30 py-1 divide-y divide-slate-100 dark:divide-slate-800">
              {months.map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setSelectedMonth(m);
                    setIsMonthDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Hero Card: Total Space Saved */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 rounded-[28px] p-6 text-white shadow-lg shadow-blue-500/20 text-center relative overflow-hidden">
          {/* Subtle Ambient Shapes */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-cyan-300/20 rounded-full blur-lg pointer-events-none" />

          <div className="relative z-10 space-y-1">
            <span className="text-xs font-semibold text-blue-100 uppercase tracking-wider">
              Total space saved
            </span>
            <div className="text-4xl font-black tracking-tight drop-shadow-sm">
              5.68 GB
            </div>
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold text-white mt-1 shadow-sm">
              <TrendingUp className="w-3 h-3 text-cyan-200" />
              <span>+12% from last month</span>
            </div>
          </div>
        </div>

        {/* 3 Quick Metrics Strip */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center shadow-sm">
            <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mb-0.5">
              Total scans
            </div>
            <div className="text-base font-black text-slate-900 dark:text-white">
              8
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center shadow-sm">
            <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mb-0.5">
              Files cleaned
            </div>
            <div className="text-base font-black text-slate-900 dark:text-white">
              812
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center shadow-sm">
            <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mb-0.5">
              Avg space saved
            </div>
            <div className="text-base font-black text-slate-900 dark:text-white">
              710 MB
            </div>
          </div>
        </div>

        {/* Space Saved Trend (6 Months Bar Chart) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              Space saved trend
            </span>
            <span className="text-xs font-semibold text-slate-400">
              Last 6 months
            </span>
          </div>

          {/* Bar Chart Container */}
          <div className="relative h-44 flex items-end justify-between pt-6 pb-2 px-2">
            {/* Grid line levels */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
              <div className="border-b border-slate-400 w-full text-[9px] text-right pr-1">6 GB</div>
              <div className="border-b border-slate-400 w-full text-[9px] text-right pr-1">4 GB</div>
              <div className="border-b border-slate-400 w-full text-[9px] text-right pr-1">2 GB</div>
              <div className="border-b border-slate-400 w-full text-[9px] text-right pr-1">0 GB</div>
            </div>

            {barData.map((bar) => (
              <div key={bar.month} className="flex flex-col items-center gap-2 z-10 flex-1 px-1">
                <div className="w-full max-w-[28px] h-32 flex items-end justify-center">
                  <div
                    style={{ height: bar.height }}
                    className={`w-full rounded-t-xl transition-all duration-500 ${
                      bar.isCurrent
                        ? 'bg-gradient-to-t from-blue-600 to-cyan-400 shadow-md shadow-cyan-500/30'
                        : 'bg-blue-100 dark:bg-slate-800 hover:bg-blue-200 dark:hover:bg-slate-700'
                    }`}
                  />
                </div>
                <span className={`text-[10px] font-bold ${bar.isCurrent ? 'text-blue-600 dark:text-cyan-400 font-extrabold' : 'text-slate-400'}`}>
                  {bar.month}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
