import { PaymentPlan, ProMembership, RazorpaySuccessResponse, SupportedRegion, TrialState } from '../types';
import { signInAnonymously, getCurrentUser, getIdToken } from './authService';

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';
const PRO_MEMBERSHIP_KEY = 'ion_pro_membership_v2';
const TRIAL_STORAGE_KEY = 'ion_free_trial_v2';
const REGION_STORAGE_KEY = 'ion_user_selected_region_v1';

// Standard Razorpay Public Key ID from environment or fallback
const RAZORPAY_KEY_ID = 
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_RAZORPAY_KEY_ID) 
    ? import.meta.env.VITE_RAZORPAY_KEY_ID 
    : 'rzp_test_ion_cleaner_mock';

export interface RegionMetadata {
  id: SupportedRegion;
  name: string;
  currency: 'INR' | 'USD' | 'GBP';
  symbol: string;
  flag: string;
}

export const REGIONS: RegionMetadata[] = [
  { id: 'IN', name: 'India (₹)', currency: 'INR', symbol: '₹', flag: '🇮🇳' },
  { id: 'US', name: 'United States ($)', currency: 'USD', symbol: '$', flag: '🇺🇸' },
  { id: 'GB', name: 'United Kingdom (£)', currency: 'GBP', symbol: '£', flag: '🇬🇧' },
  { id: 'GLOBAL', name: 'Other Countries (Global $)', currency: 'USD', symbol: '$', flag: '🌐' },
];

// In-memory fallback storage
let memoryStorage: Record<string, string> = {};

function safeGetItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch {}
  return memoryStorage[key] || null;
}

function safeSetItem(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
      return;
    }
  } catch {}
  memoryStorage[key] = value;
}

function safeRemoveItem(key: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
      return;
    }
  } catch {}
  delete memoryStorage[key];
}

/**
 * Detect user region based on timezone or locale
 */
export function detectUserRegion(): SupportedRegion {
  try {
    const saved = safeGetItem(REGION_STORAGE_KEY) as SupportedRegion;
    if (saved && REGIONS.some(r => r.id === saved)) {
      return saved;
    }

    if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      if (timeZone.includes('Calcutta') || timeZone.includes('Kolkata') || timeZone.includes('India')) {
        return 'IN';
      }
      if (timeZone.includes('London') || timeZone.includes('Europe/Belfast') || timeZone.includes('Europe/London')) {
        return 'GB';
      }
      if (timeZone.includes('America/') || timeZone.includes('US/') || timeZone.includes('New_York') || timeZone.includes('Los_Angeles') || timeZone.includes('Chicago')) {
        return 'US';
      }
    }
  } catch {}
  return 'IN';
}

export function saveUserRegion(region: SupportedRegion): void {
  safeSetItem(REGION_STORAGE_KEY, region);
}

/**
 * 7-Day Free Trial Management
 */
export function getTrialState(): TrialState {
  const now = Date.now();
  const raw = safeGetItem(TRIAL_STORAGE_KEY);
  
  if (raw) {
    try {
      const state: TrialState = JSON.parse(raw);
      const remainingMs = state.trialEndDate - now;
      const remainingDays = Math.max(0, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));
      const isTrialActive = remainingDays > 0 && !state.isLifetimePurchased;

      return {
        ...state,
        remainingDays,
        isTrialActive,
        billingStatus: state.isLifetimePurchased ? 'purchased' : isTrialActive ? 'trial' : 'expired',
      };
    } catch {}
  }

  // Initialize new 7-Day Free Trial for fresh installations
  const trialDurationDays = 7;
  const trialStartDate = now;
  const trialEndDate = now + trialDurationDays * 24 * 60 * 60 * 1000;
  
  const newState: TrialState = {
    isTrialActive: true,
    trialStartDate,
    trialEndDate,
    remainingDays: trialDurationDays,
    isLifetimePurchased: false,
    billingStatus: 'trial',
  };

  safeSetItem(TRIAL_STORAGE_KEY, JSON.stringify(newState));
  return newState;
}

export function startFreeTrial(): TrialState {
  return getTrialState();
}

