import { describe, it, expect, beforeEach } from 'vitest';
import { formatBytes } from '../utils/formatters';
import { categorizeSocialMedia } from '../services/socialCleaner';
import { generateSmartRecommendations } from '../services/storageScanner';
import { 
  PRO_PLANS, 
  getPlansForRegion,
  getTrialState,
  startFreeTrial,
  saveProMembership, 
  getStoredProMembership, 
  clearProMembership 
} from '../services/razorpayService';
import { 
  PRIVACY_POLICY_DATA, 
  TERMS_OF_USE_DATA, 
  REFUND_POLICY_DATA, 
  DEVELOPER_INFO 
} from '../utils/legalPolicies';
import { ScannedFile } from '../types';

describe('ION Core Storage Utilities & Math', () => {
  it('correctly formats bytes into human readable strings', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1024 * 1024)).toBe('1 MB');
    expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB');
    expect(formatBytes(5.5 * 1024 * 1024 * 1024)).toBe('5.5 GB');
  });

  it('categorizes social media files into deep WhatsApp/Telegram subfolders', () => {
    const mockFiles: ScannedFile[] = [
      {
        id: 'f1',
        name: 'VID_SENT_1.mp4',
        size: 50 * 1024 * 1024,
        path: '/Android/media/com.whatsapp/WhatsApp/Media/WhatsApp Video/Sent/VID_SENT_1.mp4',
        source: 'native',
        category: 'video',
        mimeType: 'video/mp4',
        lastModified: Date.now(),
        securityStatus: 'safe',
      },
      {
        id: 'f2',
        name: 'AUD_VOICE_1.opus',
        size: 2 * 1024 * 1024,
        path: '/Android/media/com.whatsapp/WhatsApp/Media/WhatsApp Voice Notes/AUD_VOICE_1.opus',
        source: 'native',
        category: 'audio',
        mimeType: 'audio/opus',
        lastModified: Date.now(),
        securityStatus: 'safe',
      },
    ];

    const categories = categorizeSocialMedia(mockFiles);
    expect(categories).toBeDefined();
    expect(categories.length).toBeGreaterThan(0);

    const sentCategory = categories.find((c) => c.categoryTitle.includes('Sent Media'));
    expect(sentCategory).toBeDefined();
    expect(sentCategory?.count).toBe(1);
    expect(sentCategory?.sizeBytes).toBe(50 * 1024 * 1024);
  });

  it('generates smart recommendations from scanned files', async () => {
    const mockFiles: ScannedFile[] = [
      {
        id: 'j1',
        name: 'app_cache.tmp',
        size: 15 * 1024 * 1024,
        path: '/Android/data/cache.tmp',
        source: 'native',
        category: 'junk',
        mimeType: 'application/octet-stream',
        lastModified: Date.now(),
        isJunk: true,
        junkType: 'system_cache',
        securityStatus: 'safe',
      },
    ];

    const recs = await generateSmartRecommendations(mockFiles);
    expect(recs).toBeDefined();
    expect(Array.isArray(recs)).toBe(true);
  });
});

