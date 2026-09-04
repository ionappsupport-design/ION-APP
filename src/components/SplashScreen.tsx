import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { IonLogo } from './IonLogo';
import { signInWithGoogle, getCurrentUser, UserProfile } from '../services/authService';

interface SplashScreenProps {
  onComplete?: (targetTab?: 'home' | 'auth') => void;
  onFinish?: (targetTab?: 'home' | 'auth') => void;
  isReady?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  onFinish,
  isReady = false,
}) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    getCurrentUser().then(user => setUserProfile(user));
  }, []);

  const handleProceed = (target?: 'home' | 'auth') => {
    const nextTab = target || (userProfile?.email ? 'home' : 'auth');
    if (onComplete) {
      onComplete(nextTab);
    } else if (onFinish) {
      onFinish(nextTab);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      const profile = await signInWithGoogle();
      if (profile) {
        setUserProfile(profile);
        handleProceed('home');
      } else {
        handleProceed('auth');
      }
    } catch (err) {
      console.error('Google Sign-In error:', err);
      handleProceed('auth');
    } finally {
      setIsSigningIn(false);
    }
  };

  useEffect(() => {
    if (isReady) {
      // Auto-transition to Auth (or Home if already signed in) after 2s
      const timer = setTimeout(() => {
        handleProceed();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isReady, userProfile]);

  return (
    <div className="relative w-full h-full min-h-[600px] flex flex-col items-center justify-between p-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white select-none overflow-hidden transition-colors duration-300">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-600/20 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
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

      {/* Bottom Action Area */}
      <div className="flex flex-col items-center space-y-3 z-10 pb-4 w-full px-8">
        {!isReady ? (
          <div className="flex flex-col items-center space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-slate-200 dark:border-slate-700 border-t-cyan-400 animate-spin" />
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide">
              Initializing intelligent storage engine...
            </p>
          </div>
        ) : (
          <button
            onClick={handleGoogleSignIn}
            disabled={isSigningIn}
            className="w-full flex items-center justify-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm active:scale-95 transition-transform"
          >
            {isSigningIn ? (
              <div className="w-5 h-5 rounded-full border-2 border-slate-200 border-t-cyan-500 animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  Continue with Google
                </span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