/**
 * Generate Plans for the given region
 * Monetization Spec:
 * - India: ₹150 Lifetime Access (7-Day Free Trial included)
 * - USA: US$ 4
 * - UK: £3 GBP
 * - Global: US$ 4
 */
export function getPlansForRegion(region: SupportedRegion = 'IN'): PaymentPlan[] {
  if (region === 'IN') {
    return [
      {
        id: 'lifetime',
        title: 'Lifetime Ultimate Pro',
        tagline: 'Pay once ₹150, enjoy permanent VIP protection',
        price: 150, // Specified requirement: ₹150 Lifetime Access
        originalPrice: 499,
        currency: 'INR',
        currencySymbol: '₹',
        billingPeriod: 'one-time payment',
        badge: 'BEST VALUE',
        isPopular: true,
        features: [
          'Permanent Lifetime VIP Access (Zero renewals)',
          '7-Day Free Trial Instant Activation',
          '100% Ad-Free (Removes all Bottom Banner Ads)',
          'All Future ION Engine updates included',
          'Unlimited Video & Media Compression',
          'Infinite 30-Day Safe Recycle Bin',
          'Exclusive Golden PRO Crown Badge',
        ],
      },
    ];
  }

  if (region === 'GB') {
    return [
      {
        id: 'lifetime',
        title: 'Lifetime Ultimate Pro',
        tagline: 'Pay once £3, permanent VIP protection',
        price: 3, // Specified requirement: UK GBP/Pounds: 3
        originalPrice: 9,
        currency: 'GBP',
        currencySymbol: '£',
        billingPeriod: 'one-time payment',
        badge: 'BEST VALUE',
        isPopular: true,
        features: [
          'Permanent Lifetime VIP Access (Zero renewals)',
          '7-Day Free Trial Instant Activation',
          '100% Ad-Free (Removes all Bottom Banner Ads)',
          'All Future ION Engine updates included',
          'Unlimited Video & Media Compression',
          'Infinite 30-Day Safe Recycle Bin',
          'Exclusive Golden PRO Crown Badge',
        ],
      },
    ];
  }

  // USA & GLOBAL (Equivalent to US$ 4)
  return [
    {
      id: 'lifetime',
      title: 'Lifetime Ultimate Pro',
      tagline: 'Pay once $4, permanent VIP protection',
      price: 4, // Specified requirement: USA: US$ 4 / Global: US$ 4
      originalPrice: 12,
      currency: 'USD',
      currencySymbol: '$',
      billingPeriod: 'one-time payment',
      badge: 'BEST VALUE',
      isPopular: true,
      features: [
        'Permanent Lifetime VIP Access (Zero renewals)',
        '7-Day Free Trial Instant Activation',
        '100% Ad-Free (Removes all Bottom Banner Ads)',
        'All Future ION Engine updates included',
        'Unlimited Video & Media Compression',
        'Infinite 30-Day Safe Recycle Bin',
        'Exclusive Golden PRO Crown Badge',
      ],
    },
  ];
}

export const PRO_PLANS: PaymentPlan[] = getPlansForRegion('IN');

let scriptLoadingPromise: Promise<boolean> | null = null;

/**
 * Dynamically loads the official Razorpay checkout.js SDK
 */
export function loadRazorpaySDK(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);
  
  if ((window as any).Razorpay) {
    return Promise.resolve(true);
  }

  if (scriptLoadingPromise) {
    return scriptLoadingPromise;
  }

  scriptLoadingPromise = new Promise<boolean>((resolve) => {
    const existingScript = document.querySelector(`script[src="${RAZORPAY_SCRIPT_URL}"]`);
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('Razorpay SDK failed to load from CDN. Falling back to sandbox checkout.');
      resolve(false);
    };
    document.body.appendChild(script);
  });

  return scriptLoadingPromise;
}

export interface CheckoutCustomerInfo {
  name?: string;
  email?: string;
  contact?: string;
}

export interface CheckoutOptions {
  plan: PaymentPlan;
  customerInfo?: CheckoutCustomerInfo;
  onSuccess: (response: RazorpaySuccessResponse) => void;
  onFailure: (error: { reason: string; message: string }) => void;
}

/**
 * Launches the Razorpay Checkout Modal
 */
