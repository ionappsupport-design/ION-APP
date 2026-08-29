import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as crypto from 'crypto';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// ---------------------------------------------------------------------------
// Firebase Admin initialisation (runs once per cold start)
// ---------------------------------------------------------------------------
if (!getApps().length) {
  const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '{}'
  );
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();

// ---------------------------------------------------------------------------
// Server-controlled pricing (client cannot tamper with these values)
// ---------------------------------------------------------------------------
const PLANS: Record<string, { price: number; currency: string; name: string }> = {
  monthly:  { price: 15,  currency: 'INR', name: 'Monthly Pro'  },
  annual:   { price: 99,  currency: 'INR', name: 'Annual Pro'   },
  lifetime: { price: 150, currency: 'INR', name: 'Lifetime Pro' },
};

// ---------------------------------------------------------------------------
// Helper — set CORS headers
// ---------------------------------------------------------------------------
function setCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------
export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);

  // Handle pre-flight OPTIONS request (required for CORS from WebView)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed.' } });
  }

  // -------------------------------------------------------------------------
  // 1. Authenticate — verify Firebase ID token from Authorization header
  // -------------------------------------------------------------------------
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: { message: 'Missing or invalid Authorization header.' } });
  }

  const idToken = authHeader.split('Bearer ')[1];
  let uid: string;

  try {
    const decoded = await getAuth().verifyIdToken(idToken);
    uid = decoded.uid;
  } catch {
    return res.status(401).json({ error: { message: 'Invalid or expired Firebase ID token.' } });
  }

  // -------------------------------------------------------------------------
  // 2. Validate input fields
  // -------------------------------------------------------------------------
  const body = (req.body?.data ?? req.body) as {
    planId?: string;
    paymentId?: string;
    orderId?: string;
    signature?: string;
  };

  const { planId, paymentId, orderId, signature } = body;

  if (!planId || !paymentId || !orderId || !signature) {
    return res.status(400).json({ error: { message: 'Missing required payment verification fields.' } });
  }

  const expectedPlan = PLANS[planId];
  if (!expectedPlan) {
    return res.status(400).json({ error: { message: `Invalid plan ID: ${planId}` } });
  }

  // -------------------------------------------------------------------------
  // 3. Server-side HMAC signature verification
  // -------------------------------------------------------------------------
  const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
  const KEY_ID     = process.env.RAZORPAY_KEY_ID     || '';

  const payload           = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', KEY_SECRET)
    .update(payload)
    .digest('hex');

  if (expectedSignature !== signature) {
    console.warn(`[ION] Signature mismatch for UID ${uid}`);
    return res.status(403).json({ error: { message: 'Payment signature verification failed.' } });
  }

  // -------------------------------------------------------------------------
  // 4. Replay protection — orderId must not have been processed before
  // -------------------------------------------------------------------------
  const orderRef = db.collection('processed_orders').doc(orderId);

  try {
    const existing = await orderRef.get();
    if (existing.exists) {
      return res.status(409).json({ error: { message: 'This order has already been processed.' } });
    }
  } catch {
    return res.status(500).json({ error: { message: 'Database error during replay check.' } });
  }

  // -------------------------------------------------------------------------
  // 5. Verify payment status via Razorpay API
  // -------------------------------------------------------------------------
  if (KEY_ID && KEY_ID !== 'test_key_id') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Razorpay = require('razorpay');
      const rzp      = new Razorpay({ key_id: KEY_ID, key_secret: KEY_SECRET });
      const payment  = await rzp.payments.fetch(paymentId);

      if (payment.status !== 'captured') {
        return res.status(402).json({ error: { message: `Payment not captured. Status: ${payment.status}` } });
      }

      const amountInBase = payment.amount / 100;
      if (amountInBase !== expectedPlan.price || payment.currency !== expectedPlan.currency) {
        return res.status(402).json({
          error: {
            message: `Amount/currency mismatch. Expected ${expectedPlan.price} ${expectedPlan.currency}, got ${amountInBase} ${payment.currency}`,
          },
        });
      }
    } catch (err: any) {
      console.error('[ION] Razorpay API error:', err?.message);
      return res.status(500).json({ error: { message: 'Failed to verify payment with Razorpay.' } });
    }
  }

  // -------------------------------------------------------------------------
  // 6. Grant entitlement + mark order processed (atomic batch write)
  // -------------------------------------------------------------------------
  const now = Date.now();
  const expiresAt =
    planId === 'monthly' ? now + 30  * 24 * 60 * 60 * 1000 :
    planId === 'annual'  ? now + 365 * 24 * 60 * 60 * 1000 :
    null; // lifetime

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
    status: 'active',
    isTrial: false,
    trialDaysLeft: 0,
    updatedAt: FieldValue.serverTimestamp(),
  };

  try {
    const batch = db.batch();
    batch.set(orderRef, {
      uid,
      planId,
      paymentId,
      processedAt: FieldValue.serverTimestamp(),
    });
    batch.set(db.collection('users').doc(uid), membership, { merge: true });
    await batch.commit();
  } catch (err) {
    console.error('[ION] Firestore batch write failed:', err);
    return res.status(500).json({ error: { message: 'Failed to record payment in database.' } });
  }

  return res.status(200).json({ result: { success: true, membership } });
}
