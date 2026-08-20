import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { IonLogo } from './IonLogo';

interface SplashScreenProps {
  onComplete?: () => void;
  onFinish?: () => void;
  isReady?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  onFinish,
  isReady = false,
}) => {
  const handleProceed = () => {
    if (onComplete) {
      onComplete();
    } else if (onFinish) {
      onFinish();
    }
  };

  useEffect(() => {
    if (isReady) {
      handleProceed();
    }
  }, [isReady, onComplete, onFinish]);

  return (
    <div className="relative w-full h-full min-h-[600px] flex flex-col items-center justify-between p-8 bg-[#0B1120] text-slate-900 dark:text-white select-none overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-400/15 rounded-full blur-2xl pointer-events-none" />

      {/* Top skip action */}
      <div className="w-full flex justify-end pt-2">
        <button 
          onClick={handleProceed}
          className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white px-3 py-1.5 rounded-full bg-white dark:bg-slate-800/60 backdrop-blur-md border border-slate-700/50 transition-colors cursor-pointer active:scale-95"
        >
          Skip
        </button>
      </div>

      {/* Center Brand Identity */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.88, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center z-10 space-y-4 text-center"
      >
        <div className="relative group">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-3xl blur-xl opacity-60 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse" />
          <div className="relative bg-white dark:bg-slate-950 p-3 rounded-2xl border border-cyan-500/30 shadow-2xl">
            <IonLogo size="lg" showTagline={false} />
          </div>
        </div>

        <div className="space-y-1 pt-2">
          <p className="text-sm font-semibold tracking-wider uppercase text-cyan-600 dark:text-cyan-400">
            Clean Storage. Boost Speed.
          </p>
        </div>
      </motion.div>

      {/* Bottom Loading Indicator */}
      <div className="flex flex-col items-center space-y-3 z-10 pb-4">
        <div className="w-8 h-8 rounded-full border-2 border-slate-200 dark:border-slate-700 border-t-cyan-400 animate-spin" />
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide">
          Initializing intelligent storage engine...
        </p>
      </div>
    </div>
  );
};
