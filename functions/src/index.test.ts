import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HttpsError } from "firebase-functions/v2/https";

// Mock Firebase Admin
vi.mock('firebase-admin', () => ({
  initializeApp: vi.fn(),
}));

const { mockGet, mockSet, mockRunTransaction, mockBatchSet, mockBatchCommit } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockSet: vi.fn(),
  mockRunTransaction: vi.fn(),
  mockBatchSet: vi.fn(),
  mockBatchCommit: vi.fn(),
}));

vi.mock('firebase-admin/firestore', () => ({
  getFirestore: () => ({
    collection: (path: string) => ({
      doc: (id: string) => ({
        set: mockSet,
      }),
    }),
    runTransaction: mockRunTransaction,
    batch: () => ({
      set: mockBatchSet,
      commit: mockBatchCommit
    })
  }),
  FieldValue: {
    serverTimestamp: vi.fn()
  }
}));

// Mock Razorpay SDK
const { mockFetch } = vi.hoisted(() => ({
  mockFetch: vi.fn(),
}));
vi.mock('razorpay', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      payments: {
        fetch: mockFetch
      }
    }))
  };
});

// Now import the function
import { verifyPaymentCore } from './index';

describe('verifyPaymentCore Cloud Function', () => {
  const MOCK_SECRET = 'fallback_test_secret_change_me';
  
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RAZORPAY_KEY_ID = 'real_key'; // enforce Razorpay API checking
    mockRunTransaction.mockResolvedValue(true);
    mockBatchCommit.mockResolvedValue(true);
  });

  const generateSignature = (orderId: string, paymentId: string) => {
    return require('crypto')
      .createHmac('sha256', MOCK_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
  };

  it('rejects unauthenticated requests', async () => {
    const mockDbLocal = {
      collection: (path: string) => ({
        doc: (id: string) => ({
          set: mockSet,
        }),
      }),
      runTransaction: mockRunTransaction,
      batch: () => ({
        set: mockBatchSet,
        commit: mockBatchCommit
      })
    };
    
    
    await expect(verifyPaymentCore({ data: {} } as any, mockDbLocal as any, MOCK_SECRET, 'real_key', { payments: { fetch: mockFetch } })).rejects.toThrow('User must be signed in to verify payment.');
  });

  it('rejects missing/malformed fields', async () => {
    const req = {
      auth: { uid: 'user123' },
      data: { planId: 'lifetime' } // missing paymentId, orderId, signature
    };
    const mockDbLocal = {
      collection: (path: string) => ({
        doc: (id: string) => ({
          set: mockSet,
        }),
      }),
      runTransaction: mockRunTransaction,
      batch: () => ({
        set: mockBatchSet,
        commit: mockBatchCommit
      })
    };
    
    await expect(verifyPaymentCore(req as any, mockDbLocal as any, MOCK_SECRET, 'real_key', { payments: { fetch: mockFetch } })).rejects.toThrow('Missing required payment verification fields.');
  });

  it('rejects invalid/wrong plan IDs', async () => {
    const req = {
      auth: { uid: 'user123' },
      data: { planId: 'hacker_plan', paymentId: 'p1', orderId: 'o1', signature: 's1' }
    };
    const mockDbLocal = {
      collection: (path: string) => ({
        doc: (id: string) => ({
          set: mockSet,
        }),
      }),
      runTransaction: mockRunTransaction,
      batch: () => ({
        set: mockBatchSet,
        commit: mockBatchCommit
      })
    };
    
    await expect(verifyPaymentCore(req as any, mockDbLocal as any, MOCK_SECRET, 'real_key', { payments: { fetch: mockFetch } })).rejects.toThrow('Invalid plan ID: hacker_plan');
  });

  it('rejects invalid signatures', async () => {
    const req = {
      auth: { uid: 'user123' },
      data: { planId: 'lifetime', paymentId: 'p1', orderId: 'o1', signature: 'wrong_sig' }
    };
    const mockDbLocal = {
      collection: (path: string) => ({
        doc: (id: string) => ({
          set: mockSet,
        }),
      }),
      runTransaction: mockRunTransaction,
      batch: () => ({
        set: mockBatchSet,
        commit: mockBatchCommit
      })
    };
    
    await expect(verifyPaymentCore(req as any, mockDbLocal as any, MOCK_SECRET, 'real_key', { payments: { fetch: mockFetch } })).rejects.toThrow('Payment signature verification failed. Potential spoofing attempt.');
  });

  it('rejects duplicate/replayed order requests', async () => {
    const sig = generateSignature('order_dup', 'pay_dup');
    const req = {
      auth: { uid: 'user123' },
      data: { planId: 'lifetime', paymentId: 'pay_dup', orderId: 'order_dup', signature: sig }
    };
    
    mockRunTransaction.mockRejectedValueOnce(new Error('ORDER_ALREADY_PROCESSED'));
    const mockDbLocal = {
      collection: (path: string) => ({
        doc: (id: string) => ({
          set: mockSet,
        }),
      }),
      runTransaction: mockRunTransaction,
      batch: () => ({
        set: mockBatchSet,
        commit: mockBatchCommit
      })
    };
    
    await expect(verifyPaymentCore(req as any, mockDbLocal as any, MOCK_SECRET, 'real_key', { payments: { fetch: mockFetch } })).rejects.toThrow('This order has already been processed.');
  });

  it('rejects failed or uncaptured payments (Razorpay API)', async () => {
    const sig = generateSignature('order_1', 'pay_1');
    const req = {
      auth: { uid: 'user123' },
      data: { planId: 'lifetime', paymentId: 'pay_1', orderId: 'order_1', signature: sig }
    };
    
    mockFetch.mockResolvedValueOnce({ status: 'failed', amount: 15000, currency: 'INR' });
    const mockDbLocal = {
      collection: (path: string) => ({
        doc: (id: string) => ({
          set: mockSet,
        }),
      }),
      runTransaction: mockRunTransaction,
      batch: () => ({
        set: mockBatchSet,
        commit: mockBatchCommit
      })
    };
    
    await expect(verifyPaymentCore(req as any, mockDbLocal as any, MOCK_SECRET, 'real_key', { payments: { fetch: mockFetch } })).rejects.toThrow('Payment is not fully captured. Status is: failed');
  });

  it('rejects payment with wrong amount/currency', async () => {
    const sig = generateSignature('order_1', 'pay_1');
    const req = {
      auth: { uid: 'user123' },
      data: { planId: 'lifetime', paymentId: 'pay_1', orderId: 'order_1', signature: sig }
    };
    
    // Lifetime is 150 INR. We send 1 INR (100 paise)
    mockFetch.mockResolvedValueOnce({ status: 'captured', amount: 100, currency: 'INR' });
    const mockDbLocal = {
      collection: (path: string) => ({
        doc: (id: string) => ({
          set: mockSet,
        }),
      }),
      runTransaction: mockRunTransaction,
      batch: () => ({
        set: mockBatchSet,
        commit: mockBatchCommit
      })
    };
    
    await expect(verifyPaymentCore(req as any, mockDbLocal as any, MOCK_SECRET, 'real_key', { payments: { fetch: mockFetch } })).rejects.toThrow('Payment amount/currency mismatch');
  });
  
  it('rejects payment on Razorpay API failure', async () => {
    const sig = generateSignature('order_1', 'pay_1');
    const req = {
      auth: { uid: 'user123' },
      data: { planId: 'lifetime', paymentId: 'pay_1', orderId: 'order_1', signature: sig }
    };
    
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    const mockDbLocal = {
      collection: (path: string) => ({
        doc: (id: string) => ({
          set: mockSet,
        }),
      }),
      runTransaction: mockRunTransaction,
      batch: () => ({
        set: mockBatchSet,
        commit: mockBatchCommit
      })
    };
    
    await expect(verifyPaymentCore(req as any, mockDbLocal as any, MOCK_SECRET, 'real_key', { payments: { fetch: mockFetch } })).rejects.toThrow('Failed to verify payment status with Razorpay.');
  });
  
  it('rejects on Firestore failure', async () => {
    const sig = generateSignature('order_1', 'pay_1');
    const req = {
      auth: { uid: 'user123' },
      data: { planId: 'lifetime', paymentId: 'pay_1', orderId: 'order_1', signature: sig }
    };
    
    mockFetch.mockResolvedValueOnce({ status: 'captured', amount: 15000, currency: 'INR' });
    mockBatchCommit.mockRejectedValueOnce(new Error('Firestore unavailable'));
    
    const mockDbLocal = {
      collection: (path: string) => ({
        doc: (id: string) => ({
          set: mockSet,
        }),
      }),
      runTransaction: mockRunTransaction,
      batch: () => ({
        set: mockBatchSet,
        commit: mockBatchCommit
      })
    };
    
    await expect(verifyPaymentCore(req as any, mockDbLocal as any, MOCK_SECRET, 'real_key', { payments: { fetch: mockFetch } })).rejects.toThrow('Failed to record payment in database.');
  });

  it('accepts valid, captured payment and updates firestore', async () => {
    const sig = generateSignature('order_valid', 'pay_valid');
    const req = {
      auth: { uid: 'user_good' },
      data: { planId: 'lifetime', paymentId: 'pay_valid', orderId: 'order_valid', signature: sig }
    };
    
    mockFetch.mockResolvedValueOnce({ status: 'captured', amount: 15000, currency: 'INR' });
    
    const mockDbLocal = {
      collection: (path: string) => ({
        doc: (id: string) => ({
          set: mockSet,
        }),
      }),
      runTransaction: mockRunTransaction,
      batch: () => ({
        set: mockBatchSet,
        commit: mockBatchCommit
      })
    };
    
    const res = await verifyPaymentCore(req as any, mockDbLocal as any, MOCK_SECRET, 'real_key', { payments: { fetch: mockFetch } });
    expect(res).toEqual({
      success: true,
      membership: expect.objectContaining({
        isPro: true,
        planId: 'lifetime',
        amountPaid: 150,
      })
    });
    
    // Ensure it wrote to firestore batch
    expect(mockBatchSet).toHaveBeenCalledTimes(2); // One for order, one for user
  });
});
