import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  FileText, 
  Trash2, 
  Sparkles, 
  Shield, 
  HardDrive,
  Music,
  Archive,
  Layers,
  Activity
} from 'lucide-react';

interface LottieScanAnimationProps {
  progress: number;
  currentFilePath: string;
  scannedCount: number;
  totalCount: number;
}

export const LottieScanAnimation: React.FC<LottieScanAnimationProps> = ({
  progress,
  currentFilePath,
  scannedCount,
  totalCount,
}) => {
  // Determine current active phase for context-aware micro-animations
  const getScanPhase = (prog: number) => {
    if (prog < 25) return { label: 'Analyzing System Cache & Temp Logs', icon: Trash2, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
    if (prog < 55) return { label: 'AI Detecting Duplicate & Blurry Photos', icon: ImageIcon, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/30' };
    if (prog < 80) return { label: 'Inspecting Large 4K Videos & Files', icon: VideoIcon, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30' };
    return { label: 'Finalizing Storage Optimization Index', icon: Shield, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
  };

  const phase = getScanPhase(progress);
  const PhaseIcon = phase.icon;

  // SVG Progress Ring Geometry
  const size = 180;
  const strokeWidth = 7;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center py-3 select-none">
      
      {/* Central Lottie-Style Animated Visual Hub */}
      <div className="relative w-56 h-56 flex items-center justify-center">
        
        {/* Layer 1: Ambient Expanding Radar Ripples (Sonar Pulse Waves - Smooth & Calm) */}
        <motion.div
          animate={{
            scale: [0.8, 1.35, 1.55],
            opacity: [0.5, 0.15, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 4.2,
            ease: 'easeInOut',
          }}
          className="absolute inset-2 rounded-full bg-gradient-to-tr from-blue-500/20 via-cyan-400/15 to-transparent blur-md pointer-events-none"
        />

        <motion.div
          animate={{
            scale: [0.75, 1.25, 1.4],
            opacity: [0.4, 0.1, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 4.2,
            delay: 1.4,
            ease: 'easeInOut',
          }}
          className="absolute inset-4 rounded-full bg-gradient-to-br from-indigo-500/15 to-blue-400/15 blur-sm pointer-events-none"
        />

        <motion.div
          animate={{
            scale: [0.7, 1.15, 1.3],
            opacity: [0.35, 0.08, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 4.2,
            delay: 2.8,
            ease: 'easeInOut',
          }}
          className="absolute inset-6 rounded-full bg-gradient-to-tr from-cyan-500/15 to-emerald-400/10 blur-xs pointer-events-none"
        />

        {/* Layer 2: Orbiting Decorative Particle Nodes with 3D Float Physics - Slow Calm Orbit */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 38, ease: 'linear' }}
          className="absolute inset-0 pointer-events-none"
        >
          {/* Top-Right: Image Particle */}
          <div className="absolute top-2 right-4 transform -translate-y-1/2">
            <motion.div 
              animate={{ y: [-3, 3, -3], scale: [0.97, 1.05, 0.97] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
              className="w-8 h-8 rounded-2xl bg-white dark:bg-slate-800 shadow-md shadow-purple-500/15 border border-purple-200 dark:border-purple-800/80 flex items-center justify-center text-purple-600 dark:text-purple-400"
            >
              <ImageIcon className="w-4 h-4" />
            </motion.div>
          </div>

          {/* Bottom-Right: Video Particle */}
          <div className="absolute bottom-4 right-3 transform translate-y-1/2">
            <motion.div 
              animate={{ y: [3, -3, 3], scale: [1, 1.06, 1] }}
              transition={{ repeat: Infinity, duration: 5, delay: 0.5, ease: 'easeInOut' }}
              className="w-7 h-7 rounded-xl bg-white dark:bg-slate-800 shadow-md shadow-blue-500/15 border border-blue-200 dark:border-blue-800/80 flex items-center justify-center text-blue-600 dark:text-blue-400"
            >
              <VideoIcon className="w-3.5 h-3.5" />
            </motion.div>
          </div>

          {/* Bottom-Left: Trash / Cache Particle */}
          <div className="absolute bottom-5 left-3 transform translate-y-1/2">
            <motion.div 
              animate={{ y: [-3, 3, -3], scale: [0.95, 1.05, 0.95] }}
              transition={{ repeat: Infinity, duration: 5.5, delay: 1, ease: 'easeInOut' }}
              className="w-7 h-7 rounded-xl bg-white dark:bg-slate-800 shadow-md shadow-amber-500/15 border border-amber-200 dark:border-amber-800/80 flex items-center justify-center text-amber-600 dark:text-amber-400"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </motion.div>
          </div>

          {/* Top-Left: Audio / Document Particle */}
          <div className="absolute top-4 left-3 transform -translate-y-1/2">
            <motion.div 
              animate={{ scale: [0.92, 1.08, 0.92], opacity: [0.8, 1, 0.8] }}
              transition={{ repeat: Infinity, duration: 4.2, delay: 0.3, ease: 'easeInOut' }}
              className="w-7 h-7 rounded-xl bg-white dark:bg-slate-800 shadow-md shadow-cyan-500/15 border border-cyan-200 dark:border-cyan-800/80 flex items-center justify-center text-cyan-600 dark:text-cyan-400"
            >
              <Music className="w-3.5 h-3.5" />
            </motion.div>
          </div>

          {/* Direct Top: Sparkle Particle */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <motion.div
              animate={{ scale: [0.85, 1.2, 0.85], opacity: [0.7, 1, 0.7] }}
              transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
              className="w-5 h-5 rounded-full bg-cyan-100 dark:bg-cyan-900/60 shadow-xs border border-cyan-300 dark:border-cyan-600 flex items-center justify-center text-cyan-600 dark:text-cyan-300"
            >
              <Sparkles className="w-2.5 h-2.5" />
            </motion.div>
          </div>
        </motion.div>

        {/* Layer 3: Rotating Calibrated SVG Rings & Radar Tech Lines */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Outer dashed tech track */}
          <motion.svg
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 45, ease: 'linear' }}
            className="absolute w-[214px] h-[214px] pointer-events-none opacity-40 dark:opacity-30"
            viewBox="0 0 214 214"
          >
            <circle
              cx="107"
              cy="107"
              r="102"
              fill="none"
              stroke="#3B82F6"
              strokeWidth="1.5"
              strokeDasharray="5 10 15 10"
            />
          </motion.svg>

          {/* Counter-rotating inner micro-dash ring */}
          <motion.svg
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 32, ease: 'linear' }}
            className="absolute w-[194px] h-[194px] pointer-events-none opacity-35 dark:opacity-25"
            viewBox="0 0 194 194"
          >
            <circle
              cx="97"
              cy="97"
              r="92"
              fill="none"
              stroke="#06B6D4"
              strokeWidth="1.2"
              strokeDasharray="2 6 8 6"
            />
          </motion.svg>

          {/* Main SVG Progress Ring */}
          <svg className="w-48 h-48 transform -rotate-90">
            <defs>
              <linearGradient id="lottieProgressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="40%" stopColor="#06b6d4" />
                <stop offset="80%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#84cc16" />
              </linearGradient>
              <filter id="lottieGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Background Track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-slate-100 dark:text-slate-800"
            />

            {/* Animated Progress Stroke */}
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="url(#lottieProgressGrad)"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              filter="url(#lottieGlow)"
              transition={{ duration: 0.35, ease: 'easeOut' }}
            />
          </svg>

          {/* Holographic Laser Radar Sweep Beam - Calm 4.2s Rotation */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 4.2, ease: 'linear' }}
            className="absolute w-44 h-44 rounded-full pointer-events-none overflow-hidden"
            style={{
              maskImage: 'radial-gradient(circle, black 65%, transparent 75%)',
              WebkitMaskImage: 'radial-gradient(circle, black 65%, transparent 75%)',
            }}
          >
            <div 
              className="w-full h-1/2 origin-bottom bg-gradient-to-t from-cyan-400/35 via-blue-500/15 to-transparent"
              style={{
                clipPath: 'polygon(50% 100%, 0 0, 50% 0)',
              }}
            />
          </motion.div>
        </div>

        {/* Layer 4: Central 3D Glass Core Orb with Gentle Breathing Power */}
        <motion.div
          animate={{ scale: [1, 1.025, 1] }}
          transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
          className="relative w-32 h-32 rounded-full bg-gradient-to-tr from-blue-700 via-blue-600 to-cyan-500 text-white flex flex-col items-center justify-center shadow-2xl shadow-blue-600/35 p-2 z-10 border border-cyan-300/40"
        >
          {/* Inner glossy highlight */}
          <div className="absolute top-1.5 left-3 w-12 h-6 rounded-full bg-white/30 blur-[1px] pointer-events-none transform -rotate-15" />
          
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
            className="mb-0.5"
          >
            <Zap className="w-5 h-5 text-cyan-200 fill-cyan-200/50 drop-shadow-md" />
          </motion.div>

          {/* Progress Percentage Display */}
          <div className="flex items-baseline justify-center">
            <span className="text-3xl font-black tracking-tight leading-none text-white drop-shadow-md font-mono">
              {progress}
            </span>
            <span className="text-sm font-extrabold text-cyan-200 ml-0.5">%</span>
          </div>

          {/* Micro Telemetry File Count */}
          <div className="flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full bg-black/25 backdrop-blur-xs">
            <span className="text-[10px] font-bold text-blue-100 tracking-wide font-mono">
              {scannedCount.toLocaleString()} / {totalCount.toLocaleString()}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Layer 5: Dynamic Scan Status Badge & Live File Path Telemetry */}
      <div className="w-full mt-4 space-y-2.5 text-center max-w-xs px-2">
        
        {/* Dynamic Phase Pill */}
        <div className="flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={phase.label}
              initial={{ opacity: 0, y: 6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold ${phase.bg} ${phase.color} border ${phase.border} shadow-xs`}
            >
              <PhaseIcon className="w-3.5 h-3.5 shrink-0" />
              <span>{phase.label}</span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Live File Path Stream with Smooth Monospace Terminal Look */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl px-3.5 py-2.5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-600 dark:text-slate-300">
            <HardDrive className="w-3.5 h-3.5 text-blue-500 shrink-0 animate-pulse" />
            <span className="truncate flex-1 text-left">
              {currentFilePath}
            </span>
          </div>
        </div>

        {/* Sub-linear Shimmer Progress Track */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 px-1">
            <span>Scan Engine v3.8</span>
            <span className="text-blue-500 font-semibold flex items-center gap-1">
              <Activity className="w-3 h-3 animate-pulse" />
              Deep Storage Scan
            </span>
          </div>

          <div className="w-full bg-slate-200/70 dark:bg-slate-800 h-2 rounded-full overflow-hidden relative shadow-inner">
            <motion.div 
              className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-emerald-500 rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
            {/* Shimmer light sweep - Calm & Smooth */}
            <motion.div
              animate={{ x: ['-100%', '200%'] }}
              transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
              className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12"
            />
          </div>
        </div>

      </div>
    </div>
  );
};
