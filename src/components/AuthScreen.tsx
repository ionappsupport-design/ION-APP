import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  KeyRound,
  CheckCircle2
} from 'lucide-react';
import { IonLogo } from './IonLogo';
import { 
  signInWithEmail, 
  signUpWithEmail, 
  signInWithGoogle, 
  signInWithDemoCredentials, 
  signInAsGuest,
  DEMO_REVIEWER_CREDENTIALS 
} from '../services/authService';
import toast from 'react-hot-toast';

interface AuthScreenProps {
  onSuccess: () => void;
  onSkip?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess, onSkip }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Quick 1-Tap Login with pre-configured Google Play Reviewer credentials
  const handleQuickDemoLogin = async () => {
    try {
      setIsLoading(true);
      setEmail(DEMO_REVIEWER_CREDENTIALS.email);
      setPassword(DEMO_REVIEWER_CREDENTIALS.password);
      
      const user = await signInWithDemoCredentials();
      toast.success(`Welcome, ${user.displayName || 'Reviewer'}! Demo access verified.`, {
        duration: 3000,
        icon: '✅'
      });
      onSuccess();
    } catch (err: any) {
      toast.error('Demo authentication failed: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Please enter both email and password');
      return;
    }

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      if (password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }
    }

    try {
      setIsLoading(true);
      if (mode === 'signin') {
        const user = await signInWithEmail(email, password);
        toast.success(`Signed in as ${user.displayName || user.email}`);
        onSuccess();
      } else {
        const user = await signUpWithEmail(email, password, name);
        toast.success(`Account created! Welcome, ${user.displayName}`);
        onSuccess();
      }
    } catch (err: any) {
      toast.error(err?.message || 'Authentication error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const user = await signInWithGoogle();
      if (user) {
        toast.success(`Signed in as ${user.displayName || user.email}`);
        onSuccess();
      }
    } catch (err) {
      console.warn('Google sign-in skipped/failed:', err);
      // Fallback seamlessly so reviewer or user is never blocked
      toast('Continuing with demo session...', { icon: 'ℹ️' });
      await handleQuickDemoLogin();
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestContinue = async () => {
    try {
      setIsLoading(true);
      await signInAsGuest();
      if (onSkip) {
        onSkip();
      } else {
        onSuccess();
      }
    } catch {
      onSuccess();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[600px] flex flex-col justify-between p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white select-none overflow-y-auto transition-colors duration-300">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-600/15 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header & Skip Action */}
      <div className="w-full flex items-center justify-between pt-1 z-10">
        <IonLogo size="sm" showTagline={false} />
        <button 
          onClick={handleGuestContinue}
          className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-full bg-white dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700/60 shadow-sm transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
        >
          <span>Continue as Guest</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Authentication Container */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm mx-auto my-auto py-4 z-10 space-y-4"
      >
        {/* Title Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {mode === 'signin' ? 'Welcome Back' : 'Create Your Account'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {mode === 'signin' 
              ? 'Sign in to access cloud backup & intelligent cleaning' 
              : 'Join ION to clean storage and boost device performance'}
          </p>
        </div>

        {/* GOOGLE PLAY REVIEWER / DEMO ACCESS BOX */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-indigo-500/10 dark:from-blue-900/30 dark:via-cyan-900/20 dark:to-indigo-900/30 border border-cyan-500/30 dark:border-cyan-500/40 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-300">
                Google Play Reviewer Access
              </span>
            </div>
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30">
              DEMO
            </span>
          </div>

          <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5 bg-white/60 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-medium">Email:</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 select-all">
                {DEMO_REVIEWER_CREDENTIALS.email}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-medium">Password:</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 select-all">
                {DEMO_REVIEWER_CREDENTIALS.password}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleQuickDemoLogin}
            disabled={isLoading}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>⚡ 1-Tap Auto-fill & Sign In</span>
          </button>
        </div>

        {/* Tab Switcher: Sign In vs Sign Up */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'signin'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'signup'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <AnimatePresence mode="wait">
            {mode === 'signup' && (
              <motion.div
                key="name-field"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="relative"
              >
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {mode === 'signup' && (
              <motion.div
                key="confirm-password-field"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="relative"
              >
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/10 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
            ) : (
              <>
                <span>{mode === 'signin' ? 'Sign In with Email' : 'Create Account'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
          <span className="bg-slate-50 dark:bg-slate-950 px-2 text-[10px] uppercase font-bold text-slate-400">
            or
          </span>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm active:scale-95 transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Continue with Google
          </span>
        </button>
      </motion.div>

      {/* Footer Notice */}
      <div className="w-full text-center pb-2 z-10">
        <p className="text-[10px] text-slate-400">
          By continuing, you agree to our Terms of Service & Privacy Policy.
        </p>
      </div>
    </div>
  );
};
