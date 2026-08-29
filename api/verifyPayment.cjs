/* eslint-disable @typescript-eslint/no-var-requires */
const crypto = require('crypto');

let db = null;
let auth = null;
let initError = null;

// Lazy-init Firebase Admin — errors surface as HTTP 500, not cold-start crash
function initFirebase() {
  if (db && auth) return true;
  if (initError) return false;
  try {
    const { initializeApp, getApps, cert } = require('firebase-admin/app');
    const { getFirestore }                 = require('firebase-admin/firestore');
    const { getAuth }                      = require('firebase-admin/auth');

    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is not set');

    if (!getApps().length) {
      initializeApp({ credential: cert(JSON.parse(raw)) });
    }
    db   = getFirestore();
    auth = getAuth();
    return true;
  } catch (e) {
    initError = e.message || String(e);
    console.error('[ION] Firebase init failed:', initError);
    return false;
  }
}

// Server-controlled pricing
const PLANS = {
  monthly:  { price: 15,  currency: 'INR', name: 'Monthly Pro'  },
  annual:   { price: 99,  currency: 'INR', name: 'Annual Pro'   },
  lifetime: { price: 150, currency: 'INR', name: 'Lifetime Pro' },
};

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed.' } });
  }

  // Init Firebase lazily
  if (!initFirebase()) {
    return res.status(500).json({ error: { message: 'Server configuration error: ' + initError } });
  }

  // 1. Auth
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: { message: 'Missing or invalid Authorization header.' } });
  }

  let uid;
  try {
    const decoded = await auth.verifyIdToken(authHeader.split('Bearer ')[1]);
    uid = decoded.uid;
  } catch {
    return res.status(401).json({ error: { message: 'Invalid or expired Firebase ID token.' } });
  }

  // 2. Input validation
  const body = req.body?.data ?? req.body ?? {};
  const { planId, paymentId, orderId, signature } = body;

  if (!planId || !paymentId || !orderId || !signature) {
    return res.status(400).json({ error: { message: 'Missing required payment verification fields.' } });
  }

  const expectedPlan = PLANS[planId];
  if (!expectedPlan) {
    return res.status(400).json({ error: { message: `Invalid plan ID: ${planId}` } });
  }

  // 3. HMAC signature verification
  const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
  const KEY_ID     = process.env.RAZORPAY_KEY_ID     || '';

  const expectedSig = crypto
    .createHmac('sha256', KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  if (expectedSig !== signature) {
    console.warn(`[ION] Signature mismatch for UID ${uid}`);
    return res.status(403).json({ error: { message: 'Payment signature verification failed.' } });
  }

  // 4. Replay protection
  const orderRef = db.collection('processed_orders').doc(orderId);
  try {
    const existing = await orderRef.get();
    if (existing.exists) {
      return res.status(409).json({ error: { message: 'This order has already been processed.' } });
    }
  } catch {
    return res.status(500).json({ error: { message: 'Database error during replay check.' } });
  }

  // 5. Razorpay API verification
  if (KEY_ID && KEY_ID !== 'test_key_id') {
    try {
      const Razorpay = require('razorpay');
      const rzp      = new Razorpay({ key_id: KEY_ID, key_secret: KEY_SECRET });
      const payment  = await rzp.payments.fetch(paymentId);

      if (payment.status !== 'captured') {
        return res.status(402).json({ error: { message: `Payment not captured. Status: ${payment.status}` } });
      }

      const amountInBase = payment.amount / 100;
      if (amountInBase !== expectedPlan.price || payment.currency !== expectedPlan.currency) {
        return res.status(402).json({
          error: { message: `Amount/currency mismatch. Expected ${expectedPlan.price} ${expectedPlan.currency}, got ${amountInBase} ${payment.currency}` },
        });
      }
    } catch (err) {
      console.error('[ION] Razorpay API error:', err && err.message);
      return res.status(500).json({ error: { message: 'Failed to verify payment with Razorpay.' } });
    }
  }

  // 6. Atomic batch write
  const { FieldValue } = require('firebase-admin/firestore');
  const now = Date.now();
  const expiresAt =
    planId === 'monthly' ? now + 30  * 24 * 60 * 60 * 1000 :
    planId === 'annual'  ? now + 365 * 24 * 60 * 60 * 1000 : null;

  const membership = {
    isPro: true, planId, planName: expectedPlan.name,
    paymentId, orderId, purchasedAt: now, expiresAt,
    amountPaid: expectedPlan.price, currency: expectedPlan.currency,
    status: 'active', isTrial: false, trialDaysLeft: 0,
    updatedAt: FieldValue.serverTimestamp(),
  };

  try {
    const batch = db.batch();
    batch.set(orderRef, { uid, planId, paymentId, processedAt: FieldValue.serverTimestamp() });
    batch.set(db.collection('users').doc(uid), membership, { merge: true });
    await batch.commit();
  } catch (err) {
    console.error('[ION] Firestore batch write failed:', err);
    return res.status(500).json({ error: { message: 'Failed to record payment in database.' } });
  }

  return res.status(200).json({ result: { success: true, membership } });
};
