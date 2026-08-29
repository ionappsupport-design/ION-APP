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
exports.verifyRazorpayPayment = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const crypto = __importStar(require("crypto"));
admin.initializeApp();
const db = admin.firestore();
// Note: In production, RAZORPAY_KEY_SECRET should be stored securely using Firebase Secret Manager
// For example: const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "fallback_test_secret_change_me";
exports.verifyRazorpayPayment = functions.https.onCall(async (data, context) => {
    // 1. Authenticate Request
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be signed in to verify payment.");
    }
    const uid = context.auth.uid;
    // 2. Validate Input
    const { planId, paymentId, orderId, signature, planName, amountPaid, currency } = data;
    if (!planId || !paymentId || !orderId || !signature) {
        throw new functions.https.HttpsError("invalid-argument", "Missing required payment verification fields.");
    }
    // 3. Verify Signature
    // The expected signature is HMAC SHA256 of "orderId|paymentId" signed with the Razorpay Key Secret
    // Note: Razorpay uses "orderId|paymentId" as the payload.
    const payload = orderId + "|" + paymentId;
    const expectedSignature = crypto
        .createHmac("sha256", RAZORPAY_KEY_SECRET)
        .update(payload)
        .digest("hex");
    if (expectedSignature !== signature) {
        console.warn(`Signature mismatch for UID ${uid}. Expected: ${expectedSignature}, Got: ${signature}`);
        throw new functions.https.HttpsError("permission-denied", "Payment signature verification failed. Potential spoofing attempt.");
    }
    // 4. Update Entitlement in Firestore
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
        planName,
        paymentId,
        orderId,
        purchasedAt: now,
        expiresAt,
        amountPaid,
        currency,
        status: "active",
        isTrial: false,
        trialDaysLeft: 0,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    try {
        await db.collection("users").doc(uid).set(membership, { merge: true });
        return { success: true, membership };
    }
    catch (error) {
        console.error("Failed to update Firestore:", error);
        throw new functions.https.HttpsError("internal", "Failed to record payment in database.");
    }
});
//# sourceMappingURL=index.js.map