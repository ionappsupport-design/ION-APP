import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  Crown, 
  Check, 
  Zap, 
  ShieldCheck, 
  Sparkles, 
  Lock, 
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Globe,
  FileText,
  X
} from 'lucide-react';
import { PaymentPlan, ProMembership, NavigationTab, SupportedRegion } from '../types';
import { 
  REGIONS, 
  getPlansForRegion, 
  detectUserRegion, 
  saveUserRegion,
  openRazorpayCheckout, 
  saveProMembership, 
  getStoredProMembership 
} from '../services/razorpayService';
import { 
  PRIVACY_POLICY_DATA, 
  TERMS_OF_USE_DATA, 
  REFUND_POLICY_DATA, 
  DEVELOPER_INFO 
} from '../utils/legalPolicies';

interface UpgradeProScreenProps {
  currentMembership: ProMembership;
  onBack: () => void;
  onUpgradeSuccess: (membership: ProMembership) => void;
  onNavigate: (tab: NavigationTab) => void;
}

export const UpgradeProScreen: React.FC<UpgradeProScreenProps> = ({
  currentMembership,
  onBack,
  onUpgradeSuccess,
  onNavigate,
}) => {
  const [selectedRegion, setSelectedRegion] = useState<SupportedRegion>(() => detectUserRegion());
  const [selectedPlanId, setSelectedPlanId] = useState<'monthly' | 'annual' | 'lifetime'>('lifetime');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'plans' | 'features' | 'faq' | 'legal'>('plans');
  const [activeLegalDoc, setActiveLegalDoc] = useState<'privacy' | 'terms' | 'refund' | null>(null);

  const plans = getPlansForRegion(selectedRegion);
  const selectedPlan = plans.find(p => p.id === selectedPlanId) || plans[2];

  const handleRegionChange = (newRegion: SupportedRegion) => {
    setSelectedRegion(newRegion);
    saveUserRegion(newRegion);
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#3B82F6', '#06B6D4', '#10B981', '#F59E0B', '#8B5CF6'],
      });
    } catch {}
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      await openRazorpayCheckout({
        plan: selectedPlan,
        customerInfo: {
          name: 'ION Cleaner Pro User',
          email: DEVELOPER_INFO.founderEmail,
          contact: DEVELOPER_INFO.phone,
        },
        onSuccess: (res) => {
          setIsProcessing(false);
          const newMembership = saveProMembership(selectedPlan, res);
          onUpgradeSuccess(newMembership);
          setShowSuccessModal(true);
          triggerConfetti();
        },
        onFailure: (err) => {
          setIsProcessing(false);
          if (err.reason !== 'dismissed' && err.reason !== 'user_cancelled') {
            setErrorMsg(err.message || 'Payment could not be completed. Please try again.');
          }
        },
      });
    } catch (e: any) {
      setIsProcessing(false);
      setErrorMsg(e.message || 'Failed to initialize payment gateway.');
    }
  };

  const handleRestore = () => {
    const mem = getStoredProMembership();
    if (mem.isPro) {
      onUpgradeSuccess(mem);
      toast.success(`Restored ${mem.planName || 'Pro'} membership successfully!`);
    } else {
      toast.error('No active Pro membership found to restore on this device.');
    }
  };

  const comparisonFeatures = [
    { title: 'System Junk & Cache Shredder', free: 'Basic Clean', pro: 'Ultra Deep Shred' },
    { title: 'Video Compressor Engine', free: 'Standard 480p', pro: 'Turbo HEVC (Reclaim 70%)' },
    { title: 'WhatsApp & Telegram Cleaner', free: 'Manual Browse', pro: 'Automated 1-Tap Deep Sweep' },
    { title: 'Recycle Bin Safe Recovery', free: '7-Day Limit', pro: 'Full 30-Day Safe Recovery' },
    { title: 'Duplicate & Blurry Photo AI', free: 'Sample Preview', pro: 'Unlimited Smart Batching' },
    { title: 'Ad Experience', free: 'Ad Supported', pro: '100% Ad-Free Clean UI' },
    { title: 'Customer Support', free: 'Community', pro: '24/7 VIP Priority Line' },
  ];

  const faqs = [
    {
      q: 'What is the 7-Day Free Trial & Pricing model?',
      a: 'All new users receive an instant 7-Day Free Trial with full VIP features. After the trial, you can get permanent Lifetime Access for just ₹150 (India) / US$ 4 (USA/Global) / £3 GBP (UK). All lifetime purchases are one-time with zero recurring fees.',
    },
    {
      q: 'Does ION show video advertisements?',
      a: 'No. ION strictly never shows video advertisements or disruptive popup ads. Free tier users only see a clean, non-intrusive bottom banner ad, which is permanently removed with Lifetime Pro or during the 7-Day Free Trial.',
    },
    {
      q: 'Which payment methods are supported by Razorpay?',
      a: 'Razorpay supports all major payment methods: UPI (Google Pay, PhonePe, Paytm, BHIM), Credit & Debit Cards (Visa, Mastercard, RuPay, Amex), NetBanking (50+ Banks), and International Cards.',
    },
    {
      q: 'What is the Refund Policy?',
      a: 'As per our Refund Policy (Effective August 21, 2026), all purchases made through the App are final and non-refundable, except where required by law. Duplicate or technical charges can be reported to alll.rounderone@gmail.com.',
    },
    {
      q: 'How do I contact support or developer?',
      a: `Developer: ${DEVELOPER_INFO.founder} & ${DEVELOPER_INFO.coDeveloper}\nEmail: ${DEVELOPER_INFO.founderEmail}`,
    },
  ];

  return (
    <div className="flex flex-col min-h-full select-none bg-slate-900 text-white pb-20">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md px-4 py-3.5 flex items-center justify-between border-b border-slate-800">
        <button
          onClick={onBack}
          className="p-2 rounded-2xl bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white active:scale-95 transition-transform"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold">
          <Crown className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>ION PRO VIP</span>
        </div>

        <button
          onClick={handleRestore}
          className="text-[11px] font-bold text-slate-400 hover:text-cyan-400 transition-colors"
        >
          Restore
        </button>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-6">
        {/* Hero Glow Banner */}
        <div className="relative rounded-[32px] p-6 bg-gradient-to-b from-blue-900/50 via-slate-900 to-slate-900 border border-blue-500/30 overflow-hidden text-center shadow-2xl shadow-blue-500/10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Animated Crown Icon */}
          <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-xl shadow-amber-500/20 mb-3">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
              <Crown className="w-10 h-10 text-amber-400 fill-amber-400 animate-pulse" />
            </div>
          </div>

          <h2 className="text-2xl font-black tracking-tight text-white">
            Unlock Full Phone Power
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
            Extreme storage shredding, 70% video compression, WhatsApp sweeper, and 100% ad-free experience.
          </p>

          {/* Status Pill if in Free Trial or Pro */}
          {currentMembership.isTrial ? (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 text-xs font-bold shadow-md shadow-cyan-500/20 animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>7-Day Free Trial Active ({currentMembership.trialDaysLeft} days left)</span>
            </div>
          ) : currentMembership.isPro ? (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Current Status: Lifetime Pro Active ({currentMembership.planName})</span>
            </div>
          ) : (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-bold">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Free Trial Ended • Upgrade to Lifetime for ₹150</span>
            </div>
          )}
        </div>

        {/* Country / Currency Selector */}
        <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Region & Currency:</span>
          </div>

          <div className="flex items-center gap-1">
            {REGIONS.map((r) => (
              <button
                key={r.id}
                onClick={() => handleRegionChange(r.id)}
                className={`px-2 py-1 rounded-xl text-[11px] font-bold transition-all ${
                  selectedRegion === r.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white'
                }`}
              >
                <span>{r.flag}</span> <span className="ml-0.5">{r.currency}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Switcher: Plans | Features | FAQ | Legal */}
        <div className="flex bg-slate-800/80 p-1 rounded-2xl border border-slate-700/60">
          <button
            onClick={() => setActiveTab('plans')}
            className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition-all ${
              activeTab === 'plans' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Plans
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition-all ${
              activeTab === 'features' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Features
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition-all ${
              activeTab === 'faq' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            FAQ
          </button>
          <button
            onClick={() => setActiveTab('legal')}
            className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition-all ${
              activeTab === 'legal' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Policies
          </button>
        </div>

        {/* Tab 1: Plan Selector */}
        {activeTab === 'plans' && (
          <div className="space-y-3">
            {plans.map((plan) => {
              const isSelected = selectedPlanId === plan.id;
              const isLifetime = plan.id === 'lifetime';

              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`relative p-4 rounded-3xl border transition-all cursor-pointer ${
                    isSelected
                      ? isLifetime
                        ? 'bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/30 border-amber-500/60 ring-2 ring-amber-500/40 shadow-lg shadow-amber-500/10'
                        : 'bg-gradient-to-r from-blue-950/40 via-slate-900 to-blue-950/30 border-blue-500/60 ring-2 ring-blue-500/40 shadow-lg shadow-blue-500/10'
                      : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
                  }`}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <div
                      className={`absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase shadow-sm ${
                        isLifetime
                          ? 'bg-amber-400 text-slate-950'
                          : plan.isPopular
                          ? 'bg-cyan-400 text-slate-950'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {plan.badge}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isSelected
                            ? isLifetime
                              ? 'border-amber-400 bg-amber-400 text-slate-950'
                              : 'border-blue-500 bg-blue-500 text-white'
                            : 'border-slate-600'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                          {plan.title}
                          {isLifetime && <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          {plan.tagline}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-baseline justify-end gap-1">
                        <span className="text-lg font-black text-white">
                          {plan.currencySymbol}{plan.price}
                        </span>
                        {plan.originalPrice && (
                          <span className="text-xs text-slate-500 line-through">
                            {plan.currencySymbol}{plan.originalPrice}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        {plan.billingPeriod}
                      </div>
                    </div>
                  </div>

                  {/* Plan Features Pill List */}
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 pt-3 border-t border-slate-700/60 grid grid-cols-1 gap-1.5"
                    >
                      {plan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Feature Matrix */}
        {activeTab === 'features' && (
          <div className="bg-slate-800/60 rounded-3xl p-4 border border-slate-700/60 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Free vs Pro Comparison
            </h3>

            <div className="divide-y divide-slate-700/60">
              {comparisonFeatures.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">{item.title}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 text-[11px]">{item.free}</span>
                    <span className="text-cyan-400 font-bold text-[11px] bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-800/40">
                      {item.pro}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: FAQ */}
        {activeTab === 'faq' && (
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-slate-800/50 rounded-2xl p-3.5 border border-slate-700/60 space-y-1">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  {faq.q}
                </h4>
                <p className="text-[11px] text-slate-400 pl-5 leading-relaxed whitespace-pre-line">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Legal & Policies */}
        {activeTab === 'legal' && (
          <div className="space-y-3">
            <div 
              onClick={() => setActiveLegalDoc('refund')}
              className="cursor-pointer bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60 hover:border-amber-500/50 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="text-xs font-bold text-white">Refund Policy</div>
                  <div className="text-[10px] text-slate-400">Effective Date: August 21, 2026</div>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-400">Read</span>
            </div>

            <div 
              onClick={() => setActiveLegalDoc('terms')}
              className="cursor-pointer bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60 hover:border-blue-500/50 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-blue-400" />
                <div>
                  <div className="text-xs font-bold text-white">Terms of Use</div>
                  <div className="text-[10px] text-slate-400">Effective Date: August 21, 2026</div>
                </div>
              </div>
              <span className="text-xs font-bold text-blue-400">Read</span>
            </div>

            <div 
              onClick={() => setActiveLegalDoc('privacy')}
              className="cursor-pointer bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60 hover:border-emerald-500/50 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="text-xs font-bold text-white">Privacy Policy</div>
                  <div className="text-[10px] text-slate-400">Effective Date: August 21, 2026</div>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-400">Read</span>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-950/50 border border-rose-800/60 flex items-center gap-2.5 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Checkout Button */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handleCheckout}
            disabled={isProcessing}
            className={`w-full relative group overflow-hidden rounded-2xl py-4 font-black text-base shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-white ${
              selectedPlan.id === 'lifetime'
                ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:to-yellow-600 shadow-amber-500/25 text-slate-950 font-black'
                : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-blue-500/25'
            }`}
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Connecting to Razorpay...</span>
              </div>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Upgrade for {selectedPlan.currencySymbol}{selectedPlan.price} {selectedPlan.currency}</span>
              </>
            )}
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
          </button>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400">
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Razorpay Verified</span>
            </div>
            <div className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-blue-400" />
              <span>256-Bit SSL Encrypted</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Instant Activation</span>
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-500 flex items-center justify-center gap-2">
            <span>By upgrading, you agree to our</span>
            <button onClick={() => setActiveLegalDoc('terms')} className="text-cyan-400 underline">Terms</button>
            <span>&</span>
            <button onClick={() => setActiveLegalDoc('refund')} className="text-amber-400 underline">Refund Policy</button>
          </div>
        </div>
      </main>

      {/* Full Screen Legal Policy Viewer Modal */}
      <AnimatePresence>
        {activeLegalDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-700 rounded-3xl p-5 max-w-md w-full max-h-[85vh] flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white">
                    {activeLegalDoc === 'refund' && REFUND_POLICY_DATA.title}
                    {activeLegalDoc === 'terms' && TERMS_OF_USE_DATA.title}
                    {activeLegalDoc === 'privacy' && PRIVACY_POLICY_DATA.title}
                  </h3>
                  <p className="text-[10px] text-slate-400">Effective Date: August 21, 2026</p>
                </div>
                <button
                  onClick={() => setActiveLegalDoc(null)}
                  className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-3 space-y-4 text-xs text-slate-300 leading-relaxed pr-1">
                {activeLegalDoc === 'refund' && (
                  REFUND_POLICY_DATA.sections.map((sec, idx) => (
                    <div key={idx} className="space-y-1">
                      <h4 className="font-bold text-white text-xs">{sec.heading}</h4>
                      <p className="whitespace-pre-line text-[11px] text-slate-400">{sec.content}</p>
                    </div>
                  ))
                )}
                {activeLegalDoc === 'terms' && (
                  TERMS_OF_USE_DATA.sections.map((sec, idx) => (
                    <div key={idx} className="space-y-1">
                      <h4 className="font-bold text-white text-xs">{sec.heading}</h4>
                      <p className="whitespace-pre-line text-[11px] text-slate-400">{sec.content}</p>
                    </div>
                  ))
                )}
                {activeLegalDoc === 'privacy' && (
                  PRIVACY_POLICY_DATA.sections.map((sec, idx) => (
                    <div key={idx} className="space-y-1">
                      <h4 className="font-bold text-white text-xs">{sec.heading}</h4>
                      <p className="whitespace-pre-line text-[11px] text-slate-400">{sec.content}</p>
                    </div>
                  ))
                )}
              </div>

              <button
                onClick={() => setActiveLegalDoc(null)}
                className="w-full mt-3 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700"
              >
                Close Policy
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Celebration Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-slate-900 border border-amber-500/50 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl shadow-amber-500/20"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 mx-auto shadow-lg shadow-amber-500/30 flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
                  <Crown className="w-8 h-8 text-amber-400 fill-amber-400 animate-bounce" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-white">
                  Welcome to ION PRO VIP!
                </h3>
                <p className="text-xs text-slate-400">
                  Your payment of <span className="text-amber-400 font-bold">{selectedPlan.currencySymbol}{selectedPlan.price} {selectedPlan.currency}</span> was verified successfully. All premium tools are now unlocked.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-left space-y-1 text-xs">
                <div className="text-slate-400 text-[10px]">Plan Activated:</div>
                <div className="text-white font-bold">{selectedPlan.title} ({selectedPlan.currencySymbol}{selectedPlan.price})</div>
                <div className="text-emerald-400 text-[10px] flex items-center gap-1 mt-1">
                  <Check className="w-3 h-3" />
                  <span>Unlimited deep storage optimization active</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  onNavigate('home');
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-400/20 hover:brightness-105 active:scale-95 transition-transform"
              >
                Go to Pro Dashboard
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
