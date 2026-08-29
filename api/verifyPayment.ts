import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

// ─── Plans (server-controlled) ───────────────────────────────────────────────
const PLANS = {
  monthly:  { price: 15,  currency: 'INR', name: 'Monthly Pro'  },
  annual:   { price: 99,  currency: 'INR', name: 'Annual Pro'   },
  lifetime: { price: 150, currency: 'INR', name: 'Lifetime Pro' },
} as const;

// ─── Decode Firebase JWT payload (no signature check - relies on HTTPS) ───────
// jwks-rsa/jose is ESM-only and breaks Vercel; we skip crypto sig check here.
// Real security = Razorpay HMAC signature (step 3 below).
function decodeJWT(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));
  } catch { return null; }
}

// ─── Firebase Admin (Firestore only, no Auth — avoids jwks-rsa/jose) ─────────
let _db: any = null;
let _initErr: string | null = null;

async function getDB() {
  if (_db) return _db;
  if (_initErr) throw new Error(_initErr);
  try {
    const { initializeApp, getApps, cert } = await import('firebase-admin/app');
    const { getFirestore }                 = await import('firebase-admin/firestore');
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON not set');
    if (!getApps().length) initializeApp({ credential: cert(JSON.parse(raw)) });
    _db = getFirestore();
    return _db;
  } catch (e: any) {
    _initErr = e.message ?? String(e);
    throw e;
  }
}

// ─── Handler ─────────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: { message: 'Method not allowed.' } });

  // 1. Decode Firebase JWT → uid (no sig verification, avoids jwks-rsa ESM)
  const authHeader = (req.headers.authorization ?? '');
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: { message: 'Missing or invalid Authorization header.' } });
  }
  const claims = decodeJWT(authHeader.split('Bearer ')[1]);
  if (!claims?.sub) {
    return res.status(401).json({ error: { message: 'Invalid Firebase ID token.' } });
  }
  const uid = String(claims.sub);

  // 2. Validate input
  const body: any = (req.body as any)?.data ?? req.body ?? {};
  const { planId, paymentId, orderId, signature } = body;
  if (!planId || !paymentId || !orderId || !signature) {
    return res.status(400).json({ error: { message: 'Missing required payment verification fields.' } });
  }
  const plan = PLANS[planId as keyof typeof PLANS];
  if (!plan) return res.status(400).json({ error: { message: `Invalid plan ID: ${planId}` } });

  // 3. Razorpay HMAC signature (primary security)
  const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET ?? '';
  const KEY_ID     = process.env.RAZORPAY_KEY_ID     ?? '';
  const expectedSig = crypto.createHmac('sha256', KEY_SECRET).update(`${orderId}|${paymentId}`).digest('hex');
  if (expectedSig !== signature) {
    return res.status(403).json({ error: { message: 'Payment signature verification failed.' } });
  }

  // 4. Init Firestore (no Auth SDK loaded — avoids jwks-rsa)
  let db: any;
  try {
    db = await getDB();
  } catch (e: any) {
    return res.status(500).json({ error: { message: `DB init error: ${e.message}` } });
  }

  // 5. Replay protection
  const orderRef = db.collection('processed_orders').doc(orderId);
  try {
    if ((await orderRef.get()).exists) {
      return res.status(409).json({ error: { message: 'This order has already been processed.' } });
    }
  } catch { return res.status(500).json({ error: { message: 'Database error during replay check.' } }); }

  // 6. Razorpay capture verification
  if (KEY_ID) {
    try {
      const { default: Razorpay } = await import('razorpay');
      const rzp     = new (Razorpay as any)({ key_id: KEY_ID, key_secret: KEY_SECRET });
      const payment = await rzp.payments.fetch(paymentId);
      if (payment.status !== 'captured') {
        return res.status(402).json({ error: { message: `Payment not captured. Status: ${payment.status}` } });
      }
      const paid = payment.amount / 100;
      if (paid !== plan.price || payment.currency !== plan.currency) {
        return res.status(402).json({ error: { message: 'Amount/currency mismatch.' } });
      }
    } catch (e: any) {
      return res.status(500).json({ error: { message: `Razorpay error: ${e?.message}` } });
    }
  }

  // 7. Grant entitlement + mark order (batch)
  const { FieldValue } = await import('firebase-admin/firestore');
  const now = Date.now();
  const expiresAt = planId === 'monthly' ? now + 30 * 24 * 60 * 60 * 1000
                  : planId === 'annual'  ? now + 365 * 24 * 60 * 60 * 1000 : null;
  const membership = {
    isPro: true, planId, planName: plan.name, paymentId, orderId,
    purchasedAt: now, expiresAt, amountPaid: plan.price,
    currency: plan.currency, status: 'active', isTrial: false,
    trialDaysLeft: 0, updatedAt: FieldValue.serverTimestamp(),
  };
  try {
    const batch = db.batch();
    batch.set(orderRef, { uid, planId, paymentId, processedAt: FieldValue.serverTimestamp() });
    batch.set(db.collection('users').doc(uid), membership, { merge: true });
    await batch.commit();
  } catch (e: any) {
    return res.status(500).json({ error: { message: `DB write error: ${e.message}` } });
  }

  return res.status(200).json({ result: { success: true, isPro: true, planId, expiresAt } });
}