export async function openRazorpayCheckout({
  plan,
  customerInfo,
  onSuccess,
  onFailure,
}: CheckoutOptions): Promise<void> {
  const isSDKLoaded = await loadRazorpaySDK();

  const customerName = customerInfo?.name || 'ION Cleaner User';
  const customerEmail = customerInfo?.email || 'alll.rounderone@gmail.com';
  const customerContact = customerInfo?.contact || '+91 7657026275';

  if (isSDKLoaded && (window as any).Razorpay) {
    try {
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: Math.round(plan.price * 100), // In smallest currency unit (paise/cents/pence: 150 INR = 15000 paise)
        currency: plan.currency,
        name: 'ION Cleaner Pro',
        description: `${plan.title} - ${plan.tagline}`,
        image: 'https://cdn-icons-png.flaticon.com/512/9440/9440384.png',
        handler: function (response: any) {
          if (response && response.razorpay_payment_id) {
            onSuccess({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id || `order_ion_${Date.now()}`,
              razorpay_signature: response.razorpay_signature || `sig_${Math.random().toString(36).substring(2, 10)}`,
            });
          } else {
            onFailure({ reason: 'invalid_response', message: 'Payment response verification failed.' });
          }
        },
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerContact,
        },
        notes: {
          plan_id: plan.id,
          plan_title: plan.title,
          currency: plan.currency,
          developer: 'Swayamjeet Nanda',
          app_version: '3.0.0',
        },
        theme: {
          color: '#2563EB',
          backdrop_color: '#0F172A',
        },
        modal: {
          ondismiss: function () {
            onFailure({ reason: 'dismissed', message: 'Payment window was closed.' });
          },
          escape: true,
          backdropclose: false,
        },
      };

      const razorpayInstance = new (window as any).Razorpay(options);
      razorpayInstance.on('payment.failed', function (resp: any) {
        onFailure({
          reason: 'payment_failed',
          message: resp.error?.description || 'Payment was declined by bank or gateway.',
        });
      });

      razorpayInstance.open();
      return;
    } catch (e: any) {
      console.warn('Error launching native Razorpay modal, triggering fallback simulator:', e);
    }
  }

  // Graceful Sandbox / Test Mode Checkout Simulator when SDK CDN is blocked
  simulateRazorpaySandboxCheckout({ plan, onSuccess, onFailure });
}

