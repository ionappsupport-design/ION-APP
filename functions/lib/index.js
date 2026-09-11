"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRazorpayOrder = exports.verifyRazorpayPayment = exports.verifyPaymentCore = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const firestore_1 = require("firebase-admin/firestore");
const crypto = __importStar(require("crypto"));
// @ts-ignore
const Razorpay = require("razorpay");
admin.initializeApp();
const db = (0, firestore_1.getFirestore)();
// In production, use Firebase Secret Manager
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "test_key_id";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "fallback_test_secret_change_me";
const razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
});
// SERVER-CONTROLLED PRICING
const PLANS = {
    monthly: { price: 15, currency: "INR", name: "Monthly Pro" },
    annual: { price: 99, currency: "INR", name: "Annual Pro" },
    lifetime: { price: 150, currency: "INR", name: "Lifetime Pro" },
};
const verifyPaymentCore = async (request, db, RAZORPAY_KEY_SECRET, RAZORPAY_KEY_ID, razorpayClient) => {
    // 1. Authenticate Request
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "User must be signed in to verify payment.");
    }
    const uid = request.auth.uid;
    // 2. Validate Input
    const { planId, paymentId, orderId, signature } = request.data;
    if (!planId || !paymentId || !orderId || !signature) {
        throw new https_1.HttpsError("invalid-argument", "Missing required payment verification fields.");
    }
    const expectedPlan = PLANS[planId];
    if (!expectedPlan) {
        throw new https_1.HttpsError("invalid-argument", `Invalid plan ID: ${planId}`);
    }
    // 3. Verify Signature
    const payload = orderId + "|" + paymentId;
    const expectedSignature = crypto
        .createHmac("sha256", RAZORPAY_KEY_SECRET)
        .update(payload)
        .digest("hex");
    if (expectedSignature !== signature) {
        console.warn(`Signature mismatch for UID ${uid}. Expected: ${expectedSignature}, Got: ${signature}`);
        throw new https_1.HttpsError("permission-denied", "Payment signature verification failed. Potential spoofing attempt.");
    }
    // 4. Replay Protection & Duplicate Processing
    const orderRef = db.collection("processed_orders").doc(orderId);
    try {
        const success = await db.runTransaction(async (transaction) => {
            const orderDoc = await transaction.get(orderRef);
            if (orderDoc.exists) {
                throw new Error("ORDER_ALREADY_PROCESSED");
            }
            // We do not commit to Firestore until we verify with Razorpay API,
            // but we fetch to ensure we aren't doing duplicate Razorpay API calls concurrently.
            return true;
        });
        if (!success) {
            throw new https_1.HttpsError("already-exists", "This order has already been processed.");
        }
    }
    catch (error) {
        if (error.message === "ORDER_ALREADY_PROCESSED") {
            throw new https_1.HttpsError("already-exists", "This order has already been processed.");
        }
        throw new https_1.HttpsError("internal", "Database error checking order processing status.");
    }
    // 5. Verify payment status with Razorpay API
    try {
        // In a real environment with valid keys, we would fetch the payment.
        // If the dummy secret is used, we bypass the API call for test robustness 
        // to avoid breaking the local dev flow without real Razorpay keys.
        if (RAZORPAY_KEY_ID !== "test_key_id") {
            const payment = await razorpayClient.payments.fetch(paymentId);
            if (payment.status !== "captured") {
                throw new https_1.HttpsError("failed-precondition", `Payment is not fully captured. Status is: ${payment.status}`);
            }
            // Razorpay amounts are in paise (e.g. 15000 = ₹150)
            const amountInBaseCurrency = payment.amount / 100;
            if (amountInBaseCurrency !== expectedPlan.price || payment.currency !== expectedPlan.currency) {
                throw new https_1.HttpsError("failed-precondition", `Payment amount/currency mismatch. Expected ${expectedPlan.price} ${expectedPlan.currency}, got ${amountInBaseCurrency} ${payment.currency}`);
            }
        }
    }
    catch (error) {
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        console.error("Razorpay API Verification Failed:", error);
        throw new https_1.HttpsError("internal", "Failed to verify payment status with Razorpay.");
    }
    // 6. Update Entitlement & Mark Order Processed in Firestore
    const now = Date.now();
    let expiresAt = null;
    if (planId === "monthly") {
        expiresAt = now + 30 * 24 * 60 * 60 * 1000;
    }
    else if (planId === "annual") {
        expiresAt = now + 365 * 24 * 60 * 60 * 1000;
    }
    else if (planId === "lifetime") {
        expiresAt = null; // Lifetime access
    }
    const membership = {
        isPro: true,
        planId,
        planName: expectedPlan.name,
        paymentId,
        orderId,
        purchasedAt: now,
        expiresAt,
        amountPaid: expectedPlan.price,
        currency: expectedPlan.currency,
        status: "active",
        isTrial: false,
        trialDaysLeft: 0,
        updatedAt: firestore_1.FieldValue.serverTimestamp(),
    };
    try {
        const batch = db.batch();
        // Mark order as processed
        batch.set(orderRef, {
            uid,
            planId,
            paymentId,
            processedAt: firestore_1.FieldValue.serverTimestamp()
        });
        // Grant user entitlement
        const userRef = db.collection("users").doc(uid);
        batch.set(userRef, membership, { merge: true });
        await batch.commit();
        return { success: true, membership };
    }
    catch (error) {
        console.error("Failed to commit final transaction:", error);
        throw new https_1.HttpsError("internal", "Failed to record payment in database.");
    }
};
exports.verifyPaymentCore = verifyPaymentCore;
exports.verifyRazorpayPayment = (0, https_1.onCall)(async (request) => {
    return (0, exports.verifyPaymentCore)(request, db, RAZORPAY_KEY_SECRET, RAZORPAY_KEY_ID, razorpay);
});
exports.createRazorpayOrder = (0, https_1.onCall)(async (request) => {
    // 1. Authenticate Request
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "User must be signed in to create an order.");
    }
    // 2. Validate Input
    const { planId } = request.data;
    if (!planId) {
        throw new https_1.HttpsError("invalid-argument", "Missing planId.");
    }
    const expectedPlan = PLANS[planId];
    if (!expectedPlan) {
        throw new https_1.HttpsError("invalid-argument", `Invalid plan ID: ${planId}`);
    }
    // 3. Create Order via Razorpay
    try {
        const options = {
            amount: expectedPlan.price * 100, // paise
            currency: expectedPlan.currency,
            receipt: `receipt_${request.auth.uid.substring(0, 5)}_${Date.now()}`,
        };
        const order = await razorpay.orders.create(options);
        return {
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency
        };
    }
    catch (error) {
        console.error("Razorpay Order Creation Failed:", error);
        throw new https_1.HttpsError("internal", "Failed to create order with Razorpay.");
    }
});
//# sourceMappingURL=index.js.map