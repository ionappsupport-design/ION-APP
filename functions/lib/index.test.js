"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
// Mock Firebase Admin
vitest_1.vi.mock('firebase-admin', () => ({
    initializeApp: vitest_1.vi.fn(),
}));
const { mockSet, mockRunTransaction, mockBatchSet, mockBatchCommit } = vitest_1.vi.hoisted(() => ({
    mockSet: vitest_1.vi.fn(),
    mockRunTransaction: vitest_1.vi.fn(),
    mockBatchSet: vitest_1.vi.fn(),
    mockBatchCommit: vitest_1.vi.fn(),
}));
vitest_1.vi.mock('firebase-admin/firestore', () => ({
    getFirestore: () => ({
        collection: (path) => ({
            doc: (id) => ({
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
        serverTimestamp: vitest_1.vi.fn()
    }
}));
// Mock Razorpay SDK
const { mockFetch } = vitest_1.vi.hoisted(() => ({
    mockFetch: vitest_1.vi.fn(),
}));
vitest_1.vi.mock('razorpay', () => {
    return {
        default: vitest_1.vi.fn().mockImplementation(() => ({
            payments: {
                fetch: mockFetch
            }
        }))
    };
});
// Now import the function
const index_1 = require("./index");
(0, vitest_1.describe)('verifyPaymentCore Cloud Function', () => {
    const MOCK_SECRET = 'fallback_test_secret_change_me';
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        process.env.RAZORPAY_KEY_ID = 'real_key'; // enforce Razorpay API checking
        mockRunTransaction.mockResolvedValue(true);
        mockBatchCommit.mockResolvedValue(true);
    });
    const generateSignature = (orderId, paymentId) => {
        return require('crypto')
            .createHmac('sha256', MOCK_SECRET)
            .update(`${orderId}|${paymentId}`)
            .digest('hex');
    };
    (0, vitest_1.it)('rejects unauthenticated requests', async () => {
        const mockDbLocal = {
            collection: (path) => ({
                doc: (id) => ({
                    set: mockSet,
                }),
            }),
            runTransaction: mockRunTransaction,
            batch: () => ({
                set: mockBatchSet,
                commit: mockBatchCommit
            })
        };
        await (0, vitest_1.expect)((0, index_1.verifyPaymentCore)({ data: {} }, mockDbLocal, MOCK_SECRET, 'real_key', { payments: { fetch: mockFetch } })).rejects.toThrow('User must be signed in to verify payment.');
    });
    (0, vitest_1.it)('rejects missing/malformed fields', async () => {
        const req = {
            auth: { uid: 'user123' },
            data: { planId: 'lifetime' } // missing paymentId, orderId, signature
        };
        const mockDbLocal = {
            collection: (path) => ({
                doc: (id) => ({
                    set: mockSet,
                }),
            }),
            runTransaction: mockRunTransaction,
            batch: () => ({
                set: mockBatchSet,
                commit: mockBatchCommit
            })
        };
        await (0, vitest_1.expect)((0, index_1.verifyPaymentCore)(req, mockDbLocal, MOCK_SECRET, 'real_key', { payments: { fetch: mockFetch } })).rejects.toThrow('Missing required payment verification fields.');
    });
    (0, vitest_1.it)('rejects invalid/wrong plan IDs', async () => {
        const req = {
            auth: { uid: 'user123' },
            data: { planId: 'hacker_plan', paymentId: 'p1', orderId: 'o1', signature: 's1' }
        };
        const mockDbLocal = {
            collection: (path) => ({
                doc: (id) => ({
                    set: mockSet,
                }),
            }),
            runTransaction: mockRunTransaction,
            batch: () => ({
                set: mockBatchSet,
                commit: mockBatchCommit
            })
        };
        await (0, vitest_1.expect)((0, index_1.verifyPaymentCore)(req, mockDbLocal, MOCK_SECRET, 'real_key', { payments: { fetch: mockFetch } })).rejects.toThrow('Invalid plan ID: hacker_plan');
    });
    (0, vitest_1.it)('rejects invalid signatures', async () => {
        const req = {
            auth: { uid: 'user123' },
            data: { planId: 'lifetime', paymentId: 'p1', orderId: 'o1', signature: 'wrong_sig' }
        };
        const mockDbLocal = {
            collection: (path) => ({
                doc: (id) => ({
                    set: mockSet,
                }),
            }),
            runTransaction: mockRunTransaction,
            batch: () => ({
                set: mockBatchSet,
                commit: mockBatchCommit
            })
        };
        await (0, vitest_1.expect)((0, index_1.verifyPaymentCore)(req, mockDbLocal, MOCK_SECRET, 'real_key', { payments: { fetch: mockFetch } })).rejects.toThrow('Payment signature verification failed. Potential spoofing attempt.');
    });
    (0, vitest_1.it)('rejects duplicate/replayed order requests', async () => {
        const sig = generateSignature('order_dup', 'pay_dup');
        const req = {
            auth: { uid: 'user123' },
            data: { planId: 'lifetime', paymentId: 'pay_dup', orderId: 'order_dup', signature: sig }
        };
        mockRunTransaction.mockRejectedValueOnce(new Error('ORDER_ALREADY_PROCESSED'));
        const mockDbLocal = {
            collection: (path) => ({
                doc: (id) => ({
                    set: mockSet,
                }),
            }),
            runTransaction: mockRunTransaction,
            batch: () => ({
                set: mockBatchSet,
                commit: mockBatchCommit
            })
        };
        await (0, vitest_1.expect)((0, index_1.verifyPaymentCore)(req, mockDbLocal, MOCK_SECRET, 'real_key', { payments: { fetch: mockFetch } })).rejects.toThrow('This order has already been processed.');
    });
    (0, vitest_1.it)('rejects failed or uncaptured payments (Razorpay API)', async () => {
        const sig = generateSignature('order_1', 'pay_1');
        const req = {
            auth: { uid: 'user123' },
            data: { planId: 'lifetime', paymentId: 'pay_1', orderId: 'order_1', signature: sig }
        };
        mockFetch.mockResolvedValueOnce({ status: 'failed', amount: 15000, currency: 'INR' });
        const mockDbLocal = {
            collection: (path) => ({
                doc: (id) => ({
                    set: mockSet,
                }),
            }),
            runTransaction: mockRunTransaction,
            batch: () => ({
                set: mockBatchSet,
                commit: mockBatchCommit
            })
        };
        await (0, vitest_1.expect)((0, index_1.verifyPaymentCore)(req, mockDbLocal, MOCK_SECRET, 'real_key', { payments: { fetch: mockFetch } })).rejects.toThrow('Payment is not fully captured. Status is: failed');
    });
    (0, vitest_1.it)('rejects payment with wrong amount/currency', async () => {
        const sig = generateSignature('order_1', 'pay_1');
        const req = {
            auth: { uid: 'user123' },
            data: { planId: 'lifetime', paymentId: 'pay_1', orderId: 'order_1', signature: sig }
        };
        // Lifetime is 150 INR. We send 1 INR (100 paise)
        mockFetch.mockResolvedValueOnce({ status: 'captured', amount: 100, currency: 'INR' });
        const mockDbLocal = {
            collection: (path) => ({
                doc: (id) => ({
                    set: mockSet,
                }),
            }),
            runTransaction: mockRunTransaction,
            batch: () => ({
                set: mockBatchSet,
                commit: mockBatchCommit
            })
        };
        await (0, vitest_1.expect)((0, index_1.verifyPaymentCore)(req, mockDbLocal, MOCK_SECRET, 'real_key', { payments: { fetch: mockFetch } })).rejects.toThrow('Payment amount/currency mismatch');
    });
    (0, vitest_1.it)('rejects payment on Razorpay API failure', async () => {
        const sig = generateSignature('order_1', 'pay_1');
        const req = {
            auth: { uid: 'user123' },
            data: { planId: 'lifetime', paymentId: 'pay_1', orderId: 'order_1', signature: sig }
        };
        mockFetch.mockRejectedValueOnce(new Error('Network error'));
        const mockDbLocal = {
            collection: (path) => ({
                doc: (id) => ({
                    set: mockSet,
                }),
            }),
            runTransaction: mockRunTransaction,
            batch: () => ({
                set: mockBatchSet,
                commit: mockBatchCommit
            })
        };
        await (0, vitest_1.expect)((0, index_1.verifyPaymentCore)(req, mockDbLocal, MOCK_SECRET, 'real_key', { payments: { fetch: mockFetch } })).rejects.toThrow('Failed to verify payment status with Razorpay.');
    });
    (0, vitest_1.it)('rejects on Firestore failure', async () => {
        const sig = generateSignature('order_1', 'pay_1');
        const req = {
            auth: { uid: 'user123' },
            data: { planId: 'lifetime', paymentId: 'pay_1', orderId: 'order_1', signature: sig }
        };
        mockFetch.mockResolvedValueOnce({ status: 'captured', amount: 15000, currency: 'INR' });
        mockBatchCommit.mockRejectedValueOnce(new Error('Firestore unavailable'));
        const mockDbLocal = {
            collection: (path) => ({
                doc: (id) => ({
                    set: mockSet,
                }),
            }),
            runTransaction: mockRunTransaction,
            batch: () => ({
                set: mockBatchSet,
                commit: mockBatchCommit
            })
        };
        await (0, vitest_1.expect)((0, index_1.verifyPaymentCore)(req, mockDbLocal, MOCK_SECRET, 'real_key', { payments: { fetch: mockFetch } })).rejects.toThrow('Failed to record payment in database.');
    });
    (0, vitest_1.it)('accepts valid, captured payment and updates firestore', async () => {
        const sig = generateSignature('order_valid', 'pay_valid');
        const req = {
            auth: { uid: 'user_good' },
            data: { planId: 'lifetime', paymentId: 'pay_valid', orderId: 'order_valid', signature: sig }
        };
        mockFetch.mockResolvedValueOnce({ status: 'captured', amount: 15000, currency: 'INR' });
        const mockDbLocal = {
            collection: (path) => ({
                doc: (id) => ({
                    set: mockSet,
                }),
            }),
            runTransaction: mockRunTransaction,
            batch: () => ({
                set: mockBatchSet,
                commit: mockBatchCommit
            })
        };
        const res = await (0, index_1.verifyPaymentCore)(req, mockDbLocal, MOCK_SECRET, 'real_key', { payments: { fetch: mockFetch } });
        (0, vitest_1.expect)(res).toEqual({
            success: true,
            membership: vitest_1.expect.objectContaining({
                isPro: true,
                planId: 'lifetime',
                amountPaid: 150,
            })
        });
        // Ensure it wrote to firestore batch
        (0, vitest_1.expect)(mockBatchSet).toHaveBeenCalledTimes(2); // One for order, one for user
    });
});
//# sourceMappingURL=index.test.js.map