describe('Monetization: 7-Day Free Trial & ₹150 Lifetime Pricing', () => {
  beforeEach(() => {
    clearProMembership();
  });

  it('initializes and manages 7-Day Free Trial', () => {
    const trial = startFreeTrial();
    expect(trial.isTrialActive).toBe(true);
    expect(trial.remainingDays).toBe(7);
    expect(trial.billingStatus).toBe('trial');

    const membership = getStoredProMembership();
    expect(membership.isPro).toBe(true);
    expect(membership.isTrial).toBe(true);
    expect(membership.trialDaysLeft).toBe(7);
  });

  it('configures India pricing: ₹150 for Lifetime Access', () => {
    const indiaPlans = getPlansForRegion('IN');
    const lifetime = indiaPlans.find(p => p.id === 'lifetime');
    expect(lifetime).toBeDefined();
    expect(lifetime?.price).toBe(150);
    expect(lifetime?.currency).toBe('INR');
    expect(lifetime?.currencySymbol).toBe('₹');
  });

  it('configures USA pricing: US$ 4 for Lifetime Access', () => {
    const usaPlans = getPlansForRegion('US');
    const lifetime = usaPlans.find(p => p.id === 'lifetime');
    expect(lifetime).toBeDefined();
    expect(lifetime?.price).toBe(4);
    expect(lifetime?.currency).toBe('USD');
    expect(lifetime?.currencySymbol).toBe('$');
  });

  it('configures UK pricing: £3 GBP for Lifetime Access', () => {
    const ukPlans = getPlansForRegion('GB');
    const lifetime = ukPlans.find(p => p.id === 'lifetime');
    expect(lifetime).toBeDefined();
    expect(lifetime?.price).toBe(3);
    expect(lifetime?.currency).toBe('GBP');
    expect(lifetime?.currencySymbol).toBe('£');
  });

  it('configures Global / Other Countries pricing: US$ 4', () => {
    const globalPlans = getPlansForRegion('GLOBAL');
    const lifetime = globalPlans.find(p => p.id === 'lifetime');
    expect(lifetime).toBeDefined();
    expect(lifetime?.price).toBe(4);
    expect(lifetime?.currency).toBe('USD');
    expect(lifetime?.currencySymbol).toBe('$');
  });

  it('persists and retrieves Lifetime Pro membership upon successful ₹150 Razorpay payment', () => {
    const lifetimePlan = PRO_PLANS.find(p => p.id === 'lifetime')!;
    const mockRazorpayResponse = {
      razorpay_payment_id: 'pay_test_150inr',
      razorpay_order_id: 'order_test_150',
      razorpay_signature: 'sig_test_150',
    };

    const saved = saveProMembership(lifetimePlan, mockRazorpayResponse);
    expect(saved.isPro).toBe(true);
    expect(saved.planId).toBe('lifetime');
    expect(saved.amountPaid).toBe(150);
    expect(saved.isTrial).toBe(false);

    const retrieved = getStoredProMembership();
    expect(retrieved.isPro).toBe(true);
    expect(retrieved.planId).toBe('lifetime');
    expect(retrieved.status).toBe('active');
  });
});

describe('Legal & Policies Compliance', () => {
  it('contains complete Privacy Policy dated August 21, 2026', () => {
    expect(PRIVACY_POLICY_DATA.effectiveDate).toBe('August 21, 2026');
    expect(PRIVACY_POLICY_DATA.sections.length).toBe(10);
    expect(PRIVACY_POLICY_DATA.sections[0].heading).toContain('1. Information We Collect');
  });

  it('contains complete Terms of Use dated August 21, 2026', () => {
    expect(TERMS_OF_USE_DATA.effectiveDate).toBe('August 21, 2026');
    expect(TERMS_OF_USE_DATA.sections.length).toBe(13);
    expect(TERMS_OF_USE_DATA.sections[0].heading).toContain('1. Eligibility');
  });

  it('contains complete Refund Policy with No Refunds clause', () => {
    expect(REFUND_POLICY_DATA.effectiveDate).toBe('August 21, 2026');
    expect(REFUND_POLICY_DATA.sections.length).toBe(5);
    expect(REFUND_POLICY_DATA.sections[0].heading).toContain('1. No Refunds');
  });

  it('has verified developer and contact credentials', () => {
    expect(DEVELOPER_INFO.founder).toBe('Syed Shawket Hussain Madani');
    expect(DEVELOPER_INFO.coDeveloperEmail).toBe('alll.rounderone@gmail.com');
    expect(DEVELOPER_INFO.phone).toBe('+91 7657026275');
    expect(DEVELOPER_INFO.location).toContain('Bhubaneswar, Odisha');
  });
});