function simulateRazorpaySandboxCheckout({
  plan,
  onSuccess,
  onFailure,
}: {
  plan: PaymentPlan;
  onSuccess: (response: RazorpaySuccessResponse) => void;
  onFailure: (error: { reason: string; message: string }) => void;
}) {
  const confirmed = window.confirm(
    `[Razorpay Gateway]\n\n` +
    `Product: ION Cleaner Pro (${plan.title})\n` +
    `Amount: ${plan.currencySymbol}${plan.price} ${plan.currency}\n\n` +
    `Click OK to simulate Successful Payment.\n` +
    `Click Cancel to simulate Cancelled Payment.`
  );

  if (confirmed) {
    const mockPaymentId = `pay_test_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const mockOrderId = `order_test_${Date.now()}`;
    const mockSignature = `sig_test_${Math.random().toString(36).substring(2, 12)}`;
    
    setTimeout(() => {
      onSuccess({
        razorpay_payment_id: mockPaymentId,
        razorpay_order_id: mockOrderId,
        razorpay_signature: mockSignature,
      });
    }, 400);
  } else {
    onFailure({
      reason: 'user_cancelled',
      message: 'Transaction cancelled by user.',
    });
  }
}

/**
 * Retrieve saved Pro membership entitlement from storage
 * Checks paid membership FIRST, then 7-Day Free Trial status
 */
export async function getStoredProMembership(): Promise<ProMembership> {
  // --- SERVER AUTHORITATIVE FETCH ---
  // In a full implementation, we would also query Firestore `users/${uid}` here
  // to ensure the local storage hasn't been spoofed or to restore purchases.
  // We keep the local storage check as the immediate response for offline capability.
  
  // 1. Check paid membership
  try {
    const raw = safeGetItem(PRO_MEMBERSHIP_KEY);
    if (raw) {
      const parsed: ProMembership = JSON.parse(raw);
      
      // If lifetime, permanent Pro
      if (parsed.planId === 'lifetime') {
        return { 
          ...parsed, 
          isPro: true, 
          status: 'active',
          isTrial: false,
          trialDaysLeft: 0,
        };
      }

      // Check date expiry for monthly/annual
      if (parsed.expiresAt && Date.now() <= parsed.expiresAt) {
        return {
          ...parsed,
          isPro: true,
          status: 'active',
          isTrial: false,
        };
      }
    }
  } catch (err) {
    console.error('Failed to load Pro Membership:', err);
  }

  // 2. Check 7-Day Free Trial
  const trial = getTrialState();
  if (trial.isTrialActive && trial.remainingDays > 0) {
    return {
      isPro: true,
      planId: 'trial',
      planName: `7-Day Free Trial (${trial.remainingDays}d left)`,
      status: 'trial',
      isTrial: true,
      trialDaysLeft: trial.remainingDays,
      expiresAt: trial.trialEndDate,
    };
  }

  // 3. Free tier (Trial expired and no paid membership)
  return {
    isPro: false,
    planId: null,
    planName: null,
    status: 'free',
    isTrial: false,
    trialDaysLeft: 0,
  };
}

/**
 * Save new Pro membership to storage (e.g. ₹150 Lifetime Purchase)
 */
export async function saveProMembership(
  plan: PaymentPlan,
  razorpayResponse: RazorpaySuccessResponse
): Promise<ProMembership> {
  const now = Date.now();
  let expiresAt: number | null = null;

  if (plan.id === 'monthly') {
    expiresAt = now + 30 * 24 * 60 * 60 * 1000;
  } else if (plan.id === 'annual') {
    expiresAt = now + 365 * 24 * 60 * 60 * 1000;
  } else if (plan.id === 'lifetime') {
    expiresAt = null; // No expiry, lifetime access
  }

  // --- SERVER AUTHORITATIVE VERIFICATION ---
  let user = await getCurrentUser();
  if (!user) {
    user = await signInAnonymously();
  }
  
  if (!user) {
    throw new Error("Authentication failed. Cannot verify payment without a user account.");
  }

  const token = await getIdToken();
  const functionUrl = import.meta.env.VITE_VERIFY_PAYMENT_URL || 'https://your-project.vercel.app/api/verifyPayment';
  
  const response = await fetch(functionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      data: {
        planId: plan.id,
        paymentId: razorpayResponse.razorpay_payment_id,
        orderId: razorpayResponse.razorpay_order_id,
        signature: razorpayResponse.razorpay_signature,
      }
    })
  });
  
  const json = await response.json();
  if (!response.ok || (json.error && json.error.message)) {
    console.error('Server verification failed:', json);
    throw new Error(json.error?.message || "Payment verification failed or network is unreachable.");
  }
  // -----------------------------------------

  // Only proceed to cache in localStorage AFTER server validation succeeds.
  // We trust the server's response for the final membership object, but for now 
  // we can reconstruct it identically to what the server stores to cache offline.
  const membership: ProMembership = {
    isPro: true,
    planId: plan.id,
    planName: plan.title,
    paymentId: razorpayResponse.razorpay_payment_id,
    orderId: razorpayResponse.razorpay_order_id,
    signature: razorpayResponse.razorpay_signature,
    purchasedAt: now,
    expiresAt,
    amountPaid: plan.price,
    currency: plan.currency,
    status: 'active',
    isTrial: false,
    trialDaysLeft: 0,
  };

  try {
    safeSetItem(PRO_MEMBERSHIP_KEY, JSON.stringify(membership));

    // Update trial state as lifetime purchased
    const trial = getTrialState();
    safeSetItem(TRIAL_STORAGE_KEY, JSON.stringify({
      ...trial,
      isLifetimePurchased: true,
      isTrialActive: false,
      purchaseDate: now,
      orderId: razorpayResponse.razorpay_order_id,
      billingStatus: 'purchased',
    }));
  } catch (err) {
    console.error('Failed to persist Pro membership:', err);
  }

  return membership;
}

/**
 * Clear Pro membership (for testing / reset)
 */
export function clearProMembership(): void {
  try {
    safeRemoveItem(PRO_MEMBERSHIP_KEY);
    safeRemoveItem(TRIAL_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to remove Pro membership:', err);
  }
}
