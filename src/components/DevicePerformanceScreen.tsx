import React, { useEffect, useState } from 'react';
import { ArrowLeft, Cpu, Battery, MemoryStick, Info, Activity, ShieldCheck, Zap } from 'lucide-react';
import { DeviceSystemMetrics } from '../types';
import { Device, DeviceInfo } from '@capacitor/device';
import { motion } from 'motion/react';

interface DevicePerformanceScreenProps {
  systemMetrics: DeviceSystemMetrics;
  onBack: () => void;
}

export const DevicePerformanceScreen: React.FC<DevicePerformanceScreenProps> = ({
  systemMetrics,
  onBack,
}) => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);

  useEffect(() => {
    const fetchDeviceInfo = async () => {
      try {
        const info = await Device.getInfo();
        setDeviceInfo(info);
      } catch (err) {
        console.error('Error fetching device info:', err);
      }
    };
    fetchDeviceInfo();
  }, []);

  const ramUsedGb = systemMetrics.ramTotalGb && systemMetrics.ramAvailableGb 
    ? (systemMetrics.ramTotalGb - systemMetrics.ramAvailableGb).toFixed(1) 
    : 'Unknown';

  return (
    <div className="flex flex-col min-h-full pb-20 select-none bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md px-4 py-3 flex items-center gap-3 border-b border-slate-200/50 dark:border-slate-800/50">
        <button
          onClick={onBack}
          className="p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-transform"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">
          Device Performance
        </h1>
      </header>

      <main className="p-4 space-y-4">
        {/* Performance Score / Status Hero */}
        <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-3xl p-6 text-white shadow-lg shadow-cyan-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Activity className="w-24 h-24" />
          </div>
          
          <div className="relative z-10 flex flex-col">
            <span className="text-blue-100 font-semibold text-sm uppercase tracking-wider mb-1">
              Overall Status
            </span>
            <div className="text-4xl font-black mb-2 flex items-center gap-2">
              {systemMetrics.performanceState}
              <ShieldCheck className="w-8 h-8 text-cyan-200" />
            </div>
            <p className="text-sm font-medium text-blue-50/90 max-w-[80%]">
              Your device is currently running smoothly. Keep an eye on storage and memory to maintain peak performance.
            </p>
          </div>
        </div>

        {/* RAM Section */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <MemoryStick className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">RAM / Memory</h3>
              <p className="text-[11px] text-slate-500 font-medium">Volatile memory monitoring</p>
            </div>
          </div>
          
          <div className="flex items-end justify-between mb-2">
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {ramUsedGb} <span className="text-sm font-bold text-slate-400">GB used</span>
            </div>
            <div className="text-xs font-bold text-slate-500">
              Total: {systemMetrics.ramTotalGb || '?'} GB
            </div>
          </div>

          <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${systemMetrics.ramUsagePercent || 0}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="bg-emerald-500 h-full rounded-full" 
            />
          </div>
        </div>

        {/* CPU Section */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">CPU Activity</h3>
              <p className="text-[11px] text-slate-500 font-medium">{systemMetrics.cpuCores} Cores Processor</p>
            </div>
          </div>
          
          <div className="flex items-end justify-between mb-2">
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {systemMetrics.cpuLoadPercent !== null ? `${systemMetrics.cpuLoadPercent}%` : 'Idle'}
              <span className="text-sm font-bold text-slate-400 ml-2">Load</span>
            </div>
          </div>

          <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex items-center">
            {systemMetrics.cpuLoadPercent !== null ? (
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${systemMetrics.cpuLoadPercent}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-full rounded-full ${
                  systemMetrics.cpuLoadPercent > 80 ? 'bg-red-500' : 'bg-purple-500'
                }`}
              />
            ) : (
              <div className="w-full h-full bg-purple-200 dark:bg-purple-900/50 flex items-center justify-center overflow-hidden">
                <div className="w-full h-full animate-pulse bg-purple-300 dark:bg-purple-800" />
              </div>
            )}
          </div>
        </div>

        {/* Battery Section */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Battery className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Battery Health</h3>
              <p className="text-[11px] text-slate-500 font-medium">Power consumption metrics</p>
            </div>
            {systemMetrics.isCharging && (
              <div className="ml-auto p-1.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 animate-pulse">
                <Zap className="w-4 h-4 fill-amber-500" />
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Level</div>
              <div className="text-xl font-black text-slate-900 dark:text-white">
                {systemMetrics.batteryLevel !== null ? `${systemMetrics.batteryLevel}%` : 'Unknown'}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</div>
              <div className="text-sm font-bold text-emerald-500">
                {systemMetrics.batteryHealth}
              </div>
            </div>
          </div>
        </div>

        {/* System & Device Info Section */}
        {deviceInfo && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Device Information</h3>
                <p className="text-[11px] text-slate-500 font-medium">Hardware specifics</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-y-4 gap-x-2">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Model</div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">{deviceInfo.model}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Manufacturer</div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">{deviceInfo.manufacturer}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">OS Version</div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">{deviceInfo.osVersion}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Platform</div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white capitalize">{deviceInfo.platform}</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
